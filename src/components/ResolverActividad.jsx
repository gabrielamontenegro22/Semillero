import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, collection } from 'firebase/firestore';
import { traducirErrorFirebase } from '../utils/firebaseErrors';
import './ResolverActividad.css';

const SPARKLES = [
  { top: "15%", left: "8%",  delay: "0s",   emoji: "✨" },
  { top: "10%", left: "85%", delay: "1s",   emoji: "⭐" },
  { top: "70%", left: "5%",  delay: "1.7s", emoji: "💫" },
  { top: "80%", left: "90%", delay: "0.5s", emoji: "🌟" },
  { top: "45%", left: "95%", delay: "2.2s", emoji: "✨" },
];

function AnimatedBg() {
  return (
    <svg className="res-svg-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#87CEEB"/>
          <stop offset="55%"  stopColor="#B8E4F7"/>
          <stop offset="100%" stopColor="#D4F5A8"/>
        </linearGradient>
        <linearGradient id="groundGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7EC850"/>
          <stop offset="100%" stopColor="#5A9E35"/>
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#skyGrad3)"/>

      <g>
        <circle cx="1280" cy="120" r="75" fill="#FFD700" opacity="0.95">
          <animate attributeName="r" values="75;82;75" dur="3s" repeatCount="indefinite"/>
        </circle>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
          <line key={i}
            x1={1280 + 88*Math.cos(a*Math.PI/180)} y1={120  + 88*Math.sin(a*Math.PI/180)}
            x2={1280 + 110*Math.cos(a*Math.PI/180)} y2={120  + 110*Math.sin(a*Math.PI/180)}
            stroke="#FFD700" strokeWidth="6" opacity="0.8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.5+i*0.1}s`} repeatCount="indefinite"/>
          </line>
        ))}
        <circle cx="1280" cy="120" r="55" fill="#FFF176" opacity="0.5"/>
      </g>

      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;15,0;0,0" dur="6s" repeatCount="indefinite"/>
        <ellipse cx="220" cy="160" rx="80" ry="45" fill="white" opacity="0.95"/>
        <ellipse cx="160" cy="175" rx="55" ry="38" fill="white" opacity="0.95"/>
        <ellipse cx="290" cy="175" rx="60" ry="38" fill="white" opacity="0.95"/>
      </g>
      <g><animate attributeName="transform" attributeType="XML" type="translate" values="0,0;-12,0;0,0" dur="8s" repeatCount="indefinite"/>
        <ellipse cx="700" cy="110" rx="100" ry="50" fill="white" opacity="0.9"/>
        <ellipse cx="620" cy="128" rx="65" ry="42" fill="white" opacity="0.9"/>
        <ellipse cx="790" cy="128" rx="70" ry="42" fill="white" opacity="0.9"/>
      </g>

      <ellipse cx="720" cy="900" rx="800" ry="180" fill="url(#groundGrad3)"/>
      <ellipse cx="200"  cy="820" rx="280" ry="120" fill="#6DBF45" opacity="0.8"/>
      <ellipse cx="1240" cy="830" rx="310" ry="130" fill="#6DBF45" opacity="0.8"/>
      <ellipse cx="720"  cy="880" rx="500" ry="110" fill="#7EC850" opacity="0.9"/>

      {[[300,798],[420,810],[600,802],[840,808],[1000,800],[1150,795]].map(([x,y],i) => (
        <g key={i}>
          <rect x={x-2} y={y-28} width="4" height="30" rx="2" fill="#4CAF50"/>
          <circle cx={x} cy={y-30} r="12" fill={["#FF6B6B","#FFEAA7","#FF9F43","#FD79A8","#74B9FF","#55EFC4"][i]}/>
          <circle cx={x} cy={y-30} r="5" fill="#FFD700"/>
        </g>
      ))}
      {[[500,80],[600,50],[800,90],[950,60],[1100,85]].map(([x,y],i) => (
        <text key={i} x={x} y={y} fontSize="18" textAnchor="middle" opacity="0.7">
          ✨<animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${1.5+i*0.4}s`} repeatCount="indefinite"/>
        </text>
      ))}
    </svg>
  );
}

export default function ResolverActividad() {
  const location = useLocation();
  const navigate = useNavigate();
  const actividad = location.state?.actividad;

  const [respuestas, setRespuestas] = useState({});
  const [puntaje, setPuntaje] = useState(null);
  const [guardado, setGuardado] = useState(false);

  if (!actividad) {
    return <p className="mensaje-error">😢 No se encontró la actividad.</p>;
  }

  const manejarCambio = (index, valor) => {
    setRespuestas((prev) => ({ ...prev, [index]: valor }));
  };

  const manejarEnvio = async () => {
    let correctas = 0;
    actividad.preguntas.forEach((p, i) => {
      if (
        respuestas[i]?.toLowerCase().trim() ===
        p.correcta?.toLowerCase().trim()
      ) {
        correctas++;
      }
    });

    const total = actividad.preguntas.length;
    const porcentaje = Math.round((correctas / total) * 100);
    setPuntaje(porcentaje);

    try {
      // 🔹 Guardar resultado en Firestore
      const user = auth.currentUser;
      if (user) {
        const resultadosRef = collection(db, 'resultados');
        await setDoc(doc(resultadosRef), {
          id_estudiante: user.uid,
          correo: user.email,
          id_actividad: actividad.id,
          titulo_actividad: actividad.titulo,
          area: actividad.area,
          puntaje: porcentaje,
          correctas,
          total,
          fecha: new Date().toISOString(),
        });
        setGuardado(true);
        console.log('✅ Resultado guardado en Firestore');
      }
    } catch (error) {
      console.error('❌ Error al guardar el resultado:', error);
      alert(
        '⚠️ No pudimos guardar tu resultado:\n\n' +
        traducirErrorFirebase(error) +
        '\n\nIntenta de nuevo o avisa a tu docente.'
      );
    }
  };

  const handleVolver = () => {
    navigate('/actividades');
  };

  return (
    <div className="resolver-fondo">
      <AnimatedBg />

      {SPARKLES.map((s, i) => (
        <span key={i} className="res-sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          {s.emoji}
        </span>
      ))}

      <button 
        onClick={handleVolver}
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 9999,
          background: 'linear-gradient(135deg, #FF6B6B, #FF9F43)',
          color: '#fff', border: '3px solid #fff', padding: '10px 22px',
          borderRadius: '50px', fontFamily: "'Fredoka One', cursive",
          fontSize: '15px', cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(255,107,107,0.5)',
        }}
      >
        ⬅️ Volver
      </button>

      <div className="resolver-card">
        <h2 className="titulo-actividad">🧩 {actividad.titulo}</h2>
        <p className="descripcion-actividad">{actividad.descripcion}</p>

        <div className="preguntas-lista">
          {actividad.preguntas?.map((p, index) => (
            <div key={index} className="pregunta-card">
              <h4 className="pregunta-texto">
                {index + 1}. {p.texto}
              </h4>

              {p.imagen && (
                <img
                  src={p.imagen}
                  alt="Pregunta ilustrada"
                  className="pregunta-imagen"
                />
              )}

              <div className="opciones">
                {p.opciones?.map((op, i) => (
                  <label key={i} className="opcion-label">
                    <input
                      type="radio"
                      name={`pregunta-${index}`}
                      value={op}
                      onChange={() => manejarCambio(index, op)}
                    />
                    {op}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={manejarEnvio} className="btn-finalizar">
          🎉 Finalizar Cuestionario
        </button>

        {puntaje !== null && (
          <div className="resultado-card">
            <h3>🎯 Tu puntaje es:</h3>
            <span>{puntaje}%</span>
            <p>
              {puntaje >= 80
                ? '🌟 ¡Excelente trabajo!'
                : puntaje >= 50
                ? '💪 ¡Buen intento!'
                : '😅 Puedes mejorar, ¡Inténtalo de nuevo!'}
            </p>

            {guardado ? (
              <p style={{ color: '#00b894', fontWeight: '900', marginTop: '10px', fontSize: '1.2rem' }}>
                ✅ Resultado guardado en el sistema
              </p>
            ) : (
              <p style={{ color: '#636e72', marginTop: '10px', fontStyle: 'italic' }}>Guardando resultado...</p>
            )}

            <button 
              onClick={handleVolver}
              style={{
                background: '#0984e3', color: 'white', border: 'none',
                padding: '12px 30px', borderRadius: '50px', fontSize: '1.2rem',
                fontFamily: "'Fredoka One', cursive", marginTop: '20px',
                cursor: 'pointer', boxShadow: '0 6px 0px #0652dd'
              }}
            >
              🔙 Volver a Actividades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
