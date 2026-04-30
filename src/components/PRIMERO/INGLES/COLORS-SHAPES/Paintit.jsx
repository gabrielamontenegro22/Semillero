import React, { useState, useEffect, useRef } from "react";
import "./Paintit.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

import painterImg from "../../../../assets/pintorlevel2.png";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const audioCache = {
  correct: new Audio(correctoSound),
  wrong: new Audio(incorrectoSound),
};
[audioCache.correct, audioCache.wrong].forEach(a => { a.preload = "auto"; });

const COLORS = {
  red: { hex: "#EF4444", label: "red", dark: "#991B1B" },
  blue: { hex: "#3B82F6", label: "blue", dark: "#1D4ED8" },
  green: { hex: "#22C55E", label: "green", dark: "#15803D" },
  yellow: { hex: "#EAB308", label: "yellow", dark: "#A16207" },
  orange: { hex: "#F97316", label: "orange", dark: "#C2410C" },
  purple: { hex: "#A855F7", label: "purple", dark: "#7E22CE" },
  pink: { hex: "#EC4899", label: "pink", dark: "#BE185D" },
  brown: { hex: "#92400E", label: "brown", dark: "#451A03" },
};

const SHAPES = ["circle", "square", "triangle", "rectangle"];

const SHAPE_BTN_COLORS = {
  circle: { bg: "#3B82F6", dark: "#1D4ED8" },
  square: { bg: "#EF4444", dark: "#991B1B" },
  triangle: { bg: "#22C55E", dark: "#15803D" },
  rectangle: { bg: "#F97316", dark: "#C2410C" },
};

const ShapeSVG = React.memo(function ShapeSVG({ shape, color, size = 190 }) {
  const fill = COLORS[color].hex;
  const stroke = COLORS[color].dark;
  const s = size;
  const common = { fill, stroke, strokeWidth: 5 };
  if (shape === "circle") return <svg width={s} height={s} viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" {...common} /></svg>;
  if (shape === "square") return <svg width={s} height={s} viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="8" {...common} /></svg>;
  if (shape === "triangle") return <svg width={s} height={s} viewBox="0 0 100 100"><polygon points="50,8 94,92 6,92" {...common} /></svg>;
  if (shape === "rectangle") return <svg width={s} height={s * 0.65} viewBox="0 0 140 90"><rect x="6" y="6" width="128" height="78" rx="8" {...common} /></svg>;
  return null;
});

function genCombos() {
  const combos = [];
  for (const color of Object.keys(COLORS))
    for (const shape of SHAPES)
      combos.push({ color, shape, id: `${color}-${shape}` });
  return combos;
}
const ALL_COMBOS = genCombos();
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function genRounds() {
  const guaranteed = shuffle(SHAPES).map(shape => {
    const color = shuffle(Object.keys(COLORS))[0];
    return { color, shape, id: `${color}-${shape}-g` };
  });
  const extras = shuffle(ALL_COMBOS)
    .filter(c => !guaranteed.find(g => g.shape === c.shape && g.color === c.color))
    .slice(0, 2);
  return shuffle([...guaranteed, ...extras]);
}

const MAX_LIVES = 2;
const PTS_OK = 10;

const PAINT_BLOBS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: Object.values(COLORS)[i % Object.keys(COLORS).length].hex,
  top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
  size: 60 + Math.random() * 140,
  dur: `${4 + Math.random() * 6}s`, del: `${Math.random() * 5}s`,
}));

