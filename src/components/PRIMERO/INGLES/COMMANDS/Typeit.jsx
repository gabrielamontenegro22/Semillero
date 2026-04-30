import React, { useState, useEffect, useRef } from "react";
import "./Typeit.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

// ── Imágenes ──
import sharpenerImg from "../../../../assets/sharpener.png";
import penImg from "../../../../assets/pen.png";
import pencilImg from "../../../../assets/pencil.png";
import rulerImg from "../../../../assets/ruler.png";
import bookImg from "../../../../assets/book.png";
import notebookImg from "../../../../assets/notebook.png";
import scissorsImg from "../../../../assets/scissors.png";

// ── Sonidos base ──
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── Sonidos refuerzo "It is a..." ──
import sndPen from "../../../../assets/sounds/itisapen.mp3";
import sndPencil from "../../../../assets/sounds/itisapencil.mp3";
import sndBook from "../../../../assets/sounds/itisabook.mp3";
import sndNotebook from "../../../../assets/sounds/itisanotebook.mp3";
import sndRuler from "../../../../assets/sounds/itisaruler.mp3";
import sndScissors from "../../../../assets/sounds/itisascissors.mp3";
import sndSharpener from "../../../../assets/sounds/itisasharpener.mp3";

const audioCache = {
  correct: new Audio(correctoSound),
  wrong: new Audio(incorrectoSound),
  words: {},
};
audioCache.correct.preload = "auto";
audioCache.wrong.preload = "auto";

// ── Palabras ──
const WORDS = [
  { id: "pen", word: "pen", hidden: [1, 2], img: penImg, audio: sndPen },
  { id: "book", word: "book", hidden: [1, 3], img: bookImg, audio: sndBook },
  { id: "ruler", word: "ruler", hidden: [1, 3], img: rulerImg, audio: sndRuler },
  { id: "pencil", word: "pencil", hidden: [1, 3, 5], img: pencilImg, audio: sndPencil },
  { id: "notebook", word: "notebook", hidden: [2, 5, 7], img: notebookImg, audio: sndNotebook },
  { id: "scissors", word: "scissors", hidden: [1, 4, 6], img: scissorsImg, audio: sndScissors },
  { id: "sharpener", word: "sharpener", hidden: [2, 5, 7], img: sharpenerImg, audio: sndSharpener },
];

// Pre-cargar audios de palabras
WORDS.forEach(w => {
  const a = new Audio(w.audio);
  a.preload = "auto";
  a.load();
  audioCache.words[w.id] = a;
});

const NUM_ROUNDS = 6;
const MAX_LIVES = 3;
const PTS_OK = 10;

const KB_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: 1 + Math.random() * 2.5,
  dur: `${1.5 + Math.random() * 3}s`,
  del: `${Math.random() * 4}s`,
}));

const PLANETS = [
  { id: 0, emoji: "🪐", top: "8%", left: "6%", size: 52 },
  { id: 1, emoji: "🌙", top: "60%", left: "90%", size: 44 },
  { id: 2, emoji: "☄️", top: "30%", left: "93%", size: 30 },
  { id: 3, emoji: "🛸", top: "78%", left: "4%", size: 34 },
];

function FP({ value }) {
  return (
    <div className={`ti-fp ti-fp-${value > 0 ? "pos" : "neg"}`}>
      {value > 0 ? `+${value} ⭐` : `${value}`}
    </div>
  );
}

