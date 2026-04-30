import React, { useState, useEffect, useRef } from "react";
import "./Familyphoto.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

import fatherImg from "../../../../assets/fatherlevel3.png";
import motherImg from "../../../../assets/motherlevel3.png";
import sisterImg from "../../../../assets/sisterlevel3.png";
import brotherImg from "../../../../assets/brotherlevel3.png";
import grandfatherImg from "../../../../assets/grandfatherlevel3.png";
import grandmotherImg from "../../../../assets/grandmotherlevel3.png";

// ✅ Audios DE FEEDBACK (correcto/incorrecto)
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ✅ Audios de FRASES COMPLETAS THIS (refuerzo después de elegir)
import thisIsFatherAudio from "../../../../assets/sounds/thisismyfather.mp3";
import thisIsMotherAudio from "../../../../assets/sounds/thisismymother.mp3";
import thisIsSisterAudio from "../../../../assets/sounds/thisismysister.mp3";
import thisIsBrotherAudio from "../../../../assets/sounds/thisismybrother.mp3";
import thisIsGrandfatherAudio from "../../../../assets/sounds/thisismygrandfather.mp3";
import thisIsGrandmotherAudio from "../../../../assets/sounds/thisismygrandmother.mp3";

// ✅ Audios de FRASES COMPLETAS THAT
import thatIsFatherAudio from "../../../../assets/sounds/thatismyfather.mp3";
import thatIsMotherAudio from "../../../../assets/sounds/thatismymother.mp3";
import thatIsSisterAudio from "../../../../assets/sounds/thatismysister.mp3";
import thatIsBrotherAudio from "../../../../assets/sounds/thatismybrother.mp3";
import thatIsGrandfatherAudio from "../../../../assets/sounds/thatismygrandfather.mp3";
import thatIsGrandmotherAudio from "../../../../assets/sounds/thatismygrandmother.mp3";

const MEMBERS = [
  { id: "father", name: "father", img: fatherImg, color: "#3B82F6", thisAudio: thisIsFatherAudio, thatAudio: thatIsFatherAudio },
  { id: "mother", name: "mother", img: motherImg, color: "#EC4899", thisAudio: thisIsMotherAudio, thatAudio: thatIsMotherAudio },
  { id: "sister", name: "sister", img: sisterImg, color: "#F59E0B", thisAudio: thisIsSisterAudio, thatAudio: thatIsSisterAudio },
  { id: "brother", name: "brother", img: brotherImg, color: "#10B981", thisAudio: thisIsBrotherAudio, thatAudio: thatIsBrotherAudio },
  { id: "grandfather", name: "grandfather", img: grandfatherImg, color: "#8B5CF6", thisAudio: thisIsGrandfatherAudio, thatAudio: thatIsGrandfatherAudio },
  { id: "grandmother", name: "grandmother", img: grandmotherImg, color: "#EF4444", thisAudio: thisIsGrandmotherAudio, thatAudio: thatIsGrandmotherAudio },
];

const shuffle = a => [...a].sort(() => Math.random() - .5);

// 6 rondas: cada miembro una vez, 3 THIS + 3 THAT aleatorio
const buildRounds = () => {
  const shuffledMembers = shuffle(MEMBERS);
  const demos = shuffle(["THIS", "THIS", "THIS", "THAT", "THAT", "THAT"]);
  return shuffledMembers.map((member, i) => {
    const demo = demos[i];
    const others = shuffle(MEMBERS.filter(x => x.id !== member.id));
    if (demo === "THIS") {
      return { nearMember: member, farMember: others[0], demo: "THIS", target: "near" };
    } else {
      return { nearMember: others[0], farMember: member, demo: "THAT", target: "far" };
    }
  });
};

const TOTAL_ROUNDS = 6;

