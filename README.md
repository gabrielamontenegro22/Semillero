# 🎮 Play English

**Aplicación web educativa gamificada para enseñar inglés a estudiantes de primaria.**

Una plataforma interactiva con tres roles diferenciados (administrador, docente y estudiante) que permite gestionar actividades, jugar unidades didácticas y dar seguimiento al progreso de los estudiantes.

![Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/license-Educational-blue.svg)

---

## 📋 Tabla de contenidos

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Tecnologías utilizadas](#%EF%B8%8F-tecnologías-utilizadas)
- [Seguridad y arquitectura](#-seguridad-y-arquitectura)
- [Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Autora](#-autora)

---

## 📖 Sobre el proyecto

**Play English** es una aplicación web pensada para **estudiantes de primer grado de primaria** que aprenden inglés. Combina actividades académicas tradicionales (cuestionarios) con juegos interactivos por unidades temáticas, ofreciendo una experiencia divertida y motivadora.

El proyecto fue desarrollado en el marco del **Semillero de Iniciación** y aborda problemas reales de la educación gamificada:

- Falta de plataformas en español enfocadas a primer grado.
- Necesidad de que el docente pueda crear y administrar contenido propio.
- Importancia de un sistema seguro de roles para entornos escolares.

### 📚 Currículo cubierto

La plataforma incluye **15 unidades temáticas** distribuidas en 4 periodos académicos:

- **Periodo 1**: Greetings, Personal Information, Family Members
- **Periodo 2**: Classroom Objects, Commands, Colors & Shapes, Numbers 0–10, How many?
- **Periodo 3**: Foods and Drinks, Animals and Pets, Numbers 0–20
- **Periodo 4**: Parts of the Body, Toys, Parts of the House

---

## ✨ Características

### 👨‍🎓 Para el estudiante

- ✅ Registro y login propios.
- ✅ Perfil personalizable (nombre, edad, grado).
- ✅ Cambio de contraseña desde el perfil.
- ✅ Listado de actividades creadas por el docente.
- ✅ Resolución de cuestionarios con calificación automática.
- ✅ Acceso a 15 unidades de inglés con juegos interactivos (drag & drop, escucha, opción múltiple, etc.).
- ✅ Sistema de estrellas y feedback visual al completar niveles.
- ✅ Sonidos y animaciones diseñadas para niños.

### 👩‍🏫 Para el docente

- ✅ Panel de control con accesos directos.
- ✅ Creación de actividades simples y avanzadas (con preguntas, opciones, imágenes).
- ✅ Gestión de actividades propias: editar, activar/desactivar, eliminar.
- ✅ Visualización de resultados de cuestionarios (por estudiante, por actividad).
- ✅ Visualización de resultados de juegos por unidad y periodo.
- ✅ Generación de boletines en PDF.
- ✅ Activación/desactivación de juegos por unidad.
- ✅ Filtros avanzados (por grado, periodo, unidad, área).
- ✅ Edición de perfil con cambio de contraseña.

### 👑 Para el administrador

- ✅ Panel de administración con estadísticas en vivo.
- ✅ Conteo de docentes, estudiantes y nuevos del mes.
- ✅ Creación de cuentas docente directamente desde la app (sin tocar Firebase Console).
- ✅ Lista de docentes registrados con búsqueda en tiempo real.
- ✅ Eliminación de cuentas docente con confirmación.
- ✅ Saludo personalizado y avatar circular.

---

## 🛠️ Tecnologías utilizadas

### Frontend

| Tecnología | Uso |
|------------|-----|
| **React 19** | Framework principal |
| **React Router v7** | Navegación entre rutas con protección por rol |
| **React Hot Toast** | Notificaciones modernas |
| **Framer Motion** | Animaciones |
| **React DnD** | Funcionalidad drag & drop |
| **Canvas Confetti** | Efectos de celebración |
| **use-sound** | Efectos sonoros |
| **jsPDF + AutoTable** | Generación de boletines |

### Backend

| Servicio | Uso |
|----------|-----|
| **Firebase Authentication** | Login, registro, recuperación de contraseña |
| **Cloud Firestore** | Base de datos de usuarios, actividades, resultados |
| **Firebase Hosting** | Despliegue (futuro) |

---

## 🔒 Seguridad y arquitectura

### Sistema de roles

La aplicación maneja **tres roles** con permisos estrictamente diferenciados:

| Rol | Acceso |
|-----|--------|
| `admin` | Solo `/admin` — gestión de docentes |
| `docente` | Solo `/docente/*` — gestión de su contenido |
| `estudiante` | Solo `/home`, `/areas`, juegos y `/actividades` |

### Defensa en capas

1. **Frontend (`ProtectedRoute`)**: cada ruta verifica el rol del usuario en Firestore antes de renderizar el componente. Redirige automáticamente al panel correcto si no coincide.

2. **Reglas de Firestore**: capa de seguridad en el backend. Aunque alguien manipule el frontend, las reglas impiden acciones no autorizadas. Por ejemplo:
   - Un estudiante no puede cambiar su rol a `docente` (ni siquiera por DevTools).
   - Solo un `admin` puede crear documentos con `rol: 'docente'`.
   - Cada docente solo puede leer/editar sus propias actividades.
   - Los resultados son inmutables una vez creados.

3. **Validación en cliente**: formularios con validación de campos antes de enviar a Firebase.

### Manejo de errores

- Helper centralizado (`utils/firebaseErrors.js`) que traduce errores técnicos de Firebase a mensajes amigables en español.
- Notificaciones toast para acciones exitosas o errores.
- Pantalla de carga unificada durante operaciones asíncronas.

---

## 🚀 Cómo correr el proyecto

### Requisitos previos

- **Node.js 16+** y **npm**.
- Cuenta de Firebase (gratuita).
- Editor de código (VS Code, Antigravity, etc.).

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/gabrielamontenegro22/Semillero.git
cd Semillero

# 2. Instalar dependencias
npm install

# 3. Configurar Firebase
# Editar src/firebaseConfig.js con tus credenciales
```

### Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilitar **Authentication** (proveedor: Email/Password).
3. Habilitar **Cloud Firestore** (modo producción).
4. Configurar las **reglas de Firestore** (incluidas en el proyecto).
5. Copiar la configuración a `src/firebaseConfig.js`.

### Ejecución

```bash
# Modo desarrollo (recarga automática)
npm start

# Construir para producción
npm run build
```

La app estará disponible en `http://localhost:3000`.

---

## 📁 Estructura del proyecto

```
play-english/
├── public/
├── src/
│   ├── assets/                  # Imágenes y recursos
│   ├── components/
│   │   ├── PRIMERO/             # Unidades didácticas de 1° grado
│   │   │   └── INGLES/          # Juegos por tema
│   │   ├── AdminPanel.jsx       # Panel administrador
│   │   ├── PanelDocente.jsx     # Panel docente
│   │   ├── home.jsx             # Inicio del estudiante
│   │   ├── Login.jsx            # Autenticación
│   │   ├── ProtectedRoute.jsx   # Guard de rutas
│   │   ├── EmptyState.jsx       # Estados vacíos
│   │   ├── LoadingScreen.jsx    # Pantalla de carga
│   │   └── ...                  # Otros componentes
│   ├── data/
│   │   └── englishCurriculum.js # Currículo de inglés
│   ├── hooks/
│   │   └── useGuardarResultado.js
│   ├── utils/
│   │   └── firebaseErrors.js    # Helper de errores
│   ├── firebaseConfig.js        # Configuración Firebase
│   ├── App.js                   # Definición de rutas
│   └── index.js                 # Punto de entrada
├── package.json
└── README.md
```

---

## 👤 Autora

**Gabriela Montenegro**
*Desarrolladora del Semillero de Investigación*

🔗 **GitHub:** [gabrielamontenegro22](https://github.com/gabrielamontenegro22)
📦 **Repositorio:** [Semillero](https://github.com/gabrielamontenegro22/Semillero)

---

## 📄 Licencia

Proyecto educativo desarrollado con fines académicos.

---

## 💡 Decisiones de diseño destacadas

Algunas decisiones arquitectónicas que vale la pena resaltar:

- **Creación manual de docentes**: por seguridad, los docentes no se autorregistran. Solo el `admin` puede crearlos desde el panel administrativo.
- **Autenticación secundaria de Firebase**: el panel admin usa una segunda instancia de Firebase Auth para crear usuarios sin afectar la sesión del admin actual.
- **Reglas con verificación cruzada**: las reglas de Firestore consultan otras colecciones (`get()`) para validar permisos en cascada.
- **Limpieza de datos antigua**: el sistema detecta valores antiguos en Firestore (ej. una `materia` que ya no es válida) y los normaliza automáticamente al cargar el perfil.
- **Optimización de imágenes**: las imágenes de la aplicación se optimizaron de ~40 MB a ~17 MB sin pérdida visual perceptible.

---

<p align="center">
  <strong>🎓 Hecho con ❤️ para que aprender inglés sea divertido.</strong>
</p>
