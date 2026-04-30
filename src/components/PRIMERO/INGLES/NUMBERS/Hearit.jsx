import React, { useState, useEffect, useRef } from "react";
import "./Hearit.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

import zeroAudio from "../../../../assets/sounds/zero.mp3";
import oneAudio from "../../../../assets/sounds/one.mp3";
import twoAudio from "../../../../assets/sounds/two.mp3";
import threeAudio from "../../../../assets/sounds/three.mp3";
import fourAudio from "../../../../assets/sounds/four.mp3";
import fiveAudio from "../../../../assets/sounds/five.mp3";
import sixAudio from "../../../../assets/sounds/six.mp3";
import sevenAudio from "../../../../assets/sounds/seven.mp3";
import eightAudio from "../../../../assets/sounds/eight.mp3";
import nineAudio from "../../../../assets/sounds/nine.mp3";
import tenAudio from "../../../../assets/sounds/ten.mp3";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const NUMBERS = [
    { value: 0, word: "zero", audio: zeroAudio, color: "#6366F1", glow: "rgba(99,102,241,0.6)" },
    { value: 1, word: "one", audio: oneAudio, color: "#EF4444", glow: "rgba(239,68,68,0.6)" },
    { value: 2, word: "two", audio: twoAudio, color: "#3B82F6", glow: "rgba(59,130,246,0.6)" },
    { value: 3, word: "three", audio: threeAudio, color: "#22C55E", glow: "rgba(34,197,94,0.6)" },
    { value: 4, word: "four", audio: fourAudio, color: "#F59E0B", glow: "rgba(245,158,11,0.6)" },
    { value: 5, word: "five", audio: fiveAudio, color: "#EC4899", glow: "rgba(236,72,153,0.6)" },
    { value: 6, word: "six", audio: sixAudio, color: "#14B8A6", glow: "rgba(20,184,166,0.6)" },
    { value: 7, word: "seven", audio: sevenAudio, color: "#F97316", glow: "rgba(249,115,22,0.6)" },
    { value: 8, word: "eight", audio: eightAudio, color: "#A855F7", glow: "rgba(168,85,247,0.6)" },
    { value: 9, word: "nine", audio: nineAudio, color: "#06B6D4", glow: "rgba(6,182,212,0.6)" },
    { value: 10, word: "ten", audio: tenAudio, color: "#84CC16", glow: "rgba(132,204,22,0.6)" },
];

const correctSnd = new Audio(correctoSound);
const incorrectSnd = new Audio(incorrectoSound);
[correctSnd, incorrectSnd].forEach(a => { a.preload = "auto"; });
const numAudios = NUMBERS.map(n => { const a = new Audio(n.audio); a.preload = "auto"; return a; });

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function genRounds() {
    const pool = shuffle([...NUMBERS]);
    return pool.slice(0, 8);
}

function genOptions(correct) {
    const others = shuffle(NUMBERS.filter(n => n.value !== correct.value)).slice(0, 3);
    return shuffle([correct, ...others]);
}

// ── Dot grid ──
function DotGrid({ value, color, size = 80, animate = false }) {
    if (value === 0) {
        return (
            <div className="hi-dot-grid" style={{ width: size, height: size }}>
                <div className="hi-zero-ring" style={{ borderColor: color, boxShadow: `0 0 18px ${color}` }}>
                    <span style={{ color, fontFamily: "Fredoka One, cursive", fontSize: size * 0.38 }}>0</span>
                </div>
            </div>
        );
    }
    const gridSize = value <= 4 ? 2 : value <= 9 ? 3 : 4;
    const dots = Array.from({ length: value });
    return (
        <div
            className={`hi-dot-grid ${animate ? "hi-dot-pop" : ""}`}
            style={{
                width: size, height: size,
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                display: "grid", gap: 4,
                alignItems: "center", justifyItems: "center",
                padding: 6, boxSizing: "border-box",
            }}
        >
            {dots.map((_, i) => (
                <div key={i} className="hi-dot"
                    style={{ background: color, boxShadow: `0 0 8px ${color}`, animationDelay: `${i * 0.06}s` }}
                />
            ))}
        </div>
    );
}

