import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import "./Toyslevel3.css";
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
    // ⭐ teddy bear: niño escribe "teddy", "bear" aparece auto al completar
    { word: "teddy", bonusWord: "bear", image: teddyImg, audio: teddyAudio, color: "#D97706", glow: "rgba(217,119,6,0.7)" },
    { word: "robot", image: robotImg, audio: robotAudio, color: "#60A5FA", glow: "rgba(96,165,250,0.7)" },
];

const MAX_LIVES = 3;
const KEYBOARD_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
];

function getHintCount(word) {
    const len = word.length;
    if (len <= 3) return 1;
    if (len <= 5) return 2;
    return 3;
}

function getHintLetters(word) {
    return word.slice(0, getHintCount(word));
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function FloatingPoints({ points, id }) {
    return <div key={id} className={`tl3-floating-points ${points > 0 ? "pos" : "neg"}`}>
        {points > 0 ? `+${points}` : points}
    </div>;
}

const NEON_SIGNS = [
    { x: 720, y: 90, text: "WRITE!", color: "#A78BFA", glow: "rgba(167,139,250,0.9)", size: 56 },
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
        <svg className="tl3-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="tl3Sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFE4F1" />
                    <stop offset="40%" stopColor="#FFC8E0" />
                    <stop offset="100%" stopColor="#FFB3D1" />
                </linearGradient>
                <radialGradient id="tl3Glow" cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="tl3Shelf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#92400E" />
                    <stop offset="50%" stopColor="#B45309" />
                    <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="tl3Wood" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C2D12" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <linearGradient id="tl3Floor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#78350F" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#451A03" stopOpacity="0.7" />
                </linearGradient>
                <symbol id="tl3Star" viewBox="-10 -10 20 20">
                    <path d="M0,-10 L3,-3 L10,-3 L4,2 L6,9 L0,5 L-6,9 L-4,2 L-10,-3 L-3,-3 Z" fill="currentColor" />
                </symbol>
                <symbol id="tl3Heart" viewBox="-12 -12 24 24">
                    <path d="M0,8 C-12,-2 -10,-12 -4,-12 C-1,-12 0,-9 0,-7 C0,-9 1,-12 4,-12 C10,-12 12,-2 0,8 Z" fill="currentColor" />
                </symbol>
                <filter id="tl3NeonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <radialGradient id="tl3Vignette" cx="50%" cy="50%" r="75%">
                    <stop offset="60%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#831843" stopOpacity="0.35" />
                </radialGradient>
            </defs>

            <rect width="1440" height="900" fill="url(#tl3Sky)" />

            {Array.from({ length: 24 }, (_, i) => (
                <circle key={`pd${i}`}
                    cx={(i * 89 + 47) % 1440}
                    cy={(i * 137 + 71) % 900}
                    r="6" fill="#fff" opacity="0.15" />
            ))}

            <rect width="1440" height="900" fill="url(#tl3Glow)" />

            <rect y="780" width="1440" height="120" fill="url(#tl3Floor)" />
            {Array.from({ length: 8 }, (_, i) => (
                <line key={`fl${i}`}
                    x1={i * 180} y1="780" x2={i * 180} y2="900"
                    stroke="#451A03" strokeWidth="1.5" opacity="0.4" />
            ))}

            <g opacity="0.85">
                <rect x="40" y="430" width="1360" height="14" fill="url(#tl3Shelf)" rx="2" />
                <rect x="40" y="430" width="14" height="180" fill="url(#tl3Wood)" />
                <rect x="1386" y="430" width="14" height="180" fill="url(#tl3Wood)" />
                <rect x="40" y="610" width="1360" height="14" fill="url(#tl3Shelf)" rx="2" />
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
                <g key={`neon${i}`} filter="url(#tl3NeonGlow)">
                    <text
                        x={s.x} y={s.y}
                        fontSize={s.size}
                        fontFamily="Fredoka One, cursive"
                        fill={s.color}
                        textAnchor="middle"
                        style={{ animation: `tl3-neonFlicker 2.5s ease-in-out infinite alternate` }}
                    >
                        {s.text}
                    </text>
                </g>
            ))}

            {SPARKLES.map((s, i) => (
                <circle key={`sp${i}`}
                    cx={s.cx} cy={s.cy} r={s.r}
                    fill="#fff" opacity="0.85"
                    style={{ animation: `tl3-sparkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            {STAR_SIGNS.map((s, i) => (
                <use key={`star${i}`}
                    href="#tl3Star"
                    x={s.x} y={s.y}
                    width={s.size} height={s.size}
                    color={s.color}
                    style={{ animation: `tl3-starTwinkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            {HEART_DECOR.map((h, i) => (
                <use key={`heart${i}`}
                    href="#tl3Heart"
                    x={h.x} y={h.y}
                    width={h.size} height={h.size}
                    color={h.color}
                    style={{ animation: `tl3-heartFloat ${h.dur} ${h.delay} ease-in-out infinite alternate` }} />
            ))}

            {FLOATING_TOYS.map((t, i) => (
                <text key={`ft${i}`}
                    x={t.x} y={t.y}
                    fontSize={t.size}
                    style={{ animation: `tl3-toyFloat ${t.dur} ${t.delay} ease-in-out infinite alternate` }}>
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
                            style={{ animation: `tl3-bunting 2s ${i * 0.15}s ease-in-out infinite alternate` }}
                        />
                    );
                })}
                <path d="M 100,30 Q 720,55 1320,30" stroke="#92400E" strokeWidth="2" fill="none" opacity="0.6" />
            </g>

            <rect width="1440" height="900" fill="url(#tl3Vignette)" />

            <circle cx="40" cy="40" r="14" fill="#FCD34D" opacity="0.7"
                style={{ animation: `tl3-bulbBlink 1.5s ease-in-out infinite alternate` }} />
            <circle cx="1400" cy="40" r="14" fill="#FF6B9D" opacity="0.7"
                style={{ animation: `tl3-bulbBlink 1.5s 0.5s ease-in-out infinite alternate` }} />
            <circle cx="40" cy="860" r="14" fill="#06D6A0" opacity="0.7"
                style={{ animation: `tl3-bulbBlink 1.5s 1s ease-in-out infinite alternate` }} />
            <circle cx="1400" cy="860" r="14" fill="#A78BFA" opacity="0.7"
                style={{ animation: `tl3-bulbBlink 1.5s 0.7s ease-in-out infinite alternate` }} />
        </svg>
    );
});

export default function ToysLevel3({ onFinish }) {
    const [questions] = useState(() => shuffle([...TOYS]));
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
    const [typed, setTyped] = useState(() => getHintLetters(questions[0].word));
    const [wrongLetters, setWrongLetters] = useState([]);
    const [revealedFails, setRevealedFails] = useState([]);
    const [lives, setLives] = useState(MAX_LIVES);
    const [audioReady, setAudioReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [solved, setSolved] = useState(false);
    const [showRetryBanner, setShowRetryBanner] = useState(false);
    // ⭐ Estado para mostrar la palabra bonus (ej. "bear" tras completar "teddy")
    const [bonusVisible, setBonusVisible] = useState(false);

    const audioRefs = useRef({});
    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const mountedRef = useRef(true);
    const audioRef = useRef(null);
    const isProcessingRef = useRef(false);
    const perfectRef = useRef(0);
    const timeoutRef = useRef([]);

    const currentToy = questions[current];
    const currentWord = currentToy.word;
    const bonusWord = currentToy.bonusWord;  // ⭐ ej. "bear" para teddy
    const hintCount = getHintCount(currentWord);

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
        const roundWords = questions.map(q => q.word);
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

    // ⭐ FIX: garantiza que las pistas SIEMPRE se aplican al cambiar de ronda
    useEffect(() => {
        const expectedHint = getHintLetters(currentWord);
        if (typed.length === 0 || (typed.length < expectedHint.length && !solved)) {
            setTyped(expectedHint);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current]);

    useEffect(() => {
        if (audioReady && !finished && !solved) {
            const timer = setTimeout(() => {
                if (mountedRef.current && !hasPlayed) playAudio();
            }, 50);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, audioReady, finished]);

    const playAudio = useCallback(() => {
        const baseAudio = audioRefs.current[currentWord];
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

        baseAudio.play().catch(err => {
            console.error(err);
            if (mountedRef.current) setIsPlaying(false);
        });

        baseAudio.onended = () => {
            if (!mountedRef.current) return;
            setIsPlaying(false);
        };
    }, [currentWord]);

    const addFloatingPoints = (pts) => {
        const id = Date.now() + Math.random();
        setFloatingPoints(prev => [...prev, { pts, id }]);
        setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
    };

    const triggerNext = useCallback((currentIndex) => {
        isProcessingRef.current = false;
        if (currentIndex < questions.length - 1) {
            const next = currentIndex + 1;
            const nextWord = questions[next].word;
            setCurrent(next);
            setHasPlayed(false);
            setSolved(false);
            setErrorsThisRound(0);
            setLives(MAX_LIVES);
            setTyped(getHintLetters(nextWord));
            setWrongLetters([]);
            setRevealedFails([]);
            setShowRetryBanner(false);
            setBonusVisible(false);  // ⭐ resetear bonus
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

    const handleKeyPress = useCallback((letter) => {
        if (solved || finished) return;
        if (!correctRef.current || !wrongRef.current) return;
        if (isProcessingRef.current) return;

        const nextIndex = typed.length;
        const expectedLetter = currentWord[nextIndex];

        if (letter === expectedLetter) {
            const newTyped = typed + letter;
            setTyped(newTyped);
            setWrongLetters([]);

            const isWordComplete = newTyped === currentWord;

            if (!isWordComplete) {
                correctRef.current.cloneNode().play().catch(() => { });
            } else {
                isProcessingRef.current = true;
                setSolved(true);
                setAnswers(prev => ({ ...prev, [currentWord]: true }));
                correctRef.current.cloneNode().play().catch(() => { });
                setAttempts(a => a + 1);

                let bonus = 30;
                if (errorsThisRound === 0) {
                    bonus = 50;
                    perfectRef.current += 1;
                    const newStreak = streak + 1;
                    setStreak(newStreak);
                    if (newStreak > bestStreak) setBestStreak(newStreak);
                } else {
                    setStreak(0);
                }
                setTotalPoints(p => p + bonus);
                addFloatingPoints(bonus);

                // ⭐ Si tiene bonusWord, mostrarla con delay para que se vea aparecer
                const hasBonus = !!bonusWord;
                if (hasBonus) {
                    const tBonus = setTimeout(() => {
                        if (mountedRef.current) setBonusVisible(true);
                    }, 250);
                    timeoutRef.current.push(tBonus);
                }

                confetti({
                    particleCount: 130, spread: 110, origin: { y: 0.5 },
                    colors: [currentToy.color, "#FCD34D", "#fff", "#FF6B9D", "#06D6A0", "#A78BFA"]
                });

                const t1 = setTimeout(() => {
                    if (mountedRef.current) playAudio();
                }, 500);
                timeoutRef.current.push(t1);

                setBounce(true);
                const t2 = setTimeout(() => setBounce(false), 600);
                timeoutRef.current.push(t2);

                // ⭐ Si tiene bonusWord, esperar más tiempo para que vea "teddy bear" completo
                const nextDelay = hasBonus ? 4000 : 2600;
                const t3 = setTimeout(() => {
                    if (mountedRef.current) triggerNext(current);
                }, nextDelay);
                timeoutRef.current.push(t3);
            }
        } else {
            wrongRef.current.cloneNode().play().catch(() => { });
            setWrongLetters(prev => prev.includes(letter) ? prev : [...prev, letter]);
            setShake(true);
            const tShake = setTimeout(() => setShake(false), 500);
            timeoutRef.current.push(tShake);
            setErrorsThisRound(e => e + 1);
            setStreak(0);

            const newLives = lives - 1;
            setLives(newLives);

            if (newLives <= 0) {
                isProcessingRef.current = true;
                setSolved(true);
                setShowRetryBanner(false);
                setAnswers(prev => ({ ...prev, [currentWord]: false }));
                setAttempts(a => a + 1);

                const remainingIndices = [];
                for (let i = typed.length; i < currentWord.length; i++) {
                    remainingIndices.push(i);
                }
                setRevealedFails(remainingIndices);

                const tAudio = setTimeout(() => {
                    if (mountedRef.current) playAudio();
                }, 500);
                timeoutRef.current.push(tAudio);

                const tNext = setTimeout(() => {
                    if (mountedRef.current) triggerNext(current);
                }, 2800);
                timeoutRef.current.push(tNext);
            } else {
                setShowRetryBanner(true);
                const tHide = setTimeout(() => {
                    if (mountedRef.current) setShowRetryBanner(false);
                }, 1500);
                timeoutRef.current.push(tHide);

                const tReplay = setTimeout(() => {
                    if (mountedRef.current) playAudio();
                }, 600);
                timeoutRef.current.push(tReplay);
            }
        }
    }, [solved, finished, typed, currentWord, currentToy, bonusWord, errorsThisRound, streak, bestStreak, lives, current, triggerNext, playAudio]);

    useEffect(() => {
        const onKey = (e) => {
            if (solved || finished) return;
            const key = e.key.toLowerCase();
            if (/^[a-z]$/.test(key)) handleKeyPress(key);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleKeyPress, solved, finished]);

    const score = questions.reduce((acc, q) => (answers[q.word] === true ? acc + 1 : acc), 0);
    const progress = ((current + (solved ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentToy?.color || "#FF6B9D";
    const roundGlow = currentToy?.glow || "rgba(255,107,157,0.7)";
    const unitStars = perfectRef.current >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="tl3-game-root tl3-result-container">
            <ToysBg color="#A78BFA" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="tl3-result-card">
                <div className="tl3-result-emoji">🏆</div>
                <div className="tl3-result-badge">🧸 Toys · Level 3 ✏️</div>
                <h2 className="tl3-result-title">¡Eres un crack escribiendo!</h2>
                <div className="tl3-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`tl3-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="tl3-result-stats">
                    <div className="tl3-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                    <div className="tl3-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="tl3-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="tl3-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="tl3-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="tl3-result-btn" onClick={() => onFinish(score)}>
                        Finalizar 🎉
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="tl3-game-root">
            <ToysBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="tl3-header-bar">
                <div className="tl3-header-left">
                    <span className="tl3-header-badge">Level 3</span>
                    <span className="tl3-header-title">✏️ Writing</span>
                </div>
                <div className="tl3-header-right">
                    <div className="tl3-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="tl3-header-pill tl3-streak-pill">🔥 {streak}x</div>}
                    <div className="tl3-header-pill">🎯 {attempts}</div>
                    <div className="tl3-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="tl3-write-container">
                <div className={`tl3-wrapper ${shake ? "tl3-shake" : ""} ${bounce ? "tl3-bounce" : ""}`}>

                    <div className="tl3-progress-track">
                        <div className="tl3-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#FCD34D)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="tl3-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`tl3-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="tl3-instruction">✏️ Listen and write the toy's name!</p>

                    <div className="tl3-main-row">

                        <div className="tl3-toy-mini"
                            style={{
                                "--toy-color": roundColor,
                                "--toy-glow": roundGlow
                            }}>
                            <img src={currentToy.image} alt="toy" className="tl3-toy-mini-img" />
                        </div>

                        <div className="tl3-controls-col">
                            <div className="tl3-play-row">
                                <button
                                    className={`tl3-play-btn ${isPlaying ? "playing" : ""}`}
                                    onClick={playAudio}
                                    disabled={isPlaying || solved}
                                    style={{
                                        background: `linear-gradient(135deg, ${roundColor}, #FCD34D)`,
                                        boxShadow: `0 14px 40px ${roundGlow}, 0 0 32px ${roundGlow}`
                                    }}
                                    aria-label="Reproducir audio"
                                >
                                    <span className="tl3-play-icon">{isPlaying ? "🔊" : "▶"}</span>
                                    <span className="tl3-play-text">{isPlaying ? "Listen…" : "Play"}</span>
                                </button>

                                <div className="tl3-lives-container">
                                    {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                        <span key={i} className={`tl3-heart ${i < lives ? "alive" : "lost"}`}>
                                            {i < lives ? "❤️" : "🖤"}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Slots de letras (con pistas + bonusWord opcional) */}
                            <div className="tl3-slots">
                                {/* Slots de la palabra principal (ej. teddy) */}
                                {currentWord.split("").map((letter, i) => {
                                    const isFilled = i < typed.length;
                                    const isHint = i < hintCount;
                                    const isFail = revealedFails.includes(i);
                                    return (
                                        <div key={`main-${i}`}
                                            className={`tl3-slot ${isFilled ? "filled" : ""} ${isHint ? "hint" : ""} ${isFail ? "fail" : ""}`}
                                            style={isFilled ? {
                                                "--slot-color": roundColor,
                                                "--slot-glow": roundGlow
                                            } : {}}>
                                            {isFilled ? typed[i] : (isFail ? letter : "")}
                                        </div>
                                    );
                                })}

                                {/* ⭐ Slots de bonusWord (ej. bear) — aparecen al completar */}
                                {bonusWord && (
                                    <>
                                        <div className="tl3-bonus-gap"></div>
                                        {bonusWord.split("").map((letter, i) => (
                                            <div key={`bonus-${i}`}
                                                className="tl3-slot filled hint">
                                                {letter}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="tl3-banner-slot">
                                {showRetryBanner && (
                                    <div className="tl3-retry-banner">❌ ¡Casi! ✏️ Inténtalo de nuevo</div>
                                )}
                                {revealedFails.length > 0 && (
                                    <div className="tl3-retry-banner found">
                                        ✨ Era "{currentWord}{bonusWord ? ` ${bonusWord}` : ""}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="tl3-keyboard">
                        {KEYBOARD_ROWS.map((row, ri) => (
                            <div key={ri} className="tl3-keyboard-row">
                                {row.map(letter => {
                                    const isWrong = wrongLetters.includes(letter);
                                    return (
                                        <button
                                            key={letter}
                                            className={`tl3-key ${isWrong ? "wrong" : ""}`}
                                            onClick={() => handleKeyPress(letter)}
                                            disabled={solved || finished}
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
        </div>
    );
}