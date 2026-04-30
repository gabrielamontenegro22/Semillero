import React, { useState, useEffect, useRef } from "react";
import "./Foodlevel2.css";
import confetti from "canvas-confetti";

// ✅ FIX: Importar audios de los alimentos
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
    { word: "water", emoji: "🫗", audio: waterAudio, color: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
    { word: "rice", emoji: "🍚", audio: riceAudio, color: "#FDE68A", glow: "rgba(253,230,138,0.7)" },
    { word: "bread", emoji: "🍞", audio: breadAudio, color: "#D97706", glow: "rgba(217,119,6,0.7)" },
    { word: "juice", emoji: "🧃", audio: juiceAudio, color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { word: "cheese", emoji: "🧀", audio: cheeseAudio, color: "#FACC15", glow: "rgba(250,204,21,0.7)" },
    { word: "egg", emoji: "🥚", audio: eggAudio, color: "#FEF3C7", glow: "rgba(254,243,199,0.7)" },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...FOODS]).slice(0, 8);
}

function genOptions(correctFood) {
    const wrongs = shuffle(FOODS.filter(f => f.word !== correctFood.word)).slice(0, 3);
    return shuffle([correctFood, ...wrongs]);
}

function FloatingPoints({ points, id }) {
    return <div key={id} className="fl2-floating-points">+{points}</div>;
}

// ── GAMIFIED ANIMATED BACKGROUND ──
function FoodBg({ color, glow }) {
    return (
        <svg className="fl2-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="fl2BgGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a0a1f" />
                    <stop offset="60%" stopColor="#05050f" />
                    <stop offset="100%" stopColor="#000" />
                </radialGradient>
                <radialGradient id="fl2GlowGrad" cx="50%" cy="45%" r="45%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#fl2BgGrad)" />
            <rect width="1440" height="900" fill="url(#fl2GlowGrad)" />

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
                        <animate attributeName="opacity"
                            values="0.1;1;0.1"
                            dur={`${1.5 + Math.random() * 3}s`}
                            repeatCount="indefinite"
                            begin={`${Math.random() * 5}s`} />
                    </circle>
                );
            })}

            {[[150, 180, 95], [1300, 160, 75], [700, 70, 60], [280, 720, 85], [1160, 660, 68], [600, 820, 55]].map(([x, y, r], i) => (
                <circle key={`o${i}`} cx={x} cy={y} r={r} fill={color} opacity="0.09">
                    <animate attributeName="r"
                        values={`${r};${r + 18};${r}`}
                        dur={`${3 + i}s`}
                        repeatCount="indefinite" />
                    <animate attributeName="opacity"
                        values="0.05;0.16;0.05"
                        dur={`${3 + i}s`}
                        repeatCount="indefinite" />
                </circle>
            ))}
        </svg>
    );
}

