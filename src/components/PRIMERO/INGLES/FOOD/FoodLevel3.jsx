import React, { useState, useEffect, useRef } from "react";
import "./FoodLevel3.css";
import confetti from "canvas-confetti";


import appleAudio from "../../../../assets/sounds/apple.m4a";
import bananaAudio from "../../../../assets/sounds/banana.m4a";
import milkAudio from "../../../../assets/sounds/milk.m4a";
import waterAudio from "../../../../assets/sounds/water.m4a";
import riceAudio from "../../../../assets/sounds/rice.m4a";
import breadAudio from "../../../../assets/sounds/bread.m4a";
import juiceAudio from "../../../../assets/sounds/juice.m4a";
import cheeseAudio from "../../../../assets/sounds/cheese.m4a";
import eggAudio from "../../../../assets/sounds/egg.m4a";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── FOOD DATA ──
const FOODS = [
    { word: "apple", emoji: "🍎", audio: appleAudio, color: "#EF4444", glow: "rgba(239,68,68,0.7)" },
    { word: "banana", emoji: "🍌", audio: bananaAudio, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { word: "milk", emoji: "🥛", audio: milkAudio, color: "#E2E8F0", glow: "rgba(226,232,240,0.7)" },
    { word: "water", emoji: "💧", audio: waterAudio, color: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
    { word: "rice", emoji: "🍚", audio: riceAudio, color: "#FDE68A", glow: "rgba(253,230,138,0.7)" },
    { word: "bread", emoji: "🍞", audio: breadAudio, color: "#D97706", glow: "rgba(217,119,6,0.7)" },
    { word: "juice", emoji: "🧃", audio: juiceAudio, color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { word: "cheese", emoji: "🧀", audio: cheeseAudio, color: "#FACC15", glow: "rgba(250,204,21,0.7)" },
    { word: "egg", emoji: "🥚", audio: eggAudio, color: "#FEF3C7", glow: "rgba(254,243,199,0.7)" },
];

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...FOODS]).slice(0, 8);
}

// Slots con pistas según longitud
function makeSlotsForRound(round) {
    if (!round) return [];
    const word = round.word.toUpperCase().split("");
    const hintCount = word.length <= 4 ? 2 : 3;
    const positions = shuffle([...Array(word.length).keys()]);
    const hintSet = new Set(positions.slice(0, hintCount));
    return word.map((letter, i) => ({
        letter,
        revealed: hintSet.has(i),
        isHint: hintSet.has(i),
    }));
}

function FloatingPoints({ points, id }) {
    return <div key={id} className={`fl3-floating-points ${points > 0 ? "fpp" : "fpn"}`}>
        {points > 0 ? `+${points}` : points}
    </div>;
}

