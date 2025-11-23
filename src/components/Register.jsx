import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './register.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // 🔹 Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔹 Crear documento en Firestore con rol por defecto
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        email: user.email,
        rol: 'estudiante',
      });

      alert('¡Registro exitoso!');
      navigate('/login');
    } catch (error) {
      console.error('Error de registro:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('El correo ya está registrado.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo inválido. Verifica el formato.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es muy débil (mínimo 6 caracteres).');
      } else {
        setError('No se pudo registrar. Intenta más tarde.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Regístrate en Play And Learn</h2>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="login-input"
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Registrarse
          </button>
        </form>

        <div className="login-links">
          <p>
            ¿Ya tienes cuenta?{' '}
            <span
              className="link-text"
              onClick={() => navigate('/login')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && navigate('/login')}
            >
              Inicia sesión aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
