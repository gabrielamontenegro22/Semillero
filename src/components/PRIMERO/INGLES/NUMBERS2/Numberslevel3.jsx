import React, { useState, useEffect, useRef } from "react";
import "./Numberslevel3.css";
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

import painterImg from "../../../../assets/pintor.png";
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

const audioCache = {
    correct: new Audio(correctoSound),
    wrong: new Audio(incorrectoSound),
    numbers: Object.fromEntries(NUMBERS.map(n => [n.num, new Audio(n.audio)])),
};
[audioCache.correct, audioCache.wrong, ...Object.values(audioCache.numbers)]
    .forEach(a => { a.preload = "auto"; });

// ── Huecos ──
function calcHidden(word) {
    const len = word.length;
    if (len <= 3) return [1];
    const count = len <= 5 ? 2 : 3;
    const candidates = Array.from({ length: len - 2 }, (_, i) => i + 1);
    if (candidates.length === 0) return [];
    const step = Math.floor(candidates.length / count);
    const hidden = [];
    for (let i = 0; i < count; i++) {
        hidden.push(candidates[Math.min(i * step + Math.floor(step / 2), candidates.length - 1)]);
    }
    return [...new Set(hidden)].sort((a, b) => a - b);
}

const NUMBER_HIDDEN = Object.fromEntries(
    NUMBERS.map(n => [n.num, calcHidden(n.word)])
);

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function genRounds() {
    return shuffle([...NUMBERS]).slice(0, 8);
}

const KB_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const MAX_LIVES = 3;
const PTS_OK = 10;

