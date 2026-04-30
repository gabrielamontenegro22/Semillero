import React, { useState, useEffect, useRef } from "react";
import "./ListenLevel.css";
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

const questionsData = [
  { id: "morning", audio: morningAudio, correct: "morning" },
  { id: "afternoon", audio: afternoonAudio, correct: "afternoon" },
  { id: "evening", audio: eveningAudio, correct: "evening" },
  { id: "night", audio: nightAudio, correct: "night" },
];

const imagesData = [
  { id: "morning", img: morningImg, label: "Morning" },
  { id: "afternoon", img: afternoonImg, label: "Afternoon" },
  { id: "evening", img: eveningImg, label: "Evening" },
  { id: "night", img: nightImg, label: "Night" },
];

const questionBg = {
  morning: "orange", afternoon: "green", evening: "purple", night: "blue",
};

function FloatingPoints({ points, id }) {
  return <div key={id} className="floating-points">+{points}</div>;
}

export default function ListenLevel({ onFinish }) {
  const [questions] = useState(() => [...questionsData].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [shuffledImages, setShuffledImages] = useState(() => [...imagesData].sort(() => Math.random() - 0.5));
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lives, setLives] = useState(2);
  const [floatingPoints, setFloatingPoints] = useState([]);
  const [shake, setShake] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [wrongSelected, setWrongSelected] = useState(null);
  const [audioReady, setAudioReady] = useState(false);

  const audioRefs = useRef({});
  const isProcessingRef = useRef(false);
  const correctRef = useRef(null);
  const wrongRef = useRef(null);
  const mountedRef = useRef(true);

  // ── Stop confetti on unmount ──────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      confetti.reset();
    };
  }, []);

  useEffect(() => {
    questionsData.forEach(q => {
      const a = new Audio(q.audio);
      a.preload = "auto";
      a.load();
      audioRefs.current[q.id] = a;
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

  // Reproducir el audio automáticamente al cargar o cambiar de pregunta
  useEffect(() => {
    if (audioReady && !finished) {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, audioReady, finished]);

  const currentQuestion = questions[current];

  const playAudio = () => {
    if (isPlaying || isProcessingRef.current) return;

    isProcessingRef.current = true;
    const baseAudio = audioRefs.current[currentQuestion.id];
    if (!baseAudio) {
      isProcessingRef.current = false;
      return;
    }

    // Clonamos el audio para evitar que el navegador lo bloquee por estar en uso o buffering previo
    const clone = baseAudio.cloneNode();
    clone.volume = 1;
    clone.play().then(() => {
      setIsPlaying(true);
      setHasPlayed(true);
      setPlayCount(c => c + 1);
    }).catch(console.error).finally(() => {
      isProcessingRef.current = false;
    });

    clone.onended = () => setIsPlaying(false);
  };

  const addFloatingPoints = (pts) => {
    const id = Date.now();
    setFloatingPoints(prev => [...prev, { pts, id }]);
    setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
  };

  const handleSelect = (id) => {
    if (!hasPlayed) return;
    if (!correctRef.current || !wrongRef.current) return;
    if (selected && lives <= 0) return;
    if (selected && id === currentQuestion.correct) return;
    if (isPlaying || isProcessingRef.current) return;

    isProcessingRef.current = true;

    const isCorrect = id === currentQuestion.correct;

    if (isCorrect) {
      setSelected(id);
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: id }));
      correctRef.current.cloneNode().play().catch(() => { });
      setAttempts(a => a + 1);

      if (lives === 2) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        const bonus = newStreak >= 3 ? 20 : newStreak >= 2 ? 15 : 10;
        setTotalPoints(p => p + bonus);
        addFloatingPoints(bonus);
      } else {
        setTotalPoints(p => p + 5);
        addFloatingPoints(5);
      }

      setBounce(true); setTimeout(() => setBounce(false), 600);
      setTimeout(() => { if (mountedRef.current) nextQuestion(); }, 1500);

    } else {
      wrongRef.current.cloneNode().play().catch(() => { });
      setStreak(0);
      setWrongSelected(id);
      setShake(true); setTimeout(() => setShake(false), 500);

      const remaining = lives - 1;
      setLives(remaining);

      if (remaining <= 0) {
        setSelected(id);
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: id }));
        setAttempts(a => a + 1);
        setTimeout(() => { if (mountedRef.current) nextQuestion(); }, 2500);
      } else {
        setTimeout(() => {
          setSelected(null);
          if (mountedRef.current) {
            isProcessingRef.current = false;
            playAudio(false);
          }
        }, 1000);
      }
    }
  };

  const nextQuestion = () => {
    isProcessingRef.current = false;
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setHasPlayed(false); setPlayCount(0);
      setWrongSelected(null);
      setLives(2);
      setShuffledImages([...imagesData].sort(() => Math.random() - 0.5));
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

  const score = questions.reduce((acc, q) => (answers[q.id] === q.correct ? acc + 1 : acc), 0);
  const progress = ((current + (selected ? 1 : 0)) / questions.length) * 100;
  const bgColor = questionBg[currentQuestion?.id] || "teal";
  const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

  if (!audioReady) return (
    <div className="listen-container">
      <GameBackground color="teal" />
      <div className="game-wrapper"><p className="instruction">🎵 Cargando audios...</p></div>
    </div>
  );

  // ── RESULT ──────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="listen-container" style={{ background: "linear-gradient(160deg,#0F0A1E,#1A1330,#0F0A1E)", alignItems: "center", justifyContent: "center" }}>
        <GameBackground color="purple" />
        {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
        <div className="ll-result-card">
          <div className="ll-result-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
          <div className="ll-result-badge">Listen & Choose · Complete</div>
          <h2 className="ll-result-title">¡Nivel terminado!</h2>
          <div className="ll-result-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`ll-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
            ))}
          </div>
          <div className="ll-result-stats">
            <div className="ll-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
            <div className="ll-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
            <div className="ll-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
            <div className="ll-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
            <div className="ll-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
          </div>
          {onFinish && (
            <button className="ll-result-btn" onClick={() => onFinish(score)}>
              Continue 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── GAME ─────────────────────────────────────────────────────
  return (
    <div className="ll-game-root">
      <GameBackground color={bgColor} />
      {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

      {/* ── Header bar ── */}
      <div className="ll-header-bar">
        <div className="ll-header-left">
          <span className="ll-header-badge">Level 1</span>
          <span className="ll-header-title">🎧 Listening</span>
        </div>
        <div className="ll-header-right">
          <div className="ll-header-pill">⚡ {totalPoints}</div>
          {streak >= 2 && <div className="ll-header-pill ll-streak-pill">🔥 {streak}x</div>}
          <div className="ll-header-pill">🎯 {attempts}</div>
          <div className="ll-header-pill">⏱ {timeElapsed}s</div>
        </div>
      </div>

      <div className="listen-container">

        <div className={`game-wrapper ${shake ? "shake" : ""} ${bounce ? "bounce" : ""}`}>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="progress-steps">
              {questions.map((_, i) => (
                <div key={i} className={`progress-dot ${i < current ? "done" : i === current ? "active" : ""}`} />
              ))}
            </div>
          </div>

          <p className="instruction">👂 Listen and pick the right image!</p>

          <button
            className={`play-btn ${isPlaying ? "playing" : ""} ${!hasPlayed ? "pulse-hint" : ""}`}
            onClick={playAudio}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <><span className="wave-bars"><span /><span /><span /><span /><span /></span>Playing…</>
            ) : (
              <>🔊 {playCount > 0 ? "Play Again" : "Play Audio"}</>
            )}
          </button>

          <div style={{ textAlign: "center", margin: "12px 0", fontSize: "28px" }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} style={{ margin: "0 6px", transition: "transform 0.3s", display: "inline-block", transform: i < lives ? "scale(1)" : "scale(0.85)", opacity: i < lives ? 1 : 0.6 }}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>

          <div style={{ height: "20px", position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
            {!hasPlayed && lives === 2 && <p className="hint-text" style={{ position: "absolute", top: 0, margin: 0 }}>▲ Press play before choosing!</p>}
            {lives === 1 && wrongSelected && !selected && <div className="retry-banner" style={{ position: "absolute", top: "-10px", margin: 0, zIndex: 10, whiteSpace: "nowrap" }}>❌ ¡Incorrecto! 🎧 Escucha de nuevo e intenta otra vez</div>}
            {lives <= 0 && wrongSelected && (
              <div className="retry-banner failed" style={{ position: "absolute", top: "-10px", margin: 0, zIndex: 10, whiteSpace: "nowrap" }}>😔 No fue correcto — continúa a la siguiente pregunta</div>
            )}
          </div>

          <div className="images-grid">
            {shuffledImages.map(img => {
              const isSelected = selected === img.id;
              const isCorrect = isSelected && img.id === currentQuestion.correct;
              const isWrong = isSelected && img.id !== currentQuestion.correct;
              const isWrongPrev = lives === 1 && img.id === wrongSelected;
              const isLocked = !!selected && !isSelected && lives <= 0;
              const canClick = !selected && hasPlayed && lives > 0 && !isPlaying;
              const retryReady = lives === 1 && hasPlayed && !isPlaying && !selected;
              return (
                <div
                  key={img.id}
                  className={`image-card ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""} ${isWrongPrev ? "wrong-prev" : ""} ${isLocked ? "locked" : ""} ${(canClick || retryReady) ? "hoverable" : ""}`}
                  onClick={() => handleSelect(img.id)}
                >
                  <div className="card-inner">
                    <img src={img.img} alt={img.id} />
                    <div className="card-label">{img.label}</div>
                    {isCorrect && <div className="card-badge correct-badge">✓</div>}
                    {isWrong && <div className="card-badge wrong-badge">✗</div>}
                    {isWrongPrev && !isSelected && <div className="card-badge wrong-badge">✗</div>}
                    {lives <= 0 && img.id === wrongSelected && !isSelected && <div className="card-badge wrong-badge">✗</div>}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}