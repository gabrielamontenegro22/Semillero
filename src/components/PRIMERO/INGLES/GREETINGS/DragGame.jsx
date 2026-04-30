import React, { useState, useEffect, useRef } from "react";
import "./DragGame.css";
import GameBackground from "../GameBackground";
import confetti from "canvas-confetti";

import morning from "../../../../assets/morning.png";
import afternoon from "../../../../assets/afternoon.jpg";
import evening from "../../../../assets/evening.png";
import night from "../../../../assets/night.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const cardsData = [
  { id: 1, text: "Good morning", key: "morning" },
  { id: 2, text: "Good afternoon", key: "afternoon" },
  { id: 3, text: "Good evening", key: "evening" },
  { id: 4, text: "Good night", key: "night" },
];

const rows = [
  { id: "morning", img: morning, emoji: "🌅", label: "Morning" },
  { id: "afternoon", img: afternoon, emoji: "☀️", label: "Afternoon" },
  { id: "evening", img: evening, emoji: "🌆", label: "Evening" },
  { id: "night", img: night, emoji: "🌙", label: "Night" },
];

const zoneColors = {
  morning: "orange", afternoon: "green", evening: "purple", night: "blue",
};

// Map para encontrar la card correcta por zone id
const correctTextByZone = cardsData.reduce((acc, c) => ({ ...acc, [c.key]: c.text }), {});

const POINTS_CORRECT = 10;
const POINTS_WRONG = -3;
const TOTAL_LIVES = 3;

