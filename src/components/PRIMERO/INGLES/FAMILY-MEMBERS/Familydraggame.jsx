import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import "./Familydraggame.css";
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
  { word: "father", img: fatherImg, audio: fatherAudio, color: "#3B82F6", glow: "rgba(59,130,246,0.7)" },
  { word: "mother", img: motherImg, audio: motherAudio, color: "#EC4899", glow: "rgba(236,72,153,0.7)" },
  { word: "sister", img: sisterImg, audio: sisterAudio, color: "#F59E0B", glow: "rgba(245,158,11,0.7)" },
  { word: "brother", img: brotherImg, audio: brotherAudio, color: "#10B981", glow: "rgba(16,185,129,0.7)" },
  { word: "grandfather", img: grandfatherImg, audio: grandfatherAudio, color: "#8B5CF6", glow: "rgba(139,92,246,0.7)" },
  { word: "grandmother", img: grandmotherImg, audio: grandmotherAudio, color: "#EF4444", glow: "rgba(239,68,68,0.7)" },
];

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
  return shuffle([...MEMBERS]);
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
    <div key={id} className={`fdg-floating-points ${points > 0 ? "pos" : "neg"}`}>
      {points > 0 ? `+${points}` : points}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 🏠 FONDO SVG ANIMADO TEMA FAMILIA / HOGAR
// ═══════════════════════════════════════════════════════
const HEARTS = Array.from({ length: 12 }, (_, i) => ({
  cx: (i * 137 + 50) % 1440,
  cy: 950 + (i % 3) * 30,
  size: 14 + (i % 4) * 6,
  delay: `${i * 0.7}s`,
  dur: `${8 + (i % 4) * 2}s`,
  color: ["#EC4899", "#EF4444", "#F472B6", "#FB7185"][i % 4],
}));

const STARS = Array.from({ length: 18 }, (_, i) => ({
  cx: (i * 211 + 73) % 1440,
  cy: (i * 89 + 41) % 400,
  size: 6 + (i % 3) * 3,
  delay: `${i * 0.3}s`,
  dur: `${2 + (i % 3)}s`,
}));

const CLOUDS = [
  { x: 150, y: 120, size: 60, speed: "60s", delay: "0s" },
  { x: 600, y: 80, size: 80, speed: "80s", delay: "-20s" },
  { x: 1100, y: 150, size: 70, speed: "70s", delay: "-40s" },
  { x: 350, y: 200, size: 50, speed: "65s", delay: "-10s" },
];

const BIRDS = [
  { x: 200, y: 250, delay: "0s", dur: "20s" },
  { x: 800, y: 180, delay: "5s", dur: "25s" },
  { x: 1300, y: 280, delay: "12s", dur: "22s" },
];

