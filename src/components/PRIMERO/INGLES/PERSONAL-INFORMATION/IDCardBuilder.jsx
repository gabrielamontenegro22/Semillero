import React, { useState, useEffect, useRef } from "react";
import "./IDCardBuilder.css";
import GameBackground from "../GameBackground";
import confetti from "canvas-confetti";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const FIELDS = [
  {
    id: "name",
    label: "Name",
    icon: "🙋",
    question: "What's your name?",
    hint: 'Type your name, e.g. "Sam"',
    placeholder: "Sam",
    validate: (v) => v.trim().length >= 2,
    format: (v) => v.trim(),
    errorMsg: "Write at least 2 letters!",
    color: "#A78BFA",
  },
  {
    id: "age",
    label: "Age",
    icon: "🎂",
    question: "How old are you?",
    hint: "Type your age, e.g. 7",
    placeholder: "7",
    validate: (v) => /^\d+$/.test(v.trim()) && parseInt(v) >= 1 && parseInt(v) <= 15,
    format: (v) => v.trim(),
    errorMsg: "Type a number between 1 and 15!",
    color: "#FCD34D",
  },
  {
    id: "country",
    label: "Country",
    icon: "🌎",
    question: "Where are you from?",
    hint: 'Type your country, e.g. "Colombia"',
    placeholder: "Colombia",
    validate: (v) => v.trim().length >= 3,
    format: (v) => v.trim(),
    errorMsg: "Write at least 3 letters!",
    color: "#4ADE80",
  },
];

function FloatingPoints({ value, id }) {
  return (
    <div className={`idc-fp ${value > 0 ? "pos" : "neg"}`} key={id}>
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

function IDCard({ filledFields, currentField, totalFields, animatingField }) {
  const progress = filledFields.length / totalFields;
  const avatarEmoji = filledFields.length === 0 ? "❓"
    : filledFields.length === 1 ? "🧒"
      : filledFields.length === 2 ? "😊" : "🌟";

  return (
    <div className="idc-card">
      <div className="idc-card-shine" />
      <div className="idc-card-header">
        <div className="idc-card-logo">⭐ STUDENT ID</div>
        <div className="idc-card-num">2025 · #001</div>
      </div>
      <div className="idc-avatar-wrap">
        <div className="idc-avatar-frame">
          <span className="idc-avatar-emoji">{avatarEmoji}</span>
        </div>
        <div className="idc-avatar-sublabel">
          {filledFields.length === totalFields ? "🌟 Complete!" : `${filledFields.length}/${totalFields} fields`}
        </div>
      </div>
      <div className="idc-card-prog-wrap">
        <div className="idc-card-prog-bar" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="idc-card-fields">
        {FIELDS.map((field) => {
          const filled = filledFields.find(f => f.id === field.id);
          const isCurrent = currentField?.id === field.id;
          const isAnim = animatingField === field.id;
          return (
            <div
              key={field.id}
              className={`idc-card-field ${filled ? "filled" : ""} ${isCurrent ? "current" : ""} ${isAnim ? "pop" : ""}`}
              style={isCurrent ? { borderColor: field.color + "88", boxShadow: `0 0 0 2px ${field.color}44` } : {}}
            >
              <span className="idc-cf-icon">{field.icon}</span>
              <div className="idc-cf-content">
                <span className="idc-cf-label">{field.label}</span>
                <span className="idc-cf-value">{filled ? filled.value : "· · · · · ·"}</span>
              </div>
              {filled && <span className="idc-cf-check" style={{ color: field.color }}>✓</span>}
            </div>
          );
        })}
      </div>
      <div className="idc-card-barcode">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="idc-bc-line" style={{ height: `${6 + (i % 4) * 5}px` }} />
        ))}
      </div>
    </div>
  );
}

