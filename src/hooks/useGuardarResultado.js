// src/hooks/useGuardarResultado.js
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * Guarda el resultado de una unidad completa en Firestore.
 *
 * @param {Object} params
 * @param {string} params.unidad       - "greetings", "personal-information", etc.
 * @param {number} params.periodo      - 1, 2, 3 o 4
 * @param {string} params.area         - "ingles", "matematicas", etc.
 * @param {Array}  params.niveles      - [{ nivel, titulo, score, maxScore }]
 * @param {number} params.totalScore   - suma de scores
 * @param {number} params.maxTotal     - suma de maxScores
 */
export async function guardarResultadoUnidad({
  unidad,
  periodo,
  area = "ingles",
  niveles = [],
  totalScore,
  maxTotal,
}) {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No hay usuario autenticado, no se guarda resultado.");
    return;
  }

  try {
    // Obtener datos del estudiante
    const estudianteRef = doc(db, "usuarios", user.uid);
    const estudianteSnap = await getDoc(estudianteRef);
    const estudiante = estudianteSnap.exists() ? estudianteSnap.data() : {};

    // Calcular estrellas globales de la unidad
    const porcentaje = maxTotal > 0 ? (totalScore / maxTotal) * 100 : 0;
    const estrellas = porcentaje >= 90 ? 3 : porcentaje >= 60 ? 2 : 1;

    // ID del documento: uid + unidad (se sobreescribe si vuelve a jugar → guarda el último intento)
    const docId = `${user.uid}_${area}_${unidad}`;

    const resultado = {
      uid:        user.uid,
      nombre:     estudiante.nombre     || "Estudiante",
      apellido:   estudiante.apellido   || "",
      grado:      estudiante.grado      || "",
      area,
      periodo,
      unidad,
      niveles:    niveles.map((n, i) => ({
        nivel:    n.nivel    ?? i + 1,
        titulo:   n.titulo   ?? `Level ${i + 1}`,
        score:    n.score    ?? 0,
        maxScore: n.maxScore ?? 4,
        estrellas: calcEstrellas(n.score, n.maxScore),
      })),
      totalScore,
      maxTotal,
      estrellas,
      porcentaje: Math.round(porcentaje),
      fecha: serverTimestamp(),
    };

    await setDoc(doc(db, "resultados_juegos", docId), resultado);
    console.log("✅ Resultado guardado:", docId);
    return resultado;

  } catch (error) {
    console.error("❌ Error guardando resultado:", error);
  }
}

function calcEstrellas(score, maxScore) {
  if (!maxScore) return 1;
  const pct = (score / maxScore) * 100;
  return pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
}