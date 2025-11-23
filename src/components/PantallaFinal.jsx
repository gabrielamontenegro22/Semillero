// src/components/PantallaFinal.jsx
import React from 'react';

export default function PantallaFinal({ aciertos, total, onRestart }) {
  return (
    <div className="pantalla-final">
      <h2>🎉 ¡Muy bien!</h2>
      <p>Lograste {aciertos} de {total} emparejamientos.</p>
      <p>{'⭐'.repeat(aciertos)}</p>
      <button onClick={onRestart} className="btn-reiniciar">Volver a jugar</button>
    </div>
  );
}
