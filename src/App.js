import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/home';        // Asegúrate que el archivo se llame Home.jsx con H mayúscula
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import JuegoEmparejar from './components/JuegoEmparejar';
import JuegoUnir from './components/JuegoUnir';
import Areas from './components/Areas';
import Games from './components/Games'; // Asegúrate de importarlo
import CrearActividad from './components/CrearActividad';
import ActividadesEstudiante from './components/ActividadesEstudiante';
import ResolverActividad from './components/ResolverActividad';
import ResultadosDocente from "./components/ResultadosDocente";
import DetalleResultados from './components/DetalleResultados';
import DetalleRespuestas from './components/DetalleRespuestas';
import CreadorActividadAvanzado from './components/CreadorActividadAvanzado';
import PanelDocente from './components/PanelDocente';
import MisActividadesDocente from './components/MisActividadesDocente.jsx';




function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/JuegoEmparejar" element={<JuegoEmparejar />} />
         <Route path="/JuegoUnir" element={<JuegoUnir/>} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/docente" element={<PanelDocente />} />
        <Route path="/docente/crear" element={<CrearActividad />} />
        <Route path="/actividades" element={<ActividadesEstudiante />} />
        <Route path="/docente/crear-avanzada" element={<CreadorActividadAvanzado />} />
        <Route path="/docente/crear-avanzada/:id" element={<CreadorActividadAvanzado />} />
        <Route path="/resolver/:id" element={<ResolverActividad />} />
        <Route path="/docente/resultados" element={<ResultadosDocente />} />
        <Route path="/docente/resultados/:id" element={<DetalleResultados />} />
        <Route path="/docente/resultados/:id/:correo" element={<DetalleRespuestas />} />
        <Route path="/docente/mis-actividades" element={<MisActividadesDocente />} />

        <Route path="/games" element={<Games />} />


        
        {/* Ruta protegida */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
