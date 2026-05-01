import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import toast from 'react-hot-toast';
import EmptyState from './EmptyState';
import './ActividadesEstudiante.css';
import { useNavigate } from 'react-router-dom';

export default function ActividadesEstudiante() {
  const [actividades, setActividades] = useState([]);
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
        toast.error('Tipo de juego no reconocido.');
    }
  };

  const handleVolver = () => {
    navigate('/home'); // 🔙 puedes cambiar a '/' si lo prefieres
  };

  const actividadesFiltradas = actividades;

  // ── CONSTANTES VISUALES DE HOME ──
  const SPARKLES = [
    { top: "15%", left: "8%", delay: "0s", emoji: "✨" },
    { top: "10%", left: "85%", delay: "1s", emoji: "⭐" },
    { top: "70%", left: "5%", delay: "1.7s", emoji: "💫" },
    { top: "80%", left: "90%", delay: "0.5s", emoji: "🌟" },
    { top: "45%", left: "95%", delay: "2.2s", emoji: "✨" },
  ];

  function AnimatedBg() {
    return (
      <svg className="act-svg-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="55%" stopColor="#B8E4F7" />
            <stop offset="100%" stopColor="#D4F5A8" />
          </linearGradient>
          <linearGradient id="groundGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7EC850" />
            <stop offset="100%" stopColor="#5A9E35" />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#skyGrad2)" />

        {/* Sol */}
        <g>
          <circle cx="1280" cy="120" r="75" fill="#FFD700" opacity="0.95">
            <animate attributeName="r" values="75;82;75" dur="3s" repeatCount="indefinite" />
          </circle>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => (
            <line key={i}
              x1={1280 + 88 * Math.cos(a * Math.PI / 180)} y1={120 + 88 * Math.sin(a * Math.PI / 180)}
              x2={1280 + 110 * Math.cos(a * Math.PI / 180)} y2={120 + 110 * Math.sin(a * Math.PI / 180)}
              stroke="#FFD700" strokeWidth="6" opacity="0.8">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.5 + i * 0.1}s`} repeatCount="indefinite" />
            </line>
          ))}
          <circle cx="1280" cy="120" r="55" fill="#FFF176" opacity="0.5" />
        </g>

        {/* Nubes */}
        <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;15,0;0,0" dur="6s" repeatCount="indefinite" />
          <ellipse cx="220" cy="160" rx="80" ry="45" fill="white" opacity="0.95" />
          <ellipse cx="160" cy="175" rx="55" ry="38" fill="white" opacity="0.95" />
          <ellipse cx="290" cy="175" rx="60" ry="38" fill="white" opacity="0.95" />
        </g>
        <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;-12,0;0,0" dur="8s" repeatCount="indefinite" />
          <ellipse cx="700" cy="110" rx="100" ry="50" fill="white" opacity="0.9" />
          <ellipse cx="620" cy="128" rx="65" ry="42" fill="white" opacity="0.9" />
          <ellipse cx="790" cy="128" rx="70" ry="42" fill="white" opacity="0.9" />
        </g>
        <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;10,0;0,0" dur="7s" repeatCount="indefinite" />
          <ellipse cx="1050" cy="200" rx="85" ry="44" fill="white" opacity="0.85" />
          <ellipse cx="980" cy="216" rx="58" ry="36" fill="white" opacity="0.85" />
          <ellipse cx="1130" cy="216" rx="65" ry="36" fill="white" opacity="0.85" />
        </g>

        {/* Suelo y Montañas */}
        <ellipse cx="720" cy="900" rx="800" ry="180" fill="url(#groundGrad2)" />
        <ellipse cx="200" cy="820" rx="280" ry="120" fill="#6DBF45" opacity="0.8" />
        <ellipse cx="1240" cy="830" rx="310" ry="130" fill="#6DBF45" opacity="0.8" />
        <ellipse cx="720" cy="880" rx="500" ry="110" fill="#7EC850" opacity="0.9" />

        {/* Flores */}
        {[[300, 798], [420, 810], [600, 802], [840, 808], [1000, 800], [1150, 795]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 2} y={y - 28} width="4" height="30" rx="2" fill="#4CAF50" />
            <circle cx={x} cy={y - 30} r="12" fill={["#FF6B6B", "#FFEAA7", "#FF9F43", "#FD79A8", "#74B9FF", "#55EFC4"][i]} />
            <circle cx={x} cy={y - 30} r="5" fill="#FFD700" />
          </g>
        ))}

        {/* Estrellas diurnas */}
        {[[500, 80], [600, 50], [800, 90], [950, 60], [1100, 85]].map(([x, y], i) => (
          <text key={i} x={x} y={y} fontSize="18" textAnchor="middle" opacity="0.7">
            ✨
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
          </text>
        ))}
      </svg>
    );
  }

  // ── FUNCIÓN PARA DETERMINAR TEMA DE COLOR DE TARJETA ──
  const getThemeByArea = (area) => {
    switch (area) {
      case 'Inglés': return 'theme-ingles'
      default: return '';
    }
  };

  return (
    <div className="act-fullscreen">

      <AnimatedBg />

      {/* Partículas Brillantes */}
      {SPARKLES.map((s, i) => (
        <span key={i} className="act-sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          {s.emoji}
        </span>
      ))}

      {/* Botón Flotante Volver */}
      <button
        className="act-back-btn"
        onClick={handleVolver}
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 9999 }}
      >
        ⬅ Volver
      </button>

      {/* Título Estilo Arcoiris */}
      <h1 className="act-title">🎯 Actividades</h1>

      {/* Grilla 3D de Actividades */}
      <div className="actividades-grid">
        {actividadesFiltradas.length === 0 ? (
          <div style={{ gridColumn: "1/-1" }}>
            <EmptyState
              icon="📚"
              title="Aún no hay actividades disponibles"
              message="Tu docente aún no ha publicado actividades. ¡Vuelve más tarde!"
              variant="dark"
            />
          </div>
        ) : (
          actividadesFiltradas.map((actividad, idx) => (
            <div
              key={actividad.id}
              className={`actividad-card ${getThemeByArea(actividad.area)}`}
              onClick={() => handleAbrirJuego(actividad)}
            >
              <h3 className="act-card-title">{actividad.titulo}</h3>

              <div className="act-card-info">
                <span className="tag">{actividad.area}</span>
              </div>

              <div className="act-card-info">
                Juego: <strong style={{ color: "#00b894" }}>{actividad.tipo_juego}</strong>
              </div>

              <p className="act-card-desc">{actividad.descripcion}</p>

              <button className="btn-jugar">
                🎮 ¡JUGAR AHORA!
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
