import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import WhatShape from "./COLORS-SHAPES/Whatshape";
import PaintIt from "./COLORS-SHAPES/Paintit";
import NameIt from "./COLORS-SHAPES/Nameit";  // ← nueva


import "./CommandsUnit.css"; // reutilizamos los mismos estilos del hub
import confetti from "canvas-confetti";
import { guardarResultadoUnidad } from "../../../hooks/useGuardarResultado";
import { WorldBg, SPARKLES } from "../../Shared/SharedBackground";

const LEVELS = [
  { number: 1, title: "Listening", description: "Escucha la figura y elige el nombre correcto", icon: "🎧", maxScore: 6 },
  {
    number: 2, title: "Reading", description: "Identifica el color y la forma de la imagen", icon: "👁️", maxScore: 12
  },
  { number: 3, title: "Writing", description: "Escribe el color y la forma de la imagen", icon: "✏️", maxScore: 6 },
];

function ComingSoon({ icon, title, onFinish }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0015" }}>
      <div style={{ textAlign: "center", color: "#fff", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Coming Soon</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>{title}</p>
        <button onClick={() => onFinish(0)} style={{ padding: "14px 32px", borderRadius: 50, border: "none", background: "#F97316", color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>
          Back ←
        </button>
      </div>
    </div>
  );
}

export default function ColorsShapesUnit() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("intro");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scores, setScores] = useState([]);
  const [saving, setSaving] = useState(false);
  const finishedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; confetti.reset(); };
  }, []);

  const handleLevelFinish = (score) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const newScores = [...scores, score];
    setScores(newScores);
    if (currentLevel < LEVELS.length - 1) {
      setPhase("transition");
    } else {
      handleSaveAndFinish(newScores);
    }
  };

  const handleSaveAndFinish = async (finalScores) => {
    setSaving(true);
    try {
      const niveles = LEVELS.map((lvl, i) => ({ nivel: lvl.number, titulo: lvl.title, score: finalScores[i] ?? 0, maxScore: lvl.maxScore }));
      const totalScore = finalScores.reduce((a, b) => a + b, 0);
      const maxTotal = LEVELS.reduce((a, l) => a + l.maxScore, 0);
      await guardarResultadoUnidad({ unidad: "colors-shapes", periodo: 2, area: "ingles", niveles, totalScore, maxTotal });
    } catch (e) {
      console.error("Error guardando:", e);
    } finally {
      setSaving(false);
      launchConfetti();
      setPhase("summary");
    }
  };

  const goToNextLevel = () => {
    finishedRef.current = false;
    setCurrentLevel(l => l + 1);
    setPhase("level");
  };

  const launchConfetti = () => {
    const end = Date.now() + 3000;
    const frame = () => {
      if (!mountedRef.current) return;
      confetti({ particleCount: 12, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 12, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxTotal = LEVELS.reduce((a, l) => a + l.maxScore, 0);
  const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;
  const unitStars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;

  /* ── INTRO ── */
  if (phase === "intro") return (
    <div className="cu-screen">
      <WorldBg className="cu-screen-bg" />
      {SPARKLES.map((s, i) => (
        <span key={i} className="cu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="cu-card">
        <div className="cu-unit-badge">Periodo 2 · Inglés 1°</div>
        <div className="cu-unit-emoji">🎨</div>
        <h1 className="cu-unit-title">Colors & Shapes</h1>
        <p className="cu-unit-desc">Aprende los colores y las figuras geométricas en inglés.</p>
        <div className="cu-levels-preview">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="cu-level-row">
              <div className="cu-level-icon">{lvl.icon}</div>
              <div>
                <div className="cu-level-name">Level {lvl.number} — {lvl.title}</div>
                <div className="cu-level-desc">{lvl.description}</div>
              </div>
              <div className="cu-level-lock">{i === 0 ? "🔓" : "🔒"}</div>
            </div>
          ))}
        </div>
        <button className="cu-btn-primary" onClick={() => setPhase("level")}>Start Unit 🚀</button>
        <button className="cu-btn-secondary" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>
    </div>
  );

  /* ── LEVEL ── */
  if (phase === "level") return (
    <div className="cu-level-wrapper">
      <div className="cu-level-indicator">
        {LEVELS.map((lvl, i) => (
          <div key={i} className={`cu-level-dot ${i < currentLevel ? "done" : i === currentLevel ? "active" : "pending"}`}>
            {i < currentLevel ? "✓" : lvl.number}
          </div>
        ))}
      </div>
      {currentLevel === 0 && <WhatShape onFinish={handleLevelFinish} />}
      {currentLevel === 1 && <PaintIt onFinish={handleLevelFinish} />}
      {currentLevel === 2 && <NameIt onFinish={handleLevelFinish} />}
    </div>
  );

  /* ── TRANSITION ── */
  if (phase === "transition") {
    const next = LEVELS[currentLevel + 1];
    const prev = LEVELS[currentLevel];
    const lastScore = scores[scores.length - 1];
    if (!next) { handleSaveAndFinish(scores); return null; }
    return (
      <div className="cu-screen">
        <WorldBg className="cu-screen-bg" />
        {SPARKLES.map((s, i) => (
          <span key={i} className="cu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
        ))}
        <div className="cu-card cu-transition-card">
          <div className="cu-transition-check">✅</div>
          <h2 className="cu-h2">Level {prev.number} Complete!</h2>
          <p className="cu-transition-score">Obtuviste <strong>{lastScore} / {prev.maxScore}</strong> correctas</p>
          <div className="cu-divider" />
          <div className="cu-next-preview">
            <span className="cu-next-label">A continuación</span>
            <div className="cu-next-card">
              <span className="cu-next-icon">{next.icon}</span>
              <div>
                <div className="cu-next-title">Level {next.number} — {next.title}</div>
                <div className="cu-next-desc">{next.description}</div>
              </div>
            </div>
          </div>
          <button className="cu-btn-primary" onClick={goToNextLevel}>Continuar al Level {next.number} →</button>
        </div>
      </div>
    );
  }

  /* ── SAVING ── */
  if (saving) return (
    <div className="cu-screen">
      <WorldBg className="cu-screen-bg" />
      <div className="cu-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
        <p style={{ color: "#2d3436", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}>Guardando resultados...</p>
      </div>
    </div>
  );

  /* ── SUMMARY ── */
  if (phase === "summary") return (
    <div className="cu-screen">
      <WorldBg className="cu-screen-bg" />
      {SPARKLES.map((s, i) => (
        <span key={i} className="cu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="cu-card cu-summary-card">
        <div className="cu-summary-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎨" : "🔷"}</div>
        <div className="cu-unit-badge">Colors & Shapes · Completo</div>
        <h2 className="cu-summary-title">¡Unidad terminada!</h2>
        <div className="cu-summary-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`cu-star ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="cu-summary-levels">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="cu-summary-row">
              <span className="cu-summary-icon">{lvl.icon}</span>
              <span className="cu-summary-lname">Level {lvl.number} — {lvl.title}</span>
              <span className="cu-summary-lscore">{scores[i] ?? 0} / {lvl.maxScore}</span>
            </div>
          ))}
        </div>
        <div className="cu-summary-total">
          <span>Total</span>
          <span className="cu-total-pts">{totalScore} / {maxTotal}</span>
        </div>
        <div className="cu-saved-badge">✅ Resultado guardado</div>
        <button className="cu-btn-primary" onClick={() => navigate(-1)}>📚 Volver a temas</button>
      </div>
    </div>
  );

  return null;
}