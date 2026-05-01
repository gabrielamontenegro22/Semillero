import React, { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { MEDALLAS, calcularMedallasGanadas } from '../utils/medallas';
import './Medallas.css';

/**
 * Sección de "Mis Logros" — muestra las medallas ganadas y bloqueadas
 * para el estudiante autenticado.
 */
export default function Medallas() {
  const [ganadas, setGanadas] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const result = await calcularMedallasGanadas(user.uid);
      if (!cancelado) {
        setGanadas(result);
        setLoading(false);
      }
    };
    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="medallas-container">
        <p className="medallas-loading">⏳ Cargando logros...</p>
      </div>
    );
  }

  const ganadasCount = ganadas.size;
  const totalCount = MEDALLAS.length;

  return (
    <div className="medallas-container">
      <div className="medallas-header">
        <h2>🏆 Mis Logros</h2>
        <span className="medallas-count">
          {ganadasCount} / {totalCount}
        </span>
      </div>

      {ganadasCount === totalCount && (
        <div className="medallas-completo">
          🎊 ¡Felicitaciones! Has conseguido todas las medallas. 🎊
        </div>
      )}

      <div className="medallas-grid">
        {MEDALLAS.map((m) => {
          const ganada = ganadas.has(m.id);
          return (
            <div
              key={m.id}
              className={`medalla ${ganada ? 'medalla-ganada' : 'medalla-bloqueada'}`}
              title={ganada ? m.descripcion : m.como}
            >
              <div className="medalla-icono">{ganada ? m.icono : '🔒'}</div>
              <div className="medalla-nombre">{m.nombre}</div>
              <div className="medalla-desc">
                {ganada ? m.descripcion : m.como}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
