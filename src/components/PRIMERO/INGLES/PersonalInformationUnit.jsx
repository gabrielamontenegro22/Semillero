import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import WordBuilder from "./PERSONAL-INFORMATION/WordBuilder";
import FlipCards from "./PERSONAL-INFORMATION/FlipCards";
import IDCardBuilder from "./PERSONAL-INFORMATION/IDCardBuilder";
import "./PersonalInformationUnit.css";
import confetti from "canvas-confetti";
import { guardarResultadoUnidad } from "../../../hooks/useGuardarResultado";
import { WorldBg, SPARKLES } from "../../Shared/SharedBackground";

const LEVELS = [
  { number: 1, title: "Listening", description: "Escucha la pregunta y elige la respuesta correcta", icon: "🎧", maxScore: 4 },
  { number: 2, title: "Reading", description: "Voltea las tarjetas y elige la respuesta correcta", icon: "🃏", maxScore: 6 },
  { number: 3, title: "Writing", description: "Crea tu propia tarjeta de identificación en inglés", icon: "🪪", maxScore: 3 },
];

export default function PersonalInformationUnit() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("intro");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scores, setScores] = useState([]);
  const [saving, setSaving] = useState(false);
  const finishedRef = React.useRef(false);
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
      await guardarResultadoUnidad({ unidad: "personal-information", periodo: 1, area: "ingles", niveles, totalScore, maxTotal });
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

  /* ── INTRO ──────────────────────────────────────────────── */
  if (phase === "intro") return (
    <div className="piu-screen">
      <WorldBg className="piu-screen-bg" />
      {SPARKLES.map((s, i) => (
        <span key={i} className="piu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="piu-card">
        <div className="piu-unit-badge">Periodo 1 · Inglés 1°</div>
        <div className="piu-unit-emoji">🙋</div>
        <h1 className="piu-unit-title">Personal Information</h1>
        <p className="piu-unit-desc">Aprende a presentarte en inglés: tu nombre, edad y de dónde eres.</p>
        <div className="piu-levels-preview">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="piu-level-row">
              <div className="piu-level-icon">{lvl.icon}</div>
              <div>
                <div className="piu-level-name">Level {lvl.number} — {lvl.title}</div>
                <div className="piu-level-desc">{lvl.description}</div>
              </div>
              <div className="piu-level-lock">{i === 0 ? "🔓" : "🔒"}</div>
            </div>
          ))}
        </div>
        <button className="piu-btn-primary" onClick={() => setPhase("level")}>Start Unit 🚀</button>
        <button className="piu-btn-secondary" onClick={() => navigate(-1)}>← Volver</button>
      </div>
    </div>
  );

  /* ── LEVEL (gameplay) ───────────────────────────────────── */
  if (phase === "level") return (
    <div className="piu-level-wrapper">
      <div className="piu-level-indicator">
        {LEVELS.map((lvl, i) => (
          <div key={i} className={`piu-level-dot ${i < currentLevel ? "done" : i === currentLevel ? "active" : "pending"}`}>
            {i < currentLevel ? "✓" : lvl.number}
          </div>
        ))}
      </div>
      {currentLevel === 0 && <WordBuilder onFinish={handleLevelFinish} />}
      {currentLevel === 1 && <FlipCards onFinish={handleLevelFinish} />}
      {currentLevel === 2 && <IDCardBuilder onFinish={handleLevelFinish} />}
    </div>
  );

  /* ── TRANSITION ─────────────────────────────────────────── */
  if (phase === "transition") {
    const next = LEVELS[currentLevel + 1];
    const prev = LEVELS[currentLevel];
    const lastScore = scores[scores.length - 1];
    if (!next) { handleSaveAndFinish(scores); return null; }
    return (
      <div className="piu-screen">
        <WorldBg className="piu-screen-bg" />
        {SPARKLES.map((s, i) => (
          <span key={i} className="piu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
        ))}
        <div className="piu-card piu-transition-card">
          <div className="piu-transition-check">✅</div>
          <h2 className="piu-h2">Level {prev.number} Complete!</h2>
          <p className="piu-transition-score">Obtuviste <strong>{lastScore} / {prev.maxScore}</strong> correctas</p>
          <div className="piu-divider" />
          <div className="piu-next-preview">
            <span className="piu-next-label">A continuación</span>
            <div className="piu-next-card">
              <span className="piu-next-icon">{next.icon}</span>
              <div>
                <div className="piu-next-title">Level {next.number} — {next.title}</div>
                <div className="piu-next-desc">{next.description}</div>
              </div>
            </div>
          </div>
          <button className="piu-btn-primary" onClick={goToNextLevel}>Continuar al Level {next.number} →</button>
        </div>
      </div>
    );
  }

  /* ── SAVING ─────────────────────────────────────────────── */
  if (saving) return (
    <div className="piu-screen">
      <WorldBg className="piu-screen-bg" />
      <div className="piu-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
        <p style={{ color: "#2d3436", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}>Guardando resultados...</p>
      </div>
    </div>
  );

  /* ── SUMMARY ────────────────────────────────────────────── */
  if (phase === "summary") return (
    <div className="piu-screen">
      <WorldBg className="piu-screen-bg" />
      {SPARKLES.map((s, i) => (
        <span key={i} className="piu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="piu-card piu-summary-card">
        <div className="piu-summary-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
        <div className="piu-unit-badge">Personal Information · Completo</div>
        <h2 className="piu-summary-title">¡Unidad terminada!</h2>
        <div className="piu-summary-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`piu-star ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="piu-summary-levels">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="piu-summary-row">
              <span className="piu-summary-icon">{lvl.icon}</span>
              <span className="piu-summary-lname">Level {lvl.number} — {lvl.title}</span>
              <span className="piu-summary-lscore">{scores[i] ?? 0} / {lvl.maxScore}</span>
            </div>
          ))}
        </div>
        <div className="piu-summary-total">
          <span>Total</span>
          <span className="piu-total-pts">{totalScore} / {maxTotal}</span>
        </div>
        <div className="piu-saved-badge">✅ Resultado guardado</div>
        <button className="piu-btn-primary" onClick={() => navigate(-1)}>📚 Volver a temas</button>
      </div>
    </div>
  );

  return null;
}