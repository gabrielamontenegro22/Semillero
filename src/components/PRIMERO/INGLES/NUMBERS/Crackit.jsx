import React, { useState, useEffect, useRef } from "react";
import "./Crackit.css";
import confetti from "canvas-confetti";

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
    { value: 0, word: "ZERO", audio: zeroAudio, color: "#A78BFA", dark: "#6D28D9", glow: "rgba(167,139,250,0.8)", emoji: "🍎" },
    { value: 1, word: "ONE", audio: oneAudio, color: "#FB7185", dark: "#BE123C", glow: "rgba(251,113,133,0.8)", emoji: "🍎" },
    { value: 2, word: "TWO", audio: twoAudio, color: "#60A5FA", dark: "#1D4ED8", glow: "rgba(96,165,250,0.8)", emoji: "🍎" },
    { value: 3, word: "THREE", audio: threeAudio, color: "#34D399", dark: "#065F46", glow: "rgba(52,211,153,0.8)", emoji: "🍎" },
    { value: 4, word: "FOUR", audio: fourAudio, color: "#FBBF24", dark: "#92400E", glow: "rgba(251,191,36,0.8)", emoji: "🍎" },
    { value: 5, word: "FIVE", audio: fiveAudio, color: "#F472B6", dark: "#9D174D", glow: "rgba(244,114,182,0.8)", emoji: "🍎" },
    { value: 6, word: "SIX", audio: sixAudio, color: "#2DD4BF", dark: "#0F766E", glow: "rgba(45,212,191,0.8)", emoji: "🍎" },
    { value: 7, word: "SEVEN", audio: sevenAudio, color: "#FB923C", dark: "#C2410C", glow: "rgba(251,146,60,0.8)", emoji: "🍎" },
    { value: 8, word: "EIGHT", audio: eightAudio, color: "#C084FC", dark: "#7E22CE", glow: "rgba(192,132,252,0.8)", emoji: "🍎" },
    { value: 9, word: "NINE", audio: nineAudio, color: "#22D3EE", dark: "#0E7490", glow: "rgba(34,211,238,0.8)", emoji: "🍎" },
    { value: 10, word: "TEN", audio: tenAudio, color: "#A3E635", dark: "#3F6212", glow: "rgba(163,230,53,0.8)", emoji: "🍎" },
];

const correctSnd = new Audio(correctoSound);
const incorrectSnd = new Audio(incorrectoSound);
// ✅ FIX: Precargar audios para evitar latencia
[correctSnd, incorrectSnd].forEach(a => { a.preload = "auto"; });
const numAudios = NUMBERS.map(n => { const a = new Audio(n.audio); a.preload = "auto"; return a; });

function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }
function genRounds() { return shuffle([...NUMBERS]).slice(0, 8); }
function genOptions(correct) {
    return shuffle([correct, ...shuffle(NUMBERS.filter(n => n.value !== correct.value)).slice(0, 3)]);
}

