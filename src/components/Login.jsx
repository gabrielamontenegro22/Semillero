import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import toast from 'react-hot-toast';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        const data = docSnap.data();
        const rol = data.rol;
        const nombre = data.nombre || 'de nuevo';
        toast.success(`¡Hola, ${nombre}! 👋`);
        if (rol === 'admin') {
          navigate('/admin');
        } else if (rol === 'docente') {
          navigate('/docente');
        } else {
          navigate('/home');
        }
      } else {
        // El usuario tiene credenciales válidas pero no perfil en Firestore.
        // Esto es anormal — no asumimos un rol, cerramos la sesión y avisamos.
        await signOut(auth);
        setError('Tu cuenta no tiene un perfil válido. Contacta al administrador.');
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
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
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