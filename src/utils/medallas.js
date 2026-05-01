import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Definición de las medallas disponibles.
 * Cada medalla tiene: id único, nombre, ícono (emoji), descripción
 * (qué dice cuando ya la ganaste) y "como" (qué dice cuando aún no la ganas).
 */
export const MEDALLAS = [
  {
    id: 'bienvenido',
    nombre: '¡Bienvenido!',
    icono: '🎉',
    descripcion: 'Te uniste a Play English',
    como: 'Crear tu cuenta',
  },
  {
    id: 'primera-actividad',
    nombre: 'Primera Actividad',
    icono: '🌱',
    descripcion: 'Completaste tu primera actividad',
    como: 'Resolver 1 actividad',
  },
  {
    id: 'puntaje-perfecto',
    nombre: 'Puntaje Perfecto',
    icono: '⭐',
    descripcion: 'Sacaste 100% en una actividad',
    como: 'Sacar 100% en cualquier cuestionario',
  },
  {
    id: 'cinco-actividades',
    nombre: '5 Actividades',
    icono: '📚',
    descripcion: 'Completaste 5 actividades',
    como: 'Resolver 5 actividades',
  },
  {
    id: 'diez-actividades',
    nombre: '10 Actividades',
    icono: '🚀',
    descripcion: 'Completaste 10 actividades',
    como: 'Resolver 10 actividades',
  },
  {
    id: 'explorador',
    nombre: 'Explorador',
    icono: '🎮',
    descripcion: 'Jugaste 3 unidades distintas',
    como: 'Jugar al menos 3 unidades',
  },
  {
    id: 'destacado',
    nombre: 'Estudiante Destacado',
    icono: '🏅',
    descripcion: 'Tu promedio supera el 80%',
    como: 'Mantener promedio superior a 80%',
  },
  {
    id: 'maestro-niveles',
    nombre: 'Maestro de Niveles',
    icono: '🌟',
    descripcion: 'Conseguiste 3 estrellas en un juego',
    como: 'Sacar 3 estrellas en cualquier juego',
  },
];

/**
 * Calcula qué medallas ha ganado el estudiante consultando sus resultados.
 *
 * @param {string} uid - UID del estudiante
 * @returns {Promise<Set<string>>} Set con los IDs de medallas ganadas
 */
export async function calcularMedallasGanadas(uid) {
  const ganadas = new Set();

  // 🎉 "Bienvenido" — todos los que tienen cuenta la tienen
  ganadas.add('bienvenido');

  try {
    // Cargar resultados de cuestionarios del estudiante
    const resultadosQ = query(
      collection(db, 'resultados'),
      where('id_estudiante', '==', uid)
    );
    const resultadosSnap = await getDocs(resultadosQ);
    const resultados = resultadosSnap.docs.map((d) => d.data());

    // Cargar resultados de juegos del estudiante
    const juegosQ = query(
      collection(db, 'resultados_juegos'),
      where('uid', '==', uid)
    );
    const juegosSnap = await getDocs(juegosQ);
    const juegos = juegosSnap.docs.map((d) => d.data());

    // 🌱 Primera actividad
    if (resultados.length >= 1) ganadas.add('primera-actividad');

    // 📚 5 actividades
    if (resultados.length >= 5) ganadas.add('cinco-actividades');

    // 🚀 10 actividades
    if (resultados.length >= 10) ganadas.add('diez-actividades');

    // ⭐ Puntaje perfecto (100% en alguna actividad)
    if (resultados.some((r) => Number(r.puntaje) === 100)) {
      ganadas.add('puntaje-perfecto');
    }

    // 🏅 Estudiante destacado (promedio > 80% con al menos 1 actividad)
    if (resultados.length > 0) {
      const promedio =
        resultados.reduce((acc, r) => acc + (Number(r.puntaje) || 0), 0) /
        resultados.length;
      if (promedio > 80) ganadas.add('destacado');
    }

    // 🎮 Explorador (3+ unidades distintas en juegos)
    const unidadesUnicas = new Set(
      juegos.map((j) => j.unidad).filter(Boolean)
    );
    if (unidadesUnicas.size >= 3) ganadas.add('explorador');

    // 🌟 Maestro de niveles (3 estrellas en algún juego)
    if (juegos.some((j) => Number(j.estrellas) === 3)) {
      ganadas.add('maestro-niveles');
    }
  } catch (err) {
    console.error('Error calculando medallas:', err);
  }

  return ganadas;
}
