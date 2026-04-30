import React, { useState, useEffect } from 'react';
import { addDoc, collection, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
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

  useEffect(() => {
    const lockScroll = (e) => {
      window.scrollTo(0, 0);
      e.preventDefault();
    };
    window.addEventListener('scroll', lockScroll, { passive: false });
    return () => window.removeEventListener('scroll', lockScroll);
  }, []);

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
          setArea(data.area);
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
    if (!preguntaActual.trim()) return;

    const nuevaPregunta = {
      texto: preguntaActual,
      opciones: opciones.filter((o) => o.trim() !== ''),
      correcta: respuestaCorrecta,
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
    }
  };

  const handleGuardarActividad = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMensaje("Debes iniciar sesión.");
        return;
      }

      const actividad = {
        id_docente: user.uid,
        titulo,
        descripcion,
        tipo_juego: "Cuestionario",
        area,
        preguntas,
        fecha_creacion: fechaOriginal || Timestamp.now(),
        estado: "activa",
      };

      if (id) {
        await updateDoc(doc(db, "actividades", id), actividad);
        setMensaje("✏️ Actividad actualizada con éxito");
      } else {
        await addDoc(collection(db, "actividades"), actividad);
        setMensaje("✅ Actividad creada con éxito");
      }

    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al guardar la actividad.");
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
          <label>Área de aprendizaje:</label>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="area-select">
            <option value="">Selecciona un área</option>
            <option value="Inglés">🇬🇧 Inglés</option>
            <option value="Matemáticas">🧮 Matemáticas</option>
            <option value="Ciencias">🔬 Ciencias</option>
            <option value="Español">📚 Español</option>
          </select>

          <label>Título:</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />

          <label>Descripción:</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} ></textarea>

          <hr />

          <h3>{editIndex !== null ? "✏️ Editar pregunta" : "➕ Agregar pregunta"}</h3>

          <input
            value={preguntaActual}
            onChange={(e) => setPreguntaActual(e.target.value)}
            placeholder="Pregunta..."
          />

          <label>Opciones:</label>
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

          <label>Respuesta correcta:</label>
          <input value={respuestaCorrecta} onChange={(e) => setRespuestaCorrecta(e.target.value)} />

          <label>Imagen (opcional):</label>
          <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />

          <button className="agregar-btn" onClick={handleAgregarPregunta}>
            {editIndex !== null ? "💾 Guardar cambios" : "✅ Añadir pregunta"}
          </button>

          <button className="guardar-btn" onClick={handleGuardarActividad}>
            💾 {id ? "Guardar Cambios" : "Guardar Actividad"}
          </button>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </div>

        <div className="preguntas-panel">
          <h3>📋 Preguntas agregadas</h3>

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
