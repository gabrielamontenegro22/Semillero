import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MisEstudiantes.css";

export default function MisEstudiantes() {
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    const cargarGrados = async () => {
      const q = query(collection(db, "usuarios"), where("rol", "==", "estudiante"));
      const snap = await getDocs(q);

      const lista = snap.docs.map((d) => d.data().grado);
      const unicos = [...new Set(lista.filter(Boolean))];

      setGrados(unicos);
    };

    cargarGrados();
  }, []);

  return (
    <div className="mis-estudiantes">

      {/* 🔙 BOTÓN PARA VOLVER */}
      <button className="volver-btn" onClick={() => navigate("/docente")}>
        ⬅ Volver
      </button>

      <h1>📚 Mis Estudiantes</h1>

      <div className="grados-grid">
        {grados.map((g) => (
          <div
            key={g}
            className="grado-card"
            onClick={() => navigate(`/docente/grado/${g}`)}
          >
            <h2>{g}</h2>
            <p>Ver estudiantes</p>
          </div>
        ))}
      </div>
    </div>
  );
}
