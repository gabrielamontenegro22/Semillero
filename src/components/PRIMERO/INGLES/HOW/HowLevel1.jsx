import React, { useState, useEffect, useRef } from "react";
import "./Howlevel1.css";
import confetti from "canvas-confetti";
import stitchImg from "../../../../assets/stich.png";

import howManyAudio from "../../../../assets/sounds/HOWMANY.m4a";
import howMuchAudio from "../../../../assets/sounds/HOWMUCH.m4a";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const correctSnd = new Audio(correctoSound); correctSnd.preload = 'auto';
const incorrectSnd = new Audio(incorrectoSound); incorrectSnd.preload = 'auto';
const howManyAud = new Audio(howManyAudio); howManyAud.preload = 'auto';
const howMuchAud = new Audio(howMuchAudio); howMuchAud.preload = 'auto';

// ── QUESTIONS DATA ──
// countable → How many? | uncountable → How much?
const QUESTIONS = [
    // Countable
    { type: "many", emoji: "🍎", item: "apples", count: 3, color: "#EF4444", glow: "rgba(239,68,68,0.7)", answer: "3 apples" },
    { type: "many", emoji: "🐱", item: "cats", count: 4, color: "#F59E0B", glow: "rgba(245,158,11,0.7)", answer: "4 cats" },
    { type: "many", emoji: "📚", item: "books", count: 5, color: "#3B82F6", glow: "rgba(59,130,246,0.7)", answer: "5 books" },
    { type: "many", emoji: "🌟", item: "stars", count: 6, color: "#FBBF24", glow: "rgba(251,191,36,0.7)", answer: "6 stars" },
    { type: "many", emoji: "🐶", item: "dogs", count: 2, color: "#FB923C", glow: "rgba(251,146,60,0.7)", answer: "2 dogs" },
    { type: "many", emoji: "🍕", item: "pizzas", count: 4, color: "#F472B6", glow: "rgba(244,114,182,0.7)", answer: "4 pizzas" },
    { type: "many", emoji: "🎈", item: "balloons", count: 7, color: "#A78BFA", glow: "rgba(167,139,250,0.7)", answer: "7 balloons" },
    { type: "many", emoji: "🐠", item: "fish", count: 5, color: "#06B6D4", glow: "rgba(6,182,212,0.7)", answer: "5 fish" },
    // Uncountable
    { type: "much", emoji: "💧", item: "water", count: 0, color: "#60A5FA", glow: "rgba(96,165,250,0.7)", answer: "a lot" },
    { type: "much", emoji: "🍚", item: "rice", count: 0, color: "#FDE68A", glow: "rgba(253,230,138,0.7)", answer: "a lot" },
    { type: "much", emoji: "🥛", item: "milk", count: 0, color: "#E2E8F0", glow: "rgba(226,232,240,0.7)", answer: "a lot" },
    { type: "much", emoji: "🍯", item: "honey", count: 0, color: "#FBBF24", glow: "rgba(251,191,36,0.7)", answer: "a lot" },
    { type: "much", emoji: "☕", item: "coffee", count: 0, color: "#92400E", glow: "rgba(146,64,14,0.7)", answer: "a lot" },
    { type: "much", emoji: "🧂", item: "salt", count: 0, color: "#CBD5E1", glow: "rgba(203,213,225,0.7)", answer: "a lot" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }

function genRounds() {
    const many = shuffle(QUESTIONS.filter(q => q.type === "many")).slice(0, 4);
    const much = shuffle(QUESTIONS.filter(q => q.type === "much")).slice(0, 4);
    return shuffle([...many, ...much]);
}

// Generate 2 options for each question
function genOptions(q) {
    const correct = { label: q.type === "many" ? "How many?" : "How much?", correct: true };
    const wrong1 = { label: q.type === "many" ? "How much?" : "How many?", correct: false };
    return shuffle([correct, wrong1]);
}

// ── Emoji display ──
function EmojiDisplay({ q, celebrating }) {
    if (q.type === "much") {
        // Uncountable — show big emoji with "lots" effect
        return (
            <div className="hm1-emoji-uncountable">
                <span className="hm1-emoji-big" style={{ animationDelay: "0s" }}>{q.emoji}</span>
                <span className="hm1-emoji-big hm1-emoji-med" style={{ animationDelay: ".1s" }}>{q.emoji}</span>
                <span className="hm1-emoji-big hm1-emoji-sm" style={{ animationDelay: ".2s" }}>{q.emoji}</span>
            </div>
        );
    }
    // Countable — show grid
    const cols = q.count <= 4 ? 2 : q.count <= 6 ? 3 : 4;
    return (
        <div className="hm1-emoji-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
            {Array.from({ length: q.count }).map((_, i) => (
                <span key={i} className={`hm1-emoji-item ${celebrating ? "hm1-emoji-celebrate" : ""}`}
                    style={{ animationDelay: `${i * .05}s` }}>
                    {q.emoji}
                </span>
            ))}
        </div>
    );
}

// ── Stitch mascot ──
function Stitch({ state }) {
    return (
        <div className={`hm1-stitch hm1-stitch--${state}`}>
            <img src={stitchImg} alt="Stitch" className="hm1-stitch-img" />
            {state === "playing" && (
                <div className="hm1-stitch-wave">
                    {[0, .1, .2, .3, .4].map((d, i) => (
                        <span key={i} style={{ animationDelay: `${d}s` }} />
                    ))}
                </div>
            )}
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
        <svg className="hm1-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="hm1Bg" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#001428" />
                    <stop offset="60%" stopColor="#000a1a" />
                    <stop offset="100%" stopColor="#000005" />
                </radialGradient>
                <radialGradient id="hm1Glow" cx="50%" cy="45%" r="40%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#hm1Bg)" />
            <rect width="1440" height="900" fill="url(#hm1Glow)" />
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
    return <div className={`hm1-fp ${value > 0 ? "hm1-fpp" : "hm1-fpn"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

function ComboBanner({ streak }) {
    if (streak < 3) return null;
    const msg = streak >= 5 ? "🔥 UNSTOPPABLE!" : streak >= 4 ? "⚡ SUPER COMBO!" : "🎯 COMBO x3!";
    return <div className="hm1-combo" key={streak}>{msg}</div>;
}

const NUM_ROUNDS = 8, MAX_LIVES = 2, PTS_CORRECT = 10;

export default function HowManyLevel1({ onFinish }) {
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
    const [stitchState, setStitchState] = useState("idle");
    const [celebrating, setCelebrating] = useState(false);
    const [showCombo, setShowCombo] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

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
            // ✅ Cleanup de audio al desmontar
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
        // ✅ Detener audio anterior al iniciar ronda
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setSelected(null); setBlocked(false); setCelebrating(false);
        setStitchState("idle"); setRoundLives(MAX_LIVES); roundLivesRef.current = MAX_LIVES;
        setOptions(genOptions(all[i]));
        // Auto play audio
        setTimeout(() => { if (mountedRef.current) playQuestion(all[i]); }, 50);
    };

    const playQuestion = (q) => {
        if (!q) return;
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
        const a = q.type === "many" ? howManyAud : howMuchAud;
        audioRef.current = a; a.currentTime = 0;
        setIsPlaying(true); setStitchState("playing");
        a.onended = () => { if (mountedRef.current) { setIsPlaying(false); setStitchState("idle"); } };
        a.play().catch(() => { setIsPlaying(false); setStitchState("idle"); });
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

        // Cancel question audio
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }

        if (opt.correct) {
            setBlocked(true);
            setAttempts(a => a + 1);
            correctSnd.currentTime = 0; correctSnd.play().catch(() => { });
            setStitchState("correct"); setCelebrating(true);
            const ns = streakRef.current + 1; streakRef.current = ns; setStreak(ns);
            setBestStreak(b => Math.max(b, ns));
            const bonus = PTS_CORRECT + (ns >= 5 ? 15 : ns >= 4 ? 10 : ns >= 3 ? 7 : ns >= 2 ? 4 : 0);
            setPoints(p => p + bonus); setCorrectCount(c => c + 1); addFP(bonus);
            if (ns >= 3) setShowCombo(true);
            confetti({
                particleCount: 100, spread: 110, origin: { y: 0.45 },
                colors: [round.color, "#FFD700", "#fff", "#FF6B9D", "#A78BFA"]
            });
            setTimeout(() => { setShowCombo(false); advanceTo(i + 1); }, 1800);
        } else {
            incorrectSnd.currentTime = 0; incorrectSnd.play().catch(() => { });
            setStitchState("wrong"); streakRef.current = 0; setStreak(0);
            // ✅ Sin penalización -3
            const nl = roundLivesRef.current - 1; roundLivesRef.current = nl; setRoundLives(nl);
            if (nl <= 0) {
                // ✅ FIX: Reveal verde + audio del correcto
                setBlocked(true);
                setAttempts(a => a + 1);
                setSelected(null); // ← desselecciona para que se vea el reveal verde
                setStitchState("idle");
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playQuestion(round); // ← niño escucha la pregunta correcta
                }, 400);
                setTimeout(() => advanceTo(i + 1), 2400); // ← más tiempo
            } else {
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    setSelected(null); setStitchState("idle");
                    playQuestion(round);
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

    // ── RESULT ──
    if (finished) return (
        <div className="hm1-result-root">
            <HMBg color="#A78BFA" />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="hm1-result-card">
                <img src={stitchImg} alt="stitch" className="hm1-result-stitch" />
                <div className="hm1-result-badge">How many/much · Level 1 🎧</div>
                <h2 className="hm1-result-title">¡Nivel terminado!</h2>
                <div className="hm1-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`hm1-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="hm1-result-stats">
                    <div className="hm1-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{NUM_ROUNDS}</strong></div>
                    <div className="hm1-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="hm1-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="hm1-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && <button className="hm1-result-btn" onClick={() => onFinish(correctCount)}>Continue 👁️</button>}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;

    return (
        <div className="hm1-root">
            <HMBg color={round.color} />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            {showCombo && <ComboBanner streak={streak} />}

            {/* HEADER */}
            <div className="hm1-header">
                <div className="hm1-header-left">
                    <span className="hm1-badge" style={{ background: `linear-gradient(135deg,#A78BFA,#6366F1)` }}>Level 1</span>
                    <span className="hm1-header-title">🎧 Listening</span>
                </div>
                <div className="hm1-header-right">
                    <div className="hm1-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="hm1-pill hm1-pill-streak">🔥 {streak}x</div>}
                    <div className="hm1-pill">🎯 {attempts}</div>
                    <div className="hm1-pill">⏱ {fmt}</div>
                </div>
            </div>

            {/* PROGRESS */}
            <div className="hm1-progress-wrap">
                <div className="hm1-progress-track">
                    <div className="hm1-progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg,#6D28D9,#A78BFA)`, boxShadow: `0 0 16px rgba(167,139,250,0.7)` }} />
                    <div className="hm1-progress-dots">
                        {rounds.map((_, i) => (
                            <div key={i} className={`hm1-pdot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`}
                                style={i === currentIdx ? { background: round.color, boxShadow: `0 0 10px ${round.color}` } : {}} />
                        ))}
                    </div>
                </div>
            </div>

            {/* GAME */}
            <div className="hm1-game">

                {/* LEFT — Stitch + question */}
                <div className="hm1-left-col">
                    <Stitch state={stitchState} />
                    <button
                        className={`hm1-play-btn ${isPlaying ? "hm1-play-btn--playing" : ""}`}
                        style={{ borderColor: round.color, boxShadow: `0 0 18px ${round.glow}` }}
                        onClick={() => playQuestion(round)}
                        disabled={isPlaying || blocked}
                    >
                        {isPlaying ? "🔊 Playing…" : "🔊 Listen again!"}
                    </button>
                    <div className="hm1-lives-row">
                        {Array.from({ length: MAX_LIVES }).map((_, i) => (
                            <span key={i} className={`hm1-life ${i < roundLives ? "alive" : "lost"}`}>
                                {i < roundLives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>
                    <div className="hm1-round-pill" style={{ color: round.color, borderColor: round.color }}>
                        Round {currentIdx + 1}/{NUM_ROUNDS}
                    </div>
                </div>

                {/* CENTER — Emoji display */}
                <div className="hm1-center-col">
                    <div className="hm1-question-label" style={{ color: round.color, textShadow: `0 0 20px ${round.glow}` }}>
                        ________ <span style={{ color: "#fff" }}>{round.item}</span>?
                    </div>
                    <div className={`hm1-emoji-card ${celebrating ? "hm1-emoji-card--celebrate" : ""}`}
                        style={{ borderColor: round.color, boxShadow: `0 0 32px ${round.glow}` }}>
                        <EmojiDisplay q={round} celebrating={celebrating} />
                    </div>
                </div>

                {/* RIGHT — Options */}
                <div className="hm1-right-col">
                    <div className="hm1-options-label">Which question is correct? 👇</div>
                    <div className="hm1-options-grid">
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
                                    className={`hm1-option hm1-opt-${state || "idle"}`}
                                    onClick={() => handleOption(i)}
                                    disabled={blocked}
                                    style={{ "--oc": round.color, "--og": round.glow }}
                                >
                                    <span className="hm1-opt-label">{opt.label}</span>
                                    {state === "correct" && <div className="hm1-verdict hm1-vok">✓</div>}
                                    {state === "wrong" && <div className="hm1-verdict hm1-vfail">✗</div>}
                                    {state === "reveal" && <div className="hm1-verdict hm1-vreveal">✓</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}