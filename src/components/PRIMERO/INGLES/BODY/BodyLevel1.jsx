import React, { useState, useEffect, useRef, memo } from "react";
import "./Bodylevel1.css";
import confetti from "canvas-confetti";

import headAudio from "../../../../assets/sounds/head.mp3";
import eyeAudio from "../../../../assets/sounds/eye.mp3";
import earAudio from "../../../../assets/sounds/ear.mp3";
import noseAudio from "../../../../assets/sounds/nose.mp3";
import mouthAudio from "../../../../assets/sounds/mouth.mp3";
import handAudio from "../../../../assets/sounds/hand.mp3";
import footAudio from "../../../../assets/sounds/foot.mp3";
import legAudio from "../../../../assets/sounds/leg.mp3";
import armAudio from "../../../../assets/sounds/arm.mp3";
import neckAudio from "../../../../assets/sounds/neck.mp3";

import headImg from "../../../../assets/head.png";
import eyeImg from "../../../../assets/eye.png";
import earImg from "../../../../assets/ear.png";
import noseImg from "../../../../assets/nose.png";
import mouthImg from "../../../../assets/mouth.png";
import handImg from "../../../../assets/hand.png";
import footImg from "../../../../assets/foot.png";
import legImg from "../../../../assets/leg.png";
import armImg from "../../../../assets/arm.png";
import neckImg from "../../../../assets/neck.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const BODY_PARTS = [
    { word: "head", image: headImg, audio: headAudio, color: "#DC2626", glow: "rgba(220,38,38,0.7)" },
    { word: "eye", image: eyeImg, audio: eyeAudio, color: "#2563EB", glow: "rgba(37,99,235,0.7)" },
    { word: "ear", image: earImg, audio: earAudio, color: "#7C3AED", glow: "rgba(124,58,237,0.7)" },
    { word: "nose", image: noseImg, audio: noseAudio, color: "#EA580C", glow: "rgba(234,88,12,0.7)" },
    { word: "mouth", image: mouthImg, audio: mouthAudio, color: "#BE185D", glow: "rgba(190,24,93,0.7)" },
    { word: "hand", image: handImg, audio: handAudio, color: "#CA8A04", glow: "rgba(202,138,4,0.7)" },
    { word: "foot", image: footImg, audio: footAudio, color: "#047857", glow: "rgba(4,120,87,0.7)" },
    { word: "leg", image: legImg, audio: legAudio, color: "#0891B2", glow: "rgba(8,145,178,0.7)" },
    { word: "arm", image: armImg, audio: armAudio, color: "#DB2777", glow: "rgba(219,39,119,0.7)" },
    { word: "neck", image: neckImg, audio: neckAudio, color: "#65A30D", glow: "rgba(101,163,13,0.7)" },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...BODY_PARTS]);
}

function genOptions(correctPart) {
    const wrongs = shuffle(BODY_PARTS.filter(p => p.word !== correctPart.word)).slice(0, 3);
    return shuffle([correctPart, ...wrongs]);
}

function FloatingPoints({ points, id }) {
    return <div key={id} className="bl1-floating-points">+{points}</div>;
}

const MAGNIFIERS = [
    { x: 120, y: 180, size: 60, rot: -18, delay: "0s", dur: "5s" },
    { x: 1290, y: 140, size: 70, rot: 22, delay: "1s", dur: "6s" },
    { x: 180, y: 650, size: 55, rot: -25, delay: "0.8s", dur: "4.5s" },
    { x: 1240, y: 680, size: 62, rot: 20, delay: "0.3s", dur: "5.5s" },
    { x: 720, y: 120, size: 40, rot: 5, delay: "1.2s", dur: "7s" },
];

const FINGERPRINTS = [
    { x: 280, y: 720, size: 42, rot: -15, opacity: 0.18 },
    { x: 1150, y: 780, size: 38, rot: 12, opacity: 0.16 },
    { x: 580, y: 250, size: 30, rot: 8, opacity: 0.14 },
    { x: 1050, y: 300, size: 34, rot: -10, opacity: 0.16 },
    { x: 80, y: 440, size: 36, rot: 20, opacity: 0.15 },
];

const QUESTIONS = [
    { x: 420, y: 180, size: 32, rot: -12, color: "#DC2626", delay: "0s", dur: "4s" },
    { x: 980, y: 200, size: 36, rot: 15, color: "#2563EB", delay: "1.5s", dur: "5s" },
    { x: 350, y: 560, size: 28, rot: 8, color: "#CA8A04", delay: "0.7s", dur: "4.5s" },
    { x: 1080, y: 540, size: 30, rot: -20, color: "#7C3AED", delay: "2s", dur: "5.5s" },
];

