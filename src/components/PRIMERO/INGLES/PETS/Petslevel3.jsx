import React, { useState, useEffect, useRef } from "react";
import "./Petslevel3.css";
import confetti from "canvas-confetti";

import dogAudio from "../../../../assets/sounds/dog.mp3";
import catAudio from "../../../../assets/sounds/cat.mp3";
import fishAudio from "../../../../assets/sounds/fish.mp3";
import birdAudio from "../../../../assets/sounds/bird.mp3";
import rabbitAudio from "../../../../assets/sounds/rabbit.mp3";
import hamsterAudio from "../../../../assets/sounds/hamster.mp3";

import painterImg from "../../../../assets/pintor.png";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ── Imágenes Reales (mismas del Nivel 2) ──
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

const audioCache = {
    correct: new Audio(correctoSound),
    wrong: new Audio(incorrectoSound),
    animals: {
        dog: new Audio(dogAudio),
        cat: new Audio(catAudio),
        fish: new Audio(fishAudio),
        bird: new Audio(birdAudio),
        rabbit: new Audio(rabbitAudio),
        hamster: new Audio(hamsterAudio),
    }
};
[audioCache.correct, audioCache.wrong, ...Object.values(audioCache.animals)]
    .forEach(a => { a.preload = "auto"; });

// ── Combinaciones color+tamaño+animal (del Level 2) ──
const PETS_VARIANTS = [
    { id: "dog-big-brown", word: "dog", emoji: "🐶", img: imgDogBigBrown, size: "big", color: "brown", colorHex: "#D97706" },
    { id: "dog-small-white", word: "dog", emoji: "🐕", img: imgDogSmallWhite, size: "small", color: "white", colorHex: "#E5E7EB" },
    { id: "cat-big-black", word: "cat", emoji: "🐈‍⬛", img: imgCatBigBlack, size: "big", color: "black", colorHex: "#9CA3AF" },
    { id: "cat-small-orange", word: "cat", emoji: "🐱", img: imgCatSmallOrange, size: "small", color: "orange", colorHex: "#FB923C" },
    { id: "fish-big-blue", word: "fish", emoji: "🐟", img: imgFishBigBlue, size: "big", color: "blue", colorHex: "#60A5FA" },
    { id: "fish-small-yellow", word: "fish", emoji: "🐠", img: imgFishSmallYellow, size: "small", color: "yellow", colorHex: "#FBBF24" },
    { id: "bird-small-yellow", word: "bird", emoji: "🐤", img: imgBirdSmallYellow, size: "small", color: "yellow", colorHex: "#FDE047" },
    { id: "bird-big-blue", word: "bird", emoji: "🐦", img: imgBirdBigBlue, size: "big", color: "blue", colorHex: "#3B82F6" },
    { id: "rabbit-small-white", word: "rabbit", emoji: "🐰", img: imgRabbitSmallWhite, size: "small", color: "white", colorHex: "#F9A8D4" },
    { id: "rabbit-big-brown", word: "rabbit", emoji: "🐇", img: imgRabbitBigBrown, size: "big", color: "brown", colorHex: "#B45309" },
    { id: "hamster-small-brown", word: "hamster", emoji: "🐹", img: imgHamsterSmallBrown, size: "small", color: "brown", colorHex: "#FCD34D" },
];

