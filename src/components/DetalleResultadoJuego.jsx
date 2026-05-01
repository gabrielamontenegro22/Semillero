import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import LoadingScreen from "./LoadingScreen";
import "./ResultadosJuegos.css";

const UNIDADES = {
  "greetings": { label: "Greetings", icon: "👋" },
  "personal-information": { label: "Personal Information", icon: "🧑" },
  "family-members": { label: "Family Members", icon: "👨‍👩‍👧" },
  "classroom-objects": { label: "Classroom Objects", icon: "🎒" },
  "commands": { label: "Commands", icon: "📢" },
  "colors-shapes": { label: "Colors & Shapes", icon: "🎨" },
  "how-many-much": { label: "How many? / How much?", icon: "❓" },
  "numbers-0-10": { label: "Numbers 0-10", icon: "🔢" },
  "food-and-drink": { label: "Foods and Drinks", icon: "🍔" },
  "animals-pets": { label: "Animals and Pets", icon: "🐶" },
  "numbers-0-20": { label: "Numbers 0-20", icon: "🔢" },
  "body": { label: "Parts of the Body", icon: "🧑‍🦱" },
  "toys": { label: "Toys", icon: "🧸" },
  "house": { label: "Parts of the House", icon: "🏠" },
};

// Infere la habilidad evaluada según palabras clave del título del juego
const inferirHabilidad = (titulo) => {
  const t = titulo.toLowerCase();
  if (t.includes("listen")) return "Comprensión Auditiva 🎧";
  if (t.includes("type") || t.includes("name") || t.includes("word") || t.includes("builder")) return "Escritura y Gramática ⌨️";
  if (t.includes("drag") || t.includes("match") || t.includes("choose") || t.includes("shape") || t.includes("paint") || t.includes("what")) return "Asociación Semántica y Visual 🧩";
  if (t.includes("conversation") || t.includes("talk")) return "Pragmática y Contexto 💬";
  if (t.includes("memory") || t.includes("flip")) return "Memoria y Retención 🧠";
  if (t.includes("guess") || t.includes("photo") || t.includes("desk")) return "Reconocimiento y Vocabulario 🔍";
  return "Evaluación General 📚";
};

// Genera un texto de análisis grueso sobre toda la unidad
const generarDiagnosticoGeneral = (porcentaje, nombre, unidad) => {
  if (porcentaje >= 90) return `${nombre} demostró un dominio sobresaliente en la unidad de ${unidad}. Es capaz de identificar y asociar el vocabulario correspondiente de forma autónoma y con altísima precisión.`;
  if (porcentaje >= 70) return `Buen desempeño general en la unidad de ${unidad}. ${nombre} comprende la mayoría de los conceptos tratados, aunque presentó dudas menores en momentos específicos de interacción.`;
  if (porcentaje >= 50) return `${nombre} se encuentra en proceso de asimilación del vocabulario de ${unidad}. Completó la unidad, pero las métricas sugieren que necesitó varios intentos y cometió errores frecuentes.`;
  return `Se detectaron dificultades marcadas en la unidad de ${unidad}. El puntaje de ${nombre} refleja frustración o incomprensión de las mecánicas y el idioma objetivo. Es altamente recomendable asignar sesiones de repaso guiado.`;
};

// Genera una observación específica del nivel
const generarObservacionNivel = (pct) => {
  if (pct === 100) return "Resolución perfecta. Comprensión absoluta y cero fallos en la ejecución de la actividad.";
  if (pct >= 80) return "Muy buen desempeño. Cometió un error aislado pero logró sobreponerse rápidamente.";
  if (pct >= 60) return "Comprensión funcional, pero presentó varias equivocaciones. Acertó tras perder vidas/intentos.";
  if (pct >= 40) return "Dificultad evidente. Logró superar el nivel pero con bajo índice de certeza en el primer intento.";
  return "Nivel crítico. El estudiante requirió el máximo de oportunidades y erró en casi toda la actividad. Se sugiere reevaluar este tema.";
};

