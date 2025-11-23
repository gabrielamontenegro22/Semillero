import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <h2>👦 Perfil del Jugador</h2>
      <p>Nombre: Juanito</p>
      <p>Edad: 7 años</p>
      <p>Nivel: Principiante</p>

      <button onClick={() => navigate(-1)} className="back-button">
        ← Volver
      </button>
    </div>
  );
}
