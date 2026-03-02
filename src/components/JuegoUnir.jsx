import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Xarrow from "react-xarrows";
import "./JuegoUnir.css";

import correctoSound from "../assets/sounds/correcto.mp3";
import incorrectoSound from "../assets/sounds/incorrecto.mp3";

const dataOriginal = [
  { palabra: "DRESS", imagen: "👗" },
  { palabra: "GLASS", imagen: "👓" },
  { palabra: "SOCKS", imagen: "🧦" },
  { palabra: "SHORTS", imagen: "🩳" },
  { palabra: "JEANS", imagen: "👖" },
  { palabra: "GLOVES", imagen: "🧤" },
  { palabra: "SHOES", imagen: "👟" },
  { palabra: "HEEL", imagen: "👠" },
];

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const JuegoUnir = () => {
  const navigate = useNavigate();

  const [palabras, setPalabras] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [palabraSeleccionada, setPalabraSeleccionada] = useState(null);
  const [conexiones, setConexiones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const correcto = new Audio(correctoSound);
  const incorrecto = new Audio(incorrectoSound);

  useEffect(() => {
    setPalabras(shuffle(dataOriginal));
    setImagenes(shuffle(dataOriginal));
  }, []);

  const manejarPalabra = (palabra) => {
    if (conexiones.some(c => c.palabra === palabra)) return;
    setPalabraSeleccionada(palabra);
  };

  const manejarImagen = (imagen) => {
    if (!palabraSeleccionada) return;

    const esCorrecto = dataOriginal.some(
      i => i.palabra === palabraSeleccionada && i.imagen === imagen
    );

    const nueva = {
      id: `${palabraSeleccionada}-${imagen}`,
      palabra: palabraSeleccionada,
      imagen,
      start: `palabra-${palabraSeleccionada}`,
      end: `imagen-${imagen}`,
      color: esCorrecto ? "#4caf50" : "#f44336",
    };

    setConexiones(prev => [...prev, nueva]);

    if (esCorrecto) {
      correcto.play();
      setMensaje("🌟 GREAT!");
    } else {
      incorrecto.play();
      setMensaje("❌ TRY AGAIN");
      setTimeout(() => {
        setConexiones(prev => prev.filter(c => c.id !== nueva.id));
      }, 900);
    }

    const correctas = conexiones.filter(c => c.color === "#4caf50").length;
    if (esCorrecto && correctas + 1 === dataOriginal.length) {
      setTimeout(() => setJuegoTerminado(true), 500);
    }

    setTimeout(() => setMensaje(""), 1200);
    setPalabraSeleccionada(null);
  };

  return (
    <div className="escena-juego">
      <h1 className="titulo">🎯 Match the Word with the Image!</h1>
      {mensaje && <div className="mensaje">{mensaje}</div>}

      {/* PALABRAS */}
      <div className="zona-palabras">
        {palabras.map(item => (
          <div
            key={item.palabra}
            id={`palabra-${item.palabra}`}
            className={`burbuja palabra ${palabraSeleccionada === item.palabra ? "activa" : ""}`}
            onClick={() => manejarPalabra(item.palabra)}
          >
            {item.palabra}
          </div>
        ))}
      </div>
        {/* 👇 Botón de retroceso */}
              <button className="volver-btn" onClick={() => navigate("/games")}>
        ⬅ Volver
      </button>

      {/* IMÁGENES */}
      <div className="zona-imagenes">
        {imagenes.map(item => (
          <div
            key={item.imagen}
            id={`imagen-${item.imagen}`}
            className="burbuja imagen"
            onClick={() => manejarImagen(item.imagen)}
          >
            {item.imagen}
          </div>
        ))}
      </div>

      {juegoTerminado && (
        <div className="final">🌈 Excellent Job! 🌈</div>
      )}

      {conexiones.map(c => (
        <Xarrow
          key={c.id}
          start={c.start}
          end={c.end}
          color={c.color}
          strokeWidth={5}
          headSize={0}
          path="smooth"
        />
      ))}
    </div>
  );
};

export default JuegoUnir;
