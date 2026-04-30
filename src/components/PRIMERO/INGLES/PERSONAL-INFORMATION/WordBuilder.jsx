import React, { useState, useEffect, useRef, useCallback } from "react";
import "./WordBuilder.css";
import GameBackground from "../GameBackground";
import confetti from "canvas-confetti";

// ─── AUDIOS DE PREGUNTAS ─────────────────────────────────
import nameAudio from "../../../../assets/sounds/whats-your-name.mp3";
import ageAudio from "../../../../assets/sounds/how-old-are-you.mp3";
import fromAudio from "../../../../assets/sounds/where-are-you-from.mp3";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ─── DATA ─────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    audio: nameAudio,
    audioKey: "name",
    questionText: "What's your name?",
    emoji: "🙋",
    correct: "My name is Sam",
    options: ["My name is Sam", "I'm seven years old", "I'm from Colombia"],
    color: "teal",
    bg: "green",
  },
  {
    id: 2,
    audio: ageAudio,
    audioKey: "age",
    questionText: "How old are you?",
    emoji: "🎂",
    correct: "I'm seven years old",
    options: ["I'm seven years old", "My name is Sam", "I'm from Colombia"],
    color: "purple",
    bg: "purple",
  },
  {
    id: 3,
    audio: fromAudio,
    audioKey: "from",
    questionText: "Where are you from?",
    emoji: "🌎",
    correct: "I'm from Colombia",
    options: ["I'm from Colombia", "My name is Ana", "I'm seven years old"],
    color: "orange",
    bg: "orange",
  },
  {
    id: 4,
    audio: nameAudio,
    audioKey: "name",
    questionText: "What's your name?",
    emoji: "👋",
    correct: "My name is Ana",
    options: ["My name is Ana", "I'm from Colombia", "I'm seven years old"],
    color: "pink",
    bg: "blue",
  },
];

