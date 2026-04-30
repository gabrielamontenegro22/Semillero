import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import "./Toyslevel2.css";
import confetti from "canvas-confetti";

import ballAudio from "../../../../assets/sounds/ball.mp3";
import dollAudio from "../../../../assets/sounds/doll.mp3";
import carAudio from "../../../../assets/sounds/car.mp3";
import puzzleAudio from "../../../../assets/sounds/puzzle.mp3";
import bikeAudio from "../../../../assets/sounds/bike.mp3";
import kiteAudio from "../../../../assets/sounds/kite.mp3";
import teddyAudio from "../../../../assets/sounds/teddy.mp3";
import robotAudio from "../../../../assets/sounds/robot.mp3";

import ballImg from "../../../../assets/ball.png";
import dollImg from "../../../../assets/doll.png";
import carImg from "../../../../assets/car.png";
import puzzleImg from "../../../../assets/puzzles.png";
import bikeImg from "../../../../assets/bike.png";
import kiteImg from "../../../../assets/kite.png";
import teddyImg from "../../../../assets/teddy.png";
import robotImg from "../../../../assets/robot.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const TOYS = [
    { word: "ball", image: ballImg, audio: ballAudio, color: "#FF6B9D", glow: "rgba(255,107,157,0.7)" },
    { word: "doll", image: dollImg, audio: dollAudio, color: "#F472B6", glow: "rgba(244,114,182,0.7)" },
    { word: "car", image: carImg, audio: carAudio, color: "#DC2626", glow: "rgba(220,38,38,0.7)" },
    { word: "puzzle", image: puzzleImg, audio: puzzleAudio, color: "#A78BFA", glow: "rgba(167,139,250,0.7)" },
    { word: "bike", image: bikeImg, audio: bikeAudio, color: "#06D6A0", glow: "rgba(6,214,160,0.7)" },
    { word: "kite", image: kiteImg, audio: kiteAudio, color: "#FBBF24", glow: "rgba(251,191,36,0.7)" },
    { word: "teddy bear", image: teddyImg, audio: teddyAudio, color: "#D97706", glow: "rgba(217,119,6,0.7)" },
    { word: "robot", image: robotImg, audio: robotAudio, color: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
];

const NUM_OPTIONS = 4;
const MAX_LIVES = 2;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...TOYS]).map(correct => {
        const wrongs = shuffle(TOYS.filter(t => t.word !== correct.word)).slice(0, NUM_OPTIONS - 1);
        const options = shuffle([correct, ...wrongs]);
        return { correct, options };
    });
}

function FloatingPoints({ points, id }) {
    return <div key={id} className={`tl2-floating-points ${points > 0 ? "pos" : "neg"}`}>
        {points > 0 ? `+${points}` : points}
    </div>;
}

// ── DECORACIONES (mismas que L1, pero NEON dice "GUESS!") ──
const NEON_SIGNS = [
    { x: 720, y: 90, text: "GUESS!", color: "#06D6A0", glow: "rgba(6,214,160,0.9)", size: 56 },
];

const STAR_SIGNS = [
    { x: 220, y: 130, color: "#FCD34D", size: 36, delay: "0s", dur: "2.5s" },
    { x: 1240, y: 110, color: "#06D6A0", size: 40, delay: "0.6s", dur: "3s" },
    { x: 380, y: 70, color: "#A78BFA", size: 32, delay: "1.2s", dur: "2.8s" },
    { x: 1080, y: 80, color: "#F472B6", size: 30, delay: "0.3s", dur: "3.2s" },
];

const HEART_DECOR = [
    { x: 130, y: 720, size: 28, color: "#FF6B9D", delay: "0s", dur: "4s" },
    { x: 1320, y: 690, size: 32, color: "#F472B6", delay: "1s", dur: "4.5s" },
    { x: 80, y: 480, size: 24, color: "#FBBF24", delay: "0.5s", dur: "3.8s" },
    { x: 1370, y: 440, size: 26, color: "#06D6A0", delay: "1.5s", dur: "4.2s" },
];

const FLOATING_TOYS = [
    { x: 100, y: 250, emoji: "🎈", size: 36, delay: "0s", dur: "5s" },
    { x: 1340, y: 230, emoji: "⭐", size: 32, delay: "1.2s", dur: "5.5s" },
    { x: 200, y: 580, emoji: "🎁", size: 30, delay: "2s", dur: "4.5s" },
    { x: 1280, y: 560, emoji: "🌟", size: 34, delay: "0.7s", dur: "5.2s" },
];

