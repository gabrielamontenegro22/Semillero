import React, { useState, useEffect, useRef } from "react";
import "./Writeiit.css";
import confetti from "canvas-confetti";
import GameBackground from "../GameBackground";

// ═══ assets ═══
import marioImg from "../../../../assets/mario.png";
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

const NUM_ROUNDS = 8;
const MAX_LIVES = 3;

const NUMBERS = [
    { value: 0, word: "ZERO", audio: zeroAudio, color: "#A78BFA", glow: "rgba(167,139,250,0.8)" },
    { value: 1, word: "ONE", audio: oneAudio, color: "#FB7185", glow: "rgba(251,113,133,0.8)" },
    { value: 2, word: "TWO", audio: twoAudio, color: "#60A5FA", glow: "rgba(96,165,250,0.8)" },
    { value: 3, word: "THREE", audio: threeAudio, color: "#34D399", glow: "rgba(52,211,153,0.8)" },
    { value: 4, word: "FOUR", audio: fourAudio, color: "#FBBF24", glow: "rgba(251,191,36,0.8)" },
    { value: 5, word: "FIVE", audio: fiveAudio, color: "#F472B6", glow: "rgba(244,114,182,0.8)" },
    { value: 6, word: "SIX", audio: sixAudio, color: "#2DD4BF", glow: "rgba(45,212,191,0.8)" },
    { value: 7, word: "SEVEN", audio: sevenAudio, color: "#FB923C", glow: "rgba(251,146,60,0.8)" },
    { value: 8, word: "EIGHT", audio: eightAudio, color: "#C084FC", glow: "rgba(192,132,252,0.8)" },
    { value: 9, word: "NINE", audio: nineAudio, color: "#22D3EE", glow: "rgba(34,211,238,0.8)" },
    { value: 10, word: "TEN", audio: tenAudio, color: "#A3E635", glow: "rgba(163,230,53,0.8)" },
];

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
];

const PTS_LETTER = 2;
const PTS_WORD = 10;

const correctSnd = new Audio(correctoSound);
const incorrectSnd = new Audio(incorrectoSound);
// ✅ FIX 5: Precargar correcto/incorrecto
[correctSnd, incorrectSnd].forEach(a => { a.preload = "auto"; });
// ✅ FIX 4: Precargar audios de números
const numAudios = NUMBERS.map(n => { const a = new Audio(n.audio); a.preload = "auto"; return a; });

const shuffle = (a) => [...a].sort(() => Math.random() - .5);
const genRounds = () => shuffle([...NUMBERS]).slice(0, NUM_ROUNDS);

