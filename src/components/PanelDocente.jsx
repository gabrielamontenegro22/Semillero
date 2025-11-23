import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './PanelDocente.css';

export default function PanelDocente() {
  const navigate = useNavigate();

  // 🔹 Opciones del menú docente
  const opciones = [
    { titulo: 'Mis Actividades', icono: '📝', ruta: '/docente/mis-actividades' },
    { titulo: 'Ver Progreso', icono: '📊', ruta: '/docente/progreso' },
    { titulo: 'Crear Actividades', icono: '🧠', ruta: '/docente/crear-avanzada' },
    { titulo: 'Ver Resultados', icono: '📘', ruta: '/docente/resultados' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="docente-container">
      <h1 className="docente-titulo">👩‍🏫 Panel del Docente</h1>
      <p className="docente-subtitulo">Administra tus clases y actividades</p>

      <div className="docente-grid">
        {opciones.map((op, i) => (
          <div
            key={i}
            className="docente-card"
            onClick={() => navigate(op.ruta)}
          >
            <span className="docente-icono">{op.icono}</span>
            <h3>{op.titulo}</h3>
          </div>
        ))}
      </div>

      <button className="logout-button" onClick={handleLogout}>
        🚪 Cerrar sesión
      </button>
    </div>
  );
}
