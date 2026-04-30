import React, { useState, useEffect, useRef, memo } from "react";
import "./Petslevel2.css";
import confetti from "canvas-confetti";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── Real images — color + size match guaranteed ──
import imgDogBigBrown from "../../../../assets/images/pets/dog_big_brown.png";
import imgDogSmallWhite from "../../../../assets/images/pets/dog_small_white.png";
import imgCatBigBlack from "../../../../assets/images/pets/cat_big_black.png";
import imgCatSmallOrange from "../../../../assets/images/pets/cat_small_orange.png";
import imgFishBigBlue from "../../../../assets/images/pets/fish_big_blue.png";
import imgFishSmallYellow from "../../../../assets/images/pets/fish_small_yellow.png";
import imgBirdSmallYellow from "../../../../assets/images/pets/bird_small_yellow.png";
import imgBirdBigBlue from "../../../../assets/images/pets/bird_big_blue.png";
import imgRabbitSmallWhite from "../../../../assets/images/pets/rabbit_small_white.png";
import imgRabbitBigBrown from "../../../../assets/images/pets/rabbit_big_brown.png";
import imgHamsterSmallBrown from "../../../../assets/images/pets/hamster_small_brown.png";

// ── PETS_VARIANTS — each has a real matching image ──
const PETS_VARIANTS = [
    { id: "dog-big-brown", word: "dog", size: "big", color: "brown", img: imgDogBigBrown, colorHex: "#D97706", glow: "rgba(217,119,6,0.7)" },
    { id: "dog-small-white", word: "dog", size: "small", color: "white", img: imgDogSmallWhite, colorHex: "#6B7280", glow: "rgba(107,114,128,0.7)" },
    { id: "cat-big-black", word: "cat", size: "big", color: "black", img: imgCatBigBlack, colorHex: "#1F2937", glow: "rgba(31,41,55,0.7)" },
    { id: "cat-small-orange", word: "cat", size: "small", color: "orange", img: imgCatSmallOrange, colorHex: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { id: "fish-big-blue", word: "fish", size: "big", color: "blue", img: imgFishBigBlue, colorHex: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
    { id: "fish-small-yellow", word: "fish", size: "small", color: "yellow", img: imgFishSmallYellow, colorHex: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { id: "bird-small-yellow", word: "bird", size: "small", color: "yellow", img: imgBirdSmallYellow, colorHex: "#FDE047", glow: "rgba(253,224,71,0.7)" },
    { id: "bird-big-blue", word: "bird", size: "big", color: "blue", img: imgBirdBigBlue, colorHex: "#3B82F6", glow: "rgba(59,130,246,0.7)" },
    { id: "rabbit-small-white", word: "rabbit", size: "small", color: "white", img: imgRabbitSmallWhite, colorHex: "#F9A8D4", glow: "rgba(249,168,212,0.7)" },
    { id: "rabbit-big-brown", word: "rabbit", size: "big", color: "brown", img: imgRabbitBigBrown, colorHex: "#92400E", glow: "rgba(146,64,14,0.7)" },
    { id: "hamster-small-brown", word: "hamster", size: "small", color: "brown", img: imgHamsterSmallBrown, colorHex: "#FCD34D", glow: "rgba(252,211,77,0.7)" },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ✅ FIX: 8 rondas (consistencia con resto de la app)
function genRounds() {
    return shuffle([...PETS_VARIANTS]).slice(0, 8);
}

// 1 correct + 3 distractors (different word)
function genOptions(correctPet) {
    const wrongs = shuffle(
        PETS_VARIANTS.filter(p => p.word !== correctPet.word)
    ).slice(0, 3);
    return shuffle([correctPet, ...wrongs]);
}

function FloatingPoints({ points, id }) {
    return <div key={id} className="pl2-floating-points">+{points}</div>;
}

// ── Pre-computed background data ──
const CLOUDS = [
    { x: 100, y: 80, scale: 1, dur: "28s", delay: "0s" },
    { x: 450, y: 50, scale: 0.8, dur: "35s", delay: "-8s" },
    { x: 800, y: 90, scale: 1.1, dur: "32s", delay: "-15s" },
    { x: 1200, y: 60, scale: 0.9, dur: "30s", delay: "-22s" },
    { x: 250, y: 180, scale: 0.7, dur: "40s", delay: "-5s" },
    { x: 1000, y: 200, scale: 0.85, dur: "36s", delay: "-18s" },
];

const FLOWERS = [
    { x: 80, y: 820, color: "#F472B6", delay: "0s" },
    { x: 200, y: 850, color: "#FBBF24", delay: "0.5s" },
    { x: 320, y: 830, color: "#F87171", delay: "1s" },
    { x: 450, y: 860, color: "#A78BFA", delay: "0.3s" },
    { x: 580, y: 835, color: "#FB923C", delay: "1.3s" },
    { x: 720, y: 855, color: "#F472B6", delay: "0.8s" },
    { x: 860, y: 825, color: "#60A5FA", delay: "0.2s" },
    { x: 1000, y: 850, color: "#FBBF24", delay: "1.5s" },
    { x: 1130, y: 830, color: "#F87171", delay: "0.6s" },
    { x: 1260, y: 860, color: "#A78BFA", delay: "1.1s" },
    { x: 1360, y: 840, color: "#FB923C", delay: "0.4s" },
];

const PAWS_FLOAT = [
    { x: 180, y: 340, size: 46, rot: -15, delay: "0s", color: "#FFB6C1" },
    { x: 1260, y: 300, size: 52, rot: 20, delay: "0.8s", color: "#FFA07A" },
    { x: 380, y: 200, size: 40, rot: 10, delay: "1.4s", color: "#B8E6B8" },
    { x: 1100, y: 480, size: 44, rot: -25, delay: "0.5s", color: "#FFE082" },
    { x: 260, y: 560, size: 48, rot: 15, delay: "1.1s", color: "#CE93D8" },
    { x: 1320, y: 600, size: 42, rot: -10, delay: "0.2s", color: "#FFB6C1" },
];

const BUTTERFLIES = [
    { x: 150, y: 420, delay: "0s" },
    { x: 1180, y: 440, delay: "2s" },
];

const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

// ── MEADOW BACKGROUND (memoised) ──
const PetsBg = memo(function PetsBg() {
    return (
        <svg className="pl2-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="pl2-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#87CEEB" />
                    <stop offset="50%" stopColor="#B4E0F5" />
                    <stop offset="85%" stopColor="#D6F0C9" />
                    <stop offset="100%" stopColor="#8FCE6B" />
                </linearGradient>
                <linearGradient id="pl2-grass" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8FCE6B" />
                    <stop offset="100%" stopColor="#5DAA3E" />
                </linearGradient>
                <radialGradient id="pl2-sun" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF59D" stopOpacity="1" />
                    <stop offset="60%" stopColor="#FFD54F" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
                </radialGradient>
                <symbol id="pl2-cloud" viewBox="0 0 120 50">
                    <ellipse cx="30" cy="30" rx="25" ry="20" fill="#fff" />
                    <ellipse cx="55" cy="22" rx="28" ry="22" fill="#fff" />
                    <ellipse cx="85" cy="30" rx="25" ry="20" fill="#fff" />
                    <ellipse cx="60" cy="38" rx="38" ry="12" fill="#fff" />
                </symbol>
                <symbol id="pl2-paw" viewBox="0 0 40 40">
                    <ellipse cx="12" cy="10" rx="3.5" ry="5" />
                    <ellipse cx="20" cy="6" rx="3.5" ry="5" />
                    <ellipse cx="28" cy="10" rx="3.5" ry="5" />
                    <ellipse cx="34" cy="18" rx="3" ry="4" />
                    <ellipse cx="6" cy="18" rx="3" ry="4" />
                    <path d="M 20 16 C 12 16 8 22 8 28 C 8 34 13 38 20 38 C 27 38 32 34 32 28 C 32 22 28 16 20 16 Z" />
                </symbol>
                <symbol id="pl2-flower" viewBox="0 0 30 40">
                    <rect x="14" y="18" width="2" height="20" fill="#4A7C3A" />
                    <ellipse cx="10" cy="28" rx="4" ry="2" fill="#5DAA3E" transform="rotate(-30 10 28)" />
                    <ellipse cx="20" cy="25" rx="4" ry="2" fill="#5DAA3E" transform="rotate(30 20 25)" />
                    <circle cx="15" cy="10" r="4" className="pl2-petal" />
                    <circle cx="10" cy="13" r="4" className="pl2-petal" />
                    <circle cx="20" cy="13" r="4" className="pl2-petal" />
                    <circle cx="12" cy="18" r="4" className="pl2-petal" />
                    <circle cx="18" cy="18" r="4" className="pl2-petal" />
                    <circle cx="15" cy="15" r="3" fill="#FFD54F" />
                </symbol>
                <symbol id="pl2-butterfly" viewBox="0 0 40 30">
                    <ellipse cx="10" cy="10" rx="8" ry="9" fill="#F472B6" opacity="0.85" />
                    <ellipse cx="10" cy="22" rx="7" ry="7" fill="#F472B6" opacity="0.75" />
                    <ellipse cx="30" cy="10" rx="8" ry="9" fill="#C084FC" opacity="0.85" />
                    <ellipse cx="30" cy="22" rx="7" ry="7" fill="#C084FC" opacity="0.75" />
                    <rect x="19" y="8" width="2" height="18" rx="1" fill="#4B2E20" />
                </symbol>
            </defs>

            <rect width="1440" height="900" fill="url(#pl2-sky)" />

            {/* Sun */}
            <circle cx="1280" cy="140" r="70" fill="url(#pl2-sun)" />
            <circle cx="1280" cy="140" r="38" fill="#FFEB3B" opacity="0.9" />
            {SUN_RAYS.map(deg => (
                <line key={deg} x1="1280" y1="140"
                    x2={1280 + 60 * Math.cos((deg - 90) * Math.PI / 180)}
                    y2={140 + 60 * Math.sin((deg - 90) * Math.PI / 180)}
                    stroke="#FFEB3B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            ))}

            {/* Mountains */}
            <path d="M 0 620 L 180 480 L 320 550 L 480 440 L 640 520 L 800 450 L 980 540 L 1160 460 L 1320 520 L 1440 480 L 1440 700 L 0 700 Z" fill="#7FB5D6" opacity="0.55" />
            <path d="M 0 680 L 160 560 L 300 630 L 460 550 L 620 610 L 780 540 L 940 620 L 1100 560 L 1280 610 L 1440 570 L 1440 750 L 0 750 Z" fill="#A3C9E0" opacity="0.5" />

            {/* Grass */}
            <rect x="0" y="720" width="1440" height="180" fill="url(#pl2-grass)" />
            <ellipse cx="250" cy="740" rx="280" ry="60" fill="#7DBE56" opacity="0.7" />
            <ellipse cx="850" cy="745" rx="350" ry="65" fill="#7DBE56" opacity="0.7" />
            <ellipse cx="1350" cy="740" rx="220" ry="55" fill="#7DBE56" opacity="0.7" />

            {CLOUDS.map((c, i) => (
                <g key={i} style={{ animation: `pl2-cloudDrift ${c.dur} linear ${c.delay} infinite` }}>
                    <use href="#pl2-cloud" x={c.x} y={c.y} width={120 * c.scale} height={50 * c.scale} opacity="0.95"
                        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.08))" }} />
                </g>
            ))}

            {PAWS_FLOAT.map((p, i) => (
                <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}
                    style={{ animation: `pl2-pawFloat 5s ease-in-out ${p.delay} infinite alternate` }}>
                    <use href="#pl2-paw" width={p.size} height={p.size} x={-p.size / 2} y={-p.size / 2}
                        fill={p.color} opacity="0.5" />
                </g>
            ))}

            {BUTTERFLIES.map((b, i) => (
                <g key={i} style={{ animation: `pl2-butterfly 6s ease-in-out ${b.delay} infinite` }}>
                    <use href="#pl2-butterfly" x={b.x} y={b.y} width="40" height="30"
                        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
                </g>
            ))}

            {FLOWERS.map((f, i) => (
                <g key={i}
                    style={{ animation: `pl2-flowerSway 3s ease-in-out ${f.delay} infinite alternate`, transformOrigin: `${f.x + 15}px ${f.y + 40}px` }}>
                    <use href="#pl2-flower" x={f.x} y={f.y} width="30" height="40"
                        style={{ "--petal-color": f.color }} />
                </g>
            ))}

            <g transform="translate(520 320)" style={{ animation: "pl2-heartFloatBg 7s ease-in-out infinite" }}>
                <path d="M 0 0 C -5 -6, -15 -6, -15 3 C -15 10, 0 18, 0 18 C 0 18, 15 10, 15 3 C 15 -6, 5 -6, 0 0 Z" fill="#FF69B4" opacity="0.5" />
            </g>
            <g transform="translate(920 400)" style={{ animation: "pl2-heartFloatBg 8s ease-in-out 2s infinite" }}>
                <path d="M 0 0 C -5 -6, -15 -6, -15 3 C -15 10, 0 18, 0 18 C 0 18, 15 10, 15 3 C 15 -6, 5 -6, 0 0 Z" fill="#FFB6C1" opacity="0.5" />
            </g>
        </svg>
    );
});

export default function PetsLevel2({ onFinish }) {
    const [questions] = useState(() => genRounds());
    const [current, setCurrent] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState(() => genOptions(questions[0]));
    const [selected, setSelected] = useState(null);
    const [finished, setFinished] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [floatingPoints, setFloatingPoints] = useState([]);
    const [shake, setShake] = useState(false);
    const [bounce, setBounce] = useState(false);
    const [wrongSelected, setWrongSelected] = useState(null);
    const [lives, setLives] = useState(2);
    const [revealCorrect, setRevealCorrect] = useState(false);

    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const isProcessingRef = useRef(false);
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

    const handleSelect = (optId) => {
        if (!correctRef.current || !wrongRef.current) return;
        if (selected && lives <= 0) return;
        if (selected && optId === currentQuestion.id) return;

        if (isProcessingRef.current) return;

        isProcessingRef.current = true;

        const isCorrect = optId === currentQuestion.id;

        if (isCorrect) {
            setSelected(optId);
            correctRef.current.cloneNode().play().catch(() => { });
            setAttempts(a => a + 1);
            setCorrectCount(c => c + 1);

            if (lives === 2) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > bestStreak) setBestStreak(newStreak);
                const bonus = newStreak >= 3 ? 20 : newStreak >= 2 ? 15 : 10;
                setTotalPoints(p => p + bonus);
                addFloatingPoints(bonus);
                confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, colors: [currentQuestion.colorHex, "#FFD700", "#fff", "#FF6B9D"] });
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
            setWrongSelected(optId);
            setShake(true); setTimeout(() => setShake(false), 500);

            const remaining = lives - 1;
            setLives(remaining);

            if (remaining <= 0) {
                // Reveal verde de la imagen correcta
                setSelected(null);
                setWrongSelected(optId);
                setRevealCorrect(true);
                setAttempts(a => a + 1);
                setTimeout(() => {
                    if (mountedRef.current) {
                        triggerNext(current);
                    }
                    isProcessingRef.current = false;
                }, 2400);
            } else {
                // ✅ Unificado: liberar todo a 600ms en un solo setTimeout
                setTimeout(() => {
                    if (mountedRef.current) {
                        setSelected(null);
                        setShake(false);
                    }
                    // ← fuera del guard: si se desmonta, igual se libera el ref
                    isProcessingRef.current = false;
                }, 600);
            }
        }
    };

    const triggerNext = (currentIndex) => {
        if (!mountedRef.current) return;
        isProcessingRef.current = false;
        if (currentIndex < questions.length - 1) {
            const next = currentIndex + 1;
            setCurrent(next);
            setSelected(null);
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

    const progress = ((current + (selected ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentQuestion?.colorHex || "#FB923C";
    const roundGlow = currentQuestion?.glow || "rgba(251,146,60,0.7)";
    const unitStars = correctCount >= questions.length ? 3 : correctCount >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="pl2-game-root pl2-result-container">
            <PetsBg />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="pl2-result-card">
                <div className="pl2-result-emoji">🐾</div>
                <div className="pl2-result-badge">Animals &amp; Pets · Level 2 👁️</div>
                <h2 className="pl2-result-title">¡Nivel terminado!</h2>
                <div className="pl2-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`pl2-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="pl2-result-stats">
                    <div className="pl2-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{questions.length}</strong></div>
                    <div className="pl2-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="pl2-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="pl2-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="pl2-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="pl2-result-btn" onClick={() => onFinish(correctCount)}>
                        Continue ✏️
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="pl2-game-root">
            <PetsBg />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="pl2-header-bar">
                <div className="pl2-header-left">
                    <span className="pl2-header-badge">Level 2</span>
                    <span className="pl2-header-title">👁️ Reading</span>
                </div>
                <div className="pl2-header-right">
                    <div className="pl2-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="pl2-header-pill pl2-streak-pill">🔥 {streak}x</div>}
                    <div className="pl2-header-pill">🎯 {attempts}</div>
                    <div className="pl2-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="pl2-container">
                <div className={`pl2-wrapper ${shake ? "pl2-shake" : ""} ${bounce ? "pl2-bounce" : ""}`}>

                    {/* Progress */}
                    <div className="pl2-progress-track">
                        <div className="pl2-progress-fill"
                            style={{ width: `${progress}%`, background: `linear-gradient(90deg,${roundColor},#fff)`, boxShadow: `0 0 12px ${roundGlow}` }} />
                        <div className="pl2-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i}
                                    className={`pl2-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="pl2-instruction">👀 Read and find the right pet!</p>

                    {/* Description card — color + size + animal — now truthful! */}
                    <div className="pl2-description-card">
                        <div className="pl2-desc-corner pl2-desc-tl">📖</div>
                        <div className="pl2-desc-corner pl2-desc-tr">✨</div>
                        <div className="pl2-desc-text">
                            <span className="pl2-desc-article">a</span>{" "}
                            <span className="pl2-desc-size">{currentQuestion.size}</span>{" "}
                            <span className="pl2-desc-color" style={{ color: currentQuestion.colorHex }}>
                                {currentQuestion.color}
                            </span>{" "}
                            <span className="pl2-desc-animal">{currentQuestion.word}</span>
                        </div>
                    </div>

                    {/* Lives */}
                    <div className="pl2-lives-container">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <span key={i} className={`pl2-heart ${i < lives ? "alive" : "lost"}`}>
                                {i < lives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>

                    {/* Banner siempre ocupa el mismo espacio — evita que las tarjetas salten */}
                    <div className="pl2-banner-placeholder">
                        {lives === 1 && wrongSelected && !selected && (
                            <div className="pl2-retry-banner">❌ ¡Incorrecto! 👀 Lee de nuevo e intenta otra vez</div>
                        )}
                        {revealCorrect && (
                            <div className="pl2-retry-banner failed">😔 ¡Inténtalo de nuevo! Mira la respuesta correcta</div>
                        )}
                    </div>

                    {/* Options: real images! */}
                    <div className="pl2-options-grid">
                        {shuffledOptions.map(opt => {
                            const isSelected = selected === opt.id;
                            const isCorrect = isSelected && opt.id === currentQuestion.id;
                            const isWrong = isSelected && opt.id !== currentQuestion.id;
                            const isWrongPrev = lives === 1 && opt.id === wrongSelected;
                            const isLocked = !!selected && !isSelected && lives <= 0;
                            const canClick = !selected && lives > 0;
                            const canRetry = lives === 1 && !selected;
                            const isReveal = revealCorrect && opt.id === currentQuestion.id;
                            const isWrongFinal = revealCorrect && opt.id === wrongSelected;
                            return (
                                <div
                                    key={opt.id}
                                    className={`pl2-option-card
                                        ${isCorrect ? "correct" : ""}
                                        ${isWrong ? "wrong" : ""}
                                        ${isWrongPrev ? "wrong-prev" : ""}
                                        ${isLocked ? "locked" : ""}
                                        ${isReveal ? "correct" : ""}
                                        ${canClick || canRetry ? "hoverable" : ""}
                                    `}
                                    onClick={() => handleSelect(opt.id)}
                                    style={{ "--card-color": opt.colorHex, "--card-glow": opt.glow }}
                                >
                                    <div className="pl2-card-inner">
                                        <div className="pl2-size-badge">{opt.size}</div>
                                        {/* Real generated image */}
                                        <img
                                            src={opt.img}
                                            alt={`${opt.color} ${opt.word}`}
                                            className="pl2-card-img"
                                            draggable={false}
                                        />
                                        <div className="pl2-card-label">
                                            <span className="pl2-card-color" style={{ color: opt.colorHex }}>{opt.color}</span>
                                            {" "}
                                            <span className="pl2-card-word">{opt.word}</span>
                                        </div>
                                        {isCorrect && <div className="pl2-card-badge pl2-correct-badge">✓</div>}
                                        {isWrong && <div className="pl2-card-badge pl2-wrong-badge">✗</div>}
                                        {isWrongPrev && !isSelected && <div className="pl2-card-badge pl2-wrong-badge">✗</div>}
                                        {isReveal && <div className="pl2-card-badge pl2-correct-badge">✓</div>}
                                        {isWrongFinal && <div className="pl2-card-badge pl2-wrong-badge">✗</div>}
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