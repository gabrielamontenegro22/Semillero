import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import EmptyState from "./EmptyState";
import "./MisActividadesDocente.css";
import { useNavigate } from "react-router-dom";

export default function MisActividadesDocente() {
  const [actividades, setActividades] = useState([]);
  const navigate = useNavigate();

  const cargarActividades = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "actividades"), where("id_docente", "==", user.uid));
    const snap = await getDocs(q);

    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setActividades(data);
  };

  useEffect(() => {
    cargarActividades();
  }, []);

  // 🔹 Activar / desactivar actividad
  const toggleEstado = async (actividad) => {
    const ref = doc(db, "actividades", actividad.id);
    await updateDoc(ref, {
      estado: actividad.estado === "activa" ? "inactiva" : "activa"
    });
    cargarActividades();
  };

  // 🔹 Eliminar actividad
  const eliminarActividad = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta actividad?")) return;
    await deleteDoc(doc(db, "actividades", id));
    cargarActividades();
  };

  return (
    <div className="actividades-docente-container">
      {/* ── HEADER ── */}
      <div className="rj-header">
        <button className="rj-volver" onClick={() => navigate("/docente")}>
          ⬅ Volver
        </button>
        <h2 className="rj-titulo">Mis Actividades</h2>
        <p className="rj-subtitulo">
          Aquí puedes gestionar los ejercicios y cuestionarios creados para tus estudiantes.
        </p>
      </div>

      {actividades.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Aún no tienes actividades creadas"
          message="Crea tu primera actividad para que tus estudiantes empiecen a practicar inglés."
          buttonText="✏️ Crear mi primera actividad"
          onButtonClick={() => navigate("/docente/crear-avanzada")}
          variant="dark"
        />
      ) : (
        <div className="tabla-actividades">
          <div className="rj-grupo-header">
            <span className="rj-grupo-icon">📝</span>
            <h3 className="rj-grupo-titulo">Listado General</h3>
            <span className="rj-grupo-count">{actividades.length} Actividades</span>
          </div>

          <table className="rj-tabla">
            <thead>
              <tr>
                <th>Título y Área</th>
                <th>Estado actual</th>
                <th>Fecha creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {actividades.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="rj-td-estudiante">
                      <span className="rj-est-nombre">{a.titulo}</span>
                      <span className="rj-est-grado">{a.area}</span>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`estado ${a.estado}`}>{a.estado}</span>
                  </td>
                  
                  <td>
                    <span className="rj-td-fecha">
                      {new Date(a.fecha_creacion.seconds * 1000).toLocaleDateString()}
                    </span>
                  </td>

                  <td>
                    <div className="acciones">
                      {/* Activar / desactivar */}
                      <button
                        onClick={() => toggleEstado(a)}
                        className="btn-estado"
                      >
                        {a.estado === "activa" ? "Desactivar" : "Activar"}
                      </button>

                      {/* EDITAR */}
                      <button
                        className="btn-editar"
                        onClick={() => navigate(`/docente/crear-avanzada/${a.id}`)}
                      >
                        ✏ Editar
                      </button>

                      {/* ELIMINAR */}
                      <button
                        onClick={() => eliminarActividad(a.id)}
                        className="btn-eliminar"
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