// ── Huecos: cortas (≤5 letras) → 2, largas (>5) → 3 ──
function calcHidden(word) {
    const len = word.length;
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

// Pre-calcular huecos para cada animal
const ANIMAL_HIDDEN = {
    dog: calcHidden("dog"),
    cat: calcHidden("cat"),
    fish: calcHidden("fish"),
    bird: calcHidden("bird"),
    rabbit: calcHidden("rabbit"),
    hamster: calcHidden("hamster"),
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function genRounds() {
    // 8 rondas aleatorias de las 11 variantes
    return shuffle([...PETS_VARIANTS]).slice(0, 8);
}

const KB_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const NUM_ROUNDS = 8;
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
    return <div className={`pl3-fp pl3-fp-${value > 0 ? "pos" : "neg"}`}>{value > 0 ? `+${value} ⭐` : `${value}`}</div>;
}

const StarryBackground = () => (
    <>
        {BG_STARS.map(s => (
            <div key={s.id} className="pl3-star"
                style={{
                    top: s.top, left: s.left, width: s.size, height: s.size,
                    "--sdur": s.dur, "--sdel": s.del
                }} />
        ))}
        {BG_PARTICLES.map(p => (
            <div key={p.id} className="pl3-particle"
                style={{
                    top: p.top, left: p.left, width: p.size, height: p.size,
                    background: p.color, "--pdur": p.dur, "--pdel": p.del
                }} />
        ))}
        {BG_SPARKLES.map(s => (
            <div key={s.id} className="pl3-sparkle"
                style={{
                    top: s.top, left: s.left, "--ssize": `${s.size}px`,
                    "--sdurs": s.dur, "--sdels": s.del
                }}>
                {s.emoji}
            </div>
        ))}
    </>
);

// Construye la visualización de la palabra del animal con huecos
function buildAnimalDisplay(word, hidden, typed, activeSlot, celebrating, wrongSlot, failed) {
    return word.split("").map((letter, i) => {
        const hiddenIdx = hidden.indexOf(i);
        if (hiddenIdx === -1) return { type: "visible", letter, key: i };
        const slotIdx = hiddenIdx;
        const isActive = slotIdx === activeSlot && !celebrating && !failed;
        const typedLetter = typed[slotIdx] || "";
        let state = "empty";
        if (failed) state = "fail";
        else if (celebrating) state = "done";
        else if (isActive) state = wrongSlot === slotIdx ? "active-wrong" : "active";
        else if (typedLetter) state = "filled";
        return { type: "blank", letter, key: i, slotIdx, typed: typedLetter, isActive, state };
    });
}

export default function PetsLevel3({ onFinish }) {
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
    const [failed, setFailed] = useState(false);

    const [typed, setTyped] = useState([]);
    const [activeSlot, setActiveSlot] = useState(0);
    const [wrongSlot, setWrongSlot] = useState(null);
    const [wrongKey, setWrongKey] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
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

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (mountedRef.current && picked[0]) playAnimalAudio(picked[0].word);
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

    const playAnimalAudio = (word) => {
        const a = audioCache.animals[word];
        if (!a) return;
        a.currentTime = 0;
        setIsPlaying(true);
        a.onended = () => { if (mountedRef.current) setIsPlaying(false); };
        a.play().catch(() => { if (mountedRef.current) setIsPlaying(false); });
    };

    const initRound = (all, i, newLives) => {
        if (!mountedRef.current || !all[i]) return;
        const round = all[i];
        const hidden = ANIMAL_HIDDEN[round.word];
        setTyped(new Array(hidden.length).fill(""));
        setActiveSlot(0);
        setWrongSlot(null);
        setWrongKey(null);
        setBlocked(false);
        setCelebrating(false);
        setFailed(false);
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
        const hidden = ANIMAL_HIDDEN[round.word];
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
                    colors: [round.colorHex, "#FFD700", "#fff", "#FF6B9D"],
                });
                // Audio refuerzo del animal completo
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    if (mountedRef.current) playAnimalAudio(round.word);
                }, 500);
                setTimeout(() => advanceTo(i + 1), 2400);
            } else {
                setTimeout(() => { setActiveSlot(nextSlot); }, 200);
            }
        } else {
            playAud(audioCache.wrong);
            setWrongKey(letter);
            setWrongSlot(slot);
            streakRef.current = 0;
            setStreak(0);
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
                    // Reveal en ROJO + audio del animal
                    setBlocked(true);
                    setFailed(true);
                    setAttempts(a => a + 1);
                    const revealed = hidden.map(hi => round.word[hi].toUpperCase());
                    setTyped(revealed);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) playAnimalAudio(round.word);
                    }, 400);
                    setTimeout(() => advanceTo(i + 1), 2400);
                } else {
                    // ✅ NUEVO: Repetir audio del animal cuando hay vidas restantes
                    playAnimalAudio(round.word);
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

    const advanceTo = (next) => {
        if (!mountedRef.current) return;
        if (next >= roundsRef.current.length) { setFinished(true); return; }
        setCurrentIdx(next);
        idxRef.current = next;
        initRound(roundsRef.current, next, MAX_LIVES);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (mountedRef.current && roundsRef.current[next]) {
                playAnimalAudio(roundsRef.current[next].word);
            }
        }, 600);
    };

    const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    const progress = rounds.length > 0 ? (currentIdx / rounds.length) * 100 : 0;
    const isPerfect = Object.values(attRef.current).every(f => f === 0);
    const stars = correctCount === rounds.length && isPerfect ? 3 : correctCount >= rounds.length - 1 ? 2 : 1;

    // ── RESULT ──
    if (finished) return (
        <div className="pl3-result-root">
            <StarryBackground />
            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}
            <div className="pl3-result-card">
                <div className="pl3-result-emoji">{stars === 3 ? "🏆" : stars === 2 ? "🐾" : "✏️"}</div>
                <div className="pl3-result-badge">Animals &amp; Pets · Level 3 ✏️</div>
                <h2 className="pl3-result-title">¡Nivel terminado!</h2>
                <div className="pl3-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`pl3-rstar ${i < stars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="pl3-result-stats">
                    <div className="pl3-rstat"><span>✅</span><span>Correct</span><strong>{correctCount}/{rounds.length}</strong></div>
                    <div className="pl3-rstat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
                    <div className="pl3-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="pl3-rstat"><span>⏱</span><span>Time</span><strong>{fmt}</strong></div>
                </div>
                {onFinish && (
                    <button className="pl3-result-btn" onClick={() => onFinish(correctCount)}>Continue 🐾</button>
                )}
            </div>
        </div>
    );

    const round = rounds[currentIdx];
    if (!round) return null;

    const hidden = ANIMAL_HIDDEN[round.word];
    const animalDisplay = buildAnimalDisplay(round.word, hidden, typed, activeSlot, celebrating, wrongSlot, failed);

    const bubbleText = failed
        ? `😔 Era "${round.word.toUpperCase()}" 🐾`
        : celebrating
            ? `✨ ${round.size.toUpperCase()} ${round.color.toUpperCase()} ${round.word.toUpperCase()}!`
            : `Spell the ${round.color} ${round.word}! 🐾`;

    const bubbleClass = failed ? "wrong" : celebrating ? "correct" : wrongSlot !== null ? "wrong" : "active";

    return (
        <>
            <div className="pl3-header-bar">
                <div className="pl3-header-left">
                    <span className="pl3-header-badge">Level 3</span>
                    <span className="pl3-header-title">✏️ Writing</span>
                </div>
                <div className="pl3-header-right">
                    <div className="pl3-header-pill">⚡ {points}</div>
                    {streak >= 2 && <div className="pl3-header-pill pl3-streak-pill">🔥 {streak}x</div>}
                    <div className="pl3-header-pill">🎯 {attempts}</div>
                    <div className="pl3-header-pill">⏱ {fmt}</div>
                </div>
            </div>

            {floaters.map(({ v, id }) => <FP key={id} value={v} />)}

            <div className="pl3-root">
                <StarryBackground />

                <div className="pl3-progress-wrap">
                    <div className="pl3-progress-track">
                        <div className="pl3-progress-fill" style={{ width: `${progress}%` }} />
                        <div className="pl3-progress-steps">
                            {rounds.map((_, i) => (
                                <div key={i} className={`pl3-progress-dot ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pl3-game-area">

                    {/* Fila superior */}
                    <div className="pl3-top-row">
                        {/* Pintor */}
                        <div className="pl3-painter-wrap">
                            <img src={painterImg} alt="painter"
                                className={`pl3-painter ${celebrating ? "celebrate" : ""}`} />
                            <div className="pl3-lives">
                                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                    <span key={i} className={`pl3-life ${i < lives ? "alive" : "lost"}`}>❤️</span>
                                ))}
                            </div>
                        </div>

                        {/* Burbuja */}
                        <div className={`pl3-bubble ${bubbleClass}`}>
                            <button
                                className="pl3-listen-inline"
                                onClick={() => playAnimalAudio(round.word)}
                                disabled={isPlaying}
                                title="Listen again"
                            >
                                🔊
                            </button>
                            <span className="pl3-bubble-text">{bubbleText}</span>
                        </div>

                        {/* Emoji del animal */}
                        <div className="pl3-emoji-card" style={{ borderColor: round.colorHex, boxShadow: `0 16px 48px rgba(0,0,0,0.45), 0 0 30px ${round.colorHex}66` }}>
                            <div className={`pl3-emoji-display ${celebrating ? "celebrate" : ""}`}>
                                <img src={round.img} alt={round.word} className="pl3-animal-img" />
                            </div>
                        </div>
                    </div>

                    {/* Palabra con color + animal */}
                    <div className="pl3-words-row">
                        <div className="pl3-word-group">
                            <div className="pl3-word-label" style={{ color: "rgba(255,255,255,0.6)" }}>size + color</div>
                            <div className="pl3-word">
                                <div className="pl3-size-badge">{round.size}</div>
                                <div className="pl3-color-word" style={{ color: round.colorHex, borderColor: round.colorHex, boxShadow: `0 6px 0 ${round.colorHex}55, 0 10px 24px rgba(0,0,0,0.4)` }}>
                                    {round.color}
                                </div>
                            </div>
                        </div>

                        <div className="pl3-word-separator">+</div>

                        <div className="pl3-word-group">
                            <div className="pl3-word-label" style={{ color: round.colorHex }}>animal ✏️</div>
                            <div className="pl3-word">
                                {animalDisplay.map(cell => {
                                    if (cell.type === "visible") {
                                        return <div key={cell.key} className="pl3-cell visible" style={{ "--cellAccent": round.colorHex }}>{cell.letter}</div>;
                                    }
                                    return (
                                        <div key={cell.key} className={`pl3-cell blank ${cell.state}`} style={{ "--cellAccent": round.colorHex }}>
                                            {cell.typed || ""}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Teclado (oculto al ganar o al fallar 3 vidas) */}
                    {!celebrating && !failed && (
                        <div className="pl3-keyboard">
                            {KB_ROWS.map((row, ri) => (
                                <div key={ri} className="pl3-kb-row">
                                    {row.map(key => (
                                        <button
                                            key={key}
                                            className={`pl3-key ${key === "⌫" ? "backspace" : ""} ${wrongKey === key ? "wrong-flash" : ""}`}
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

                </div>
            </div>
        </>
    );
}