// ── Animated SVG Background ──
function ArcadeBg({ color, glow }) {
    const stars = Array.from({ length: 55 }, (_, i) => ({
        x: Math.random() * 1440, y: Math.random() * 900,
        r: 0.8 + Math.random() * 2.2,
        dur: `${1.2 + Math.random() * 3}s`, del: `${Math.random() * 5}s`
    }));
    return (
        <svg className="ci-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="bgG" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#1e0040" />
                    <stop offset="55%" stopColor="#0d0030" />
                    <stop offset="100%" stopColor="#050010" />
                </radialGradient>
                <radialGradient id="glowC" cx="50%" cy="42%" r="40%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#bgG)" />
            <rect width="1440" height="900" fill="url(#glowC)" />
            {/* Grid */}
            {Array.from({ length: 19 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 50} x2="1440" y2={i * 50} stroke={color} strokeWidth="0.5" opacity="0.07" />
            ))}
            {Array.from({ length: 29 }, (_, i) => (
                <line key={`v${i}`} x1={i * 52} y1="0" x2={i * 52} y2="900" stroke={color} strokeWidth="0.5" opacity="0.07" />
            ))}
            {/* Big orbs */}
            {[[160, 180, 90], [1280, 160, 75], [720, 60, 55], [260, 720, 80], [1100, 680, 65], [550, 420, 35], [870, 300, 50]].map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r} fill={color} opacity="0.08">
                    <animate attributeName="r" values={`${r};${r + 14};${r}`} dur={`${3 + i * .8}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.05;0.14;0.05" dur={`${3 + i * .8}s`} repeatCount="indefinite" />
                </circle>
            ))}
            {/* Stars */}
            {stars.map((s, i) => (
                <circle key={`st${i}`} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity="0.8">
                    <animate attributeName="opacity" values="0.15;1;0.15" dur={s.dur} repeatCount="indefinite" begin={s.del} />
                </circle>
            ))}
            {/* Shooting stars */}
            {[0, 1, 2].map(i => (
                <g key={`ss${i}`}>
                    <line x1="0" y1="0" x2="100" y2="35" stroke="#fff" strokeWidth="2.5" opacity="0.9">
                        <animateTransform attributeName="transform" type="translate"
                            values={`-150,${80 + i * 260};1600,${80 + i * 260}`}
                            dur={`${5 + i * 2.5}s`} begin={`${i * 3.5}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;0.9;0" dur={`${5 + i * 2.5}s`} begin={`${i * 3.5}s`} repeatCount="indefinite" />
                    </line>
                </g>
            ))}
            {/* Corner triangles */}
            <polygon points="0,0 140,0 0,140" fill={color} opacity="0.14" />
            <polygon points="1440,0 1300,0 1440,140" fill={color} opacity="0.14" />
            <polygon points="0,900 140,900 0,760" fill={color} opacity="0.14" />
            <polygon points="1440,900 1300,900 1440,760" fill={color} opacity="0.14" />
            {/* Floating diamonds */}
            {[[200, 400], [1240, 420], [720, 800]].map(([x, y], i) => (
                <polygon key={`d${i}`} points={`${x},${y - 20} ${x + 14},${y} ${x},${y + 20} ${x - 14},${y}`}
                    fill={color} opacity="0.15">
                    <animateTransform attributeName="transform" type="rotate"
                        values={`0 ${x} ${y};360 ${x} ${y}`} dur={`${6 + i * 2}s`} repeatCount="indefinite" />
                </polygon>
            ))}
        </svg>
    );
}

// ── Emoji dots ──
function EmojiDots({ num, color }) {
    if (num.value === 0) return (
        <div className="ci-zero-wrap">
            <div className="ci-zero-ring" style={{ borderColor: color, boxShadow: `0 0 22px ${color}` }}>
                <span style={{ color, fontFamily: "Fredoka One,cursive", fontSize: 34 }}>0</span>
            </div>
        </div>
    );
    const cols = num.value <= 4 ? 2 : num.value <= 9 ? 3 : 4;
    const fSize = num.value <= 4 ? 30 : num.value <= 7 ? 23 : 18;
    return (
        <div className="ci-emoji-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, fontSize: fSize }}>
            {Array.from({ length: num.value }).map((_, i) => (
                <span key={i} className="ci-emoji-dot" style={{ animationDelay: `${i * .05}s` }}>{num.emoji}</span>
            ))}
        </div>
    );
}

// ── Central Word Card ──
function WordCard({ word, color, glow, state }) {
    return (
        <div className={`ci-word-card ci-wc-${state}`} style={{ "--wc": color, "--wg": glow }}>
            <div className="ci-wc-ring1" style={{ borderColor: color, boxShadow: `0 0 28px ${glow}, inset 0 0 28px ${glow}22` }} />
            <div className="ci-wc-ring2" style={{ borderColor: color, opacity: .35 }} />
            <div className="ci-wc-ring3" style={{ borderColor: color, opacity: .18 }} />
            <div className="ci-wc-inner">
                <div className="ci-wc-label">Read the word!</div>
                <div className="ci-wc-word" style={{ color, textShadow: `0 0 40px ${glow},0 0 80px ${glow},0 0 120px ${glow}` }}>
                    {word}
                </div>
                <div className="ci-wc-sub">Find this many 👇</div>
                {state === "open" && <div className="ci-wc-result ci-wc-ok">✓ Correct!</div>}
                {state === "wrong" && <div className="ci-wc-result ci-wc-fail">✗ Try again!</div>}
            </div>
        </div>
    );
}

