import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import toast from 'react-hot-toast';
import './register.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [grado, setGrado] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const edades = Array.from({ length: 10 }, (_, i) => i + 5);
  const grados = ['1°'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre || !apellido || !edad || !grado) {
      setError('Completa todos los datos del estudiante 👀');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        email: user.email,
        nombre,
        apellido,
        edad,
        grado,
        rol: 'estudiante',
        createdAt: serverTimestamp(),
      });

      toast.success('¡Registro exitoso! 🎉');
      navigate('/login');
    } catch (err) {
      const codes = {
        'auth/email-already-in-use': 'El correo ya está registrado.',
        'auth/invalid-email': 'Correo inválido.',
        'auth/weak-password': 'Contraseña muy débil (mínimo 6 caracteres).',
      };
      setError(codes[err.code] || 'No se pudo registrar. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rg-root">

      {/* Animated background */}
      <div className="rg-bg">
        <div className="rg-blob rg-blob-1" />
        <div className="rg-blob rg-blob-2" />
        <div className="rg-blob rg-blob-3" />
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="rg-star" style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            animationDelay: `${(i * 0.4) % 3}s`,
            animationDuration: `${2 + (i % 3)}s`,
            width: `${4 + (i % 3) * 3}px`,
            height: `${4 + (i % 3) * 3}px`,
          }} />
        ))}
      </div>

      {/* Card */}
      <div className="rg-card">

        {/* Mascot */}
        <div className="rg-mascot">
          <div className="rg-mascot-ring">
            <span className="rg-mascot-emoji">🌟</span>
          </div>
        </div>

        {/* Title */}
        <div className="rg-titles">
          <h1 className="rg-title">¡Únete a Play & Learn!</h1>
          <p className="rg-subtitle">Crea tu cuenta y empieza a aprender 🚀</p>
        </div>

        {/* Form */}
        <form className="rg-form" onSubmit={handleRegister} noValidate>

          {/* Section label */}
          <div className="rg-section-label">👤 Datos del estudiante</div>

          {/* Name row */}
          <div className="rg-row">
            <div className="rg-field">
              <span className="rg-field-icon">😊</span>
              <input
                className="rg-input"
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="rg-field">
              <span className="rg-field-icon">😊</span>
              <input
                className="rg-input"
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Edad + Grado row */}
          <div className="rg-row">
            <div className="rg-field">
              <span className="rg-field-icon">🎂</span>
              <select
                className="rg-input rg-select"
                value={edad}
                onChange={e => setEdad(e.target.value)}
                required
              >
                <option value="">Edad</option>
                {edades.map(e => (
                  <option key={e} value={e}>{e} años</option>
                ))}
              </select>
            </div>
            <div className="rg-field">
              <span className="rg-field-icon">📚</span>
              <select
                className="rg-input rg-select"
                value={grado}
                onChange={e => setGrado(e.target.value)}
                required
              >
                <option value="">Grado</option>
                {grados.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section label */}
          <div className="rg-section-label">🔐 Datos de acceso</div>

          <div className="rg-field">
            <span className="rg-field-icon">✉️</span>
            <input
              className="rg-input"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="rg-field">
            <span className="rg-field-icon">🔒</span>
            <input
              className="rg-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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

          <div className="rg-field">
            <span className="rg-field-icon">🔑</span>
            <input
              className="rg-input"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <div className="rg-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button className="rg-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="rg-spinner" />
            ) : (
              <>Crear cuenta <span className="rg-btn-arrow">→</span></>
            )}
          </button>
        </form>

        {/* Link to login */}
        <div className="rg-links">
          <span className="rg-link" onClick={() => navigate('/login')}>
            ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
          </span>
        </div>

      </div>
    </div>
  );
}