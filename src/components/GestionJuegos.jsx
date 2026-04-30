import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import './GestionJuegos.css';

// Lista estructurada por periodos
const JUEGOS_POR_PERIODO = [
  {
    periodo: "Periodo 1",
    juegos: [
      { id: "greetings", nombre: "Greetings", icono: "👋" },
      { id: "personal_information", nombre: "Personal information", icono: "🪪" },
      { id: "family_members", nombre: "Family members", icono: "👨‍👩‍👧‍👦" }
    ]
  },
  {
    periodo: "Periodo 2",
    juegos: [
      { id: "classroom_objects", nombre: "Classroom objects", icono: "🎒" },
      { id: "commands", nombre: "Commands", icono: "🗣️" },
      { id: "colors_and_shapes", nombre: "Colors and shapes", icono: "🎨" },
      { id: "how_many?_/_how_much?", nombre: "How many? / How much?", icono: "❓" },
      { id: "numbers_0–10", nombre: "Numbers 0–10", icono: "🔢" }
    ]
  },
  {
    periodo: "Periodo 3",
    juegos: [
      { id: "foods_and_drinks", nombre: "Foods and drinks", icono: "🍔" },
      { id: "animals_and_pets", nombre: "Animals and pets", icono: "🐶" },
      { id: "numbers_0–20", nombre: "Numbers 0–20", icono: "🔢" }
    ]
  },
  {
    periodo: "Periodo 4",
    juegos: [
      { id: "parts_of_the_body", nombre: "Parts of the body", icono: "🧑‍🦱" },
      { id: "toys", nombre: "Toys", icono: "🧸" },
      { id: "parts_of_the_house", nombre: "Parts of the house", icono: "🏠" }
    ]
  }
];

const TODOS_LOS_JUEGOS = JUEGOS_POR_PERIODO.flatMap(p => p.juegos);

export default function GestionJuegos() {
  const navigate = useNavigate();
  const [juegosState, setJuegosState] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const snap = await getDocs(collection(db, "config_juegos"));
        const configDb = {};
        snap.forEach(doc => {
          configDb[doc.id] = doc.data().activo;
        });

        // Inicializar el estado fusionando DB con "true" por defecto si no existe
        const estadoInicial = {};
        TODOS_LOS_JUEGOS.forEach(juego => {
          estadoInicial[juego.id] = configDb[juego.id] !== undefined ? configDb[juego.id] : true;
        });

        setJuegosState(estadoInicial);
      } catch (error) {
        console.error("Error cargando configuración de juegos:", error);
      }
      setLoading(false);
    };

    cargarConfig();
  }, []);

  const handleToggle = async (juegoId) => {
    const nuevoEstado = !juegosState[juegoId];

    // Actualizar UI optimísticamente
    setJuegosState(prev => ({ ...prev, [juegoId]: nuevoEstado }));

    try {
      // Guardar en Firestore
      await setDoc(doc(db, "config_juegos", juegoId), { activo: nuevoEstado }, { merge: true });
    } catch (error) {
      console.error("Error al guardar estado del juego:", error);
      // Revertir si falla
      setJuegosState(prev => ({ ...prev, [juegoId]: !nuevoEstado }));
      alert("Hubo un error al guardar los cambios.");
    }
  };

  if (loading) {
    return <div className="gestion-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2 style={{ color: 'white' }}>Cargando...</h2></div>;
  }

  return (
    <div className="gestion-container">
      {/* ── HEADER ── */}
      <div className="gj-header">
        <button className="gj-volver" onClick={() => navigate("/docente")}>
          ⬅ Volver
        </button>
        <h2 className="gj-titulo">⚙️ Gestión de Juegos</h2>
        <p className="gj-subtitulo">
          Activa o desactiva el acceso a los minijuegos para los estudiantes. Si apagas un juego, aparecerá bloqueado.
        </p>
      </div>

      {JUEGOS_POR_PERIODO.map((grupo) => (
        <div key={grupo.periodo} style={{ marginBottom: "40px" }}>
          <h3 className="periodo-titulo">📘 {grupo.periodo}</h3>
          <div className="juegos-grid">
            {grupo.juegos.map((juego) => {
              const isActivo = juegosState[juego.id];
              return (
                <div className={`juego-card ${isActivo ? 'activo' : 'inactivo'}`} key={juego.id}>
                  <div className="juego-info">
                    <span className="juego-icono">{juego.icono}</span>
                    <h3>{juego.nombre}</h3>
                  </div>
                  <div className="juego-toggle">
                    <span className="estado-texto">{isActivo ? "ENCENDIDO" : "APAGADO"}</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isActivo}
                        onChange={() => handleToggle(juego.id)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
