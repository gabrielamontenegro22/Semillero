/**
 * Traduce errores de Firebase a mensajes amigables en español.
 *
 * Uso:
 *   try {
 *     await algunaOperacion();
 *   } catch (error) {
 *     const mensaje = traducirErrorFirebase(error);
 *     alert(mensaje);
 *   }
 */
export function traducirErrorFirebase(error) {
  if (!error) return 'Ocurrió un error inesperado.';

  const code = error.code || '';
  const message = error.message || '';

  // ── Errores de Firestore ──
  if (code === 'permission-denied' || message.includes('insufficient permissions')) {
    return 'No tienes permiso para ver o modificar esta información.';
  }
  if (code === 'unavailable' || message.includes('Failed to fetch')) {
    return 'No hay conexión a internet. Revisa tu red e intenta de nuevo.';
  }
  if (code === 'not-found') {
    return 'No se encontró la información solicitada.';
  }
  if (code === 'already-exists') {
    return 'Esta información ya existe.';
  }
  if (code === 'resource-exhausted') {
    return 'Se ha excedido el límite de peticiones. Intenta más tarde.';
  }
  if (code === 'unauthenticated') {
    return 'Necesitas iniciar sesión para realizar esta acción.';
  }
  if (code === 'cancelled') {
    return 'La operación fue cancelada.';
  }
  if (code === 'deadline-exceeded') {
    return 'La operación tardó demasiado. Revisa tu conexión.';
  }

  // ── Errores de Authentication ──
  const erroresAuth = {
    'auth/user-not-found': 'Usuario no encontrado.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-email': 'Correo electrónico inválido.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/network-request-failed': 'No hay conexión a internet.',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento e intenta de nuevo.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/operation-not-allowed': 'Esta operación no está permitida.',
    'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión.',
  };
  if (erroresAuth[code]) return erroresAuth[code];

  // ── Si no reconocemos el error ──
  console.error('Error sin traducir:', error);
  return 'Ocurrió un error. Intenta de nuevo o contacta al docente.';
}
