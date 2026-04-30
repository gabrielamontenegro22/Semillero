import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Conversationbuilder.css";
import GameBackground from "../GameBackground";
import confetti from "canvas-confetti";

import morningImg from "../../../../assets/morningaction.png";
import afternoonImg from "../../../../assets/afternoonaction.jpg";
import eveningImg from "../../../../assets/eveningaction.jpg";
import nightImg from "../../../../assets/nightaction.jpg";

import morningAudio from "../../../../assets/sounds/morning.mp3";
import afternoonAudio from "../../../../assets/sounds/afternoon.mp3";
import eveningAudio from "../../../../assets/sounds/evening.mp3";
import nightAudio from "../../../../assets/sounds/night.mp3";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── DATA ───────────────────────────────────────────────────
const GREETINGS = [
  { word: "morning", img: morningImg, audio: morningAudio, color: "#F59E0B", glow: "rgba(245,158,11,0.7)", bg: "orange", emoji: "🌅", greeting: "Good morning!" },
  { word: "afternoon", img: afternoonImg, audio: afternoonAudio, color: "#10B981", glow: "rgba(16,185,129,0.7)", bg: "green", emoji: "☀️", greeting: "Good afternoon!" },
  { word: "evening", img: eveningImg, audio: eveningAudio, color: "#8B5CF6", glow: "rgba(139,92,246,0.7)", bg: "purple", emoji: "🌆", greeting: "Good evening!" },
  { word: "night", img: nightImg, audio: nightAudio, color: "#3B82F6", glow: "rgba(59,130,246,0.7)", bg: "blue", emoji: "🌙", greeting: "Good night!" },
];

const TOTAL_ROUNDS = 6;
const TOTAL_LIVES = 3;
const POINTS_LETTER = 5;
const PERFECT_BONUS = 30;
const POINTS_WRONG = -2;

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
  const shuffled = shuffle([...GREETINGS]);
  const extras = [
    GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
  ];
  return [...shuffled, ...extras].slice(0, TOTAL_ROUNDS);
}

function genHints(word) {
  const hints = new Set([0]); // siempre la primera letra

  // Cuántas letras adicionales revelar según la longitud
  let extraHints;
  if (word.length <= 5) extraHints = 1; // night → 2 reveladas, escribe 3
  else if (word.length <= 7) extraHints = 2; // morning/evening → 3 reveladas, escribe 4
  else extraHints = 3; // afternoon → 4 reveladas, escribe 5

  // Posiciones disponibles (sin la primera ni la última)
  const available = [];
  for (let i = 1; i < word.length - 1; i++) available.push(i);

  // Mezclar y tomar las primeras `extraHints`
  const shuffled = available.sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(extraHints, shuffled.length); i++) {
    hints.add(shuffled[i]);
  }

  return hints;
}

