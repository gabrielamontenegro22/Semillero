import React, { useState, useEffect, useRef } from "react";
import "./Buildcommand.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

import loroImg from "../../../../assets/loro.png";
import monoImg from "../../../../assets/mono.png";

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
  { id: "takeout-pencil", text: "Take out your pencil!", audio: sndTakeoutPencil, img: pencilImg },
  { id: "takeout-notebook", text: "Take out your notebook!", audio: sndTakeoutNotebook, img: notebookImg },
  { id: "takeout-ruler", text: "Take out your ruler!", audio: sndTakeoutRuler, img: rulerImg },
  { id: "takeout-book", text: "Take out your book!", audio: sndTakeoutBook, img: bookImg },
  { id: "open-notebook", text: "Open your notebook!", audio: sndOpenNotebook, img: openNotebookImg },
  { id: "open-book", text: "Open your book!", audio: sndOpenBook, img: openBookImg },
  { id: "close-book", text: "Close your book!", audio: sndCloseBook, img: closeBookImg },
  { id: "come-in", text: "Come in!", audio: sndComeIn, img: comeInImg },
  { id: "come-on", text: "Come on!", audio: sndComeOn, img: comeOnImg },
  { id: "goto-place", text: "Go to your place!", audio: sndGoToPlace, img: gotoPlaceImg },
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
const NUM_ROUNDS = 5;
const NUM_CHOICES = 4;

