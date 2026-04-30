import React, { useState, useEffect, useRef } from "react";
import "./Whatshape.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

import painterImg from "../../../../assets/pintor.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";
import sndCircle from "../../../../assets/sounds/circle.mp3";
import sndSquare from "../../../../assets/sounds/square.mp3";
import sndTriangle from "../../../../assets/sounds/triangle.mp3";
import sndRectangle from "../../../../assets/sounds/rectangle.mp3";

const audioCache = {
  correct: new Audio(correctoSound),
  wrong: new Audio(incorrectoSound),
  shapes: {
    circle: new Audio(sndCircle),
    square: new Audio(sndSquare),
    triangle: new Audio(sndTriangle),
    rectangle: new Audio(sndRectangle),
  },
};
[audioCache.correct, audioCache.wrong, ...Object.values(audioCache.shapes)]
  .forEach(a => { a.preload = "auto"; });

const COLORS = {
  red: { hex: "#EF4444", label: "red", dark: "#991B1B" },
  blue: { hex: "#3B82F6", label: "blue", dark: "#1D4ED8" },
  green: { hex: "#22C55E", label: "green", dark: "#15803D" },
  yellow: { hex: "#EAB308", label: "yellow", dark: "#A16207" },
  orange: { hex: "#F97316", label: "orange", dark: "#C2410C" },
  purple: { hex: "#A855F7", label: "purple", dark: "#7E22CE" },
  pink: { hex: "#EC4899", label: "pink", dark: "#BE185D" },
  brown: { hex: "#92400E", label: "brown", dark: "#451A03" },
  black: { hex: "#1F2937", label: "black", dark: "#111827" },
};

const SHAPE_COLORS = {
  circle: { bg: "#3B82F6", dark: "#1D4ED8" },
  square: { bg: "#EF4444", dark: "#991B1B" },
  triangle: { bg: "#22C55E", dark: "#15803D" },
  rectangle: { bg: "#F97316", dark: "#C2410C" },
};

const SHAPES = ["circle", "square", "triangle", "rectangle"];

const ShapeSVG = React.memo(function ShapeSVG({ shape, color, size = 220 }) {
  const c = COLORS[color];
  const fill = c.hex;
  const stroke = c.dark;
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
function genOptions(correctShape) {
  const wrong = shuffle(SHAPES.filter(s => s !== correctShape)).slice(0, 3);
  return shuffle([correctShape, ...wrong]);
}

const NUM_ROUNDS = 6;
const MAX_LIVES = 2;
const PTS_OK = 10;

function genRounds() {
  const guaranteed = shuffle(SHAPES).map(shape => {
    const color = shuffle(Object.keys(COLORS))[0];
    return { color, shape, id: `${color}-${shape}-g` };
  });
  const extras = shuffle(ALL_COMBOS)
    .filter(c => !guaranteed.find(g => g.shape === c.shape && g.color === c.color))
    .slice(0, NUM_ROUNDS - SHAPES.length);
  return shuffle([...guaranteed, ...extras]);
}

const PAINT_BLOBS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  color: Object.values(COLORS)[i % Object.keys(COLORS).length].hex,
  top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
  size: 60 + Math.random() * 140,
  dur: `${4 + Math.random() * 6}s`, del: `${Math.random() * 5}s`,
}));

const CONFETTI_BITS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  color: Object.values(COLORS)[i % Object.keys(COLORS).length].hex,
  top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
  size: 7 + Math.random() * 10,
  dur: `${3 + Math.random() * 5}s`, del: `${Math.random() * 5}s`,
  rotate: Math.random() * 360,
}));