function FloatingPoints({ points, id }) {
  return (
    <div key={id} className={`cw-floating-points ${points > 0 ? "pos" : "neg"}`}>
      {points > 0 ? `+${points}` : points}
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────
export default function ConversationBuilder({ onFinish }) {
  const [questions] = useState(() => genRounds());
  const [current, setCurrent] = useState(0);
  const [hints, setHints] = useState(() => genHints(questions[0].word));
  const [typed, setTyped] = useState("");
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [errorsThisRound, setErrorsThisRound] = useState(0);
  const [floatingPoints, setFloatingPoints] = useState([]);
  const [shake, setShake] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [wrongKey, setWrongKey] = useState(null);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [audioReady, setAudioReady] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [usedKeys, setUsedKeys] = useState(new Set());

  const audioRefs = useRef({});
  const correctRef = useRef(null);
  const wrongRef = useRef(null);
  const mountedRef = useRef(true);

  const currentQuestion = questions[current];
  const currentWord = currentQuestion.word;

  // Inicializa typed con las pistas al cambiar ronda
  useEffect(() => {
    let prefix = "";
    for (let i = 0; i < currentWord.length; i++) {
      if (hints.has(i)) {
        if (prefix.length === i) prefix += currentWord[i];
        else break;
      }
    }
    setTyped(prefix);
    setUsedKeys(new Set());
  }, [current, hints, currentWord]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; confetti.reset(); };
  }, []);

  useEffect(() => {
    GREETINGS.forEach(g => {
      const a = new Audio(g.audio);
      a.preload = "auto";
      a.load();
      audioRefs.current[g.word] = a;
    });
    const c = new Audio(correctoSound);
    const w = new Audio(incorrectoSound);
    c.preload = "auto"; w.preload = "auto";
    c.load(); w.load();
    correctRef.current = c;
    wrongRef.current = w;
    setAudioReady(true);
  }, []);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  // Reveal animation al cambiar ronda
  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, [current]);

  // Auto-play audio al iniciar ronda
  useEffect(() => {
    if (audioReady && !finished && !solved) {
      const timer = setTimeout(() => {
        if (mountedRef.current && !hasPlayed) playAudio();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, audioReady, finished]);

  const playAudio = useCallback(() => {
    if (isPlaying) return;
    const baseAudio = audioRefs.current[currentWord];
    if (!baseAudio) return;
    baseAudio.currentTime = 0;
    baseAudio.volume = 1;
    baseAudio.play().then(() => {
      setIsPlaying(true);
      setHasPlayed(true);
    }).catch(console.error);
    baseAudio.onended = () => setIsPlaying(false);
  }, [currentWord, isPlaying]);

  const addFloater = (pts) => {
    const id = Date.now() + Math.random();
    setFloatingPoints(prev => [...prev, { pts, id }]);
    setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
  };

  const triggerNext = useCallback((currentIndex) => {
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrent(next);
      setHints(genHints(questions[next].word));
      setHasPlayed(false);
      setSolved(false);
      setErrorsThisRound(0);
      setLives(TOTAL_LIVES);
      setWrongKey(null);
    } else {
      setFinished(true);
      const end = Date.now() + 3000;
      const frame = () => {
        if (!mountedRef.current) return;
        confetti({ particleCount: 16, angle: 60, spread: 80, origin: { x: 0 }, colors: ["#3B82F6", "#00C6FF", "#FCD34D", "#fff"] });
        confetti({ particleCount: 16, angle: 120, spread: 80, origin: { x: 1 }, colors: ["#3B82F6", "#00C6FF", "#FCD34D", "#fff"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [questions]);

  const handleSolved = useCallback((wordSolved) => {
    setSolved(true);
    setAnswers(prev => ({ ...prev, [wordSolved]: true }));
    correctRef.current && correctRef.current.cloneNode().play().catch(() => { });
    setAttempts(a => a + 1);

    let bonus = 15;
    if (errorsThisRound === 0) {
      bonus = PERFECT_BONUS;
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
    setTotalPoints(p => p + bonus);
    addFloater(bonus);

    confetti({
      particleCount: 100, spread: 110, origin: { y: 0.5 },
      colors: [currentQuestion.color, "#FCD34D", "#fff", "#00C6FF", "#0072FF"]
    });

    setBounce(true);
    setTimeout(() => setBounce(false), 600);
    setTimeout(() => { if (mountedRef.current) triggerNext(current); }, 1800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, errorsThisRound, streak, bestStreak, currentQuestion, triggerNext]);

  const handleKey = useCallback((letter) => {
    if (solved || finished) return;
    if (!correctRef.current || !wrongRef.current) return;

    const nextIndex = typed.length;
    if (nextIndex >= currentWord.length) return;

    const expected = currentWord[nextIndex];

    if (letter === expected) {
      const newTyped = typed + letter;
      let i = newTyped.length;
      let merged = newTyped;
      while (i < currentWord.length && hints.has(i)) {
        merged += currentWord[i];
        i++;
      }
      setTyped(merged);
      setUsedKeys(prev => new Set([...prev, letter]));
      setTotalPoints(p => p + POINTS_LETTER);
      addFloater(POINTS_LETTER);

      const isWordComplete = merged === currentWord;

      // ✅ FIX: Sonido "correcto" en CADA letra acertada (refuerzo positivo)
      if (!isWordComplete && correctRef.current) {
        correctRef.current.cloneNode().play().catch(() => { });
      }

      if (isWordComplete) {
        setTimeout(() => {
          if (mountedRef.current) handleSolved(currentWord);
        }, 200);
      }
    } else {
      wrongRef.current.cloneNode().play().catch(() => { });
      setWrongKey(letter);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setWrongKey(null), 700);
      setErrorsThisRound(e => e + 1);
      setStreak(0);
      setTotalPoints(p => Math.max(0, p + POINTS_WRONG));
      addFloater(POINTS_WRONG);

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTyped(currentWord);
        setSolved(true);
        setAnswers(prev => ({ ...prev, [currentWord]: false }));
        setAttempts(a => a + 1);
        setTimeout(() => { if (mountedRef.current) triggerNext(current); }, 2200);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, currentWord, solved, finished, hints, lives, current, handleSolved, triggerNext]);

  // Listener teclado físico
  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) handleKey(key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const score = questions.reduce((acc, q) => (answers[q.word] === true ? acc + 1 : acc), 0);
  const progress = ((current + (solved ? 1 : 0)) / questions.length) * 100;
  const roundColor = currentQuestion?.color || "#3B82F6";
  const roundGlow = currentQuestion?.glow || "rgba(59,130,246,0.7)";
  const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

  // ── RESULT ───────────────────────────────────────────────
  if (finished) {
    return (
      <div className="cw-game-root cw-result-container">
        <GameBackground color="purple" />
        {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
        <div className="cw-result-card">
          <div className="cw-result-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
          <div className="cw-result-badge">💬 Greetings · Level 3 ✏️</div>
          <h2 className="cw-result-title">¡Excelente trabajo!</h2>
          <div className="cw-result-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`cw-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
            ))}
          </div>
          <div className="cw-result-stats">
            <div className="cw-rstat"><span>✅</span><span>Solved</span><strong>{score}/{questions.length}</strong></div>
            <div className="cw-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
            <div className="cw-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
            <div className="cw-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
            <div className="cw-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
          </div>
          {onFinish && (
            <button className="cw-result-btn" onClick={() => onFinish(score)}>
              Continue 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calcular slots
  const slots = currentWord.split("").map((ch, i) => {
    const isTyped = i < typed.length;
    const isHint = hints.has(i);
    const isFilled = isTyped || isHint;
    const char = isTyped ? typed[i] : (isHint ? ch : "");
    return { char, index: i, isHint, isFilled };
  });

  const activeIndex = typed.length < currentWord.length ? typed.length : -1;

  // ── GAME ─────────────────────────────────────────────────
  return (
    <div className="cw-game-root">
      <GameBackground color={currentQuestion.bg} />
      {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

      <div className="cw-header-bar">
        <div className="cw-header-left">
          <span className="cw-header-badge">Level 3</span>
          <span className="cw-header-title">🎧 Writing</span>
        </div>
        <div className="cw-header-right">
          <div className="cw-header-pill">⚡ {totalPoints}</div>
          {streak >= 2 && <div className="cw-header-pill cw-streak-pill">🔥 {streak}x</div>}
          <div className="cw-header-pill">🎯 {attempts}</div>
          <div className="cw-header-pill">⏱ {timeElapsed}s</div>
        </div>
      </div>

      <div className="cw-write-container">
        <div className={`cw-wrapper ${shake ? "cw-shake" : ""} ${bounce ? "cw-bounce" : ""}`}>

          {/* Progress */}
          <div className="cw-progress-track">
            <div className="cw-progress-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg,${roundColor},#00C6FF)`,
                boxShadow: `0 0 12px ${roundGlow}`,
              }} />
            <div className="cw-progress-steps">
              {questions.map((_, i) => (
                <div key={i} className={`cw-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                  style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
              ))}
            </div>
          </div>

          <p className="cw-instruction">💬 Listen, look and write the greeting!</p>

          {/* CLUE ROW: mini-card + slots LADO A LADO */}
          <div className="cw-clue-row">
            {/* Mini ficha imagen */}
            <div className={`cw-mini-card ${revealed ? "revealed" : ""}`}
              style={{ borderColor: roundColor, boxShadow: `0 0 0 4px rgba(255,255,255,0.95), 0 18px 40px rgba(0,0,0,0.4), 0 0 40px ${roundGlow}` }}>
              <img src={currentQuestion.img} alt={currentWord} className="cw-mini-img" />
              <div className="cw-mini-emoji">{currentQuestion.emoji}</div>
              <button
                className={`cw-replay-btn ${isPlaying ? "playing" : ""}`}
                onClick={playAudio}
                disabled={isPlaying}
                style={{ "--round-color": roundColor }}
                aria-label="Reproducir audio"
              >
                {isPlaying ? "🔊" : "▶"}
              </button>
            </div>

            {/* Huecos para letras */}
            <div className="cw-slots-container">
              <div className="cw-slot-prefix">Good</div>
              <div className="cw-slots">
                {slots.map(slot => (
                  <div key={slot.index}
                    className={`cw-slot
                      ${slot.isFilled ? "filled" : ""}
                      ${slot.isHint && slot.isFilled ? "hint" : ""}
                      ${activeIndex === slot.index ? "active" : ""}
                      ${solved && answers[currentWord] ? "solved" : ""}
                    `}
                    style={{
                      "--slot-color": roundColor,
                      "--slot-glow": roundGlow
                    }}>
                    <span className="cw-slot-char">{slot.char}</span>
                    {activeIndex === slot.index && (
                      <div className="cw-slot-magnifier">🔎</div>
                    )}
                    {slot.isHint && slot.isFilled && (
                      <div className="cw-hint-tag">💡</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lives */}
          <div className="cw-lives-container">
            {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
              <span key={i} className={`cw-heart ${i < lives ? "alive" : "lost"}`}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>

          {/* TECLADO QWERTY */}
          <div className="cw-keyboard">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="cw-keyboard-row">
                {row.map(letter => {
                  // Cuántas veces aparece la letra en la palabra
                  const totalInWord = currentWord.split('').filter(c => c === letter).length;
                  // Cuántas veces ya está rellena (incluye pistas + tipeadas)
                  const usedCount = typed.split('').filter(c => c === letter).length;
                  // Solo bloquear cuando ya se cubrieron TODAS las apariciones
                  const isUsed = totalInWord > 0 && usedCount >= totalInWord;
                  const isWrong = wrongKey === letter;
                  const inWord = currentWord.includes(letter);
                  return (
                    <button
                      key={letter}
                      className={`cw-key
        ${isUsed ? "used" : ""}
        ${isWrong ? "wrong-key" : ""}
      `}
                      onClick={() => handleKey(letter)}
                      disabled={solved || finished}
                      style={isUsed && inWord ? { "--key-color": roundColor } : {}}
                    >
                      {letter.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}