export default function FoodLevel2({ onFinish }) {
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
    const [lives, setLives] = useState(2);
    const [floatingPoints, setFloatingPoints] = useState([]);
    const [shake, setShake] = useState(false);
    const [bounce, setBounce] = useState(false);
    const [wrongSelected, setWrongSelected] = useState(null);
    const [revealCorrect, setRevealCorrect] = useState(false); // ✅ NUEVO

    const isProcessingRef = useRef(false);
    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const mountedRef = useRef(true);
    // ✅ NUEVO: refs de audios de alimentos
    const foodAudiosRef = useRef({});
    const audioRef = useRef(null);

    useEffect(() => {
        mountedRef.current = true;
        correctRef.current = new Audio(correctoSound);
        wrongRef.current = new Audio(incorrectoSound);
        correctRef.current.preload = "auto";
        wrongRef.current.preload = "auto";
        // ✅ Precargar audios de alimentos
        FOODS.forEach(f => {
            const a = new Audio(f.audio);
            a.preload = "auto";
            a.load();
            foodAudiosRef.current[f.word] = a;
        });
        return () => {
            mountedRef.current = false;
            confetti.reset();
            // ✅ Cleanup audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        if (finished) return;
        const id = setInterval(() => setTimeElapsed(t => t + 1), 1000);
        return () => clearInterval(id);
    }, [finished]);

    const currentQuestion = questions[current];

    // ✅ NUEVO: Reproducir audio del alimento (refuerzo)
    const playFoodAudio = (word) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const a = foodAudiosRef.current[word];
        if (!a) return;
        audioRef.current = a;
        a.currentTime = 0;
        a.play().catch(() => { });
    };

    const addFloatingPoints = (pts) => {
        const id = Date.now();
        setFloatingPoints(prev => [...prev, { pts, id }]);
        setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
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

    const handleSelect = (word) => {
        if (!correctRef.current || !wrongRef.current) return;
        if (selected && lives <= 0) return;
        if (selected && word === currentQuestion.word) return;

        if (isProcessingRef.current) return;

        isProcessingRef.current = true;

        const isCorrect = word === currentQuestion.word;

        if (isCorrect) {
            setSelected(word);
            setAnswers(prev => ({ ...prev, [currentQuestion.word]: word }));
            correctRef.current.cloneNode().play().catch(() => { });

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

            setAttempts(a => a + 1);
            setBounce(true); setTimeout(() => setBounce(false), 600);
            // ✅ FIX: Audio refuerzo del alimento (después de "correcto")
            setTimeout(() => {
                if (!mountedRef.current) return;
                playFoodAudio(currentQuestion.word);
            }, 500);
            setTimeout(() => {
                if (mountedRef.current) {
                    triggerNext(current);
                }
                isProcessingRef.current = false;
            }, 2400); // ← más tiempo para escuchar el refuerzo

        } else {
            wrongRef.current.cloneNode().play().catch(() => { });
            setStreak(0);
            setWrongSelected(word);
            setShake(true); setTimeout(() => setShake(false), 500);

            const remaining = lives - 1;
            setLives(remaining);

            if (remaining <= 0) {
                // ✅ FIX: Reveal verde + audio del correcto
                setSelected(null); // ← desselecciona para que el correcto salga verde
                setWrongSelected(word);
                setRevealCorrect(true);
                setAnswers(prev => ({ ...prev, [currentQuestion.word]: word }));
                setAttempts(a => a + 1);
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playFoodAudio(currentQuestion.word); // ← niño escucha "apple"
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
                    }
                }, 1000);
            }
        }
    };

    const score = questions.reduce((acc, q) => (answers[q.word] === q.word ? acc + 1 : acc), 0);
    const progress = ((current + (selected ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentQuestion?.color || "#FB923C";
    const roundGlow = currentQuestion?.glow || "rgba(251,146,60,0.7)";
    const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    // ── RESULT ──
    if (finished) {
        return (
            <div className="fl2-game-root fl2-result-container">
                <FoodBg color="#A78BFA" glow="rgba(167,139,250,0.7)" />
                {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
                <div className="fl2-result-card">
                    <div className="fl2-result-badge">Food &amp; Drink · Level 2 👁️</div>
                    <h2 className="fl2-result-title">¡Nivel terminado!</h2>
                    <div className="fl2-result-stars">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={`fl2-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                        ))}
                    </div>
                    <div className="fl2-result-stats">
                        <div className="fl2-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                        <div className="fl2-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                        <div className="fl2-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                        <div className="fl2-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                    </div>
                    {onFinish && (
                        <button className="fl2-result-btn" onClick={() => onFinish(score)}>
                            Continue ✏️
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ── GAME ──
    return (
        <div className="fl2-game-root">
            <FoodBg color={roundColor} glow={roundGlow} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            {/* Header bar */}
            <div className="fl2-header-bar">
                <div className="fl2-header-left">
                    <span className="fl2-header-badge">Level 2</span>
                    <span className="fl2-header-title">👁️ Reading</span>
                </div>
                <div className="fl2-header-right">
                    <div className="fl2-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="fl2-header-pill fl2-streak-pill">🔥 {streak}x</div>}
                    <div className="fl2-header-pill">🎯 {attempts}</div>
                    <div className="fl2-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="fl2-listen-container">
                <div className={`fl2-wrapper ${shake ? "fl2-shake" : ""} ${bounce ? "fl2-bounce" : ""}`}>

                    <div className="fl2-progress-track">
                        <div className="fl2-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#fff)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="fl2-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`fl2-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="fl2-instruction">👀 Look &amp; pick the right word!</p>

                    <div className="fl2-lives-container">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <span key={i} className={`fl2-heart ${i < lives ? "alive" : "lost"}`}>
                                {i < lives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>

                    {/* BIG EMOJI CARD */}
                    <div className="fl2-emoji-card"
                        style={{
                            borderColor: roundColor,
                            boxShadow: `0 0 0 5px rgba(255,255,255,0.08), 0 14px 40px rgba(0,0,0,0.5), 0 0 40px ${roundGlow}`
                        }}>
                        <span className="fl2-big-emoji">{currentQuestion.emoji}</span>
                    </div>

                    {/* 4 WORD OPTIONS */}
                    <div className="fl2-word-grid">
                        {shuffledOptions.map(opt => {
                            const isSelected = selected === opt.word;
                            const isCorrect = isSelected && opt.word === currentQuestion.word;
                            const isWrong = isSelected && opt.word !== currentQuestion.word;
                            const isWrongPrev = lives === 1 && opt.word === wrongSelected;
                            const isLocked = !!selected && !isSelected && lives <= 0;
                            const isRetryable = lives === 1;
                            // ✅ NUEVO: Reveal verde cuando se pierden vidas
                            const isReveal = revealCorrect && opt.word === currentQuestion.word;
                            const isWrongFinal = revealCorrect && opt.word === wrongSelected;

                            return (
                                <button
                                    key={opt.word}
                                    className={`fl2-word-card ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""} ${isWrongPrev ? "wrong-prev" : ""} ${isLocked ? "locked" : ""} ${isReveal ? "correct" : ""} ${(!selected && lives > 0) || isRetryable ? "hoverable" : ""}`}
                                    onClick={() => handleSelect(opt.word)}
                                    disabled={isLocked || revealCorrect}
                                    style={{ "--card-color": opt.color, "--card-glow": opt.glow }}
                                >
                                    <span className="fl2-word-text">{opt.word}</span>
                                    {isCorrect && <div className="fl2-card-badge fl2-correct-badge">✓</div>}
                                    {isWrong && <div className="fl2-card-badge fl2-wrong-badge">✗</div>}
                                    {isWrongPrev && !isSelected && <div className="fl2-card-badge fl2-wrong-badge">✗</div>}
                                    {isReveal && <div className="fl2-card-badge fl2-correct-badge">✓</div>}
                                    {isWrongFinal && <div className="fl2-card-badge fl2-wrong-badge">✗</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}