const BG_STARS = Array.from({ length: 70 }, (_, i) => ({
    id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2.5, dur: `${1.5 + Math.random() * 3}s`, del: `${Math.random() * 5}s`,
}));
const PARTICLE_COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#EAB308", "#F97316", "#A855F7", "#EC4899", "#fff"];
const BG_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i, color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: 12 + Math.random() * 22, dur: `${5 + Math.random() * 7}s`, del: `${Math.random() * 6}s`,
}));
const BG_SPARKLES = Array.from({ length: 14 }, (_, i) => ({
    id: i, emoji: ["✨", "⭐", "🌟", "💫"][i % 4],
    top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`,
    size: 14 + Math.random() * 16, dur: `${3 + Math.random() * 5}s`, del: `${Math.random() * 6}s`,
}));

function FP({ value }) {
    return <div className={`nl3-fp nl3-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

// ✅ NUEVO: parámetro `failed` para reveal en rojo
function buildWordDisplay(word, hidden, typed, activeSlot, celebrating, wrongSlot, failed) {
    return word.split("").map((letter, i) => {
        const hiddenIdx = hidden.indexOf(i);
        if (hiddenIdx === -1) return { type: "visible", letter, key: i };
        const slotIdx = hiddenIdx;
        const isActive = slotIdx === activeSlot && !celebrating && !failed;
        const typedLetter = typed[slotIdx] || "";
        let state = "empty";
        if (failed) state = "fail"; // ✅ NUEVO
        else if (celebrating) state = "done";
        else if (isActive) state = wrongSlot === slotIdx ? "active-wrong" : "active";
        else if (typedLetter) state = "filled";
        return { type: "blank", letter, key: i, slotIdx, typed: typedLetter, isActive, state };
    });
}

export default function NumbersLevel3({ onFinish }) {
    const [rounds, setRounds] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [points, setPoints] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [seconds, setSeconds] = useState(0);
    const [finished, setFinished] = useState(false);
    const [floaters, setFloaters] = useState([]);
    const [blocked, setBlocked] = useState(false);
    const [celebrating, setCelebrating] = useState(false);
    const [failed, setFailed] = useState(false); // ✅ NUEVO

    const [typed, setTyped] = useState([]);
    const [activeSlot, setActiveSlot] = useState(0);
    const [wrongSlot, setWrongSlot] = useState(null);
    const [wrongKey, setWrongKey] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // ✅ FIX 7: timeoutRef para limpiar timeouts
    const timeoutRef = useRef(null);
    const mountedRef = useRef(true);
    const floaterId = useRef(0);
    const roundsRef = useRef([]);
    const idxRef = useRef(0);
    const streakRef = useRef(0);
    const livesRef = useRef(MAX_LIVES);
    const attRef = useRef({});

    useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { streakRef.current = streak; }, [streak]);
    useEffect(() => { livesRef.current = lives; }, [lives]);

    useEffect(() => {
        mountedRef.current = true;
        const picked = genRounds();
        roundsRef.current = picked;
        attRef.current = {};
        setRounds(picked);
        initRound(picked, 0, MAX_LIVES);

        // Audio inicial con limpieza de timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (mountedRef.current && picked[0]) playNumberAudio(picked[0].num);
        }, 800);

        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            confetti.reset();
        };
    }, []);

    useEffect(() => {
        if (finished) return;
        const t = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [finished]);

    useEffect(() => {
        if (!finished) return;
        const end = Date.now() + 2800;
        const f = () => {
            if (!mountedRef.current) return;
            confetti({ particleCount: 14, angle: 60, spread: 70, origin: { x: 0 } });
            confetti({ particleCount: 14, angle: 120, spread: 70, origin: { x: 1 } });
            if (Date.now() < end) requestAnimationFrame(f);
        }; f();
    }, [finished]);

    const playAud = (a) => { try { a.currentTime = 0; a.play().catch(() => { }); } catch (_) { } };

    const playNumberAudio = (num) => {
        const a = audioCache.numbers[num];
        if (!a) return;
        a.currentTime = 0;
        setIsPlaying(true);
        a.onended = () => { if (mountedRef.current) setIsPlaying(false); };
        a.play().catch(() => setIsPlaying(false));
    };

    const initRound = (all, i, newLives) => {
        if (!mountedRef.current || !all[i]) return;
        const round = all[i];
        const hidden = NUMBER_HIDDEN[round.num];
        setTyped(new Array(hidden.length).fill(""));
        setActiveSlot(0);
        setWrongSlot(null);
        setWrongKey(null);
        setBlocked(false);
        setCelebrating(false);
        setFailed(false); // ✅ Reset reveal
        setLives(newLives);
        livesRef.current = newLives;
    };

    const addFP = (v) => {
        const id = floaterId.current++;
        setFloaters(f => [...f, { v, id }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
    };

    const handleKey = (letter) => {
        if (blocked || celebrating || failed) return;
        if (letter === "⌫") { handleBackspace(); return; }

        const i = idxRef.current;
        const round = roundsRef.current[i];
        const hidden = NUMBER_HIDDEN[round.num];
        const totalSlots = hidden.length;
        const slot = activeSlot;
        if (slot >= totalSlots) return;

        const expectedLetter = round.word[hidden[slot]].toUpperCase();

        if (letter === expectedLetter) {
            playAud(audioCache.correct);
            const newTyped = [...typed];
            newTyped[slot] = letter;
            setTyped(newTyped);
            setWrongSlot(null);
            setWrongKey(null);

            const nextSlot = slot + 1;
            if (nextSlot >= totalSlots) {
                setBlocked(true);
                setCelebrating(true);
                const first = (attRef.current[i] || 0) === 0;
                const ns = first ? streakRef.current + 1 : 0;
                streakRef.current = ns;
                setStreak(ns);
                setBestStreak(b => Math.max(b, ns));
                const bonus = first ? (ns >= 3 ? 15 : ns >= 2 ? 12 : PTS_OK) : 5;
                setPoints(p => p + bonus);
                setAttempts(a => a + 1);
                setCorrectCount(c => c + 1);
                addFP(bonus);
                confetti({
                    particleCount: 80, spread: 90, origin: { y: 0.5 },
                    colors: [round.color, "#FFD700", "#fff", "#FF6B9D"],
                });
                // ✅ Audio refuerzo del número (después del "correcto")
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    if (mountedRef.current) playNumberAudio(round.num);
                }, 500);
                setTimeout(() => advanceTo(i + 1), 2400); // ← más tiempo para escuchar
            } else {
                setTimeout(() => { setActiveSlot(nextSlot); }, 200);
            }
        } else {
            playAud(audioCache.wrong);
            setWrongKey(letter);
            setWrongSlot(slot);
            streakRef.current = 0;
            setStreak(0);
            // ✅ FIX 2: Sin penalización -3
            const na = (attRef.current[i] || 0) + 1;
            attRef.current = { ...attRef.current, [i]: na };
            const newLives = livesRef.current - 1;
            livesRef.current = newLives;
            setLives(newLives);

            setTimeout(() => {
                if (!mountedRef.current) return;
                setWrongKey(null);
                setWrongSlot(null);
                if (newLives <= 0) {
                    // ✅ FIX 3: Reveal en ROJO + estado fail
                    setBlocked(true);
                    setFailed(true);
                    setAttempts(a => a + 1);
                    const revealed = hidden.map(hi => round.word[hi].toUpperCase());
                    setTyped(revealed);
                    // ✅ FIX 4: Audio del número correcto (refuerzo pedagógico)
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) playNumberAudio(round.num);
                    }, 400);
                    setTimeout(() => advanceTo(i + 1), 2400); // ← más tiempo
                } else {
                    // ✅ FIX 4: Repetir audio cuando hay vidas restantes
                    playNumberAudio(round.num);
                }
            }, 600);
        }
    };

    const handleBackspace = () => {
        if (blocked) return;
        const slot = activeSlot;
        if (typed[slot]) {
            const newTyped = [...typed];
            newTyped[slot] = "";
            setTyped(newTyped);
        } else if (slot > 0) {
            const newTyped = [...typed];
            newTyped[slot - 1] = "";
            setTyped(newTyped);
            setActiveSlot(slot - 1);
        }
        setWrongSlot(null);
    };

    // ✅ FIX 5: Eliminado handleSkip (decisión global: sin Skip)

    const advanceTo = (next) => {
        if (!mountedRef.current) return;
        if (next >= roundsRef.current.length) { setFinished(true); return; }
        setCurrentIdx(next);
        idxRef.current = next;
        initRound(roundsRef.current, next, MAX_LIVES);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (mountedRef.current && roundsRef.current[next]) {
                playNumberAudio(roundsRef.current[next].num);
            }
        }, 600);
    };

    const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
    const isPerfect = Object.values(attRef.current).every(f => f === 0);
    const stars = correctCount === rounds.length && isPerfect ? 3 : correctCount >= rounds.length - 1 ? 2 : 1;

    // ── RESULT ──
    if (finished) return (
        <div className="nl3-game-root nl3-result-root">
            {/* ✅ Estética Premium en Resultados */}
            {BG_STARS.map(s => (
                <div key={s.id} className="nl3-star"
                    style={{
                        top: s.top, left: s.left, width: s.size, height: s.size,
                        "--sdur": s.dur, "--sdel": s.del
                    }} />
            ))}
            {BG_PARTICLES.map(p => (
                <div key={p.id} className="nl3-particle"
                    style={{
                        top: p.top, left: p.left, width: p.size, height: p.size,
                        background: p.color, "--pdur": p.dur, "--pdel": p.del
                    }} />
            ))}

            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="nl3-result-card">
                <div className="nl3-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🔢" : "✏️"}</div>
                <div className="nl3-result-badge">Numbers 0-20 · Level 3 ✏️</div>
                <h2 className="nl3-result-title">¡Nivel terminado!</h2>
                <div className="nl3-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`nl3-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="nl3-result-stats">
                    <div className="nl3-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
                    <div className="nl3-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="nl3-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="nl3-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && (
                    <button className="nl3-result-btn" onClick={() => onFinish(correctCount)}>Continue 🔢</button>
                )}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;

    const hidden = NUMBER_HIDDEN[round.num];
    const wordDisplay = buildWordDisplay(round.word, hidden, typed, activeSlot, celebrating, wrongSlot, failed);

    // ✅ FIX 8: bubbleText con estado failed
    const bubbleText = failed
        ? `😔 Era "${round.word.toUpperCase()}" 🔢`
        : celebrating
            ? `✨ ${round.num} = ${round.word.toUpperCase()}!`
            : "Spell the number! 🔢";

    const bubbleClass = failed ? "wrong" : celebrating ? "correct" : wrongSlot !== null ? "wrong" : "active";

    return (
        <div className="nl3-game-root">
            <div className="nl3-header-bar">
                <div className="nl3-header-left">
                    <span className="nl3-header-badge">Level 3</span>
                    {/* ✅ FIX 1: Header correcto */}
                    <span className="nl3-header-title">✏️ Writing</span>
                </div>
                <div className="nl3-header-right">
                    <div className="nl3-header-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="nl3-header-pill nl3-streak-pill">🔥 {streak}x</div>}
                    <div className="nl3-header-pill">🎯 {attempts}</div>
                    <div className="nl3-header-pill">⏱ {fmt}</div>
                </div>
            </div>

            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

            <div className="nl3-root">
                {BG_STARS.map(s => (
                    <div key={s.id} className="nl3-star"
                        style={{
                            top: s.top, left: s.left, width: s.size, height: s.size,
                            "--sdur": s.dur, "--sdel": s.del
                        }} />
                ))}
                {BG_PARTICLES.map(p => (
                    <div key={p.id} className="nl3-particle"
                        style={{
                            top: p.top, left: p.left, width: p.size, height: p.size,
                            background: p.color, "--pdur": p.dur, "--pdel": p.del
                        }} />
                ))}
                {BG_SPARKLES.map(s => (
                    <div key={s.id} className="nl3-sparkle"
                        style={{
                            top: s.top, left: s.left, "--ssize": `${s.size}px`,
                            "--sdurs": s.dur, "--sdels": s.del
                        }}>
                        {s.emoji}
                    </div>
                ))}

                <div className="nl3-progress-wrap">
                    <div className="nl3-progress-track">
                        <div className="nl3-progress-fill" style={{ width: `${progress}%` }} />
                        <div className="nl3-progress-steps">
                            {rounds.map((_, i) => (
                                <div key={i} className={`nl3-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="nl3-game-area">
                    {/* ✅ Banner Slot para estabilidad */}
                    <div className="nl3-banner-slot">
                        <div className={`nl3-bubble ${bubbleClass}`}>
                            <button
                                className="nl3-listen-inline"
                                onClick={() => playNumberAudio(round.num)}
                                disabled={isPlaying}
                                title="Listen again"
                            >
                                🔊
                            </button>
                            <span className="nl3-bubble-text">{bubbleText}</span>
                        </div>
                    </div>

                    <div className="nl3-top-row">
                        {/* Pintor */}
                        <div className="nl3-painter-wrap">
                            <img src={painterImg} alt="painter"
                                className={`nl3-painter ${celebrating ? "celebrate" : ""}`} />
                            <div className="nl3-lives">
                                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                    <span key={i} className={`nl3-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
                                ))}
                            </div>
                        </div>

                        {/* Fila del medio: burbuja quitada de aquí para ir al slot */}

                        {/* Número Display */}
                        <div className="nl3-number-card" style={{ borderColor: round.color, boxShadow: `0 16px 48px rgba(0,0,0,0.45), 0 0 40px ${round.color}66` }}>
                            <div className={`nl3-number-display ${celebrating ? "celebrate" : ""}`}
                                style={{ color: round.color, textShadow: `0 0 35px ${round.glow}, 0 4px 14px rgba(0,0,0,0.7)` }}>
                                {round.num}
                            </div>
                        </div>
                    </div>

                    <div className="nl3-word-row">
                        <div className="nl3-word-label" style={{ color: round.color }}>spell it ✏️</div>
                        <div className="nl3-word">
                            {wordDisplay.map(cell => {
                                if (cell.type === "visible") {
                                    return <div key={cell.key} className="nl3-cell visible" style={{ "--cellAccent": round.color }}>{cell.letter}</div>;
                                }
                                return (
                                    <div key={cell.key} className={`nl3-cell blank ${cell.state}`} style={{ "--cellAccent": round.color }}>
                                        {cell.typed || ""}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ✅ FIX 10: Teclado oculto al ganar o al fallar 3 vidas */}
                    {!celebrating && !failed && (
                        <div className="nl3-keyboard">
                            {KB_ROWS.map((row, ri) => (
                                <div key={ri} className="nl3-kb-row">
                                    {row.map(key => (
                                        <button
                                            key={key}
                                            className={`nl3-key ${key === "⌫" ? "backspace" : ""} ${wrongKey === key ? "wrong-flash" : ""}`}
                                            onClick={() => handleKey(key)}
                                            disabled={blocked}
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ✅ FIX 5: Eliminado bloque Skip completo */}

                </div>
            </div>
        </div>
    );
}