import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 👈 aquí
import { db, auth } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";
import "./EstudiantesPorGrado.css";

export default function EstudiantesPorGrado() {
  const { grado } = useParams();
  const navigate = useNavigate(); // 👈
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencia, setAsistencia] = useState({});

  const fecha = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const cargarEstudiantes = async () => {
      const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "estudiante"),
        where("grado", "==", grado)
      );

      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEstudiantes(lista);
    };

    cargarEstudiantes();
  }, [grado]);

  const marcar = async (estudiante, presente) => {
    const ref = doc(db, "asistencia", fecha, "lista", estudiante.id);

    await setDoc(ref, {
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      grado: estudiante.grado,
      presente,
      docenteId: auth.currentUser.uid,
      fecha
    });

    setAsistencia(prev => ({
      ...prev,
      [estudiante.id]: presente
    }));
  };

  return (
    <div className="lista-estudiantes">

      {/* 🔙 BOTÓN VOLVER */}
      <button className="boton-home" onClick={() => navigate("/docente/mis-estudiantes")}>
        ⬅
      </button>

      <h1>📚 Grado {grado}</h1>

      {estudiantes.map(est => (
        <div key={est.id} className="estudiante-card">
          <h3>{est.nombre} {est.apellido}</h3>

          <div className="botones-asistencia">
            <button
              className={`btn presente ${asistencia[est.id] === true ? "activo" : ""}`}
              onClick={() => marcar(est, true)}
            >
              ✔ Presente
            </button>

            <button
              className={`btn ausente ${asistencia[est.id] === false ? "activo" : ""}`}
              onClick={() => marcar(est, false)}
            >
              ✖ Ausente
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
