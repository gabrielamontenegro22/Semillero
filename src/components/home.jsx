import React, { useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './home.css';

export default function Home() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      alert('Error al cerrar sesión 😥');
    }
  };

  const playSound = () => {
    audioRef.current?.play();
  };

  return (
    <div className="home-fullscreen">

      {/* HEADER SUPERIOR */}
      <div className="home-header">
        <h1 className="home-title">🎮 Play And Learn</h1>

        <button
          className="perfil-button"
          onClick={() => navigate('/estudiante/perfil')}
        >
          👤 Perfil
        </button>
      </div>

      <p className="home-subtitle">¡Aprende inglés jugando! 🧠✨</p>

      <div className="card-section">
        <div className="home-card" onClick={() => navigate('/areas')}>
          <img src="/assets/game.png" alt="Jugar" />
          <span>Jugar</span>
        </div>

        <div className="home-card" onClick={() => navigate('/actividades')}>
          <img src="/assets/libro.png" alt="Actividades" />
          <span>Actividades</span>
        </div>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        🚪 Cerrar Sesión
      </button>

      <img
        src="/assets/pablo.png"
        alt="Mascota"
        className="mascota-animada"
        onClick={playSound}
      />

      <audio ref={audioRef} src="/assets/sonido.mp3" />
    </div>
  );
}
