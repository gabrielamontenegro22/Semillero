import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Register from './components/Register';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';

import Home from './components/home';
import Games from './components/Games';
import Areas from './components/Areas';
import StudentProfile from './components/StudentProfile';
import TeacherProfile from './components/TeacherProfile';


import JuegoEmparejar from './components/JuegoEmparejar';
import JuegoUnir from './components/JuegoUnir';
import ActividadesEstudiante from './components/ActividadesEstudiante';
import ResolverActividad from './components/ResolverActividad';

import PanelDocente from './components/PanelDocente';
import CrearActividad from './components/CrearActividad';
import ResultadosDocente from './components/ResultadosDocente';
import DetalleResultados from './components/DetalleResultados';
import DetalleRespuestas from './components/DetalleRespuestas';
import MisActividadesDocente from './components/MisActividadesDocente';
import CreadorActividadAvanzado from './components/CreadorActividadAvanzado';
import MisEstudiantes from "./components/MisEstudiantes";
import EstudiantesPorGrado from "./components/EstudiantesPorGrado";

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🌐 RUTAS PÚBLICAS */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* 🔒 TODO LO DEMÁS PROTEGIDO */}
        <Route
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        >
          {/* ESTUDIANTE */}
          <Route path="/home" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/actividades" element={<ActividadesEstudiante />} />
          <Route path="/resolver/:id" element={<ResolverActividad />} />
          <Route path="/estudiante/perfil" element={<StudentProfile />} />
          <Route path="/JuegoEmparejar" element={<JuegoEmparejar />} />
          <Route path="/JuegoUnir" element={<JuegoUnir />} />

          {/* DOCENTE */}
          <Route path="/docente" element={<PanelDocente />} />
          <Route path="/docente/crear" element={<CrearActividad />} />
          <Route path="/docente/mis-actividades" element={<MisActividadesDocente />} />
          <Route path="/docente/resultados" element={<ResultadosDocente />} />
          <Route path="/docente/resultados/:id" element={<DetalleResultados />} />
          <Route path="/docente/resultados/:id/:correo" element={<DetalleRespuestas />} />
          <Route path="/docente/crear-avanzada" element={<CreadorActividadAvanzado />} />
          <Route path="/docente/crear-avanzada/:id" element={<CreadorActividadAvanzado />} />
           <Route path="/docente/perfil" element={<TeacherProfile />} />
           <Route path="/docente/mis-estudiantes" element={<MisEstudiantes />} />
<Route path="/docente/grado/:grado" element={<EstudiantesPorGrado />} />
           

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
