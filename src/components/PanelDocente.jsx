import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "./PanelDocente.css";

export default function PanelDocente() {
  const navigate = useNavigate();

  const opciones = [
    { titulo: "Mis Actividades", icono: "📝", ruta: "/docente/mis-actividades" },
{ titulo: "Mis Estudiantes", icono: "👧🧒", ruta: "/docente/mis-estudiantes" },
    { titulo: "Crear Actividades", icono: "🧠", ruta: "/docente/crear-avanzada" },
    { titulo: "Ver Resultados", icono: "📘", ruta: "/docente/resultados" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
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

      <button className="logout-button" onClick={handleLogout}>
        🚪 Cerrar sesión
      </button>
    </div>
  );
}