const INK_BLOBS = Array.from({ length: 8 }, (_, i) => ({
    cx: (i * 583 + 117) % 1440,
    cy: (i * 341 + 93) % 900,
    r: 18 + (i % 3) * 8,
    rot: (i * 47) % 360,
}));

const BodyBg = memo(function BodyBg({ color }) {
    return (
        <svg className="bl1-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="bl1Parchment" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="50%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
                <radialGradient id="bl1Glow" cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <pattern id="bl1Spots" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="40" r="3" fill="#92400E" opacity="0.10" />
                    <circle cx="80" cy="90" r="2" fill="#92400E" opacity="0.08" />
                    <circle cx="100" cy="20" r="1.5" fill="#92400E" opacity="0.12" />
                    <circle cx="15" cy="100" r="2.5" fill="#92400E" opacity="0.10" />
                    <circle cx="60" cy="70" r="1.5" fill="#92400E" opacity="0.08" />
                </pattern>
                <radialGradient id="bl1Lens" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.25" />
                </radialGradient>
                <radialGradient id="bl1Vignette" cx="50%" cy="50%" r="75%">
                    <stop offset="60%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#92400E" stopOpacity="0.3" />
                </radialGradient>
            </defs>

            <rect width="1440" height="900" fill="url(#bl1Parchment)" />
            <rect width="1440" height="900" fill="url(#bl1Spots)" />

            {INK_BLOBS.map((b, i) => (
                <g key={`ink${i}`} transform={`translate(${b.cx},${b.cy}) rotate(${b.rot})`}>
                    <ellipse cx="0" cy="0" rx={b.r} ry={b.r * 0.7} fill="#78350F" opacity="0.10" />
                    <ellipse cx="4" cy="-2" rx={b.r * 0.6} ry={b.r * 0.45} fill="#78350F" opacity="0.06" />
                </g>
            ))}

            {Array.from({ length: 11 }, (_, i) => (
                <line key={`line${i}`}
                    x1="80" y1={80 + i * 80}
                    x2="1360" y2={80 + i * 80}
                    stroke="#92400E" strokeWidth="0.6" opacity="0.1"
                    strokeDasharray="4 8" />
            ))}

            <rect width="1440" height="900" fill="url(#bl1Glow)" />

            {QUESTIONS.map((q, i) => (
                <text key={`q${i}`}
                    x={q.x} y={q.y}
                    fontSize={q.size * 2}
                    fontFamily="Fredoka One, cursive"
                    fill={q.color}
                    opacity="0.3"
                    transform={`rotate(${q.rot} ${q.x} ${q.y})`}
                    style={{ animation: `bl1-qFloat ${q.dur} ${q.delay} ease-in-out infinite alternate` }}>
                    ?
                </text>
            ))}

            {FINGERPRINTS.map((f, i) => (
                <g key={`fp${i}`} transform={`translate(${f.x},${f.y}) rotate(${f.rot})`} opacity={f.opacity}>
                    {[0, 1, 2, 3, 4].map(ring => (
                        <ellipse key={ring}
                            cx="0" cy="0"
                            rx={f.size * 0.3 + ring * 6}
                            ry={f.size * 0.38 + ring * 6}
                            fill="none" stroke="#78350F" strokeWidth="1.8" />
                    ))}
                </g>
            ))}

            {MAGNIFIERS.map((m, i) => (
                <g key={`mag${i}`}
                    transform={`translate(${m.x},${m.y}) rotate(${m.rot})`}
                    style={{ animation: `bl1-lupaFloat ${m.dur} ${m.delay} ease-in-out infinite alternate` }}>
                    <rect x={m.size * 0.7} y={-m.size * 0.12} width={m.size * 0.65} height={m.size * 0.24} rx={m.size * 0.12} fill="#78350F" opacity="0.85" />
                    <rect x={m.size * 0.72} y={-m.size * 0.09} width={m.size * 0.6} height={m.size * 0.08} rx={m.size * 0.04} fill="#D97706" opacity="0.7" />
                    <circle cx="0" cy="0" r={m.size * 0.85} fill="#78350F" opacity="0.85" />
                    <circle cx="0" cy="0" r={m.size * 0.72} fill="#FBBF24" opacity="0.75" />
                    <circle cx="0" cy="0" r={m.size * 0.62} fill="url(#bl1Lens)" opacity="0.95" />
                    <ellipse cx={-m.size * 0.2} cy={-m.size * 0.25} rx={m.size * 0.2} ry={m.size * 0.12}
                        fill="#fff" opacity="0.7" transform={`rotate(-30 ${-m.size * 0.2} ${-m.size * 0.25})`} />
                </g>
            ))}

            <rect width="1440" height="900" fill="url(#bl1Vignette)" />

            <polygon points="0,0 60,0 0,60" fill="#D97706" opacity="0.25" />
            <polygon points="1440,0 1380,0 1440,60" fill="#D97706" opacity="0.25" />
            <polygon points="0,900 60,900 0,840" fill="#D97706" opacity="0.25" />
            <polygon points="1440,900 1380,900 1440,840" fill="#D97706" opacity="0.25" />
        </svg>
    );
});