/* ── Park SVG Background ── */
function ParkBg() {
  return (
    <svg className="park-svg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#C9E8F7" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5CB85C" />
          <stop offset="100%" stopColor="#3D8B3D" />
        </linearGradient>
        <linearGradient id="path-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D2B48C" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#A0785A" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="280" fill="url(#sky)" />
      <circle cx="680" cy="70" r="50" fill="url(#sun-glow)" />
      <circle cx="680" cy="70" r="34" fill="#FFD700" opacity="0.9" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line key={i}
          x1={680 + Math.cos(angle * Math.PI / 180) * 40}
          y1={70 + Math.sin(angle * Math.PI / 180) * 40}
          x2={680 + Math.cos(angle * Math.PI / 180) * 55}
          y2={70 + Math.sin(angle * Math.PI / 180) * 55}
          stroke="#FFD700" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      ))}
      <g opacity="0.9" className="cloud-1">
        <ellipse cx="150" cy="80" rx="55" ry="28" fill="white" />
        <ellipse cx="115" cy="90" rx="35" ry="22" fill="white" />
        <ellipse cx="185" cy="88" rx="38" ry="20" fill="white" />
      </g>
      <g opacity="0.85" className="cloud-2">
        <ellipse cx="420" cy="55" rx="45" ry="22" fill="white" />
        <ellipse cx="392" cy="63" rx="28" ry="18" fill="white" />
        <ellipse cx="448" cy="62" rx="30" ry="17" fill="white" />
      </g>
      <rect y="265" width="800" height="185" fill="url(#grass)" />
      <ellipse cx="400" cy="268" rx="520" ry="30" fill="#6CC56C" />
      <polygon points="340,450 460,450 510,265 290,265" fill="url(#path-grad)" />
      {[0.2, 0.45, 0.7].map((t, i) => {
        const y = 265 + t * 185;
        const xL = 340 - t * 50;
        const xR = 460 + t * 50;
        return <line key={i} x1={xL} y1={y} x2={xR} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="14,10" />;
      })}
      <g transform="translate(85,210) scale(0.55)">
        <rect x="-6" y="30" width="12" height="50" fill="#7B4F2E" />
        <circle cx="0" cy="20" r="32" fill="#2D7A2D" />
        <circle cx="-18" cy="30" r="22" fill="#3A9A3A" />
        <circle cx="18" cy="28" r="24" fill="#3A9A3A" />
      </g>
      <g transform="translate(715,215) scale(0.5)">
        <rect x="-6" y="30" width="12" height="50" fill="#7B4F2E" />
        <circle cx="0" cy="20" r="32" fill="#2D7A2D" />
        <circle cx="-18" cy="30" r="22" fill="#3A9A3A" />
        <circle cx="18" cy="28" r="24" fill="#3A9A3A" />
      </g>
      <ellipse cx="200" cy="268" rx="30" ry="14" fill="#2D7A2D" opacity="0.7" />
      <ellipse cx="590" cy="265" rx="35" ry="16" fill="#2D7A2D" opacity="0.7" />
      <g transform="translate(40,160)">
        <rect x="-10" y="100" width="20" height="130" fill="#7B4F2E" />
        <circle cx="0" cy="80" r="62" fill="#2D7A2D" />
        <circle cx="-35" cy="100" r="44" fill="#3A9A3A" />
        <circle cx="35" cy="95" r="48" fill="#3A9A3A" />
        <circle cx="-15" cy="50" r="38" fill="#4CAF50" />
        <circle cx="20" cy="55" r="36" fill="#4CAF50" />
      </g>
      <g transform="translate(760,170)">
        <rect x="-10" y="100" width="20" height="120" fill="#7B4F2E" />
        <circle cx="0" cy="80" r="58" fill="#2D7A2D" />
        <circle cx="-32" cy="98" r="40" fill="#3A9A3A" />
        <circle cx="32" cy="94" r="44" fill="#3A9A3A" />
        <circle cx="-12" cy="52" r="36" fill="#4CAF50" />
        <circle cx="18" cy="56" r="34" fill="#4CAF50" />
      </g>
      {[[270, 310], [530, 308], [250, 340], [545, 338]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill={["#FF6B9D", "#FFD700", "#FF9999", "#FFAAFF"][i]} />
          <line x1={x} y1={y} x2={x} y2={y + 10} stroke="#5CB85C" strokeWidth="1.5" />
        </g>
      ))}
      <g transform="translate(195,248) scale(0.6)">
        <rect x="-25" y="0" width="50" height="8" rx="3" fill="#8B6914" />
        <rect x="-22" y="-14" width="44" height="7" rx="3" fill="#A0781A" />
        <rect x="-20" y="8" width="5" height="14" rx="2" fill="#8B6914" />
        <rect x="15" y="8" width="5" height="14" rx="2" fill="#8B6914" />
      </g>
    </svg>
  );
}

// ── Result background gradients ──
const fp3BgGradients = {
  blue: "linear-gradient(160deg,#0a1628,#1D4ED8,#0EA5E9)",
  green: "linear-gradient(160deg,#052e16,#15803D,#4ADE80)",
  orange: "linear-gradient(160deg,#431407,#C2410C,#FB923C)",
  purple: "linear-gradient(160deg,#1e0533,#6D28D9,#A78BFA)",
  teal: "linear-gradient(160deg,#012827,#0F766E,#2DD4BF)",
  pink: "linear-gradient(160deg,#3b0a20,#BE185D,#F472B6)",
};

