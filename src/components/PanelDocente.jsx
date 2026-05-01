import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import toast from "react-hot-toast";
import "./PanelDocente.css";

export default function PanelDocente() {
  const navigate = useNavigate();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const opciones = [
    { titulo: "Mis Actividades", icono: "📝", ruta: "/docente/mis-actividades" },
    { titulo: "Crear Actividades", icono: "🧠", ruta: "/docente/crear-avanzada" },
    { titulo: "Gestionar Juegos", icono: "⚙️", ruta: "/docente/gestionar-juegos" },
    { titulo: "Ver Resultados (Cuestionarios)", icono: "📘", ruta: "/docente/resultados" },
    { titulo: "Resultados de Juegos", icono: "🎮", ruta: "/docente/resultados-juegos" },
  ];

  const handleLogout = async () => {
    setCerrandoSesion(true);
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar sesión. Revisa tu conexión a internet e intenta de nuevo.");
      setCerrandoSesion(false);
    }
  };

  return (
    <div className="docente-container">

      {/* 🔥 HEADER SUPERIOR */}
      <div className="docente-header">
        <h1 className="docente-titulo">👩‍🏫 Panel del Docente</h1>

        <button
          className="perfil-button"
          onClick={() => navigate("/docente/perfil")}
        >
          👤 Perfil
        </button>
      </div>

      <p className="docente-subtitulo">Administra tus clases y actividades</p>

      <div className="docente-grid">
        {opciones.map((op, i) => (
          <div
            key={i}
            className="docente-card"
            onClick={() => navigate(op.ruta)}
          >
            <span className="docente-icono">{op.icono}</span>
            <h3>{op.titulo}</h3>
          </div>
        ))}
      </div>

      <button
        className="logout-button"
        onClick={handleLogout}
        disabled={cerrandoSesion}
        style={{
          opacity: cerrandoSesion ? 0.6 : 1,
          cursor: cerrandoSesion ? "wait" : "pointer",
        }}
      >
        {cerrandoSesion ? "⏳ Cerrando sesión..." : "🚪 Cerrar sesión"}
      </button>
    </div>
  );
}
