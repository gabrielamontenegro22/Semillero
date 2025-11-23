// src/pages/Home.jsx
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      navigate("/login");
    });
  };

  return (
    <div>
      <h2>Bienvenido a Play & Learn</h2>
      <button onClick={cerrarSesion}>Cerrar Sesión</button>
    </div>
  );
}