// ── GAMIFIED ANIMATED BACKGROUND ──
function FoodBg({ color }) {
    return (
        <svg className="fl3-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="fl3BgGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a0a1f" />
                    <stop offset="60%" stopColor="#05050f" />
                    <stop offset="100%" stopColor="#000" />
                </radialGradient>
                <radialGradient id="fl3GlowGrad" cx="50%" cy="45%" r="45%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#fl3BgGrad)" />
            <rect width="1440" height="900" fill="url(#fl3GlowGrad)" />

            {Array.from({ length: 18 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 52} x2="1440" y2={i * 52}
                    stroke={color} strokeWidth="0.4" opacity="0.08" />
            ))}
            {Array.from({ length: 29 }, (_, i) => (
                <line key={`v${i}`} x1={i * 52} y1="0" x2={i * 52} y2="900"
                    stroke={color} strokeWidth="0.4" opacity="0.08" />
            ))}

            {Array.from({ length: 60 }, (_, i) => {
                const x = Math.random() * 1440;
                const y = Math.random() * 900;
                const r = 0.8 + Math.random() * 2.2;
                return (
                    <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.8">
                        <animate attributeName="opacity" values="0.1;1;0.1"
                            dur={`${1.5 + Math.random() * 3}s`} repeatCount="indefinite"
                            begin={`${Math.random() * 5}s`} />
                    </circle>
                );
            })}

            {[[150, 180, 95], [1300, 160, 75], [700, 70, 60], [280, 720, 85], [1160, 660, 68], [600, 820, 55]].map(([x, y, r], i) => (
                <circle key={`o${i}`} cx={x} cy={y} r={r} fill={color} opacity="0.09">
                    <animate attributeName="r" values={`${r};${r + 18};${r}`}
                        dur={`${3 + i}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.05;0.16;0.05"
                        dur={`${3 + i}s`} repeatCount="indefinite" />
                </circle>
            ))}

            <polygon points="0,0 140,0 0,140" fill={color} opacity="0.16" />
            <polygon points="1440,0 1300,0 1440,140" fill={color} opacity="0.16" />
            <polygon points="0,900 140,900 0,760" fill={color} opacity="0.16" />
            <polygon points="1440,900 1300,900 1440,760" fill={color} opacity="0.16" />
        </svg>
    );
}

const NUM_ROUNDS = 8, MAX_LIVES = 3, PTS_LETTER = 2, PTS_WORD = 10;

export default function FoodLevel3({ onFinish }) {
    const [rounds] = useState(() => genRounds());
    const [slots, setSlots] = useState(() => makeSlotsForRound(rounds[0]));
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
    const [isPlaying, setIsPlaying] = useState(false);

    const mountedRef = useRef(true);
    const floaterId = useRef(0);
    const idxRef = useRef(0);
    const streakRef = useRef(0);
    const roundLivesRef = useRef(MAX_LIVES);
    const slotsRef = useRef(slots);
    const audioRef = useRef(null);
    const foodAudiosRef = useRef({});
    const correctSndRef = useRef(null);
    const wrongSndRef = useRef(null);

    useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { streakRef.current = streak; }, [streak]);
    useEffect(() => { roundLivesRef.current = roundLives; }, [roundLives]);
    useEffect(() => { slotsRef.current = slots; }, [slots]);

    useEffect(() => {
        mountedRef.current = true;
        FOODS.forEach(f => {
            const a = new Audio(f.audio);
            a.preload = "auto";
            a.load();
            foodAudiosRef.current[f.word] = a;
        });
        correctSndRef.current = new Audio(correctoSound);
        wrongSndRef.current = new Audio(incorrectoSound);
        correctSndRef.current.preload = "auto";
        wrongSndRef.current.preload = "auto";
        setTimeout(() => { if (mountedRef.current) playWord(rounds[0]); }, 700);
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

    const playWord = (food) => {
        if (!food) return;
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
        const a = foodAudiosRef.current[food.word];
        if (!a) return;
        audioRef.current = a;
        a.currentTime = 0;
        setIsPlaying(true);
        a.onended = () => {
            if (!mountedRef.current) return;
            setIsPlaying(false);
        };
        a.play().catch(() => { setIsPlaying(false); });
    };

    const addFP = (v) => {
        const id = floaterId.current++;
        setFloaters(f => [...f, { v, id }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1300);
    };

    const loadRound = () => {
        if (!mountedRef.current) return;
        const round = rounds[idxRef.current];
        const newSlots = makeSlotsForRound(round);
        slotsRef.current = newSlots;
        setSlots(newSlots);
        setBlocked(false);
        setWordState("idle");
        setWrongKey(null);
        setCorrectKey(null);
        setRoundLives(MAX_LIVES);
        roundLivesRef.current = MAX_LIVES;
        setTimeout(() => { if (mountedRef.current) playWord(round); }, 500);
    };

    const advanceTo = (next) => {
        if (!mountedRef.current) return;
        if (next >= rounds.length) { setFinished(true); return; }
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
            // Solo NO suena en la última letra para que no choque con el sonido de palabra completa
            if (!isWordComplete && correctSndRef.current) {
                correctSndRef.current.cloneNode().play().catch(() => { });
            }

            if (isWordComplete) {
                setBlocked(true);
                setWordState("win");
                correctSndRef.current.currentTime = 0;
                correctSndRef.current.play().catch(() => { });

                const ns = streakRef.current + 1;
                streakRef.current = ns;
                setStreak(ns);
                setBestStreak(b => Math.max(b, ns));
                const bonus = PTS_WORD + (ns >= 5 ? 15 : ns >= 4 ? 10 : ns >= 3 ? 7 : ns >= 2 ? 4 : 0);
                setPoints(p => p + bonus);
                setCorrectCount(c => c + 1);
                addFP(bonus);
                setAttempts(a => a + 1);

                const round = rounds[idxRef.current];
                confetti({
                    particleCount: 100, spread: 120, origin: { y: 0.45 },
                    colors: [round.color, "#FFD700", "#fff", "#FF6B9D", "#A78BFA", "#34D399"]
                });
                // Audio refuerzo del alimento (después del "correcto")
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playWord(round);
                }, 500);
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    advanceTo(idxRef.current + 1);
                }, 2400);
            }
        } else if (current.some(s => s.isHint && s.letter === letter)) {
            // letra de pista → ignorar sin penalizar
            return;
        } else {
            setWrongKey(letter);
            setTimeout(() => { if (mountedRef.current) setWrongKey(null); }, 500);
            wrongSndRef.current.currentTime = 0;
            wrongSndRef.current.play().catch(() => { });

            streakRef.current = 0;
            setStreak(0);

            const nl = roundLivesRef.current - 1;
            roundLivesRef.current = nl;
            setRoundLives(nl);

            if (nl <= 0) {
                setBlocked(true);
                setWordState("fail");
                setAttempts(a => a + 1);
                const round = rounds[idxRef.current];
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playWord(round);
                }, 400);
                setTimeout(() => advanceTo(idxRef.current + 1), 2400);
            }
        }
    };

    const progress = ((currentIdx + (wordState === "win" ? 1 : 0)) / rounds.length) * 100;
    const stars = correctCount >= 7 ? 3 : correctCount >= 5 ? 2 : 1;

    if (finished) return (
        <div className="fl3-game-root fl3-result-container">
            <FoodBg color="#A78BFA" />
            {floaters.map(({ v, id }) => <FloatingPoints key={id} points={v} id={id} />)}
            <div className="fl3-result-card">
                <div className="fl3-result-badge">Food &amp; Drink · Level 3 ✏️</div>
                <h2 className="fl3-result-title">¡Nivel terminado!</h2>
                <div className="fl3-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`fl3-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="fl3-result-stats">
                    <div className="fl3-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{NUM_ROUNDS}</strong></div>
                    <div className="fl3-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="fl3-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="fl3-rstat"><span>⏱</span><span>Time</span><strong>{seconds}s</strong></div>
                </div>
                {onFinish && <button className="fl3-result-btn" onClick={() => onFinish(correctCount)}>Finalizar ✅</button>}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;
    const nextSlotIdx = slots.findIndex(s => !s.revealed);

    return (
        <div className="fl3-game-root">
            <FoodBg color={round.color} />
            {floaters.map(({ v, id }) => <FloatingPoints key={id} points={v} id={id} />)}

            {/* HEADER */}
            <div className="fl3-header-bar">
                <div className="fl3-header-left">
                    <span className="fl3-header-badge">Level 3</span>
                    <span className="fl3-header-title">✏️ Writing</span>
                </div>
                <div className="fl3-header-right">
                    <div className="fl3-header-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="fl3-header-pill fl3-streak-pill">🔥 {streak}x</div>}
                    <div className="fl3-header-pill">🎯 {attempts}</div>
                    <div className="fl3-header-pill">⏱ {seconds}s</div>
                </div>
            </div>

            <div className="fl3-container">

                <div className="fl3-progress-track">
                    <div className="fl3-progress-fill" style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg,${round.color},#fff)`,
                        boxShadow: `0 0 12px ${round.glow}`
                    }} />
                    <div className="fl3-progress-steps">
                        {rounds.map((_, i) => (
                            <div key={i} className={`fl3-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`}
                                style={i === currentIdx ? { background: round.color, boxShadow: `0 0 8px ${round.color}` } : {}} />
                        ))}
                    </div>
                </div>

                <div className="fl3-top-row">
                    {/* Emoji card */}
                    <div className="fl3-emoji-card"
                        style={{
                            borderColor: round.color,
                            boxShadow: `0 0 0 5px rgba(255,255,255,0.08), 0 14px 40px rgba(0,0,0,0.5), 0 0 40px ${round.glow}`
                        }}>
                        <span className="fl3-big-emoji">{round.emoji}</span>
                    </div>

                    {/* Lives + listen */}
                    <div className="fl3-side-col">
                        <button
                            className={`fl3-listen-btn ${isPlaying ? "fl3-listen-btn--playing" : ""}`}
                            style={{ borderColor: round.color, boxShadow: `0 0 18px ${round.glow}` }}
                            onClick={() => playWord(round)}
                            disabled={isPlaying || blocked}
                        >
                            {isPlaying ? "🔊 Playing…" : "🔊 Listen again!"}
                        </button>
                        <div className="fl3-lives-cap">
                            {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                <span key={i} className={`fl3-life ${i < roundLives ? "alive" : "lost"}`}>
                                    {i < roundLives ? "❤️" : "🖤"}
                                </span>
                            ))}
                        </div>
                        <div className="fl3-round-pill" style={{ color: round.color, borderColor: round.color, boxShadow: `0 0 14px ${round.glow}` }}>
                            Round {currentIdx + 1}/{NUM_ROUNDS}
                        </div>
                    </div>
                </div>

                {/* Slots */}
                <div className="fl3-panel-label">Complete the word ✏️</div>
                <div className="fl3-slots" style={{ "--sc": round.color, "--sg": round.glow }}>
                    {slots.map((slot, i) => {
                        const isNext = i === nextSlotIdx && wordState === "idle";
                        const showReveal = wordState === "fail" && !slot.revealed;
                        let cls = "fl3-slot";
                        if (slot.isHint) cls += " hint";
                        else if (slot.revealed) cls += " filled";
                        else if (showReveal) cls += " reveal";
                        else if (isNext) cls += " next";
                        const showLetter = slot.revealed || showReveal;
                        const showLine = !slot.isHint && !slot.revealed && !showReveal;
                        return (
                            <div key={i} className={cls}>
                                {showLetter ? slot.letter : ""}
                                {showLine && <span className="fl3-slot-line" />}
                            </div>
                        );
                    })}
                </div>

                {wordState === "win" && <div className="fl3-word-result fl3-word-result-ok">✓ ¡Excelent!</div>}
                {wordState === "fail" && <div className="fl3-word-result fl3-word-result-fail">✗ Era "{round.word}"</div>}

                {/* Keyboard */}
                <div className="fl3-keyboard">
                    {KEYBOARD_ROWS.map((row, ri) => (
                        <div key={ri} className="fl3-kb-row">
                            {row.map((letter) => {
                                const isWrong = wrongKey === letter;
                                const isCorrect = correctKey === letter;
                                return (
                                    <button
                                        key={letter}
                                        className={`fl3-key ${isWrong ? "fl3-key-wrong" : ""} ${isCorrect ? "fl3-key-correct" : ""}`}
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
    );
}