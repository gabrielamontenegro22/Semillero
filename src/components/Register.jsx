import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './register.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  // 🔹 Datos de autenticación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 🔹 Datos del estudiante
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [grado, setGrado] = useState('');

  const [error, setError] = useState('');

  const edades = Array.from({ length: 10 }, (_, i) => i + 5); // 5 a 14
  const grados = ['1°', '2°', '3°', '4°', '5°'];

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

    try {
      // 🔹 Crear usuario en Firebase Auth
      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      // 🔹 Guardar perfil del estudiante en Firestore
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

      alert('¡Registro exitoso! 🎉');
      navigate('/login');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setError('El correo ya está registrado.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo inválido.');
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
          {/* DATOS DEL ESTUDIANTE */}
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="login-input"
            required
          />

          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="login-input"
            required
          />

          <select
            className="login-input"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            required
          >
            <option value="">Edad</option>
            {edades.map((e) => (
              <option key={e} value={e}>
                {e} años
              </option>
            ))}
          </select>

          <select
            className="login-input"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            required
          >
            <option value="">Grado</option>
            {grados.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* AUTENTICACIÓN */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="login-input"
            required
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
            >
              Inicia sesión aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
