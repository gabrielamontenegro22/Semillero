import React, { useState, useEffect, useRef } from "react";
import "./WhatIsOnTheDesk.css";
import confetti from "canvas-confetti";

import penImg from "../../../../assets/pen.png";
import pencilImg from "../../../../assets/pencil.png";
import notebookImg from "../../../../assets/notebook.png";
import rulerImg from "../../../../assets/ruler.png";
import eraserImg from "../../../../assets/eraser.png";
import sharpenerImg from "../../../../assets/sharpener.png";
import bookImg from "../../../../assets/book.png";
import scissorsImg from "../../../../assets/scissors.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";
import itisaPen from "../../../../assets/sounds/itisapen.mp3";
import itisaPencil from "../../../../assets/sounds/itisapencil.mp3";
import itisaNotebook from "../../../../assets/sounds/itisanotebook.mp3";
import itisaRuler from "../../../../assets/sounds/itisaruler.mp3";
import itisaEraser from "../../../../assets/sounds/itisaneraser.mp3";
import itisaSharpener from "../../../../assets/sounds/itisasharpener.mp3";
import itisaBook from "../../../../assets/sounds/itisabook.mp3";
import itisaScissors from "../../../../assets/sounds/itisascissors.mp3";

const VOCABULARY = [
  { id: "pen", word: "pen", img: penImg, audio: itisaPen, color: "#FF6B6B", glow: "rgba(255,107,107,0.7)", floatD: "3.2s", floatOff: "0s" },
  { id: "pencil", word: "pencil", img: pencilImg, audio: itisaPencil, color: "#FFD93D", glow: "rgba(255,217,61,0.7)", floatD: "2.8s", floatOff: "0.4s" },
  { id: "notebook", word: "notebook", img: notebookImg, audio: itisaNotebook, color: "#6BCB77", glow: "rgba(107,203,119,0.7)", floatD: "3.5s", floatOff: "0.2s" },
  { id: "ruler", word: "ruler", img: rulerImg, audio: itisaRuler, color: "#4D96FF", glow: "rgba(77,150,255,0.7)", floatD: "2.6s", floatOff: "0.6s" },
  { id: "eraser", word: "eraser", img: eraserImg, audio: itisaEraser, color: "#FF922B", glow: "rgba(255,146,43,0.7)", floatD: "3.8s", floatOff: "0.1s" },
  { id: "sharpener", word: "sharpener", img: sharpenerImg, audio: itisaSharpener, color: "#CC5DE8", glow: "rgba(204,93,232,0.7)", floatD: "3.0s", floatOff: "0.5s" },
  { id: "book", word: "book", img: bookImg, audio: itisaBook, color: "#F06595", glow: "rgba(240,101,149,0.7)", floatD: "2.9s", floatOff: "0.3s" },
  { id: "scissors", word: "scissors", img: scissorsImg, audio: itisaScissors, color: "#20C997", glow: "rgba(32,201,151,0.7)", floatD: "3.4s", floatOff: "0.7s" },
];

const POINTS_CORRECT = 10;
const POINTS_WRONG = -3;
const MAX_LIVES = 2;
const ROUNDS = 5;

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: 1 + Math.random() * 3,
  d: `${1.5 + Math.random() * 3}s`,
  del: `${Math.random() * 3}s`,
}));

function FloatingPoints({ value, id }) {
  return (
    <div className={`witd-fp witd-fp-${value > 0 ? "pos" : "neg"}`} key={id}>
      {value > 0 ? `+${value} ⭐` : `${value}`}
    </div>
  );
}

