import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ResultadosJuegos.css";

const UNIDADES = {
  "greetings": { label: "Greetings", icon: "👋" },
  "personal-information": { label: "Personal Information", icon: "🧑" },
  "family-members": { label: "Family Members", icon: "👨‍👩‍👧" },
  "classroom-objects": { label: "Classroom Objects", icon: "🎒" },
  "commands": { label: "Commands", icon: "📢" },
  "colors-shapes": { label: "Colors & Shapes", icon: "🎨" },
  "how-many-much": { label: "How many? / How much?", icon: "❓" },
  "numbers-0-10": { label: "Numbers 0-10", icon: "🔢" },
  "food-and-drink": { label: "Foods and Drinks", icon: "🍔" },
  "animals-pets": { label: "Animals and Pets", icon: "🐶" },
  "numbers-0-20": { label: "Numbers 0-20", icon: "🔢" },
  "body": { label: "Parts of the Body", icon: "🧑‍🦱" },
  "toys": { label: "Toys", icon: "🧸" },
  "house": { label: "Parts of the House", icon: "🏠" },
};

export default function ResultadosJuegos() {
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrado, setFiltroGrado] = useState("Todos");
  const [filtroUnidad, setFiltroUnidad] = useState("Todas");
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const cargar = async () => {
      try {
        const snap = await getDocs(query(collection(db, "resultados_juegos"), orderBy("fecha", "desc")));
        const data = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        setResultados(data);
        const gs = [...new Set(data.map(r => r.grado).filter(Boolean))].sort();
        setGrados(gs);
      } catch (e) {
        console.error("Error cargando resultados de juegos:", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const filtrados = resultados.filter(r => {
    const okGrado = filtroGrado === "Todos" || r.grado === filtroGrado;
    const okUnidad = filtroUnidad === "Todas" || r.unidad === filtroUnidad;
    return okGrado && okUnidad;
  });

  // Agrupar por unidad
  const agrupados = filtrados.reduce((acc, r) => {
    const key = r.unidad || "sin-unidad";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const getBadges = (pct) => {
    if (pct >= 90) return { cls: "badge-excelente", text: "🏆 Dominio Completo" };
    if (pct >= 70) return { cls: "badge-bueno", text: "🚀 Buen Desempeño" };
    if (pct >= 50) return { cls: "badge-regular", text: "⚠️ En Proceso" };
    return { cls: "badge-bajo", text: "🚨 Requiere Refuerzo" };
  };

  const renderEstrellas = (n) =>
    Array.from({ length: 3 }).map((_, i) => (
      <span key={i} className={i < n ? "rj-star lit" : "rj-star dim"}>⭐</span>
    ));

  return (
    <div className="rj-container" style={{ backgroundColor: '#131129', minHeight: '100vh' }}>
      <button className="rj-volver" onClick={() => navigate("/docente")}>⬅ Volver</button>

      <div className="rj-header">
        <h2 className="rj-titulo">🎮 Informe de Desempeño en Juegos</h2>
        <p className="rj-subtitulo">Supervisa analíticamente los puntajes obtenidos por tus estudiantes en las unidades interactivas.</p>
      </div>

      {/* Filtros */}
      <div className="rj-filtros">
        <div className="rj-filtro-group">
          <label>Escoger Grado:</label>
          <select value={filtroGrado} onChange={e => setFiltroGrado(e.target.value)}>
            <option>Todos</option>
            {grados.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="rj-filtro-group">
          <label>Escoger Unidad:</label>
          <select value={filtroUnidad} onChange={e => setFiltroUnidad(e.target.value)}>
            <option value="Todas">Todas las unidades</option>
            {Object.entries(UNIDADES).map(([key, { label, icon }]) => (
              <option key={key} value={key}>{icon} {label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rj-loading">
          <div className="rj-spinner"></div>
          <p>Calculando analíticas...</p>
        </div>
      ) : Object.keys(agrupados).length === 0 ? (
        <div className="rj-empty">
          <span className="rj-empty-icon">📭</span>
          <p>No se encontraron resultados para los filtros seleccionados.</p>
        </div>
      ) : (
        Object.entries(agrupados).map(([unidad, lista]) => {
          const info = UNIDADES[unidad] || { label: unidad, icon: "🎮" };
          return (
            <div key={unidad} className="rj-grupo">
              <div className="rj-grupo-header">
                <span className="rj-grupo-icon">{info.icon}</span>
                <h3 className="rj-grupo-titulo">{info.label}</h3>
                <span className="rj-grupo-count">{lista.length} registro{lista.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="rj-table-wrapper">
                <table className="rj-tabla">
                  <thead>
                    <tr>
                      <th>👩‍🎓 Estudiante</th>
                      <th>📅 Fecha</th>
                      <th>🎯 Puntaje Exacto</th>
                      <th>📶 Estado de Aprendizaje</th>
                      <th>🔍 Análisis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((r, i) => {
                      const badge = getBadges(r.porcentaje);
                      return (
                        <tr key={i}>
                          <td className="rj-td-estudiante">
                            <span className="rj-est-nombre">{r.nombre} {r.apellido}</span>
                            <span className="rj-est-grado">Grado {r.grado || "—"}</span>
                          </td>
                          <td className="rj-td-fecha">
                            {r.fecha?.seconds
                              ? new Date(r.fecha.seconds * 1000).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="rj-td-puntaje">
                            <div className="rj-score-main">
                              <span className={`rj-val ${badge.cls}`}>{r.porcentaje}%</span>
                              <span className="rj-score-frac">({r.totalScore} / {r.maxTotal} pts)</span>
                            </div>
                            <div className="rj-stars">{renderEstrellas(r.estrellas)}</div>
                          </td>
                          <td className="rj-td-estado">
                            <span className={`rj-badge ${badge.cls}`}>{badge.text}</span>
                          </td>
                          <td className="rj-td-acciones">
                            <button
                              className="rj-btn-detalle"
                              onClick={() => navigate(`/docente/resultados-juegos/${r.docId}`)}
                            >
                              Ver Boletín 📈
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
