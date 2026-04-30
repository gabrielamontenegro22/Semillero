import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import "./Thisorthat.css";
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
  { word: "pen", img: penImg, audio: itisaPen, color: "#FF6B6B", glow: "rgba(255,107,107,0.7)" },
  { word: "pencil", img: pencilImg, audio: itisaPencil, color: "#FFD93D", glow: "rgba(255,217,61,0.7)" },
  { word: "notebook", img: notebookImg, audio: itisaNotebook, color: "#6BCB77", glow: "rgba(107,203,119,0.7)" },
  { word: "ruler", img: rulerImg, audio: itisaRuler, color: "#4D96FF", glow: "rgba(77,150,255,0.7)" },
  { word: "eraser", img: eraserImg, audio: itisaEraser, color: "#FF922B", glow: "rgba(255,146,43,0.7)" },
  { word: "sharpener", img: sharpenerImg, audio: itisaSharpener, color: "#CC5DE8", glow: "rgba(204,93,232,0.7)" },
  { word: "book", img: bookImg, audio: itisaBook, color: "#F06595", glow: "rgba(240,101,149,0.7)" },
  { word: "scissors", img: scissorsImg, audio: itisaScissors, color: "#20C997", glow: "rgba(32,201,151,0.7)" },
];

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const ROUNDS = 6;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
  return shuffle([...VOCABULARY]).slice(0, ROUNDS);
}

function genHints(word) {
  const hints = new Set([0]);
  if (word.length >= 4) {
    hints.add(Math.floor(word.length / 2));
  }
  if (word.length >= 8) {
    hints.add(Math.floor(word.length / 3));
    hints.add(Math.floor((2 * word.length) / 3));
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

// ═══════════════════════════════════════════════════════
// 🌊 FONDO SUBMARINO ANIMADO
// ═══════════════════════════════════════════════════════
const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  size: 8 + Math.random() * 22,
  dur: `${4 + Math.random() * 6}s`,
  del: `${Math.random() * 5}s`,
}));

const FISH = [
  { id: 0, emoji: "🐠", top: "18%", dur: "18s", del: "0s", dir: 1 },
  { id: 1, emoji: "🐡", top: "55%", dur: "22s", del: "3s", dir: -1 },
  { id: 2, emoji: "🐟", top: "75%", dur: "15s", del: "7s", dir: 1 },
  { id: 3, emoji: "🦑", top: "35%", dur: "25s", del: "11s", dir: -1 },
  { id: 4, emoji: "🐢", top: "65%", dur: "30s", del: "15s", dir: 1 },
];

const OceanBg = memo(function OceanBg() {
  return (
    <div className="cw-bg-root">
      <div className="cw-bg-caustics" />
      <div className="cw-bg-seafloor" />
      <div className="cw-bg-coral cw-bg-coral-1">🪸</div>
      <div className="cw-bg-coral cw-bg-coral-2">🪸</div>
      <div className="cw-bg-coral cw-bg-coral-3">🌿</div>
      <div className="cw-bg-coral cw-bg-coral-4">🌿</div>
      <div className="cw-bg-coral cw-bg-coral-5">🌿</div>
      {FISH.map(f => (
        <div key={f.id} className="cw-bg-fish"
          style={{ top: f.top, "--dur": f.dur, "--del": f.del, "--dir": f.dir }}>
          {f.emoji}
        </div>
      ))}
      {BUBBLES.map(b => (
        <div key={b.id} className="cw-bg-bubble"
          style={{ left: b.left, width: b.size, height: b.size, "--bdur": b.dur, "--bdel": b.del }} />
      ))}
    </div>
  );
});