// ── Mascot ──
function Mascot({ state }) {
    const mood = state === "correct" ? "happy" : state === "wrong" ? "sad" : "idle";
    const eyeC = mood === "happy" ? "#4ADE80" : mood === "sad" ? "#FF4D6D" : "#FCD34D";
    const bodyC = mood === "happy" ? "#14532D" : mood === "sad" ? "#7F1D1D" : "#1e3a5f";
    return (
        <div className={`ci-mascot ci-mascot--${mood}`}>
            <svg width="90" height="112" viewBox="0 0 90 112" fill="none">
                <rect x="18" y="6" width="54" height="7" rx="3" fill="#0f172a" />
                <rect x="24" y="0" width="42" height="16" rx="7" fill="#1e293b" />
                <rect x="16" y="11" width="58" height="5" rx="2" fill="#0f172a" />
                <rect x="24" y="11" width="42" height="4" rx="1" fill={eyeC} />
                <ellipse cx="45" cy="37" rx="23" ry="21" fill="#FDE68A" />
                {mood === "happy" ? <>
                    <path d="M34 34 Q38 29 42 34" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M50 34 Q54 29 58 34" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M35 47 Q45 56 57 47" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </> : mood === "sad" ? <>
                    <path d="M34 32 Q38 37 42 32" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M50 32 Q54 37 58 32" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M35 51 Q45 44 57 51" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </> : <>
                    <circle cx="38" cy="34" r="4" fill="#1e293b" />
                    <circle cx="54" cy="34" r="4" fill="#1e293b" />
                    <circle cx="40" cy="32" r="1.5" fill="#fff" />
                    <circle cx="56" cy="32" r="1.5" fill="#fff" />
                    <rect x="38" y="47" width="14" height="3" rx="1.5" fill="#92400E" />
                </>}
                <rect x="22" y="58" width="46" height="38" rx="11" fill={bodyC} />
                <polygon points="45,65 34,59 36,76" fill="rgba(255,255,255,0.08)" />
                <polygon points="45,65 56,59 54,76" fill="rgba(255,255,255,0.08)" />
                <polygon points="45,67 41,80 45,83 49,80" fill={eyeC} />
                <circle cx="45" cy="88" r="3.5" fill="rgba(255,255,255,0.2)" />
                <rect x="4" y="59" width="16" height="28" rx="8" fill={bodyC} />
                <rect x="70" y="59" width="16" height="28" rx="8" fill={bodyC} />
                <rect x="27" y="94" width="14" height="16" rx="6" fill="#0f172a" />
                <rect x="49" y="94" width="14" height="16" rx="6" fill="#0f172a" />
                <ellipse cx="34" cy="110" rx="11" ry="4" fill="#1e293b" />
                <ellipse cx="56" cy="110" rx="11" ry="4" fill="#1e293b" />
            </svg>
        </div>
    );
}

