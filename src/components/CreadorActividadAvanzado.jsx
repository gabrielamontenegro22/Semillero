import React, { useState, useEffect } from 'react';
import { addDoc, collection, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import toast from 'react-hot-toast';
import EmptyState from './EmptyState';
import { traducirErrorFirebase } from '../utils/firebaseErrors';
import './CreadorActividadAvanzado.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreadorActividadAvanzado() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState('');
  const [opciones, setOpciones] = useState(['']);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [area, setArea] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [fechaOriginal, setFechaOriginal] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  // Cargar actividad si estamos editando
  useEffect(() => {
    if (!id) return;

    const cargarActividad = async () => {
      try {
        const ref = doc(db, "actividades", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setTitulo(data.titulo);
          setDescripcion(data.descripcion);
          setArea(["Inglés"].includes(data.area) ? data.area : "Inglés");
          setPreguntas(data.preguntas || []);
          setFechaOriginal(data.fecha_creacion); // conservar fecha original
        }
      } catch (error) {
        console.error("Error cargando actividad:", error);
      }
    };

    cargarActividad();
  }, [id]);

  const handleAgregarOpcion = () => setOpciones([...opciones, '']);

  const handleCambioOpcion = (i, valor) => {
    const nuevas = [...opciones];
    nuevas[i] = valor;
    setOpciones(nuevas);
  };

  const handleEliminarOpcion = (index) => {
    const nuevas = [...opciones];
    nuevas.splice(index, 1);
    setOpciones(nuevas);
  };

  const handleAgregarPregunta = () => {
    // Validaciones de la pregunta antes de añadirla
    if (!preguntaActual.trim()) {
      toast.error('⚠️ Escribe el texto de la pregunta');
      return;
    }

    const opcionesLimpias = opciones.filter((o) => o.trim() !== '');
    if (opcionesLimpias.length < 2) {
      toast.error('⚠️ La pregunta debe tener al menos 2 opciones');
      return;
    }

    if (!respuestaCorrecta.trim()) {
      toast.error('⚠️ Marca la respuesta correcta');
      return;
    }

    // Verifica que la respuesta correcta sea una de las opciones
    const respuestaValida = opcionesLimpias.some(
      (op) => op.trim().toLowerCase() === respuestaCorrecta.trim().toLowerCase()
    );
    if (!respuestaValida) {
      toast.error('⚠️ La respuesta correcta debe coincidir con una de las opciones');
      return;
    }

    const nuevaPregunta = {
      texto: preguntaActual.trim(),
      opciones: opcionesLimpias,
      correcta: respuestaCorrecta.trim(),
      imagen: imagen
        ? URL.createObjectURL(imagen)
        : editIndex !== null
          ? preguntas[editIndex]?.imagen || null
          : null,
    };

    if (editIndex !== null) {
      const nuevas = [...preguntas];
      nuevas[editIndex] = nuevaPregunta;
      setPreguntas(nuevas);
      setEditIndex(null);
    } else {
      setPreguntas([...preguntas, nuevaPregunta]);
    }

    setPreguntaActual('');
    setOpciones(['']);
    setRespuestaCorrecta('');
    setImagen(null);
    toast.success(editIndex !== null ? 'Pregunta actualizada' : 'Pregunta añadida');
  };

  const handleEditarPregunta = (index) => {
    const p = preguntas[index];
    setPreguntaActual(p.texto);
    setOpciones(p.opciones);
    setRespuestaCorrecta(p.correcta);
    setEditIndex(index);
  };

  const handleEliminarPregunta = (index) => {
    if (window.confirm('¿Seguro que deseas eliminar esta pregunta?')) {
      setPreguntas(preguntas.filter((_, i) => i !== index));
      toast.success('Pregunta eliminada');
    }
  };

  const handleGuardarActividad = async () => {
    // Validaciones generales antes de guardar
    if (!area) {
      toast.error('⚠️ Selecciona un área de aprendizaje');
      return;
    }
    if (!titulo.trim()) {
      toast.error('⚠️ La actividad necesita un título');
      return;
    }
    if (!descripcion.trim()) {
      toast.error('⚠️ La actividad necesita una descripción');
      return;
    }
    if (preguntas.length === 0) {
      toast.error('⚠️ Añade al menos una pregunta antes de guardar');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Debes iniciar sesión.');
        return;
      }

      const actividad = {
        id_docente: user.uid,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo_juego: "Cuestionario",
        area,
        preguntas,
        fecha_creacion: fechaOriginal || Timestamp.now(),
        estado: "activa",
      };

      if (id) {
        await updateDoc(doc(db, "actividades", id), actividad);
        toast.success('¡Actividad actualizada!');
      } else {
        await addDoc(collection(db, "actividades"), actividad);
        toast.success('¡Actividad creada!');
      }

      // Si era una creación nueva (no edición), volvemos al panel
      if (!id) {
        setTimeout(() => navigate('/docente/mis-actividades'), 1200);
      }
    } catch (error) {
      console.error(error);
      toast.error(traducirErrorFirebase(error));
    }
  };

  return (
    <div className="crear-form-container">
      <button className="volver-btn" onClick={() => navigate("/docente")}>
        ⬅ Volver
      </button>

      <h2>{id ? "✏️ Editar Actividad Escrita" : "🧠 Crear Actividad Escrita"}</h2>

      <div className="crear-grid">

        <div className="crear-col">
          <label>Área de aprendizaje: <span className="campo-requerido">*</span></label>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="area-select">
            <option value="">Selecciona un área</option>
            <option value="Inglés">🇬🇧 Inglés</option>
          </select>

          <label>Título: <span className="campo-requerido">*</span></label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Cuestionario de Greetings"
          />

          <label>Descripción: <span className="campo-requerido">*</span></label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe brevemente de qué se trata la actividad"
            rows="3"
          ></textarea>

          <hr />

          <h3>{editIndex !== null ? "✏️ Editar pregunta" : "➕ Agregar pregunta"}</h3>

          <label>Pregunta: <span className="campo-requerido">*</span></label>
          <input
            value={preguntaActual}
            onChange={(e) => setPreguntaActual(e.target.value)}
            placeholder="¿Cómo se dice 'hola' en inglés?"
          />

          <label>Opciones: <span className="campo-requerido">*</span> <small>(mínimo 2)</small></label>
          <div className="opciones-container">
            {opciones.map((op, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  value={op}
                  onChange={(e) => handleCambioOpcion(i, e.target.value)}
                  placeholder={`Opción ${i + 1}`}
                  style={{ flex: 1 }}
                />
                {opciones.length > 1 && (
                  <button
                    onClick={() => handleEliminarOpcion(i)}
                    className="eliminar-opcion-btn"
                    title="Eliminar Opción"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleAgregarOpcion} className="agregar-btn">
            ➕ Agregar opción
          </button>

          <label>Respuesta correcta: <span className="campo-requerido">*</span></label>
          <input
            value={respuestaCorrecta}
            onChange={(e) => setRespuestaCorrecta(e.target.value)}
            placeholder="Escribe exactamente una de las opciones de arriba"
          />

          <button className="agregar-btn" onClick={handleAgregarPregunta}>
            {editIndex !== null ? "💾 Guardar cambios" : "✅ Añadir pregunta"}
          </button>

          <button className="guardar-btn" onClick={handleGuardarActividad}>
            💾 {id ? "Guardar Cambios" : "Guardar Actividad"}
          </button>
        </div>

        <div className="preguntas-panel">
          <h3>📋 Preguntas agregadas {preguntas.length > 0 && `(${preguntas.length})`}</h3>

          {preguntas.length === 0 ? (
            <p>No has agregado preguntas aún.</p>
          ) : (
            preguntas.map((p, i) => (
              <div key={i} className="pregunta-item">
                <strong>{i + 1}. {p.texto}</strong>

                <ul>
                  {p.opciones.map((op, j) => <li key={j}>{op}</li>)}
                </ul>

                <p>Correcta: {p.correcta}</p>
                {p.imagen && <img src={p.imagen} alt="pregunta" />}

                <div className="pregunta-acciones">
                  <button onClick={() => handleEditarPregunta(i)} className="editar-btn">📝 Editar</button>
                  <button onClick={() => handleEliminarPregunta(i)} className="eliminar-btn">🗑️ Eliminar</button>
                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}
