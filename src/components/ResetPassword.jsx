import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
        setMessage('Si el correo está registrado, te enviaremos un enlace 📩');
    } catch (error) {
      setError('No pudimos encontrar ese correo 😢');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Restablecer Contraseña</h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Tu correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">Enviar enlace</button>
        </form>
        <div className="extra-links">
          <span className="link" onClick={() => navigate('/login')}>Volver al inicio</span>
        </div>
      </div>
    </div>
  );
}
