import React, { useState, useEffect, useRef } from "react";
import "./ListenAct.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

import pencilImg from "../../../../assets/takeoutyourpencil.png";
import notebookImg from "../../../../assets/takeoutyournotebook.png";
import rulerImg from "../../../../assets/takeoutyourruler.png";
import bookImg from "../../../../assets/takeoutyourbook.png";
import closeBookImg from "../../../../assets/closeyourbook.jpeg";
import openBookImg from "../../../../assets/openyourbook.jpg";
import openNotebookImg from "../../../../assets/openyourbook.jpg";
import comeOnImg from "../../../../assets/comeon.png";
import comeInImg from "../../../../assets/comein.jpg";
import gotoPlaceImg from "../../../../assets/gotoyourplace.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";
import sndTakeoutPencil from "../../../../assets/sounds/takeoutyourpencil.mp3";
import sndTakeoutNotebook from "../../../../assets/sounds/takeoutyournotebook.mp3";
import sndTakeoutRuler from "../../../../assets/sounds/takeoutyourruler.mp3";
import sndTakeoutBook from "../../../../assets/sounds/takeoutyourbook.mp3";
import sndOpenNotebook from "../../../../assets/sounds/openyournotebook.mp3";
import sndOpenBook from "../../../../assets/sounds/openyourbook.mp3";
import sndCloseBook from "../../../../assets/sounds/closeyourbook.mp3";
import sndComeIn from "../../../../assets/sounds/comein.mp3";
import sndComeOn from "../../../../assets/sounds/comeon.mp3";
import sndGoToPlace from "../../../../assets/sounds/gotoyourplace.mp3";

const COMMANDS = [
  {
    id: "takeout-pencil", text: "Take out your pencil!", audio: sndTakeoutPencil,
    correct: "takeout-pencil",
    choices: [
      { id: "takeout-book", label: "Take out book", img: bookImg },
      { id: "takeout-ruler", label: "Take out ruler", img: rulerImg },
      { id: "takeout-pencil", label: "Take out your pencil", img: pencilImg },
      { id: "close-book", label: "Close book", img: closeBookImg },
    ]
  },
  {
    id: "takeout-notebook", text: "Take out your notebook!", audio: sndTakeoutNotebook,
    correct: "takeout-notebook",
    choices: [
      { id: "takeout-pencil", label: "Take out pencil", img: pencilImg },
      { id: "takeout-notebook", label: "Take out your notebook", img: notebookImg },
      { id: "goto-place", label: "Go to place", img: gotoPlaceImg },
      { id: "takeout-ruler", label: "Take out ruler", img: rulerImg },
    ]
  },
  {
    id: "takeout-ruler", text: "Take out your ruler!", audio: sndTakeoutRuler,
    correct: "takeout-ruler",
    choices: [
      { id: "takeout-ruler", label: "Take out your ruler", img: rulerImg },
      { id: "takeout-pencil", label: "Take out pencil", img: pencilImg },
      { id: "goto-place", label: "Go to place", img: gotoPlaceImg },
      { id: "takeout-book", label: "Take out book", img: bookImg },
    ]
  },
  {
    id: "takeout-book", text: "Take out your book!", audio: sndTakeoutBook,
    correct: "takeout-book",
    choices: [
      { id: "takeout-ruler", label: "Take out ruler", img: rulerImg },
      { id: "takeout-pencil", label: "Take out pencil", img: pencilImg },
      { id: "open-book", label: "Open book", img: openBookImg },
      { id: "takeout-book", label: "Take out your book", img: bookImg },
    ]
  },
  {
    id: "open-notebook", text: "Open your notebook!", audio: sndOpenNotebook,
    correct: "open-notebook",
    choices: [
      { id: "close-book", label: "Close book", img: closeBookImg },
      { id: "open-notebook", label: "Open your notebook", img: openNotebookImg },
      { id: "takeout-ruler", label: "Take out ruler", img: rulerImg },
      { id: "goto-place", label: "Go to place", img: gotoPlaceImg },
    ]
  },
  {
    id: "open-book", text: "Open your book!", audio: sndOpenBook,
    correct: "open-book",
    choices: [
      { id: "takeout-ruler", label: "Take out ruler", img: rulerImg },
      { id: "close-book", label: "Close book", img: closeBookImg },
      { id: "come-in", label: "Come in", img: comeInImg },
      { id: "open-book", label: "Open your book", img: openBookImg },
    ]
  },
  {
    id: "close-book", text: "Close your book!", audio: sndCloseBook,
    correct: "close-book",
    choices: [
      { id: "open-book", label: "Open book", img: openBookImg },
      { id: "close-book", label: "Close your book", img: closeBookImg },
      { id: "come-in", label: "Come in", img: comeInImg },
      { id: "goto-place", label: "Go to place", img: gotoPlaceImg },
    ]
  },
  {
    id: "come-in", text: "Come in!", audio: sndComeIn,
    correct: "come-in",
    choices: [
      { id: "come-on", label: "Come on", img: comeOnImg },
      { id: "goto-place", label: "Go to place", img: gotoPlaceImg },
      { id: "come-in", label: "Come in", img: comeInImg },
      { id: "close-book", label: "Close book", img: closeBookImg },
    ]
  },
  {
    id: "come-on", text: "Come on!", audio: sndComeOn,
    correct: "come-on",
    choices: [
      { id: "come-in", label: "Come in", img: comeInImg },
      { id: "come-on", label: "Come on!", img: comeOnImg },
      { id: "goto-place", label: "Go to place", img: gotoPlaceImg },
      { id: "open-book", label: "Open book", img: openBookImg },
    ]
  },
  {
    id: "goto-place", text: "Go to your place!", audio: sndGoToPlace,
    correct: "goto-place",
    choices: [
      { id: "come-in", label: "Come in", img: comeInImg },
      { id: "goto-place", label: "Go to your place", img: gotoPlaceImg },
      { id: "come-on", label: "Come on", img: comeOnImg },
      { id: "open-book", label: "Open book", img: openBookImg },
    ]
  },
];