const LEAVES = Array.from({ length: 22 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`,
  size: 14 + Math.random() * 22, dur: `${3 + Math.random() * 4}s`,
  del: `${Math.random() * 4}s`, rot: Math.random() * 360,
}));
const BUTTERFLIES = [
  { id: 0, emoji: "🦋", top: "15%", dur: "14s", del: "0s" },
  { id: 1, emoji: "🦋", top: "40%", dur: "18s", del: "5s" },
  { id: 2, emoji: "🌿", top: "65%", dur: "20s", del: "9s" },
  { id: 3, emoji: "🐦", top: "25%", dur: "16s", del: "12s" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function FP({ value }) {
  return (
    <div className={`bc-fp bc-fp-${value > 0 ? "pos" : "neg"}`}>
      {value > 0 ? `+${value} ⭐` : `${value}`}
    </div>
  );
}

export default function BuildCommand({ onFinish }) {
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [choices, setChoices] = useState([]);
  const [points, setPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [itemAttempts, setItemAttempts] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [selected, setSelected] = useState(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const mountedRef = useRef(true);
  const floaterId = useRef(0);
  const curAud = useRef(null);
  const roundsRef = useRef([]);
  const idxRef = useRef(0);
  const attRef = useRef({});
  const streakRef = useRef(0);

  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { attRef.current = itemAttempts; }, [itemAttempts]);

  useEffect(() => {
    mountedRef.current = true;
    const picked = shuffle(COMMANDS).slice(0, NUM_ROUNDS);
    roundsRef.current = picked;
    setRounds(picked);
    initRound(picked, 0);
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

  const initRound = (all, i) => {
    const cmd = all[i];
    if (!cmd) return;
    // ✅ Reading puro: NO suena audio al iniciar
    // ✅ Evitar imágenes duplicadas en las opciones
    const usedImgs = new Set([cmd.img]);
    const candidates = COMMANDS.filter(c => {
      if (c.id === cmd.id) return false;
      if (usedImgs.has(c.img)) return false;
      usedImgs.add(c.img);
      return true;
    });
    const distractors = shuffle(candidates).slice(0, NUM_CHOICES - 1);
    const allChoices = shuffle([cmd, ...distractors]);
    setChoices(allChoices);
    setSelected(null);
    setRevealCorrect(false);
    setCelebrating(false);
    setBlocked(false);
  };

  const addFP = (v) => {
    const id = floaterId.current++;
    setFloaters(f => [...f, { v, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };

  const advanceWhenAudioEnds = (cmdId, nextIdx) => {
    if (!mountedRef.current) return;
    const a = audioCache.commands[cmdId];
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

  const handlePick = (choiceId) => {
    if (blocked) return;
    const i = idxRef.current;
    const cmd = roundsRef.current[i];
    if (!cmd) return;
    const ok = choiceId === cmd.id;
    setSelected({ id: choiceId, result: ok ? "correct" : "wrong" });
    setBlocked(true);

    if (ok) {
      playAud(audioCache.correct);
      setCelebrating(true);
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
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.5 }, colors: ["#FFD700", "#4ADE80", "#F472B6", "#FDE68A"] });

      // ✅ Refuerzo auditivo del comando + esperar al 'ended'
      setTimeout(() => {
        if (!mountedRef.current) return;
        advanceWhenAudioEnds(cmd.id, i + 1);
      }, 600);
    } else {
      playAud(audioCache.wrong);
      streakRef.current = 0;
      setStreak(0);
      const na = (attRef.current[i] || 0) + 1;
      attRef.current = { ...attRef.current, [i]: na };
      setItemAttempts(prev => ({ ...prev, [i]: na }));

      if (na >= MAX_LIVES) {
        // 🟢 Reveal verde + audio refuerzo
        setAttempts(a => a + 1);
        setRevealCorrect(true);
        setTimeout(() => {
          if (!mountedRef.current) return;
          advanceWhenAudioEnds(cmd.id, i + 1);
        }, 600);
      } else {
        // Permite reintentar
        setTimeout(() => {
          if (!mountedRef.current) return;
          setSelected(null);
          setBlocked(false);
        }, 800);
      }
    }
  };

  const advanceTo = (next) => {
    if (!mountedRef.current) return;
    stopAud();
    if (next >= roundsRef.current.length) { setFinished(true); return; }
    setCurrentIdx(next);
    idxRef.current = next;
    initRound(roundsRef.current, next);
  };

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
  const stars = correctCount === rounds.length && attempts === rounds.length ? 3
    : correctCount >= rounds.length - 1 ? 2 : 1;

  if (finished) return (
    <div className="bc-result-root">
      <GameBackground color="orange" />
      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
      <div className="bc-result-card">
        <div className="bc-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🦜" : "🌿"}</div>
        <div className="bc-result-badge">Jungle Mission · Complete 🌴</div>
        <h2 className="bc-result-title">¡Nivel terminado!</h2>
        <div className="bc-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`bc-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="bc-result-stats">
          <div className="bc-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
          <div className="bc-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
          <div className="bc-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="bc-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
        </div>
        {onFinish && <button className="bc-result-btn" onClick={() => onFinish(correctCount)}>Continue 🌴</button>}
      </div>
    </div>
  );

  const cmd = rounds[currentIdx];
  if (!cmd) return null;
  const lives = MAX_LIVES - (itemAttempts[currentIdx] || 0);

  return (
    <>
      <div className="bc-header-bar">
        <div className="bc-header-left">
          <span className="bc-header-badge">Level 2</span>
          <span className="bc-header-title">👁️ Reading</span>
        </div>
        <div className="bc-header-right">
          <div className="bc-header-pill">⚡ {points}</div>
          {streak >= 2 && <div className="bc-header-pill bc-streak-pill">🔥 {streak}x</div>}
          <div className="bc-header-pill">🎯 {attempts}</div>
          <div className="bc-header-pill">⏱ {fmt}</div>
        </div>
      </div>

      {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

      <div className="bc-root">
        <div className="bc-jungle-bg" />
        <div className="bc-canopy-left" />
        <div className="bc-canopy-right" />
        <div className="bc-ground" />

        {LEAVES.map(l => (
          <div key={l.id} className="bc-leaf"
            style={{ left: l.left, top: l.top, fontSize: l.size, "--dur": l.dur, "--del": l.del, "--rot": `${l.rot}deg` }}>
            🍃
          </div>
        ))}
        {BUTTERFLIES.map(b => (
          <div key={b.id} className="bc-butterfly" style={{ top: b.top, "--bdur": b.dur, "--bdel": b.del }}>
            {b.emoji}
          </div>
        ))}

        <div className="bc-progress-wrap">
          <div className="bc-progress-track">
            <div className="bc-progress-fill" style={{ width: `${progress}%` }} />
            <div className="bc-progress-steps">
              {rounds.map((_, i) => (
                <div key={i} className={`bc-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="bc-game-area">

          {/* CABECERA: LORO + FRASE GRANDE + MONO */}
          <div className="bc-read-row">
            <img src={loroImg} alt="loro" className="bc-loro" />

            <div className="bc-read-card">
              <span className="bc-read-lead">📖 READ:</span>
              <span className="bc-read-phrase">{cmd.text}</span>
              <div className="bc-lives">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span key={i} className={`bc-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
                ))}
              </div>
            </div>

            <img src={monoImg} alt="mono" className={`bc-mono ${celebrating ? "celebrating" : ""}`} />
          </div>

          {/* GRID DE 4 IMÁGENES */}
          <div className="bc-choices-grid">
            {choices.map(ch => {
              const isSelected = selected?.id === ch.id;
              const isReveal = revealCorrect && ch.id === cmd.id;
              const state = isSelected ? selected.result : (isReveal ? "reveal" : "idle");
              return (
                <button key={ch.id}
                  className={`bc-choice bc-choice-${state}`}
                  onClick={() => handlePick(ch.id)}
                  disabled={blocked}
                >
                  <div className="bc-choice-inner">
                    <img src={ch.img} alt={ch.text} className="bc-choice-img" />
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}