export default function TypeIt({ onFinish }) {
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
  const [slotState, setSlotState] = useState("idle");
  const [wrongKey, setWrongKey] = useState(null);

  const mountedRef = useRef(true);
  const floaterId = useRef(0);
  const curAud = useRef(null);
  const initTimeoutRef = useRef(null);   // ✅ NUEVO
  const initTokenRef = useRef(0);         // ✅ NUEVO
  const roundsRef = useRef([]);
  const idxRef = useRef(0);
  const streakRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);

  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  useEffect(() => {
    mountedRef.current = true;
    const picked = [...WORDS].sort(() => Math.random() - 0.5).slice(0, NUM_ROUNDS);
    roundsRef.current = picked;
    setRounds(picked);
    initRound(picked, 0, MAX_LIVES);
    return () => {
      mountedRef.current = false;
      confetti.reset();
      // ✅ Limpiar timeout pendiente y audio
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
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

  const stopAud = () => {
    if (curAud.current) {
      curAud.current.pause();
      curAud.current.currentTime = 0;
      curAud.current = null;
    }
  };
  const playAud = (a) => {
    try {
      a.currentTime = 0;
      a.play().catch(() => { });
    } catch (_) { }
  };

  const advanceWhenAudioEnds = (wordId, nextIdx) => {
    if (!mountedRef.current) return;
    const a = audioCache.words[wordId];
    if (!a) {
      setTimeout(() => advanceTo(nextIdx), 800);
      return;
    }
    a.pause();
    a.currentTime = 0;
    curAud.current = a;

    let advanced = false;
    const finish = () => {
      if (advanced || !mountedRef.current) return;
      advanced = true;
      a.removeEventListener('ended', onEnded);
      setTimeout(() => advanceTo(nextIdx), 400);
    };
    const onEnded = () => finish();
    a.addEventListener('ended', onEnded);

    a.play().catch(() => setTimeout(finish, 1500));
    setTimeout(finish, 4000);
  };

  const initRound = (all, i, newLives) => {
    if (!mountedRef.current) return;
    const cmd = all[i];
    if (!cmd) return;

    // ✅ FIX: Detener audio activo + cancelar timeout pendiente (evita doble audio en StrictMode)
    stopAud();
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    const myToken = ++initTokenRef.current;

    setTyped(new Array(cmd.hidden.length).fill(""));
    setActiveSlot(0);
    setSlotState("idle");
    setWrongKey(null);
    setBlocked(true);
    setCelebrating(false);
    setLives(newLives);
    livesRef.current = newLives;

    // ✅ Audio de apoyo al iniciar la ronda
    initTimeoutRef.current = setTimeout(() => {
      // Si otro initRound se disparó, este token ya no es válido
      if (myToken !== initTokenRef.current) return;
      if (!mountedRef.current) return;

      const a = audioCache.words[cmd.id];
      if (!a) {
        setBlocked(false);
        return;
      }
      a.pause();
      a.currentTime = 0;
      curAud.current = a;

      let unblocked = false;
      const unblock = () => {
        if (unblocked || !mountedRef.current) return;
        unblocked = true;
        a.removeEventListener('ended', onEnded);
        setBlocked(false);
      };
      const onEnded = () => unblock();
      a.addEventListener('ended', onEnded);

      a.play().catch(() => setTimeout(unblock, 1500));
      setTimeout(unblock, 4000);
    }, 600);
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
    const cmd = roundsRef.current[i];
    const slot = activeSlot;
    if (slot >= cmd.hidden.length) return;

    const expected = cmd.word[cmd.hidden[slot]].toUpperCase();

    if (letter === expected) {
      playAud(audioCache.correct);
      const newTyped = [...typed];
      newTyped[slot] = letter;
      setTyped(newTyped);
      setSlotState("correct");
      setWrongKey(null);

      const nextSlot = slot + 1;

      if (nextSlot >= cmd.hidden.length) {
        setBlocked(true);
        setCelebrating(true);
        const first = livesRef.current === MAX_LIVES;
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
          particleCount: 70, spread: 90, origin: { y: 0.5 },
          colors: ["#a78bfa", "#818cf8", "#f472b6", "#fde68a", "#67e8f9"],
        });

        setTimeout(() => {
          if (!mountedRef.current) return;
          advanceWhenAudioEnds(cmd.id, i + 1);
        }, 600);
      } else {
        setTimeout(() => {
          setActiveSlot(nextSlot);
          setSlotState("idle");
        }, 200);
      }

    } else {
      playAud(audioCache.wrong);
      setWrongKey(letter);
      setSlotState("wrong");
      streakRef.current = 0;
      setStreak(0);

      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);

      setTimeout(() => {
        if (!mountedRef.current) return;
        setWrongKey(null);
        setSlotState("idle");
        if (newLives <= 0) {
          setBlocked(true);
          setAttempts(a => a + 1);
          const revealed = cmd.hidden.map(hi => cmd.word[hi].toUpperCase());
          setTyped(revealed);
          setCelebrating(true);

          setTimeout(() => {
            if (!mountedRef.current) return;
            advanceWhenAudioEnds(cmd.id, i + 1);
          }, 700);
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
    setSlotState("idle");
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
  const stars = correctCount === rounds.length && attempts === rounds.length ? 3
    : correctCount >= rounds.length - 1 ? 2 : 1;

  if (finished) return (
    <div className="ti-result-root">
      <GameBackground color="purple" />
      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
      <div className="ti-result-card">
        <div className="ti-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🚀" : "🪐"}</div>
        <div className="ti-result-badge">Space Mission · Complete 🌌</div>
        <h2 className="ti-result-title">¡Misión cumplida!</h2>
        <div className="ti-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`ti-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="ti-result-stats">
          <div className="ti-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
          <div className="ti-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="ti-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="ti-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
        </div>
        {onFinish && (
          <button className="ti-result-btn" onClick={() => onFinish(correctCount)}>Continue 🚀</button>
        )}
      </div>
    </div>
  );

  const cmd = rounds[currentIdx];
  if (!cmd) return null;

  const wordDisplay = cmd.word.split("").map((letter, i) => {
    const hiddenSlotIdx = cmd.hidden.indexOf(i);
    if (hiddenSlotIdx === -1) {
      return { type: "visible", letter, key: i };
    } else {
      return {
        type: "blank",
        letter,
        key: i,
        slotIdx: hiddenSlotIdx,
        typed: typed[hiddenSlotIdx] || "",
        isActive: hiddenSlotIdx === activeSlot && !celebrating,
      };
    }
  });

  return (
    <>
      <div className="ti-header-bar">
        <div className="ti-header-left">
          <span className="ti-header-badge">Level 3</span>
          <span className="ti-header-title">✏️ Writing</span>
        </div>
        <div className="ti-header-right">
          <div className="ti-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="ti-header-pill ti-streak-pill">🔥 {streak}x</div>}
          <div className="ti-header-pill">🎯 {attempts}</div>
          <div className="ti-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

      <div className="ti-root">
        {STARS.map(s => (
          <div key={s.id} className="ti-star" style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            "--sdur": s.dur, "--sdel": s.del,
          }} />
        ))}
        {PLANETS.map(p => (
          <div key={p.id} className="ti-planet" style={{ top: p.top, left: p.left, fontSize: p.size }}>
            {p.emoji}
          </div>
        ))}

        <div className="ti-progress-wrap">
          <div className="ti-progress-track">
            <div className="ti-progress-fill" style={{ width: `${progress}%` }} />
            <div className="ti-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`ti-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="ti-game-area">

          <div className="ti-top-row">
            <div className="ti-astro-wrap">
              <div className={`ti-astronaut ${celebrating ? "celebrate" : ""}`}>🧑‍🚀</div>
              <div className="ti-lives">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span key={i} className={`ti-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
                ))}
              </div>
            </div>

            <div className={`ti-bubble ${slotState === "wrong" ? "wrong" : slotState === "correct" ? "correct" : ""}`}>
              <span className="ti-bubble-text">
                {celebrating
                  ? `✨ ${cmd.word.toUpperCase()}!`
                  : slotState === "wrong"
                    ? "❌ Not that one!"
                    : "Spell the word! 🌌"}
              </span>
            </div>

            <div className="ti-img-wrap">
              <img src={cmd.img} alt={cmd.word} className="ti-obj-img" />
            </div>
          </div>

          <div className="ti-word-row">
            {wordDisplay.map(cell => {
              if (cell.type === "visible") {
                return (
                  <div key={cell.key} className="ti-cell visible">
                    {cell.letter}
                  </div>
                );
              } else {
                const state = celebrating
                  ? "done"
                  : cell.isActive
                    ? slotState === "wrong" ? "active-wrong" : "active"
                    : cell.typed ? "filled" : "empty";
                return (
                  <div key={cell.key} className={`ti-cell blank ${state}`}>
                    {cell.typed || ""}
                  </div>
                );
              }
            })}
          </div>

          {!celebrating && (
            <div className="ti-keyboard">
              {KB_ROWS.map((row, ri) => (
                <div key={ri} className="ti-kb-row">
                  {row.map(key => (
                    <button
                      key={key}
                      className={`ti-key ${key === "⌫" ? "backspace" : ""} ${wrongKey === key ? "wrong-flash" : ""}`}
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