function FP({ value }) {
    return <div className={`ci-fp ci-fp${value > 0 ? "p" : "n"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}
function ComboBanner({ streak }) {
    if (streak < 3) return null;
    const msg = streak >= 5 ? "🔥 UNSTOPPABLE!" : streak >= 4 ? "⚡ SUPER COMBO!" : "🎯 COMBO x3!";
    return <div className="ci-combo" key={streak}>{msg}</div>;
}

const NUM_ROUNDS = 8, MAX_LIVES = 2, PTS_CORRECT = 10;

export default function CrackIt({ onFinish }) {
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
    const [cardState, setCardState] = useState("idle");
    const [mascotState, setMascotState] = useState("idle");
    const [showCombo, setShowCombo] = useState(false);

    const mountedRef = useRef(true), floaterId = useRef(0), roundsRef = useRef([]);
    const idxRef = useRef(0), streakRef = useRef(0), roundLivesRef = useRef(MAX_LIVES);
    const audioRef = useRef(null);

    useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { streakRef.current = streak; }, [streak]);
    useEffect(() => { roundLivesRef.current = roundLives; }, [roundLives]);

    useEffect(() => {
        mountedRef.current = true;
        // ✅ Forzar precarga
        [correctSnd, incorrectSnd, ...numAudios].forEach(a => a.load());
        const r = genRounds(); roundsRef.current = r; setRounds(r); loadRound(r, 0);
        return () => {
            mountedRef.current = false;
            confetti.reset();
            // ✅ Cleanup: detener audio activo al desmontar
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
        const end = Date.now() + 3000;
        const f = () => {
            if (!mountedRef.current) return;
            confetti({ particleCount: 16, angle: 60, spread: 75, origin: { x: 0 } });
            confetti({ particleCount: 16, angle: 120, spread: 75, origin: { x: 1 } });
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
        setSelected(null); setBlocked(false); setCardState("idle"); setMascotState("idle");
        setRoundLives(MAX_LIVES); roundLivesRef.current = MAX_LIVES;
        setOptions(genOptions(all[i]));
    };

    // ✅ NUEVO: Reproducir audio del número
    const playNumberAudio = (value) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const a = numAudios[value];
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
        const correct = options[optIdx].value === round.value;
        setSelected(optIdx);
        if (correct) {
            setBlocked(true);
            correctSnd.currentTime = 0; correctSnd.play().catch(() => { });
            setCardState("open"); setMascotState("correct");
            const ns = streakRef.current + 1; streakRef.current = ns; setStreak(ns);
            setBestStreak(b => Math.max(b, ns));
            const bonus = PTS_CORRECT + (ns >= 5 ? 15 : ns >= 4 ? 10 : ns >= 3 ? 7 : ns >= 2 ? 4 : 0);
            setPoints(p => p + bonus); setCorrectCount(c => c + 1); addFP(bonus);
            setAttempts(a => a + 1);
            if (ns >= 3) setShowCombo(true);
            confetti({
                particleCount: 110, spread: 120, origin: { y: 0.45 },
                colors: [round.color, "#FFD700", "#fff", "#FF6B9D", "#A78BFA", "#34D399"]
            });
            // ✅ FIX: Reproducir audio del número (refuerzo) después del "correcto"
            setTimeout(() => {
                if (!mountedRef.current) return;
                playNumberAudio(round.value);
            }, 500);
            setTimeout(() => { setShowCombo(false); advanceTo(i + 1); }, 2400);
        } else {
            incorrectSnd.currentTime = 0; incorrectSnd.play().catch(() => { });
            setCardState("wrong"); setMascotState("wrong");
            streakRef.current = 0; setStreak(0);
            // ✅ Sin penalización -3
            const nl = roundLivesRef.current - 1; roundLivesRef.current = nl; setRoundLives(nl);
            if (nl <= 0) {
                // ✅ FIX: Reveal verde + audio del número correcto
                setBlocked(true);
                setAttempts(a => a + 1);
                setSelected(null);
                setCardState("idle"); // ← quita "Try again!"
                setMascotState("idle");
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playNumberAudio(round.value); // ← niño escucha el correcto
                }, 400);
                setTimeout(() => advanceTo(i + 1), 2400);
            }
            else { setTimeout(() => { if (!mountedRef.current) return; setSelected(null); setCardState("idle"); setMascotState("idle"); }, 900); }
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
        <div className="ci-result-root">
            <ArcadeBg color="#A78BFA" glow="rgba(167,139,250,0.8)" />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="ci-result-card">
                <div className="ci-re-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🔐" : "💪"}</div>
                <div className="ci-re-badge">Numbers 0–10 · Level 2 👁️</div>
                <h2 className="ci-re-title">¡Nivel terminado!</h2>
                <div className="ci-re-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`ci-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="ci-re-stats">
                    <div className="ci-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{NUM_ROUNDS}</strong></div>
                    <div className="ci-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="ci-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="ci-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && <button className="ci-re-btn" onClick={() => onFinish(correctCount)}>Continue ✏️</button>}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;

    return (
        <div className="ci-root">
            <ArcadeBg color={round.color} glow={round.glow} />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            {showCombo && <ComboBanner streak={streak} />}

            {/* HEADER */}
            <div className="ci-header">
                <div className="ci-header-left">
                    <span className="ci-badge" style={{ background: `linear-gradient(135deg,${round.color},${round.dark})` }}>Level 2</span>
                    <span className="ci-header-title">👁️ Reading</span>
                </div>
                <div className="ci-header-right">
                    <div className="ci-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="ci-pill ci-pill-streak">🔥 {streak}x</div>}
                    <div className="ci-pill">🎯 {attempts}</div>
                    <div className="ci-pill">⏱ {fmt}</div>
                </div>
            </div>

            {/* PROGRESS */}
            <div className="ci-progress-wrap">
                <div className="ci-progress-track">
                    <div className="ci-progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg,${round.dark},${round.color})`, boxShadow: `0 0 16px ${round.glow}` }} />
                    <div className="ci-progress-dots">
                        {rounds.map((_, i) => (
                            <div key={i} className={`ci-pdot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`}
                                style={i === currentIdx ? { background: round.color, boxShadow: `0 0 10px ${round.color}` } : {}} />
                        ))}
                    </div>
                </div>
            </div>

            {/* GAME — 3 columns */}
            <div className="ci-game">

                {/* LEFT */}
                <div className="ci-left-col">
                    <Mascot state={mascotState} />
                    <div className="ci-lives-row">
                        {Array.from({ length: MAX_LIVES }).map((_, i) => (
                            <span key={i} className={`ci-life ${i < roundLives ? "alive" : "lost"}`}>
                                {i < roundLives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>
                    <div className="ci-round-pill" style={{ color: round.color, borderColor: round.color, boxShadow: `0 0 14px ${round.glow}` }}>
                        Round {currentIdx + 1}/{NUM_ROUNDS}
                    </div>
                </div>

                {/* CENTER */}
                <div className="ci-center-col">
                    <WordCard word={round.word} color={round.color} glow={round.glow} state={cardState} />
                </div>

                {/* RIGHT — 2x2 options */}
                <div className="ci-right-col">
                    <div className="ci-options-grid">
                        {options.map((opt, i) => {
                            const isSel = selected === i, isCorr = opt.value === round.value;
                            let st = "";
                            if (selected !== null) {
                                if (isSel && isCorr) st = "correct";
                                if (isSel && !isCorr) st = "wrong";
                                if (!isSel && isCorr && blocked) st = "reveal";
                            } else if (blocked && isCorr) {
                                // ✅ Reveal cuando perdió todas las vidas
                                st = "reveal";
                            }
                            return (
                                <button key={opt.value}
                                    className={`ci-option ci-opt-${st || "idle"}`}
                                    style={{ "--oc": opt.color, "--og": opt.glow, "--od": opt.dark, animationDelay: `${i * .1}s` }}
                                    onClick={() => handleOption(i)} disabled={blocked}>
                                    <div className="ci-opt-bg" style={{ background: `linear-gradient(145deg,${opt.dark}cc,${opt.color}33)` }} />
                                    <EmojiDots num={opt} color={opt.color} />
                                    <div className="ci-opt-num" style={{ color: opt.color, textShadow: `0 0 18px ${opt.glow}` }}>
                                        {opt.value}
                                    </div>
                                    {st === "correct" && <div className="ci-verdict ci-vok">✓</div>}
                                    {st === "wrong" && <div className="ci-verdict ci-vfail">✗</div>}
                                    {st === "reveal" && <div className="ci-verdict ci-vreveal">✓</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}