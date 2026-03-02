import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Importar para navegar
import './JuegoEmparejar.css';
import correctoSound from '../assets/sounds/correcto.mp3';
import incorrectoSound from '../assets/sounds/incorrecto.mp3';

const palabras = [
  { palabra: 'DRESS', imagen: '👗' },
  { palabra: 'GLASS', imagen: '👓' },
  { palabra: 'SOCKETS', imagen: '🧦' },
  { palabra: 'SHORTS', imagen: '🩳' },
  { palabra: 'JEANS', imagen: '👖' },
  { palabra: 'GLOVES', imagen: '🧤' },
  { palabra: 'SHOES', imagen: '👟' },
  { palabra: 'HEEL', imagen: '👠' }
];

const JuegoEmparejar = () => {
  const [mostrarInicio, setMostrarInicio] = useState(true);
  const [mezcladas, setMezcladas] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [aciertos, setAciertos] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const correcto = new Audio(correctoSound);
  const incorrecto = new Audio(incorrectoSound);
  const navigate = useNavigate(); // 👈 Hook para navegar

  const mezclarArray = (arr) => {
    return [...arr]
      .map(item => ({ ...item, id: Math.random() }))
      .sort(() => 0.5 - Math.random());
  };

  const reiniciarJuego = () => {
    setSeleccion([]);
    setAciertos([]);
    setJuegoTerminado(false);
    setMostrarInicio(true);
    const nuevoMezclado = mezclarArray([...palabras, ...palabras]);
    setMezcladas(nuevoMezclado);
    setTimeout(() => {
      setMostrarInicio(false);
    }, 5000);
  };

  useEffect(() => {
    const mezclado = mezclarArray([...palabras, ...palabras]);
    setMezcladas(mezclado);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarInicio(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  const manejarClick = (item) => {
    if (aciertos.includes(item.id) || seleccion.find(i => i.id === item.id)) return;

    if (seleccion.length === 0) {
      setSeleccion([item]);
    } else if (seleccion.length === 1) {
      const nuevaSeleccion = [seleccion[0], item];
      setSeleccion(nuevaSeleccion);

      if (seleccion[0].palabra === item.palabra && seleccion[0].id !== item.id) {
        const nuevosAciertos = [...aciertos, seleccion[0].id, item.id];
        setAciertos(nuevosAciertos);
        correcto.play();

        if (nuevosAciertos.length === mezcladas.length) {
          setTimeout(() => {
            setJuegoTerminado(true);
          }, 800);
        }
      } else {
        incorrecto.play();
      }

      setTimeout(() => setSeleccion([]), 800);
    }
  };

  const getCardClass = (item) => {
    if (aciertos.includes(item.id)) return 'juego-card correct';
    if (seleccion.find(i => i.id === item.id)) return 'juego-card selected';
    return 'juego-card';
  };

  return (
    <div className="juego-container">
          {/* 👇 Botón de retroceso */}
      <button className="volver-btn" onClick={() => navigate("/games")}>
        ⬅ Volver
      </button>


      {juegoTerminado ? (
        <div className="juego-fin">
          <h2>🎉 ¡Muy bien! Has emparejado todas las cartas 🎉</h2>
          <button className="boton-reiniciar" onClick={reiniciarJuego}>
            🔁 Jugar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h1 className="juego-title">🎮 Match the Word with the Image!</h1>
          <div className="juego-board">
            {mezcladas.map(item => (
              <div
                key={item.id}
                onClick={() => manejarClick(item)}
                className={getCardClass(item)}
              >
                {(seleccion.find(i => i.id === item.id) || aciertos.includes(item.id) || mostrarInicio)
                  ? item.imagen || item.palabra
                  : '❓'}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default JuegoEmparejar;
