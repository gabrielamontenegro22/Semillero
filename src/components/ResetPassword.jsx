  import React, { useState } from 'react';
  import { sendPasswordResetEmail } from 'firebase/auth';
  import { auth } from '../firebaseConfig';
  import './ResetPassword.css';
  import { useNavigate } from 'react-router-dom';

  export default function ResetPassword() {
    const [email, setEmail]     = useState('');
    const [message, setMessage] = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
      e.preventDefault();
      setMessage('');
      setError('');
      setLoading(true);

      try {
        await sendPasswordResetEmail(auth, email);
        setMessage('Si el correo está registrado, te enviaremos un enlace 📩');
      } catch (err) {
        setError('No pudimos encontrar ese correo 😢');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="rp-root">

        {/* Background */}
        <div className="rp-bg">
          <div className="rp-blob rp-blob-1" />
          <div className="rp-blob rp-blob-2" />
          <div className="rp-blob rp-blob-3" />
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="rp-star" style={{
              left:              `${(i * 37 + 11) % 100}%`,
              top:               `${(i * 53 + 7)  % 100}%`,
              animationDelay:    `${(i * 0.4) % 3}s`,
              animationDuration: `${2 + (i % 3)}s`,
              width:             `${4 + (i % 3) * 3}px`,
              height:            `${4 + (i % 3) * 3}px`,
            }} />
          ))}
        </div>

        {/* Card */}
        <div className="rp-card">

          {/* Mascot */}
          <div className="rp-mascot">
            <div className="rp-mascot-ring">
              <span className="rp-mascot-emoji">🔑</span>
            </div>
          </div>

          {/* Title */}
          <div className="rp-titles">
            <h1 className="rp-title">¿Olvidaste tu contraseña?</h1>
            <p className="rp-subtitle">Escribe tu correo y te enviamos un enlace 📩</p>
          </div>

          {/* Form */}
          <form className="rp-form" onSubmit={handleReset} noValidate>

            <div className="rp-field">
              <span className="rp-field-icon">✉️</span>
              <input
                className="rp-input"
                type="email"
                placeholder="Tu correo registrado"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {message && (
              <div className="rp-success">
                <span>✅</span> {message}
              </div>
            )}

            {error && (
              <div className="rp-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button className="rp-btn" type="submit" disabled={loading || !!message}>
              {loading ? (
                <span className="rp-spinner" />
              ) : message ? (
              <>¡Enviado! ✓</>
            ) : (
              <>Enviar enlace <span className="rp-btn-arrow">→</span></>
            )}
          </button>

        </form>

        {/* Back link */}
        <div className="rp-links">
          <span className="rp-link" onClick={() => navigate('/login')}>
            ← Volver al <strong>inicio de sesión</strong>
          </span>
        </div>

      </div>
    </div>
  );
}