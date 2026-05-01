import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import LoadingScreen from "./LoadingScreen";
import EmptyState from "./EmptyState";
import "./DetalleResultados.css";

export default function DetalleResultados() {
  const { id } = useParams();
  const [actividad, setActividad] = useState(null);
  const [resultados, setResultados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 🔹 Obtener la actividad específica (¡De la colección correcta "actividades"!)
        const actRef = doc(db, "actividades", id);
        const actSnap = await getDoc(actRef);
        
        if (actSnap.exists()) {
          setActividad(actSnap.data());
        } else {
          setActividad({ titulo: "Actividad no encontrada", area: "-", tipo_juego: "-" });
        }

        // 🔹 Obtener resultados asociados a esa actividad
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
    return <LoadingScreen mensaje="Cargando información..." emoji="📊" />;
  }

  return (
    <div className="detalle-container">
      {/* 🔙 Botón Volver */}
      <button className="btn-volver" onClick={() => navigate(-1)}>
        ⬅️ Volver
      </button>

      {/* 🧾 Encabezado Premium */}
      <div className="detalle-header-card">
        <h2>📘 {actividad.titulo}</h2>
        <div className="detalle-info-chips">
          <span className="chip"><strong>Área:</strong> {actividad.area}</span>
          <span className="chip"><strong>Juego:</strong> {actividad.tipo_juego}</span>
        </div>
      </div>

      <h3>🏆 Rendimiento de Alumnos</h3>

      {resultados.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Ningún estudiante ha resuelto esta actividad"
          message="Espera a que tus estudiantes la completen para ver sus resultados aquí."
          variant="dark"
        />
      ) : (
        <div className="grid-resultados">
          {resultados.map((r, i) => (
            <div className="estudiante-card" key={i}>
              <h4>{r.correo}</h4>
              
              <div
                className={`puntaje-circulo ${
                  r.puntaje >= 80 ? "excelente" : r.puntaje >= 50 ? "bueno" : "bajo"
                }`}
              >
                {r.puntaje}%
              </div>

              <div className="stats-estudiante">
                <div className="stat-item">
                  <span>Correctas</span>
                  <span>✅ {r.correctas ?? "-"}</span>
                </div>
                <div className="stat-item">
                  <span>Preguntas</span>
                  <span>📘 {r.total ?? "-"}</span>
                </div>
              </div>

              <div className="fecha-badge">
                📅 {r.fecha ? new Date(r.fecha).toLocaleDateString() : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