export default function WhatIsOnTheDesk({ onFinish }) {
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayItems, setDisplayItems] = useState([]);
  const [itemStates, setItemStates] = useState({});

  const [points, setPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [itemAttempts, setItemAttempts] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [particles, setParticles] = useState([]);
  const [blocked, setBlocked] = useState(false);

  const [revealCorrect, setRevealCorrect] = useState(false);

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

  useEffect(() => {
    mountedRef.current = true;
    correctAudio.current = new Audio(correctoSound);
    wrongAudio.current = new Audio(incorrectoSound);
    correctAudio.current.preload = wrongAudio.current.preload = "auto";
    VOCABULARY.forEach(v => {
      const a = new Audio(v.audio); a.preload = "auto"; a.load();
      audioRef.current[v.id] = a;
    });
    const shuffled = [...VOCABULARY].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
    roundsRef.current = shuffled;
    setRounds(shuffled);
    setupRound(shuffled, 0);
    return () => { mountedRef.current = false; confetti.reset(); };
  }, []);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

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

  const setupRound = (allRounds, idx) => {
    const correct = allRounds[idx];
    const others = VOCABULARY
      .filter(v => v.id !== correct.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    const shown = [...others, correct].sort(() => Math.random() - 0.5);
    setDisplayItems(shown);
    const states = {};
    shown.forEach(v => states[v.id] = "idle");
    setItemStates(states);
    setBlocked(true);
    setTimeout(() => {
      if (mountedRef.current) setBlocked(false);
    }, 600);
  };

  const speakItem = (item) => {
    if (!item) return null;
    if (curAudioRef.current) { curAudioRef.current.pause(); curAudioRef.current.currentTime = 0; }
    const a = audioRef.current[item.id];
    if (a) { a.currentTime = 0; curAudioRef.current = a; a.play().catch(() => { }); return a; }
    return null;
  };
  const stopAudio = () => {
    if (curAudioRef.current) { curAudioRef.current.pause(); curAudioRef.current.currentTime = 0; }
  };

  const addFloater = (val) => {
    const id = floaterId.current++;
    setFloaters(f => [...f, { val, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };
  const spawnParticles = () => {
    const EM = ["⭐", "✨", "🌟", "💫", "🎉", "🚀", "🪐"];
    const ps = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      emoji: EM[Math.floor(Math.random() * EM.length)],
      size: 18 + Math.random() * 22, angle: Math.random() * 360,
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 1100);
  };

  // ✅ NUEVO: avance que espera al 'ended' del audio (con fallback 4s)
  const advanceWhenAudioEnds = (item, nextIdx) => {
    if (!mountedRef.current) return;
    const a = audioRef.current[item.id];
    if (!a) {
      // Sin audio: avanzar inmediatamente
      setItemStates(s => ({ ...s, [item.id]: "gone" }));
      setTimeout(() => advanceTo(nextIdx), 400);
      return;
    }

    let advanced = false;
    const finish = () => {
      if (advanced || !mountedRef.current) return;
      advanced = true;
      a.removeEventListener('ended', onEnded);
      setItemStates(s => ({ ...s, [item.id]: "gone" }));
      setTimeout(() => advanceTo(nextIdx), 400);
    };
    const onEnded = () => finish();

    a.addEventListener('ended', onEnded);

    // Fallback: si el audio falla o tarda más de 4s
    setTimeout(finish, 4000);
  };

  const handleTap = (item) => {
    if (blocked) return;
    const idx = idxRef.current;
    const correct = roundsRef.current[idx];
    if (!correct) return;

    if (item.id === correct.id) {
      // 🔊 Suena "correcto"
      if (correctAudio.current) { correctAudio.current.currentTime = 0; correctAudio.current.play().catch(() => { }); }

      setItemStates(s => ({ ...s, [item.id]: "correct" }));
      setBlocked(true);

      const tries = attemptsRef.current[idx] || 0;
      const first = tries === 0;
      const newStreak = first ? streak + 1 : 0;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      const bonus = first ? (newStreak >= 3 ? 15 : newStreak >= 2 ? 12 : POINTS_CORRECT) : 5;
      setPoints(p => p + bonus);
      setAttempts(a => a + 1);
      setCorrectCount(c => c + 1);
      addFloater(bonus);
      spawnParticles();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, colors: ["#FFD700", "#4ADE80", "#7C5CFC", "#FF6B6B", "#38BDF8"] });

      // 🔊 Después del "correcto", suena el refuerzo "It is a pen"
      // Y avanza CUANDO el audio del refuerzo termine
      setTimeout(() => {
        if (!mountedRef.current) return;
        speakItem(item);
        advanceWhenAudioEnds(item, idx + 1);
      }, 500);

    } else {
      if (wrongAudio.current) { wrongAudio.current.currentTime = 0; wrongAudio.current.play().catch(() => { }); }
      setItemStates(s => ({ ...s, [item.id]: "wrong" }));
      setStreak(0);
      setPoints(p => Math.max(0, p + POINTS_WRONG));
      addFloater(POINTS_WRONG);

      const na = (attemptsRef.current[idx] || 0) + 1;
      setItemAttempts(prev => ({ ...prev, [idx]: na }));
      setTimeout(() => setItemStates(s => ({ ...s, [item.id]: "idle" })), 600);

      if (na >= MAX_LIVES) {
        // 💡 Reveal verde con la respuesta correcta + audio
        setAttempts(a => a + 1);
        setBlocked(true);
        setRevealCorrect(true);

        // Reproducir audio del correcto y avanzar cuando termine
        setTimeout(() => {
          if (!mountedRef.current) return;
          speakItem(correct);

          // Esperar al ended del audio del correcto antes de avanzar
          const a = audioRef.current[correct.id];
          if (!a) {
            setRevealCorrect(false);
            advanceTo(idx + 1);
            return;
          }

          let advanced = false;
          const finish = () => {
            if (advanced || !mountedRef.current) return;
            advanced = true;
            a.removeEventListener('ended', onEnded);
            setRevealCorrect(false);
            advanceTo(idx + 1);
          };
          const onEnded = () => finish();

          a.addEventListener('ended', onEnded);
          setTimeout(finish, 4000); // fallback
        }, 500);
      }
    }
  };

  const advanceTo = (nextIdx) => {
    if (!mountedRef.current) return;
    stopAudio();
    if (nextIdx >= roundsRef.current.length) { setFinished(true); return; }
    setCurrentIdx(nextIdx);
    setRevealCorrect(false);
    setupRound(roundsRef.current, nextIdx);
  };

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
  const stars = correctCount === rounds.length && attempts === rounds.length ? 3
    : correctCount >= rounds.length - 1 ? 2 : 1;

  if (finished) return (
    <div className="witd-result-root">
      {/* Fondo animado de estrellas */}
      <div className="witd-stars">
        {STARS.map(s => (
          <div key={s.id} className="witd-star" style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            "--d": s.d, animationDelay: s.del,
          }} />
        ))}
      </div>

      {/* Planetas decorativos */}
      <div className="witd-planet witd-planet-1" />
      <div className="witd-planet witd-planet-2" />
      <div className="witd-planet witd-planet-3" />
      <div className="witd-planet witd-planet-result-1" />
      <div className="witd-planet witd-planet-result-2" />

      {/* Cohete celebrando */}
      <div className="witd-rocket witd-rocket-result">🚀</div>

      {/* Cometa fugaz */}
      <div className="witd-comet">☄️</div>
      <div className="witd-comet witd-comet-2">⭐</div>

      {/* OVNIs y satélites */}
      <div className="witd-ufo">🛸</div>
      <div className="witd-satellite">🛰️</div>

      {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}

      <div className="witd-result-card">
        <div className="witd-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🚀" : "💪"}</div>
        <div className="witd-result-badge">Read & Find · Complete</div>
        <h2 className="witd-result-title">¡Nivel terminado!</h2>
        <div className="witd-result-stars">
          {Array.from({ length: 3 }).map((_, i) => <span key={i} className={`witd-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>)}
        </div>
        <div className="witd-result-stats">
          <div className="witd-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
          <div className="witd-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="witd-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="witd-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
        </div>
        {onFinish && <button className="witd-result-btn" onClick={() => onFinish(correctCount)}>Continue ✏️</button>}
      </div>
    </div>
  );

  const correct = rounds[currentIdx];
  if (!correct) return null;

  return (
    <>
      <div className="witd-header-bar">
        <div className="witd-header-left">
          <span className="witd-header-badge">Level 2</span>
          <span className="witd-header-title">👁️ Read &amp; Find!</span>
        </div>
        <div className="witd-header-right">
          <div className="witd-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="witd-header-pill witd-streak-pill">🔥 {streak}x</div>}
          <div className="witd-header-pill">🎯 {attempts}</div>
          <div className="witd-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}
      {particles.map(p => (
        <div key={p.id} className="witd-particle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, transform: `rotate(${p.angle}deg)` }}>
          {p.emoji}
        </div>
      ))}

      <div className="witd-root">
        <div className="witd-stars">
          {STARS.map(s => (
            <div key={s.id} className="witd-star" style={{
              top: s.top, left: s.left,
              width: s.size, height: s.size,
              "--d": s.d, animationDelay: s.del,
            }} />
          ))}
        </div>

        <div className="witd-planet witd-planet-1" />
        <div className="witd-planet witd-planet-2" />
        <div className="witd-planet witd-planet-3" />

        <div className="witd-rocket">🚀</div>

        <div className="witd-progress-wrap">
          <div className="witd-progress-track">
            <div className="witd-progress-fill" style={{ width: `${progress}%` }} />
            <div className="witd-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`witd-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="witd-astronaut-row">
          <div className="witd-astronaut">👨‍🚀</div>
          <div className="witd-speech witd-speech-reading">
            <span className="witd-speech-lead">Find:</span>
            <span className="witd-word-big" style={{
              color: correct.color,
              textShadow: `0 0 24px ${correct.glow}, 0 3px 0 rgba(0,0,0,0.4)`
            }}>
              {correct.word.toUpperCase()}
            </span>
            <div className="witd-lives">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className={`witd-life ${i < MAX_LIVES - (itemAttempts[currentIdx] || 0) ? "alive" : "lost"}`}>❤️</span>
              ))}
            </div>
          </div>
        </div>

        <div className="witd-items-grid">
          {displayItems.map((item) => {
            const state = itemStates[item.id] || "idle";
            const isReveal = revealCorrect && item.id === correct.id;
            return (
              <div
                key={item.id}
                className={`witd-item witd-item-${state} ${isReveal ? "witd-item-reveal" : ""}`}
                style={{
                  "--item-color": item.color,
                  "--item-glow": item.glow,
                  "--float-d": item.floatD,
                  "--float-off": item.floatOff,
                }}
                onClick={() => !revealCorrect && handleTap(item)}
              >
                <div className="witd-item-card">
                  <img src={item.img} alt={item.word} className="witd-item-img" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}