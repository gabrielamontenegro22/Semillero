import React, { useState, useEffect, useRef } from "react";
import "./Nameit.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

import redCircle from "../../../../assets/sounds/red_circle.mp3";
import blueSquare from "../../../../assets/sounds/blue_square.mp3";
import greenTriangle from "../../../../assets/sounds/green_triangle.mp3";
import yellowRectangle from "../../../../assets/sounds/yellow_rectangle.mp3";
import orangeCircle from "../../../../assets/sounds/orange_circle.mp3";
import purpleSquare from "../../../../assets/sounds/purple_square.mp3";

import painterImg from "../../../../assets/pintor.png";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const audioCache = {
  correct: new Audio(correctoSound),
  wrong: new Audio(incorrectoSound),
  phrases: {
    red_circle: new Audio(redCircle),
    blue_square: new Audio(blueSquare),
    green_triangle: new Audio(greenTriangle),
    yellow_rectangle: new Audio(yellowRectangle),
    orange_circle: new Audio(orangeCircle),
    purple_square: new Audio(purpleSquare),
  }
};
[audioCache.correct, audioCache.wrong, ...Object.values(audioCache.phrases)]
  .forEach(a => { a.preload = "auto"; });

// ── Colores ──
const COLORS = {
  red: { hex: "#EF4444", dark: "#991B1B" },
  blue: { hex: "#3B82F6", dark: "#1D4ED8" },
  green: { hex: "#22C55E", dark: "#15803D" },
  yellow: { hex: "#EAB308", dark: "#A16207" },
  orange: { hex: "#F97316", dark: "#C2410C" },
  purple: { hex: "#A855F7", dark: "#7E22CE" },
  pink: { hex: "#EC4899", dark: "#BE185D" },
  brown: { hex: "#92400E", dark: "#451A03" },
};

const SHAPES = ["circle", "square", "triangle", "rectangle"];

function calcHidden(word) {
  const len = word.length;
  const count = len <= 5 ? 2 : 3;
  const candidates = Array.from({ length: len - 2 }, (_, i) => i + 1);
  const step = Math.floor(candidates.length / count);
  const hidden = [];
  for (let i = 0; i < count; i++) {
    hidden.push(candidates[Math.min(i * step + Math.floor(step / 2), candidates.length - 1)]);
  }
  return [...new Set(hidden)].sort((a, b) => a - b);
}

const COLOR_HIDDEN = Object.fromEntries(
  Object.keys(COLORS).map(c => [c, calcHidden(c)])
);
const SHAPE_HIDDEN = Object.fromEntries(
  SHAPES.map(s => [s, calcHidden(s)])
);

