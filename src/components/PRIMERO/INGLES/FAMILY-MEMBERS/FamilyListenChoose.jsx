import React, { useState, useEffect, useRef, useCallback } from "react";
import "./FamilyListenChoose.css";
import GameBackground from "../GameBackground";
import confetti from "canvas-confetti";

import fatherImg from "../../../../assets/fatherlevel3.png";
import motherImg from "../../../../assets/motherlevel3.png";
import sisterImg from "../../../../assets/sisterlevel3.png";
import brotherImg from "../../../../assets/brotherlevel3.png";
import grandfatherImg from "../../../../assets/grandfatherlevel3.png";
import grandmotherImg from "../../../../assets/grandmotherlevel3.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";
import fatherAudio from "../../../../assets/sounds/father.mp3";
import motherAudio from "../../../../assets/sounds/mother.mp3";
import sisterAudio from "../../../../assets/sounds/sister.mp3";
import brotherAudio from "../../../../assets/sounds/brother.mp3";
import grandfatherAudio from "../../../../assets/sounds/grandfather.mp3";
import grandmotherAudio from "../../../../assets/sounds/grandmother.mp3";

const MEMBERS = [
  { id: "father", phrase: "This is my father", img: fatherImg, audio: fatherAudio, color: "#3B82F6", bg: "rgba(59,130,246,0.18)" },
  { id: "mother", phrase: "This is my mother", img: motherImg, audio: motherAudio, color: "#EC4899", bg: "rgba(236,72,153,0.18)" },
  { id: "sister", phrase: "This is my sister", img: sisterImg, audio: sisterAudio, color: "#F59E0B", bg: "rgba(245,158,11,0.18)" },
  { id: "brother", phrase: "This is my brother", img: brotherImg, audio: brotherAudio, color: "#10B981", bg: "rgba(16,185,129,0.18)" },
  { id: "grandfather", phrase: "This is my grandfather", img: grandfatherImg, audio: grandfatherAudio, color: "#8B5CF6", bg: "rgba(139,92,246,0.18)" },
  { id: "grandmother", phrase: "This is my grandmother", img: grandmotherImg, audio: grandmotherAudio, color: "#EF4444", bg: "rgba(239,68,68,0.18)" },
];

