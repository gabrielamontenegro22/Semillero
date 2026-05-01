import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { traducirErrorFirebase } from "../utils/firebaseErrors";
import EmptyState from "./EmptyState";
import "./ResultadosDocente.css";

export default function ResultadosDocente() {
  const [resultados, setResultados] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("Todas");
  const [errorCarga, setErrorCarga] = useState(null);
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

        // 2️⃣ Traer SOLO los resultados de las actividades del docente.
        //    Firestore exige que la consulta pida exactamente lo que se
        //    puede leer; por eso filtramos por id_actividad en el query
        //    en vez de en JavaScript.
        let resultadosData = [];
        const actIds = actividades.map((a) => a.id);

        if (actIds.length > 0) {
          // El operador "in" de Firestore acepta máximo 30 valores.
          // Si el docente tiene más actividades, partimos en grupos.
          const chunks = [];
          for (let i = 0; i < actIds.length; i += 30) {
            chunks.push(actIds.slice(i, i + 30));
          }

          const snaps = await Promise.all(
            chunks.map((chunk) =>
              getDocs(
                query(
                  collection(db, "resultados"),
                  where("id_actividad", "in", chunk)
                )
              )
            )
          );

          resultadosData = snaps.flatMap((snap) =>
            snap.docs.map((d) => d.data())
          );
        }

        setResultados(resultadosData);
      } catch (e) {
        console.error("Error al cargar resultados:", e);
        setErrorCarga(traducirErrorFirebase(e));
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
      {/* ── HEADER ── */}
      <div className="rj-header">
        <button className="rj-volver" onClick={() => navigate("/docente")}>
          ⬅ Volver
        </button>
        <h2 className="rj-titulo">Resultados de Actividades</h2>
      </div>

      <div className="filtros-rj">
        <label>Filtrar por área de estudio:</label>
        <select
          value={areaSeleccionada}
          onChange={(e) => setAreaSeleccionada(e.target.value)}
        >

          <option>Inglés</option>

        </select>
      </div>

      {errorCarga ? (
        <p style={{ background: '#ffe5e5', color: '#c0392b', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 'bold' }}>
          ⚠️ {errorCarga}
        </p>
      ) : Object.keys(agrupados).length === 0 ? (
        <EmptyState
          icon="📊"
          title="Aún no hay resultados"
          message="Cuando tus estudiantes resuelvan tus actividades, los resultados aparecerán aquí."
          variant="dark"
        />
      ) : (
        Object.entries(agrupados).map(([key, lista]) => (
          <div key={key} className="actividad-resultados">
            <div className="actividad-titulo-header">
              📘 {key}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Calificación Obtenida</th>
                  <th>Fecha de Prueba</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '800' }}>{r.correo}</td>
                    <td>
                      <span className="puntaje-badge">{r.puntaje}</span>
                    </td>
                    <td>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                        {new Date(r.fecha).toLocaleString()}
                      </span>
                    </td>
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
