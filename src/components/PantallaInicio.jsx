// src/components/PantallaInicio.jsx
import React from 'react';

export default function PantallaInicio({ onStart }) {
  return (
    <div className="pantalla-inicio">
      <h1>🎯 ¡Empareja las Palabras!</h1>
      <p>Arrastra la palabra correcta a la imagen correspondiente.</p>
      <button onClick={onStart} className="btn-jugar">¡Jugar!</button>
    </div>
  );
}
