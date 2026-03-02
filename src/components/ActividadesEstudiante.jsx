import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ActividadesEstudiante.css';
import { useNavigate } from 'react-router-dom';

export default function ActividadesEstudiante() {
  const [actividades, setActividades] = useState([]);
  const [filtroArea, setFiltroArea] = useState('Todas');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const q = query(collection(db, 'actividades'), where('estado', '==', 'activa'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActividades(data);
      } catch (error) {
        console.error('Error al obtener actividades:', error);
      }
    };
    fetchActividades();
  }, []);

  const handleAbrirJuego = (actividad) => {
    switch (actividad.tipo_juego) {
      case 'Unir palabras':
        navigate('/juego-unir', { state: { actividad } });
        break;
      case 'Memorama':
        navigate('/juego-emparejar', { state: { actividad } });
        break;
      case 'Arrastrar y soltar':
        navigate('/juego-arrastrar', { state: { actividad } });
        break;
      case 'Sumas y restas':
        navigate('/juego-sumas', { state: { actividad } });
        break;
      case 'Cuestionario':
        navigate(`/resolver/${actividad.id}`, { state: { actividad } });
        break;
      default:
        alert('Tipo de juego no reconocido.');
    }
  };

  const handleVolver = () => {
    navigate('/home'); // 🔙 puedes cambiar a '/' si lo prefieres
  };

  const actividadesFiltradas =
    filtroArea === 'Todas'
      ? actividades
      : actividades.filter((a) => a.area === filtroArea);

  return (
    <div className="actividades-container">

      {/* 🔹 Botón de volver alineado a la izquierda */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <button className="volver-btn" onClick={() => navigate("/home")}>
        ⬅ Volver
      </button>
      </div>

      <h2>🎯 Actividades disponibles</h2>

      <div className="filtros">
        <label>Filtrar por área:</label>
        <select
          value={filtroArea}
          onChange={(e) => setFiltroArea(e.target.value)}
        >
          <option>Todas</option>
          <option>Inglés</option>
          <option>Matemáticas</option>
          <option>Ciencias</option>
          <option>Español</option>
        </select>
      </div>

      <div className="actividades-grid">
        {actividadesFiltradas.map((actividad) => (
          <div
            key={actividad.id}
            className="actividad-card"
            onClick={() => handleAbrirJuego(actividad)}
          >
            <h3>{actividad.titulo}</h3>
            <p><strong>Área:</strong> {actividad.area}</p>
            <p><strong>Juego:</strong> {actividad.tipo_juego}</p>
            <p className="descripcion">{actividad.descripcion}</p>
            <button className="jugar-btn">🎮 Jugar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
