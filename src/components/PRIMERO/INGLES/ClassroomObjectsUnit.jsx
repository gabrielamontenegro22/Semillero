import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackpackDrag from "./CLASSROOM-OBJECTS/BackpackDrag";
import WhatIsOnTheDesk from "./CLASSROOM-OBJECTS/WhatIsOnTheDesk"; // ✅ NEW
import ThisOrThat from "./CLASSROOM-OBJECTS/Thisorthat";       // ✅ NEW
import "./Classroomobjectsunit.css";
import confetti from "canvas-confetti";
import { guardarResultadoUnidad } from "../../../hooks/useGuardarResultado";
import { WorldBg, SPARKLES } from "../../Shared/SharedBackground";

const LEVELS = [
  { number: 1, title: "Listening", description: "Arrastra los objetos correctos hacia la mochila", icon: "🎒", maxScore: 5 },
  { number: 2, title: "Reading", description: "Lee la palabra y encuentra el objeto correcto", icon: "👁️", maxScore: 5 },
  { number: 3, title: "Writing", description: "Mira la imagen y escribe el nombre del objeto", icon: "✏️", maxScore: 6 },
];

export default function ClassroomObjectsUnit() {
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
      await guardarResultadoUnidad({ unidad: "classroom-objects", periodo: 2, area: "ingles", niveles, totalScore, maxTotal });
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
    setCurrentLevel((l) => l + 1);
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
    <div className="cou-screen">
      <WorldBg className="cou-screen-bg" />
      {SPARKLES.map((s, i) => (
        <span key={i} className="cou-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="cou-card">
        <div className="cou-unit-badge">Periodo 2 · Inglés 1°</div>
        <div className="cou-unit-emoji">📐</div>
        <h1 className="cou-unit-title">Classroom Objects</h1>
        <p className="cou-unit-desc">Aprende los objetos del salón de clases en inglés.</p>
        <div className="cou-levels-preview">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="cou-level-row">
              <div className="cou-level-icon">{lvl.icon}</div>
              <div>
                <div className="cou-level-name">Level {lvl.number} — {lvl.title}</div>
                <div className="cou-level-desc">{lvl.description}</div>
              </div>
              <div className="cou-level-lock">{i === 0 ? "🔓" : "🔒"}</div>
            </div>
          ))}
        </div>
        <button className="cou-btn-primary" onClick={() => setPhase("level")}>Start Unit 🚀</button>
        <button className="cou-btn-secondary" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>
    </div>
  );

  /* ── LEVEL ── */
  if (phase === "level") return (
    <div className="cou-level-wrapper">
      <div className="cou-level-indicator">
        {LEVELS.map((lvl, i) => (
          <div key={i} className={`cou-level-dot ${i < currentLevel ? "done" : i === currentLevel ? "active" : "pending"}`}>
            {i < currentLevel ? "✓" : lvl.number}
          </div>
        ))}
      </div>
      {currentLevel === 0 && <BackpackDrag onFinish={handleLevelFinish} />}
      {currentLevel === 1 && <WhatIsOnTheDesk onFinish={handleLevelFinish} />}
      {currentLevel === 2 && <ThisOrThat onFinish={handleLevelFinish} />}
    </div>
  );

  /* ── TRANSITION ── */
  if (phase === "transition") {
    const next = LEVELS[currentLevel + 1];
    const prev = LEVELS[currentLevel];
    const lastScore = scores[scores.length - 1];
    if (!next) { handleSaveAndFinish(scores); return null; }
    return (
      <div className="cou-screen">
        <WorldBg className="cou-screen-bg" />
        {SPARKLES.map((s, i) => (
          <span key={i} className="cou-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
        ))}
        <div className="cou-card cou-transition-card">
          <div className="cou-transition-check">✅</div>
          <h2 className="cou-h2">Level {prev.number} Complete!</h2>
          <p className="cou-transition-score">Obtuviste <strong>{lastScore} / {prev.maxScore}</strong> correctas</p>
          <div className="cou-divider" />
          <div className="cou-next-preview">
            <span className="cou-next-label">A continuación</span>
            <div className="cou-next-card">
              <span className="cou-next-icon">{next.icon}</span>
              <div>
                <div className="cou-next-title">Level {next.number} — {next.title}</div>
                <div className="cou-next-desc">{next.description}</div>
              </div>
            </div>
          </div>
          <button className="cou-btn-primary" onClick={goToNextLevel}>Continuar al Level {next.number} →</button>
        </div>
      </div>
    );
  }

  /* ── SAVING ── */
  if (saving) return (
    <div className="cou-screen">
      <WorldBg className="cou-screen-bg" />
      <div className="cou-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
        <p style={{ color: "#2d3436", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}>Guardando resultados...</p>
      </div>
    </div>
  );

  /* ── SUMMARY ── */
  if (phase === "summary") return (
    <div className="cou-screen">
      <WorldBg className="cou-screen-bg" />
      {SPARKLES.map((s, i) => (
        <span key={i} className="cou-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="cou-card cou-summary-card">
        <div className="cou-summary-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
        <div className="cou-unit-badge">Classroom Objects · Completo</div>
        <h2 className="cou-summary-title">¡Unidad terminada!</h2>
        <div className="cou-summary-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`cou-star ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="cou-summary-levels">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="cou-summary-row">
              <span className="cou-summary-icon">{lvl.icon}</span>
              <span className="cou-summary-lname">Level {lvl.number} — {lvl.title}</span>
              <span className="cou-summary-lscore">{scores[i] ?? 0} / {lvl.maxScore}</span>
            </div>
          ))}
        </div>
        <div className="cou-summary-total">
          <span>Total</span>
          <span className="cou-total-pts">{totalScore} / {maxTotal}</span>
        </div>
        <div className="cou-saved-badge">✅ Resultado guardado</div>
        <button className="cou-btn-primary" onClick={() => navigate(-1)}>📚 Volver a temas</button>
      </div>
    </div>
  );

  return null;
}