export default function ThisOrThat({ onFinish }) {
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
  const [lives, setLives] = useState(3);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [usedKeys, setUsedKeys] = useState(new Set());

  const wordAudios = useRef({});
  const correctRef = useRef(null);
  const wrongRef = useRef(null);
  const mountedRef = useRef(true);

  const currentQuestion = questions[current];
  const currentWord = currentQuestion.word;

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
    VOCABULARY.forEach(v => {
      const a = new Audio();
      a.preload = "auto";
      a.src = v.audio;
      a.load();
      a.volume = 1;
      wordAudios.current[v.word] = a;
    });
    const c = new Audio(correctoSound);
    const w = new Audio(incorrectoSound);
    c.preload = "auto"; c.load();
    w.preload = "auto"; w.load();
    correctRef.current = c;
    wrongRef.current = w;
  }, []);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, [current]);

  const addFloatingPoints = (pts) => {
    const id = Date.now() + Math.random();
    setFloatingPoints(prev => [...prev, { pts, id }]);
    setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
  };

  const triggerNext = useCallback((currentIndex) => {
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrent(next);
      setHints(genHints(questions[next].word));
      setSolved(false);
      setErrorsThisRound(0);
      setLives(3);
      setWrongKey(null);
    } else {
      setFinished(true);
      const end = Date.now() + 3000;
      const frame = () => {
        if (!mountedRef.current) return;
        confetti({ particleCount: 16, angle: 60, spread: 80, origin: { x: 0 }, colors: ["#06B6D4", "#38BDF8", "#7DD3FC", "#FFE234", "#4ADE80"] });
        confetti({ particleCount: 16, angle: 120, spread: 80, origin: { x: 1 }, colors: ["#06B6D4", "#38BDF8", "#7DD3FC", "#FFE234", "#4ADE80"] });
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
      bonus = 30;
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
    setTotalPoints(p => p + bonus);
    addFloatingPoints(bonus);

    confetti({
      particleCount: 120, spread: 120, origin: { y: 0.5 },
      colors: [currentQuestion.color, "#7DD3FC", "#fff"]
    });

    setBounce(true);
    setTimeout(() => setBounce(false), 600);

    // Esperar al audio antes de avanzar
    setTimeout(() => {
      if (!mountedRef.current) return;
      const a = wordAudios.current[wordSolved];
      if (a) {
        a.pause();
        a.currentTime = 0;

        let advanced = false;
        const finish = () => {
          if (advanced || !mountedRef.current) return;
          advanced = true;
          a.removeEventListener('ended', onEnded);
          setTimeout(() => triggerNext(current), 500);
        };
        const onEnded = () => finish();
        a.addEventListener('ended', onEnded);

        a.play().catch(() => {
          setTimeout(finish, 1500);
        });

        // Fallback de 4s
        setTimeout(finish, 4000);
      } else {
        setTimeout(() => {
          if (mountedRef.current) triggerNext(current);
        }, 1500);
      }
    }, 400);
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
      setTotalPoints(p => p + 5);
      addFloatingPoints(5);

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
      setTotalPoints(p => Math.max(0, p - 2));
      addFloatingPoints(-2);

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTyped(currentWord);
        setSolved(true);
        setAnswers(prev => ({ ...prev, [currentWord]: false }));
        setAttempts(a => a + 1);

        // 🔊 reproducir "It is a pencil" para que aprenda
        setTimeout(() => {
          if (!mountedRef.current) return;
          const a = wordAudios.current[currentWord];
          if (a) {
            a.pause();
            a.currentTime = 0;

            let advanced = false;
            const finish = () => {
              if (advanced || !mountedRef.current) return;
              advanced = true;
              a.removeEventListener('ended', onEnded);
              triggerNext(current);
            };
            const onEnded = () => finish();
            a.addEventListener('ended', onEnded);

            a.play().catch(() => {
              setTimeout(finish, 1500);
            });

            // Fallback de 4s
            setTimeout(finish, 4000);
          } else {
            // Sin audio: avanzar después de 2s
            setTimeout(() => {
              if (mountedRef.current) triggerNext(current);
            }, 2000);
          }
        }, 600);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, currentWord, solved, finished, hints, lives, current, handleSolved, triggerNext]);

  const score = questions.reduce((acc, q) => (answers[q.word] === true ? acc + 1 : acc), 0);
  const progress = ((current + (solved ? 1 : 0)) / questions.length) * 100;
  const roundColor = currentQuestion?.color || "#06B6D4";
  const roundGlow = currentQuestion?.glow || "rgba(6,182,212,0.7)";
  const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

  if (finished) return (
    <div className="cw-game-root cw-result-container">
      <OceanBg />
      {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
      <div className="cw-result-card">
        <div className="cw-result-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🐠" : "💪"}</div>
        <div className="cw-result-badge">Classroom Objects · Level 3 ✏️</div>
        <h2 className="cw-result-title">¡Nivel terminado!</h2>
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
            Finalizar 🏁
          </button>
        )}
      </div>
    </div>
  );

  const slots = currentWord.split("").map((ch, i) => {
    const isTyped = i < typed.length;
    const isHint = hints.has(i);
    const isFilled = isTyped || isHint;
    const char = isTyped ? typed[i] : (isHint ? ch : "");
    return { char, index: i, isHint, isFilled };
  });

  const activeIndex = typed.length < currentWord.length ? typed.length : -1;

  const remainingLetters = (() => {
    const remaining = {};
    for (let i = typed.length; i < currentWord.length; i++) {
      if (hints.has(i)) continue;
      const ch = currentWord[i];
      remaining[ch] = (remaining[ch] || 0) + 1;
    }
    return remaining;
  })();

  return (
    <div className="cw-game-root">
      <OceanBg />

      {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

      <div className="cw-header-bar">
        <div className="cw-header-left">
          <span className="cw-header-badge">Level 3</span>
          <span className="cw-header-title">✏️ Writing</span>
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

          <div className="cw-progress-track">
            <div className="cw-progress-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg,${roundColor},#7DD3FC)`,
                boxShadow: `0 0 12px ${roundGlow}`
              }} />
            <div className="cw-progress-steps">
              {questions.map((_, i) => (
                <div key={i} className={`cw-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                  style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
              ))}
            </div>
          </div>

          <p className="cw-instruction">🤿 Look at the picture and complete the word! 💡</p>

          <div className="cw-clue-row">
            <div className="cw-card-with-lives">
              <div className={`cw-mini-card ${revealed ? "revealed" : ""}`}
                style={{ borderColor: roundColor, boxShadow: `0 0 0 4px rgba(255,255,255,0.5), 0 18px 40px rgba(0,0,0,0.4), 0 0 40px ${roundGlow}` }}>
                <img src={currentQuestion.img} alt={currentWord} className="cw-mini-img" />
              </div>
              <div className="cw-lives-container">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`cw-heart ${i < lives ? "alive" : "lost"}`}>
                    {i < lives ? "❤️" : "🖤"}
                  </span>
                ))}
              </div>
            </div>

            <div className="cw-slots-container">
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
                      <div className="cw-slot-arrow">⬇️</div>
                    )}
                    {slot.isHint && slot.isFilled && (
                      <div className="cw-hint-tag">💡</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cw-keyboard">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="cw-keyboard-row">
                {row.map(letter => {
                  const stillNeeded = (remainingLetters[letter] || 0) > 0;
                  const wasTyped = usedKeys.has(letter);
                  const isUsed = wasTyped && !stillNeeded;
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