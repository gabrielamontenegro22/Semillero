import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Xarrow from "react-xarrows";
import "./JuegoUnir.css";

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

const JuegoUnir = () => {
  const [palabras, setPalabras] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [conexiones, setConexiones] = useState([]);
  const navigate = useNavigate();

  // 🔹 Mezclar arrays al cargar el componente
  useEffect(() => {
    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
    setPalabras(shuffle(dataOriginal));
    setImagenes(shuffle(dataOriginal));
  }, []);

  const manejarClickPalabra = (palabra) => {
    setSeleccion({ tipo: "palabra", valor: palabra });
  };

  const manejarClickImagen = (imagen) => {
    if (seleccion && seleccion.tipo === "palabra") {
      const palabra = seleccion.valor;
      const correcto = dataOriginal.find(
        (item) => item.palabra === palabra && item.imagen === imagen
      );

      const nuevaConexion = {
        id: `${palabra}-${imagen}`,
        start: `palabra-${palabra}`,
        end: `imagen-${imagen}`,
        color: correcto ? "green" : "red",
      };

      setConexiones((prev) => [...prev, nuevaConexion]);

      if (!correcto) {
        setTimeout(() => {
          setConexiones((prev) =>
            prev.filter((c) => c.id !== nuevaConexion.id)
          );
        }, 1500);
      }

      setSeleccion(null);
    }
  };

  return (
    <div className="unir-container">
      {/* 🔙 Botón volver */}
      <button className="boton-home" onClick={() => navigate("/games")}>
        ⬅️
      </button>

      <h1 className="unir-title">🎯 Match the Word with the Image!</h1>

      <div className="unir-board">
        <div className="unir-col">
          {palabras.map((item) => (
            <div
              key={item.palabra}
              id={`palabra-${item.palabra}`}
              className={`unir-item palabra ${
                seleccion?.valor === item.palabra ? "seleccionado" : ""
              }`}
              onClick={() => manejarClickPalabra(item.palabra)}
            >
              {item.palabra}
            </div>
          ))}
        </div>

        <div className="unir-col">
          {imagenes.map((item) => (
            <div
              key={item.imagen}
              id={`imagen-${item.imagen}`}
              className="unir-item imagen"
              onClick={() => manejarClickImagen(item.imagen)}
            >
              {item.imagen}
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Flechas dinámicas */}
      {conexiones.map((c) => (
        <Xarrow
          key={c.id}
          start={c.start}
          end={c.end}
          color={c.color}
          strokeWidth={3}
          path="smooth"
        />
      ))}
    </div>
  );
};

export default JuegoUnir;
