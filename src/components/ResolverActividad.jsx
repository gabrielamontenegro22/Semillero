import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, collection } from 'firebase/firestore';
import './ResolverActividad.css';

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
    }
  };

  const handleVolver = () => {
    navigate('/actividades');
  };

  return (
    <div className="resolver-fondo">
      <div className="resolver-card">
        {/* 🔙 Botón volver */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={handleVolver}
            style={{
              backgroundColor: '#ffb703',
              color: '#fff',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '15px',
              marginLeft: '10px',
              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
            }}
          >
            ⬅️ Volver
          </button>
        </div>

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
                    <span>{op}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={manejarEnvio} className="btn-finalizar">
          🎉 Finalizar
        </button>

        {puntaje !== null && (
          <div className="resultado-card">
            <h3>
              🎯 ¡Tu puntaje es de <span>{puntaje}%</span>!
            </h3>
            <p>
              {puntaje >= 80
                ? '🌟 ¡Excelente trabajo!'
                : puntaje >= 50
                ? '💪 ¡Buen intento!'
                : '😅 Puedes volver a intentarlo.'}
            </p>

            {guardado ? (
              <p style={{ color: '#2d572c', fontWeight: 'bold' }}>
                ✅ Resultado guardado correctamente
              </p>
            ) : (
              <p style={{ color: '#555' }}>Guardando resultado...</p>
            )}

            <button className="btn-volver" onClick={handleVolver}>
              🔙 Volver a actividades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
