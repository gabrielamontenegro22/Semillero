import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import "./Bodylevel3.css";
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

// ── BODY DATA (10 partes) ──
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

const KEYBOARD_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...BODY_PARTS]);
}

function genHints(word) {
    const hints = new Set([0]);
    if (word.length >= 4) {
        const extras = [];
        for (let i = 1; i < word.length - 1; i++) extras.push(i);
        if (extras.length > 0) {
            hints.add(extras[Math.floor(Math.random() * extras.length)]);
        }
    }
    return hints;
}

function FloatingPoints({ points, id }) {
    return <div key={id} className={`bl3-floating-points ${points > 0 ? "pos" : "neg"}`}>
        {points > 0 ? `+${points}` : points}
    </div>;
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
        <svg className="bl3-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="bl3Parchment" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="50%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
                <radialGradient id="bl3Glow" cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <pattern id="bl3Spots" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="40" r="3" fill="#92400E" opacity="0.10" />
                    <circle cx="80" cy="90" r="2" fill="#92400E" opacity="0.08" />
                    <circle cx="100" cy="20" r="1.5" fill="#92400E" opacity="0.12" />
                    <circle cx="15" cy="100" r="2.5" fill="#92400E" opacity="0.10" />
                    <circle cx="60" cy="70" r="1.5" fill="#92400E" opacity="0.08" />
                </pattern>
                <radialGradient id="bl3Lens" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.25" />
                </radialGradient>
                <radialGradient id="bl3Vignette" cx="50%" cy="50%" r="75%">
                    <stop offset="60%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#92400E" stopOpacity="0.3" />
                </radialGradient>
            </defs>

            <rect width="1440" height="900" fill="url(#bl3Parchment)" />
            <rect width="1440" height="900" fill="url(#bl3Spots)" />

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

            <rect width="1440" height="900" fill="url(#bl3Glow)" />

            {QUESTIONS.map((q, i) => (
                <text key={`q${i}`}
                    x={q.x} y={q.y}
                    fontSize={q.size * 2}
                    fontFamily="Fredoka One, cursive"
                    fill={q.color}
                    opacity="0.3"
                    transform={`rotate(${q.rot} ${q.x} ${q.y})`}
                    style={{ animation: `bl3-qFloat ${q.dur} ${q.delay} ease-in-out infinite alternate` }}>
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
                    style={{ animation: `bl3-lupaFloat ${m.dur} ${m.delay} ease-in-out infinite alternate` }}>
                    <rect x={m.size * 0.7} y={-m.size * 0.12} width={m.size * 0.65} height={m.size * 0.24} rx={m.size * 0.12} fill="#78350F" opacity="0.85" />
                    <rect x={m.size * 0.72} y={-m.size * 0.09} width={m.size * 0.6} height={m.size * 0.08} rx={m.size * 0.04} fill="#D97706" opacity="0.7" />
                    <circle cx="0" cy="0" r={m.size * 0.85} fill="#78350F" opacity="0.85" />
                    <circle cx="0" cy="0" r={m.size * 0.72} fill="#FBBF24" opacity="0.75" />
                    <circle cx="0" cy="0" r={m.size * 0.62} fill="url(#bl3Lens)" opacity="0.95" />
                    <ellipse cx={-m.size * 0.2} cy={-m.size * 0.25} rx={m.size * 0.2} ry={m.size * 0.12}
                        fill="#fff" opacity="0.7" transform={`rotate(-30 ${-m.size * 0.2} ${-m.size * 0.25})`} />
                </g>
            ))}

            <rect width="1440" height="900" fill="url(#bl3Vignette)" />

            <polygon points="0,0 60,0 0,60" fill="#D97706" opacity="0.25" />
            <polygon points="1440,0 1380,0 1440,60" fill="#D97706" opacity="0.25" />
            <polygon points="0,900 60,900 0,840" fill="#D97706" opacity="0.25" />
            <polygon points="1440,900 1380,900 1440,840" fill="#D97706" opacity="0.25" />
        </svg>
    );
});

