import React, { useState, useEffect, useRef, memo } from "react";
import "./Numberslevel2.css";
import confetti from "canvas-confetti";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── NUMBERS DATA (sin audios, solo visual) ──
const NUMBERS = [
    { num: 0, word: "zero", color: "#8B8B8B", glow: "rgba(139,139,139,0.7)" },
    { num: 1, word: "one", color: "#EF4444", glow: "rgba(239,68,68,0.7)" },
    { num: 2, word: "two", color: "#F97316", glow: "rgba(249,115,22,0.7)" },
    { num: 3, word: "three", color: "#EAB308", glow: "rgba(234,179,8,0.7)" },
    { num: 4, word: "four", color: "#84CC16", glow: "rgba(132,204,22,0.7)" },
    { num: 5, word: "five", color: "#22C55E", glow: "rgba(34,197,94,0.7)" },
    { num: 6, word: "six", color: "#10B981", glow: "rgba(16,185,129,0.7)" },
    { num: 7, word: "seven", color: "#06B6D4", glow: "rgba(6,182,212,0.7)" },
    { num: 8, word: "eight", color: "#3B82F6", glow: "rgba(59,130,246,0.7)" },
    { num: 9, word: "nine", color: "#6366F1", glow: "rgba(99,102,241,0.7)" },
    { num: 10, word: "ten", color: "#A855F7", glow: "rgba(168,85,247,0.7)" },
    { num: 11, word: "eleven", color: "#D946EF", glow: "rgba(217,70,239,0.7)" },
    { num: 12, word: "twelve", color: "#EC4899", glow: "rgba(236,72,153,0.7)" },
    { num: 13, word: "thirteen", color: "#F43F5E", glow: "rgba(244,63,94,0.7)" },
    { num: 14, word: "fourteen", color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { num: 15, word: "fifteen", color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { num: 16, word: "sixteen", color: "#A3E635", glow: "rgba(163,230,53,0.7)" },
    { num: 17, word: "seventeen", color: "#4ADE80", glow: "rgba(74,222,128,0.7)" },
    { num: 18, word: "eighteen", color: "#34D399", glow: "rgba(52,211,153,0.7)" },
    { num: 19, word: "nineteen", color: "#22D3EE", glow: "rgba(34,211,238,0.7)" },
    { num: 20, word: "twenty", color: "#818CF8", glow: "rgba(129,140,248,0.7)" },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...NUMBERS]).slice(0, 8);
}

// Distractores "inteligentes": prioriza números parecidos (teens con teens, etc)
function genOptions(correct) {
    const all = NUMBERS.filter(n => n.num !== correct.num);
    let pool;
    if (correct.num >= 13 && correct.num <= 19) {
        // Teens → otros teens de distractores
        pool = all.filter(n => n.num >= 13 && n.num <= 19);
    } else if (correct.num === 20) {
        pool = all.filter(n => n.num >= 10);
    } else {
        // 0-12 → mix de los pequeños + algún teen para variar
        pool = all.filter(n => n.num <= 12);
    }
    if (pool.length < 3) pool = all;
    const wrongs = shuffle(pool).slice(0, 3);
    return shuffle([correct, ...wrongs]);
}

function FloatingPoints({ points, id }) {
    return <div key={id} className="nl2-floating-points">+{points}</div>;
}

// ── Pre-computed background ──
const STARS = Array.from({ length: 45 }, (_, i) => ({
    cx: (i * 487 + 113) % 1440,
    cy: (i * 317 + 79) % 900,
    r: 0.8 + (i % 3) * 0.7,
    delay: `${(i * 0.37) % 4}s`,
    dur: `${1.8 + (i % 5) * 0.5}s`,
}));

const ORBS = [
    { cx: 150, cy: 180, r: 85, dur: "4s" },
    { cx: 1300, cy: 160, r: 70, dur: "5s" },
    { cx: 280, cy: 720, r: 80, dur: "6s" },
    { cx: 1160, cy: 660, r: 65, dur: "4.5s" },
];

