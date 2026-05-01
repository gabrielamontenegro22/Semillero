import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './CrearActividad.css';
import { useNavigate } from 'react-router-dom';

export default function CrearActividad() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [area, setArea] = useState('Inglés');
  const [tipoJuego, setTipoJuego] = useState('Unir palabras');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setMensaje('Debes iniciar sesión.');
        return;
      }

      await addDoc(collection(db, 'actividades'), {
        id_docente: user.uid,
        titulo,
        descripcion,
        area,
        tipo_juego: tipoJuego,
        fecha_creacion: Timestamp.now(),
        estado: 'activa',
      });

      setMensaje('✅ Actividad creada con éxito');
      setTitulo('');
      setDescripcion('');
    } catch (error) {
      console.error('Error al crear actividad:', error);
      setMensaje('❌ Error al crear la actividad.');
    }
  };

  return (
    <div className="crear-container">
      <h2>🧩 Crear nueva actividad</h2>
      <p>Define el área, tipo de juego y detalles de la actividad.</p>

      <form className="crear-form" onSubmit={handleSubmit}>
        <label>Área:</label>
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option>Inglés</option>
        </select>

        <label>Tipo de juego:</label>
        <select value={tipoJuego} onChange={(e) => setTipoJuego(e.target.value)}>
          <option>Unir palabras</option>
          <option>Memorama</option>
          <option>Arrastrar y soltar</option>
          <option>Sumas y restas</option>
        </select>

        <label>Título de la actividad:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows="3"
          required
        ></textarea>

        <button type="submit" className="crear-btn">
          Crear Actividad
        </button>
      </form>

      {mensaje && <p className="crear-mensaje">{mensaje}</p>}

      <button className="volver-btn" onClick={() => navigate('/docente')}>
        ⬅️ Volver al Panel Docente
      </button>
    </div>
  );
}
