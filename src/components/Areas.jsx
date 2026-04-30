import { useNavigate } from 'react-router-dom';
import './Areas.css';

const SPARKLES = [
  { top: "14%", left: "5%",  delay: "0s",   emoji: "✨" },
  { top: "10%", left: "90%", delay: "1s",   emoji: "⭐" },
  { top: "65%", left: "3%",  delay: "1.7s", emoji: "💫" },
  { top: "70%", left: "93%", delay: "0.5s", emoji: "🌟" },
];

function AnimatedBg() {
  return (
    <svg className="areas-svg-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ar-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#87CEEB"/>
          <stop offset="55%"  stopColor="#B8E4F7"/>
          <stop offset="100%" stopColor="#D4F5A8"/>
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#ar-sky)"/>

      {/* Sun */}
      <g>
        <circle cx="1300" cy="110" r="70" fill="#FFD700" opacity="0.95">
          <animate attributeName="r" values="70;78;70" dur="3s" repeatCount="indefinite"/>
        </circle>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
          <line key={i}
            x1={1300+84*Math.cos(a*Math.PI/180)} y1={110+84*Math.sin(a*Math.PI/180)}
            x2={1300+106*Math.cos(a*Math.PI/180)} y2={110+106*Math.sin(a*Math.PI/180)}
            stroke="#FFD700" strokeWidth="6" opacity="0.7">
            <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5+i*0.1}s`} repeatCount="indefinite"/>
          </line>
        ))}
        <circle cx="1300" cy="110" r="50" fill="#FFF176" opacity="0.45"/>
      </g>

      {/* Rainbow */}
      {[0,1,2,3,4,5].map(i => (
        <path key={i}
          d={`M ${180-i*16},${720} Q ${720},${160-i*28} ${1260+i*16},${720}`}
          fill="none"
          stroke={["#FF6B6B","#FF9F43","#FFEAA7","#55EFC4","#74B9FF","#A29BFE"][i]}
          strokeWidth="26" opacity="0.72"/>
      ))}

      {/* Clouds */}
      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;14,0;0,0" dur="6s" repeatCount="indefinite"/>
        <ellipse cx="220" cy="155" rx="78" ry="44" fill="white" opacity="0.95"/>
        <ellipse cx="158" cy="170" rx="54" ry="37" fill="white" opacity="0.95"/>
        <ellipse cx="288" cy="170" rx="58" ry="37" fill="white" opacity="0.95"/>
      </g>
      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;-12,0;0,0" dur="8s" repeatCount="indefinite"/>
        <ellipse cx="720" cy="100" rx="98" ry="48" fill="white" opacity="0.9"/>
        <ellipse cx="638" cy="118" rx="63" ry="40" fill="white" opacity="0.9"/>
        <ellipse cx="806" cy="118" rx="68" ry="40" fill="white" opacity="0.9"/>
      </g>
      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;10,0;0,0" dur="7s" repeatCount="indefinite"/>
        <ellipse cx="1060" cy="190" rx="82" ry="42" fill="white" opacity="0.85"/>
        <ellipse cx="988"  cy="206" rx="56" ry="34" fill="white" opacity="0.85"/>
        <ellipse cx="1140" cy="206" rx="62" ry="34" fill="white" opacity="0.85"/>
      </g>

      {/* Ground + hills */}
      <ellipse cx="720" cy="900" rx="820" ry="185" fill="#7EC850"/>
      <ellipse cx="180"  cy="820" rx="270" ry="115" fill="#6DBF45" opacity="0.8"/>
      <ellipse cx="1260" cy="828" rx="300" ry="125" fill="#6DBF45" opacity="0.8"/>

      {/* Trees */}
      {[[70,718],[135,700],[1310,708],[1385,693]].map(([x,y],i) => (
        <g key={i}>
          <rect x={x-6} y={y} width="12" height="52" rx="4" fill="#8B5E3C"/>
          <ellipse cx={x} cy={y-12} rx="36" ry="46" fill="#4CAF50"/>
          <ellipse cx={x-14} cy={y+8} rx="26" ry="34" fill="#66BB6A"/>
          <ellipse cx={x+14} cy={y+8} rx="26" ry="34" fill="#81C784" opacity="0.7"/>
        </g>
      ))}

      {/* Flowers */}
      {[[310,796],[440,808],[620,800],[850,806],[1010,798],[1160,793]].map(([x,y],i) => (
        <g key={i}>
          <rect x={x-2} y={y-26} width="4" height="28" rx="2" fill="#4CAF50"/>
          <circle cx={x} cy={y-28} r="11" fill={["#FF6B6B","#FFEAA7","#FF9F43","#FD79A8","#74B9FF","#55EFC4"][i]}/>
          <circle cx={x} cy={y-28} r="4" fill="#FFD700"/>
        </g>
      ))}

      {/* Butterfly */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;50,-15;100,5;50,-8;0,0" dur="9s" repeatCount="indefinite"/>
        <ellipse cx="860" cy="430" rx="26" ry="16" fill="#FD79A8" opacity="0.85" transform="rotate(-25,860,430)"/>
        <ellipse cx="898" cy="434" rx="26" ry="16" fill="#FF9F43" opacity="0.85" transform="rotate(25,898,434)"/>
        <ellipse cx="860" cy="448" rx="16" ry="10" fill="#e84393" opacity="0.7"  transform="rotate(10,860,448)"/>
        <ellipse cx="898" cy="450" rx="16" ry="10" fill="#e67e22" opacity="0.7"  transform="rotate(-10,898,450)"/>
        <rect x="877" y="430" width="4" height="24" rx="2" fill="#2d3436"/>
      </g>
    </svg>
  );
}

const Areas = () => {
  const navigate = useNavigate();

  const areas = [
    { nombre: "Inglés",       icono: "🌍", ruta: "/games", areaKey: "english" },
    { nombre: "Matemáticas",  icono: "🧮",  ruta: "/games", areaKey: "math"    },
    { nombre: "Ciencias",     icono: "🔬",  ruta: "/games", areaKey: "science" },
    { nombre: "Español",      icono: "📚",  ruta: "/games", areaKey: "spanish" },
  ];

  return (
    <div className="areas-container">
      <AnimatedBg />

      {/* Sparkles */}
      {SPARKLES.map((s, i) => (
        <span key={i} className="areas-sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          {s.emoji}
        </span>
      ))}

      {/* Volver — completamente fijo, fuera del flujo */}
      <button
        className="volver-btn"
        onClick={() => navigate('/home')}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 9999 }}
      >
        ⬅ Volver
      </button>

      <h2>🌈 ¡Explora las áreas!</h2>

      <div className="areas-grid">
        {areas.map((a, i) => (
          <div
            key={i}
            className="area-card"
            onClick={() => navigate(a.ruta, { state: { area: a.areaKey } })}
          >
            <span className="area-icon">{a.icono}</span>
            <h3>{a.nombre}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Areas;