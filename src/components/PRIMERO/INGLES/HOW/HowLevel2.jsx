import React, { useState, useEffect, useRef } from "react";
import "./Howlevel2.css";
import confetti from "canvas-confetti";
import marioImg from "../../../../assets/mario.png";

// ✅ FIX: Importar audios para refuerzo
import howManyAudio from "../../../../assets/sounds/HOWMANY.m4a";
import howMuchAudio from "../../../../assets/sounds/HOWMUCH.m4a";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const correctSnd = new Audio(correctoSound); correctSnd.preload = 'auto';
const incorrectSnd = new Audio(incorrectoSound); incorrectSnd.preload = 'auto';
const howManyAud = new Audio(howManyAudio); howManyAud.preload = 'auto';
const howMuchAud = new Audio(howMuchAudio); howMuchAud.preload = 'auto';

// ── QUESTIONS DATA ──
const QUESTIONS = [
    // Countable → How many?
    { type: "many", emoji: "🍎", item: "apples", count: 3, color: "#EF4444", glow: "rgba(239,68,68,0.7)" },
    { type: "many", emoji: "🐱", item: "cats", count: 4, color: "#F59E0B", glow: "rgba(245,158,11,0.7)" },
    { type: "many", emoji: "📚", item: "books", count: 5, color: "#3B82F6", glow: "rgba(59,130,246,0.7)" },
    { type: "many", emoji: "🌟", item: "stars", count: 6, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { type: "many", emoji: "🐶", item: "dogs", count: 2, color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { type: "many", emoji: "🍕", item: "pizzas", count: 4, color: "#F472B6", glow: "rgba(244,114,182,0.7)" },
    { type: "many", emoji: "🎈", item: "balloons", count: 7, color: "#A78BFA", glow: "rgba(167,139,250,0.7)" },
    { type: "many", emoji: "🐠", item: "fish", count: 5, color: "#06B6D4", glow: "rgba(6,182,212,0.7)" },
    // Uncountable → How much?
    { type: "much", emoji: "💧", item: "water", count: 0, color: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
    { type: "much", emoji: "🍚", item: "rice", count: 0, color: "#FDE68A", glow: "rgba(253,230,138,0.7)" },
    { type: "much", emoji: "🥛", item: "milk", count: 0, color: "#E2E8F0", glow: "rgba(226,232,240,0.7)" },
    { type: "much", emoji: "🍯", item: "honey", count: 0, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { type: "much", emoji: "☕", item: "coffee", count: 0, color: "#92400E", glow: "rgba(146,64,14,0.7)" },
    { type: "much", emoji: "🧂", item: "salt", count: 0, color: "#CBD5E1", glow: "rgba(203,213,225,0.7)" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }

function genRounds() {
    const many = shuffle(QUESTIONS.filter(q => q.type === "many")).slice(0, 4);
    const much = shuffle(QUESTIONS.filter(q => q.type === "much")).slice(0, 4);
    return shuffle([...many, ...much]);
}

// ── 2 options: how many vs how much ──
function genOptions(q) {
    const opts = [
        { label: "How many?", key: "many", emoji: "🔢", correct: q.type === "many" },
        { label: "How much?", key: "much", emoji: "💧", correct: q.type === "much" },
    ];
    return shuffle(opts);
}

// ── Emoji display ──
function EmojiDisplay({ q, celebrating }) {
    if (q.type === "much") {
        return (
            <div className="hm2-emoji-uncountable">
                <span className="hm2-emoji-big">{q.emoji}</span>
                <span className="hm2-emoji-big hm2-emoji-med">{q.emoji}</span>
                <span className="hm2-emoji-big hm2-emoji-sm">{q.emoji}</span>
            </div>
        );
    }
    const cols = q.count <= 4 ? 2 : q.count <= 6 ? 3 : 4;
    return (
        <div className="hm2-emoji-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
            {Array.from({ length: q.count }).map((_, i) => (
                <span key={i} className={`hm2-emoji-item ${celebrating ? "hm2-emoji-celebrate" : ""}`}
                    style={{ animationDelay: `${i * .05}s` }}>
                    {q.emoji}
                </span>
            ))}
        </div>
    );
}

// ── Mario mascot ──
function Mario({ state }) {
    return (
        <div className={`hm2-mario hm2-mario--${state}`}>
            <img src={marioImg} alt="Mario" className="hm2-mario-img" />
        </div>
    );
}

// ── Animated background ──
const HMBg = React.memo(function HMBg({ color }) {
    const circles = React.useMemo(() => {
        return Array.from({ length: 55 }, (_, i) => ({
            id: i, x: Math.random() * 1440, y: Math.random() * 900,
            r: 0.8 + Math.random() * 2.2, dur: 1.5 + Math.random() * 3,
            begin: Math.random() * 5
        }));
    }, []);

    return (
        <svg className="hm2-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="hm2Bg" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#001428" />
                    <stop offset="60%" stopColor="#000a1a" />
                    <stop offset="100%" stopColor="#000005" />
                </radialGradient>
                <radialGradient id="hm2Glow" cx="50%" cy="45%" r="40%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#hm2Bg)" />
            <rect width="1440" height="900" fill="url(#hm2Glow)" />
            {Array.from({ length: 18 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 52} x2="1440" y2={i * 52} stroke={color} strokeWidth="0.4" opacity="0.07" />
            ))}
            {Array.from({ length: 29 }, (_, i) => (
                <line key={`v${i}`} x1={i * 52} y1="0" x2={i * 52} y2="900" stroke={color} strokeWidth="0.4" opacity="0.07" />
            ))}
            {circles.map(c => (
                <circle key={c.id} cx={c.x} cy={c.y} r={c.r} fill="#fff" opacity="0.8">
                    <animate attributeName="opacity" values="0.1;1;0.1" dur={`${c.dur}s`} repeatCount="indefinite" begin={`${c.begin}s`} />
                </circle>
            ))}
            {[[150, 180, 85], [1300, 160, 70], [700, 70, 55], [280, 720, 80], [1160, 660, 62]].map(([x, y, r], i) => (
                <circle key={`o${i}`} cx={x} cy={y} r={r} fill={color} opacity="0.08">
                    <animate attributeName="r" values={`${r};${r + 16};${r}`} dur={`${3 + i}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.04;0.14;0.04" dur={`${3 + i}s`} repeatCount="indefinite" />
                </circle>
            ))}
            <polygon points="0,0 130,0 0,130" fill={color} opacity="0.14" />
            <polygon points="1440,0 1310,0 1440,130" fill={color} opacity="0.14" />
            <polygon points="0,900 130,900 0,770" fill={color} opacity="0.14" />
            <polygon points="1440,900 1310,900 1440,770" fill={color} opacity="0.14" />
        </svg>
    );
});

function FP({ value }) {
    return <div className={`hm2-fp ${value > 0 ? "hm2-fpp" : "hm2-fpn"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

function ComboBanner({ streak }) {
    if (streak < 3) return null;
    const msg = streak >= 5 ? "🔥 UNSTOPPABLE!" : streak >= 4 ? "⚡ SUPER COMBO!" : "🎯 COMBO x3!";
    return <div className="hm2-combo" key={streak}>{msg}</div>;
}

const NUM_ROUNDS = 8, MAX_LIVES = 2, PTS_CORRECT = 10;

export default function HowLevel2({ onFinish }) {
    const [rounds, setRounds] = useState([]);
    const [options, setOptions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [roundLives, setRoundLives] = useState(MAX_LIVES);
    const [seconds, setSeconds] = useState(0);
    const [finished, setFinished] = useState(false);
    const [floaters, setFloaters] = useState([]);
    const [blocked, setBlocked] = useState(false);
    const [selected, setSelected] = useState(null);
    const [marioState, setMarioState] = useState("idle");
    const [celebrating, setCelebrating] = useState(false);
    const [showCombo, setShowCombo] = useState(false);

    const mountedRef = useRef(true);
    const floaterId = useRef(0);
    const roundsRef = useRef([]);
    const idxRef = useRef(0);
    const streakRef = useRef(0);
    const roundLivesRef = useRef(MAX_LIVES);
    const audioRef = useRef(null);

    useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { streakRef.current = streak; }, [streak]);
    useEffect(() => { roundLivesRef.current = roundLives; }, [roundLives]);

    useEffect(() => {
        mountedRef.current = true;
        const r = genRounds(); roundsRef.current = r; setRounds(r); loadRound(r, 0);
        return () => {
            mountedRef.current = false;
            confetti.reset();
            // ✅ Cleanup de audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
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

    const loadRound = (all, i) => {
        if (!mountedRef.current || !all[i]) return;
        // ✅ Detener audio anterior
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setSelected(null); setBlocked(false); setCelebrating(false);
        setMarioState("idle"); setRoundLives(MAX_LIVES); roundLivesRef.current = MAX_LIVES;
        setOptions(genOptions(all[i]));
    };

    // ✅ NUEVO: Reproducir audio de la pregunta correcta
    const playQuestionAudio = (q) => {
        if (!q) return;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const a = q.type === "many" ? howManyAud : howMuchAud;
        audioRef.current = a;
        a.currentTime = 0;
        a.play().catch(() => { });
    };

    const addFP = (v) => {
        const id = floaterId.current++;
        setFloaters(f => [...f, { v, id }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1300);
    };

    const handleOption = (optIdx) => {
        if (blocked || selected !== null) return;
        const i = idxRef.current, round = roundsRef.current[i];
        const opt = options[optIdx];
        setSelected(optIdx);
        if (opt.correct) {
            setBlocked(true);
            setAttempts(a => a + 1);
            correctSnd.currentTime = 0; correctSnd.play().catch(() => { });
            setMarioState("correct"); setCelebrating(true);
            const ns = streakRef.current + 1; streakRef.current = ns; setStreak(ns);
            setBestStreak(b => Math.max(b, ns));
            const bonus = PTS_CORRECT + (ns >= 5 ? 15 : ns >= 4 ? 10 : ns >= 3 ? 7 : ns >= 2 ? 4 : 0);
            setPoints(p => p + bonus); setCorrectCount(c => c + 1); addFP(bonus);
            if (ns >= 3) setShowCombo(true);
            confetti({
                particleCount: 100, spread: 110, origin: { y: 0.45 },
                colors: [round.color, "#FFD700", "#fff", "#FF6B9D", "#A78BFA"]
            });
            // ✅ FIX: Audio refuerzo después de "correcto"
            setTimeout(() => {
                if (!mountedRef.current) return;
                playQuestionAudio(round);
            }, 500);
            setTimeout(() => { setShowCombo(false); advanceTo(i + 1); }, 2400);
        } else {
            incorrectSnd.currentTime = 0; incorrectSnd.play().catch(() => { });
            setMarioState("wrong"); streakRef.current = 0; setStreak(0);
            // ✅ Sin penalización -3
            const nl = roundLivesRef.current - 1; roundLivesRef.current = nl; setRoundLives(nl);
            if (nl <= 0) {
                // ✅ FIX: Reveal verde + audio del correcto
                setBlocked(true);
                setAttempts(a => a + 1);
                setSelected(null); // ← desselecciona
                setMarioState("idle");
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playQuestionAudio(round); // ← niño escucha la pregunta correcta
                }, 400);
                setTimeout(() => advanceTo(i + 1), 2400);
            } else {
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    setSelected(null); setMarioState("idle");
                }, 900);
            }
        }
    };

    const advanceTo = (next) => {
        if (!mountedRef.current) return;
        if (next >= roundsRef.current.length) { setFinished(true); return; }
        setCurrentIdx(next); idxRef.current = next; loadRound(roundsRef.current, next);
    };

    const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
    const stars = correctCount >= 7 ? 3 : correctCount >= 5 ? 2 : 1;

    if (finished) return (
        <div className="hm2-result-root">
            <HMBg color="#A78BFA" />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="hm2-result-card">
                <img src={marioImg} alt="mario" className="hm2-result-mario" />
                <div className="hm2-result-badge">How many/much · Level 2 👁️</div>
                <h2 className="hm2-result-title">¡Nivel terminado!</h2>
                <div className="hm2-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`hm2-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="hm2-result-stats">
                    <div className="hm2-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{NUM_ROUNDS}</strong></div>
                    <div className="hm2-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="hm2-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="hm2-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && <button className="hm2-result-btn" onClick={() => onFinish(correctCount)}>Continue ✏️</button>}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;

    return (
        <div className="hm2-root">
            <HMBg color={round.color} />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            {showCombo && <ComboBanner streak={streak} />}

            {/* HEADER */}
            <div className="hm2-header">
                <div className="hm2-header-left">
                    <span className="hm2-badge" style={{ background: "linear-gradient(135deg,#A78BFA,#6366F1)" }}>Level 2</span>
                    <span className="hm2-header-title">👁️ Reading</span>
                </div>
                <div className="hm2-header-right">
                    <div className="hm2-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="hm2-pill hm2-pill-streak">🔥 {streak}x</div>}
                    <div className="hm2-pill">🎯 {attempts}</div>
                    <div className="hm2-pill">⏱ {fmt}</div>
                </div>
            </div>

            {/* PROGRESS */}
            <div className="hm2-progress-wrap">
                <div className="hm2-progress-track">
                    <div className="hm2-progress-fill" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6D28D9,#A78BFA)", boxShadow: "0 0 16px rgba(167,139,250,0.7)" }} />
                    <div className="hm2-progress-dots">
                        {rounds.map((_, i) => (
                            <div key={i} className={`hm2-pdot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`}
                                style={i === currentIdx ? { background: round.color, boxShadow: `0 0 10px ${round.color}` } : {}} />
                        ))}
                    </div>
                </div>
            </div>

            {/* GAME */}
            <div className="hm2-game">

                {/* LEFT — Mario */}
                <div className="hm2-left-col">
                    <Mario state={marioState} />
                    <div className="hm2-lives-row">
                        {Array.from({ length: MAX_LIVES }).map((_, i) => (
                            <span key={i} className={`hm2-life ${i < roundLives ? "alive" : "lost"}`}>
                                {i < roundLives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>
                    <div className="hm2-round-pill" style={{ color: round.color, borderColor: round.color, boxShadow: `0 0 14px ${round.glow}` }}>
                        Round {currentIdx + 1}/{NUM_ROUNDS}
                    </div>
                </div>

                {/* CENTER — Emoji display */}
                <div className="hm2-center-col">
                    <div className="hm2-hint-label" style={{ color: round.color, textShadow: `0 0 20px ${round.glow}` }}>
                        Look! 👇
                    </div>
                    <div className={`hm2-emoji-card ${celebrating ? "hm2-emoji-card--celebrate" : ""}`}
                        style={{ borderColor: round.color, boxShadow: `0 0 32px ${round.glow}` }}>
                        <EmojiDisplay q={round} celebrating={celebrating} />
                    </div>
                </div>

                {/* RIGHT — 2 BIG options */}
                <div className="hm2-right-col">
                    <div className="hm2-options-label">Which question fits? 👇</div>
                    <div className="hm2-options-grid">
                        {options.map((opt, i) => {
                            const isSel = selected === i;
                            let state = "";
                            if (selected !== null) {
                                if (isSel && opt.correct) state = "correct";
                                if (isSel && !opt.correct) state = "wrong";
                                if (!isSel && opt.correct && blocked) state = "reveal";
                            } else if (blocked && opt.correct) {
                                // ✅ Reveal cuando perdió todas las vidas
                                state = "reveal";
                            }
                            return (
                                <button key={i}
                                    className={`hm2-option hm2-opt-${opt.key} hm2-state-${state || "idle"}`}
                                    onClick={() => handleOption(i)}
                                    disabled={blocked}
                                    style={{ animationDelay: `${i * .1}s` }}
                                >
                                    <span className="hm2-opt-emoji">{opt.emoji}</span>
                                    <span className="hm2-opt-label">{opt.label}</span>
                                    <span className="hm2-opt-sub">
                                        {opt.key === "many" ? "countable" : "uncountable"}
                                    </span>
                                    {state === "correct" && <div className="hm2-verdict hm2-vok">✓</div>}
                                    {state === "wrong" && <div className="hm2-verdict hm2-vfail">✗</div>}
                                    {state === "reveal" && <div className="hm2-verdict hm2-vreveal">✓</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}