// Background
const BG_STARS = Array.from({ length: 70 }, (_, i) => ({
    id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2.5, dur: `${1.5 + Math.random() * 3}s`, del: `${Math.random() * 5}s`,
}));
const PARTICLE_COLORS = ["#6366F1", "#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#EC4899", "#14B8A6", "#fff"];
const BG_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
    id: i, color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: 10 + Math.random() * 20, dur: `${5 + Math.random() * 7}s`, del: `${Math.random() * 6}s`,
}));
const BG_SPARKLES = Array.from({ length: 12 }, (_, i) => ({
    id: i, emoji: ["✨", "⭐", "🌟", "💫", "🔢", "🎯"][i % 6],
    top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`,
    size: 14 + Math.random() * 16, dur: `${3 + Math.random() * 5}s`, del: `${Math.random() * 6}s`,
}));

function FP({ value }) {
    return <div className={`hi-fp hi-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

function ComboBanner({ streak }) {
    if (streak < 3) return null;
    const msg = streak >= 5 ? "🔥 UNSTOPPABLE!" : streak >= 4 ? "⚡ SUPER COMBO!" : "🎯 COMBO x3!";
    return <div className="hi-combo-banner" key={streak}>{msg}</div>;
}

// ── Robot bubble messages ──
function getRobotMsg(state, lives, streak) {
    if (state === "correct") {
        if (streak >= 5) return "🔥 You're on fire!";
        if (streak >= 3) return "⚡ Amazing streak!";
        return "🎉 That's correct!";
    }
    if (state === "wrong") {
        if (lives === 1) return "😬 Last chance!";
        return "💪 Try again!";
    }
    if (state === "playing") return "🎧 Listen carefully!";
    return "👆 Tap to hear!";
}

function RobotMascot({ state, lives, streak }) {
    const eyeColor = state === "wrong" ? "#FF4D6D" : state === "correct" ? "#4ADE80" : "#60A5FA";
    const bodyColor = state === "wrong" ? "#7F1D1D" : state === "correct" ? "#14532D" : "#1E3A5F";
    const msg = getRobotMsg(state, lives, streak);
    return (
        <div className="hi-robot-wrap-inner">
            {/* Speech bubble */}
            <div className={`hi-robot-bubble hi-robot-bubble--${state}`} key={msg}>
                {msg}
            </div>
            <div className={`hi-robot hi-robot-${state}`}>
                <svg width="90" height="110" viewBox="0 0 90 110" fill="none">
                    <rect x="42" y="2" width="6" height="14" rx="3" fill="#94A3B8" />
                    <circle cx="45" cy="2" r="5" fill={eyeColor} style={{ filter: `drop-shadow(0 0 6px ${eyeColor})` }} />
                    <rect x="16" y="14" width="58" height="42" rx="14" fill={bodyColor} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                    <rect x="26" y="26" width="14" height="10" rx="5" fill={eyeColor} style={{ filter: `drop-shadow(0 0 8px ${eyeColor})` }} />
                    <rect x="50" y="26" width="14" height="10" rx="5" fill={eyeColor} style={{ filter: `drop-shadow(0 0 8px ${eyeColor})` }} />
                    {state === "correct"
                        ? <path d="M30 44 Q45 54 60 44" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" fill="none" />
                        : state === "wrong"
                            ? <path d="M30 50 Q45 42 60 50" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" fill="none" />
                            : <rect x="30" y="44" width="30" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
                    }
                    {state === "playing" && <>
                        <circle cx="34" cy="48" r="2" fill="#60A5FA" opacity="0.8" />
                        <circle cx="45" cy="46" r="3" fill="#60A5FA" opacity="0.9" />
                        <circle cx="56" cy="48" r="2" fill="#60A5FA" opacity="0.8" />
                    </>}
                    <rect x="20" y="58" width="50" height="36" rx="10" fill={bodyColor} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <rect x="30" y="66" width="30" height="20" rx="6" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="38" cy="76" r="4" fill={eyeColor} opacity="0.8" />
                    <circle cx="52" cy="76" r="4" fill={eyeColor} opacity="0.8" />
                    <rect x="4" y="60" width="14" height="28" rx="7" fill={bodyColor} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <rect x="72" y="60" width="14" height="28" rx="7" fill={bodyColor} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <rect x="26" y="94" width="14" height="14" rx="6" fill={bodyColor} />
                    <rect x="50" y="94" width="14" height="14" rx="6" fill={bodyColor} />
                </svg>
            </div>
        </div>
    );
}

// ── Life icon with crack animation ──
function LifeIcon({ alive, idx }) {
    return (
        <span
            className={`hi-life ${alive ? "alive" : "lost"}`}
            style={{ animationDelay: `${idx * 0.15}s` }}
        >
            {alive ? "❤️" : "🖤"}
        </span>
    );
}

// ── Round transition flash ──
function RoundFlash({ show }) {
    if (!show) return null;
    return <div className="hi-round-flash" />;
}

const NUM_ROUNDS = 8;
const MAX_LIVES = 2;
const PTS_CORRECT = 10;

export default function HearIt({ onFinish }) {
    const [rounds, setRounds] = useState([]);
    const [options, setOptions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [seconds, setSeconds] = useState(0);
    const [finished, setFinished] = useState(false);
    const [floaters, setFloaters] = useState([]);
    const [blocked, setBlocked] = useState(false);
    const [selected, setSelected] = useState(null);
    const [robotState, setRobotState] = useState("idle");
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCombo, setShowCombo] = useState(false);
    const [optAnimate, setOptAnimate] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    const mountedRef = useRef(true);
    const floaterId = useRef(0);
    const roundsRef = useRef([]);
    const idxRef = useRef(0);
    const streakRef = useRef(0);
    const livesRef = useRef(MAX_LIVES);
    const audioRef = useRef(null);

    useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { streakRef.current = streak; }, [streak]);
    useEffect(() => { livesRef.current = lives; }, [lives]);

    useEffect(() => {
        mountedRef.current = true;
        // Forzar la precarga dura para evitar latencia
        [correctSnd, incorrectSnd, ...numAudios].forEach(a => {
            a.load();
        });
        const r = genRounds();
        roundsRef.current = r;
        setRounds(r);
        loadRound(r, 0);
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
            confetti({ particleCount: 14, angle: 60, spread: 70, origin: { x: 0 } });
            confetti({ particleCount: 14, angle: 120, spread: 70, origin: { x: 1 } });
            if (Date.now() < end) requestAnimationFrame(f);
        }; f();
    }, [finished]);

    const loadRound = (all, i) => {
        if (!mountedRef.current || !all[i]) return;
        setSelected(null);
        setBlocked(false);
        setRobotState("idle");
        setOptAnimate(false);
        livesRef.current = MAX_LIVES;
        setLives(MAX_LIVES);
        const opts = genOptions(all[i]);
        setOptions(opts);

        setTimeout(() => {
            if (mountedRef.current) playNumber(all[i].value);
        }, 50);
    };

    const playNumber = (value) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const a = numAudios[value];
        audioRef.current = a;
        a.currentTime = 0;
        setIsPlaying(true);
        setRobotState("playing");
        a.onended = () => {
            if (!mountedRef.current) return;
            setIsPlaying(false);
            setRobotState("idle");
        };
        a.play().catch(() => { setIsPlaying(false); setRobotState("idle"); });
    };

    const addFP = (v) => {
        const id = floaterId.current++;
        setFloaters(f => [...f, { v, id }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
    };

    const triggerFlash = () => {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 400);
    };

    const handleOption = (optIdx) => {
        if (blocked || selected !== null) return;
        const i = idxRef.current;
        const round = roundsRef.current[i];
        const chosen = options[optIdx];
        const correct = chosen.value === round.value;

        setSelected(optIdx);

        if (correct) {
            setBlocked(true);
            correctSnd.currentTime = 0; correctSnd.play().catch(() => { });
            const ns = streakRef.current + 1;
            streakRef.current = ns;
            setStreak(ns);
            setBestStreak(b => Math.max(b, ns));
            const bonus = PTS_CORRECT + (ns >= 5 ? 15 : ns >= 4 ? 10 : ns >= 3 ? 7 : ns >= 2 ? 4 : 0);
            setPoints(p => p + bonus);
            setAttempts(a => a + 1);
            setCorrectCount(c => c + 1);
            addFP(bonus);
            setRobotState("correct");
            setOptAnimate(true);
            if (ns >= 3) setShowCombo(true);
            confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 }, colors: [round.color, "#FFD700", "#fff", "#FF6B9D"] });
            setTimeout(() => {
                setShowCombo(false);
                triggerFlash();
                setTimeout(() => advanceTo(i + 1), 350);
            }, 1250);

        } else {
            incorrectSnd.currentTime = 0; incorrectSnd.play().catch(() => { });
            streakRef.current = 0; setStreak(0);
            // ✅ Sin penalización -3
            setRobotState("wrong");

            const newLives = livesRef.current - 1;
            livesRef.current = newLives;
            setLives(newLives);

            if (newLives <= 0) {
                // ✅ FIX: Reveal verde + reproducir audio del número correcto
                setBlocked(true);
                setSelected(null); // ← desselecciona la última opción equivocada para que se vea el reveal verde
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playNumber(round.value); // ← niño escucha el número correcto
                }, 400);
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    livesRef.current = MAX_LIVES;
                    setLives(MAX_LIVES);
                    setAttempts(a => a + 1);
                    triggerFlash();
                    setTimeout(() => advanceTo(i + 1), 350);
                }, 2200); // ← tiempo extra para que el niño escuche
            } else {
                // ✅ FIX: Repetir audio cuando falla con vidas restantes
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    setSelected(null);
                    setRobotState("idle");
                    playNumber(round.value); // ← repite el audio para que el niño escuche otra vez
                }, 900);
            }
        }
    };

    const advanceTo = (next) => {
        if (!mountedRef.current) return;
        if (next >= roundsRef.current.length) { setFinished(true); return; }
        setCurrentIdx(next);
        idxRef.current = next;
        loadRound(roundsRef.current, next);
    };

    const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
    const stars = correctCount >= 7 ? 3 : correctCount >= 5 ? 2 : 1;

    if (finished) return (
        <div className="hi-result-root">
            <GameBackground color="blue" />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="hi-result-card">
                <div className="hi-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🎯" : "💪"}</div>
                <div className="hi-result-badge">Numbers 0–10 · Level 1 🔢</div>
                <h2 className="hi-result-title">¡Juego terminado!</h2>
                <div className="hi-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`hi-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="hi-result-stats">
                    <div className="hi-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{NUM_ROUNDS}</strong></div>
                    <div className="hi-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="hi-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="hi-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && (
                    <button className="hi-result-btn" onClick={() => onFinish(correctCount)}>Continue 🔢</button>
                )}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;

    return (
        <>
            <div className="hi-header-bar">
                <div className="hi-header-left">
                    <span className="hi-header-badge" style={{ background: "linear-gradient(135deg,#6366F1,#3B82F6)" }}>Level 1</span>
                    <span className="hi-header-title">🎧 Listening</span>
                </div>
                <div className="hi-header-right">
                    <div className="hi-header-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="hi-header-pill hi-streak-pill">🔥 {streak}x</div>}
                    <div className="hi-header-pill">🎯 {attempts}</div>
                    <div className="hi-header-pill">⏱ {fmt}</div>
                </div>
            </div>

            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            {showCombo && <ComboBanner streak={streak} />}
            <RoundFlash show={showFlash} />

            <div className="hi-root">
                {BG_STARS.map(s => (
                    <div key={s.id} className="hi-star"
                        style={{ top: s.top, left: s.left, width: s.size, height: s.size, "--sdur": s.dur, "--sdel": s.del }} />
                ))}
                {BG_PARTICLES.map(p => (
                    <div key={p.id} className="hi-particle"
                        style={{ top: p.top, left: p.left, width: p.size, height: p.size, background: p.color, "--pdur": p.dur, "--pdel": p.del }} />
                ))}
                {BG_SPARKLES.map(s => (
                    <div key={s.id} className="hi-sparkle"
                        style={{ top: s.top, left: s.left, "--ssize": `${s.size}px`, "--sdurs": s.dur, "--sdels": s.del }}>
                        {s.emoji}
                    </div>
                ))}

                <div className="hi-progress-wrap">
                    <div className="hi-progress-track">
                        <div className="hi-progress-fill" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6366F1,#3B82F6 50%,#06B6D4)" }} />
                        <div className="hi-progress-steps">
                            {rounds.map((_, i) => (
                                <div key={i} className={`hi-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
                            ))}
                        </div>
                    </div>
                    {/* Active dot glow label */}
                    <div className="hi-progress-label">{currentIdx + 1} / {NUM_ROUNDS}</div>
                </div>

                <div className="hi-game-area">
                    <div className="hi-top-row">

                        {/* Robot + bubble */}
                        <div className="hi-robot-wrap">
                            <RobotMascot state={robotState} lives={lives} streak={streak} />
                            <div className="hi-lives">
                                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                    <LifeIcon key={i} alive={i < lives} idx={i} />
                                ))}
                            </div>
                            <div className="hi-lives-label">
                                {lives === MAX_LIVES ? "2 lives" : lives === 1 ? "Last try!" : ""}
                            </div>
                        </div>

                        {/* Question card */}
                        <div className="hi-question-card" style={{ borderColor: round.color, boxShadow: `0 0 32px ${round.glow}` }}>
                            <div className="hi-question-label">What number do you hear? 🎧</div>
                            <button
                                className={`hi-play-btn ${isPlaying ? "hi-play-btn--playing" : "hi-play-btn--idle"}`}
                                style={{ background: `linear-gradient(135deg,${round.color},${round.color}99)`, boxShadow: `0 8px 28px ${round.glow}` }}
                                onClick={() => !isPlaying && playNumber(round.value)}
                                disabled={isPlaying || blocked}
                            >
                                {isPlaying
                                    ? <><WaveAnim /> Playing…</>
                                    : <><span className="hi-play-icon">🔊</span>&nbsp; Tap to listen!</>
                                }
                            </button>
                            <div className="hi-round-counter">Round {currentIdx + 1} / {NUM_ROUNDS}</div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="hi-options-grid">
                        {options.map((opt, i) => {
                            const isSelected = selected === i;
                            const isCorrect = opt.value === round.value;
                            let state = "";
                            if (selected !== null) {
                                if (isSelected && isCorrect) state = "correct";
                                if (isSelected && !isCorrect) state = "wrong";
                                if (!isSelected && isCorrect && blocked) state = "reveal";
                            } else if (blocked && isCorrect) {
                                // ✅ Reveal cuando perdió todas las vidas
                                state = "reveal";
                            }
                            return (
                                <button
                                    key={opt.value}
                                    className={`hi-option ${state} ${optAnimate && isCorrect ? "hi-opt-celebrate" : ""}`}
                                    style={{ "--opt-color": opt.color, "--opt-glow": opt.glow, animationDelay: `${i * 0.08}s` }}
                                    onClick={() => handleOption(i)}
                                    disabled={blocked}
                                >
                                    {/* Color glow bg on hover */}
                                    <div className="hi-opt-glow-bg" style={{ background: opt.color }} />
                                    <DotGrid value={opt.value} color={opt.color} size={72} animate={optAnimate && isCorrect} />
                                    <div className="hi-opt-number" style={{ color: opt.color }}>{opt.value}</div>
                                    <div className="hi-opt-word">{opt.word}</div>
                                    {state === "correct" && <div className="hi-opt-verdict hi-verd-ok">✓</div>}
                                    {state === "wrong" && <div className="hi-opt-verdict hi-verd-fail">✗</div>}
                                    {state === "reveal" && <div className="hi-opt-verdict hi-verd-reveal">✓</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

function WaveAnim() {
    return (
        <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, height: 18, marginRight: 4 }}>
            {[0, .1, .2, .3, .4].map((d, i) => (
                <i key={i} style={{ display: "block", width: 4, background: "#fff", borderRadius: 3, height: 4, animation: `waveA .8s ease-in-out ${d}s infinite` }} />
            ))}
        </span>
    );
}