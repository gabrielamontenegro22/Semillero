import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
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
      <button className="volver-btn" onClick={() => navigate("/docente")}>
        ⬅ Volver
      </button>

      <h2>📝 Mis Actividades</h2>

      {actividades.length === 0 ? (
        <p>No has creado actividades aún.</p>
      ) : (
        <table className="tabla-actividades">
          <thead>
            <tr>
              <th>Título</th>
              <th>Área</th>
              <th>Estado</th>
              <th>Fecha creación</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {actividades.map((a) => (
              <tr key={a.id}>
                <td>{a.titulo}</td>
                <td>{a.area}</td>
                <td className={`estado ${a.estado}`}>{a.estado}</td>
                <td>{new Date(a.fecha_creacion.seconds * 1000).toLocaleDateString()}</td>

                <td className="acciones">
                  {/* Activar / desactivar */}
                  <button
                    onClick={() => toggleEstado(a)}
                    className="btn-estado"
                  >
                    {a.estado === "activa" ? "Desactivar" : "Activar"}
                  </button>

                  {/* EDITAR – USA EL MISMO CREADOR CON ID */}
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

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
