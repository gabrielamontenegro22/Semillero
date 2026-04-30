import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef  = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rol = docSnap.data().rol;
        navigate(rol === 'docente' ? '/docente' : '/home');
      } else {
        await setDoc(doc(db, 'usuarios', user.uid), {
          uid:   user.uid,
          email: user.email,
          rol:   'estudiante',
        });
        navigate('/home');
      }
    } catch (err) {
      const codes = {
        'auth/user-not-found':  'Usuario no encontrado. ¿Quieres registrarte?',
        'auth/wrong-password':  'Contraseña incorrecta. Intenta de nuevo.',
        'auth/invalid-email':   'Correo inválido, revísalo.',
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      };
      setError(codes[err.code] || 'Error al iniciar sesión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-root">

      {/* ── Animated background blobs ── */}
      <div className="lg-bg">
        <div className="lg-blob lg-blob-1" />
        <div className="lg-blob lg-blob-2" />
        <div className="lg-blob lg-blob-3" />
        <div className="lg-stars">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="lg-star" style={{
              left:              `${(i * 37 + 11) % 100}%`,
              top:               `${(i * 53 + 7)  % 100}%`,
              animationDelay:    `${(i * 0.4) % 3}s`,
              animationDuration: `${2 + (i % 3)}s`,
              width:             `${4 + (i % 3) * 3}px`,
              height:            `${4 + (i % 3) * 3}px`,
            }} />
          ))}
        </div>
      </div>

      {/* ── Card ── */}
      <div className="lg-card">

        {/* Logo / mascot */}
        <div className="lg-mascot">
          <div className="lg-mascot-ring">
            <span className="lg-mascot-emoji">🎮</span>
          </div>
        </div>

        {/* Title */}
        <div className="lg-titles">
          <h1 className="lg-title">Play & Learn</h1>
          <p className="lg-subtitle">¡Inicia sesión para seguir aprendiendo! 🚀</p>
        </div>

        {/* Form */}
        <form className="lg-form" onSubmit={handleLogin} noValidate>

          <div className="lg-field">
            <span className="lg-field-icon">✉️</span>
            <input
              className="lg-input"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="lg-field">
            <span className="lg-field-icon">🔒</span>
            <input
              className="lg-input"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="lg-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button className="lg-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="lg-spinner" />
            ) : (
              <>Iniciar sesión <span className="lg-btn-arrow">→</span></>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="lg-links">
          <span className="lg-link" onClick={() => navigate('/register')}>
            ¿No tienes cuenta? <strong>Regístrate</strong>
          </span>
          <span className="lg-divider">·</span>
          <span className="lg-link" onClick={() => navigate('/reset')}>
            Olvidé mi contraseña
          </span>
        </div>

      </div>
    </div>
  );
}