const SPARKLES = Array.from({ length: 18 }, (_, i) => ({
    cx: (i * 311 + 73) % 1440,
    cy: (i * 167 + 53) % 900,
    r: 2 + (i % 3) * 1.2,
    delay: `${(i * 0.31) % 4}s`,
    dur: `${1.8 + (i % 3) * 0.6}s`,
}));

const ToysBg = memo(function ToysBg({ color }) {
    return (
        <svg className="tl2-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="tl2Sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFE4F1" />
                    <stop offset="40%" stopColor="#FFC8E0" />
                    <stop offset="100%" stopColor="#FFB3D1" />
                </linearGradient>
                <radialGradient id="tl2Glow" cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="tl2Shelf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#92400E" />
                    <stop offset="50%" stopColor="#B45309" />
                    <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="tl2Wood" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C2D12" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <linearGradient id="tl2Floor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#78350F" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#451A03" stopOpacity="0.7" />
                </linearGradient>
                <symbol id="tl2Star" viewBox="-10 -10 20 20">
                    <path d="M0,-10 L3,-3 L10,-3 L4,2 L6,9 L0,5 L-6,9 L-4,2 L-10,-3 L-3,-3 Z" fill="currentColor" />
                </symbol>
                <symbol id="tl2Heart" viewBox="-12 -12 24 24">
                    <path d="M0,8 C-12,-2 -10,-12 -4,-12 C-1,-12 0,-9 0,-7 C0,-9 1,-12 4,-12 C10,-12 12,-2 0,8 Z" fill="currentColor" />
                </symbol>
                <filter id="tl2NeonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <radialGradient id="tl2Vignette" cx="50%" cy="50%" r="75%">
                    <stop offset="60%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#831843" stopOpacity="0.35" />
                </radialGradient>
            </defs>

            <rect width="1440" height="900" fill="url(#tl2Sky)" />

            {Array.from({ length: 24 }, (_, i) => (
                <circle key={`pd${i}`}
                    cx={(i * 89 + 47) % 1440}
                    cy={(i * 137 + 71) % 900}
                    r="6" fill="#fff" opacity="0.15" />
            ))}

            <rect width="1440" height="900" fill="url(#tl2Glow)" />

            <rect y="780" width="1440" height="120" fill="url(#tl2Floor)" />
            {Array.from({ length: 8 }, (_, i) => (
                <line key={`fl${i}`}
                    x1={i * 180} y1="780" x2={i * 180} y2="900"
                    stroke="#451A03" strokeWidth="1.5" opacity="0.4" />
            ))}

            <g opacity="0.85">
                <rect x="40" y="430" width="1360" height="14" fill="url(#tl2Shelf)" rx="2" />
                <rect x="40" y="430" width="14" height="180" fill="url(#tl2Wood)" />
                <rect x="1386" y="430" width="14" height="180" fill="url(#tl2Wood)" />
                <rect x="40" y="610" width="1360" height="14" fill="url(#tl2Shelf)" rx="2" />
            </g>

            <g opacity="0.65">
                <rect x="120" y="380" width="50" height="50" fill="#FF6B9D" />
                <rect x="118" y="376" width="54" height="6" fill="#FCD34D" />
                <rect x="142" y="376" width="6" height="54" fill="#FCD34D" />
                <rect x="1240" y="380" width="55" height="50" fill="#A78BFA" />
                <rect x="1238" y="376" width="59" height="6" fill="#06D6A0" />
                <rect x="1265" y="376" width="6" height="54" fill="#06D6A0" />
                <rect x="170" y="558" width="55" height="52" fill="#FBBF24" />
                <rect x="168" y="554" width="59" height="6" fill="#FF6B9D" />
                <rect x="195" y="554" width="6" height="56" fill="#FF6B9D" />
                <rect x="1180" y="556" width="60" height="54" fill="#06D6A0" />
                <rect x="1178" y="552" width="64" height="6" fill="#FF6B9D" />
                <rect x="1208" y="552" width="6" height="58" fill="#FF6B9D" />
            </g>

            {NEON_SIGNS.map((s, i) => (
                <g key={`neon${i}`} filter="url(#tl2NeonGlow)">
                    <text
                        x={s.x} y={s.y}
                        fontSize={s.size}
                        fontFamily="Fredoka One, cursive"
                        fill={s.color}
                        textAnchor="middle"
                        style={{ animation: `tl2-neonFlicker 2.5s ease-in-out infinite alternate` }}
                    >
                        {s.text}
                    </text>
                </g>
            ))}

            {SPARKLES.map((s, i) => (
                <circle key={`sp${i}`}
                    cx={s.cx} cy={s.cy} r={s.r}
                    fill="#fff" opacity="0.85"
                    style={{ animation: `tl2-sparkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            {STAR_SIGNS.map((s, i) => (
                <use key={`star${i}`}
                    href="#tl2Star"
                    x={s.x} y={s.y}
                    width={s.size} height={s.size}
                    color={s.color}
                    style={{ animation: `tl2-starTwinkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            {HEART_DECOR.map((h, i) => (
                <use key={`heart${i}`}
                    href="#tl2Heart"
                    x={h.x} y={h.y}
                    width={h.size} height={h.size}
                    color={h.color}
                    style={{ animation: `tl2-heartFloat ${h.dur} ${h.delay} ease-in-out infinite alternate` }} />
            ))}

            {FLOATING_TOYS.map((t, i) => (
                <text key={`ft${i}`}
                    x={t.x} y={t.y}
                    fontSize={t.size}
                    style={{ animation: `tl2-toyFloat ${t.dur} ${t.delay} ease-in-out infinite alternate` }}>
                    {t.emoji}
                </text>
            ))}

            <g opacity="0.85">
                {Array.from({ length: 12 }, (_, i) => {
                    const x = 100 + i * 110;
                    const y = 30;
                    const colors = ["#FF6B9D", "#FCD34D", "#06D6A0", "#A78BFA", "#F472B6"];
                    const c = colors[i % colors.length];
                    return (
                        <polygon key={`bunting${i}`}
                            points={`${x},${y} ${x + 30},${y} ${x + 15},${y + 30}`}
                            fill={c}
                            stroke="#FFF" strokeWidth="1.5"
                            style={{ animation: `tl2-bunting 2s ${i * 0.15}s ease-in-out infinite alternate` }}
                        />
                    );
                })}
                <path d="M 100,30 Q 720,55 1320,30" stroke="#92400E" strokeWidth="2" fill="none" opacity="0.6" />
            </g>

            <rect width="1440" height="900" fill="url(#tl2Vignette)" />

            <circle cx="40" cy="40" r="14" fill="#FCD34D" opacity="0.7"
                style={{ animation: `tl2-bulbBlink 1.5s ease-in-out infinite alternate` }} />
            <circle cx="1400" cy="40" r="14" fill="#FF6B9D" opacity="0.7"
                style={{ animation: `tl2-bulbBlink 1.5s 0.5s ease-in-out infinite alternate` }} />
            <circle cx="40" cy="860" r="14" fill="#06D6A0" opacity="0.7"
                style={{ animation: `tl2-bulbBlink 1.5s 1s ease-in-out infinite alternate` }} />
            <circle cx="1400" cy="860" r="14" fill="#A78BFA" opacity="0.7"
                style={{ animation: `tl2-bulbBlink 1.5s 0.7s ease-in-out infinite alternate` }} />
        </svg>
    );
});

export default function ToysLevel2({ onFinish }) {
    const [questions] = useState(() => genRounds());
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [finished, setFinished] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [errorsThisRound, setErrorsThisRound] = useState(0);
    const [floatingPoints, setFloatingPoints] = useState([]);
    const [shake, setShake] = useState(false);
    const [bounce, setBounce] = useState(false);
    const [wrongPill, setWrongPill] = useState(null);
    const [correctPill, setCorrectPill] = useState(null);
    const [revealedPill, setRevealedPill] = useState(null);
    const [lives, setLives] = useState(MAX_LIVES);
    const [audioReady, setAudioReady] = useState(false);
    const [solved, setSolved] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [showRetryBanner, setShowRetryBanner] = useState(false);

    const audioRefs = useRef({});
    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const mountedRef = useRef(true);
    const audioRef = useRef(null);
    const isProcessingRef = useRef(false);
    const perfectRef = useRef(0);
    const timeoutRef = useRef([]);

    const currentQuestion = questions[current];
    const currentToy = currentQuestion.correct;

    useEffect(() => {
        mountedRef.current = true;
        const timeouts = timeoutRef.current;
        return () => {
            mountedRef.current = false;
            confetti.reset();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            timeouts.forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        const roundWords = questions.map(q => q.correct.word);
        const audiosToLoad = TOYS.filter(t => roundWords.includes(t.word));

        audiosToLoad.forEach(t => {
            const a = new Audio(t.audio);
            a.preload = "auto";
            a.load();
            audioRefs.current[t.word] = a;
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
        setRevealed(false);
        const t = setTimeout(() => setRevealed(true), 100);
        return () => clearTimeout(t);
    }, [current]);

    // Reproduce el audio del juguete (solo para refuerzo: al acertar o al perder vidas)
    const playToyAudio = useCallback(() => {
        const baseAudio = audioRefs.current[currentToy.word];
        if (!baseAudio) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        audioRef.current = baseAudio;
        baseAudio.currentTime = 0;
        baseAudio.volume = 1;
        baseAudio.play().catch(() => { });
    }, [currentToy.word]);

    const addFloatingPoints = (pts) => {
        const id = Date.now() + Math.random();
        setFloatingPoints(prev => [...prev, { pts, id }]);
        setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
    };

    const triggerNext = useCallback((currentIndex) => {
        isProcessingRef.current = false;
        if (currentIndex < questions.length - 1) {
            const next = currentIndex + 1;
            setCurrent(next);
            setSolved(false);
            setErrorsThisRound(0);
            setLives(MAX_LIVES);
            setWrongPill(null);
            setCorrectPill(null);
            setRevealedPill(null);
            setShowRetryBanner(false);
        } else {
            setFinished(true);
            const end = Date.now() + 3000;
            const frame = () => {
                if (!mountedRef.current) return;
                confetti({ particleCount: 16, angle: 60, spread: 80, origin: { x: 0 }, colors: ["#FF6B9D", "#FCD34D", "#06D6A0", "#A78BFA"] });
                confetti({ particleCount: 16, angle: 120, spread: 80, origin: { x: 1 }, colors: ["#FF6B9D", "#FCD34D", "#06D6A0", "#A78BFA"] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, [questions]);

    const handleSelect = useCallback((option) => {
        if (solved || finished) return;
        if (!correctRef.current || !wrongRef.current) return;
        if (isProcessingRef.current) return;

        if (option.word === currentToy.word) {
            // ✅ Correcta
            isProcessingRef.current = true;
            setSolved(true);
            setCorrectPill(option.word);
            setAnswers(prev => ({ ...prev, [currentToy.word]: true }));
            correctRef.current.cloneNode().play().catch(() => { });
            setAttempts(a => a + 1);

            let bonus = 12;
            if (errorsThisRound === 0) {
                bonus = 25;
                perfectRef.current += 1;
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > bestStreak) setBestStreak(newStreak);
            } else {
                setStreak(0);
            }
            setTotalPoints(p => p + bonus);
            addFloatingPoints(bonus);

            confetti({
                particleCount: 110, spread: 110, origin: { y: 0.5 },
                colors: [currentToy.color, "#FCD34D", "#fff", "#FF6B9D", "#06D6A0"]
            });

            // Audio refuerzo del juguete (oye cómo se dice)
            const t1 = setTimeout(() => {
                if (mountedRef.current) playToyAudio();
            }, 500);
            timeoutRef.current.push(t1);

            setBounce(true);
            const t2 = setTimeout(() => setBounce(false), 600);
            timeoutRef.current.push(t2);

            const t3 = setTimeout(() => {
                if (mountedRef.current) triggerNext(current);
            }, 2400);
            timeoutRef.current.push(t3);
        } else {
            // ❌ Incorrecta
            isProcessingRef.current = true;

            wrongRef.current.cloneNode().play().catch(() => { });
            setWrongPill(option.word);
            setShake(true);
            const tShake = setTimeout(() => setShake(false), 500);
            const tWrongPill = setTimeout(() => setWrongPill(null), 700);
            timeoutRef.current.push(tShake, tWrongPill);
            setErrorsThisRound(e => e + 1);
            setStreak(0);

            const newLives = lives - 1;
            setLives(newLives);

            if (newLives <= 0) {
                // Reveal verde + audio del correcto
                setSolved(true);
                setRevealedPill(currentToy.word);
                setShowRetryBanner(false);
                setAnswers(prev => ({ ...prev, [currentToy.word]: false }));
                setAttempts(a => a + 1);

                const tAudio = setTimeout(() => {
                    if (mountedRef.current) playToyAudio();
                }, 400);
                timeoutRef.current.push(tAudio);

                const tNext = setTimeout(() => {
                    if (mountedRef.current) triggerNext(current);
                }, 2400);
                timeoutRef.current.push(tNext);
            } else {
                // Banner flotante + cooldown
                setShowRetryBanner(true);
                const tHide = setTimeout(() => {
                    if (mountedRef.current) setShowRetryBanner(false);
                }, 1500);
                timeoutRef.current.push(tHide);

                const tUnlock = setTimeout(() => {
                    if (mountedRef.current) isProcessingRef.current = false;
                }, 700);
                timeoutRef.current.push(tUnlock);
            }
        }
    }, [solved, finished, currentToy, errorsThisRound, streak, bestStreak, lives, current, triggerNext, playToyAudio]);

    const score = questions.reduce((acc, q) => (answers[q.correct.word] === true ? acc + 1 : acc), 0);
    const progress = ((current + (solved ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentToy?.color || "#FF6B9D";
    const roundGlow = currentToy?.glow || "rgba(255,107,157,0.7)";
    const unitStars = perfectRef.current >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="tl2-game-root tl2-result-container">
            <ToysBg color="#FF6B9D" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="tl2-result-card">
                <div className="tl2-result-emoji">🏆</div>
                <div className="tl2-result-badge">🧸 Toys · Level 2 👁️</div>
                <h2 className="tl2-result-title">¡Buena vista!</h2>
                <div className="tl2-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`tl2-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="tl2-result-stats">
                    <div className="tl2-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                    <div className="tl2-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="tl2-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="tl2-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="tl2-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="tl2-result-btn" onClick={() => onFinish(score)}>
                        Finalizar 🎉
                    </button>
                )}
            </div>
        </div>
    );

    // ✅ audioReady silencia el unused warning (sin usar audio inicial pero precarga)
    void audioReady;

    return (
        <div className="tl2-game-root">
            <ToysBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            {/* Banner flotante (no empuja layout) */}
            {showRetryBanner && (
                <div className="tl2-retry-banner-floating">❌ ¡Casi! 👀 Mira de nuevo</div>
            )}

            <div className="tl2-header-bar">
                <div className="tl2-header-left">
                    <span className="tl2-header-badge">Level 2</span>
                    <span className="tl2-header-title">👁️ Reading</span>
                </div>
                <div className="tl2-header-right">
                    <div className="tl2-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="tl2-header-pill tl2-streak-pill">🔥 {streak}x</div>}
                    <div className="tl2-header-pill">🎯 {attempts}</div>
                    <div className="tl2-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="tl2-read-container">
                <div className={`tl2-wrapper ${shake ? "tl2-shake" : ""} ${bounce ? "tl2-bounce" : ""}`}>

                    <div className="tl2-progress-track">
                        <div className="tl2-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#FCD34D)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="tl2-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`tl2-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="tl2-instruction">👀 Look at the toy and pick the right word!</p>

                    {/* IMAGEN GIGANTE + LIVES */}
                    <div className="tl2-toy-display-row">
                        <div className={`tl2-toy-display ${revealed ? "revealed" : ""}`}
                            style={{
                                "--display-color": roundColor,
                                "--display-glow": roundGlow,
                            }}>
                            <img src={currentToy.image} alt="toy" className="tl2-toy-display-img" />
                        </div>

                        <div className="tl2-lives-container">
                            {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                <span key={i} className={`tl2-heart ${i < lives ? "alive" : "lost"}`}>
                                    {i < lives ? "❤️" : "🖤"}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* OPTIONS — PILLS DE PALABRAS GRANDES */}
                    <div className="tl2-options-grid">
                        {currentQuestion.options.map((option, i) => {
                            const isCorrect = correctPill === option.word;
                            const isWrong = wrongPill === option.word;
                            const isReveal = revealedPill === option.word;
                            return (
                                <button
                                    key={`${option.word}-${i}`}
                                    className={`tl2-word-pill
                                        ${isCorrect ? "correct" : ""}
                                        ${isWrong ? "wrong" : ""}
                                        ${isReveal ? "reveal-correct" : ""}
                                    `}
                                    onClick={() => handleSelect(option)}
                                    disabled={solved || finished}
                                    style={{
                                        "--pill-color": option.color,
                                        "--pill-glow": option.glow
                                    }}
                                >
                                    {option.word}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}