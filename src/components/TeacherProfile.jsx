import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { traducirErrorFirebase } from "../utils/firebaseErrors";
import "./TeacherProfile.css";

const SPARKLES = [
  { top: "15%", left: "10%", delay: "0s",   emoji: "✨" },
  { top: "12%", left: "85%", delay: "1.2s", emoji: "⭐" },
  { top: "65%", left: "8%",  delay: "0.8s", emoji: "✨" },
  { top: "72%", left: "90%", delay: "1.5s", emoji: "⭐" },
];

function AnimatedAdminBg() {
  return (
    <svg className="tp-svg-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      {/* Background Gradient */}
      <defs>
        <linearGradient id="tp-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0f0c29"/>
          <stop offset="50%"  stopColor="#302b63"/>
          <stop offset="100%" stopColor="#24243e"/>
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#tp-dark)"/>

      {/* Grid Lines */}
      <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
        {[...Array(20)].map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 50} x2="1440" y2={i * 50} />
        ))}
        {[...Array(30)].map((_, i) => (
          <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="900" />
        ))}
      </g>

      {/* Floating Geometric Shapes */}
      <g opacity="0.4">
        <animateTransform attributeName="transform" type="translate" values="0,0; -20,-30; 0,0" dur="10s" repeatCount="indefinite"/>
        <circle cx="150" cy="200" r="60" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="10 10"/>
        <rect x="1200" y="150" width="80" height="80" fill="none" stroke="#a78bfa" strokeWidth="3" transform="rotate(45 1240 190)"/>
        <polygon points="250,750 300,850 200,850" fill="none" stroke="#6d28d9" strokeWidth="3"/>
        <circle cx="1300" cy="800" r="40" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="5 5"/>
      </g>
      
      <g opacity="0.3">
        <animateTransform attributeName="transform" type="translate" values="0,0; 30,20; 0,0" dur="15s" repeatCount="indefinite"/>
        <circle cx="600" cy="100" r="120" fill="none" stroke="#8b5cf6" strokeWidth="1" />
        <circle cx="850" cy="850" r="150" fill="none" stroke="#a78bfa" strokeWidth="1" />
        <rect x="700" y="400" width="200" height="200" fill="none" stroke="#302b63" strokeWidth="2" transform="rotate(15 800 500)"/>
      </g>

      {/* Glowing Orbs */}
      <circle cx="200" cy="800" r="150" fill="#6d28d9" filter="blur(80px)" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="1200" cy="200" r="200" fill="#a78bfa" filter="blur(100px)" opacity="0.2">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="7s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export default function TeacherProfile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const [teacher, setTeacher] = useState({
    nombre: "",
    apellido: "",
    materia: "",
    email: "",
  });

  const materias = [
    "Matemáticas",
    "Español",
    "Ciencias",
    "Inglés",
    "Historia",
    "Informática",
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("No existe perfil de docente");
        return;
      }

      const data = snap.data();

      if (data.rol !== "docente") {
        alert("Acceso no autorizado");
        navigate("/");
        return;
      }

      setTeacher({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        materia: data.materia || "",
        email: data.email || user.email,
      });
    });

    return () => unsub();
  }, [navigate]);

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(
        doc(db, "usuarios", user.uid),
        {
          ...teacher,
          rol: "docente",
        },
        { merge: true }
      );
      alert("¡Perfil del docente actualizado! ✅");
      setEditing(false);
    } catch (error) {
      console.error("Error al actualizar perfil docente:", error);
      alert("❌ " + traducirErrorFirebase(error));
    }
  };

  const initials = teacher.nombre ? teacher.nombre[0].toUpperCase() : "D";
  const fullName = [teacher.nombre, teacher.apellido].filter(Boolean).join(" ") || "Perfil Docente";

  return (
    <div className="teacher-profile">
      <AnimatedAdminBg />

      {/* Sparkles flotantes */}
      {SPARKLES.map((s, i) => (
        <span key={i} className="tp-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay, fontSize: 24 }}>
          {s.emoji}
        </span>
      ))}

      {/* Botón Volver */}
      <button className="tp-volver-btn" onClick={() => navigate("/docente")}>
        ⬅ Volver al Panel
      </button>

      {/* Avatar Principal */}
      <div className="tp-avatar-wrap">
        <div className="tp-avatar">{initials}</div>
        <div className="tp-avatar-name">{fullName}</div>
        {teacher.materia && <div className="tp-avatar-role">📚 Docente de {teacher.materia}</div>}
      </div>

      <h2 className="tp-title">Control de Perfil</h2>

      {/* Tarjeta de Datos */}
      <div className="tp-card">
        
        {/* Nombre */}
        <div className="tp-field">
          <span className="tp-label"><span>👤</span>Nombre</span>
          {editing ? (
            <input className="tp-input" name="nombre" value={teacher.nombre} onChange={handleChange} placeholder="Tu nombre" />
          ) : (
            <div className="tp-value">{teacher.nombre || "—"}</div>
          )}
        </div>

        {/* Apellido */}
        <div className="tp-field">
          <span className="tp-label"><span>👤</span>Apellido</span>
          {editing ? (
            <input className="tp-input" name="apellido" value={teacher.apellido} onChange={handleChange} placeholder="Tu apellido" />
          ) : (
            <div className="tp-value">{teacher.apellido || "—"}</div>
          )}
        </div>

        {/* Materia */}
        <div className="tp-field">
          <span className="tp-label"><span>🏫</span>Materia</span>
          {editing ? (
            <select className="tp-select" name="materia" value={teacher.materia} onChange={handleChange}>
              <option value="" disabled>Selecciona materia</option>
              {materias.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <div className="tp-value">{teacher.materia || "—"}</div>
          )}
        </div>

        {/* Email */}
        <div className="tp-field">
          <span className="tp-label"><span>📧</span>Correo Electrónico (Solo lectura)</span>
          <div className="tp-email">{teacher.email || "—"}</div>
        </div>

        {/* Botones de Acción */}
        <div className="tp-actions">
          {editing ? (
            <>
              <button className="tp-save-btn" onClick={handleSave}>💾 Guardar</button>
              <button className="tp-cancel-btn" onClick={() => setEditing(false)}>✖ Cancelar</button>
            </>
          ) : (
            <button className="tp-edit-btn" onClick={() => setEditing(true)}>✏️ Editar Perfil</button>
          )}
        </div>

      </div>
    </div>
  );
}
