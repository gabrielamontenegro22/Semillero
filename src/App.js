import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ── Auth ──
import Register from './components/Register';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';

// ── General ──
import Home from './components/home';
import Areas from './components/Areas';
import Games from './components/Games';
import StudentProfile from './components/StudentProfile';
import TeacherProfile from './components/TeacherProfile';
import ActividadesEstudiante from './components/ActividadesEstudiante';
import ResolverActividad from './components/ResolverActividad';
import EnglishPeriodo from './components/EnglishPeriodo';


// ── Juegos legacy ──
import JuegoEmparejar from './components/JuegoEmparejar';
import JuegoUnir from './components/JuegoUnir';


// ── Admin ──
import AdminPanel from './components/AdminPanel';

// ── Docente ──
import PanelDocente from './components/PanelDocente';
import CrearActividad from './components/CrearActividad';
import MisActividadesDocente from './components/MisActividadesDocente';
import GestionJuegos from './components/GestionJuegos';
import ResultadosDocente from './components/ResultadosDocente';
import DetalleResultados from './components/DetalleResultados';
import DetalleRespuestas from './components/DetalleRespuestas';
import CreadorActividadAvanzado from './components/CreadorActividadAvanzado';
import EstudiantesPorGrado from './components/EstudiantesPorGrado';
import ResultadosJuegos from './components/ResultadosJuegos';
import DetalleResultadoJuego from './components/DetalleResultadoJuego';

// ── Primero · Inglés ──
import GreetingsUnit from './components/PRIMERO/INGLES/GreetingsUnit';
import PersonalInformationUnit from './components/PRIMERO/INGLES/PersonalInformationUnit';
import FamilyMembersUnit from './components/PRIMERO/INGLES/FamilyMembersUnit';
import ClassroomObjectsUnit from './components/PRIMERO/INGLES/ClassroomObjectsUnit';
import CommandsUnit from './components/PRIMERO/INGLES/CommandsUnit';
import ColorsShapesUnit from './components/PRIMERO/INGLES/ColorsShapesUnit';
import NumbersUnit from './components/PRIMERO/INGLES/NumbersUnit';
import HowUnit from './components/PRIMERO/INGLES/HowUnit';

// ── Primero · Inglés · Periodo 3 ──
import FoodUnit from './components/PRIMERO/INGLES/FoodUnit';
import PetsUnit from './components/PRIMERO/INGLES/PetsUnit';
import Numbers20unit from './components/PRIMERO/INGLES/Numbers20unit';

// ── Primero · Inglés · Periodo 4 ──
import BodyUnit from "./components/PRIMERO/INGLES/Bodyunit";
import ToysUnit from "./components/PRIMERO/INGLES/ToysUnit";
import HouseUnit from "./components/PRIMERO/INGLES/HouseUnit";


import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      {/* Toaster global — muestra notificaciones bonitas en la esquina */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '15px',
            fontWeight: '600',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: 'white' },
            style: {
              background: '#d1fae5',
              color: '#065f46',
              border: '2px solid #10b981',
            },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
            style: {
              background: '#fee2e2',
              color: '#991b1b',
              border: '2px solid #ef4444',
            },
            duration: 5000,
          },
        }}
      />
      <Routes>

        {/* ── Públicas ── */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* ── Protegidas · Solo ESTUDIANTES ── */}
        <Route element={<ProtectedRoute rolRequerido="estudiante" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/actividades" element={<ActividadesEstudiante />} />
          <Route path="/resolver/:id" element={<ResolverActividad />} />
          <Route path="/estudiante/perfil" element={<StudentProfile />} />
          <Route path="/english/periodo/:numero" element={<EnglishPeriodo />} />
          <Route path="/games" element={<Games />} />

          {/* ── Primero · Inglés · Unidades ── */}
          <Route path="/primero/ingles/greetings" element={<GreetingsUnit />} />
          <Route path="/primero/ingles/personal-information" element={<PersonalInformationUnit />} />
          <Route path="/primero/ingles/family-members" element={<FamilyMembersUnit />} />
          <Route path="/primero/ingles/classroom-objects" element={<ClassroomObjectsUnit />} />
          <Route path="/primero/ingles/commands" element={<CommandsUnit />} />
          <Route path="/primero/ingles/colors-shapes" element={<ColorsShapesUnit />} />
          <Route path="/primero/ingles/numbers" element={<NumbersUnit />} />
          <Route path="/primero/ingles/how" element={<HowUnit />} />

          {/* ── Periodo 3 ── */}
          <Route path="/primero/ingles/food" element={<FoodUnit />} />
          <Route path="/primero/ingles/animals" element={<PetsUnit />} />
          <Route path="/primero/ingles/numbers2" element={<Numbers20unit />} />

          {/* ── Periodo 4 ── */}
          <Route path="/primero/ingles/body" element={<BodyUnit />} />
          <Route path="/primero/ingles/toys" element={<ToysUnit />} />
          <Route path="/primero/ingles/house" element={<HouseUnit />} />
        </Route>

        {/* ── Protegidas · Solo DOCENTES ── */}
        <Route element={<ProtectedRoute rolRequerido="docente" />}>
          <Route path="/docente" element={<PanelDocente />} />
          <Route path="/docente/crear" element={<CrearActividad />} />
          <Route path="/docente/mis-actividades" element={<MisActividadesDocente />} />
          <Route path="/docente/gestionar-juegos" element={<GestionJuegos />} />
          <Route path="/docente/resultados" element={<ResultadosDocente />} />
          <Route path="/docente/resultados/:id" element={<DetalleResultados />} />
          <Route path="/docente/resultados/:id/:correo" element={<DetalleRespuestas />} />
          <Route path="/docente/crear-avanzada" element={<CreadorActividadAvanzado />} />
          <Route path="/docente/crear-avanzada/:id" element={<CreadorActividadAvanzado />} />
          <Route path="/docente/perfil" element={<TeacherProfile />} />
          <Route path="/docente/grado/:grado" element={<EstudiantesPorGrado />} />
          <Route path="/docente/resultados-juegos" element={<ResultadosJuegos />} />
          <Route path="/docente/resultados-juegos/:docId" element={<DetalleResultadoJuego />} />
        </Route>

        {/* ── Protegidas · Solo ADMIN ── */}
        <Route element={<ProtectedRoute rolRequerido="admin" />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
