import React from 'react';
import './LoadingScreen.css';

/**
 * Pantalla de carga reutilizable.
 *
 * Uso:
 *   <LoadingScreen />
 *   <LoadingScreen mensaje="Guardando..." />
 *   <LoadingScreen mensaje="Cargando juegos" emoji="🎮" />
 */
export default function LoadingScreen({
  mensaje = 'Cargando...',
  emoji = '🎮',
}) {
  return (
    <div className="loading-screen">
      <div className="loading-bg">
        <div className="loading-blob loading-blob-1" />
        <div className="loading-blob loading-blob-2" />
        <div className="loading-blob loading-blob-3" />
      </div>

      <div className="loading-content">
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
          <div className="loading-emoji">{emoji}</div>
        </div>
        <p className="loading-text">{mensaje}</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
