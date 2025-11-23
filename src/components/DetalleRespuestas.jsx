import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import "./ResultadosDocente.css";

export default function ResultadosDocente() {
  const { id } = useParams(); // ID de la actividad
  const [resultados, setResultados] = useState([]);
  const [actividad, setActividad] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 🔹 Obtener la actividad
        const actSnap = await getDocs(
          query(collection(db, "actividades"), where("__name__", "==", id))
        );
        const actData = actSnap.docs[0]?.data();
        setActividad(actData);

        // 🔹 Obtener todos los resultados de esa actividad
        const resSnap = await getDocs(
          query(collection(db, "resultados"), where("id_actividad", "==", id))
        );

        const data = resSnap.docs.map((doc) => doc.data());
        setResultados(data);
      } catch (error) {
        console.error("Error cargando resultados:", error);
      }
    };

    cargarDatos();
  }, [id]);

  return (
    <div className="resultados-container">
      <button className="btn-volver" onClick={() => navigate(-1)}>
        ⬅️ Volver
      </button>

      {actividad ? (
        <>
          <h2>📘 {actividad.titulo}</h2>
          <p>
            <strong>Área:</strong> {actividad.area}
          </p>

          <div className="tabla-resultados">
            <table>
              <thead>
                <tr>
                  <th>👩‍🎓 Estudiante</th>
                  <th>🎯 Puntaje</th>
                  <th>🕒 Fecha</th>
                </tr>
              </thead>
              <tbody>
                {resultados.length > 0 ? (
                  resultados.map((r, index) => (
                    <tr key={index}>
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
                      <td>
                        {r.fecha
                          ? new Date(r.fecha).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No hay resultados aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Cargando información...</p>
      )}
    </div>
  );
}
