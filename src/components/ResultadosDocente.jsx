import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ResultadosDocente.css";

export default function ResultadosDocente() {
  const [resultados, setResultados] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("Todas");
  const navigate = useNavigate();

  useEffect(() => {
    const cargarResultados = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // 1️⃣ Buscar actividades del docente actual
        const actividadesSnap = await getDocs(
          query(collection(db, "actividades"), where("id_docente", "==", user.uid))
        );
        const actividades = actividadesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // 2️⃣ Traer resultados asociados a esas actividades
        const resultadosSnap = await getDocs(collection(db, "resultados"));
        const resultadosData = resultadosSnap.docs
          .map((d) => d.data())
          .filter((r) => actividades.some((a) => a.id === r.id_actividad));

        setResultados(resultadosData);
      } catch (e) {
        console.error("Error al cargar resultados:", e);
      }
    };
    cargarResultados();
  }, []);

  const resultadosFiltrados =
    areaSeleccionada === "Todas"
      ? resultados
      : resultados.filter((r) => r.area === areaSeleccionada);

  // Agrupar por actividad
  const agrupados = resultadosFiltrados.reduce((acc, r) => {
    const key = `${r.area} - ${r.titulo_actividad}`;
    acc[key] = acc[key] || [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="resultados-container">
      {/* 🔙 BOTÓN VOLVER */}
      <div className="volver-wrapper">
        <button className="btn-volver" onClick={() => navigate("/docente")}>
          ⬅️ Volver
        </button>
      </div>

      <h2>📊 Resultados por asignatura</h2>

      <div className="filtros">
        <label>Filtrar por área:</label>
        <select
          value={areaSeleccionada}
          onChange={(e) => setAreaSeleccionada(e.target.value)}
        >
          <option>Todas</option>
          <option>Inglés</option>
          <option>Español</option>
          <option>Matemáticas</option>
          <option>Ciencias</option>
        </select>
      </div>

      {Object.keys(agrupados).length === 0 ? (
        <p>No hay resultados aún.</p>
      ) : (
        Object.entries(agrupados).map(([key, lista]) => (
          <div key={key} className="actividad-resultados">
            <h3
              className="actividad-enlace"
              onClick={() => {
                const idActividad = resultados.find(
                  (r) => `${r.area} - ${r.titulo_actividad}` === key
                )?.id_actividad;
                if (idActividad) navigate(`/docente/resultados/${idActividad}`);
              }}
            >
              📘 {key}
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Puntaje (%)</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((r, i) => (
                  <tr key={i}>
                    <td>{r.correo}</td>
                    <td>{r.puntaje}</td>
                    <td>{new Date(r.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