const FamilyBg = memo(function FamilyBg({ color }) {
  return (
    <svg className="fdg-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* Cielo gradient con color dinámico */}
        <linearGradient id="fdgSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="50%" stopColor="#312E81" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="1" />
        </linearGradient>

        {/* Suelo gradient (césped/atardecer) */}
        <linearGradient id="fdgGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0.6" />
        </linearGradient>

        {/* Glow del color actual */}
        <radialGradient id="fdgGlow" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>

        {/* Sol/luna brillante */}
        <radialGradient id="fdgSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>

        {/* Casa - tejado */}
        <linearGradient id="fdgRoof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Casa - cuerpo */}
        <linearGradient id="fdgHouse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>

        {/* Forma de corazón */}
        <symbol id="heart" viewBox="-12 -12 24 24">
          <path d="M0,8 C-12,-2 -10,-12 -4,-12 C-1,-12 0,-9 0,-7 C0,-9 1,-12 4,-12 C10,-12 12,-2 0,8 Z" fill="currentColor" />
        </symbol>

        {/* Forma de estrella */}
        <symbol id="star" viewBox="-10 -10 20 20">
          <path d="M0,-10 L3,-3 L10,-3 L4,2 L6,9 L0,5 L-6,9 L-4,2 L-10,-3 L-3,-3 Z" fill="currentColor" />
        </symbol>

        {/* Forma de pájaro simple */}
        <symbol id="bird" viewBox="-10 -5 20 10">
          <path d="M-10,0 Q-5,-5 0,0 Q5,-5 10,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
      </defs>

      {/* Cielo de fondo */}
      <rect width="1440" height="900" fill="url(#fdgSky)" />

      {/* Glow ambiental del color actual */}
      <rect width="1440" height="900" fill="url(#fdgGlow)" />

      {/* Sol/luna decorativa pulsante */}
      <circle cx="1200" cy="180" r="120" fill="url(#fdgSun)" className="fdg-anim-sun" />

      {/* Estrellas parpadeantes */}
      {STARS.map((s, i) => (
        <use
          key={`star${i}`}
          href="#star"
          x={s.cx}
          y={s.cy}
          width={s.size * 2}
          height={s.size * 2}
          color="#FCD34D"
          opacity="0.6"
          className="fdg-anim-star"
          style={{ animationDelay: s.delay, animationDuration: s.dur }}
        />
      ))}

      {/* Nubes flotantes (lentas) */}
      {CLOUDS.map((c, i) => (
        <g
          key={`cloud${i}`}
          className="fdg-anim-cloud"
          style={{ animationDuration: c.speed, animationDelay: c.delay }}
        >
          <ellipse cx={c.x} cy={c.y} rx={c.size} ry={c.size * 0.4} fill="#fff" opacity="0.18" />
          <ellipse cx={c.x - c.size * 0.5} cy={c.y + c.size * 0.1} rx={c.size * 0.6} ry={c.size * 0.3} fill="#fff" opacity="0.18" />
          <ellipse cx={c.x + c.size * 0.5} cy={c.y + c.size * 0.1} rx={c.size * 0.7} ry={c.size * 0.35} fill="#fff" opacity="0.18" />
        </g>
      ))}

      {/* Pájaros volando */}
      {BIRDS.map((b, i) => (
        <use
          key={`bird${i}`}
          href="#bird"
          x={b.x}
          y={b.y}
          width="22"
          height="11"
          color="#fff"
          opacity="0.5"
          className="fdg-anim-bird"
          style={{ animationDelay: b.delay, animationDuration: b.dur }}
        />
      ))}

      {/* Suelo (césped/atardecer) */}
      <rect y="720" width="1440" height="180" fill="url(#fdgGround)" />

      {/* Árboles izquierda */}
      <g className="fdg-anim-tree-left">
        <rect x="80" y="640" width="14" height="100" fill="#78350F" opacity="0.8" />
        <circle cx="87" cy="620" r="50" fill="#10B981" opacity="0.85" />
        <circle cx="65" cy="635" r="35" fill="#059669" opacity="0.8" />
        <circle cx="110" cy="635" r="38" fill="#10B981" opacity="0.85" />
        <circle cx="87" cy="595" r="32" fill="#34D399" opacity="0.8" />
      </g>

      {/* Árboles derecha */}
      <g className="fdg-anim-tree-right">
        <rect x="1330" y="650" width="14" height="90" fill="#78350F" opacity="0.8" />
        <circle cx="1337" cy="630" r="45" fill="#059669" opacity="0.85" />
        <circle cx="1315" cy="645" r="32" fill="#10B981" opacity="0.8" />
        <circle cx="1359" cy="645" r="35" fill="#059669" opacity="0.85" />
      </g>

      {/* Casita central acogedora */}
      <g className="fdg-anim-house" transform="translate(670, 620)">
        {/* Cuerpo */}
        <rect x="0" y="40" width="100" height="80" fill="url(#fdgHouse)" stroke="#92400E" strokeWidth="3" />
        {/* Tejado */}
        <polygon points="-10,40 50,-5 110,40" fill="url(#fdgRoof)" stroke="#7F1D1D" strokeWidth="2" />
        {/* Chimenea */}
        <rect x="75" y="-2" width="14" height="22" fill="#7F1D1D" />
        {/* Puerta */}
        <rect x="38" y="75" width="24" height="45" fill="#78350F" stroke="#451A03" strokeWidth="2" rx="2" />
        <circle cx="55" cy="98" r="2" fill="#FBBF24" />
        {/* Ventanas */}
        <rect x="10" y="55" width="18" height="18" fill="#BAE6FD" stroke="#0C4A6E" strokeWidth="2" rx="2" />
        <line x1="19" y1="55" x2="19" y2="73" stroke="#0C4A6E" strokeWidth="1" />
        <line x1="10" y1="64" x2="28" y2="64" stroke="#0C4A6E" strokeWidth="1" />
        <rect x="72" y="55" width="18" height="18" fill="#BAE6FD" stroke="#0C4A6E" strokeWidth="2" rx="2" />
        <line x1="81" y1="55" x2="81" y2="73" stroke="#0C4A6E" strokeWidth="1" />
        <line x1="72" y1="64" x2="90" y2="64" stroke="#0C4A6E" strokeWidth="1" />
        {/* Humo de chimenea */}
        <g className="fdg-anim-smoke">
          <circle cx="82" cy="-10" r="6" fill="#fff" opacity="0.6" />
          <circle cx="78" cy="-22" r="8" fill="#fff" opacity="0.45" />
          <circle cx="85" cy="-36" r="10" fill="#fff" opacity="0.3" />
          <circle cx="80" cy="-52" r="12" fill="#fff" opacity="0.18" />
        </g>
        {/* Corazón en el techo */}
        <use href="#heart" x="50" y="20" width="14" height="14" color="#EC4899" opacity="0.9" className="fdg-anim-house-heart" />
      </g>

      {/* Flores en el suelo */}
      <g opacity="0.85">
        <circle cx="200" cy="780" r="6" fill="#EC4899" />
        <circle cx="200" cy="780" r="3" fill="#FCD34D" />
        <line x1="200" y1="785" x2="200" y2="810" stroke="#10B981" strokeWidth="2" />

        <circle cx="320" cy="800" r="5" fill="#A78BFA" />
        <circle cx="320" cy="800" r="2.5" fill="#FCD34D" />
        <line x1="320" y1="803" x2="320" y2="825" stroke="#10B981" strokeWidth="2" />

        <circle cx="1100" cy="790" r="6" fill="#FB7185" />
        <circle cx="1100" cy="790" r="3" fill="#FCD34D" />
        <line x1="1100" y1="795" x2="1100" y2="820" stroke="#10B981" strokeWidth="2" />

        <circle cx="1220" cy="810" r="5" fill="#60A5FA" />
        <circle cx="1220" cy="810" r="2.5" fill="#FCD34D" />
        <line x1="1220" y1="813" x2="1220" y2="835" stroke="#10B981" strokeWidth="2" />
      </g>

      {/* Corazones flotantes desde abajo */}
      {HEARTS.map((h, i) => (
        <use
          key={`heart${i}`}
          href="#heart"
          x={h.cx}
          y={h.cy}
          width={h.size * 2}
          height={h.size * 2}
          color={h.color}
          className="fdg-anim-heart"
          style={{ animationDelay: h.delay, animationDuration: h.dur }}
        />
      ))}

      {/* Vignette sutil */}
      <radialGradient id="fdgVignette" cx="50%" cy="50%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
      </radialGradient>
      <rect width="1440" height="900" fill="url(#fdgVignette)" />
    </svg>
  );
});