function FP({ value }) {
  return <div className={`ws-fp ws-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

export default function WhatShape({ onFinish }) {
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState([]);
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
  const [selected, setSelected] = useState(null);
  const [listening, setListening] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [revealCorrect, setRevealCorrect] = useState(false);

  const mountedRef = useRef(true);
  const floaterId = useRef(0);
  const curAud = useRef(null);
  const audioTokenRef = useRef(0);   // ✅ NUEVO: token único para cada reproducción
  const roundsRef = useRef([]);
  const idxRef = useRef(0);
  const streakRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const attRef = useRef({});

  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  useEffect(() => {
    mountedRef.current = true;
    const picked = genRounds();
    roundsRef.current = picked;
    attRef.current = {};
    setRounds(picked);
    initRound(picked, 0, MAX_LIVES);
    return () => {
      mountedRef.current = false;
      confetti.reset();
      // ✅ Cleanup: detener audio activo
      if (curAud.current) {
        curAud.current.pause();
        curAud.current.currentTime = 0;
      }
    };
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

  // ✅ FIX: detiene cualquier audio Y limpia la referencia
  const stopAud = () => {
    if (curAud.current) {
      curAud.current.pause();
      curAud.current.currentTime = 0;
      curAud.current = null;
    }
  };

  const playAud = (a) => {
    stopAud();
    if (!a) return;
    a.currentTime = 0;
    curAud.current = a;
    a.play().catch(() => { });
  };

  // ✅ FIX TRIPLE PROTECCIÓN ANTI-DOBLE-AUDIO:
  // 1. stopAud() detiene cualquier audio anterior
  // 2. Sistema de tokens: cada llamada recibe un token único
  // 3. Si otra llamada se dispara, este token ya no es válido
  const playShapeAndThen = (shape, onEnded) => {
    if (!mountedRef.current) return;

    // 🛡️ Detener audio anterior
    stopAud();

    // 🛡️ Token único
    const myToken = ++audioTokenRef.current;

    const a = audioCache.shapes[shape];
    if (!a) {
      setTimeout(() => {
        if (myToken !== audioTokenRef.current) return;
        if (mountedRef.current) onEnded();
      }, 800);
      return;
    }
    a.pause();
    a.currentTime = 0;
    curAud.current = a;

    let finished = false;
    const finish = () => {
      if (finished || !mountedRef.current) return;
      // 🛡️ Si otra llamada ya se disparó, ignorar
      if (myToken !== audioTokenRef.current) return;
      finished = true;
      a.removeEventListener('ended', handleEnd);
      onEnded();
    };
    const handleEnd = () => finish();
    a.addEventListener('ended', handleEnd);

    a.play().catch(() => setTimeout(finish, 1500));
    setTimeout(finish, 4000);
  };

  const initRound = (all, i, newLives) => {
    if (!mountedRef.current) return;
    const round = all[i];
    if (!round) return;

    // 🛡️ Detener cualquier audio en curso al iniciar nueva ronda
    stopAud();

    setOptions(genOptions(round.shape));
    setSelected(null);
    setBlocked(true);
    setCelebrating(false);
    setRevealCorrect(false);
    setLives(newLives);
    livesRef.current = newLives;
    setListening(true);

    playShapeAndThen(round.shape, () => {
      if (!mountedRef.current) return;
      setListening(false);
      setBlocked(false);
    });
  };

  const addFP = (v) => {
    const id = floaterId.current++;
    setFloaters(f => [...f, { v, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };

  const handleOption = (shape) => {
    if (blocked) return;
    const i = idxRef.current;
    const round = roundsRef.current[i];
    const correct = shape === round.shape;
    setSelected({ shape, correct });
    setBlocked(true);

    if (correct) {
      playAud(audioCache.correct);
      setCelebrating(true);
      const tries = attRef.current[i] || 0;
      const first = tries === 0;
      const ns = first ? streakRef.current + 1 : 0;
      streakRef.current = ns;
      setStreak(ns);
      setBestStreak(b => Math.max(b, ns));
      const bonus = first ? (ns >= 3 ? 15 : ns >= 2 ? 12 : PTS_OK) : 5;
      setPoints(p => p + bonus);
      setAttempts(a => a + 1);
      setCorrectCount(c => c + 1);
      addFP(bonus);
      confetti({
        particleCount: 80, spread: 90, origin: { y: 0.5 },
        colors: [COLORS[round.color].hex, "#FFD700", "#fff", "#FF6B9D"],
      });

      setTimeout(() => {
        if (!mountedRef.current) return;
        playShapeAndThen(round.shape, () => {
          if (!mountedRef.current) return;
          setTimeout(() => advanceTo(i + 1), 400);
        });
      }, 600);
    } else {
      playAud(audioCache.wrong);
      streakRef.current = 0;
      setStreak(0);
      const na = (attRef.current[i] || 0) + 1;
      attRef.current = { ...attRef.current, [i]: na };
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);

      setTimeout(() => {
        if (!mountedRef.current) return;
        setSelected(null);

        if (newLives <= 0) {
          setAttempts(a => a + 1);
          setRevealCorrect(true);

          setTimeout(() => {
            if (!mountedRef.current) return;
            playShapeAndThen(round.shape, () => {
              if (!mountedRef.current) return;
              setTimeout(() => advanceTo(i + 1), 400);
            });
          }, 500);
        } else {
          // ✅ NUEVO: Repetir audio del shape para ayudar al niño
          setListening(true);
          playShapeAndThen(round.shape, () => {
            if (!mountedRef.current) return;
            setListening(false);
            setBlocked(false);  // ← desbloquea DESPUÉS de oír el audio
          });
        }
      }, 1300);
    }
  };

  const handleReplay = () => {
    const round = roundsRef.current[idxRef.current];
    if (!round) return;
    setListening(true);
    playShapeAndThen(round.shape, () => {
      if (!mountedRef.current) return;
      setListening(false);
    });
  };

  const advanceTo = (next) => {
    if (!mountedRef.current) return;
    stopAud();
    if (next >= roundsRef.current.length) { setFinished(true); return; }
    setCurrentIdx(next);
    idxRef.current = next;
    initRound(roundsRef.current, next, MAX_LIVES);
  };

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
  const isPerfect = Object.values(attRef.current).every(f => f === 0);
  const stars = correctCount === rounds.length && isPerfect ? 3 : correctCount >= rounds.length - 1 ? 2 : 1;

  if (finished) return (
    <div className="ws-result-root">
      <GameBackground color="blue" />
      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
      <div className="ws-result-card">
        <div className="ws-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🎨" : "🔷"}</div>
        <div className="ws-result-badge">Colors & Shapes · Level 1 🎨</div>
        <h2 className="ws-result-title">¡Nivel terminado!</h2>
        <div className="ws-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`ws-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="ws-result-stats">
          <div className="ws-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
          <div className="ws-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="ws-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="ws-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
        </div>
        {onFinish && (
          <button className="ws-result-btn" onClick={() => onFinish(correctCount)}>Continue 🎨</button>
        )}
      </div>
    </div>
  );

  const round = rounds[currentIdx];
  if (!round) return null;
  const colorInfo = COLORS[round.color];

  return (
    <>
      <div className="ws-header-bar">
        <div className="ws-header-left">
          <span className="ws-header-badge">Level 1</span>
          <span className="ws-header-title">🎧 Listening</span>
        </div>
        <div className="ws-header-right">
          <div className="ws-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="ws-header-pill ws-streak-pill">🔥 {streak}x</div>}
          <div className="ws-header-pill">🎯 {attempts}</div>
          <div className="ws-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

      <div className="ws-root">
        {PAINT_BLOBS.map(b => (
          <div key={b.id} className="ws-blob"
            style={{
              top: b.top, left: b.left, width: b.size, height: b.size,
              background: b.color, "--bdur": b.dur, "--bdel": b.del
            }} />
        ))}
        {CONFETTI_BITS.map(b => (
          <div key={b.id} className="ws-confetti-bit"
            style={{
              top: b.top, left: b.left, width: b.size, height: b.size,
              background: b.color, "--cdur": b.dur, "--cdel": b.del, "--crot": `${b.rotate}deg`
            }} />
        ))}

        <div className="ws-progress-wrap">
          <div className="ws-progress-track">
            <div className="ws-progress-fill" style={{ width: `${progress}%` }} />
            <div className="ws-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`ws-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="ws-game-area">

          <div className="ws-top-row">
            <div className="ws-painter-wrap">
              <img
                src={painterImg}
                alt="painter"
                className={`ws-painter ${celebrating ? "celebrate" : listening ? "listening" : ""}`}
              />
              <div className="ws-lives">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span key={i} className={`ws-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
                ))}
              </div>
            </div>

            <div className={`ws-bubble ${selected ? (selected.correct ? "correct" : "wrong") : ""}`}>
              <span className="ws-bubble-text">
                {celebrating
                  ? `✨ ${round.shape.toUpperCase()}!`
                  : listening ? "Listen... 🎵"
                    : "What shape? 🎨"}
              </span>
            </div>

            <div className="ws-shape-card" style={{ "--shape-color": colorInfo.hex }}>
              <div className="ws-shape-display">
                <ShapeSVG shape={round.shape} color={round.color} size={200} />
              </div>
              <div className="ws-color-label" style={{ background: colorInfo.hex, boxShadow: `0 4px 20px ${colorInfo.hex}99` }}>
                {colorInfo.label}
              </div>
            </div>
          </div>

          <button className={`ws-sound-btn ${listening ? "playing" : ""}`} onClick={handleReplay}>
            {listening
              ? <span className="ws-sound-waves"><span /><span /><span /><span /></span>
              : "🔊 Listen again"}
          </button>

          <div className="ws-options">
            {options.map(shape => {
              const sc = SHAPE_COLORS[shape];
              const isReveal = revealCorrect && shape === round.shape;
              const state = selected !== null && selected.shape === shape
                ? selected.correct ? "correct" : "wrong"
                : isReveal ? "reveal"
                  : "idle";
              return (
                <button
                  key={shape}
                  className={`ws-option ${state}`}
                  style={{ "--opt-bg": sc.bg, "--opt-dark": sc.dark }}
                  onClick={() => handleOption(shape)}
                  disabled={blocked}
                >
                  <span className="ws-option-text">{shape}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}