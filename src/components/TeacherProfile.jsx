import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./TeacherProfile.css";

export default function TeacherProfile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const [teacher, setTeacher] = useState({
    nombre: "",
    apellido: "",
    materia: "",
    email: "",
  });

  const materias = [
    "Matemáticas",
    "Español",
    "Ciencias",
    "Inglés",
    "Historia",
    "Informática",
  ];

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("No existe perfil de docente");
        return;
      }

      const data = snap.data();

      if (data.rol !== "docente") {
        alert("Acceso no autorizado");
        navigate("/");
        return;
      }

      setTeacher({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        materia: data.materia || "",
        email: data.email || user.email,
      });
    });

    return () => unsub();
  }, [navigate]);

  const handleChange = (e) => {
    setTeacher({
      ...teacher,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "usuarios", user.uid),
      {
        ...teacher,
        rol: "docente",
      },
      { merge: true }
    );

    alert("Perfil del docente actualizado ✅");
    setEditing(false);
  };

  return (
    <div className="teacher-profile">
      <h1>Perfil del Docente 👨‍🏫</h1>

      <div className="form-grid">
        <div className="field">
          <label>Nombre</label>
          {editing ? (
            <input name="nombre" value={teacher.nombre} onChange={handleChange} />
          ) : (
            <span>{teacher.nombre}</span>
          )}
        </div>

        <div className="field">
          <label>Apellido</label>
          {editing ? (
            <input name="apellido" value={teacher.apellido} onChange={handleChange} />
          ) : (
            <span>{teacher.apellido}</span>
          )}
        </div>

        <div className="field">
          <label>Materia</label>
          {editing ? (
            <select name="materia" value={teacher.materia} onChange={handleChange}>
              {materias.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <span className="nivel">{teacher.materia}</span>
          )}
        </div>

        <div className="field">
          <label>Email</label>
          <span>{teacher.email}</span>
        </div>
      </div>

      <button className="volver-btn" onClick={() => navigate("/docente")}>
        ⬅ Volver
      </button>

      <button className="edit-btn" onClick={editing ? handleSave : () => setEditing(true)}>
        {editing ? "💾 Guardar cambios" : "✏️ Editar perfil"}
      </button>
    </div>
  );
}
