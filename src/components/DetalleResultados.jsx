import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./DetalleResultados.css";

export default function DetalleResultados() {
  const { id } = useParams();
  const [actividad, setActividad] = useState(null);
  const [resultados, setResultados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 🔹 Obtener la actividad específica
        const actSnap = await getDocs(
          query(collection(db, "actividades"), where("__name__", "==", id))
        );
        const actData = actSnap.docs[0]?.data();
        setActividad(actData);

        // 🔹 Obtener resultados asociados
        const resSnap = await getDocs(
          query(collection(db, "resultados"), where("id_actividad", "==", id))
        );
        const resData = resSnap.docs.map((d) => d.data());
        setResultados(resData);
      } catch (error) {
        console.error("Error cargando resultados:", error);
      }
    };

    cargarDatos();
  }, [id]);

  if (!actividad) {
    return <p>Cargando información...</p>;
  }

  return (
    <div className="detalle-container">
      {/* 🔙 Botón Volver */}
      <div className="volver-wrapper">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          ⬅️ Volver
        </button>
      </div>

      {/* 🧾 Encabezado */}
      <h2>📘 {actividad.titulo}</h2>
      <p>
        <strong>Área:</strong> {actividad.area}
      </p>
      <p>
        <strong>Tipo de juego:</strong> {actividad.tipo_juego}
      </p>

      <h3>📊 Resultados de los estudiantes</h3>

      {resultados.length === 0 ? (
        <p>No hay resultados aún.</p>
      ) : (
        <table className="tabla-detalle">
          <thead>
            <tr>
              <th>👩‍🎓 Estudiante</th>
              <th>🎯 Puntaje (%)</th>
              <th>✅ Correctas</th>
              <th>📘 Total</th>
              <th>📅 Fecha</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((r, i) => (
              <tr key={i}>
                <td>{r.correo}</td>
                <td>
                  <span
                    className={`puntaje ${
                      r.puntaje >= 80
                        ? "excelente"
                        : r.puntaje >= 50
                        ? "bueno"
                        : "bajo"
                    }`}
                  >
                    {r.puntaje}%
                  </span>
                </td>
                <td>{r.correctas ?? "-"}</td>
                <td>{r.total ?? "-"}</td>
                <td>{r.fecha ? new Date(r.fecha).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