export default function FamilyDragGame({ onFinish }) {
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
    MEMBERS.forEach(m => {
      const a = new Audio();
      a.preload = "auto";
      a.src = m.audio;
      a.load();
      a.volume = 1;
      wordAudios.current[m.word] = a;
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
        confetti({ particleCount: 16, angle: 60, spread: 80, origin: { x: 0 }, colors: ["#3B82F6", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"] });
        confetti({ particleCount: 16, angle: 120, spread: 80, origin: { x: 1 }, colors: ["#3B82F6", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"] });
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
      colors: [currentQuestion.color, "#FCD34D", "#fff"]
    });

    setBounce(true);
    setTimeout(() => setBounce(false), 600);

    setTimeout(() => {
      if (!mountedRef.current) return;
      const a = wordAudios.current[wordSolved];
      if (a) {
        a.pause();
        a.currentTime = 0;

        const onEnded = () => {
          a.removeEventListener('ended', onEnded);
          if (mountedRef.current) {
            setTimeout(() => triggerNext(current), 600);
          }
        };
        a.addEventListener('ended', onEnded);

        a.play().catch(() => {
          setTimeout(() => {
            if (mountedRef.current) triggerNext(current);
          }, 1500);
        });

        setTimeout(() => {
          if (mountedRef.current && !a.paused === false) {
            a.removeEventListener('ended', onEnded);
            triggerNext(current);
          }
        }, 4000);
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
        setTimeout(() => { if (mountedRef.current) triggerNext(current); }, 2200);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, currentWord, solved, finished, hints, lives, current, handleSolved, triggerNext]);

  const score = questions.reduce((acc, q) => (answers[q.word] === true ? acc + 1 : acc), 0);
  const progress = ((current + (solved ? 1 : 0)) / questions.length) * 100;
  const roundColor = currentQuestion?.color || "#3B82F6";
  const roundGlow = currentQuestion?.glow || "rgba(59,130,246,0.7)";
  const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

  if (finished) return (
    <div className="fdg-game-root fdg-result-container">
      <FamilyBg color={roundColor} />
      {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
      <div className="fdg-result-card">
        <div className="fdg-result-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
        <div className="fdg-result-badge">Family Members · Level 3 ✏️</div>
        <h2 className="fdg-result-title">¡Nivel terminado!</h2>
        <div className="fdg-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`fdg-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="fdg-result-stats">
          <div className="fdg-rstat"><span>✅</span><span>Solved</span><strong>{score}/{questions.length}</strong></div>
          <div className="fdg-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
          <div className="fdg-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="fdg-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
          <div className="fdg-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
        </div>
        {onFinish && (
          <button className="fdg-result-btn" onClick={() => onFinish(score)}>
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
    <div className="fdg-game-root">
      {/* 🏠 Fondo SVG animado */}
      <FamilyBg color={roundColor} />

      {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

      <div className="fdg-header-bar">
        <div className="fdg-header-left">
          <span className="fdg-header-badge">Level 3</span>
          <span className="fdg-header-title">✏️ Writing</span>
        </div>
        <div className="fdg-header-right">
          <div className="fdg-header-pill">⚡ {totalPoints}</div>
          {streak >= 2 && <div className="fdg-header-pill fdg-streak-pill">🔥 {streak}x</div>}
          <div className="fdg-header-pill">🎯 {attempts}</div>
          <div className="fdg-header-pill">⏱ {timeElapsed}s</div>
        </div>
      </div>

      <div className="fdg-write-container">
        <div className={`fdg-wrapper ${shake ? "fdg-shake" : ""} ${bounce ? "fdg-bounce" : ""}`}>

          <div className="fdg-progress-track">
            <div className="fdg-progress-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg,${roundColor},#FCD34D)`,
                boxShadow: `0 0 12px ${roundGlow}`
              }} />
            <div className="fdg-progress-steps">
              {questions.map((_, i) => (
                <div key={i} className={`fdg-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                  style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
              ))}
            </div>
          </div>

          <p className="fdg-instruction">✏️ Look at the picture and complete the word! 💡</p>

          <div className="fdg-clue-row">
            <div className="fdg-card-with-lives">
              <div className={`fdg-mini-card ${revealed ? "revealed" : ""}`}
                style={{ borderColor: roundColor, boxShadow: `0 0 0 4px rgba(255,255,255,0.5), 0 18px 40px rgba(0,0,0,0.4), 0 0 40px ${roundGlow}` }}>
                <img src={currentQuestion.img} alt={currentWord} className="fdg-mini-img" />
              </div>
              <div className="fdg-lives-container">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`fdg-heart ${i < lives ? "alive" : "lost"}`}>
                    {i < lives ? "❤️" : "🖤"}
                  </span>
                ))}
              </div>
            </div>

            <div className="fdg-slots-container">
              <div className="fdg-slots">
                {slots.map(slot => (
                  <div key={slot.index}
                    className={`fdg-slot
                      ${slot.isFilled ? "filled" : ""}
                      ${slot.isHint && slot.isFilled ? "hint" : ""}
                      ${activeIndex === slot.index ? "active" : ""}
                      ${solved && answers[currentWord] ? "solved" : ""}
                    `}
                    style={{
                      "--slot-color": roundColor,
                      "--slot-glow": roundGlow
                    }}>
                    <span className="fdg-slot-char">{slot.char}</span>
                    {activeIndex === slot.index && (
                      <div className="fdg-slot-arrow">⬇️</div>
                    )}
                    {slot.isHint && slot.isFilled && (
                      <div className="fdg-hint-tag">💡</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fdg-keyboard">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="fdg-keyboard-row">
                {row.map(letter => {
                  const stillNeeded = (remainingLetters[letter] || 0) > 0;
                  const wasTyped = usedKeys.has(letter);
                  const isUsed = wasTyped && !stillNeeded;
                  const isWrong = wrongKey === letter;
                  const inWord = currentWord.includes(letter);
                  return (
                    <button
                      key={letter}
                      className={`fdg-key
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