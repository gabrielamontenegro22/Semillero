import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 🔹 Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔹 Buscar datos del usuario en Firestore
      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // ✅ Si existe el documento, usar su rol
        const userData = docSnap.data();
        const rol = userData.rol;

        if (rol === 'docente') {
          navigate('/docente');
        } else {
          navigate('/home');
        }
      } else {
        // 🆕 Si no existe el documento, lo creamos automáticamente con rol "estudiante"
        await setDoc(doc(db, 'usuarios', user.uid), {
          uid: user.uid,
          email: user.email,
          rol: 'estudiante',
        });

        console.log('✅ Documento creado automáticamente en Firestore.');
        navigate('/home'); // Redirige como estudiante
      }
    } catch (error) {
      console.error('Firebase error:', error.code, error.message);

      if (error.code === 'auth/user-not-found') {
        setError('Usuario no encontrado. ¿Quieres registrarte?');
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta. Intenta de nuevo.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo inválido, revisa que esté bien escrito.');
      } else {
        setError('Error al iniciar sesión. Intenta más tarde.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Play and Learn</h2>
        <form onSubmit={handleLogin}>
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        <div className="extra-links">
          <span className="link" onClick={() => navigate('/register')}>
            Regístrate aquí
          </span>
          {' | '}
          <span className="link" onClick={() => navigate('/reset')}>
            Olvidé mi contraseña
          </span>
        </div>
      </div>
    </div>
  );
}