const TOTAL_LIVES_PER_ROUND = 2;

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function FloatingPoints({ value, id }) {
  return (
    <div className={`wb-fp ${value > 0 ? "pos" : "neg"}`} key={id}>
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

export default function WordBuilder({ onFinish }) {
  const [questions] = useState(() => shuffle(QUESTIONS));
  const [current, setCurrent] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [lives, setLives] = useState(TOTAL_LIVES_PER_ROUND);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [comboShow, setComboShow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [shake, setShake] = useState(false);

  const audioRefs = useRef({});
  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);
  const mountedRef = useRef(true);
  const isProcessingRef = useRef(false);

  const currentQ = questions[current];

  // ── Cleanup ─────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      confetti.reset();
    };
  }, []);

  // ── Pre-load todos los audios ───────────────────────────
  useEffect(() => {
    QUESTIONS.forEach(q => {
      if (!audioRefs.current[q.audioKey]) {
        const a = new Audio(q.audio);
        a.preload = "auto";
        a.load();
        audioRefs.current[q.audioKey] = a;
      }
    });
    const c = new Audio(correctoSound);
    const w = new Audio(incorrectoSound);
    c.preload = "auto"; c.load();
    w.preload = "auto"; w.load();
    correctAudio.current = c;
    wrongAudio.current = w;
    setAudioReady(true);
  }, []);

  // ── Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  // ── Reset ronda al cambiar pregunta ─────────────────────
  useEffect(() => {
    if (!currentQ) return;
    setShuffledOptions(shuffle(currentQ.options));
    setSelected(null);
    setAnswered(false);
    setIsCorrect(false);
    setShowCorrect(false);
    setLives(TOTAL_LIVES_PER_ROUND);
    setHasPlayed(false);
    isProcessingRef.current = false;
  }, [current, currentQ]);

  // ── Play audio ──────────────────────────────────────────
  const playAudio = useCallback(() => {
    if (!currentQ) return;
    const audio = audioRefs.current[currentQ.audioKey];
    if (!audio) return;
    // Detener si ya estaba sonando y reiniciar
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().then(() => {
      setIsPlaying(true);
      setHasPlayed(true);
    }).catch(console.error);
    audio.onended = () => setIsPlaying(false);
  }, [currentQ]);

  // ── Auto-play al iniciar ronda ──────────────────────────
  useEffect(() => {
    if (!audioReady || finished) return;
    const t = setTimeout(() => {
      if (mountedRef.current) playAudio();
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, audioReady]);

  const addFloater = (val) => {
    const id = Date.now() + Math.random();
    setFloaters(f => [...f, { val, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1100);
  };

  // ── Click en opción ─────────────────────────────────────
  const handleSelect = (option, idx) => {
    if (answered || showCorrect || isProcessingRef.current) return;
    if (!currentQ) return;
    isProcessingRef.current = true;

    const correct = option === currentQ.correct;
    setSelected(idx);

    if (correct) {
      correctAudio.current && correctAudio.current.play().catch(() => { });
      setAnswered(true);
      setIsCorrect(true);
      setScore(s => s + 1);
      setAttempts(a => a + 1);  // ✅ AGREGAR AQUÍ (acertó → ronda cerrada)

      const livesUsed = TOTAL_LIVES_PER_ROUND - lives;
      let bonus;
      if (livesUsed === 0) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        bonus = newStreak >= 3 ? 15 : newStreak >= 2 ? 12 : 10;
        if (newStreak >= 3) {
          setComboShow(true);
          setTimeout(() => setComboShow(false), 1500);
        }
      } else {
        bonus = 5;
        setStreak(0);
      }
      setPoints(p => p + bonus);
      addFloater(bonus);

      if (mountedRef.current) {
        confetti({
          particleCount: 80, spread: 60, origin: { y: 0.55 },
          colors: ["#4ADE80", "#fff", "#FCD34D", "#60A5FA", "#F472B6"],
        });
      }

      // ✅ AUTO-AVANCE al acertar
      setTimeout(() => {
        if (mountedRef.current) handleNext();
      }, 1500);
    } else {
      wrongAudio.current && wrongAudio.current.play().catch(() => { });
      setStreak(0);
      setPoints(p => Math.max(0, p - 3));
      addFloater(-3);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setShowCorrect(true);
        setAnswered(true);
        setIsCorrect(false);
        setAttempts(a => a + 1);

        // ✅ AUTO-AVANCE tras game over (más tiempo para ver la respuesta correcta)
        setTimeout(() => {
          if (mountedRef.current) handleNext();
        }, 2200);
      } else {
        // Permite intentar de nuevo
        setTimeout(() => {
          setSelected(null);
          isProcessingRef.current = false;
          // Vuelve a reproducir el audio para ayudar
          if (mountedRef.current) playAudio();
        }, 800);
        return;
      }
    }
    isProcessingRef.current = false;
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setFinished(true);
      const end = Date.now() + 3000;
      const frame = () => {
        if (!mountedRef.current) return;
        confetti({ particleCount: 14, angle: 60, spread: 70, origin: { x: 0 } });
        confetti({ particleCount: 14, angle: 120, spread: 70, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  };

  const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

  // ── RESULT ────────────────────────────────────────────
  if (finished) {
    return (
      <div className="wb-screen wb-result">
        <GameBackground color="purple" />
        <div className="wb-result-card">
          <div className="wb-result-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
          <div className="wb-result-badge">🎧 Listening · Complete</div>
          <h2>¡Nivel terminado!</h2>
          <div className="wb-result-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`wb-star ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
            ))}
          </div>
          <div className="wb-result-stats">
            <div className="wb-stat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
            <div className="wb-stat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
            <div className="wb-stat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
            <div className="wb-stat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
          </div>
          {onFinish && (
            <button className="wb-btn-finish" onClick={() => onFinish(score)}>
              Continue 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── GAME ──────────────────────────────────────────────
  return (
    <div className="wb-screen">
      <GameBackground color={currentQ?.bg || "blue"} />
      {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}
      {comboShow && <div className="wb-combo-banner">🔥 COMBO x{streak}!</div>}

      {/* Header */}
      <div className="wb-header">
        <div className="wb-header-left">
          <div className="wb-level-tag">Level 1</div>
          <div className="wb-title">🎧 Listening</div>
        </div>
        <div className="wb-header-right">
          <div className="wb-stat-pill">⚡ {points}</div>
          {streak >= 2 && <div className="wb-streak">🔥 {streak}x</div>}
          <div className="wb-stat-pill">🎯 {attempts}</div>
          <div className="wb-stat-pill">⏱ {timeElapsed}s</div>
        </div>
      </div>

      {/* Dot progress */}
      <div className="wb-dot-progress">
        {questions.map((_, i) => (
          <div key={i} className={`wb-dot ${i < current ? "done" : i === current ? "active" : "pending"}`}>
            {i < current ? "✓" : ""}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className={`wb-body ${shake ? "wb-shake" : ""}`}>

        {/* Audio card */}
        <div className="wb-audio-card">
          <div className="wb-audio-emoji">{currentQ.emoji}</div>
          <button
            className={`wb-play-btn ${isPlaying ? "playing" : ""}`}
            onClick={playAudio}
            disabled={isPlaying || answered}
            aria-label="Reproducir audio"
          >
            {isPlaying ? "🔊" : "▶"}
          </button>
          <p className="wb-audio-label">
            {!hasPlayed ? "👆 Toca para escuchar" : isPlaying ? "🎵 Escucha..." : "👇 Elige la respuesta"}
          </p>
        </div>

        {/* Lives */}
        <div className="wb-lives">
          {Array.from({ length: TOTAL_LIVES_PER_ROUND }).map((_, i) => (
            <span key={i} className={`wb-heart ${i < lives ? "alive" : "lost"}`}>
              {i < lives ? "❤️" : "🖤"}
            </span>
          ))}
        </div>

        {/* Options */}
        <div className="wb-options">
          {shuffledOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isWrongPick = isSelected && answered && !isCorrect;
            const isWrongTry = isSelected && !answered && lives < TOTAL_LIVES_PER_ROUND;
            const isCorrectPick = isSelected && answered && isCorrect;
            const isRevealed = showCorrect && opt === currentQ.correct;
            const disabled = answered || showCorrect || !hasPlayed;

            return (
              <button
                key={i}
                className={`wb-option
                  ${isCorrectPick ? "correct-opt" : ""}
                  ${isWrongPick ? "wrong-opt" : ""}
                  ${isWrongTry ? "wrong-try" : ""}
                  ${isRevealed ? "revealed-opt" : ""}
                  ${disabled && !isCorrectPick && !isWrongPick && !isRevealed ? "disabled" : ""}
                `}
                onClick={() => handleSelect(opt, i)}
                disabled={disabled}
              >
                <span className="wb-option-icon">
                  {isCorrectPick ? "✅" : isWrongPick ? "❌" : isWrongTry ? "❌" : isRevealed ? "💡" : "💬"}
                </span>
                <span className="wb-option-text">{opt}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}