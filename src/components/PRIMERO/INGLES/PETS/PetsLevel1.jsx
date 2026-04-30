import React, { useState, useEffect, useRef, memo } from "react";
import "./Petslevel1.css";
import confetti from "canvas-confetti";

import dogAudio from "../../../../assets/sounds/dog.mp3";
import catAudio from "../../../../assets/sounds/cat.mp3";
import fishAudio from "../../../../assets/sounds/fish.mp3";
import birdAudio from "../../../../assets/sounds/bird.mp3";
import rabbitAudio from "../../../../assets/sounds/rabbit.mp3";
import hamsterAudio from "../../../../assets/sounds/hamster.mp3";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── PETS DATA ──
const PETS = [
    { word: "dog", emoji: "🐶", audio: dogAudio, color: "#D97706", glow: "rgba(217,119,6,0.7)" },
    { word: "cat", emoji: "🐱", audio: catAudio, color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { word: "fish", emoji: "🐟", audio: fishAudio, color: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
    { word: "bird", emoji: "🐦", audio: birdAudio, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { word: "rabbit", emoji: "🐰", audio: rabbitAudio, color: "#F9A8D4", glow: "rgba(249,168,212,0.7)" },
    { word: "hamster", emoji: "🐹", audio: hamsterAudio, color: "#FCD34D", glow: "rgba(252,211,77,0.7)" },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    const base = shuffle([...PETS]);
    const extra = shuffle([...PETS]).slice(0, 2);
    return shuffle([...base, ...extra]);
}

function genOptions(correctPet) {
    const wrongs = shuffle(PETS.filter(p => p.word !== correctPet.word)).slice(0, 3);
    return shuffle([correctPet, ...wrongs]);
}

function FloatingPoints({ points, id }) {
    return <div key={id} className="pl1-floating-points">+{points}</div>;
}

// ── Pre-computed data (never re-calculated on render) ──
const STARS = Array.from({ length: 35 }, (_, i) => ({
    cx: (i * 487 + 113) % 1440,
    cy: (i * 317 + 79) % 600,
    r: 0.7 + (i % 3) * 0.6,
    delay: `${(i * 0.37) % 4}s`,
    dur: `${1.8 + (i % 5) * 0.5}s`,
}));

const PAWS = [
    { x: 220, y: 680, r: 15, scale: 1.0, delay: "0s", dur: "3s" },
    { x: 420, y: 720, r: 13, scale: 0.85, delay: "1.2s", dur: "3.5s" },
    { x: 780, y: 700, r: 16, scale: 1.1, delay: "0.6s", dur: "4s" },
    { x: 1050, y: 690, r: 14, scale: 0.9, delay: "2s", dur: "3.2s" },
    { x: 1280, y: 710, r: 12, scale: 0.8, delay: "1.5s", dur: "2.8s" },
    { x: 540, y: 745, r: 11, scale: 0.75, delay: "0.9s", dur: "3.8s" },
];

const FIREFLIES = [
    { cx: 180, cy: 620, delay: "0s", dur: "2.2s" },
    { cx: 340, cy: 550, delay: "0.7s", dur: "3s" },
    { cx: 560, cy: 640, delay: "1.4s", dur: "2.5s" },
    { cx: 720, cy: 580, delay: "0.3s", dur: "2.8s" },
    { cx: 890, cy: 610, delay: "1.1s", dur: "2.1s" },
    { cx: 1060, cy: 560, delay: "0.5s", dur: "3.2s" },
    { cx: 1230, cy: 600, delay: "1.8s", dur: "2.6s" },
    { cx: 440, cy: 500, delay: "0.9s", dur: "2.9s" },
    { cx: 980, cy: 530, delay: "1.6s", dur: "2.3s" },
    { cx: 1380, cy: 570, delay: "0.2s", dur: "3.5s" },
];

// ── ANIMAL FOREST NIGHT BACKGROUND (memoised) ──
const PetsBg = memo(function PetsBg({ color }) {
    return (
        <svg className="pl1-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="pl1SkyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#050d1a" />
                    <stop offset="45%" stopColor="#0a1a14" />
                    <stop offset="100%" stopColor="#0d2210" />
                </linearGradient>
                <radialGradient id="pl1GlowGrad" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pl1MoonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fffde7" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#fff9c4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#fff9c4" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pl1FfGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ccff66" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ccff66" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Sky */}
            <rect width="1440" height="900" fill="url(#pl1SkyGrad)" />
            <rect width="1440" height="900" fill="url(#pl1GlowGrad)" />

            {/* Stars */}
            {STARS.map((s, i) => (
                <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff"
                    style={{ animation: `pl1-twinkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            {/* Moon */}
            <circle cx="1160" cy="110" r="72" fill="url(#pl1MoonGlow)" opacity="0.9" />
            <circle cx="1160" cy="110" r="52" fill="#fffde7" opacity="0.92" />
            <circle cx="1140" cy="98" r="9" fill="#f0e68c" opacity="0.55" />
            <circle cx="1174" cy="122" r="6" fill="#f0e68c" opacity="0.45" />
            <circle cx="1152" cy="128" r="4" fill="#f0e68c" opacity="0.4" />

            {/* Trees — left */}
            <rect x="28" y="460" width="18" height="320" fill="#071a0a" />
            <ellipse cx="37" cy="440" rx="58" ry="135" fill="#071a0a" />
            <ellipse cx="37" cy="365" rx="42" ry="105" fill="#08200c" />
            <rect x="100" y="510" width="14" height="270" fill="#061508" />
            <ellipse cx="107" cy="490" rx="44" ry="105" fill="#061508" />
            <ellipse cx="107" cy="430" rx="32" ry="78" fill="#072010" />
            <rect x="-12" y="400" width="24" height="380" fill="#050f06" />
            <ellipse cx="0" cy="375" rx="68" ry="150" fill="#050f06" />
            <ellipse cx="0" cy="295" rx="50" ry="115" fill="#071a0a" />

            {/* Trees — right */}
            <rect x="1400" y="450" width="18" height="330" fill="#071a0a" />
            <ellipse cx="1409" cy="430" rx="58" ry="135" fill="#071a0a" />
            <ellipse cx="1409" cy="355" rx="42" ry="105" fill="#08200c" />
            <rect x="1320" y="500" width="14" height="280" fill="#061508" />
            <ellipse cx="1327" cy="480" rx="44" ry="105" fill="#061508" />
            <ellipse cx="1327" cy="420" rx="32" ry="78" fill="#072010" />
            <rect x="1442" y="390" width="24" height="390" fill="#050f06" />
            <ellipse cx="1454" cy="365" rx="68" ry="150" fill="#050f06" />

            {/* Grass layer */}
            <path d="M0,820 Q60,760 120,820 Q180,760 240,820 Q300,760 360,820 Q420,760 480,820 Q540,760 600,820 Q660,760 720,820 Q780,760 840,820 Q900,760 960,820 Q1020,760 1080,820 Q1140,760 1200,820 Q1260,760 1320,820 Q1380,760 1440,820 L1440,900 L0,900 Z"
                fill="#062410" />
            <path d="M0,846 Q36,826 72,846 Q108,826 144,846 Q216,826 288,846 Q360,826 432,846 Q504,826 576,846 Q648,826 720,846 Q792,826 864,846 Q936,826 1008,846 Q1080,826 1152,846 Q1224,826 1296,846 Q1368,826 1440,846 L1440,900 L0,900 Z"
                fill="#083316" opacity="0.7" />

            {/* Paw prints */}
            {PAWS.map((p, i) => (
                <g key={i} transform={`translate(${p.x},${p.y}) scale(${p.scale})`}
                    style={{ animation: `pl1-pawFloat ${p.dur} ${p.delay} ease-in-out infinite alternate` }}
                    opacity="0.35">
                    <ellipse cx="0" cy="0" rx={p.r} ry={p.r * 0.85} fill={color} />
                    <circle cx={-p.r * 0.9} cy={-p.r * 0.95} r={p.r * 0.42} fill={color} />
                    <circle cx={-p.r * 0.3} cy={-p.r * 1.25} r={p.r * 0.42} fill={color} />
                    <circle cx={p.r * 0.3} cy={-p.r * 1.25} r={p.r * 0.42} fill={color} />
                    <circle cx={p.r * 0.9} cy={-p.r * 0.95} r={p.r * 0.42} fill={color} />
                </g>
            ))}

            {/* Fireflies */}
            {FIREFLIES.map((f, i) => (
                <g key={i} style={{ animation: `pl1-firefly ${f.dur} ${f.delay} ease-in-out infinite alternate` }}>
                    <circle cx={f.cx} cy={f.cy} r="10" fill="url(#pl1FfGlow)" opacity="0.6" />
                    <circle cx={f.cx} cy={f.cy} r="3" fill="#ccff66" />
                </g>
            ))}

            {/* Bushes */}
            <ellipse cx="160" cy="832" rx="92" ry="36" fill="#052e0a" opacity="0.9" />
            <ellipse cx="460" cy="847" rx="76" ry="28" fill="#052e0a" opacity="0.85" />
            <ellipse cx="760" cy="837" rx="102" ry="33" fill="#062812" opacity="0.9" />
            <ellipse cx="1050" cy="842" rx="82" ry="31" fill="#052e0a" opacity="0.85" />
            <ellipse cx="1320" cy="832" rx="92" ry="34" fill="#052e0a" opacity="0.9" />
        </svg>
    );
});

export default function PetsLevel1({ onFinish }) {
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
    // ✅ FIX A: audioReady inicia en FALSE hasta que estén precargados
    const [audioReady, setAudioReady] = useState(false);
    const [revealCorrect, setRevealCorrect] = useState(false);

    const isProcessingRef = useRef(false);
    const audioRefs = useRef({});
    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const mountedRef = useRef(true);
    // ✅ FIX C: audioRef central para rastrear el audio activo
    const audioRef = useRef(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            confetti.reset();
            // ✅ FIX B: Cleanup de audio al desmontar
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        // ✅ Precargar TODOS los audios
        PETS.forEach(p => {
            const a = new Audio(p.audio);
            a.preload = "auto";
            a.load();
            audioRefs.current[p.word] = a;
        });
        const c = new Audio(correctoSound);
        const w = new Audio(incorrectoSound);
        c.preload = "auto"; w.preload = "auto";
        c.load(); w.load();
        correctRef.current = c;
        wrongRef.current = w;
        // ✅ Solo entonces marcamos como listo
        setAudioReady(true);
    }, []);

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

    // ✅ FIX C: Reproductor robusto con audioRef central
    const playAudio = () => {
        const baseAudio = audioRefs.current[currentQuestion.word];
        if (!baseAudio) return;

        // Detener audio anterior (si lo hay)
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Asignar nuevo audio activo
        audioRef.current = baseAudio;
        baseAudio.currentTime = 0;
        baseAudio.volume = 1;

        baseAudio.play().then(() => {
            if (!mountedRef.current) return;
            setIsPlaying(true);
            setHasPlayed(true);
            setPlayCount(c => c + 1);
        }).catch(err => {
            console.error(err);
            setIsPlaying(false);
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

    const handleSelect = (word) => {
        if (!hasPlayed) return;
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
            setWrongSelected(word);
            setShake(true); setTimeout(() => setShake(false), 500);

            const remaining = lives - 1;
            setLives(remaining);

            if (remaining <= 0) {
                // Reveal verde + audio del correcto
                setSelected(null);
                setWrongSelected(word);
                setRevealCorrect(true);
                setAnswers(prev => ({ ...prev, [currentQuestion.word]: word }));
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

    const score = questions.reduce((acc, q) => (answers[q.word] === q.word ? acc + 1 : acc), 0);
    const progress = ((current + (selected ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentQuestion?.color || "#FB923C";
    const roundGlow = currentQuestion?.glow || "rgba(251,146,60,0.7)";
    const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="pl1-game-root pl1-result-container">
            <PetsBg color="#A78BFA" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="pl1-result-card">
                <div className="pl1-result-emoji">🐾</div>
                <div className="pl1-result-badge">Animals &amp; Pets · Level 1 🎧</div>
                <h2 className="pl1-result-title">¡Nivel terminado!</h2>
                <div className="pl1-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`pl1-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="pl1-result-stats">
                    <div className="pl1-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                    <div className="pl1-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="pl1-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="pl1-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="pl1-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="pl1-result-btn" onClick={() => onFinish(score)}>
                        Continue 👁️
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="pl1-game-root">
            <PetsBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="pl1-header-bar">
                <div className="pl1-header-left">
                    <span className="pl1-header-badge">Level 1</span>
                    <span className="pl1-header-title">🎧 Listening</span>
                </div>
                <div className="pl1-header-right">
                    <div className="pl1-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="pl1-header-pill pl1-streak-pill">🔥 {streak}x</div>}
                    <div className="pl1-header-pill">🎯 {attempts}</div>
                    <div className="pl1-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="pl1-listen-container">
                <div className={`pl1-wrapper ${shake ? "pl1-shake" : ""} ${bounce ? "pl1-bounce" : ""}`}>

                    <div className="pl1-progress-track">
                        <div className="pl1-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#fff)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="pl1-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`pl1-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="pl1-instruction">👂 Listen and pick the right pet!</p>

                    <button
                        className={`pl1-play-btn ${isPlaying ? "playing" : ""}`}
                        onClick={playAudio}
                        disabled={isPlaying}
                        style={{ "--round-color": roundColor, "--round-glow": roundGlow }}
                    >
                        {isPlaying ? (
                            <><span className="pl1-wave-bars"><span /><span /><span /><span /><span /></span>Playing…</>
                        ) : (
                            <>🔊 {playCount > 0 ? "Play Again" : "Play Audio"}</>
                        )}
                    </button>

                    <div className="pl1-lives-container">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <span key={i} className={`pl1-heart ${i < lives ? "alive" : "lost"}`}>
                                {i < lives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>

                    {lives === 1 && wrongSelected && !selected && (
                        <div className="pl1-retry-banner">❌ ¡Incorrecto! 🎧 Escucha de nuevo e intenta otra vez</div>
                    )}
                    {revealCorrect && (
                        <div className="pl1-retry-banner failed">😔 ¡Inténtalo de nuevo! Escucha la respuesta correcta</div>
                    )}

                    <div className="pl1-images-grid">
                        {shuffledOptions.map(opt => {
                            const isSelected = selected === opt.word;
                            const isCorrect = isSelected && opt.word === currentQuestion.word;
                            const isWrong = isSelected && opt.word !== currentQuestion.word;
                            const isWrongPrev = lives === 1 && opt.word === wrongSelected;
                            const isLocked = !!selected && !isSelected && lives <= 0;
                            const canClick = !selected && hasPlayed && lives > 0 && !isPlaying;
                            const canRetry = lives === 1 && hasPlayed && !isPlaying && !selected;
                            const isReveal = revealCorrect && opt.word === currentQuestion.word;
                            const isWrongFinal = revealCorrect && opt.word === wrongSelected;
                            return (
                                <div
                                    key={opt.word}
                                    className={`pl1-image-card
                                        ${isCorrect ? "correct" : ""}
                                        ${isWrong ? "wrong" : ""}
                                        ${isWrongPrev ? "wrong-prev" : ""}
                                        ${isLocked ? "locked" : ""}
                                        ${isReveal ? "correct" : ""}
                                        ${canClick || canRetry ? "hoverable" : ""}
                                    `}
                                    onClick={() => handleSelect(opt.word)}
                                    style={{ "--card-color": opt.color, "--card-glow": opt.glow }}
                                >
                                    <div className="pl1-card-inner">
                                        <div className="pl1-card-emoji">{opt.emoji}</div>
                                        <div className="pl1-card-label">{opt.word}</div>
                                        {isCorrect && <div className="pl1-card-badge pl1-correct-badge">✓</div>}
                                        {isWrong && <div className="pl1-card-badge pl1-wrong-badge">✗</div>}
                                        {isWrongPrev && !isSelected && <div className="pl1-card-badge pl1-wrong-badge">✗</div>}
                                        {isReveal && <div className="pl1-card-badge pl1-correct-badge">✓</div>}
                                        {isWrongFinal && <div className="pl1-card-badge pl1-wrong-badge">✗</div>}
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