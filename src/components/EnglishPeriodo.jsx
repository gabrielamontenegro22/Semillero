import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import englishCurriculum from '../data/englishCurriculum';
import LoadingScreen from './LoadingScreen';
import './Games.css';

const rutasPorTema = {
  // Periodo 1
  "Greetings": "/primero/ingles/greetings",
  "Personal information": "/primero/ingles/personal-information",
  "Family members": "/primero/ingles/family-members",

  // Periodo 2
  "Classroom objects": "/primero/ingles/classroom-objects",
  "Commands": "/primero/ingles/commands",
  "Colors and shapes": "/primero/ingles/colors-shapes",
  "Numbers 0–10": "/primero/ingles/numbers",
  "How many? / How much?": "/primero/ingles/how",

  // Periodo 3
  "Foods and drinks": "/primero/ingles/food",
  "Animals and pets": "/primero/ingles/animals",
  "Numbers 0–20": "/primero/ingles/numbers2",

  // Periodo 4
  "Parts of the body": "/primero/ingles/body",
  "Toys": "/primero/ingles/toys",
  "Parts of the house": "/primero/ingles/house",

};


const iconosPorTema = {
  "Greetings": "👋",
  "Personal information": "🪪",
  "Family members": "👨‍👩‍👧‍👦",
  "Classroom objects": "🎒",
  "Commands": "🗣️",
  "Colors and shapes": "🎨",
  "Demonstratives (This / That)": "👆",
  "Colors": "🎨",
  "Numbers": "🔢",
  "Animals": "🐾",
  "Food": "🍎",
  "Body parts": "🧠",
  "How many? / How much?": "❓",
  "Foods and drinks": "🍔",
  "Animals and pets": "🐶",
  "Numbers 0–20": "🔢",
  "Parts of the body": "🧑‍🦱",
  "Toys": "🧸",
  "Parts of the house": "🏠",


};

const SPARKLES = [
  { top: "12%", left: "5%", delay: "0s", emoji: "✨" },
  { top: "8%", left: "88%", delay: "1s", emoji: "⭐" },
  { top: "62%", left: "3%", delay: "1.7s", emoji: "💫" },
  { top: "68%", left: "92%", delay: "0.5s", emoji: "🌟" },
];

const GRADIENTS = [
  "linear-gradient(160deg, #74B9FF, #A29BFE, #6c5ce7)",
  "linear-gradient(160deg, #FF9F43, #FF6B6B, #e84393)",
  "linear-gradient(160deg, #55EFC4, #00b894, #00cec9)",
  "linear-gradient(160deg, #FFEAA7, #fdcb6e, #e17055)",
  "linear-gradient(160deg, #fd79a8, #e84393, #A29BFE)",
  "linear-gradient(160deg, #81ecec, #00cec9, #74B9FF)",
];