export default function DetalleResultadoJuego() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const cargar = async () => {
      try {
        const ref = doc(db, "resultados_juegos", docId);
        const snap = await getDoc(ref);
        if (snap.exists()) setResultado({ docId: snap.id, ...snap.data() });
      } catch (e) {
        console.error("Error cargando detalle:", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [docId]);

  if (loading) return <LoadingScreen mensaje="Generando reporte..." emoji="📈" />;

  if (!resultado) return (
    <div className="rj-container" style={{ backgroundColor: '#131129', minHeight: '100vh' }}>
      <button className="rj-volver" onClick={() => navigate(-1)}>⬅ Volver</button>
      <div className="rj-empty"><p>No se encontró el boletín solicitado.</p></div>
    </div>
  );

  const info = UNIDADES[resultado.unidad] || { label: resultado.unidad, icon: "🎮" };
  const nivelPct = (n) => n.maxScore > 0 ? Math.round((n.score / n.maxScore) * 100) : 0;

  const pctGlobal = resultado.porcentaje;
  const diagnosticColorClass = pctGlobal >= 80 ? "excelente" : pctGlobal >= 60 ? "bueno" : pctGlobal >= 40 ? "regular" : "bajo";

  const descargarPDF = () => {
    try {
      const docPDF = new jsPDF();

      // Helper para quitar emojis (no se renderizan bien en jsPDF default)
      const limpiar = (texto) =>
        (texto || '')
          .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}]/gu, '')
          .replace(/\s+/g, ' ')
          .trim();

      const nombreCompleto = limpiar(`${resultado.nombre || ''} ${resultado.apellido || ''}`);
      const fechaHoy = new Date().toLocaleDateString('es-CO');
      const unidadLabel = limpiar(info.label);

      // Cabecera
      docPDF.setFillColor(102, 126, 234);
      docPDF.rect(0, 0, 210, 30, 'F');
      docPDF.setTextColor(255, 255, 255);
      docPDF.setFontSize(20);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Boletín Analítico', 105, 15, { align: 'center' });
      docPDF.setFontSize(11);
      docPDF.setFont('helvetica', 'normal');
      docPDF.text('Play & Learn — Aprendizaje de Inglés', 105, 23, { align: 'center' });

      // Datos del estudiante
      docPDF.setTextColor(40, 40, 40);
      docPDF.setFontSize(14);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text(`Estudiante: ${nombreCompleto}`, 14, 45);
      docPDF.setFontSize(11);
      docPDF.setFont('helvetica', 'normal');
      docPDF.text(`Grado: ${resultado.grado || '-'}`, 14, 53);
      docPDF.text(`Periodo: ${resultado.periodo || '-'}`, 70, 53);
      docPDF.text(`Unidad: ${unidadLabel}`, 120, 53);
      docPDF.text(`Fecha del reporte: ${fechaHoy}`, 14, 60);

      // Línea separadora
      docPDF.setDrawColor(200, 200, 200);
      docPDF.line(14, 65, 196, 65);

      // Puntaje global
      docPDF.setFontSize(13);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Puntaje Global', 14, 75);
      docPDF.setFontSize(24);
      docPDF.setTextColor(
        pctGlobal >= 80 ? 34 : pctGlobal >= 60 ? 234 : pctGlobal >= 40 ? 245 : 220,
        pctGlobal >= 80 ? 197 : pctGlobal >= 60 ? 179 : pctGlobal >= 40 ? 158 : 38,
        pctGlobal >= 80 ? 94 : pctGlobal >= 60 ? 8 : pctGlobal >= 40 ? 11 : 38
      );
      docPDF.text(`${pctGlobal}%`, 14, 87);
      docPDF.setFontSize(11);
      docPDF.setTextColor(80, 80, 80);
      docPDF.text(`${resultado.totalScore || 0} de ${resultado.maxTotal || 0} puntos posibles`, 50, 87);

      // Diagnóstico general
      docPDF.setTextColor(40, 40, 40);
      docPDF.setFontSize(13);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Diagnóstico General', 14, 100);
      docPDF.setFontSize(10);
      docPDF.setFont('helvetica', 'normal');
      const diagnosticoTexto = limpiar(generarDiagnosticoGeneral(pctGlobal, resultado.nombre, info.label));
      const diagnosticoLineas = docPDF.splitTextToSize(diagnosticoTexto, 180);
      docPDF.text(diagnosticoLineas, 14, 107);

      // Tabla de niveles
      const niveles = resultado.niveles || [];
      const filas = niveles.map((n, i) => {
        const pct = n.maxScore > 0 ? Math.round((n.score / n.maxScore) * 100) : 0;
        return [
          n.nivel ?? i + 1,
          limpiar(n.titulo ?? `Juego ${i + 1}`),
          limpiar(inferirHabilidad(n.titulo ?? '')),
          `${n.score}/${n.maxScore}`,
          `${pct}%`,
        ];
      });

      autoTable(docPDF, {
        startY: 107 + diagnosticoLineas.length * 5 + 10,
        head: [['Nivel', 'Juego', 'Habilidad Evaluada', 'Puntos', '%']],
        body: filas,
        theme: 'striped',
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center', fontStyle: 'bold' },
        },
      });

      // Pie de página
      const pageHeight = docPDF.internal.pageSize.height;
      docPDF.setFontSize(8);
      docPDF.setTextColor(150, 150, 150);
      docPDF.text(
        `Generado el ${fechaHoy} • Play & Learn`,
        105,
        pageHeight - 10,
        { align: 'center' }
      );

      // Descargar
      const nombreArchivo = `Boletin_${nombreCompleto.replace(/\s+/g, '_')}_${info.label.replace(/\s+/g, '_')}.pdf`;
      docPDF.save(nombreArchivo);
      toast.success('Boletín descargado correctamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('No se pudo generar el PDF. Intenta de nuevo.');
    }
  };

  return (
    <div className="rj-container" style={{ backgroundColor: '#131129', minHeight: '100vh' }}>
      <button className="rj-volver" onClick={() => navigate(-1)}>⬅ Volver al Panel</button>

      {/* Botón Descargar PDF */}
      <button
        onClick={descargarPDF}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'linear-gradient(135deg, #11998e, #38ef7d)',
          color: 'white',
          border: '3px solid white',
          padding: '10px 22px',
          borderRadius: '50px',
          fontSize: '0.95rem',
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 5px 0 #0e7561, 0 8px 16px rgba(0, 0, 0, 0.2)',
          zIndex: 10,
        }}
      >
        📥 Descargar PDF
      </button>

      {/* Encabezado Principal */}
      <div className="rj-det-header">
        <div className="rj-det-student-info">
          <h2>Boletín Analítico: <span>{resultado.nombre} {resultado.apellido}</span></h2>
          <p>Grado {resultado.grado || "—"} • Periodo {resultado.periodo}</p>
        </div>
        <div className="rj-det-unit-badge">
          <span className="rj-unit-icon">{info.icon}</span>
          <div className="rj-unit-text">
            <span>Unidad Evaluada</span>
            <strong>{info.label}</strong>
          </div>
        </div>
      </div>

      {/* Diagnóstico General */}
      <div className={`rj-diagnostico-card ${diagnosticColorClass}`}>
        <div className="rj-diag-header">
          <div className="rj-diag-score-circle">
            <span className="rj-circle-val">{pctGlobal}%</span>
            <span className="rj-circle-pts">{resultado.totalScore}/{resultado.maxTotal} pts</span>
          </div>
          <div className="rj-diag-resume">
            <h3>Diagnóstico General</h3>
            <p>{generarDiagnosticoGeneral(pctGlobal, resultado.nombre, info.label)}</p>
          </div>
        </div>
      </div>

      <h3 className="rj-section-title">📊 Desglose de Rendimiento por Etapas</h3>

      {/* Lista de Niveles Detallados */}
      <div className="rj-niveles-list">
        {(resultado.niveles || []).map((n, i) => {
          const pct = nivelPct(n);
          const barColorClass = pct >= 80 ? "exc" : pct >= 60 ? "bue" : pct >= 40 ? "reg" : "baj";
          const habilidad = inferirHabilidad(n.titulo ?? "");

          return (
            <div key={i} className="rj-nivel-card">
              <div className="rj-niv-head">
                <span className="rj-niv-number">Nivel {n.nivel ?? i + 1}</span>
                <h4 className="rj-niv-title">{n.titulo ?? `Juego ${i + 1}`}</h4>
                <div className="rj-niv-points">
                  <strong>{n.score}</strong> / {n.maxScore} aciertos
                </div>
              </div>

              <div className="rj-niv-habilidad">Habilidad Evaluada: {habilidad}</div>

              <div className="rj-niv-bar-container">
                <div className="rj-bar-bg">
                  <div className={`rj-bar-fill ${barColorClass}`} style={{ width: `${pct}%` }}></div>
                </div>
                <span className={`rj-bar-pct ${barColorClass}`}>{pct}%</span>
              </div>

              <div className="rj-niv-observacion">
                <strong>📝 Observación:</strong> {generarObservacionNivel(pct)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