const ShapeSVG = React.memo(function ShapeSVG({ shape, color, size = 180 }) {
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

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function genRounds() {
  return [
    { color: "red", shape: "circle" },
    { color: "blue", shape: "square" },
    { color: "green", shape: "triangle" },
    { color: "yellow", shape: "rectangle" },
    { color: "orange", shape: "circle" },
    { color: "purple", shape: "square" },
  ];
}

const KB_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const NUM_ROUNDS = 6;
const MAX_LIVES = 3;
const PTS_OK = 10;

const BG_STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
  size: 1 + Math.random() * 2.5, dur: `${1.5 + Math.random() * 3}s`, del: `${Math.random() * 5}s`,
}));
const PARTICLE_COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#EAB308", "#F97316", "#A855F7", "#EC4899", "#fff"];
const BG_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i, color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
  size: 12 + Math.random() * 22, dur: `${5 + Math.random() * 7}s`, del: `${Math.random() * 6}s`,
}));
const BG_SPARKLES = Array.from({ length: 14 }, (_, i) => ({
  id: i, emoji: ["✨", "⭐", "🌟", "💫"][i % 4],
  top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`,
  size: 14 + Math.random() * 16, dur: `${3 + Math.random() * 5}s`, del: `${Math.random() * 6}s`,
}));

function FP({ value }) {
  return <div className={`ni-fp ni-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

function buildWordDisplay(word, hidden, typed, activeSlot, globalActiveSlot, slotOffset, celebrating, wrongSlot) {
  return word.split("").map((letter, i) => {
    const hiddenIdx = hidden.indexOf(i);
    if (hiddenIdx === -1) return { type: "visible", letter, key: i };
    const slotIdx = hiddenIdx;
    const globalSlot = slotOffset + slotIdx;
    const isActive = globalSlot === globalActiveSlot && !celebrating;
    const typedLetter = typed[slotIdx] || "";
    let state = "empty";
    if (celebrating) state = "done";
    else if (isActive) state = wrongSlot === globalSlot ? "active-wrong" : "active";
    else if (typedLetter) state = "filled";
    return { type: "blank", letter, key: i, slotIdx, globalSlot, typed: typedLetter, isActive, state };
  });
}

export default function NameIt({ onFinish }) {
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
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

  const [typed, setTyped] = useState([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [wrongSlot, setWrongSlot] = useState(null);
  const [wrongKey, setWrongKey] = useState(null);

  const mountedRef = useRef(true);
  const floaterId = useRef(0);
  const curAud = useRef(null);   // ✅ NUEVO: tracker del audio activo
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
      // ✅ Cleanup: detener audio activo al desmontar
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

  // ✅ NUEVO: detiene cualquier audio activo y limpia la referencia
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

  // ✅ NUEVO: Reproduce el audio de la frase y avanza cuando termina
  const playPhraseAndThen = (phraseKey, onEnded) => {
    if (!mountedRef.current) return;
    stopAud();
    const a = audioCache.phrases[phraseKey];
    if (!a) {
      setTimeout(() => {
        if (mountedRef.current) onEnded();
      }, 800);
      return;
    }
    a.pause();
    a.currentTime = 0;
    curAud.current = a;

    let advanced = false;
    const finish = () => {
      if (advanced || !mountedRef.current) return;
      advanced = true;
      a.removeEventListener('ended', handleEnd);
      onEnded();
    };
    const handleEnd = () => finish();
    a.addEventListener('ended', handleEnd);

    a.play().catch(() => setTimeout(finish, 1500));
    setTimeout(finish, 4000); // fallback
  };

  const initRound = (all, i, newLives) => {
    if (!mountedRef.current || !all[i]) return;

    // ✅ FIX: detener audio anterior al iniciar nueva ronda
    stopAud();

    const round = all[i];
    const colorHidden = COLOR_HIDDEN[round.color];
    const shapeHidden = SHAPE_HIDDEN[round.shape];
    const totalSlots = colorHidden.length + shapeHidden.length;
    setTyped(new Array(totalSlots).fill(""));
    setActiveSlot(0);
    setWrongSlot(null);
    setWrongKey(null);
    setBlocked(false);
    setCelebrating(false);
    setLives(newLives);
    livesRef.current = newLives;
  };

  const addFP = (v) => {
    const id = floaterId.current++;
    setFloaters(f => [...f, { v, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };

  const handleKey = (letter) => {
    if (blocked || celebrating) return;
    if (letter === "⌫") { handleBackspace(); return; }

    const i = idxRef.current;
    const round = roundsRef.current[i];
    const colorHidden = COLOR_HIDDEN[round.color];
    const shapeHidden = SHAPE_HIDDEN[round.shape];
    const totalSlots = colorHidden.length + shapeHidden.length;
    const slot = activeSlot;
    if (slot >= totalSlots) return;

    let expectedLetter;
    if (slot < colorHidden.length) {
      expectedLetter = round.color[colorHidden[slot]].toUpperCase();
    } else {
      const shapeSlot = slot - colorHidden.length;
      expectedLetter = round.shape[shapeHidden[shapeSlot]].toUpperCase();
    }

    if (letter === expectedLetter) {
      playAud(audioCache.correct);
      const newTyped = [...typed];
      newTyped[slot] = letter;
      setTyped(newTyped);
      setWrongSlot(null);
      setWrongKey(null);

      const nextSlot = slot + 1;
      if (nextSlot >= totalSlots) {
        // ✅ Todo completado
        setBlocked(true);
        setCelebrating(true);
        const first = (attRef.current[i] || 0) === 0;
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

        // ✅ FIX: reproducir frase y esperar al 'ended' antes de avanzar
        const phraseKey = `${round.color}_${round.shape}`;
        setTimeout(() => {
          if (!mountedRef.current) return;
          playPhraseAndThen(phraseKey, () => {
            if (!mountedRef.current) return;
            setTimeout(() => advanceTo(i + 1), 400);
          });
        }, 600);
      } else {
        setTimeout(() => { setActiveSlot(nextSlot); }, 200);
      }
    } else {
      playAud(audioCache.wrong);
      setWrongKey(letter);
      setWrongSlot(slot);
      streakRef.current = 0;
      setStreak(0);
      const na = (attRef.current[i] || 0) + 1;
      attRef.current = { ...attRef.current, [i]: na };
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);

      setTimeout(() => {
        if (!mountedRef.current) return;
        setWrongKey(null);
        setWrongSlot(null);
        if (newLives <= 0) {
          // ✅ FIX: Reveal verde + audio refuerzo + esperar al 'ended'
          setBlocked(true);
          setAttempts(a => a + 1);
          const revealedColor = colorHidden.map(hi => round.color[hi].toUpperCase());
          const revealedShape = shapeHidden.map(hi => round.shape[hi].toUpperCase());
          setTyped([...revealedColor, ...revealedShape]);
          setCelebrating(true);

          const phraseKey = `${round.color}_${round.shape}`;
          setTimeout(() => {
            if (!mountedRef.current) return;
            playPhraseAndThen(phraseKey, () => {
              if (!mountedRef.current) return;
              setTimeout(() => advanceTo(i + 1), 400);
            });
          }, 500);
        }
      }, 600);
    }
  };

  const handleBackspace = () => {
    if (blocked) return;
    const slot = activeSlot;
    if (typed[slot]) {
      const newTyped = [...typed];
      newTyped[slot] = "";
      setTyped(newTyped);
    } else if (slot > 0) {
      const newTyped = [...typed];
      newTyped[slot - 1] = "";
      setTyped(newTyped);
      setActiveSlot(slot - 1);
    }
    setWrongSlot(null);
    setWrongKey(null);
  };

  const advanceTo = (next) => {
    if (!mountedRef.current) return;
    stopAud();   // ✅ FIX: detener audio antes de cambiar ronda
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
    <div className="ni-result-root">
      <GameBackground color="pink" />
      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
      <div className="ni-result-card">
        <div className="ni-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🎨" : "🖌️"}</div>
        <div className="ni-result-badge">Colors & Shapes · Level 3 ✏️</div>
        <h2 className="ni-result-title">¡Nivel terminado!</h2>
        <div className="ni-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`ni-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="ni-result-stats">
          <div className="ni-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
          <div className="ni-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="ni-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="ni-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
        </div>
        {onFinish && (
          <button className="ni-result-btn" onClick={() => onFinish(correctCount)}>Continue 🎨</button>
        )}
      </div>
    </div>
  );

  const round = rounds[currentIdx];
  if (!round) return null;

  const colorHidden = COLOR_HIDDEN[round.color];
  const shapeHidden = SHAPE_HIDDEN[round.shape];
  const colorOffset = 0;
  const shapeOffset = colorHidden.length;

  const colorDisplay = buildWordDisplay(round.color, colorHidden, typed.slice(0, colorHidden.length), activeSlot, activeSlot, colorOffset, celebrating, wrongSlot);
  const shapeDisplay = buildWordDisplay(round.shape, shapeHidden, typed.slice(colorHidden.length), activeSlot, activeSlot, shapeOffset, celebrating, wrongSlot);

  const bubbleText = celebrating
    ? `✨ ${round.color.toUpperCase()} ${round.shape.toUpperCase()}!`
    : activeSlot < colorHidden.length
      ? "Spell the color! 🎨"
      : "Now spell the shape! 🔷";

  const bubbleClass = celebrating ? "correct" : wrongSlot !== null ? "wrong" : activeSlot >= colorHidden.length ? "active" : "";

  return (
    <>
      <div className="ni-header-bar">
        <div className="ni-header-left">
          <span className="ni-header-badge">Level 3</span>
          <span className="ni-header-title">✏️ Writing</span>
        </div>
        <div className="ni-header-right">
          <div className="ni-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="ni-header-pill ni-streak-pill">🔥 {streak}x</div>}
          <div className="ni-header-pill">🎯 {attempts}</div>
          <div className="ni-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

      <div className="ni-root">
        {BG_STARS.map(s => (
          <div key={s.id} className="ni-star"
            style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              "--sdur": s.dur, "--sdel": s.del
            }} />
        ))}
        {BG_PARTICLES.map(p => (
          <div key={p.id} className="ni-particle"
            style={{
              top: p.top, left: p.left, width: p.size, height: p.size,
              background: p.color, "--pdur": p.dur, "--pdel": p.del
            }} />
        ))}
        {BG_SPARKLES.map(s => (
          <div key={s.id} className="ni-sparkle"
            style={{
              top: s.top, left: s.left, "--ssize": `${s.size}px`,
              "--sdurs": s.dur, "--sdels": s.del
            }}>
            {s.emoji}
          </div>
        ))}

        <div className="ni-progress-wrap">
          <div className="ni-progress-track">
            <div className="ni-progress-fill" style={{ width: `${progress}%` }} />
            <div className="ni-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`ni-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="ni-game-area">

          <div className="ni-top-row">
            <div className="ni-painter-wrap">
              <img src={painterImg} alt="painter"
                className={`ni-painter ${celebrating ? "celebrate" : ""}`} />
              <div className="ni-lives">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span key={i} className={`ni-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
                ))}
              </div>
            </div>

            <div className={`ni-bubble ${bubbleClass}`}>
              <span className="ni-bubble-text">{bubbleText}</span>
            </div>

            <div className="ni-shape-card">
              <div className={`ni-shape-display ${celebrating ? "celebrate" : ""}`}>
                <ShapeSVG shape={round.shape} color={round.color} size={175} />
              </div>
            </div>
          </div>

          <div className="ni-words-row">
            <div className="ni-word-group">
              <div className="ni-word-label" style={{ color: COLORS[round.color].hex }}>color</div>
              <div className="ni-word">
                {colorDisplay.map(cell => {
                  if (cell.type === "visible") {
                    return <div key={cell.key} className="ni-cell visible">{cell.letter}</div>;
                  }
                  return (
                    <div key={cell.key} className={`ni-cell blank ${cell.state}`}>
                      {cell.typed || ""}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ni-word-separator">+</div>

            <div className="ni-word-group">
              <div className="ni-word-label" style={{ color: "rgba(255,255,255,0.6)" }}>shape</div>
              <div className="ni-word">
                {shapeDisplay.map(cell => {
                  if (cell.type === "visible") {
                    return <div key={cell.key} className="ni-cell visible">{cell.letter}</div>;
                  }
                  return (
                    <div key={cell.key} className={`ni-cell blank ${cell.state}`}>
                      {cell.typed || ""}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {!celebrating && (
            <div className="ni-keyboard">
              {KB_ROWS.map((row, ri) => (
                <div key={ri} className="ni-kb-row">
                  {row.map(key => (
                    <button
                      key={key}
                      className={`ni-key ${key === "⌫" ? "backspace" : ""} ${wrongKey === key ? "wrong-flash" : ""}`}
                      onClick={() => handleKey(key)}
                      disabled={blocked}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}