const TOTAL_ROUNDS = 6;
const TOTAL_LIVES_PER_ROUND = 2;

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function FloatingPoints({ value, id }) {
  return (
    <div className={`flc-fp ${value > 0 ? "flc-fp-pos" : "flc-fp-neg"}`} key={id}>
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

export default function FamilyListenChoose({ onFinish }) {
  const [rounds] = useState(() => shuffle(MEMBERS).slice(0, TOTAL_ROUNDS));
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [lives, setLives] = useState(TOTAL_LIVES_PER_ROUND);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);
  const [wrongIds, setWrongIds] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const timerRef = useRef(null);
  const fpRef = useRef(0);
  const audioRefs = useRef({});
  const correctAudioRef = useRef(null);
  const incorrectAudioRef = useRef(null);
  const mountedRef = useRef(true);
  const isProcessingRef = useRef(false);

  // ── Pre-load audios (AGRESIVO) ─────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    // ✅ OPTIMIZACIÓN: pre-carga forzada de TODOS los audios
    MEMBERS.forEach(m => {
      const a = new Audio();
      a.preload = "auto";
      a.src = m.audio;
      a.load();
      a.volume = 1;
      audioRefs.current[m.id] = a;
    });
    const c = new Audio(correctoSound);
    const i = new Audio(incorrectoSound);
    c.preload = "auto"; c.load();
    i.preload = "auto"; i.load();
    correctAudioRef.current = c;
    incorrectAudioRef.current = i;

    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
      confetti.reset();
    };
  }, []);

  const question = rounds[current];

  // ── Reset al cambiar ronda ─────────────────────────────
  useEffect(() => {
    if (!question) return;
    const others = shuffle(MEMBERS.filter(m => m.id !== question.id)).slice(0, 3);
    setOptions(shuffle([question, ...others]));
    setSelected(null);
    setIsCorrect(null);
    setShowPhrase(false);
    setWrongIds([]);
    setLives(TOTAL_LIVES_PER_ROUND);
    setRevealed(false);
    isProcessingRef.current = false;

    // ✅ OPTIMIZACIÓN: delay reducido de 600ms → 100ms
    setTimeout(() => {
      if (mountedRef.current) playAudio();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, question]);

  // ── Timer ──────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = () => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ✅ OPTIMIZACIÓN: sin cloneNode (más rápido, reusa el mismo audio)
  const playAudio = useCallback(() => {
    if (!question) return;
    const audio = audioRefs.current[question.id];
    if (!audio) return;
    audio.pause();           // corta si estaba sonando
    audio.currentTime = 0;   // reinicia
    audio.volume = 1;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => setIsPlaying(false));
    audio.onended = () => setIsPlaying(false);
  }, [question]);

  const addFloater = (val) => {
    const id = fpRef.current++;
    setFloaters(f => [...f, { id, value: val }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1000);
  };

  // ── Click en opción ────────────────────────────────────
  const handleSelect = (member) => {
    if (isProcessingRef.current) return;
    if (isCorrect === true || revealed) return;
    if (wrongIds.includes(member.id)) return;
    isProcessingRef.current = true;

    const correct = member.id === question.id;
    setSelected(member.id);

    if (correct) {
      setIsCorrect(true);
      setShowPhrase(true);
      setCorrectCount(c => c + 1);
      setAttempts(a => a + 1);
      if (correctAudioRef.current) correctAudioRef.current.cloneNode().play().catch(() => { });

      const livesUsed = TOTAL_LIVES_PER_ROUND - lives;
      let bonus;
      if (livesUsed === 0) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setBestStreak(b => Math.max(b, newStreak));
        bonus = newStreak >= 3 ? 20 : newStreak >= 2 ? 15 : 10;
      } else {
        bonus = 5;
        setStreak(0);
      }
      setPoints(p => p + bonus);
      addFloater(bonus);

      confetti({
        particleCount: 60, spread: 70, origin: { y: 0.6 },
        colors: [question.color, "#fff", "#f9ca24"]
      });

      setTimeout(() => {
        if (mountedRef.current) nextQuestion();
      }, 1800);
    } else {
      setIsCorrect(false);
      setWrongIds(w => [...w, member.id]);
      setStreak(0);
      addFloater(-3);
      if (incorrectAudioRef.current) incorrectAudioRef.current.cloneNode().play().catch(() => { });
      setPoints(p => Math.max(0, p - 3));

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setRevealed(true);
        setShowPhrase(true);
        setSelected(question.id);
        setAttempts(a => a + 1);
        setTimeout(() => {
          if (mountedRef.current) nextQuestion();
        }, 2500);
      } else {
        setTimeout(() => {
          if (mountedRef.current) {
            setSelected(null);
            setIsCorrect(null);
            isProcessingRef.current = false;
            playAudio();
          }
        }, 800);
        return;
      }
    }
    isProcessingRef.current = false;
  };

  const nextQuestion = () => {
    if (current + 1 >= TOTAL_ROUNDS) {
      clearInterval(timerRef.current);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#7C5CFC", "#EC4899", "#FCD34D", "#34D399", "#60A5FA"] });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors: ["#FCD34D", "#F87171", "#A78BFA"] });
        confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors: ["#34D399", "#60A5FA", "#FBCFE8"] });
      }, 300);
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  /* ── RESULT SCREEN ─────────────────────────────────────── */
  if (finished) {
    const stars = correctCount >= 5 ? 3 : correctCount >= 3 ? 2 : 1;
    return (
      <div className="flc-result-screen">
        <GameBackground color="purple" />
        <div className="flc-result-card">
          <div className="flc-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🎯" : "💪"}</div>
          <div className="flc-result-badge">Listen &amp; Choose · Complete</div>
          <h2>¡Nivel terminado!</h2>
          <div className="flc-result-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`flc-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
            ))}
          </div>
          <div className="flc-result-stats">
            <div className="flc-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{TOTAL_ROUNDS}</strong></div>
            <div className="flc-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
            <div className="flc-rstat"><span>🔥</span><span>Best Streak</span><strong>{bestStreak}x</strong></div>
            <div className="flc-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
            <div className="flc-rstat"><span>⏱</span><span>Time</span><strong>{formatTime()}</strong></div>
          </div>
          <button className="flc-result-btn" onClick={() => onFinish(correctCount)}>
            Continue 🚀
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flc-root">
      <GameBackground color="purple" />

      {floaters.map(f => <FloatingPoints key={f.id} value={f.value} id={f.id} />)}

      {/* Header */}
      <div className="flc-header">
        <div className="flc-header-left">
          <span className="flc-level-tag">Level 1</span>
          <span className="flc-title">🎧 Listening</span>
        </div>
        <div className="flc-header-right">
          <div className="flc-stat-pill">⚡ {points}</div>
          {streak >= 2 && <div className="flc-stat-pill flc-streak">🔥 {streak}x</div>}
          <div className="flc-stat-pill">🎯 {attempts}</div>
          <div className="flc-stat-pill">⏱ {formatTime()}</div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flc-progress-dots">
        {rounds.map((_, i) => (
          <div key={i} className={`flc-dot ${i < current ? "done" : i === current ? "active" : ""}`} />
        ))}
      </div>

      {/* Main content */}
      <div className="flc-content">

        {/* Audio button + lives */}
        <div className="flc-audio-section">
          <span className="flc-audio-label">🎧 Listen!</span>
          <button
            className={`flc-audio-btn ${isPlaying ? "playing" : ""}`}
            onClick={playAudio}
            disabled={isPlaying}
          >
            <span className="flc-audio-icon">{isPlaying ? "🔊" : "▶"}</span>
            <span className="flc-audio-text">{isPlaying ? "Playing..." : "Play phrase"}</span>
            {isPlaying && <span className="flc-audio-wave"><span /><span /><span /><span /><span /></span>}
          </button>

          <div className="flc-lives-row">
            {Array.from({ length: TOTAL_LIVES_PER_ROUND }).map((_, i) => (
              <span key={i} className={`flc-heart ${i < lives ? "alive" : "lost"}`}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>

          {showPhrase && (
            <div className="flc-phrase-reveal" style={{ borderColor: question.color }}>
              <span className="flc-phrase-text">"{question.phrase}"</span>
            </div>
          )}
        </div>

        {/* 4 image options */}
        <div className="flc-options-grid">
          {options.map(opt => {
            const isWrong = wrongIds.includes(opt.id);
            const isChosen = selected === opt.id;
            const isAnswer = isCorrect === true && isChosen;
            const isRevealed = revealed && opt.id === question.id;
            return (
              <button
                key={opt.id}
                className={`flc-option
                  ${isAnswer ? "flc-option-correct" : ""}
                  ${isRevealed ? "flc-option-revealed" : ""}
                  ${isWrong ? "flc-option-wrong" : ""}
                  ${isChosen && isCorrect === false && !revealed ? "flc-option-shake" : ""}
                `}
                style={{ "--opt-color": opt.color, "--opt-bg": opt.bg }}
                onClick={() => handleSelect(opt)}
                disabled={isWrong || isCorrect === true || revealed}
              >
                <div className="flc-option-img-wrap">
                  <img src={opt.img} alt={opt.id} className="flc-option-img" />
                </div>
                {isAnswer && <div className="flc-option-badge correct">✓</div>}
                {isRevealed && <div className="flc-option-badge revealed">💡</div>}
                {isWrong && <div className="flc-option-badge wrong">✗</div>}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}