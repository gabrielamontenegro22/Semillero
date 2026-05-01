import React from 'react';
import './EmptyState.css';

/**
 * Componente reutilizable para mostrar estados vacíos bonitos.
 *
 * Uso:
 *   <EmptyState
 *     icon="📝"
 *     title="Aún no tienes actividades"
 *     message="Crea la primera para empezar"
 *     buttonText="✏️ Crear actividad"
 *     onButtonClick={() => navigate('/docente/crear')}
 *   />
 *
 * El botón es opcional — si no pasás `buttonText`, no se muestra.
 */
export default function EmptyState({
  icon = '📭',
  title = 'No hay datos',
  message = '',
  buttonText = '',
  onButtonClick = () => {},
  variant = 'dark', // 'dark' o 'light' según el fondo
}) {
  return (
    <div className={`empty-state empty-state-${variant}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-text">{message}</p>}
      {buttonText && (
        <button className="empty-state-btn" onClick={onButtonClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
}