const audioCache = {
  commands: {},
  correct: new Audio(correctoSound),
  wrong: new Audio(incorrectoSound),
};
audioCache.correct.preload = "auto";
audioCache.wrong.preload = "auto";
COMMANDS.forEach(c => {
  const a = new Audio(c.audio);
  a.preload = "auto";
  audioCache.commands[c.id] = a;
});

const MAX_LIVES = 2;
const PTS_OK = 10;

const TORCHES = [
  { left: "4%", top: "30%" }, { left: "92%", top: "30%" },
  { left: "4%", top: "60%" }, { left: "92%", top: "60%" },
];
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 55}%`,
  left: `${Math.random() * 100}%`,
  size: 1.5 + Math.random() * 2.5,
  dur: `${1.5 + Math.random() * 3}s`,
  del: `${Math.random() * 3}s`,
}));

function FP({ value }) {
  return <div className={`la-fp la-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

export default function ListenAct({ onFinish }) {
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [points, setPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [itemAttempts, setItemAttempts] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [listening, setListening] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showText, setShowText] = useState(false);

  const mountedRef = useRef(true);
  const floaterId = useRef(0);
  const curAud = useRef(null);
  const roundsRef = useRef([]);
  const idxRef = useRef(0);
  const streakRef = useRef(0);
  const attRef = useRef({});

  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { attRef.current = itemAttempts; }, [itemAttempts]);

  useEffect(() => {
    mountedRef.current = true;
    const takeout = [...COMMANDS.filter(c => c.id.startsWith("takeout"))].sort(() => Math.random() - 0.5)[0];
    const open = [...COMMANDS.filter(c => c.id.startsWith("open"))].sort(() => Math.random() - 0.5)[0];
    const close = COMMANDS.find(c => c.id === "close-book");
    const come = [...COMMANDS.filter(c => c.id.startsWith("come"))].sort(() => Math.random() - 0.5)[0];
    const go = COMMANDS.find(c => c.id === "goto-place");
    const core = [takeout, open, close, come, go];
    const rest = COMMANDS.filter(c => !core.includes(c)).sort(() => Math.random() - 0.5).slice(0, 1);
    const picked = [...core, ...rest].sort(() => Math.random() - 0.5);
    roundsRef.current = picked;
    setRounds(picked);
    startRound(picked, 0);
    return () => { mountedRef.current = false; confetti.reset(); };
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
      confetti({ particleCount: 12, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 12, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(f);
    }; f();
  }, [finished]);

  const stopAud = () => { if (curAud.current) { curAud.current.pause(); curAud.current.currentTime = 0; } };
  const playAud = (a) => { stopAud(); if (!a) return; a.currentTime = 0; curAud.current = a; a.play().catch(() => { }); };

  const startRound = (all, i) => {
    const cmd = all[i];
    if (!cmd) return;
    setSelected(null); setShowText(false); setBlocked(true);
    if (!mountedRef.current) return;
    playAud(audioCache.commands[cmd.id]);
    setListening(true);
    setTimeout(() => { if (mountedRef.current) { setListening(false); setBlocked(false); } }, 2000);
  };

  const addFP = (v) => {
    const id = floaterId.current++;
    setFloaters(f => [...f, { v, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };

  const handlePick = (choiceId) => {
    if (blocked) return;
    const i = idxRef.current;
    const cmd = roundsRef.current[i];
    if (!cmd) return;
    const ok = choiceId === cmd.correct;
    setSelected({ id: choiceId, result: ok ? "correct" : "wrong" });
    setBlocked(true);
    if (ok) {
      playAud(audioCache.correct);
      setShowText(true);
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
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.5 }, colors: ["#FFD700", "#C084FC", "#F472B6", "#FDE68A"] });

      // ✅ Refuerzo auditivo del comando + esperar al 'ended'
      setTimeout(() => {
        if (!mountedRef.current) return;
        const a = audioCache.commands[cmd.id];
        if (!a) {
          setTimeout(() => advanceTo(i + 1), 800);
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
          setTimeout(() => advanceTo(i + 1), 400);
        };
        const onEnded = () => finish();
        a.addEventListener('ended', onEnded);

        a.play().catch(() => setTimeout(finish, 1500));

        setTimeout(finish, 4000); // fallback
      }, 600);
    } else {
      playAud(audioCache.wrong);
      streakRef.current = 0;
      setStreak(0);
      const na = (attRef.current[i] || 0) + 1;
      attRef.current = { ...attRef.current, [i]: na };
      setItemAttempts(prev => ({ ...prev, [i]: na }));
      if (na >= MAX_LIVES) {
        setAttempts(a => a + 1);
        setShowText(true);
        setTimeout(() => advanceTo(i + 1), 1600);
      } else {
        setTimeout(() => {
          setSelected(null); setBlocked(true);
          const cmd2 = roundsRef.current[idxRef.current];
          playAud(audioCache.commands[cmd2.id]);
          setListening(true);
          setTimeout(() => { setListening(false); setBlocked(false); }, 2000);
        }, 900);
      }
    }
  };

  const advanceTo = (next) => {
    if (!mountedRef.current) return;
    stopAud();
    if (next >= roundsRef.current.length) { setFinished(true); return; }
    setCurrentIdx(next);
    idxRef.current = next;
    startRound(roundsRef.current, next);
  };

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
  const stars = correctCount === rounds.length && attempts === rounds.length ? 3
    : correctCount >= rounds.length - 1 ? 2 : 1;

  if (finished) return (
    <div className="la-result-root">
      <GameBackground color="purple" />
      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
      <div className="la-result-card">
        <div className="la-result-emoji">{stars === 3 ? "👑" : stars === 2 ? "🏰" : "⚔️"}</div>
        <div className="la-result-badge">Castle Mission · Complete 🏰</div>
        <h2 className="la-result-title">¡Nivel terminado!</h2>
        <div className="la-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`la-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="la-result-stats">
          <div className="la-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
          <div className="la-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="la-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="la-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
        </div>
        {onFinish && <button className="la-result-btn" onClick={() => onFinish(correctCount)}>Continue ⚔️</button>}
      </div>
    </div>
  );

  const cmd = rounds[currentIdx];
  if (!cmd) return null;
  const lives = MAX_LIVES - (itemAttempts[currentIdx] || 0);

  return (
    <>
      <div className="la-header-bar">
        <div className="la-header-left">
          <span className="la-header-badge">Level 1</span>
          <span className="la-header-title">🎧 Listening</span>
        </div>
        <div className="la-header-right">
          <div className="la-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="la-header-pill la-streak-pill">🔥 {streak}x</div>}
          <div className="la-header-pill">🎯 {attempts}</div>
          <div className="la-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

      <div className="la-root">
        <div className="la-stars">
          {STARS.map(s => (
            <div key={s.id} className="la-star"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size, "--d": s.dur, animationDelay: s.del }} />
          ))}
        </div>
        <div className="la-castle-wall">
          <div className="la-battlement">
            {Array.from({ length: 14 }).map((_, i) => <div key={i} className="la-merlon" />)}
          </div>
        </div>
        {TORCHES.map((t, i) => (
          <div key={i} className="la-torch" style={{ left: t.left, top: t.top }}>
            <div className="la-flame">🔥</div>
            <div className="la-torch-body" />
          </div>
        ))}
        <div className="la-banner">⚔️ COMMANDS ⚔️</div>
        <div className="la-progress-wrap">
          <div className="la-progress-track">
            <div className="la-progress-fill" style={{ width: `${progress}%` }} />
            <div className="la-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`la-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="la-king-row">
          <div className="la-king">👑<br />🧙</div>
          <div className={`la-speech ${listening ? "listening" : ""}`}>
            {listening
              ? <><span className="la-sound-icon">🔊</span><span className="la-dots"><span /><span /><span /></span></>
              : showText
                ? <span className="la-cmd-text">{cmd.text}</span>
                : <span className="la-cmd-hint">What does the king say? 👂</span>
            }
            <button className="la-replay-btn" onClick={() => {
              playAud(audioCache.commands[rounds[currentIdx].id]);
              setListening(true);
              setTimeout(() => setListening(false), 2000);
            }}>🔊</button>
            <div className="la-lives">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className={`la-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
              ))}
            </div>
          </div>
        </div>
        <div className="la-choices">
          {cmd.choices.map(ch => {
            const state = selected?.id === ch.id ? selected.result
              : selected && ch.id === cmd.correct ? "reveal" : "idle";
            return (
              <button key={ch.id} className={`la-choice la-choice-${state}`}
                onClick={() => handlePick(ch.id)} disabled={blocked}>
                <div className="la-choice-inner">
                  <img src={ch.img} alt={ch.label} className="la-choice-img" />
                  <span className="la-choice-label">{ch.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}