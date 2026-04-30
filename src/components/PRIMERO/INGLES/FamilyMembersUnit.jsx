import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FamilyDragGame from "./FAMILY-MEMBERS/Familydraggame";
import FamilyListenChoose from "./FAMILY-MEMBERS/FamilyListenChoose";
import FamilyPhoto from "./FAMILY-MEMBERS/Familyphoto";
import "./FamilyMembersUnit.css";
import confetti from "canvas-confetti";
import { guardarResultadoUnidad } from "../../../hooks/useGuardarResultado";
import { WorldBg, SPARKLES } from "../../Shared/SharedBackground";

const LEVELS = [
  { number: 1, title: "Listening", description: "Escucha el audio y elige al miembro correcto", icon: "🎧", maxScore: 6 },
  { number: 2, title: "Reading", description: "Identifica quién está cerca (This) y quién está lejos (That)", icon: "📖", maxScore: 6 },
  { number: 3, title: "Writing", description: "Escribe el nombre del miembro de la familia", icon: "✏️", maxScore: 6 },
];

export default function FamilyMembersUnit() {
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
      await guardarResultadoUnidad({ unidad: "family-members", periodo: 1, area: "ingles", niveles, totalScore, maxTotal });
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
    <div className="gu-screen">
      <WorldBg />
      {SPARKLES.map((s, i) => (
        <span key={i} className="gu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="gu-card">
        <div className="gu-unit-badge">Periodo 1 · Inglés 1°</div>
        <div className="gu-unit-emoji">👨‍👩‍👧‍👦</div>
        <h1 className="gu-unit-title">Family Members</h1>
        <p className="gu-unit-desc">Aprende a presentar tu familia y usar This is / That is.</p>
        <div className="gu-levels-preview">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="gu-level-row">
              <div className="gu-level-icon">{lvl.icon}</div>
              <div>
                <div className="gu-level-name">Level {lvl.number} — {lvl.title}</div>
                <div className="gu-level-desc">{lvl.description}</div>
              </div>
              <div className="gu-level-lock">{i === 0 ? "🔓" : "🔒"}</div>
            </div>
          ))}
        </div>
        <button className="gu-btn-primary" onClick={() => setPhase("level")}>Start Unit 🚀</button>
        <button className="gu-btn-secondary" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>
    </div>
  );

  /* ── LEVEL ──────────────────────────────────────────────── */
  if (phase === "level") return (
    <div className="gu-level-wrapper">
      <div className="gu-level-indicator">
        {LEVELS.map((lvl, i) => (
          <div key={i} className={`gu-level-dot ${i < currentLevel ? "done" : i === currentLevel ? "active" : "pending"}`}>
            {i < currentLevel ? "✓" : lvl.number}
          </div>
        ))}
      </div>
      {currentLevel === 0 && <FamilyListenChoose onFinish={handleLevelFinish} />}
      {currentLevel === 1 && <FamilyPhoto onFinish={handleLevelFinish} />}
      {currentLevel === 2 && <FamilyDragGame onFinish={handleLevelFinish} />}
    </div>
  );

  /* ── TRANSITION ─────────────────────────────────────────── */
  if (phase === "transition") {
    const next = LEVELS[currentLevel + 1];
    const prev = LEVELS[currentLevel];
    const lastScore = scores[scores.length - 1];
    if (!next) { handleSaveAndFinish(scores); return null; }
    return (
      <div className="gu-screen">
        <WorldBg />
        {SPARKLES.map((s, i) => (
          <span key={i} className="gu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
        ))}
        <div className="gu-card gu-transition-card">
          <div className="gu-transition-check">✅</div>
          <h2 className="gu-h2">Level {prev.number} Complete!</h2>
          <p className="gu-transition-score">Obtuviste <strong>{lastScore} / {prev.maxScore}</strong> correctas</p>
          <div className="gu-divider" />
          <div className="gu-next-preview">
            <span className="gu-next-label">A continuación</span>
            <div className="gu-next-card">
              <span className="gu-next-icon">{next.icon}</span>
              <div>
                <div className="gu-next-title">Level {next.number} — {next.title}</div>
                <div className="gu-next-desc">{next.description}</div>
              </div>
            </div>
          </div>
          <button className="gu-btn-primary" onClick={goToNextLevel}>Continuar al Level {next.number} →</button>
        </div>
      </div>
    );
  }

  /* ── SAVING ─────────────────────────────────────────────── */
  if (saving) return (
    <div className="gu-screen">
      <WorldBg />
      <div className="gu-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
        <p style={{ color: "#2d3436", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}>Guardando resultados...</p>
      </div>
    </div>
  );

  /* ── SUMMARY ────────────────────────────────────────────── */
  if (phase === "summary") return (
    <div className="gu-screen">
      <WorldBg />
      {SPARKLES.map((s, i) => (
        <span key={i} className="gu-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>{s.emoji}</span>
      ))}
      <div className="gu-card gu-summary-card">
        <div className="gu-summary-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
        <div className="gu-unit-badge">Family Members · Completo</div>
        <h2 className="gu-summary-title">¡Unidad terminada!</h2>
        <div className="gu-summary-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`gu-star ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="gu-summary-levels">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="gu-summary-row">
              <span className="gu-summary-icon">{lvl.icon}</span>
              <span className="gu-summary-lname">Level {lvl.number} — {lvl.title}</span>
              <span className="gu-summary-lscore">{scores[i] ?? 0} / {lvl.maxScore}</span>
            </div>
          ))}
        </div>
        <div className="gu-summary-total">
          <span>Total</span>
          <span className="gu-total-pts">{totalScore} / {maxTotal}</span>
        </div>
        <div className="gu-saved-badge">✅ Resultado guardado</div>
        <button className="gu-btn-primary" onClick={() => navigate(-1)}>📚 Volver a temas</button>
      </div>
    </div>
  );

  return null;
}