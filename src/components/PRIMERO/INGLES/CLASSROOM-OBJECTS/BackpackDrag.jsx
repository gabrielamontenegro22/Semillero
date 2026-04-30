import React, { useState, useEffect, useRef, useCallback } from "react";
import "./BackpackDrag.css";
import GameBackground from "../GameBackground";
import confetti from "canvas-confetti";

import penImg from "../../../../assets/pen.png";
import pencilImg from "../../../../assets/pencil.png";
import notebookImg from "../../../../assets/notebook.png";
import rulerImg from "../../../../assets/ruler.png";
import eraserImg from "../../../../assets/eraser.png";
import sharpenerImg from "../../../../assets/sharpener.png";
import bookImg from "../../../../assets/book.png";
import scissorsImg from "../../../../assets/scissors.png";
import backpackImg from "../../../../assets/backpack.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";
import packPen from "../../../../assets/sounds/packthepen.mp3";
import packPencil from "../../../../assets/sounds/packthepencil.mp3";
import packNotebook from "../../../../assets/sounds/packthenotebook.mp3";
import packRuler from "../../../../assets/sounds/packtheruler.mp3";
import packEraser from "../../../../assets/sounds/packtheeraser.mp3";
import packSharpener from "../../../../assets/sounds/packthesharpener.mp3";
import packBook from "../../../../assets/sounds/packthebook.mp3";
import packScissors from "../../../../assets/sounds/packthescissor.mp3";

const VOCABULARY = [
  { id: "pen", word: "pen", img: penImg, audio: packPen, color: "#FF6B6B", glow: "rgba(255,107,107,0.6)" },
  { id: "pencil", word: "pencil", img: pencilImg, audio: packPencil, color: "#FFD93D", glow: "rgba(255,217,61,0.6)" },
  { id: "notebook", word: "notebook", img: notebookImg, audio: packNotebook, color: "#6BCB77", glow: "rgba(107,203,119,0.6)" },
  { id: "ruler", word: "ruler", img: rulerImg, audio: packRuler, color: "#4D96FF", glow: "rgba(77,150,255,0.6)" },
  { id: "eraser", word: "eraser", img: eraserImg, audio: packEraser, color: "#FF922B", glow: "rgba(255,146,43,0.6)" },
  { id: "sharpener", word: "sharpener", img: sharpenerImg, audio: packSharpener, color: "#CC5DE8", glow: "rgba(204,93,232,0.6)" },
  { id: "book", word: "book", img: bookImg, audio: packBook, color: "#F06595", glow: "rgba(240,101,149,0.6)" },
  { id: "scissors", word: "scissors", img: scissorsImg, audio: packScissors, color: "#20C997", glow: "rgba(32,201,151,0.6)" },
];
const POINTS_CORRECT = 10;
const POINTS_WRONG = -3;
const MAX_LIVES = 2;