const NUMBERS_FLOATING = [
    { x: 120, y: 280, size: 28, rot: -18, delay: "0s", num: "2" },
    { x: 1280, y: 240, size: 30, rot: 22, delay: "1s", num: "6" },
    { x: 180, y: 640, size: 32, rot: -25, delay: "0.8s", num: "4" },
    { x: 1240, y: 680, size: 30, rot: 20, delay: "0.3s", num: "10" },
    { x: 700, y: 140, size: 22, rot: 5, delay: "0.6s", num: "15" },
];

// ── BACKGROUND ──
const NumbersBg = memo(function NumbersBg({ color }) {
    return (
        <svg className="nl2-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="nl2BgGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a0a1f" />
                    <stop offset="60%" stopColor="#05050f" />
                    <stop offset="100%" stopColor="#000" />
                </radialGradient>
                <radialGradient id="nl2GlowGrad" cx="50%" cy="45%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <pattern id="nl2-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill={color} opacity="0.15" />
                </pattern>
            </defs>

            <rect width="1440" height="900" fill="url(#nl2BgGrad)" />
            <rect width="1440" height="900" fill="url(#nl2-dots)" />
            <rect width="1440" height="900" fill="url(#nl2GlowGrad)" />

            {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 90} x2="1440" y2={i * 90}
                    stroke={color} strokeWidth="0.4" opacity="0.05" />
            ))}
            {Array.from({ length: 16 }, (_, i) => (
                <line key={`v${i}`} x1={i * 90} y1="0" x2={i * 90} y2="900"
                    stroke={color} strokeWidth="0.4" opacity="0.05" />
            ))}

            {ORBS.map((o, i) => (
                <circle key={`orb${i}`} cx={o.cx} cy={o.cy} r={o.r}
                    fill={color} opacity="0.07"
                    style={{ animation: `nl2-orbPulse ${o.dur} ease-in-out ${i * 0.5}s infinite alternate` }} />
            ))}

            {NUMBERS_FLOATING.map((n, i) => (
                <text key={`num${i}`}
                    x={n.x} y={n.y}
                    fontSize={n.size * 2}
                    fontFamily="Fredoka One, cursive"
                    fill={color}
                    opacity="0.15"
                    transform={`rotate(${n.rot} ${n.x} ${n.y})`}
                    style={{ animation: `nl2-numFloat 6s ease-in-out ${n.delay} infinite alternate` }}>
                    {n.num}
                </text>
            ))}

            {STARS.map((s, i) => (
                <circle key={`star${i}`} cx={s.cx} cy={s.cy} r={s.r}
                    fill="#fff"
                    style={{ animation: `nl2-twinkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            <polygon points="0,0 140,0 0,140" fill={color} opacity="0.14" />
            <polygon points="1440,0 1300,0 1440,140" fill={color} opacity="0.14" />
            <polygon points="0,900 140,900 0,760" fill={color} opacity="0.14" />
            <polygon points="1440,900 1300,900 1440,760" fill={color} opacity="0.14" />
        </svg>
    );
});

export default function NumbersLevel2({ onFinish }) {
    const [questions] = useState(() => genRounds());
    const [current, setCurrent] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState(() => genOptions(questions[0]));
    const [answers, setAnswers] = useState({});
    const [selected, setSelected] = useState(null);
    const [finished, setFinished] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [floatingPoints, setFloatingPoints] = useState([]);
    const [shake, setShake] = useState(false);
    const [bounce, setBounce] = useState(false);
    const [wrongSelected, setWrongSelected] = useState(null);
    const [lives, setLives] = useState(2);
    const [revealCorrect, setRevealCorrect] = useState(false); // ✅ NUEVO

    const isProcessingRef = useRef(false);
    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        correctRef.current = new Audio(correctoSound);
        wrongRef.current = new Audio(incorrectoSound);
        correctRef.current.preload = "auto";
        wrongRef.current.preload = "auto";
        return () => { mountedRef.current = false; confetti.reset(); };
    }, []);

    useEffect(() => {
        if (finished) return;
        const id = setInterval(() => setTimeElapsed(t => t + 1), 1000);
        return () => clearInterval(id);
    }, [finished]);

    const currentQuestion = questions[current];

    const addFloatingPoints = (pts) => {
        const id = Date.now();
        setFloatingPoints(prev => [...prev, { pts, id }]);
        setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
    };

    const handleSelect = (word) => {
        if (!correctRef.current || !wrongRef.current) return;
        if (selected !== null && lives <= 0) return;
        if (selected !== null && word === currentQuestion.word) return;
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;

        const isCorrect = word === currentQuestion.word;

        if (isCorrect) {
            setSelected(word);
            setAnswers(prev => ({ ...prev, [currentQuestion.num]: word }));
            correctRef.current.cloneNode().play().catch(() => { });
            setAttempts(a => a + 1);

            if (lives === 2) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > bestStreak) setBestStreak(newStreak);
                const bonus = newStreak >= 3 ? 20 : newStreak >= 2 ? 15 : 10;
                setTotalPoints(p => p + bonus);
                addFloatingPoints(bonus);
                confetti({
                    particleCount: 80, spread: 100, origin: { y: 0.5 },
                    colors: [currentQuestion.color, "#FFD700", "#fff", "#FF6B9D"]
                });
            } else {
                setTotalPoints(p => p + 5);
                addFloatingPoints(5);
            }

            setBounce(true); setTimeout(() => setBounce(false), 600);
            setTimeout(() => {
                if (mountedRef.current) {
                    triggerNext(current);
                }
                // ✅ FIX 3: isProcessingRef libre fuera del guard mountedRef
                isProcessingRef.current = false;
            }, 1500);

        } else {
            wrongRef.current.cloneNode().play().catch(() => { });
            setStreak(0);
            setWrongSelected(word);
            setShake(true); setTimeout(() => setShake(false), 500);

            const remaining = lives - 1;
            setLives(remaining);

            if (remaining <= 0) {
                // ✅ FIX 2: Reveal verde de la palabra correcta
                setSelected(null); // ← desselecciona (para que el correcto se vea verde)
                setWrongSelected(word); // ← mantiene rojo en el malo
                setRevealCorrect(true); // ← marca el correcto en VERDE
                setAnswers(prev => ({ ...prev, [currentQuestion.num]: word }));
                setAttempts(a => a + 1);
                setTimeout(() => {
                    if (mountedRef.current) {
                        triggerNext(current);
                    }
                    isProcessingRef.current = false;
                }, 2400);
            } else {
                // ✅ FIX 4: Unificar a 600ms (consistencia con Pets L2)
                setTimeout(() => {
                    if (mountedRef.current) {
                        setSelected(null);
                        setShake(false);
                    }
                    isProcessingRef.current = false;
                }, 600);
            }
        }
    };

    const triggerNext = (currentIndex) => {
        isProcessingRef.current = false;
        if (currentIndex < questions.length - 1) {
            const next = currentIndex + 1;
            setCurrent(next);
            setSelected(null);
            setWrongSelected(null);
            setLives(2);
            setRevealCorrect(false); // ✅ Reset reveal
            setShuffledOptions(genOptions(questions[next]));
        } else {
            setFinished(true);
            const end = Date.now() + 3000;
            const frame = () => {
                if (!mountedRef.current) return;
                confetti({ particleCount: 14, angle: 60, spread: 70, origin: { x: 0 } });
                confetti({ particleCount: 14, angle: 120, spread: 70, origin: { x: 1 } });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    };

    const score = questions.reduce((acc, q) => (answers[q.num] === q.word ? acc + 1 : acc), 0);
    const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentQuestion?.color || "#A855F7";
    const roundGlow = currentQuestion?.glow || "rgba(168,85,247,0.7)";
    const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="nl2-game-root nl2-result-container">
            <NumbersBg color="#A855F7" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="nl2-result-card">
                <div className="nl2-result-emoji">🔢</div>
                <div className="nl2-result-badge">Numbers 0-20 · Level 2 👁️</div>
                <h2 className="nl2-result-title">¡Nivel terminado!</h2>
                <div className="nl2-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`nl2-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="nl2-result-stats">
                    <div className="nl2-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                    <div className="nl2-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="nl2-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="nl2-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="nl2-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="nl2-result-btn" onClick={() => onFinish(score)}>
                        Continue ✏️
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="nl2-game-root">
            <NumbersBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="nl2-header-bar">
                <div className="nl2-header-left">
                    <span className="nl2-header-badge">Level 2</span>
                    {/* ✅ FIX 1: Header correcto */}
                    <span className="nl2-header-title">👁️ Reading</span>
                </div>
                <div className="nl2-header-right">
                    <div className="nl2-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="nl2-header-pill nl2-streak-pill">🔥 {streak}x</div>}
                    <div className="nl2-header-pill">🎯 {attempts}</div>
                    <div className="nl2-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="nl2-read-container">
                <div className={`nl2-wrapper ${shake ? "nl2-shake" : ""} ${bounce ? "nl2-bounce" : ""}`}>

                    <div className="nl2-progress-track">
                        <div className="nl2-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#fff)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="nl2-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`nl2-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="nl2-instruction">👀 Read the number and pick the word!</p>

                    {/* NÚMERO GRANDE */}
                    <div className="nl2-number-card"
                        style={{
                            borderColor: roundColor,
                            boxShadow: `0 0 0 5px rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.6), 0 0 60px ${roundGlow}`
                        }}>
                        <div className="nl2-big-number"
                            style={{
                                color: roundColor,
                                textShadow: `0 0 40px ${roundGlow}, 0 6px 16px rgba(0,0,0,0.7)`
                            }}>
                            {currentQuestion.num}
                        </div>
                    </div>

                    <div className="nl2-lives-container">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <span key={i} className={`nl2-heart ${i < lives ? "alive" : "lost"}`}>
                                {i < lives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>

                    {lives === 1 && wrongSelected !== null && selected === null && (
                        <div className="nl2-retry-banner">❌ ¡Incorrecto! 👀 Mira otra vez</div>
                    )}
                    {revealCorrect && (
                        <div className="nl2-retry-banner failed">😔 ¡La respuesta correcta es!</div>
                    )}

                    {/* OPCIONES DE PALABRAS */}
                    <div className="nl2-words-grid">
                        {shuffledOptions.map(opt => {
                            const isSelected = selected === opt.word;
                            const isCorrect = isSelected && opt.word === currentQuestion.word;
                            const isWrong = isSelected && opt.word !== currentQuestion.word;
                            const isWrongPrev = lives === 1 && opt.word === wrongSelected;
                            const isLocked = selected !== null && !isSelected && lives <= 0;
                            const canClick = selected === null && lives > 0 && !revealCorrect;
                            const canRetry = lives === 1 && selected === null;
                            // ✅ NUEVO: Reveal verde cuando se pierden vidas
                            const isReveal = revealCorrect && opt.word === currentQuestion.word;
                            const isWrongFinal = revealCorrect && opt.word === wrongSelected;
                            return (
                                <div
                                    key={opt.word}
                                    className={`nl2-word-card
                                        ${isCorrect ? "correct" : ""}
                                        ${isWrong ? "wrong" : ""}
                                        ${isWrongPrev ? "wrong-prev" : ""}
                                        ${isLocked ? "locked" : ""}
                                        ${isReveal ? "correct" : ""}
                                        ${isWrongFinal ? "wrong" : ""}
                                        ${canClick || canRetry ? "hoverable" : ""}
                                    `}
                                    onClick={() => handleSelect(opt.word)}
                                    style={{ "--card-color": opt.color, "--card-glow": opt.glow }}
                                >
                                    <span className="nl2-word-text" style={{ color: opt.color }}>
                                        {opt.word}
                                    </span>
                                    {isCorrect && <div className="nl2-card-badge nl2-correct-badge">✓</div>}
                                    {isWrong && <div className="nl2-card-badge nl2-wrong-badge">✗</div>}
                                    {isWrongPrev && !isSelected && <div className="nl2-card-badge nl2-wrong-badge">✗</div>}
                                    {isReveal && <div className="nl2-card-badge nl2-correct-badge">✓</div>}
                                    {isWrongFinal && <div className="nl2-card-badge nl2-wrong-badge">✗</div>}
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}