// Background
const BG_STARS = Array.from({ length: 70 }, (_, i) => ({
    id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2.5, dur: `${1.5 + Math.random() * 3}s`, del: `${Math.random() * 5}s`,
}));
const PARTICLE_COLORS = ["#A78BFA", "#FB7185", "#60A5FA", "#34D399", "#FBBF24", "#F472B6", "#2DD4BF", "#fff"];
const BG_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
    id: i, color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: 10 + Math.random() * 20, dur: `${5 + Math.random() * 7}s`, del: `${Math.random() * 6}s`,
}));
const BG_SPARKLES = Array.from({ length: 12 }, (_, i) => ({
    id: i, emoji: ["✨", "⭐", "🌟", "💫", "✏️", "🎯"][i % 6],
    top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`,
    size: 14 + Math.random() * 16, dur: `${3 + Math.random() * 5}s`, del: `${Math.random() * 6}s`,
}));

function MariosGrid({ count, color }) {
    if (count === 0) {
        return (
            <div className="wi-zero-wrap">
                <div className="wi-zero-ring" style={{ borderColor: color, boxShadow: `0 0 26px ${color}` }}>
                    <span style={{ color }}>0</span>
                </div>
            </div>
        );
    }
    const cols = count <= 3 ? count : count <= 6 ? 3 : count <= 8 ? 4 : 5;
    const size = count <= 3 ? 95 : count <= 6 ? 80 : count <= 8 ? 68 : 58;
    return (
        <div className="wi-marios-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
            {Array.from({ length: count }).map((_, i) => (
                <img key={i} src={marioImg} alt="mario" className="wi-mario-img"
                    style={{ width: size, height: size, animationDelay: `${i * .08}s` }} />
            ))}
        </div>
    );
}

function FP({ value }) {
    return <div className={`wi-fp wi-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

function ComboBanner({ streak }) {
    if (streak < 3) return null;
    const msg = streak >= 5 ? "🔥 UNSTOPPABLE!" : streak >= 4 ? "⚡ SUPER COMBO!" : "🎯 COMBO x3!";
    return <div className="wi-combo-banner" key={streak}>{msg}</div>;
}

function RoundFlash({ show }) {
    if (!show) return null;
    return <div className="wi-round-flash" />;
}

export default function WriteIt({ onFinish }) {
    const [rounds, setRounds] = useState(Array.from({ length: NUM_ROUNDS }));
    const [currentIdx, setCurrentIdx] = useState(0);
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [seconds, setSeconds] = useState(0);
    const [finished, setFinished] = useState(false);
    const [floaters, setFloaters] = useState([]);
    const [showCombo, setShowCombo] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    const [typed, setTyped] = useState([]);
    const [wordState, setWordState] = useState("idle");
    const [blocked, setBlocked] = useState(false);
    const [wrongKey, setWrongKey] = useState(null);
    const [correctKey, setCorrectKey] = useState(null);

    const mountedRef = useRef(true);

    const idxRef = useRef(0);
    const streakRef = useRef(0);
    const livesRef = useRef(MAX_LIVES);
    const typedRef = useRef([]);
    const roundsRef = useRef([]);
    const floaterId = useRef(0);
    const audioRef = useRef(null);   // ✅ FIX 4: tracker del audio activo

    useEffect(() => {
        mountedRef.current = true;
        // ✅ Forzar precarga
        [correctSnd, incorrectSnd, ...numAudios].forEach(a => a.load());
        const r = genRounds();
        roundsRef.current = r;
        setRounds(r);
        loadRound();
        setTimeout(() => { if (mountedRef.current) playNumberAudio(); }, 600);
        return () => {
            mountedRef.current = false;
            confetti.reset();
            // ✅ FIX 7: Cleanup de audio al desmontar
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

    useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { streakRef.current = streak; }, [streak]);
    useEffect(() => { livesRef.current = lives; }, [lives]);
    useEffect(() => { typedRef.current = typed; }, [typed]);

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

    // ✅ FIX 4: Reproductor con tracker (detiene audio anterior antes de tocar nuevo)
    const playNumberAudio = () => {
        const round = roundsRef.current[idxRef.current];
        if (!round) return;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const a = numAudios[round.value];
        audioRef.current = a;
        a.currentTime = 0;
        a.play().catch(() => { });
    };

    const addFP = (v) => {
        const id = floaterId.current++;
        setFloaters(f => [...f, { v, id }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1300);
    };

    const loadRound = () => {
        if (!mountedRef.current) return;
        const round = roundsRef.current[idxRef.current];
        if (!round) return;

        // ✅ Detener audio anterior al iniciar ronda
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        const len = round.word.length;
        const numHints = len <= 4 ? 2 : 3;
        const indices = shuffle(Array.from({ length: len }, (_, i) => i)).slice(0, numHints);

        const initT = Array(len).fill(null);
        indices.forEach(i => initT[i] = round.word[i]);

        setTyped(initT); typedRef.current = initT;
        setBlocked(false); setWordState("idle");
        setWrongKey(null); setCorrectKey(null);
        setLives(MAX_LIVES); livesRef.current = MAX_LIVES;
    };

    const advanceTo = (next) => {
        if (!mountedRef.current) return;
        if (next >= roundsRef.current.length) { setFinished(true); return; }
        setShowFlash(true);
        setTimeout(() => { if (mountedRef.current) setShowFlash(false); }, 400);
        setCurrentIdx(next); idxRef.current = next;
        loadRound();
        setTimeout(() => { if (mountedRef.current) playNumberAudio(); }, 600);
    };

    const handleKey = (letter) => {
        if (blocked || wordState !== "idle") return;
        const round = roundsRef.current[idxRef.current];
        if (!round) return;

        const nextIdx = typedRef.current.indexOf(null);
        if (nextIdx === -1) return;

        const expected = round.word[nextIdx];

        if (letter === expected) {
            // ── CORRECT ──
            const newTyped = [...typedRef.current];
            newTyped[nextIdx] = letter;
            typedRef.current = newTyped;
            setTyped(newTyped);

            setCorrectKey(letter);
            setTimeout(() => { if (mountedRef.current) setCorrectKey(null); }, 350);
            setPoints(p => p + PTS_LETTER);
            addFP(PTS_LETTER);

            const isWordComplete = newTyped.indexOf(null) === -1;

            // ✅ FIX: Sonido "correcto" en CADA letra acertada (refuerzo positivo)
            if (!isWordComplete) {
                correctSnd.cloneNode().play().catch(() => { });
            }

            if (isWordComplete) {
                setBlocked(true);
                setWordState("win");
                correctSnd.currentTime = 0; correctSnd.play().catch(() => { });

                const ns = streakRef.current + 1;
                streakRef.current = ns; setStreak(ns);
                setBestStreak(b => Math.max(b, ns));
                const bonus = PTS_WORD + (ns >= 5 ? 15 : ns >= 4 ? 10 : ns >= 3 ? 7 : ns >= 2 ? 4 : 0);
                setPoints(p => p + bonus);
                setCorrectCount(c => c + 1);
                addFP(bonus);
                setAttempts(a => a + 1);
                if (ns >= 3) setShowCombo(true);

                confetti({
                    particleCount: 110, spread: 120, origin: { y: 0.45 },
                    colors: [round.color, "#FFD700", "#fff", "#FF6B9D", "#A78BFA", "#34D399"]
                });
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    setShowCombo(false);
                    advanceTo(idxRef.current + 1);
                }, 1900);
            }
        } else {
            // ── WRONG ──
            setWrongKey(letter);
            setTimeout(() => { if (mountedRef.current) setWrongKey(null); }, 500);
            incorrectSnd.currentTime = 0; incorrectSnd.play().catch(() => { });

            streakRef.current = 0; setStreak(0);
            // ✅ FIX 2: Sin penalización -1
            const nl = livesRef.current - 1;
            livesRef.current = nl;
            setLives(nl);

            if (nl <= 0) {
                // ✅ FIX 3: Reveal + audio del número correcto
                setBlocked(true);
                setWordState("fail");
                setAttempts(a => a + 1);
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    playNumberAudio(); // ← niño escucha cómo se dice
                }, 400);
                setTimeout(() => advanceTo(idxRef.current + 1), 2400); // ← más tiempo
            }
        }
    };

    const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
    const stars = correctCount >= 7 ? 3 : correctCount >= 5 ? 2 : 1;

    if (finished) return (
        <div className="wi-result-root">
            <GameBackground color="purple" />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="wi-result-card">
                <div className="wi-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "✏️" : "💪"}</div>
                <div className="wi-result-badge">Numbers 0–10 · Level 3 ✏️</div>
                <h2 className="wi-result-title">¡Desafío completado!</h2>
                <div className="wi-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`wi-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="wi-result-stats">
                    <div className="wi-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{NUM_ROUNDS}</strong></div>
                    <div className="wi-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="wi-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="wi-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && (
                    <button className="wi-result-btn" onClick={() => onFinish(correctCount)}>Finalizar ✅</button>
                )}
            </div>
        </div>
    );

    const round = roundsRef.current[currentIdx];

    return (
        <>
            <div className="wi-header-bar">
                <div className="wi-header-left">
                    <span className="wi-header-badge" style={{ background: "linear-gradient(135deg,#A78BFA,#7C3AED)" }}>Level 3</span>
                    <span className="wi-header-title">✏️ Writing</span>
                </div>
                <div className="wi-header-right">
                    <div className="wi-header-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="wi-header-pill wi-streak-pill">🔥 {streak}x</div>}
                    <div className="wi-header-pill">🎯 {attempts}</div>
                    <div className="wi-header-pill">⏱ {fmt}</div>
                </div>
            </div>

            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            {showCombo && <ComboBanner streak={streak} />}
            <RoundFlash show={showFlash} />

            <div className="wi-root">
                {BG_STARS.map(s => (
                    <div key={s.id} className="wi-star"
                        style={{ top: s.top, left: s.left, width: s.size, height: s.size, "--sdur": s.dur, "--sdel": s.del }} />
                ))}
                {BG_PARTICLES.map(p => (
                    <div key={p.id} className="wi-particle"
                        style={{ top: p.top, left: p.left, width: p.size, height: p.size, background: p.color, "--pdur": p.dur, "--pdel": p.del }} />
                ))}
                {BG_SPARKLES.map(s => (
                    <div key={s.id} className="wi-sparkle"
                        style={{ top: s.top, left: s.left, "--ssize": `${s.size}px`, "--sdurs": s.dur, "--sdels": s.del }}>
                        {s.emoji}
                    </div>
                ))}

                <div className="wi-progress-wrap">
                    <div className="wi-progress-track">
                        <div className="wi-progress-fill" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#A78BFA,#8B5CF6 50%,#C084FC)" }} />
                        <div className="wi-progress-steps">
                            {rounds.map((_, i) => (
                                <div key={i} className={`wi-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
                            ))}
                        </div>
                    </div>
                    <div className="wi-progress-label">{currentIdx + 1} / {NUM_ROUNDS}</div>
                </div>

                <div className="wi-game-area">
                    {round && (
                        <>
                            <div className="wi-info-row">
                                <div className="wi-lives-cap">
                                    {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                        <span key={i} className={`wi-life ${i < lives ? "alive" : "lost"}`}>
                                            {i < lives ? "❤️" : "🖤"}
                                        </span>
                                    ))}
                                </div>
                                <div className="wi-round-pill"
                                    style={{ color: round.color, borderColor: round.color, boxShadow: `0 0 18px ${round.glow}` }}>
                                    Round {currentIdx + 1}/{NUM_ROUNDS}
                                </div>
                            </div>

                            <div className="wi-panels-row">
                                <div className="wi-marios-panel"
                                    style={{ borderColor: round.color, boxShadow: `0 0 32px ${round.glow}` }}>
                                    <div className="wi-panel-label">Count the Marios 👇</div>
                                    <MariosGrid count={round.value} color={round.color} />
                                </div>

                                <div className={`wi-word-panel wi-word-${wordState}`}
                                    style={{ "--wc": round.color, "--wg": round.glow }}>
                                    <div className="wi-panel-label" style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }} onClick={playNumberAudio}>
                                        Write the word ✏️ <span style={{ fontSize: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '2px 8px', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.15)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>🔊</span>
                                    </div>
                                    <div className="wi-slots">
                                        {round.word.split("").map((letter, i) => {
                                            const filled = typed[i] !== null;
                                            const isNext = i === typed.indexOf(null) && wordState === "idle";
                                            const showReveal = wordState === "fail" && !filled;
                                            return (
                                                <div key={i}
                                                    className={`wi-slot ${filled ? "filled" : ""} ${isNext ? "next" : ""} ${showReveal ? "reveal" : ""}`}
                                                    style={{ "--sc": round.color, "--sg": round.glow }}>
                                                    {filled ? typed[i] : (showReveal ? letter : "")}
                                                    {!filled && !showReveal && <span className="wi-slot-line" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {wordState === "win" && <div className="wi-word-result wi-word-result-ok">✓ ¡Excelent!</div>}
                                    {wordState === "fail" && <div className="wi-word-result wi-word-result-fail">✗ Era {round.word}</div>}
                                </div>
                            </div>

                            <div className="wi-keyboard">
                                {KEYBOARD_ROWS.map((row, ri) => (
                                    <div key={ri} className="wi-kb-row">
                                        {row.map((letter) => {
                                            const isWrong = wrongKey === letter;
                                            const isCorrect = correctKey === letter;
                                            return (
                                                <button
                                                    key={letter}
                                                    className={`wi-key ${isWrong ? "wi-key-wrong" : ""} ${isCorrect ? "wi-key-correct" : ""}`}
                                                    onClick={() => handleKey(letter)}
                                                    disabled={blocked}
                                                >
                                                    {letter}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}