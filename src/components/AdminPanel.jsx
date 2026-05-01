import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut as signOutSecondary,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../firebaseConfig';
import { traducirErrorFirebase } from '../utils/firebaseErrors';
import toast from 'react-hot-toast';
import EmptyState from './EmptyState';
import './AdminPanel.css';

/**
 * Devuelve una instancia secundaria de Firebase Auth.
 * Se usa para crear nuevos usuarios sin afectar la sesión del admin actual.
 */
function getSecondaryAuth() {
  const apps = getApps();
  let secondaryApp = apps.find((a) => a.name === 'Secondary');
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, 'Secondary');
  }
  return getAuth(secondaryApp);
}

export default function AdminPanel() {
  const navigate = useNavigate();

  // Datos del admin
  const [adminInfo, setAdminInfo] = useState({ nombre: '', apellido: '' });

  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [materia, setMateria] = useState('Inglés');

  // Estado UI
  const [loading, setLoading] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estado de la lista y stats
  const [docentes, setDocentes] = useState([]);
  const [estudiantesCount, setEstudiantesCount] = useState(0);
  const [docentesEsteMes, setDocentesEsteMes] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [cargandoLista, setCargandoLista] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    setCargandoLista(true);
    try {
      const user = auth.currentUser;

      // 1) Datos del admin actual
      if (user) {
        const adminSnap = await getDoc(doc(db, 'usuarios', user.uid));
        if (adminSnap.exists()) {
          const data = adminSnap.data();
          setAdminInfo({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
          });
        }
      }

      // 2) Lista de docentes
      const docentesQuery = query(
        collection(db, 'usuarios'),
        where('rol', '==', 'docente')
      );
      const docentesSnap = await getDocs(docentesQuery);
      const lista = docentesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordenar por fecha de creación descendente (los más nuevos primero)
      lista.sort((a, b) => {
        const fechaA = a.createdAt?.toDate?.() || new Date(0);
        const fechaB = b.createdAt?.toDate?.() || new Date(0);
        return fechaB - fechaA;
      });
      setDocentes(lista);

      // 3) Docentes creados este mes
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const cantidadMes = lista.filter((d) => {
        if (!d.createdAt) return false;
        const fecha = d.createdAt.toDate
          ? d.createdAt.toDate()
          : new Date(d.createdAt);
        return fecha >= inicioMes;
      }).length;
      setDocentesEsteMes(cantidadMes);

      // 4) Conteo de estudiantes
      const estudiantesQuery = query(
        collection(db, 'usuarios'),
        where('rol', '==', 'estudiante')
      );
      const estudiantesSnap = await getDocs(estudiantesQuery);
      setEstudiantesCount(estudiantesSnap.size);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargandoLista(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setEmail('');
    setPassword('');
    setMateria('Inglés');
  };

  const handleCrearDocente = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password.trim()) {
      setMensaje({ tipo: 'error', texto: '⚠️ Completa todos los campos.' });
      return;
    }
    if (password.length < 6) {
      setMensaje({
        tipo: 'error',
        texto: '⚠️ La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setLoading(true);

    try {
      const secondaryAuth = getSecondaryAuth();
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        password
      );
      const newUser = userCredential.user;

      await setDoc(doc(db, 'usuarios', newUser.uid), {
        uid: newUser.uid,
        email: newUser.email,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        materia: materia,
        rol: 'docente',
        createdAt: serverTimestamp(),
      });

      await signOutSecondary(secondaryAuth);

      setMensaje({
        tipo: 'exito',
        texto: `✅ Docente ${nombre} ${apellido} creado correctamente.`,
      });
      resetForm();
      setMostrarFormulario(false);
      // Recargar la lista para mostrar el nuevo
      await cargarDatos();
    } catch (error) {
      console.error('Error creando docente:', error);
      setMensaje({
        tipo: 'error',
        texto: '❌ ' + traducirErrorFirebase(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarDocente = async (docente) => {
    const confirmado = window.confirm(
      `¿Estás segura de eliminar el perfil de ${docente.nombre} ${docente.apellido}?\n\n` +
      `Su cuenta de acceso seguirá existiendo, pero no podrá entrar a la app hasta que le crees un nuevo perfil.`
    );
    if (!confirmado) return;

    try {
      await deleteDoc(doc(db, 'usuarios', docente.id));
      setMensaje({
        tipo: 'exito',
        texto: `✅ Perfil de ${docente.nombre} eliminado.`,
      });
      await cargarDatos();
    } catch (error) {
      console.error('Error eliminando docente:', error);
      setMensaje({
        tipo: 'error',
        texto: '❌ ' + traducirErrorFirebase(error),
      });
    }
  };

  const handleLogout = async () => {
    setCerrandoSesion(true);
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      toast.error('No se pudo cerrar sesión: ' + traducirErrorFirebase(error));
      setCerrandoSesion(false);
    }
  };

  // Filtrar docentes por búsqueda
  const docentesFiltrados = docentes.filter((d) => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return true;
    return (
      (d.nombre || '').toLowerCase().includes(texto) ||
      (d.apellido || '').toLowerCase().includes(texto) ||
      (d.email || '').toLowerCase().includes(texto)
    );
  });

  // Iniciales del admin para el avatar
  const initialesAdmin = adminInfo.nombre
    ? adminInfo.nombre[0].toUpperCase()
    : 'A';

  return (
    <div className="ap-container">
      {/* Fondo animado */}
      <div className="ap-bg">
        <div className="ap-blob ap-blob-1" />
        <div className="ap-blob ap-blob-2" />
        <div className="ap-blob ap-blob-3" />
        <div className="ap-stars">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="ap-star"
              style={{
                left: `${(i * 37 + 11) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                animationDelay: `${(i * 0.4) % 4}s`,
                animationDuration: `${2 + (i % 4)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* HEADER */}
      <div className="ap-header">
        <div className="ap-header-left">
          <div className="ap-avatar">{initialesAdmin}</div>
          <div className="ap-greeting">
            <h1>👑 Panel de Administración</h1>
            <p>
              Bienvenida,{' '}
              <strong>
                {adminInfo.nombre || 'Admin'}{' '}
                {adminInfo.apellido}
              </strong>{' '}
              👋
            </p>
          </div>
        </div>
        <button
          className="ap-logout"
          onClick={handleLogout}
          disabled={cerrandoSesion}
          style={{
            opacity: cerrandoSesion ? 0.6 : 1,
            cursor: cerrandoSesion ? 'wait' : 'pointer',
          }}
        >
          {cerrandoSesion ? '⏳ Cerrando...' : '🚪 Cerrar sesión'}
        </button>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="ap-stats">
        <div className="ap-stat-card ap-stat-1">
          <div className="ap-stat-icon">👨‍🏫</div>
          <div className="ap-stat-content">
            <div className="ap-stat-value">{docentes.length}</div>
            <div className="ap-stat-label">Docentes totales</div>
          </div>
        </div>
        <div className="ap-stat-card ap-stat-2">
          <div className="ap-stat-icon">👨‍🎓</div>
          <div className="ap-stat-content">
            <div className="ap-stat-value">{estudiantesCount}</div>
            <div className="ap-stat-label">Estudiantes</div>
          </div>
        </div>
        <div className="ap-stat-card ap-stat-3">
          <div className="ap-stat-icon">📅</div>
          <div className="ap-stat-content">
            <div className="ap-stat-value">{docentesEsteMes}</div>
            <div className="ap-stat-label">Nuevos este mes</div>
          </div>
        </div>
      </div>

      {/* MENSAJE GLOBAL */}
      {mensaje.texto && (
        <div className={`ap-mensaje ap-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* BOTÓN PARA ABRIR FORMULARIO */}
      {!mostrarFormulario && (
        <button
          className="ap-btn-abrir-form"
          onClick={() => setMostrarFormulario(true)}
        >
          ➕ Crear nuevo docente
        </button>
      )}

      {/* FORMULARIO (colapsable) */}
      {mostrarFormulario && (
        <div className="ap-form-card">
          <div className="ap-form-header">
            <h2>➕ Nuevo docente</h2>
            <button
              className="ap-form-cerrar"
              onClick={() => {
                setMostrarFormulario(false);
                resetForm();
                setMensaje({ tipo: '', texto: '' });
              }}
              type="button"
              aria-label="Cerrar formulario"
            >
              ✖
            </button>
          </div>

          <form onSubmit={handleCrearDocente}>
            <div className="ap-row">
              <div className="ap-field">
                <label>👤 Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: María"
                  disabled={loading}
                />
              </div>
              <div className="ap-field">
                <label>👤 Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej: García"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="ap-field">
              <label>✉️ Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="docente@ejemplo.com"
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="ap-field">
              <label>🔐 Contraseña temporal</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                autoComplete="new-password"
              />
              <small>El docente puede cambiarla después si lo necesita.</small>
            </div>

            <div className="ap-field">
              <label>📚 Materia</label>
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                disabled={loading}
              >
                <option value="Inglés">Inglés</option>
              </select>
            </div>

            <button type="submit" className="ap-btn-submit" disabled={loading}>
              {loading ? '⏳ Creando docente...' : '✅ Crear docente'}
            </button>
          </form>
        </div>
      )}

      {/* LISTA DE DOCENTES */}
      <div className="ap-list-card">
        <div className="ap-list-header">
          <h2>👥 Docentes registrados</h2>
          <input
            type="text"
            className="ap-search"
            placeholder="🔍 Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {cargandoLista ? (
          <div className="ap-empty">⏳ Cargando docentes...</div>
        ) : docentesFiltrados.length === 0 ? (
          busqueda ? (
            <EmptyState
              icon="🔍"
              title="No se encontraron docentes"
              message={`Ningún docente coincide con "${busqueda}". Prueba con otra búsqueda.`}
              variant="dark"
            />
          ) : (
            <EmptyState
              icon="👨‍🏫"
              title="Aún no hay docentes registrados"
              message="Usa el botón de arriba para crear el primer docente de tu plataforma."
              variant="dark"
            />
          )
        ) : (
          <div className="ap-list">
            {docentesFiltrados.map((d) => (
              <div key={d.id} className="ap-list-item">
                <div className="ap-list-avatar">
                  {(d.nombre || '?')[0].toUpperCase()}
                </div>
                <div className="ap-list-info">
                  <div className="ap-list-name">
                    {d.nombre} {d.apellido}
                  </div>
                  <div className="ap-list-email">{d.email}</div>
                  <div className="ap-list-materia">📚 {d.materia || 'Inglés'}</div>
                </div>
                <button
                  className="ap-list-delete"
                  onClick={() => handleEliminarDocente(d)}
                  title="Eliminar perfil"
                  aria-label={`Eliminar a ${d.nombre} ${d.apellido}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