export default function BodyLevel1({ onFinish }) {
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
        const roundWords = questions.map(q => q.word);
        const audiosToLoad = BODY_PARTS.filter(p => roundWords.includes(p.word));

        audiosToLoad.forEach(p => {
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

    const playAudio = () => {
        const baseAudio = audioRefs.current[currentQuestion.word];
        if (!baseAudio) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        audioRef.current = baseAudio;
        baseAudio.currentTime = 0;
        baseAudio.volume = 1;

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
                    colors: [currentQuestion.color, "#FBBF24", "#fff", "#DC2626"]
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
    const roundColor = currentQuestion?.color || "#DC2626";
    const roundGlow = currentQuestion?.glow || "rgba(220,38,38,0.7)";
    const unitStars = score >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="bl1-game-root bl1-result-container">
            <BodyBg color="#DC2626" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="bl1-result-card">
                <div className="bl1-result-emoji">🔍</div>
                <div className="bl1-result-badge">Parts of the Body · Level 1 🎧</div>
                <h2 className="bl1-result-title">¡Nivel terminado!</h2>
                <div className="bl1-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`bl1-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="bl1-result-stats">
                    <div className="bl1-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                    <div className="bl1-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="bl1-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="bl1-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="bl1-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="bl1-result-btn" onClick={() => onFinish(score)}>
                        Continue 👁️
                    </button>
                )}
            </div>
        </div>
    );

    const showRetryBanner = lives === 1 && wrongSelected && !selected;
    const showFailedBanner = revealCorrect;

    return (
        <div className="bl1-game-root">
            <BodyBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="bl1-header-bar">
                <div className="bl1-header-left">
                    <span className="bl1-header-badge">Level 1</span>
                    <span className="bl1-header-title">🎧 Listening</span>
                </div>
                <div className="bl1-header-right">
                    <div className="bl1-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="bl1-header-pill bl1-streak-pill">🔥 {streak}x</div>}
                    <div className="bl1-header-pill">🎯 {attempts}</div>
                    <div className="bl1-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="bl1-listen-container">
                <div className={`bl1-wrapper ${shake ? "bl1-shake" : ""} ${bounce ? "bl1-bounce" : ""}`}>

                    <div className="bl1-progress-track">
                        <div className="bl1-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#FBBF24)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="bl1-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`bl1-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="bl1-instruction">🕵️ Detective time! Listen and pick the body part!</p>

                    {/* ✅ NUEVO: Botón Play + Vidas en la MISMA fila */}
                    <div className="bl1-play-row">
                        <button
                            className={`bl1-play-btn ${isPlaying ? "playing" : ""}`}
                            onClick={playAudio}
                            disabled={isPlaying}
                            style={{ "--round-color": roundColor, "--round-glow": roundGlow }}
                        >
                            {isPlaying ? (
                                <><span className="bl1-wave-bars"><span /><span /><span /><span /><span /></span>Playing…</>
                            ) : (
                                <>🔊 {playCount > 0 ? "Play Again" : "Play Audio"}</>
                            )}
                        </button>

                        <div className="bl1-lives-container">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <span key={i} className={`bl1-heart ${i < lives ? "alive" : "lost"}`}>
                                    {i < lives ? "❤️" : "🖤"}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bl1-banner-slot">
                        {showRetryBanner && (
                            <div className="bl1-retry-banner">❌ ¡Incorrecto! 🔎 Escucha de nuevo e intenta otra vez</div>
                        )}
                        {showFailedBanner && (
                            <div className="bl1-retry-banner failed">😔 ¡Inténtalo de nuevo! Escucha la respuesta correcta</div>
                        )}
                    </div>

                    <div className="bl1-images-grid">
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
                                    className={`bl1-image-card
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
                                    <div className="bl1-card-inner">
                                        <div className="bl1-card-img-wrap">
                                            <img src={opt.image} alt={opt.word} className="bl1-card-img" />
                                        </div>
                                        <div className="bl1-card-label">{opt.word}</div>
                                        {isCorrect && <div className="bl1-card-badge bl1-correct-badge">✓</div>}
                                        {isWrong && <div className="bl1-card-badge bl1-wrong-badge">✗</div>}
                                        {isWrongPrev && !isSelected && <div className="bl1-card-badge bl1-wrong-badge">✗</div>}
                                        {isReveal && <div className="bl1-card-badge bl1-correct-badge">✓</div>}
                                        {isWrongFinal && <div className="bl1-card-badge bl1-wrong-badge">✗</div>}
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