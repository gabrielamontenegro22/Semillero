import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebaseConfig';

/**
 * ProtectedRoute con verificación de rol.
 *
 * Uso en App.js:
 *   <Route element={<ProtectedRoute rolRequerido="estudiante" />}> ... </Route>
 *   <Route element={<ProtectedRoute rolRequerido="docente" />}> ... </Route>
 *
 * Si no se pasa `rolRequerido`, solo verifica que el usuario esté logueado.
 */
export default function ProtectedRoute({ rolRequerido }) {
  const [user, loadingAuth] = useAuthState(auth);

  // Guardamos el rol JUNTO con el uid del usuario al que pertenece.
  // Así sabemos con certeza si el rol cargado corresponde al usuario actual.
  const [rolInfo, setRolInfo] = useState({ uid: null, rol: null });

  useEffect(() => {
    if (!user) {
      setRolInfo({ uid: null, rol: null });
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'usuarios', user.uid));
        if (cancelado) return;
        setRolInfo({
          uid: user.uid,
          rol: snap.exists() ? snap.data().rol : null,
        });
      } catch (err) {
        if (cancelado) return;
        console.error('Error leyendo rol del usuario:', err);
        setRolInfo({ uid: user.uid, rol: null });
      }
    })();

    return () => { cancelado = true; };
  }, [user]);

  // 1) Auth todavía cargando
  if (loadingAuth) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  // 2) Sin usuario logueado → al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3) El rol todavía no se ha cargado para ESTE usuario específico.
  //    Esta línea es la clave: evita que React decida con un rol viejo
  //    (o nulo) mientras la consulta a Firestore aún está en marcha.
  if (rolInfo.uid !== user.uid) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  // 4) Si la ruta exige un rol y no coincide → redirigir al panel correcto
  if (rolRequerido && rolInfo.rol !== rolRequerido) {
    if (rolInfo.rol === 'docente') {
      return <Navigate to="/docente" replace />;
    }
    if (rolInfo.rol === 'estudiante') {
      return <Navigate to="/home" replace />;
    }
    // El usuario está logueado pero su documento no tiene rol válido
    return <Navigate to="/login" replace />;
  }

  // 5) Todo en orden → renderizar las rutas anidadas
  return <Outlet />;
}
