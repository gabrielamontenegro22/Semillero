import React, { useState, useEffect, useRef, memo } from "react";
import "./Numberslevel1.css";
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
import elevenAudio from "../../../../assets/sounds/eleven.mp3";
import twelveAudio from "../../../../assets/sounds/twelve.mp3";
import thirteenAudio from "../../../../assets/sounds/thirteen.mp3";
import fourteenAudio from "../../../../assets/sounds/fourteen.mp3";
import fifteenAudio from "../../../../assets/sounds/fifteen.mp3";
import sixteenAudio from "../../../../assets/sounds/sixteen.mp3";
import seventeenAudio from "../../../../assets/sounds/seventeen.mp3";
import eighteenAudio from "../../../../assets/sounds/eighteen.mp3";
import nineteenAudio from "../../../../assets/sounds/nineteen.mp3";
import twentyAudio from "../../../../assets/sounds/twenty.mp3";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── NUMBERS DATA ──
const NUMBERS = [
    { num: 0, word: "zero", audio: zeroAudio, color: "#8B8B8B", glow: "rgba(139,139,139,0.7)" },
    { num: 1, word: "one", audio: oneAudio, color: "#EF4444", glow: "rgba(239,68,68,0.7)" },
    { num: 2, word: "two", audio: twoAudio, color: "#F97316", glow: "rgba(249,115,22,0.7)" },
    { num: 3, word: "three", audio: threeAudio, color: "#EAB308", glow: "rgba(234,179,8,0.7)" },
    { num: 4, word: "four", audio: fourAudio, color: "#84CC16", glow: "rgba(132,204,22,0.7)" },
    { num: 5, word: "five", audio: fiveAudio, color: "#22C55E", glow: "rgba(34,197,94,0.7)" },
    { num: 6, word: "six", audio: sixAudio, color: "#10B981", glow: "rgba(16,185,129,0.7)" },
    { num: 7, word: "seven", audio: sevenAudio, color: "#06B6D4", glow: "rgba(6,182,212,0.7)" },
    { num: 8, word: "eight", audio: eightAudio, color: "#3B82F6", glow: "rgba(59,130,246,0.7)" },
    { num: 9, word: "nine", audio: nineAudio, color: "#6366F1", glow: "rgba(99,102,241,0.7)" },
    { num: 10, word: "ten", audio: tenAudio, color: "#A855F7", glow: "rgba(168,85,247,0.7)" },
    { num: 11, word: "eleven", audio: elevenAudio, color: "#D946EF", glow: "rgba(217,70,239,0.7)" },
    { num: 12, word: "twelve", audio: twelveAudio, color: "#EC4899", glow: "rgba(236,72,153,0.7)" },
    { num: 13, word: "thirteen", audio: thirteenAudio, color: "#F43F5E", glow: "rgba(244,63,94,0.7)" },
    { num: 14, word: "fourteen", audio: fourteenAudio, color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { num: 15, word: "fifteen", audio: fifteenAudio, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { num: 16, word: "sixteen", audio: sixteenAudio, color: "#A3E635", glow: "rgba(163,230,53,0.7)" },
    { num: 17, word: "seventeen", audio: seventeenAudio, color: "#4ADE80", glow: "rgba(74,222,128,0.7)" },
    { num: 18, word: "eighteen", audio: eighteenAudio, color: "#34D399", glow: "rgba(52,211,153,0.7)" },
    { num: 19, word: "nineteen", audio: nineteenAudio, color: "#22D3EE", glow: "rgba(34,211,238,0.7)" },
    { num: 20, word: "twenty", audio: twentyAudio, color: "#818CF8", glow: "rgba(129,140,248,0.7)" },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...NUMBERS]).slice(0, 8);
}

function genOptions(correctNum) {
    const others = NUMBERS.filter(n => n.num !== correctNum.num);
    const wrongs = shuffle(others).slice(0, 3);
    return shuffle([correctNum, ...wrongs]);
}

function FloatingPoints({ points, id }) {
    return <div key={id} className="nl1-floating-points">+{points}</div>;
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
    { cx: 700, cy: 450, r: 55, dur: "7s" },
];