// ── Header SIN vidas ──
function GameHeader({ score, streak, attempts, seconds }) {
  const fmt = () => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <div className="fp3-header-bar">
      <div className="fp3-header-left">
        <span className="fp3-level-tag">Level 2</span>
        <span className="fp3-title">📖 Reading</span>
      </div>
      <div className="fp3-header-right">
        <div className="fp3-stat-pill">⚡ {score}</div>
        {streak >= 2 && <div className="fp3-stat-pill fp3-streak">🔥 {streak}x</div>}
        <div className="fp3-stat-pill">🎯 {attempts}</div>
        <div className="fp3-stat-pill">⏱ {fmt()}</div>
      </div>
    </div>
  );
}

function FloatPts({ value }) {
  return <div className={`fp3-float ${value > 0 ? "fpos" : "fneg"}`}>{value > 0 ? `+${value}` : value}</div>;
}

export default function FamilyPhoto({ onFinish }) {
  const [rounds] = useState(() => buildRounds());
  const [phase, setPhase] = useState("intro");
  const [tutStep, setTutStep] = useState(0);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [shake, setShake] = useState(false);
  const [ripple, setRipple] = useState(null);
  const [bgColor] = useState(() => ["blue", "green", "orange", "purple", "teal", "pink"][Math.floor(Math.random() * 6)]);

  const correctSnd = useRef(null);
  const wrongSnd = useRef(null);
  const phraseAudios = useRef({});  // pre-cargados
  const currentPhraseRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // ── Pre-load AGRESIVO de todos los audios ──
  useEffect(() => {
    mountedRef.current = true;

    // Pre-cargar correcto/incorrecto
    const c = new Audio(correctoSound);
    const w = new Audio(incorrectoSound);
    c.preload = "auto"; c.load();
    w.preload = "auto"; w.load();
    correctSnd.current = c;
    wrongSnd.current = w;

    // Pre-cargar TODAS las frases completas (12 audios)
    MEMBERS.forEach(m => {
      const aThis = new Audio();
      aThis.preload = "auto";
      aThis.src = m.thisAudio;
      aThis.load();
      aThis.volume = 1;

      const aThat = new Audio();
      aThat.preload = "auto";
      aThat.src = m.thatAudio;
      aThat.load();
      aThat.volume = 1;

      phraseAudios.current[`${m.id}_THIS`] = aThis;
      phraseAudios.current[`${m.id}_THAT`] = aThat;
    });

    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
      confetti.reset();
      // Detener cualquier audio activo al desmontar
      if (currentPhraseRef.current) {
        currentPhraseRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Reset al cambiar ronda (sin audio en pregunta)
  useEffect(() => {
    if (phase !== "play") return;
    setSelected(null);
    setIsCorrect(null);
    setRipple(null);
  }, [idx, phase]);

  // Reproducir frase completa (refuerzo después de elegir)
  const playPhrase = (memberId, demo) => {
    const audio = phraseAudios.current[`${memberId}_${demo}`];
    if (!audio) return;
    // Detener cualquier frase anterior
    if (currentPhraseRef.current) {
      currentPhraseRef.current.pause();
      currentPhraseRef.current.currentTime = 0;
    }
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(() => { });
    currentPhraseRef.current = audio;
  };

  const handleTap = (which) => {
    if (selected) return;
    const q = rounds[idx];
    const ok = which === q.target;
    setSelected(which);
    setIsCorrect(ok);
    setRipple(which);
    setAttempts(a => a + 1);

    const tm = q.target === "near" ? q.nearMember : q.farMember;

    if (ok) {
      // ✅ Acierto
      // 1. Sonido de correcto
      if (correctSnd.current) {
        correctSnd.current.currentTime = 0;
        correctSnd.current.play().catch(() => { });
      }

      // 2. Después de un breve delay, suena la frase completa (refuerzo)
      setTimeout(() => {
        if (mountedRef.current) playPhrase(tm.id, q.demo);
      }, 500);

      // Bonus consistente
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      const bonus = newStreak >= 3 ? 20 : newStreak >= 2 ? 15 : 10;
      setScore(s => s + bonus);
      addFloater(bonus);
      setCorrectCount(c => c + 1);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 }, colors: [tm.color, "#FCD34D", "#fff"] });
      setTimeout(() => { if (mountedRef.current) nextRound(); }, 2400);
    } else {
      // ❌ Fallo
      // 1. Sonido de incorrecto
      if (wrongSnd.current) {
        wrongSnd.current.currentTime = 0;
        wrongSnd.current.play().catch(() => { });
      }

      // 2. Después suena la frase correcta (refuerzo aprendizaje)
      setTimeout(() => {
        if (mountedRef.current) playPhrase(tm.id, q.demo);
      }, 600);

      setStreak(0);
      setScore(s => Math.max(0, s - 3));
      addFloater(-3);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => { if (mountedRef.current) nextRound(); }, 2800);
    }
  };

  const addFloater = (val) => {
    const id = Date.now() + Math.random();
    setFloaters(f => [...f, { val, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  };

  const nextRound = () => {
    if (idx >= TOTAL_ROUNDS - 1) endGame();
    else setIdx(i => i + 1);
  };

  const endGame = () => {
    setPhase("result"); clearInterval(timerRef.current);
    const end = Date.now() + 3200;
    const go = () => {
      if (!mountedRef.current) return;
      confetti({ particleCount: 16, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 16, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(go);
    };
    go();
  };

  const fmt = () => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const stars = correctCount === 6 && attempts <= 6 ? 3 : correctCount >= 5 ? 2 : 1;

  /* ── TUTORIAL ── */
  if (phase === "intro") {
    const isThis = tutStep === 0;
    return (
      <div className="fp3-tut-screen" style={{ display: "flex", flexDirection: "column" }}>
        <GameHeader score={score} streak={streak} attempts={attempts} seconds={seconds} />
        <div className="fp3-tut-park" style={{ flex: 1, position: "relative" }}>
          <ParkBg />
          <div className={`fp3-tut-near-char ${isThis ? "tut-char-active" : "tut-char-dim"}`}>
            {isThis && <div className="fp3-tut-bounce-arrow">⬇️</div>}
            <img src={motherImg} alt="near" className="fp3-tut-near-img" />
            <div className={`fp3-tut-label-badge ${isThis ? "badge-this-big" : "badge-dim"}`}>
              {isThis ? "👆 THIS = near!" : "THIS"}
            </div>
          </div>
          <div className={`fp3-tut-far-char ${!isThis ? "tut-char-active" : "tut-char-dim"}`}>
            <img src={fatherImg} alt="far" className="fp3-tut-far-img" />
            <div className={`fp3-tut-label-badge ${!isThis ? "badge-that-big" : "badge-dim"}`}>
              {!isThis ? "👉 THAT = far!" : "THAT"}
            </div>
            {!isThis && <div className="fp3-tut-far-arrow">⬆️ far away</div>}
          </div>
          <div className={`fp3-tut-panel ${isThis ? "panel-blue" : "panel-purple"}`}>
            <div className="fp3-tut-panel-top">
              <span className="fp3-tut-step-tag">Step {tutStep + 1} of 2</span>
              <h2 className="fp3-tut-big-text" key={tutStep}>
                {isThis
                  ? <><span className="word-this">THIS</span> = near! 👆</>
                  : <><span className="word-that">THAT</span> = far! 👉</>
                }
              </h2>
              <p className="fp3-tut-sub-text">
                {isThis
                  ? <><b>Close to you</b> → say THIS! 📍</>
                  : <><b>Far away</b> → say THAT! 🏃</>}
              </p>
              <div className={`fp3-tut-sentence-pill ${isThis ? "pill-this" : "pill-that"}`}>
                {isThis
                  ? <><b>👆 This</b> is my mother.</>
                  : <><b>👉 That</b> is my father.</>
                }
              </div>
            </div>
            <div className="fp3-tut-dots-row">
              <div className={`fp3-tdot ${tutStep === 0 ? "tdot-active" : ""}`} />
              <div className={`fp3-tdot ${tutStep === 1 ? "tdot-active" : ""}`} />
            </div>
            <button
              className={`fp3-tut-btn ${isThis ? "tbtn-blue" : "tbtn-purple"}`}
              onClick={() => isThis ? setTutStep(1) : setPhase("play")}
            >
              {isThis ? "Next: THAT 👉" : "🚀 Let's play!"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  /* ── RESULT (estilo BodyLevel1) ── */
  if (phase === "result") return (
    <div className="fp3-game-root fp3-result-container" style={{ background: "linear-gradient(160deg,#0F0A1E,#1A1330,#0F0A1E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GameBackground color="purple" />
      {floaters.map(({ val, id }) => <FloatPts key={id} value={val} />)}
      <div className="fp3-result-card">
        <div className="fp3-result-emoji">📸</div>
        <div className="fp3-result-badge">Family Members · Level 2 📖</div>
        <h2 className="fp3-result-title">¡Nivel terminado!</h2>
        <div className="fp3-result-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`fp3-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
          ))}
        </div>
        <div className="fp3-result-stats">
          <div className="fp3-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{TOTAL_ROUNDS}</strong></div>
          <div className="fp3-rstat"><span>⚡</span><span>Points</span><strong>{score}</strong></div>
          <div className="fp3-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
          <div className="fp3-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
          <div className="fp3-rstat"><span>⏱</span><span>Time</span><strong>{seconds}s</strong></div>
        </div>
        {onFinish && (
          <button className="fp3-result-btn" onClick={() => onFinish(correctCount)}>
            Continue ✏️
          </button>
        )}
      </div>
    </div>
  );

  /* ── GAME ── */
  const q = rounds[idx];
  const tm = q.target === "near" ? q.nearMember : q.farMember;
  const isNear = q.demo === "THIS";

  return (
    <div className={`fp3-game-root ${shake ? "fp3-shake" : ""}`}>
      <GameHeader score={score} streak={streak} attempts={attempts} seconds={seconds} />
      {floaters.map(({ val, id }) => <FloatPts key={id} value={val} />)}
      <div className="fp3-park-scene" style={{ flex: 1 }}>
        <ParkBg />

        {/* Pregunta como TEXTO grande (no botón, sin audio en pregunta) */}
        <div className="fp3-question-wrap">
          <div className={`fp3-question-text ${isNear ? "qtxt-this" : "qtxt-that"}`}>
            <span className="fp3-question-emoji">📖</span>
            {isNear
              ? <>Who's <b>THIS</b>? &nbsp; 👆 Tap the near person!</>
              : <>Who's <b>THAT</b>? &nbsp; 👉 Tap the far person!</>
            }
          </div>
        </div>

        {/* FAR character */}
        <div
          className={`fp3-char-far
              ${selected === "far" && isCorrect ? "char-correct" : ""}
              ${selected === "far" && !isCorrect ? "char-wrong" : ""}
              ${selected === "near" && q.target === "far" ? "char-correct-reveal" : ""}
              ${ripple === "far" ? "char-ripple" : ""}
            `}
          onClick={() => !selected && handleTap("far")}
        >
          <div className="fp3-far-label">
            <span className="label-that">👉 THAT</span>
            <span className="label-sub">far away</span>
          </div>
          <img src={q.farMember.img} alt={q.farMember.name} className="fp3-far-img" />
          {selected === "far" && (
            <div className={`fp3-char-verdict ${isCorrect ? "verd-ok" : "verd-fail"}`}>{isCorrect ? "✓" : "✗"}</div>
          )}
          {selected === "near" && q.target === "far" && (
            <div className="fp3-char-verdict verd-ok">✓</div>
          )}
          {!selected && <div className="fp3-tap-hint">TAP! 👆</div>}
        </div>

        {/* NEAR character */}
        <div
          className={`fp3-char-near
              ${selected === "near" && isCorrect ? "char-correct" : ""}
              ${selected === "near" && !isCorrect ? "char-wrong" : ""}
              ${selected === "far" && q.target === "near" ? "char-correct-reveal" : ""}
              ${ripple === "near" ? "char-ripple" : ""}
            `}
          onClick={() => !selected && handleTap("near")}
        >
          <div className="fp3-near-label">
            <span className="label-this">👆 THIS</span>
            <span className="label-sub">near!</span>
          </div>
          <img src={q.nearMember.img} alt={q.nearMember.name} className="fp3-near-img" />
          {selected === "near" && (
            <div className={`fp3-char-verdict ${isCorrect ? "verd-ok" : "verd-fail"}`}>{isCorrect ? "✓" : "✗"}</div>
          )}
          {selected === "far" && q.target === "near" && (
            <div className="fp3-char-verdict verd-ok">✓</div>
          )}
          {!selected && <div className="fp3-tap-hint">TAP! 👆</div>}
        </div>

        <div className="fp3-you-game">🧒 YOU</div>

        {/* Feedback panel — sin botón de audio */}
        {selected && (
          <div className="fp3-feedback">
            <div className={`fp3-fb-banner ${isCorrect ? "fb-ok" : "fb-fail"}`}>
              <span className="fp3-fb-icon">{isCorrect ? "✅" : "❌"}</span>
              <span className="fp3-fb-text">
                {isCorrect
                  ? <><b>{q.demo}</b> is my {tm.name} — Great job! 🎉</>
                  : <>The answer was: <b>{q.demo}</b> is my {tm.name} 💡</>
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}