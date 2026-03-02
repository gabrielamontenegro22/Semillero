import { useNavigate } from 'react-router-dom';
import './Areas.css';

const Areas = () => {
  const navigate = useNavigate();

  const areas = [
    { nombre: "Inglés", icono: "🇬🇧", ruta: "/games", areaKey: "english" },
    { nombre: "Matemáticas", icono: "🧮", ruta: "/games", areaKey: "math" },
    { nombre: "Ciencias", icono: "🔬", ruta: "/games", areaKey: "science" },
    { nombre: "Español", icono: "📚", ruta: "/games", areaKey: "spanish" },
  ];

  const handleVolver = () => {
    navigate('/home'); // 🔙 puedes cambiar a "/" si prefieres
  };

  return (
    <div className="areas-container">
      {/* 🔹 Botón de volver alineado a la izquierda */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <button className="volver-btn" onClick={() => navigate("/home")}>
        ⬅ Volver
      </button>
      </div>

      <h2>🌈 ¡Explora las áreas de aprendizaje!</h2>

      <div className="areas-grid">
        {areas.map((a, i) => (
          <div
            key={i}
            className="area-card"
            onClick={() => navigate(a.ruta, { state: { area: a.areaKey } })}
          >
            <span className="area-icon">{a.icono}</span>
            <h3>{a.nombre}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Areas;
