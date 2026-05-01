import React, { useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './home.css';

const SPARKLES = [
  { top: "22%", left: "6%", delay: "0s", emoji: "✨" },
  { top: "15%", left: "90%", delay: "1s", emoji: "⭐" },
  { top: "60%", left: "4%", delay: "1.7s", emoji: "💫" },
  { top: "68%", left: "93%", delay: "0.5s", emoji: "🌟" },
  { top: "40%", left: "96%", delay: "2.2s", emoji: "✨" },
];

// ── ANIMATED SVG BACKGROUND ──────────────────────────────
function AnimatedBg() {
  return (
    <svg className="home-svg-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="55%" stopColor="#B8E4F7" />
          <stop offset="100%" stopColor="#D4F5A8" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EC850" />
          <stop offset="100%" stopColor="#5A9E35" />
        </linearGradient>
        <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.9" />
          <stop offset="17%" stopColor="#FF9F43" stopOpacity="0.9" />
          <stop offset="34%" stopColor="#FFEAA7" stopOpacity="0.9" />
          <stop offset="51%" stopColor="#55EFC4" stopOpacity="0.9" />
          <stop offset="68%" stopColor="#74B9FF" stopOpacity="0.9" />
          <stop offset="85%" stopColor="#A29BFE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FD79A8" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1440" height="900" fill="url(#skyGrad)" />

      {/* Sun */}
      <g>
        <circle cx="1280" cy="120" r="75" fill="#FFD700" opacity="0.95">
          <animate attributeName="r" values="75;82;75" dur="3s" repeatCount="indefinite" />
        </circle>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => (
          <line key={i}
            x1={1280 + 88 * Math.cos(a * Math.PI / 180)}
            y1={120 + 88 * Math.sin(a * Math.PI / 180)}
            x2={1280 + 110 * Math.cos(a * Math.PI / 180)}
            y2={120 + 110 * Math.sin(a * Math.PI / 180)}
            stroke="#FFD700" strokeWidth="6" opacity="0.8"
          >
            <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.5 + i * 0.1}s`} repeatCount="indefinite" />
          </line>
        ))}
        <circle cx="1280" cy="120" r="55" fill="#FFF176" opacity="0.5" />
      </g>

      {/* Rainbow */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <path key={i}
          d={`M ${200 - i * 18},${700} Q ${720},${180 - i * 30} ${1240 + i * 18},${700}`}
          fill="none"
          stroke={["#FF6B6B", "#FF9F43", "#FFEAA7", "#55EFC4", "#74B9FF", "#A29BFE"][i]}
          strokeWidth="28" opacity="0.75"
        />
      ))}

      {/* Clouds */}
      {/* Cloud 1 */}
      <g>
        <animate attributeName="transform" attributeType="XML" type="translate" values="0,0;15,0;0,0" dur="6s" repeatCount="indefinite" />
        <ellipse cx="220" cy="160" rx="80" ry="45" fill="white" opacity="0.95" />
        <ellipse cx="160" cy="175" rx="55" ry="38" fill="white" opacity="0.95" />
        <ellipse cx="290" cy="175" rx="60" ry="38" fill="white" opacity="0.95" />
        <ellipse cx="220" cy="180" rx="70" ry="35" fill="white" />
      </g>
      {/* Cloud 2 */}
      <g>
        <animate attributeName="transform" attributeType="XML" type="translate" values="0,0;-12,0;0,0" dur="8s" repeatCount="indefinite" />
        <ellipse cx="700" cy="110" rx="100" ry="50" fill="white" opacity="0.9" />
        <ellipse cx="620" cy="128" rx="65" ry="42" fill="white" opacity="0.9" />
        <ellipse cx="790" cy="128" rx="70" ry="42" fill="white" opacity="0.9" />
      </g>
      {/* Cloud 3 */}
      <g>
        <animate attributeName="transform" attributeType="XML" type="translate" values="0,0;10,0;0,0" dur="7s" repeatCount="indefinite" />
        <ellipse cx="1050" cy="200" rx="85" ry="44" fill="white" opacity="0.85" />
        <ellipse cx="980" cy="216" rx="58" ry="36" fill="white" opacity="0.85" />
        <ellipse cx="1130" cy="216" rx="65" ry="36" fill="white" opacity="0.85" />
      </g>

      {/* Ground */}
      <ellipse cx="720" cy="900" rx="800" ry="180" fill="url(#groundGrad)" />

      {/* Hills */}
      <ellipse cx="200" cy="820" rx="280" ry="120" fill="#6DBF45" opacity="0.8" />
      <ellipse cx="1240" cy="830" rx="310" ry="130" fill="#6DBF45" opacity="0.8" />
      <ellipse cx="720" cy="880" rx="500" ry="110" fill="#7EC850" opacity="0.9" />

      {/* Trees */}
      {[[80, 720], [140, 700], [1300, 710], [1380, 695]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 6} y={y} width="12" height="55" rx="4" fill="#8B5E3C" />
          <ellipse cx={x} cy={y - 14} rx="38" ry="48" fill="#4CAF50" />
          <ellipse cx={x - 16} cy={y + 10} rx="28" ry="36" fill="#66BB6A" />
          <ellipse cx={x + 16} cy={y + 10} rx="28" ry="36" fill="#81C784" opacity="0.7" />
        </g>
      ))}

      {/* Flowers */}
      {[[300, 798], [420, 810], [600, 802], [840, 808], [1000, 800], [1150, 795]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y - 28} width="4" height="30" rx="2" fill="#4CAF50" />
          <circle cx={x} cy={y - 30} r="12" fill={["#FF6B6B", "#FFEAA7", "#FF9F43", "#FD79A8", "#74B9FF", "#55EFC4"][i]} />
          <circle cx={x} cy={y - 30} r="5" fill="#FFD700" />
        </g>
      ))}

      {/* Butterflies */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;60,−20;120,10;60,−10;0,0" dur="8s" repeatCount="indefinite" />
        <ellipse cx="850" cy="420" rx="28" ry="18" fill="#FD79A8" opacity="0.85" transform="rotate(-25,850,420)" />
        <ellipse cx="890" cy="425" rx="28" ry="18" fill="#FF9F43" opacity="0.85" transform="rotate(25,890,425)" />
        <ellipse cx="850" cy="440" rx="18" ry="11" fill="#e84393" opacity="0.7" transform="rotate(10,850,440)" />
        <ellipse cx="890" cy="442" rx="18" ry="11" fill="#e67e22" opacity="0.7" transform="rotate(-10,890,442)" />
        <rect x="868" y="420" width="4" height="26" rx="2" fill="#2d3436" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;−50,30;−100,0;−50,20;0,0" dur="10s" repeatCount="indefinite" />
        <ellipse cx="400" cy="500" rx="22" ry="14" fill="#A29BFE" opacity="0.85" transform="rotate(-20,400,500)" />
        <ellipse cx="432" cy="504" rx="22" ry="14" fill="#74B9FF" opacity="0.85" transform="rotate(20,432,504)" />
        <ellipse cx="400" cy="516" rx="14" ry="9" fill="#6c5ce7" opacity="0.7" transform="rotate(10,400,516)" />
        <ellipse cx="432" cy="518" rx="14" ry="9" fill="#0984e3" opacity="0.7" transform="rotate(-10,432,518)" />
        <rect x="414" y="500" width="4" height="20" rx="2" fill="#2d3436" />
      </g>

      {/* Stars (daytime sparkles) */}
      {[[500, 80], [600, 50], [800, 90], [950, 60], [1100, 85]].map(([x, y], i) => (
        <text key={i} x={x} y={y} fontSize="18" textAnchor="middle" opacity="0.7">
          ✨
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
        </text>
      ))}
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div className="home-fullscreen">

      <AnimatedBg />

      {/* Sparkles */}
      {SPARKLES.map((s, i) => (
        <span key={i} className="home-sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          {s.emoji}
        </span>
      ))}

      {/* ── PERFIL FLOTANTE (fixed, fuera del flujo) ── */}
      <button
        className="perfil-button"
        onClick={() => navigate('/estudiante/perfil')}
        style={{ position: "fixed", top: 16, right: 16, zIndex: 999 }}
      >
        👤 Perfil
      </button>

      {/* ── TITLE ── */}
      <div className="home-title-area">
        <div className="home-title-icon">🎮</div>
        <h1 className="home-title">Play And Learn</h1>
        <p className="home-subtitle">¡Aprende inglés jugando! 🧠✨</p>
      </div>

      {/* ── CARDS ── */}
      <div className="card-section">
        <div className="home-card" onClick={() => navigate('/games', { state: { area: 'english' } })}>
          <div className="home-card-badge">¡JUEGA!</div>
          <img src="/assets/game.png" alt="Jugar" />
          <div className="home-card-label">
            <span className="home-card-star">⭐</span>JUGAR
          </div>
        </div>

        <div className="home-card" onClick={() => navigate('/actividades')}>
          <div className="home-card-badge">📋 TAREAS</div>
          <img src="/assets/libro.png" alt="Actividades" />
          <div className="home-card-label">
            <span className="home-card-star">⭐</span>ACTIVIDADES
          </div>
        </div>
      </div>



      {/* ── LOGOUT ── */}
      <button className="logout-button" onClick={handleLogout}>
        🚪 Cerrar Sesión
      </button>

      {/* ── MASCOT fixed esquina inferior izquierda ── */}
      <img
        src="/assets/pablo.png"
        alt="Mascota"
        className="mascota-animada"
        onClick={() => audioRef.current?.play()}
        style={{ position: "fixed", bottom: 16, left: 16, width: 110, zIndex: 999 }}
      />
      <audio ref={audioRef} src="/assets/sonido.mp3" />

    </div>
  );
}