function FP({ value }) {
  return <div className={`pi-fp pi-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

export default function PaintIt({ onFinish }) {
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [step, setStep] = useState("color");
  const [points, setPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [wrongColor, setWrongColor] = useState(null);
  const [wrongShape, setWrongShape] = useState(null);
  const [revealColor, setRevealColor] = useState(false);   // ✅ NUEVO: reveal cuando pierde vidas en color
  const [revealShape, setRevealShape] = useState(false);   // ✅ NUEVO: reveal cuando pierde vidas en shape

  const mountedRef = useRef(true);
  const floaterId = useRef(0);
  const roundsRef = useRef([]);
  const idxRef = useRef(0);
  const stepRef = useRef("color");
  const streakRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const attRef = useRef({});

  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  useEffect(() => {
    mountedRef.current = true;
    const picked = genRounds();
    roundsRef.current = picked;
    attRef.current = {};
    setRounds(picked);
    initRound(picked, 0);
    return () => { mountedRef.current = false; confetti.reset(); };
  }, []);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [finished]);

  useEffect(() => {
    if (!finished) return;
    const end = Date.now() + 2800;
    const f = () => {
      if (!mountedRef.current) return;
      confetti({ particleCount: 14, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 14, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(f);
    }; f();
  }, [finished]);

  const playAud = (a) => {
    try {
      const clone = a.cloneNode(true);
      clone.volume = 0.8;
      clone.play().catch(() => { });
    } catch (_) { }
  };

  const initRound = (all, i) => {
    if (!mountedRef.current || !all[i]) return;
    stepRef.current = "color";
    setStep("color");
    setBlocked(false);
    setCelebrating(false);
    setWrongColor(null);
    setWrongShape(null);
    setRevealColor(false);   // ✅ Reset
    setRevealShape(false);   // ✅ Reset
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
  };

  const goToShapeStep = () => {
    if (!mountedRef.current) return;
    stepRef.current = "shape";
    setStep("shape");
    setWrongColor(null);
    setRevealColor(false);   // ✅ Reset al pasar al shape
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setBlocked(false);
  };

  const addFP = (v) => {
    const id = floaterId.current++;
    setFloaters(f => [...f, { v, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };

  // ✅ Sin penalización -3, solo rompe streak y suma fallo
  const loseLife = (i, currentStep) => {
    streakRef.current = 0;
    setStreak(0);
    const key = `${i}-${currentStep}`;
    attRef.current = { ...attRef.current, [key]: (attRef.current[key] || 0) + 1 };
    const newLives = livesRef.current - 1;
    livesRef.current = newLives;
    setLives(newLives);
    return newLives;
  };

  const handleColorPick = (color) => {
    if (blocked || stepRef.current !== "color") return;
    const round = roundsRef.current[idxRef.current];
    if (color === round.color) {
      // ✅ Acertó color
      playAud(audioCache.correct);
      setAttempts(a => a + 1);
      setCorrectCount(c => c + 1);
      addFP(5);
      setPoints(p => p + 5);
      setBlocked(true);
      setTimeout(() => goToShapeStep(), 500);
    } else {
      setWrongColor(color);
      playAud(audioCache.wrong);
      setBlocked(true);
      const newLives = loseLife(idxRef.current, "color");
      setTimeout(() => {
        if (!mountedRef.current) return;
        if (newLives <= 0) {
          // ✅ FIX: Reveal verde del color correcto antes de pasar al shape
          setAttempts(a => a + 1);
          setWrongColor(null);
          setRevealColor(true);
          setTimeout(() => {
            if (!mountedRef.current) return;
            goToShapeStep();
          }, 1500);
        } else {
          setWrongColor(null);
          setBlocked(false);
        }
      }, 1000);
    }
  };

  const handleShapePick = (shape) => {
    if (blocked || stepRef.current !== "shape") return;
    const i = idxRef.current;
    const round = roundsRef.current[i];
    if (shape === round.shape) {
      // ✅ Acertó figura
      setCelebrating(true);
      setBlocked(true);
      playAud(audioCache.correct);
      setAttempts(a => a + 1);
      setCorrectCount(c => c + 1);
      const colorFails = attRef.current[`${i}-color`] || 0;
      const shapeFails = attRef.current[`${i}-shape`] || 0;
      const perfect = colorFails === 0 && shapeFails === 0;
      const ns = perfect ? streakRef.current + 1 : 0;
      streakRef.current = ns;
      setStreak(ns);
      setBestStreak(b => Math.max(b, ns));
      const bonus = perfect ? (ns >= 3 ? 15 : ns >= 2 ? 12 : PTS_OK) : 5;
      setPoints(p => p + bonus);
      addFP(bonus);
      confetti({
        particleCount: 80, spread: 90, origin: { y: 0.5 },
        colors: [COLORS[round.color].hex, "#FFD700", "#fff", "#FF6B9D"],
      });
      setTimeout(() => advanceTo(i + 1), 1500);
    } else {
      setWrongShape(shape);
      playAud(audioCache.wrong);
      setBlocked(true);
      const newLives = loseLife(i, "shape");
      setTimeout(() => {
        if (!mountedRef.current) return;
        setWrongShape(null);
        if (newLives <= 0) {
          // ✅ FIX: Reveal verde del shape correcto antes de avanzar
          setAttempts(a => a + 1);
          setRevealShape(true);
          setTimeout(() => {
            if (!mountedRef.current) return;
            advanceTo(i + 1);
          }, 1500);
        } else {
          setBlocked(false);
        }
      }, 1100);
    }
  };

  const advanceTo = (next) => {
    if (!mountedRef.current) return;
    if (next >= roundsRef.current.length) { setFinished(true); return; }
    setCurrentIdx(next);
    idxRef.current = next;
    initRound(roundsRef.current, next);
  };

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
  const totalQ = rounds.length * 2;
  const isPerfect = Object.values(attRef.current).every(f => f === 0);
  const stars = correctCount === totalQ && isPerfect ? 3 : correctCount >= totalQ - 2 ? 2 : 1;

  if (finished) return (
    <div className="pi-result-root">
      <GameBackground color="orange" />
      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
      <div className="pi-result-card">
        <div className="pi-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🎨" : "🖌️"}</div>
        <div className="pi-result-badge">Colors & Shapes · Level 2 🖌️</div>
        <h2 className="pi-result-title">¡Nivel terminado!</h2>
        <div className="pi-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`pi-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="pi-result-stats">
          <div className="pi-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{totalQ}</strong></div>
          <div className="pi-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="pi-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="pi-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
        </div>
        {onFinish && (
          <button className="pi-result-btn" onClick={() => onFinish(correctCount)}>Continue 🎨</button>
        )}
      </div>
    </div>
  );

  const round = rounds[currentIdx];
  if (!round) return null;

  const bubbleText = celebrating
    ? `✨ ${round.color.toUpperCase()} ${round.shape.toUpperCase()}!`
    : revealColor
      ? `It was ${round.color.toUpperCase()}! 🎨`
      : revealShape
        ? `It was a ${round.shape.toUpperCase()}! 🔷`
        : step === "color"
          ? "What color is it? 🎨"
          : "What shape is it? 🔷";

  const bubbleClass = celebrating || revealColor || revealShape
    ? "correct"
    : wrongColor || wrongShape
      ? "wrong"
      : step === "shape"
        ? "active"
        : "";

  return (
    <>
      <div className="pi-header-bar">
        <div className="pi-header-left">
          <span className="pi-header-badge">Level 2</span>
          <span className="pi-header-title">👁️ Reading</span>
        </div>
        <div className="pi-header-right">
          <div className="pi-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="pi-header-pill pi-streak-pill">🔥 {streak}x</div>}
          <div className="pi-header-pill">🎯 {attempts}/{totalQ}</div>
          <div className="pi-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

      <div className="pi-root">
        {PAINT_BLOBS.map(b => (
          <div key={b.id} className="pi-blob"
            style={{
              top: b.top, left: b.left, width: b.size, height: b.size,
              background: b.color, "--bdur": b.dur, "--bdel": b.del
            }} />
        ))}

        <div className="pi-progress-wrap">
          <div className="pi-progress-track">
            <div className="pi-progress-fill" style={{ width: `${progress}%` }} />
            <div className="pi-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`pi-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="pi-game-area">
          <div className="pi-top-row">

            <div className="pi-painter-wrap">
              <img src={painterImg} alt="painter"
                className={`pi-painter ${celebrating ? "celebrate" : ""}`} />
              <div className="pi-lives">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span key={i} className={`pi-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
                ))}
              </div>
            </div>

            <div className={`pi-bubble ${bubbleClass}`}>
              <div className="pi-bubble-text">{bubbleText}</div>
              <div className="pi-steps">
                <div className={`pi-step ${step === "color" && !celebrating && !revealColor ? "active" : step === "shape" || celebrating || revealColor ? "done" : ""}`}>
                  {step === "shape" || celebrating || revealColor ? "✓" : "1"} Color
                </div>
                <div className={`pi-step ${step === "shape" && !celebrating && !revealShape ? "active" : celebrating || revealShape ? "done" : ""}`}>
                  {celebrating || revealShape ? "✓" : "2"} Shape
                </div>
              </div>
            </div>

            <div className="pi-shape-card">
              <div className={`pi-shape-display ${celebrating ? "celebrate" : ""}`}>
                <ShapeSVG shape={round.shape} color={round.color} size={190} />
              </div>
            </div>

          </div>

          {step === "color" && !celebrating && (
            <div className="pi-section">
              <div className="pi-section-label">Pick the color 🎨</div>
              <div className="pi-color-palette">
                {Object.entries(COLORS).map(([key, c]) => {
                  const isReveal = revealColor && key === round.color;
                  return (
                    <button
                      key={key}
                      className={`pi-color-swatch ${wrongColor === key ? "wrong-flash" : ""} ${isReveal ? "reveal-correct" : ""}`}
                      style={isReveal ? { background: c.hex, borderColor: '#fff' } : {}}
                      onClick={() => handleColorPick(key)}
                      disabled={blocked || revealColor}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "shape" && !celebrating && (
            <div className="pi-section">
              <div className="pi-section-label">Pick the shape 🔷</div>
              <div className="pi-shape-options">
                {SHAPES.map(shape => {
                  const sc = SHAPE_BTN_COLORS[shape];
                  const isReveal = revealShape && shape === round.shape;
                  return (
                    <button
                      key={shape}
                      className={`pi-shape-btn ${wrongShape === shape ? "wrong" : ""} ${isReveal ? "reveal-correct" : ""}`}
                      style={{ "--opt-bg": sc.bg, "--opt-dark": sc.dark }}
                      onClick={() => handleShapePick(shape)}
                      disabled={blocked || revealShape}
                    >
                      <span className="pi-shape-text">{shape}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}