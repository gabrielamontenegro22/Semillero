import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Games.css';

export default function Games() {
  const navigate = useNavigate();
  const location = useLocation();
  const area = location.state?.area || 'english';

  const juegos = {
    english: [
      { titulo: 'Unir palabras e imágenes', ruta: '/JuegoUnir', icono: '🧩' },
      { titulo: 'Arrastra y suelta', ruta: '/juego-arrastrar', icono: '✋' },
      { titulo: 'Memorama', ruta: '/JuegoEmparejar', icono: '🧠' },
    ],
    math: [
      { titulo: 'Sumas y restas', ruta: '/juego-sumas', icono: '➕' },
      { titulo: 'Figuras geométricas', ruta: '/juego-figuras', icono: '🔺' },
      { titulo: 'Fracciones divertidas', ruta: '/juego-fracciones', icono: '🍰' },
    ],
    science: [
      { titulo: 'Cuerpo humano', ruta: '/juego-cuerpo', icono: '🧍' },
      { titulo: 'Ecosistema', ruta: '/juego-ecosistema', icono: '🌳' },
      { titulo: 'Reciclaje', ruta: '/juego-reciclaje', icono: '♻️' },
    ],
    spanish: [
      { titulo: 'Sílabas y palabras', ruta: '/juego-silabas', icono: '🔤' },
      { titulo: 'Ortografía correcta', ruta: '/juego-ortografia', icono: '✏️' },
      { titulo: 'Comprensión lectora', ruta: '/juego-lectura', icono: '📖' },
    ],
  };

  const listaJuegos = juegos[area] || [];

  return (
    <div className="games-container">

      {/* 🔙 Botón de volver alineado a la izquierda */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <button className="volver-btn" onClick={() => navigate("/home")}>
        ⬅ Volver
      </button>
      </div>

      <div className="letras">

      <h2>
        {area === 'english' && '🎮 Juegos de Ingles'}
        {area === 'math' && '🧮 Juegos de Matemáticas'}
        {area === 'science' && '🔬 Juegos de Ciencias'}
        {area === 'spanish' && '📚 Juegos de Español'}
      </h2>
      </div>

      <div className="games-grid">
        {listaJuegos.map((juego, i) => (
          <div
            key={i}
            className="game-card"
            onClick={() => navigate(juego.ruta)}
          >
            <span className="game-icon">{juego.icono}</span>
            <h3>{juego.titulo}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
