import React, { useState, useEffect, useRef } from "react";
import "./Howlevel3.css";
import confetti from "canvas-confetti";
import marioImg from "../../../../assets/mario.png";

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
    // Countable → many
    { type: "many", emoji: "🍎", item: "apples", count: 3, color: "#EF4444", glow: "rgba(239,68,68,0.7)" },
    { type: "many", emoji: "🐱", item: "cats", count: 4, color: "#F59E0B", glow: "rgba(245,158,11,0.7)" },
    { type: "many", emoji: "📚", item: "books", count: 5, color: "#3B82F6", glow: "rgba(59,130,246,0.7)" },
    { type: "many", emoji: "🌟", item: "stars", count: 6, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { type: "many", emoji: "🐶", item: "dogs", count: 2, color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { type: "many", emoji: "🍕", item: "pizzas", count: 4, color: "#F472B6", glow: "rgba(244,114,182,0.7)" },
    { type: "many", emoji: "🎈", item: "balloons", count: 7, color: "#A78BFA", glow: "rgba(167,139,250,0.7)" },
    { type: "many", emoji: "🐠", item: "fish", count: 5, color: "#06B6D4", glow: "rgba(6,182,212,0.7)" },
    // Uncountable → much
    { type: "much", emoji: "💧", item: "water", count: 0, color: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
    { type: "much", emoji: "🍚", item: "rice", count: 0, color: "#FDE68A", glow: "rgba(253,230,138,0.7)" },
    { type: "much", emoji: "🥛", item: "milk", count: 0, color: "#E2E8F0", glow: "rgba(226,232,240,0.7)" },
    { type: "much", emoji: "🍯", item: "honey", count: 0, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { type: "much", emoji: "☕", item: "coffee", count: 0, color: "#92400E", glow: "rgba(146,64,14,0.7)" },
    { type: "much", emoji: "🧂", item: "salt", count: 0, color: "#CBD5E1", glow: "rgba(203,213,225,0.7)" },
];

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - .5);

function genRounds() {
    const many = shuffle(QUESTIONS.filter(q => q.type === "many")).slice(0, 4);
    const much = shuffle(QUESTIONS.filter(q => q.type === "much")).slice(0, 4);
    return shuffle([...many, ...much]);
}

// ═══ Build slots with 2 hints ═══
function makeSlotsForRound(round) {
    if (!round) return [];
    const word = (round.type === "many" ? "MANY" : "MUCH").split("");
    const hintCount = 2;
    const positions = shuffle([...Array(word.length).keys()]);
    const hintSet = new Set(positions.slice(0, hintCount));
    return word.map((letter, i) => ({
        letter,
        revealed: hintSet.has(i),
        isHint: hintSet.has(i),
    }));
}

// ── Emoji display ──
function EmojiDisplay({ q, celebrating }) {
    if (q.type === "much") {
        return (
            <div className="hm3-emoji-uncountable">
                <span className="hm3-emoji-big">{q.emoji}</span>
                <span className="hm3-emoji-big hm3-emoji-med">{q.emoji}</span>
                <span className="hm3-emoji-big hm3-emoji-sm">{q.emoji}</span>
            </div>
        );
    }
    const cols = q.count <= 4 ? 2 : q.count <= 6 ? 3 : 4;
    return (
        <div className="hm3-emoji-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
            {Array.from({ length: q.count }).map((_, i) => (
                <span key={i} className={`hm3-emoji-item ${celebrating ? "hm3-emoji-celebrate" : ""}`}
                    style={{ animationDelay: `${i * .05}s` }}>
                    {q.emoji}
                </span>
            ))}
        </div>
    );
}

// ── Mario mascot with audio wave ──
function Mario({ state }) {
    return (
        <div className={`hm3-mario hm3-mario--${state}`}>
            <img src={marioImg} alt="Mario" className="hm3-mario-img" />
            {state === "playing" && (
                <div className="hm3-mario-wave">
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
        <svg className="hm3-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="hm3Bg" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#001428" />
                    <stop offset="60%" stopColor="#000a1a" />
                    <stop offset="100%" stopColor="#000005" />
                </radialGradient>
                <radialGradient id="hm3Glow" cx="50%" cy="45%" r="40%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#hm3Bg)" />
            <rect width="1440" height="900" fill="url(#hm3Glow)" />
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
    return <div className={`hm3-fp ${value > 0 ? "hm3-fpp" : "hm3-fpn"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

function ComboBanner({ streak }) {
    if (streak < 3) return null;
    const msg = streak >= 5 ? "🔥 UNSTOPPABLE!" : streak >= 4 ? "⚡ SUPER COMBO!" : "🎯 COMBO x3!";
    return <div className="hm3-combo" key={streak}>{msg}</div>;
}

const NUM_ROUNDS = 8, MAX_LIVES = 3, PTS_LETTER = 2, PTS_WORD = 10;

export default function HowLevel3({ onFinish }) {
    const [rounds, setRounds] = useState([]);
    const [slots, setSlots] = useState([]);
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
    const [wordState, setWordState] = useState("idle");
    const [wrongKey, setWrongKey] = useState(null);
    const [correctKey, setCorrectKey] = useState(null);
    const [marioState, setMarioState] = useState("idle");
    const [celebrating, setCelebrating] = useState(false);
    const [showCombo, setShowCombo] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const mountedRef = useRef(true);
    const floaterId = useRef(0);
    const roundsRef = useRef([]);
    const idxRef = useRef(0);
    const streakRef = useRef(0);
    const roundLivesRef = useRef(MAX_LIVES);
    const slotsRef = useRef([]);
    const audioRef = useRef(null);

    useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { streakRef.current = streak; }, [streak]);
    useEffect(() => { roundLivesRef.current = roundLives; }, [roundLives]);
    useEffect(() => { slotsRef.current = slots; }, [slots]);

    useEffect(() => {
        mountedRef.current = true;
        const r = genRounds();
        roundsRef.current = r;
        setRounds(r);
        const initial = makeSlotsForRound(r[0]);
        slotsRef.current = initial;
        setSlots(initial);
        setTimeout(() => { if (mountedRef.current) playQuestion(r[0]); }, 50);
        return () => {
            mountedRef.current = false;
            confetti.reset();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
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

    const playQuestion = (q) => {
        if (!q) return;
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
        const a = q.type === "many" ? howManyAud : howMuchAud;
        audioRef.current = a;
        a.currentTime = 0;
        setIsPlaying(true);
        setMarioState("playing");
        a.onended = () => {
            if (!mountedRef.current) return;
            setIsPlaying(false);
            setMarioState("idle");
        };
        a.play().catch(() => {
            setIsPlaying(false);
            setMarioState("idle");
        });
    };

    const loadRound = () => {
        if (!mountedRef.current) return;
        const round = roundsRef.current[idxRef.current];
        const newSlots = makeSlotsForRound(round);
        slotsRef.current = newSlots;
        setSlots(newSlots);
        setBlocked(false);
        setWordState("idle");
        setCelebrating(false);
        setMarioState("idle");
        setWrongKey(null);
        setCorrectKey(null);
        setRoundLives(MAX_LIVES);
        roundLivesRef.current = MAX_LIVES;
        setTimeout(() => { if (mountedRef.current) playQuestion(round); }, 50);
    };

    const addFP = (v) => {
        const id = floaterId.current++;
        setFloaters(f => [...f, { v, id }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1300);
    };

    const advanceTo = (next) => {
        if (!mountedRef.current) return;
        if (next >= roundsRef.current.length) { setFinished(true); return; }
        setCurrentIdx(next); idxRef.current = next;
        loadRound();
    };

    const handleKey = (letter) => {
        if (blocked || wordState !== "idle") return;
        const current = slotsRef.current;
        const nextIdx = current.findIndex(s => !s.revealed);
        if (nextIdx === -1) return;
        const expected = current[nextIdx].letter;

        if (letter === expected) {
            const newSlots = current.map((s, i) =>
                i === nextIdx ? { ...s, revealed: true } : s
            );
            slotsRef.current = newSlots;
            setSlots(newSlots);
            setCorrectKey(letter);
            setTimeout(() => { if (mountedRef.current) setCorrectKey(null); }, 350);
            setPoints(p => p + PTS_LETTER);
            addFP(PTS_LETTER);

            const isWordComplete = newSlots.every(s => s.revealed);

            // ✅ FIX: Sonido "correcto" en CADA letra acertada (refuerzo positivo)
            if (!isWordComplete) {
                correctSnd.cloneNode().play().catch(() => { });
            }

            if (isWordComplete) {

                // Cancel question audio
                if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                }

                setBlocked(true);
                setWordState("win");
                setMarioState("correct");
                setCelebrating(true);
                correctSnd.currentTime = 0; correctSnd.play().catch(() => { });

                const ns = streakRef.current + 1;
                streakRef.current = ns; setStreak(ns);
                setBestStreak(b => Math.max(b, ns));
                const bonus = PTS_WORD + (ns >= 5 ? 15 : ns >= 4 ? 10 : ns >= 3 ? 7 : ns >= 2 ? 4 : 0);
                setPoints(p => p + bonus);
                setCorrectCount(c => c + 1);
                addFP(bonus);
                setAttempts(a => a + 1);
                if (ns >= 3) setShowCombo(true);

                const round = roundsRef.current[idxRef.current];
                confetti({
                    particleCount: 110, spread: 120, origin: { y: 0.45 },
                    colors: [round.color, "#FFD700", "#fff", "#FF6B9D", "#A78BFA", "#34D399"]
                });
                // Audio refuerzo después de "correcto"
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playQuestion(round);
                }, 500);
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    setShowCombo(false);
                    advanceTo(idxRef.current + 1);
                }, 2400);
            }
        } else if (current.some(s => s.isHint && s.letter === letter)) {
            return;
        } else {
            setWrongKey(letter);
            setTimeout(() => { if (mountedRef.current) setWrongKey(null); }, 500);
            incorrectSnd.currentTime = 0; incorrectSnd.play().catch(() => { });
            setMarioState("wrong");
            setTimeout(() => { if (mountedRef.current) setMarioState("idle"); }, 700);

            streakRef.current = 0; setStreak(0);

            const nl = roundLivesRef.current - 1;
            roundLivesRef.current = nl;
            setRoundLives(nl);

            if (nl <= 0) {
                setBlocked(true);
                setWordState("fail");
                setAttempts(a => a + 1);
                const round = roundsRef.current[idxRef.current];
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playQuestion(round);
                }, 400);
                setTimeout(() => advanceTo(idxRef.current + 1), 2400);
            }
        }
    };

    const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
    const stars = correctCount >= 7 ? 3 : correctCount >= 5 ? 2 : 1;

    if (finished) return (
        <div className="hm3-result-root">
            <HMBg color="#A78BFA" />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="hm3-result-card">
                <img src={marioImg} alt="mario" className="hm3-result-mario" />
                <div className="hm3-result-badge">How many/much · Level 3 ✏️</div>
                <h2 className="hm3-result-title">¡Nivel terminado!</h2>
                <div className="hm3-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`hm3-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="hm3-result-stats">
                    <div className="hm3-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{NUM_ROUNDS}</strong></div>
                    <div className="hm3-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="hm3-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="hm3-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && <button className="hm3-result-btn" onClick={() => onFinish(correctCount)}>Finalizar ✅</button>}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;

    const nextSlotIdx = slots.findIndex(s => !s.revealed);
    const correctWord = round.type === "many" ? "many" : "much";

    return (
        <div className="hm3-root">
            <HMBg color={round.color} />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            {showCombo && <ComboBanner streak={streak} />}

            {/* HEADER */}
            <div className="hm3-header">
                <div className="hm3-header-left">
                    <span className="hm3-badge" style={{ background: "linear-gradient(135deg,#A78BFA,#6366F1)" }}>Level 3</span>
                    <span className="hm3-header-title">✏️ Writing</span>
                </div>
                <div className="hm3-header-right">
                    <div className="hm3-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="hm3-pill hm3-pill-streak">🔥 {streak}x</div>}
                    <div className="hm3-pill">🎯 {attempts}</div>
                    <div className="hm3-pill">⏱ {fmt}</div>
                </div>
            </div>

            {/* PROGRESS */}
            <div className="hm3-progress-wrap">
                <div className="hm3-progress-track">
                    <div className="hm3-progress-fill" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6D28D9,#A78BFA)", boxShadow: "0 0 16px rgba(167,139,250,0.7)" }} />
                    <div className="hm3-progress-dots">
                        {rounds.map((_, i) => (
                            <div key={i} className={`hm3-pdot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`}
                                style={i === currentIdx ? { background: round.color, boxShadow: `0 0 10px ${round.color}` } : {}} />
                        ))}
                    </div>
                </div>
            </div>

            {/* GAME */}
            <div className="hm3-game">

                {/* LEFT — Mario + Listen button */}
                <div className="hm3-left-col">
                    <Mario state={marioState} />
                    <button
                        className={`hm3-listen-btn ${isPlaying ? "hm3-listen-btn--playing" : ""}`}
                        style={{ borderColor: round.color, boxShadow: `0 0 18px ${round.glow}` }}
                        onClick={() => playQuestion(round)}
                        disabled={isPlaying || blocked}
                    >
                        {isPlaying ? "🔊 Playing…" : "🔊 Listen again!"}
                    </button>
                    <div className="hm3-lives-row">
                        {Array.from({ length: MAX_LIVES }).map((_, i) => (
                            <span key={i} className={`hm3-life ${i < roundLives ? "alive" : "lost"}`}>
                                {i < roundLives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>
                    <div className="hm3-round-pill" style={{ color: round.color, borderColor: round.color, boxShadow: `0 0 14px ${round.glow}` }}>
                        Round {currentIdx + 1}/{NUM_ROUNDS}
                    </div>
                </div>

                {/* CENTER — Emoji display */}
                <div className="hm3-center-col">
                    <div className={`hm3-emoji-card ${celebrating ? "hm3-emoji-card--celebrate" : ""}`}
                        style={{ borderColor: round.color, boxShadow: `0 0 32px ${round.glow}` }}>
                        <EmojiDisplay q={round} celebrating={celebrating} />
                    </div>
                </div>

                {/* RIGHT — Sentence + slots + keyboard */}
                <div className="hm3-right-col">
                    <div className="hm3-sentence-panel"
                        style={{ "--sc": round.color, "--sg": round.glow }}>
                        <div className="hm3-panel-label">Complete the sentence ✏️</div>
                        <div className="hm3-sentence">
                            <span className="hm3-sentence-word">How</span>
                            <div className="hm3-slots">
                                {slots.map((slot, i) => {
                                    const isNext = i === nextSlotIdx && wordState === "idle";
                                    const showReveal = wordState === "fail" && !slot.revealed;
                                    let cls = "hm3-slot";
                                    if (slot.isHint) cls += " hint";
                                    else if (slot.revealed) cls += " filled";
                                    else if (showReveal) cls += " reveal";
                                    else if (isNext) cls += " next";
                                    const showLetter = slot.revealed || showReveal;
                                    const showLine = !slot.isHint && !slot.revealed && !showReveal;
                                    return (
                                        <div key={i} className={cls}
                                            style={{ "--sc": round.color, "--sg": round.glow }}>
                                            {showLetter ? slot.letter : ""}
                                            {showLine && <span className="hm3-slot-line" />}
                                        </div>
                                    );
                                })}
                            </div>
                            <span className="hm3-sentence-word">{round.item}?</span>
                        </div>
                        {wordState === "win" && <div className="hm3-word-result hm3-word-result-ok">✓ ¡Excelente!</div>}
                        {wordState === "fail" && <div className="hm3-word-result hm3-word-result-fail">✗ Era "{correctWord}"</div>}
                    </div>

                    {/* Keyboard */}
                    <div className="hm3-keyboard">
                        {KEYBOARD_ROWS.map((row, ri) => (
                            <div key={ri} className="hm3-kb-row">
                                {row.map((letter) => {
                                    const isWrong = wrongKey === letter;
                                    const isCorrect = correctKey === letter;
                                    return (
                                        <button
                                            key={letter}
                                            className={`hm3-key ${isWrong ? "hm3-key-wrong" : ""} ${isCorrect ? "hm3-key-correct" : ""}`}
                                            onClick={() => handleKey(letter)}
                                            disabled={blocked}
                                        >
                                            {letter}
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