const NUMBERS_FLOATING = [
    { x: 120, y: 280, size: 28, rot: -18, delay: "0s", num: "1" },
    { x: 1280, y: 240, size: 30, rot: 22, delay: "1s", num: "7" },
    { x: 180, y: 640, size: 32, rot: -25, delay: "0.8s", num: "3" },
    { x: 1240, y: 680, size: 30, rot: 20, delay: "0.3s", num: "9" },
    { x: 700, y: 140, size: 22, rot: 5, delay: "0.6s", num: "5" },
    { x: 720, y: 820, size: 24, rot: -8, delay: "1.8s", num: "8" },
];

// ── BACKGROUND (arcade oscuro con números flotando) ──
const NumbersBg = memo(function NumbersBg({ color }) {
    return (
        <svg className="nl1-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="nl1BgGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a0a1f" />
                    <stop offset="60%" stopColor="#05050f" />
                    <stop offset="100%" stopColor="#000" />
                </radialGradient>

                <radialGradient id="nl1GlowGrad" cx="50%" cy="45%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>

                <pattern id="nl1-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill={color} opacity="0.15" />
                </pattern>
            </defs>

            <rect width="1440" height="900" fill="url(#nl1BgGrad)" />
            <rect width="1440" height="900" fill="url(#nl1-dots)" />
            <rect width="1440" height="900" fill="url(#nl1GlowGrad)" />

            {/* Grilla */}
            {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 90} x2="1440" y2={i * 90}
                    stroke={color} strokeWidth="0.4" opacity="0.05" />
            ))}
            {Array.from({ length: 16 }, (_, i) => (
                <line key={`v${i}`} x1={i * 90} y1="0" x2={i * 90} y2="900"
                    stroke={color} strokeWidth="0.4" opacity="0.05" />
            ))}

            {/* Orbs */}
            {ORBS.map((o, i) => (
                <circle key={`orb${i}`} cx={o.cx} cy={o.cy} r={o.r}
                    fill={color} opacity="0.07"
                    style={{ animation: `nl1-orbPulse ${o.dur} ease-in-out ${i * 0.5}s infinite alternate` }} />
            ))}

            {/* Números flotando decorativos */}
            {NUMBERS_FLOATING.map((n, i) => (
                <text key={`num${i}`}
                    x={n.x} y={n.y}
                    fontSize={n.size * 2}
                    fontFamily="Fredoka One, cursive"
                    fill={color}
                    opacity="0.15"
                    transform={`rotate(${n.rot} ${n.x} ${n.y})`}
                    style={{ animation: `nl1-numFloat 6s ease-in-out ${n.delay} infinite alternate` }}>
                    {n.num}
                </text>
            ))}

            {/* Estrellas */}
            {STARS.map((s, i) => (
                <circle key={`star${i}`} cx={s.cx} cy={s.cy} r={s.r}
                    fill="#fff"
                    style={{ animation: `nl1-twinkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            {/* Destellos esquinas */}
            <g transform="translate(90 140)" style={{ animation: "nl1-sparkle 3s ease-in-out infinite" }}>
                <path d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z"
                    fill={color} opacity="0.35" />
            </g>
            <g transform="translate(1350 780)" style={{ animation: "nl1-sparkle 3.5s ease-in-out 1s infinite" }}>
                <path d="M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z"
                    fill={color} opacity="0.3" />
            </g>

            {/* Polígonos esquinas */}
            <polygon points="0,0 140,0 0,140" fill={color} opacity="0.14" />
            <polygon points="1440,0 1300,0 1440,140" fill={color} opacity="0.14" />
            <polygon points="0,900 140,900 0,760" fill={color} opacity="0.14" />
            <polygon points="1440,900 1300,900 1440,760" fill={color} opacity="0.14" />
        </svg>
    );
});

export default function NumbersLevel1({ onFinish }) {
    const [questions] = useState(() => genRounds());
    const [current, setCurrent] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState(() => genOptions(questions[0]));
    const [answers, setAnswers] = useState({});
    const [selected, setSelected] = useState(null);
    const [finished, setFinished] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [floatingPoints, setFloatingPoints] = useState([]);
    const [shake, setShake] = useState(false);
    const [bounce, setBounce] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const [wrongSelected, setWrongSelected] = useState(null);
    const [lives, setLives] = useState(2);
    const [audioReady, setAudioReady] = useState(false);
    const [revealCorrect, setRevealCorrect] = useState(false);

    const isProcessingRef = useRef(false);
    const audioRefs = useRef({});
    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const mountedRef = useRef(true);
    const audioRef = useRef(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            confetti.reset();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        const roundNumbers = questions.map(q => q.num);
        const audiosToLoad = NUMBERS.filter(n => roundNumbers.includes(n.num));

        audiosToLoad.forEach(n => {
            const a = new Audio(n.audio);
            a.preload = "auto";
            a.load();
            audioRefs.current[n.num] = a;
        });

        const c = new Audio(correctoSound);
        const w = new Audio(incorrectoSound);
        c.preload = "auto"; w.preload = "auto";
        c.load(); w.load();
        correctRef.current = c;
        wrongRef.current = w;

        setAudioReady(true);
    }, [questions]);

    useEffect(() => {
        if (finished) return;
        const id = setInterval(() => setTimeElapsed(t => t + 1), 1000);
        return () => clearInterval(id);
    }, [finished]);

    useEffect(() => {
        if (audioReady && !finished) {
            const timer = setTimeout(() => {
                if (mountedRef.current && !hasPlayed) playAudio();
            }, 50);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, audioReady, finished]);

    const currentQuestion = questions[current];

    // ✅ FIX B: setear hasPlayed/isPlaying SÍNCRONO (no esperar al .then())
    const playAudio = () => {
        const baseAudio = audioRefs.current[currentQuestion.num];
        if (!baseAudio) return;

        // Detener audio anterior
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        audioRef.current = baseAudio;
        baseAudio.currentTime = 0;
        baseAudio.volume = 1;

        // ✅ Marcar como reproducido AHORA, no esperar al .then() asíncrono
        setIsPlaying(true);
        setHasPlayed(true);
        setPlayCount(c => c + 1);

        baseAudio.play().catch(err => {
            console.error(err);
            if (mountedRef.current) setIsPlaying(false);
        });

        baseAudio.onended = () => {
            if (!mountedRef.current) return;
            setIsPlaying(false);
        };
    };

    const addFloatingPoints = (pts) => {
        const id = Date.now();
        setFloatingPoints(prev => [...prev, { pts, id }]);
        setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
    };

    const handleSelect = (num) => {
        if (!hasPlayed) return;
        if (!correctRef.current || !wrongRef.current) return;
        if (selected !== null && lives <= 0) return;
        if (selected !== null && num === currentQuestion.num) return;
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;

        const isCorrect = num === currentQuestion.num;

        if (isCorrect) {
            setSelected(num);
            setAnswers(prev => ({ ...prev, [currentQuestion.num]: num }));
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
                isProcessingRef.current = false;
            }, 1500);

        } else {
            wrongRef.current.cloneNode().play().catch(() => { });
            setStreak(0);
            setWrongSelected(num);
            setShake(true); setTimeout(() => setShake(false), 500);

            const remaining = lives - 1;
            setLives(remaining);

            if (remaining <= 0) {
                setSelected(null);
                setWrongSelected(num);
                setRevealCorrect(true);
                setAnswers(prev => ({ ...prev, [currentQuestion.num]: num }));
                setAttempts(a => a + 1);
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playAudio();
                }, 400);
                setTimeout(() => {
                    if (mountedRef.current) {
                        triggerNext(current);
                    }
                    isProcessingRef.current = false;
                }, 2400);
            } else {
                setTimeout(() => {
                    setSelected(null);
                    if (mountedRef.current) {
                        isProcessingRef.current = false;
                        playAudio();
                    }
                }, 1000);
            }
        }
    };

    const triggerNext = (currentIndex) => {
        isProcessingRef.current = false;
        if (currentIndex < questions.length - 1) {
            const next = currentIndex + 1;
            setCurrent(next);
            setSelected(null);
            setHasPlayed(false); setPlayCount(0);
            setWrongSelected(null);
            setLives(2);
            setRevealCorrect(false);
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

    const score = questions.reduce((acc, q) => (answers[q.num] === q.num ? acc + 1 : acc), 0);
    const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentQuestion?.color || "#A855F7";
    const roundGlow = currentQuestion?.glow || "rgba(168,85,247,0.7)";
    const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="nl1-game-root nl1-result-container">
            <NumbersBg color="#A855F7" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="nl1-result-card">
                <div className="nl1-result-emoji">🔢</div>
                <div className="nl1-result-badge">Numbers 0-20 · Level 1 🎧</div>
                <h2 className="nl1-result-title">¡Nivel terminado!</h2>
                <div className="nl1-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`nl1-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="nl1-result-stats">
                    <div className="nl1-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                    <div className="nl1-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="nl1-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="nl1-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="nl1-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="nl1-result-btn" onClick={() => onFinish(score)}>
                        Continue 👁️
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="nl1-game-root">
            <NumbersBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="nl1-header-bar">
                <div className="nl1-header-left">
                    <span className="nl1-header-badge">Level 1</span>
                    <span className="nl1-header-title">🎧 Listening</span>
                </div>
                <div className="nl1-header-right">
                    <div className="nl1-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="nl1-header-pill nl1-streak-pill">🔥 {streak}x</div>}
                    <div className="nl1-header-pill">🎯 {attempts}</div>
                    <div className="nl1-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="nl1-listen-container">
                <div className={`nl1-wrapper ${shake ? "nl1-shake" : ""} ${bounce ? "nl1-bounce" : ""}`}>

                    <div className="nl1-progress-track">
                        <div className="nl1-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#fff)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="nl1-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`nl1-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="nl1-instruction">👂 Listen and pick the right number!</p>

                    <button
                        className={`nl1-play-btn ${isPlaying ? "playing" : ""}`}
                        onClick={playAudio}
                        disabled={isPlaying}
                        style={{ "--round-color": roundColor, "--round-glow": roundGlow }}
                    >
                        {isPlaying ? (
                            <><span className="nl1-wave-bars"><span /><span /><span /><span /><span /></span>Playing…</>
                        ) : (
                            <>🔊 {playCount > 0 ? "Play Again" : "Play Audio"}</>
                        )}
                    </button>

                    <div className="nl1-lives-container">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <span key={i} className={`nl1-heart ${i < lives ? "alive" : "lost"}`}>
                                {i < lives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>

                    {lives === 1 && wrongSelected !== null && selected === null && (
                        <div className="nl1-retry-banner">❌ ¡Incorrecto! 🎧 Escucha de nuevo e intenta otra vez</div>
                    )}
                    {revealCorrect && (
                        <div className="nl1-retry-banner failed">😔 ¡Inténtalo de nuevo! Escucha la respuesta correcta</div>
                    )}

                    <div className="nl1-images-grid">
                        {shuffledOptions.map(opt => {
                            const isSelected = selected === opt.num;
                            const isCorrect = isSelected && opt.num === currentQuestion.num;
                            const isWrong = isSelected && opt.num !== currentQuestion.num;
                            const isWrongPrev = lives === 1 && opt.num === wrongSelected;
                            const isLocked = selected !== null && !isSelected && lives <= 0;
                            const canClick = selected === null && hasPlayed && lives > 0 && !isPlaying;
                            const canRetry = lives === 1 && hasPlayed && !isPlaying && selected === null;
                            const isReveal = revealCorrect && opt.num === currentQuestion.num;
                            const isWrongFinal = revealCorrect && opt.num === wrongSelected;
                            return (
                                <div
                                    key={opt.num}
                                    className={`nl1-image-card
                                        ${isCorrect ? "correct" : ""}
                                        ${isWrong ? "wrong" : ""}
                                        ${isWrongPrev ? "wrong-prev" : ""}
                                        ${isLocked ? "locked" : ""}
                                        ${isReveal ? "correct" : ""}
                                        ${isWrongFinal ? "wrong" : ""}
                                        ${canClick || canRetry ? "hoverable" : ""}
                                    `}
                                    onClick={() => handleSelect(opt.num)}
                                    style={{ "--card-color": opt.color, "--card-glow": opt.glow }}
                                >
                                    <div className="nl1-card-inner">
                                        <div className="nl1-card-number" style={{ color: opt.color, textShadow: `0 0 30px ${opt.glow}, 0 4px 10px rgba(0,0,0,0.6)` }}>{opt.num}</div>
                                        <div className="nl1-card-label">{opt.word}</div>
                                        {isCorrect && <div className="nl1-card-badge nl1-correct-badge">✓</div>}
                                        {isWrong && <div className="nl1-card-badge nl1-wrong-badge">✗</div>}
                                        {isWrongPrev && !isSelected && <div className="nl1-card-badge nl1-wrong-badge">✗</div>}
                                        {isReveal && <div className="nl1-card-badge nl1-correct-badge">✓</div>}
                                        {isWrongFinal && <div className="nl1-card-badge nl1-wrong-badge">✗</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}