function AnimatedBg() {
  return (
    <svg className="games-svg-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ep-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="55%" stopColor="#B8E4F7" />
          <stop offset="100%" stopColor="#D4F5A8" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#ep-sky)" />
      <g>
        <circle cx="1300" cy="110" r="70" fill="#FFD700" opacity="0.95">
          <animate attributeName="r" values="70;78;70" dur="3s" repeatCount="indefinite" />
        </circle>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => (
          <line key={i}
            x1={1300 + 84 * Math.cos(a * Math.PI / 180)} y1={110 + 84 * Math.sin(a * Math.PI / 180)}
            x2={1300 + 106 * Math.cos(a * Math.PI / 180)} y2={110 + 106 * Math.sin(a * Math.PI / 180)}
            stroke="#FFD700" strokeWidth="6" opacity="0.7">
            <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5 + i * 0.1}s`} repeatCount="indefinite" />
          </line>
        ))}
        <circle cx="1300" cy="110" r="50" fill="#FFF176" opacity="0.45" />
      </g>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <path key={i} d={`M ${180 - i * 16},${720} Q ${720},${160 - i * 28} ${1260 + i * 16},${720}`}
          fill="none" stroke={["#FF6B6B", "#FF9F43", "#FFEAA7", "#55EFC4", "#74B9FF", "#A29BFE"][i]}
          strokeWidth="26" opacity="0.72" />
      ))}
      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;14,0;0,0" dur="6s" repeatCount="indefinite" />
        <ellipse cx="220" cy="155" rx="78" ry="44" fill="white" opacity="0.95" />
        <ellipse cx="158" cy="170" rx="54" ry="37" fill="white" opacity="0.95" />
        <ellipse cx="288" cy="170" rx="58" ry="37" fill="white" opacity="0.95" />
      </g>
      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;-12,0;0,0" dur="8s" repeatCount="indefinite" />
        <ellipse cx="720" cy="100" rx="98" ry="48" fill="white" opacity="0.9" />
        <ellipse cx="638" cy="118" rx="63" ry="40" fill="white" opacity="0.9" />
        <ellipse cx="806" cy="118" rx="68" ry="40" fill="white" opacity="0.9" />
      </g>
      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;10,0;0,0" dur="7s" repeatCount="indefinite" />
        <ellipse cx="1060" cy="190" rx="82" ry="42" fill="white" opacity="0.85" />
        <ellipse cx="988" cy="206" rx="56" ry="34" fill="white" opacity="0.85" />
        <ellipse cx="1140" cy="206" rx="62" ry="34" fill="white" opacity="0.85" />
      </g>
      <ellipse cx="720" cy="900" rx="820" ry="185" fill="#7EC850" />
      <ellipse cx="180" cy="820" rx="270" ry="115" fill="#6DBF45" opacity="0.8" />
      <ellipse cx="1260" cy="828" rx="300" ry="125" fill="#6DBF45" opacity="0.8" />
      {[[70, 718], [135, 700], [1310, 708], [1385, 693]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 6} y={y} width="12" height="52" rx="4" fill="#8B5E3C" />
          <ellipse cx={x} cy={y - 12} rx="36" ry="46" fill="#4CAF50" />
          <ellipse cx={x - 14} cy={y + 8} rx="26" ry="34" fill="#66BB6A" />
          <ellipse cx={x + 14} cy={y + 8} rx="26" ry="34" fill="#81C784" opacity="0.7" />
        </g>
      ))}
      {[[310, 796], [440, 808], [620, 800], [850, 806], [1010, 798], [1160, 793]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y - 26} width="4" height="28" rx="2" fill="#4CAF50" />
          <circle cx={x} cy={y - 28} r="11" fill={["#FF6B6B", "#FFEAA7", "#FF9F43", "#FD79A8", "#74B9FF", "#55EFC4"][i]} />
          <circle cx={x} cy={y - 28} r="4" fill="#FFD700" />
        </g>
      ))}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;50,-15;100,5;50,-8;0,0" dur="9s" repeatCount="indefinite" />
        <ellipse cx="860" cy="430" rx="26" ry="16" fill="#FD79A8" opacity="0.85" transform="rotate(-25,860,430)" />
        <ellipse cx="898" cy="434" rx="26" ry="16" fill="#FF9F43" opacity="0.85" transform="rotate(25,898,434)" />
        <ellipse cx="860" cy="448" rx="16" ry="10" fill="#e84393" opacity="0.7" transform="rotate(10,860,448)" />
        <ellipse cx="898" cy="450" rx="16" ry="10" fill="#e67e22" opacity="0.7" transform="rotate(-10,898,450)" />
        <rect x="877" y="430" width="4" height="24" rx="2" fill="#2d3436" />
      </g>
    </svg>
  );
}

export default function EnglishPeriodo() {
  const navigate = useNavigate();
  const { numero } = useParams();
  const [temas, setTemas] = useState([]);
  const [juegosConfig, setJuegosConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const studentSnap = await getDoc(doc(db, 'usuarios', user.uid));
        if (!studentSnap.exists()) { setLoading(false); return; }
        const grado = studentSnap.data().grado;
        setTemas(englishCurriculum[grado]?.[Number(numero)] || []);

        // 🔹 Cargar configuración de juegos (Activo/Inactivo) dictados por el docente
        const confSnap = await getDocs(collection(db, "config_juegos"));
        const configMap = {};
        confSnap.forEach(doc => {
          configMap[doc.id] = doc.data().activo;
        });
        setJuegosConfig(configMap);

      } catch (e) { console.error(e); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [numero]);

  if (loading) return <LoadingScreen mensaje="Cargando juegos..." emoji="🎮" />;

  return (
    <div className="games-container">
      <AnimatedBg />

      {SPARKLES.map((s, i) => (
        <span key={i} className="games-sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          {s.emoji}
        </span>
      ))}

      <button className="volver-btn"
        onClick={() => navigate(-1)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 9999 }}>
        ⬅ Volver
      </button>

      <div className="letras">
        <h2>📘 Inglés — Periodo {numero}</h2>
      </div>

      <div className="games-grid">
        {temas.length === 0 ? (
          <p style={{
            fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem',
            color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '16px 28px',
            borderRadius: '20px', backdropFilter: 'blur(8px)'
          }}>
            😅 No hay temas disponibles aún.
          </p>
        ) : (
          temas.map((tema, i) => {
            const temaId = tema.toLowerCase().replace(/ /g, '_');
            const isActivo = juegosConfig[temaId] !== false; // true por defecto

            const ruta = isActivo ? rutasPorTema[tema] : null;
            const icono = isActivo ? (iconosPorTema[tema] ?? '📖') : '🔒';
            const gradient = GRADIENTS[i % GRADIENTS.length];
            const disabled = !isActivo || !rutasPorTema[tema];

            return (
              <div
                key={i}
                className={`game-card${disabled ? ' game-card-disabled' : ''}`}
                style={{
                  background: gradient, opacity: disabled ? 0.55 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  animationDelay: `${i * 0.1}s, 0s, 0s`
                }}
                onClick={() => { if (ruta) navigate(ruta); }}
              >
                <span className="game-icon">{icono}</span>
                <h3 className={tema.length > 14 ? 'text-sm' : ''}>{tema}</h3>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}