function FloatingPoints({ value, id }) {
  return (
    <div className={`fp fp-${value > 0 ? "pos" : "neg"}`} key={id}>
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

export default function DragGame({ onFinish }) {
  const [cards] = useState(() => [...cardsData].sort(() => Math.random() - 0.5));
  const [shuffledRows] = useState(() => [...rows].sort(() => Math.random() - 0.5));
  const [placements, setPlacements] = useState({});
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [bgColor, setBgColor] = useState("blue");
  const [finished, setFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      confetti.reset();
    };
  }, []);

  useEffect(() => {
    const c = new Audio(correctoSound);
    const w = new Audio(incorrectoSound);
    c.preload = "auto"; w.preload = "auto";
    c.load(); w.load();
    correctAudio.current = c;
    wrongAudio.current = w;
  }, []);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const formatTime = () => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const addFloater = (val) => {
    const id = Date.now() + Math.random();
    setFloaters(f => [...f, { val, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1100);
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("key", card.key);
    e.dataTransfer.setData("text", card.text);
    setDragging(card.key);
  };

  const handleDragEnd = () => setDragging(null);

  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    setDragOver(null);

    // Si ya está bloqueada (correcta o revelada) o se acabó el juego, ignora
    if (placements[zoneId]?.locked || gameOver) return;

    const key = e.dataTransfer.getData("key");
    const text = e.dataTransfer.getData("text");
    const isCorrect = key === zoneId;

    setBgColor(zoneColors[zoneId] || "blue");

    if (isCorrect) {
      correctAudio.current.currentTime = 0;
      correctAudio.current.play();
      setAttempts(a => a + 1);

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const bonus = newStreak >= 3 ? 15 : newStreak >= 2 ? 12 : POINTS_CORRECT;
      setPoints(p => p + bonus);
      addFloater(bonus);
      if (mountedRef.current) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 }, colors: ["#4ADE80", "#fff", "#FCD34D"] });
      }

      // ✅ FIX CARD FANTASMA: limpia esta card de cualquier otra zona donde haya estado mal
      setPlacements(prev => {
        const newPlacements = { ...prev, [zoneId]: { text, correct: true, locked: true, animate: true } };
        Object.keys(newPlacements).forEach(k => {
          if (k !== zoneId && !newPlacements[k]?.locked && newPlacements[k]?.text === text) {
            delete newPlacements[k];
          }
        });
        return newPlacements;
      });

      setTimeout(() => {
        setPlacements(prev => prev[zoneId] ? ({ ...prev, [zoneId]: { ...prev[zoneId], animate: false } }) : prev);
      }, 600);

    } else {
      // ❌ ERROR
      wrongAudio.current.currentTime = 0;
      wrongAudio.current.play();
      setStreak(0);
      setPoints(p => Math.max(0, p + POINTS_WRONG));
      addFloater(POINTS_WRONG);

      const remaining = lives - 1;
      setLives(remaining);

      // Muestra el placement como wrong temporalmente
      setPlacements(prev => ({ ...prev, [zoneId]: { text, correct: false, locked: false, animate: true } }));

      if (remaining <= 0) {
        // 💔 GAME OVER: revela todas las zonas faltantes y termina
        setAttempts(a => a + 1);
        setGameOver(true);
        setTimeout(() => {
          if (!mountedRef.current) return;
          setPlacements(prev => {
            const next = { ...prev };
            shuffledRows.forEach(r => {
              if (!next[r.id]?.correct) {
                next[r.id] = {
                  text: correctTextByZone[r.id],
                  correct: false,
                  revealed: true,
                  locked: true,
                  animate: true
                };
              }
            });
            return next;
          });
        }, 800);
      } else {
        // Le quedan vidas: limpia el placement temporal tras 1.2s
        setTimeout(() => {
          if (!mountedRef.current) return;
          setPlacements(prev => {
            if (prev[zoneId]?.locked) return prev;
            const newP = { ...prev };
            delete newP[zoneId];
            return newP;
          });
        }, 1200);
      }
    }
  };

  // Conteo: solo zonas correctas (no reveladas) cuentan como aciertos reales
  const correctCount = Object.values(placements).filter(p => p.correct === true).length;
  const resolvedCount = Object.values(placements).filter(p => p.locked === true).length;
  const allResolved = resolvedCount === shuffledRows.length;

  const getStars = () => {
    if (correctCount === 4 && attempts === 4) return 3;
    if (correctCount >= 3) return 2;
    if (correctCount >= 1) return 1;
    return 0;
  };

  const handleFinish = () => {
    if (finished) return;
    setFinished(true);
    if (correctCount > 0) {
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

  // Auto-finish cuando todas estén resueltas (correctas o reveladas)
  useEffect(() => {
    if (allResolved && !finished) {
      const t = setTimeout(() => { if (mountedRef.current) handleFinish(); }, 1800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allResolved, finished]);

  const usedKeys = Object.entries(placements)
    .filter(([, v]) => v.correct === true || v.revealed === true)
    .map(([k]) => k);
  const availableCards = cards.filter(c => !usedKeys.includes(c.key));
  const stars = getStars();

  // ── RESULT ──────────────────────────────────────────────
  if (finished) {
    return (
      <div className="dg-container dg-result" style={{ background: "linear-gradient(160deg,#0F0A1E,#1A1330,#0F0A1E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GameBackground color="purple" />
        {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}
        <div className="dg-result-card">
          <div className="dg-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🎯" : stars === 1 ? "💪" : "😔"}</div>
          <div className="dg-result-badge">Match Greetings · Complete</div>
          <h2>¡Nivel terminado!</h2>
          <div className="dg-result-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`dg-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
            ))}
          </div>
          <div className="dg-result-stats">
            <div className="dg-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/4</strong></div>
            <div className="dg-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
            <div className="dg-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
            <div className="dg-rstat"><span>⏱</span><span>Time</span><strong>{formatTime()}</strong></div>
          </div>
          {onFinish && (
            <button className="dg-result-btn" onClick={() => onFinish(correctCount)}>
              Continue 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── GAME ─────────────────────────────────────────────────
  return (
    <>
      <div className="dg-header-bar">
        <div className="dg-header-left">
          <span className="dg-header-badge">Level 2</span>
          <span className="dg-header-title">👁️Reading</span>
        </div>
        <div className="dg-header-right">
          <div className="dg-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="dg-header-pill dg-streak-pill">🔥 {streak}x</div>}
          <div className="dg-header-pill">🎯 {attempts}</div>
          <div className="dg-header-pill">⏱ {formatTime()}</div>
        </div>
      </div>

      <div className="dg-container">
        <GameBackground color={bgColor} />
        {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}

        {/* Progress bar */}
        <div className="dg-progress-track">
          <div className="dg-progress-fill" style={{ width: `${(resolvedCount / 4) * 100}%` }} />
          <span className="dg-progress-label">{correctCount} / 4 correct</span>
        </div>

        {/* Vidas globales (igual estilo que Nivel 1) */}
        <div className="dg-lives-container">
          {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
            <span key={i} className={`dg-life ${i < lives ? "alive" : "lost"}`}>
              {i < lives ? "❤️" : "🖤"}
            </span>
          ))}
        </div>

        {/* Banner de game over */}
        {gameOver && (
          <div className="dg-banner failed">
            😔 Se acabaron las vidas — observa las respuestas correctas
          </div>
        )}

        {/* Draggable cards */}
        <div className="dg-cards-row">
          {availableCards.length > 0 ? availableCards.map(card => (
            <div
              key={card.id}
              className={`dg-card ${dragging === card.key ? "dg-card-dragging" : ""} ${gameOver ? "dg-card-disabled" : ""}`}
              draggable={!gameOver}
              onDragStart={e => !gameOver && handleDragStart(e, card)}
              onDragEnd={handleDragEnd}
            >
              <span className="dg-card-icon">💬</span>
              {card.text}
            </div>
          )) : <div className="dg-all-placed">✅ All cards placed!</div>}
        </div>

        {/* Drop zones */}
        <div className="dg-grid">
          {shuffledRows.map(row => {
            const placement = placements[row.id];
            const isOver = dragOver === row.id;
            const isCorrect = placement?.correct === true;
            const isWrong = placement && !placement.correct && !placement.revealed;
            const isRevealed = placement?.revealed === true;
            const isLocked = placement?.locked === true;

            return (
              <div
                key={row.id}
                className={`dg-zone ${isCorrect ? "dg-zone-correct" : ""} ${isWrong ? "dg-zone-wrong" : ""} ${isRevealed ? "dg-zone-revealed" : ""} ${isOver ? "dg-zone-over" : ""}`}
                onDrop={e => handleDrop(e, row.id)}
                onDragOver={e => {
                  if (isLocked || gameOver) return;
                  e.preventDefault();
                  setDragOver(row.id);
                  setBgColor(zoneColors[row.id] || "blue");
                }}
                onDragLeave={() => setDragOver(null)}
              >
                <div className="dg-zone-img-wrap">
                  <img src={row.img} alt={row.label} className="dg-zone-img" />
                  <div className="dg-zone-img-overlay"><span>{row.emoji}</span></div>
                </div>
                <div className={`dg-drop-target ${placement?.animate ? "dg-bounce" : ""}`}>
                  {placement ? (
                    <>
                      <span className="dg-drop-icon">
                        {isCorrect ? "✓" : isRevealed ? "💡" : "✗"}
                      </span>
                      <span className="dg-drop-text">{placement.text}</span>
                      {isCorrect && placement.animate && (
                        <span className="dg-plus">+{streak >= 3 ? 15 : streak >= 2 ? 12 : 10}</span>
                      )}
                    </>
                  ) : (
                    <span className="dg-drop-hint">{isOver ? "🎯 Drop here!" : "Drop here"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allResolved && !finished && (
          <button className="dg-finish-btn" onClick={handleFinish}>
            🏁 Finish Level!
          </button>
        )}
      </div>
    </>
  );
}