export default function IDCardBuilder({ onFinish }) {
  const [fieldIdx, setFieldIdx] = useState(0);
  const [filledFields, setFilledFields] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState("");
  const [lives, setLives] = useState(3);
  const [shake, setShake] = useState(false);
  const [animatingField, setAnimatingField] = useState(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const isProcessing = useRef(false);
  const mountedRef = useRef(true);

  // Stop confetti on unmount
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
    c.preload = "auto"; c.load();
    w.preload = "auto"; w.load();
    correctAudio.current = c;
    wrongAudio.current = w;
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!finished) setTimeElapsed(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finished]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
    setInputVal("");
    setError("");
    setLives(3);
    setSuccessAnim(false);
  }, [fieldIdx]);

  const addFloater = (val) => {
    const id = Date.now() + Math.random();
    setFloaters(f => [...f, { val, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1100);
  };

  const handleSubmit = () => {
    if (isProcessing.current) return;
    const field = FIELDS[fieldIdx];
    if (!field.validate(inputVal)) {
      wrongAudio.current.currentTime = 0;
      wrongAudio.current.play();
      setError(field.errorMsg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setStreak(0);
      setPoints(p => Math.max(0, p - 2));
      addFloater(-2);

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        isProcessing.current = true;
        setAttempts(a => a + 1);
        setError("Out of lives! Let's move on.");
        setTimeout(() => {
          if (fieldIdx < FIELDS.length - 1) {
            setFieldIdx(i => i + 1);
            isProcessing.current = false;
          } else {
            finishGame();
          }
        }, 2000);
      }
      return;
    }
    correctAudio.current.currentTime = 0;
    correctAudio.current.play();
    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);
    const bonus = newStreak >= 3 ? 15 : 10;
    setPoints(p => p + bonus);
    addFloater(bonus);
    setError("");
    setSuccessAnim(true);
    isProcessing.current = true;
    setAttempts(a => a + 1);

    const newFilled = [...filledFields, { id: field.id, value: field.format(inputVal) }];
    setFilledFields(newFilled);
    setAnimatingField(field.id);
    setTimeout(() => setAnimatingField(null), 700);

    if (mountedRef.current) confetti({ particleCount: 55, spread: 60, origin: { y: 0.55 }, colors: ["#4ADE80", "#fff", "#FCD34D", "#A78BFA"] });

    if (fieldIdx < FIELDS.length - 1) {
      setTimeout(() => { setFieldIdx(i => i + 1); isProcessing.current = false; }, 700);
    } else {
      setTimeout(() => finishGame(), 700);
    }
  };

  const finishGame = () => {
    clearInterval(timerRef.current);
    setFinished(true);
    const end = Date.now() + 3500;
    const frame = () => {
      if (!mountedRef.current) return;
      confetti({ particleCount: 18, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 18, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  const currentField = FIELDS[fieldIdx];
  const unitStars = points >= 35 ? 3 : points >= 20 ? 2 : 1;

  // ── RESULT ────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="idc-screen idc-result-screen" style={{ background: "linear-gradient(160deg,#0F0A1E,#1A1330,#0F0A1E)" }}>
        <GameBackground color="purple" />
        <div className="idc-result-card">
          <div className="idc-result-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
          <div className="idc-result-badge">ID Card Builder · Complete</div>
          <h2>¡Nivel terminado!</h2>
          <div className="idc-result-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`idc-star ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
            ))}
          </div>
          <div className="idc-result-stats">
            <div className="idc-stat-box"><span>✅</span><span>Fields</span><strong>{filledFields.length}/{FIELDS.length}</strong></div>
            <div className="idc-stat-box"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
            <div className="idc-stat-box"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
            <div className="idc-stat-box"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
          </div>
          {onFinish && (
            <button className="idc-btn-finish" onClick={() => onFinish(filledFields.length)}>
              Continue 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── GAME ──────────────────────────────────────────────────
  return (
    <div className="idc-screen">
      <GameBackground color="purple" />
      {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}

      {/* Header */}
      <div className="idc-header">
        <div className="idc-header-left">
          <div className="idc-level-tag">Level 3</div>
          <div className="idc-title">ID Card Builder</div>
        </div>
        <div className="idc-header-right">
          <div className="idc-stat-pill">⚡ {points}</div>
          {streak >= 2 && <div className="idc-streak">🔥 {streak}x</div>}
          <div className="idc-stat-pill">🎯 {attempts}</div>
          <div className="idc-stat-pill">⏱ {timeElapsed}s</div>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="idc-steps">
        <div className="idc-steps-track">
          <div className="idc-steps-fill" style={{ width: `${(fieldIdx / (FIELDS.length - 1)) * 100}%` }} />
        </div>
        {FIELDS.map((f, i) => (
          <div key={i} className={`idc-step ${i < fieldIdx ? "done" : i === fieldIdx ? "active" : "pending"}`}>
            <div className="idc-step-dot" style={i === fieldIdx ? { background: f.color, boxShadow: `0 0 16px ${f.color}88` } : {}}>
              {i < fieldIdx ? "✓" : f.icon}
            </div>
            <span className="idc-step-label">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Main body */}
      <div className="idc-body">

        {/* LEFT — ID Card */}
        <div className="idc-left">
          <p className="idc-side-label">🪪 Your ID Card</p>
          <IDCard
            filledFields={filledFields}
            currentField={currentField}
            totalFields={FIELDS.length}
            animatingField={animatingField}
          />
        </div>

        {/* RIGHT — Question panel */}
        <div className="idc-right">
          <div className={`idc-qpanel ${shake ? "shake" : ""} ${successAnim ? "success" : ""}`}
            style={{ "--field-color": currentField.color }}>

            <div className="idc-field-chip">
              {currentField.icon} {currentField.label}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ fontSize: '24px', opacity: i < lives ? 1 : 0.3, filter: i < lives ? 'none' : 'grayscale(1)', transition: 'all 0.3s' }}>
                  {i < lives ? "❤️" : "🖤"}
                </span>
              ))}
            </div>

            <div className="idc-q-icon">{currentField.icon}</div>
            <div className="idc-q-text">{currentField.question}</div>
            <div className="idc-q-hint">{currentField.hint}</div>

            <div className="idc-input-group">
              <input
                ref={inputRef}
                className={`idc-input ${error ? "error" : ""}`}
                type={currentField.id === "age" ? "number" : "text"}
                placeholder={currentField.placeholder}
                value={inputVal}
                onChange={e => { setInputVal(e.target.value); setError(""); }}
                onKeyDown={handleKey}
                min={currentField.id === "age" ? 1 : undefined}
                max={currentField.id === "age" ? 15 : undefined}
                autoComplete="off"
              />
              {error && <div className="idc-error">⚠️ {error}</div>}
            </div>

            <button
              className={`idc-btn-check ${!inputVal.trim() ? "disabled" : ""}`}
              onClick={handleSubmit}
              disabled={!inputVal.trim()}
              style={inputVal.trim() ? { background: `linear-gradient(135deg, ${currentField.color}, ${currentField.color}cc)`, color: "#1a1a2e" } : {}}
            >
              Fill it in! ✏️
            </button>

            <div className="idc-counter">
              Field <strong>{fieldIdx + 1}</strong> of <strong>{FIELDS.length}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}