// Pure function — builds 3 options for a given correct item
function makeOptions(correctItem) {
  const others = VOCABULARY
    .filter(v => v.id !== correctItem.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  return [...others, correctItem].sort(() => Math.random() - 0.5);
}

function FloatingPoints({ value, id }) {
  return (
    <div className={`bd-fp bd-fp-${value > 0 ? "pos" : "neg"}`} key={id}>
      {value > 0 ? `+${value} ⭐` : `${value}`}
    </div>
  );
}

export default function BackpackDrag({ onFinish }) {
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState([]);

  const [draggedItem, setDraggedItem] = useState(null);
  const [isOverBag, setIsOverBag] = useState(false);
  const [shakingItem, setShakingItem] = useState(null);
  const [bagSuccess, setBagSuccess] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [touchItem, setTouchItem] = useState(null);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });

  const [points, setPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [itemAttempts, setItemAttempts] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  // 💡 NUEVO: Reveal amarillo cuando pierde vidas
  const [revealCorrect, setRevealCorrect] = useState(false);

  const [floaters, setFloaters] = useState([]);
  const [particles, setParticles] = useState([]);

  const bagRef = useRef(null);
  const mountedRef = useRef(true);
  const floaterId = useRef(0);
  const audioRef = useRef({});
  const curAudioRef = useRef(null);
  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);
  const roundsRef = useRef([]);
  const idxRef = useRef(0);
  const attemptsRef = useRef({});

  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { attemptsRef.current = itemAttempts; }, [itemAttempts]);

  // ── Init ──────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    correctAudio.current = new Audio(correctoSound);
    wrongAudio.current = new Audio(incorrectoSound);
    correctAudio.current.preload = wrongAudio.current.preload = "auto";
    VOCABULARY.forEach(v => {
      const a = new Audio(v.audio); a.preload = "auto"; a.load();
      audioRef.current[v.id] = a;
    });
    const shuffled = [...VOCABULARY].sort(() => Math.random() - 0.5).slice(0, 5);
    roundsRef.current = shuffled;
    setRounds(shuffled);
    setOptions(makeOptions(shuffled[0]));
    setTimeout(() => speakItem(shuffled[0]), 600);
    return () => { mountedRef.current = false; confetti.reset(); };
  }, []);

  // ── Timer ─────────────────────────────────────────────
  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  // ── Confetti burst ─────────────────────────────────────
  useEffect(() => {
    if (!finished) return;
    const end = Date.now() + 2800;
    const frame = () => {
      if (!mountedRef.current) return;
      confetti({ particleCount: 12, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 12, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [finished]);

  // ── Audio ─────────────────────────────────────────────
  const speakItem = (item) => {
    if (!item) return;
    if (curAudioRef.current) { curAudioRef.current.pause(); curAudioRef.current.currentTime = 0; }
    const a = audioRef.current[item.id];
    if (a) { a.currentTime = 0; curAudioRef.current = a; a.play().catch(() => { }); }
  };
  const stopAudio = () => {
    if (curAudioRef.current) { curAudioRef.current.pause(); curAudioRef.current.currentTime = 0; }
  };

  // ── Floaters & particles ──────────────────────────────
  const addFloater = (val) => {
    const id = floaterId.current++;
    setFloaters(f => [...f, { val, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };
  const spawnParticles = () => {
    const EM = ["⭐", "✨", "🌟", "💫", "🎉", "🎊", "📚"];
    const ps = Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i, x: 20 + Math.random() * 60, y: 10 + Math.random() * 65,
      emoji: EM[Math.floor(Math.random() * EM.length)],
      size: 20 + Math.random() * 24, angle: Math.random() * 360,
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 1000);
  };

  // ── Advance to next round ─────────────────────────────
  const advanceAfter = (delay, nextIdx) => {
    setTimeout(() => {
      if (!mountedRef.current) return;
      stopAudio();
      const allRounds = roundsRef.current;
      if (nextIdx >= allRounds.length) {
        setFinished(true);
        return;
      }
      const nextItem = allRounds[nextIdx];
      setOptions(makeOptions(nextItem));
      setCurrentIdx(nextIdx);
      setRevealCorrect(false);  // 💡 limpiar reveal al cambiar de ronda
      setTimeout(() => speakItem(nextItem), 500);
    }, delay);
  };

  // ── Handle correct ────────────────────────────────────
  const handleSuccess = (item) => {
    if (correctAudio.current) { correctAudio.current.currentTime = 0; correctAudio.current.play().catch(() => { }); }
    setBagSuccess(true); setTimeout(() => setBagSuccess(false), 700);

    const idx = idxRef.current;
    const tries = attemptsRef.current[idx] || 0;
    const first = tries === 0;

    setStreak(s => {
      const ns = first ? s + 1 : 0;
      setBestStreak(b => Math.max(b, ns));
      const bonus = first ? (ns >= 3 ? 15 : ns >= 2 ? 12 : POINTS_CORRECT) : 5;
      setPoints(p => p + bonus);
      addFloater(bonus);
      return ns;
    });
    setAttempts(a => a + 1);
    setCorrectCount(c => c + 1);
    spawnParticles();
    if (mountedRef.current) confetti({ particleCount: 60, spread: 65, origin: { y: 0.5 }, colors: ["#7C5CFC", "#FFD700", "#4ADE80", "#FF6B6B", "#38BDF8"] });

    advanceAfter(850, idx + 1);
  };

  // ── Handle wrong ──────────────────────────────────────
  const handleError = (itemId) => {
    if (wrongAudio.current) { wrongAudio.current.currentTime = 0; wrongAudio.current.play().catch(() => { }); }
    setShakingItem(itemId); setWrongFlash(true);
    setStreak(0); setPoints(p => Math.max(0, p + POINTS_WRONG)); addFloater(POINTS_WRONG);
    setTimeout(() => setShakingItem(null), 500);
    setTimeout(() => setWrongFlash(false), 600);

    const idx = idxRef.current;
    const na = (attemptsRef.current[idx] || 0) + 1;
    setItemAttempts(prev => ({ ...prev, [idx]: na }));

    if (na >= MAX_LIVES) {
      // 💡 NUEVO: cuando se acaban las vidas, mostrar la respuesta correcta
      setAttempts(a => a + 1);
      setRevealCorrect(true);                // ✨ ilumina respuesta correcta
      advanceAfter(2500, idx + 1);           // ← antes 1200, ahora 2500 (más tiempo para ver la respuesta)
    } else {
      setTimeout(() => speakItem(roundsRef.current[idx]), 800);
    }
  };

  // ── Drag & drop ───────────────────────────────────────
  const hDragStart = (e, item) => setDraggedItem(item);
  const hDragEnd = () => setDraggedItem(null);
  const hDragOver = (e) => { e.preventDefault(); setIsOverBag(true); };
  const hDragLeave = () => setIsOverBag(false);
  const hDrop = (e) => {
    e.preventDefault(); setIsOverBag(false);
    if (!draggedItem) return;
    const task = roundsRef.current[idxRef.current];
    if (!task) return;
    draggedItem.id === task.id ? handleSuccess(draggedItem) : handleError(draggedItem.id);
    setDraggedItem(null);
  };

  // ── Touch ─────────────────────────────────────────────
  const hTouchStart = (e, item) => {
    const t = e.touches[0]; setTouchItem(item); setTouchPos({ x: t.clientX, y: t.clientY });
  };
  const hTouchMove = (e) => {
    const t = e.touches[0]; setTouchPos({ x: t.clientX, y: t.clientY });
    if (bagRef.current) {
      const r = bagRef.current.getBoundingClientRect();
      setIsOverBag(t.clientX > r.left && t.clientX < r.right && t.clientY > r.top && t.clientY < r.bottom);
    }
  };
  const hTouchEnd = () => {
    if (!touchItem) { setIsOverBag(false); return; }
    const task = roundsRef.current[idxRef.current];
    if (task && isOverBag) touchItem.id === task.id ? handleSuccess(touchItem) : handleError(touchItem.id);
    setTouchItem(null); setIsOverBag(false);
  };

  // ── Result ────────────────────────────────────────────
  const stars = correctCount === rounds.length && attempts === rounds.length ? 3
    : correctCount >= rounds.length - 1 ? 2 : 1;

  if (finished) return (
    <div className="bd-result-root">
      <GameBackground color="purple" />
      {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}
      <div className="bd-result-card">
        <div className="bd-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🎒" : "💪"}</div>
        <div className="bd-result-badge">Pack your Backpack · Complete</div>
        <h2 className="bd-result-title">¡Nivel terminado!</h2>
        <div className="bd-result-stars">
          {Array.from({ length: 3 }).map((_, i) => <span key={i} className={`bd-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>)}
        </div>
        <div className="bd-result-stats">
          <div className="bd-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
          <div className="bd-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="bd-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="bd-rstat"><span>⏱</span><span>Time</span><strong>{`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`}</strong></div>
        </div>
        {onFinish && <button className="bd-result-btn" onClick={() => onFinish(correctCount)}>Continue 🚀</button>}
      </div>
    </div>
  );

  // Guard — wait for init
  const task = rounds[currentIdx];
  if (!task || options.length === 0) return null;

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
  const leftItems = options.slice(0, Math.ceil(options.length / 2));
  const rightItems = options.slice(Math.ceil(options.length / 2));

  // ItemCol: plain render function — no remount, no key issues
  const ItemCol = (opt) => (
    <div key={opt.id} className="bd-desk-col">
      <div
        className={`bd-item ${shakingItem === opt.id ? "shake" : ""} ${draggedItem?.id === opt.id ? "dragging" : ""} ${revealCorrect && opt.id === task.id ? "reveal" : ""}`}
        draggable={!revealCorrect}
        onDragStart={e => !revealCorrect && hDragStart(e, opt)}
        onDragEnd={hDragEnd}
        onTouchStart={e => !revealCorrect && hTouchStart(e, opt)}
        style={{ "--item-color": opt.color, "--item-glow": opt.glow }}
      >
        <div className="bd-item-inner">
          <img src={opt.img} alt={opt.word} className="bd-item-img" />
        </div>
      </div>
      <div className="bd-desk-top" />
      <div className="bd-desk-front" />
    </div>
  );

  return (
    <>
      {/* HEADER */}
      <div className="bd-header-bar">
        <div className="bd-header-left">
          <span className="bd-header-badge">Level 1</span>
          <span className="bd-header-title">🎒 Pack your Backpack!</span>
        </div>
        <div className="bd-header-right">
          <div className="bd-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="bd-header-pill bd-streak-pill">🔥 {streak}x</div>}
          <div className="bd-header-pill">🎯 {attempts}</div>
          <div className="bd-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}
      {particles.map(p => (
        <div key={p.id} className="bd-particle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, transform: `rotate(${p.angle}deg)` }}>
          {p.emoji}
        </div>
      ))}
      {touchItem && (
        <div className="bd-touch-ghost" style={{ left: touchPos.x - 55, top: touchPos.y - 55 }}>
          <img src={touchItem.img} alt={touchItem.word} />
        </div>
      )}

      <div className="bd-root" onTouchMove={hTouchMove} onTouchEnd={hTouchEnd}>
        <div className="bd-sky" />
        <div className="bd-floor" />
        <div className="bd-win bd-win-l"><div className="bd-sun" /></div>
        <div className="bd-win bd-win-r" />
        <div className="bd-poster bd-poster-l">🔤</div>
        <div className="bd-poster bd-poster-r">🔢</div>

        <div className="bd-progress-wrap">
          <div className="bd-progress-track">
            <div className="bd-progress-fill" style={{ width: `${progress}%` }} />
            <div className="bd-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`bd-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="bd-chalkboard">
          <div className="bd-chalk-row">
            <span className="bd-chalk-lead">Pack the</span>
            <span className="bd-chalk-word"
              style={{ borderColor: `${task.color}50`, textShadow: `0 0 28px ${task.glow},0 3px 0 rgba(0,0,0,0.25)` }}>
              {task.word.toUpperCase()}
            </span>
          </div>
          <div className="bd-chalk-controls">
            <button className="bd-speaker-btn" onClick={() => speakItem(task)}>🔊</button>
            <div className="bd-lives">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className={`bd-life ${i < MAX_LIVES - (itemAttempts[currentIdx] || 0) ? "alive" : "lost"}`}>❤️</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bd-desks-row">
          {leftItems.map(opt => ItemCol(opt))}

          <div className="bd-desk-col bag-col">
            <div
              ref={bagRef}
              className={`bd-bag-zone ${isOverBag ? "over" : ""} ${bagSuccess ? "success" : ""} ${wrongFlash ? "wrong" : ""}`}
              onDragOver={hDragOver}
              onDragLeave={hDragLeave}
              onDrop={hDrop}
            >
              <div className="bd-bag-ring" />
              <img src={backpackImg} alt="Backpack" className="bd-bag-img" />
              <span className="bd-bag-hint">
                {wrongFlash ? "❌ Try again!" : isOverBag ? "🎯 Drop it!" : "Drop here!"}
              </span>
            </div>
            <div className="bd-desk-top" />
            <div className="bd-desk-front" />
          </div>

          {rightItems.map(opt => ItemCol(opt))}
        </div>
      </div>
    </>
  );
}