export default function BodyLevel3({ onFinish }) {
    const [questions] = useState(() => genRounds());
    const [current, setCurrent] = useState(0);
    const [hints, setHints] = useState(() => genHints(questions[0].word));
    const [typed, setTyped] = useState("");
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
    const [wrongKey, setWrongKey] = useState(null);
    const [lives, setLives] = useState(3);
    const [audioReady, setAudioReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [solved, setSolved] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [usedKeys, setUsedKeys] = useState(new Set());
    const [failed, setFailed] = useState(false);
    // ✅ NUEVO: estados para banners
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
    const currentWord = currentQuestion.word;

    useEffect(() => {
        let prefix = "";
        for (let i = 0; i < currentWord.length; i++) {
            if (hints.has(i)) {
                if (prefix.length === i) prefix += currentWord[i];
                else break;
            }
        }
        setTyped(prefix);
        setUsedKeys(new Set());
    }, [current, hints, currentWord]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            confetti.reset();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            timeoutRef.current.forEach(clearTimeout);
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
        setRevealed(false);
        const t = setTimeout(() => setRevealed(true), 100);
        return () => clearTimeout(t);
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
            setCurrent(next);
            setHints(genHints(questions[next].word));
            setHasPlayed(false);
            setSolved(false);
            setFailed(false);
            setShowRetryBanner(false); // ✅ Reset banner
            setErrorsThisRound(0);
            setLives(3);
            setWrongKey(null);
        } else {
            setFinished(true);
            const end = Date.now() + 3000;
            const frame = () => {
                if (!mountedRef.current) return;
                confetti({ particleCount: 16, angle: 60, spread: 80, origin: { x: 0 }, colors: ["#DC2626", "#FBBF24", "#D97706", "#047857"] });
                confetti({ particleCount: 16, angle: 120, spread: 80, origin: { x: 1 }, colors: ["#DC2626", "#FBBF24", "#D97706", "#047857"] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, [questions]);

    const handleSolved = useCallback((wordSolved) => {
        setSolved(true);
        setAnswers(prev => ({ ...prev, [wordSolved]: true }));
        setAttempts(a => a + 1);

        let bonus = 15;
        if (errorsThisRound === 0) {
            bonus = 30;
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
            particleCount: 120, spread: 120, origin: { y: 0.5 },
            colors: [currentQuestion.color, "#FBBF24", "#fff", "#DC2626", "#D97706"]
        });

        // ✅ Audio refuerzo de la palabra correcta
        const t1 = setTimeout(() => {
            if (mountedRef.current) playAudio();
        }, 500);
        timeoutRef.current.push(t1);

        setBounce(true);
        const t2 = setTimeout(() => setBounce(false), 600);
        timeoutRef.current.push(t2);

        const t3 = setTimeout(() => {
            if (mountedRef.current) triggerNext(current);
            isProcessingRef.current = false;
        }, 2400);
        timeoutRef.current.push(t3);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, errorsThisRound, streak, bestStreak, currentQuestion, triggerNext, playAudio]);

    const handleKey = useCallback((letter) => {
        if (solved || finished || failed) return;
        if (!correctRef.current || !wrongRef.current) return;
        if (isProcessingRef.current) return;

        const nextIndex = typed.length;
        if (nextIndex >= currentWord.length) return;

        const expected = currentWord[nextIndex];

        if (letter === expected) {
            // ✅ Correcta
            const newTyped = typed + letter;

            let i = newTyped.length;
            let merged = newTyped;
            while (i < currentWord.length && hints.has(i)) {
                merged += currentWord[i];
                i++;
            }
            setTyped(merged);
            setUsedKeys(prev => new Set([...prev, letter]));
            setTotalPoints(p => p + 5);
            addFloatingPoints(5);

            // ✅ FIX 1: Sonido "correcto" en CADA letra acertada
            if (merged !== currentWord) {
                correctRef.current.cloneNode().play().catch(() => { });
            }

            if (merged === currentWord) {
                isProcessingRef.current = true;
                // ✅ Sonido correcto al completar la palabra (igual que Pets/Numbers)
                correctRef.current.cloneNode().play().catch(() => { });
                const t = setTimeout(() => {
                    if (mountedRef.current) handleSolved(currentWord);
                }, 200);
                timeoutRef.current.push(t);
            }
        } else {
            // ❌ Incorrecta
            wrongRef.current.cloneNode().play().catch(() => { });
            setWrongKey(letter);
            setShake(true);
            const tShake = setTimeout(() => setShake(false), 500);
            const tWrongKey = setTimeout(() => setWrongKey(null), 700);
            timeoutRef.current.push(tShake, tWrongKey);
            setErrorsThisRound(e => e + 1);
            setStreak(0);

            const newLives = lives - 1;
            setLives(newLives);

            if (newLives <= 0) {
                isProcessingRef.current = true;
                setTyped(currentWord);
                setFailed(true);
                setShowRetryBanner(false); // hide retry, show failed
                setAnswers(prev => ({ ...prev, [currentWord]: false }));
                setAttempts(a => a + 1);

                const tAudio = setTimeout(() => {
                    if (mountedRef.current) playAudio();
                }, 400);
                timeoutRef.current.push(tAudio);

                const tNext = setTimeout(() => {
                    if (mountedRef.current) triggerNext(current);
                    isProcessingRef.current = false;
                }, 2400);
                timeoutRef.current.push(tNext);
            } else {
                // ✅ Mostrar banner "casi"
                setShowRetryBanner(true);
                const tHide = setTimeout(() => {
                    if (mountedRef.current) setShowRetryBanner(false);
                }, 1500);
                timeoutRef.current.push(tHide);
                // ✅ Repetir audio del correcto
                const tReplay = setTimeout(() => {
                    if (mountedRef.current) playAudio();
                }, 600);
                timeoutRef.current.push(tReplay);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typed, currentWord, solved, finished, failed, hints, lives, current, handleSolved, triggerNext, playAudio]);

    const score = questions.reduce((acc, q) => (answers[q.word] === true ? acc + 1 : acc), 0);
    const progress = ((current + (solved ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentQuestion?.color || "#DC2626";
    const roundGlow = currentQuestion?.glow || "rgba(220,38,38,0.7)";
    const unitStars = perfectRef.current >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="bl3-game-root bl3-result-container">
            <BodyBg color="#DC2626" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="bl3-result-card">
                <div className="bl3-result-emoji">🏆</div>
                <div className="bl3-result-badge">🔍 Parts of the Body · Level 3 ✏️</div>
                <h2 className="bl3-result-title">¡Caso cerrado!</h2>
                <div className="bl3-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`bl3-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="bl3-result-stats">
                    <div className="bl3-rstat"><span>✅</span><span>Solved</span><strong>{score}/{questions.length}</strong></div>
                    <div className="bl3-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="bl3-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="bl3-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="bl3-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="bl3-result-btn" onClick={() => onFinish(score)}>
                        Finalizar 🎉
                    </button>
                )}
            </div>
        </div>
    );

    const slots = currentWord.split("").map((ch, i) => {
        const isTyped = i < typed.length;
        const isHint = hints.has(i);
        const isFilled = isTyped || isHint;
        const char = isTyped ? typed[i] : (isHint ? ch : "");
        return { char, index: i, isHint, isFilled };
    });

    const activeIndex = typed.length < currentWord.length ? typed.length : -1;

    return (
        <div className="bl3-game-root">
            <BodyBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="bl3-header-bar">
                <div className="bl3-header-left">
                    <span className="bl3-header-badge">Level 3</span>
                    <span className="bl3-header-title">✏️ Writing</span>
                </div>
                <div className="bl3-header-right">
                    <div className="bl3-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="bl3-header-pill bl3-streak-pill">🔥 {streak}x</div>}
                    <div className="bl3-header-pill">🎯 {attempts}</div>
                    <div className="bl3-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="bl3-write-container">
                <div className={`bl3-wrapper ${shake ? "bl3-shake" : ""} ${bounce ? "bl3-bounce" : ""}`}>

                    <div className="bl3-progress-track">
                        <div className="bl3-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#FBBF24)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="bl3-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`bl3-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="bl3-instruction">🕵️ Listen, look and decode the body part!</p>

                    <div className="bl3-clue-row">
                        <div className={`bl3-mini-card ${revealed ? "revealed" : ""}`}
                            style={{ borderColor: roundColor, boxShadow: `0 0 0 4px rgba(254,243,199,0.9), 0 18px 40px rgba(120,53,15,0.4), 0 0 40px ${roundGlow}` }}>
                            <img src={currentQuestion.image} alt={currentWord} className="bl3-mini-img" />
                            <button
                                className={`bl3-replay-btn ${isPlaying ? "playing" : ""}`}
                                onClick={playAudio}
                                disabled={isPlaying}
                                style={{ "--round-color": roundColor }}
                                aria-label="Reproducir audio"
                            >
                                {isPlaying ? "🔊" : "▶"}
                            </button>
                        </div>

                        <div className="bl3-slots-container">
                            <div className="bl3-slots">
                                {slots.map(slot => (
                                    <div key={slot.index}
                                        className={`bl3-slot
                                            ${slot.isFilled ? "filled" : ""}
                                            ${slot.isHint && slot.isFilled ? "hint" : ""}
                                            ${activeIndex === slot.index && !failed ? "active" : ""}
                                            ${solved && answers[currentWord] ? "solved" : ""}
                                            ${failed ? "fail" : ""}
                                        `}
                                        style={{
                                            "--slot-color": roundColor,
                                            "--slot-glow": roundGlow
                                        }}>
                                        <span className="bl3-slot-char">{slot.char}</span>
                                        {activeIndex === slot.index && !failed && (
                                            <div className="bl3-slot-magnifier">🔎</div>
                                        )}
                                        {slot.isHint && slot.isFilled && !failed && (
                                            <div className="bl3-hint-tag">💡</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lives */}
                    <div className="bl3-lives-container">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={`bl3-heart ${i < lives ? "alive" : "lost"}`}>
                                {i < lives ? "❤️" : "🖤"}
                            </span>
                        ))}
                    </div>

                    {/* ✅ Banner slot reservado siempre — evita que el teclado salte */}
                    <div className="bl3-banner-slot">
                        {showRetryBanner && (
                            <div className="bl3-retry-banner">❌ ¡Casi! 🕵️ Escucha de nuevo e inténtalo</div>
                        )}
                        {failed && (
                            <div className="bl3-retry-banner failed">😔 ¡Inténtalo de nuevo! Escucha la palabra correcta</div>
                        )}
                    </div>

                    {/* TECLADO QWERTY DETECTIVE */}
                    <div className="bl3-keyboard">
                        {KEYBOARD_ROWS.map((row, rIdx) => (
                            <div key={rIdx} className="bl3-keyboard-row">
                                {row.map(letter => {
                                    const isUsed = usedKeys.has(letter);
                                    const isWrong = wrongKey === letter;
                                    const inWord = currentWord.includes(letter);
                                    return (
                                        <button
                                            key={letter}
                                            className={`bl3-key
                                                ${isUsed ? "used" : ""}
                                                ${isWrong ? "wrong-key" : ""}
                                            `}
                                            onClick={() => handleKey(letter)}
                                            disabled={solved || finished || failed}
                                            style={isUsed && inWord ? { "--key-color": roundColor } : {}}
                                        >
                                            {letter.toUpperCase()}
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