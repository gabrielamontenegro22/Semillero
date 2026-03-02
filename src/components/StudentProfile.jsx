// StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './StudentProfile.css';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [student, setStudent] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    grado: '',
    email: '',
  });

  const edades = Array.from({ length: 10 }, (_, i) => i + 5); // 5 a 14 años
  const grados = ['1°', '2°', '3°', '4°', '5°'];

  useEffect(() => {
    const fetchStudent = async () => {
      // Listener de Firebase Auth
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          navigate('/login');
          return;
        }

        // Traemos documento del usuario
        const userDoc = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudent({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            edad: data.edad || '',
            grado: data.grado || '',
            email: data.email || '',
          });
          console.log('Datos del estudiante:', data);
        } else {
          console.log('No se encontró el usuario en Firestore.');
        }
      });

      // Limpiar listener al desmontar
      return () => unsubscribe();
    };

    fetchStudent();
  }, [navigate]);

  // Cambios en inputs/selects
  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  // Guardar cambios en Firestore
  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'usuarios', auth.currentUser.uid), student, { merge: true });
      setEditing(false);
      alert('Perfil actualizado ✅');
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el perfil ❌');
    }
  };

  if (!student) return <p>Cargando perfil...</p>;

  return (
    <div className="student-profile">
      <h1>Perfil del Estudiante 🎓</h1>

      <div className="form-grid">
        <div className="field">
          <label>Nombre</label>
          {editing ? (
            <input name="nombre" value={student.nombre} onChange={handleChange} />
          ) : (
            <span>{student.nombre}</span>
          )}
        </div>

        <div className="field">
          <label>Apellido</label>
          {editing ? (
            <input name="apellido" value={student.apellido} onChange={handleChange} />
          ) : (
            <span>{student.apellido}</span>
          )}
        </div>

        <div className="field">
          <label>Edad</label>
          {editing ? (
            <select name="edad" value={student.edad} onChange={handleChange}>
              {edades.map((edad) => (
                <option key={edad} value={edad.toString()}>
                  {edad} años
                </option>
              ))}
            </select>
          ) : (
            <span>{student.edad} años</span>
          )}
        </div>

        <div className="field">
          <label>Grado</label>
          {editing ? (
            <select name="grado" value={student.grado} onChange={handleChange}>
              {grados.map((grado) => (
                <option key={grado} value={grado}>
                  {grado}
                </option>
              ))}
            </select>
          ) : (
            <span>{student.grado}</span>
          )}
        </div>

        <div className="field">
          <label>Email</label>
          <span>{student.email}</span>
        </div>
      </div>

      <button className="volver-btn" onClick={() => navigate("/home")}>
        ⬅ Volver
      </button>

      <button className="edit-btn" onClick={editing ? handleSave : () => setEditing(true)}>
        {editing ? '💾 Guardar cambios' : '✏️ Editar perfil'}
      </button>
    </div>
  );
}
