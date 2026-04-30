import React, { useState, useEffect, useRef } from "react";
import "./FlipCards.css";
import confetti from "canvas-confetti";
import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

// ─── DATA ─────────────────────────────────────────────────
const cardsData = [
  { id: 1, question: "What's your name?", emoji: "🙋", correct: "My name is Sam.", options: ["My name is Sam.", "I'm seven years old.", "I'm from Colombia."], color: "blue" },
  { id: 2, question: "How old are you?", emoji: "🎂", correct: "I'm eight years old.", options: ["I'm fine, thanks!", "I'm eight years old.", "My name is Ana."], color: "green" },
  { id: 3, question: "Where are you from?", emoji: "🌎", correct: "I'm from Colombia.", options: ["I'm from Colombia.", "I'm seven years old.", "My name is Sam."], color: "orange" },
  { id: 4, question: "How are you?", emoji: "😊", correct: "I'm fine, thank you!", options: ["My name is Ana.", "I'm from Bogotá.", "I'm fine, thank you!"], color: "purple" },
  { id: 5, question: "What's your name?", emoji: "👋", correct: "My name is Ana.", options: ["I'm eight years old.", "My name is Ana.", "I'm from Colombia."], color: "pink" },
  { id: 6, question: "How old are you?", emoji: "🕯️", correct: "I'm seven years old.", options: ["I'm seven years old.", "My name is Sam.", "I'm fine!"], color: "teal" },
];

const themes = {
  blue: { bg: "linear-gradient(160deg,#0a1628,#1D4ED8,#0EA5E9)", card: "linear-gradient(135deg,#3B82F6,#1D4ED8)", elements: ["🚀", "⭐", "🌙", "💫", "🪐", "✨", "🌟", "☄️"] },
  green: { bg: "linear-gradient(160deg,#052e16,#15803D,#4ADE80)", card: "linear-gradient(135deg,#22C55E,#15803D)", elements: ["🌿", "🌸", "🦋", "🍀", "🌺", "✨", "🌻", "🐝"] },
  orange: { bg: "linear-gradient(160deg,#431407,#C2410C,#FB923C)", card: "linear-gradient(135deg,#F97316,#C2410C)", elements: ["🔥", "⚡", "🌟", "💥", "🎯", "✨", "🏆", "🎪"] },
  purple: { bg: "linear-gradient(160deg,#1e0533,#6D28D9,#A78BFA)", card: "linear-gradient(135deg,#8B5CF6,#6D28D9)", elements: ["🔮", "⭐", "🌙", "💜", "🦄", "✨", "🌟", "🎆"] },
  pink: { bg: "linear-gradient(160deg,#3b0a20,#BE185D,#F472B6)", card: "linear-gradient(135deg,#EC4899,#BE185D)", elements: ["💖", "🌸", "🦩", "💝", "🎀", "✨", "🌺", "💕"] },
  teal: { bg: "linear-gradient(160deg,#012827,#0F766E,#2DD4BF)", card: "linear-gradient(135deg,#14B8A6,#0F766E)", elements: ["🐠", "🐬", "🌊", "🐙", "⭐", "✨", "🐟", "💎"] },
};

const MASCOT = {
  idle: { emoji: "🦊", label: "" },
  correct: { emoji: "🦊", label: "⭐ Amazing!" },
  wrong1: { emoji: "🦊", label: "😬 Try again!" },
  wrong2: { emoji: "🦊", label: "😢 Oops!" },
};

const MAX_ATTEMPTS = 2; // intentos por carta = corazones

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ─── SVG CARTOON BACKGROUNDS ──────────────────────────────
function BgSpace() {
  return (
    <svg className="fc-svg-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="spaceBg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#spaceBg)" />
      {[[80, 60], [200, 40], [350, 80], [500, 30], [650, 70], [720, 120], [100, 200], [300, 180], [600, 160], [750, 50], [420, 140], [180, 300], [550, 250]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.5 + i % 3} fill="#fff" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <circle cx="680" cy="120" r="60" fill="#7C3AED" opacity="0.5" />
      <ellipse cx="680" cy="120" rx="95" ry="20" fill="none" stroke="#C4B5FD" strokeWidth="7" opacity="0.35" />
      <circle cx="120" cy="100" r="36" fill="#FCD34D" opacity="0.75" />
      <circle cx="136" cy="87" r="36" fill="#1e3a8a" opacity="0.9" />
      <g className="fc-rocket">
        <ellipse cx="400" cy="490" rx="18" ry="38" fill="#EF4444" />
        <polygon points="400,450 385,488 415,488" fill="#FCA5A5" />
        <rect x="384" y="500" width="10" height="16" rx="3" fill="#F97316" />
        <rect x="406" y="500" width="10" height="16" rx="3" fill="#F97316" />
        <circle cx="400" cy="478" r="8" fill="#BAE6FD" />
        <ellipse cx="400" cy="520" rx="12" ry="10" fill="#FDE68A" opacity="0.9">
          <animate attributeName="ry" values="10;18;10" dur="0.25s" repeatCount="indefinite" />
        </ellipse>
      </g>
      <line x1="0" y1="0" x2="100" y2="50" stroke="#fff" strokeWidth="2" opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="-200,-50;1000,450" dur="3.5s" repeatCount="indefinite" />
      </line>
      <ellipse cx="300" cy="510" rx="200" ry="55" fill="#4F46E5" opacity="0.12" />
    </svg>
  );
}

function BgNature() {
  return (
    <svg className="fc-svg-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="60%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#86EFAC" />
        </linearGradient>
        <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#skyG)" />
      <rect y="420" width="800" height="180" fill="url(#groundG)" />
      <circle cx="680" cy="90" r="56" fill="#FDE047" opacity="0.95" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line key={i} x1={680 + 66 * Math.cos(a * Math.PI / 180)} y1={90 + 66 * Math.sin(a * Math.PI / 180)} x2={680 + 88 * Math.cos(a * Math.PI / 180)} y2={90 + 88 * Math.sin(a * Math.PI / 180)} stroke="#FDE047" strokeWidth="5" opacity="0.8" />
      ))}
      {[[100, 80], [320, 55], [560, 90]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="62" ry="28" fill="white" opacity="0.9" />
          <ellipse cx={x - 32} cy={y + 8} rx="38" ry="22" fill="white" opacity="0.9" />
          <ellipse cx={x + 32} cy={y + 8} rx="42" ry="22" fill="white" opacity="0.9" />
        </g>
      ))}
      {[[60, 415], [160, 395], [700, 405], [760, 415]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 5} y={y} width="10" height="55" fill="#92400E" />
          <ellipse cx={x} cy={y - 8} rx="34" ry="44" fill="#15803D" />
          <ellipse cx={x - 14} cy={y + 12} rx="26" ry="34" fill="#16A34A" />
          <ellipse cx={x + 14} cy={y + 12} rx="26" ry="34" fill="#4ADE80" opacity="0.75" />
        </g>
      ))}
      {[[220, 425], [380, 430], [520, 422], [640, 428]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y - 22} width="4" height="26" fill="#16A34A" />
          <circle cx={x} cy={y - 24} r="11" fill={["#F472B6", "#FDE047", "#FB923C", "#60A5FA"][i]} />
          <circle cx={x} cy={y - 24} r="5" fill="#FDE047" />
        </g>
      ))}
      <g className="fc-butterfly">
        <ellipse cx="400" cy="280" rx="26" ry="19" fill="#EC4899" opacity="0.85" transform="rotate(-20,400,280)" />
        <ellipse cx="448" cy="285" rx="26" ry="19" fill="#F472B6" opacity="0.85" transform="rotate(20,448,285)" />
        <ellipse cx="400" cy="300" rx="18" ry="12" fill="#BE185D" opacity="0.65" transform="rotate(10,400,300)" />
        <ellipse cx="448" cy="302" rx="18" ry="12" fill="#EC4899" opacity="0.65" transform="rotate(-10,448,302)" />
        <rect x="422" y="278" width="4" height="28" rx="2" fill="#1e1b4b" />
      </g>
    </svg>
  );
}

function BgOcean() {
  return (
    <svg className="fc-svg-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="oceanG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#042F2E" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#oceanG)" />
      {[[100, 500], [220, 455], [370, 520], [490, 470], [610, 510], [710, 460], [160, 360], [430, 385], [660, 345]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5 + i % 4 * 4} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2">
          <animate attributeName="cy" values={`${y};${y - 280};${y - 280}`} dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {[[80, 585], [210, 592], [610, 578], [725, 588]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y - 42} width="8" height="42" rx="4" fill={["#F87171", "#FB923C", "#F472B6", "#C084FC"][i]} />
          <rect x={x - 13} y={y - 32} width="8" height="32" rx="4" fill={["#F87171", "#FB923C", "#F472B6", "#C084FC"][i]} transform={`rotate(-22,${x - 9},${y})`} />
          <rect x={x + 13} y={y - 32} width="8" height="32" rx="4" fill={["#F87171", "#FB923C", "#F472B6", "#C084FC"][i]} transform={`rotate(22,${x + 17},${y})`} />
        </g>
      ))}
      <g className="fc-fish1">
        <ellipse cx="200" cy="250" rx="36" ry="20" fill="#FCD34D" />
        <polygon points="236,250 262,232 262,268" fill="#FCD34D" />
        <circle cx="195" cy="245" r="5" fill="#1e1b4b" />
        <circle cx="196" cy="244" r="2" fill="white" />
      </g>
      <g className="fc-fish2">
        <ellipse cx="600" cy="180" rx="28" ry="16" fill="#F472B6" />
        <polygon points="572,180 548,164 548,196" fill="#F472B6" />
        <circle cx="605" cy="176" r="4" fill="#1e1b4b" />
        <circle cx="606" cy="175" r="1.5" fill="white" />
      </g>
      <g className="fc-dolphin">
        <ellipse cx="420" cy="110" rx="62" ry="22" fill="#38BDF8" opacity="0.9" />
        <ellipse cx="360" cy="108" rx="22" ry="14" fill="#38BDF8" />
        <polygon points="482,108 512,90 512,126" fill="#38BDF8" />
        <polygon points="432,88 448,60 464,88" fill="#7DD3FC" />
        <circle cx="358" cy="104" r="4" fill="#0C4A6E" />
      </g>
    </svg>
  );
}

function BgMagic() {
  return (
    <svg className="fc-svg-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="magicG" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#0F0520" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#magicG)" />
      {[[50, 50], [150, 120], [300, 40], [450, 90], [600, 50], [720, 130], [100, 250], [400, 200], [680, 220], [200, 350], [550, 320], [750, 280]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2 + i % 3} fill="#FDE047" opacity="0.6">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <g opacity="0.3">
        <rect x="280" y="400" width="240" height="200" fill="#581C87" />
        <rect x="258" y="380" width="62" height="105" fill="#6D28D9" />
        <rect x="480" y="380" width="62" height="105" fill="#6D28D9" />
        <polygon points="289,380 320,318 351,380" fill="#7C3AED" />
        <polygon points="511,380 542,318 573,380" fill="#7C3AED" />
        <rect x="370" y="440" width="60" height="90" fill="#4C1D95" />
        {[0, 1, 2].map(i => (
          <circle key={i} cx={320 + i * 80} cy={455} r="13" fill="#FDE047" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${1.5 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      {[[150, 200, "✨"], [650, 180, "🌟"], [100, 400, "💫"], [700, 380, "⭐"], [420, 500, "✨"]].map(([x, y, e], i) => (
        <text key={i} x={x} y={y} fontSize="32" textAnchor="middle" opacity="0.75">
          {e}
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${1.2 + i * 0.4}s`} repeatCount="indefinite" />
        </text>
      ))}
      <circle cx="400" cy="300" r="80" fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.2">
        <animateTransform attributeName="transform" type="rotate" values="0 400 300;360 400 300" dur="20s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function BgCandy() {
  return (
    <svg className="fc-svg-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="candyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF2F8" />
          <stop offset="100%" stopColor="#FCE7F3" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#candyG)" />
      {[[120, 500], [300, 520], [500, 510], [680, 500]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 3} y={y - 82} width="6" height="82" fill="#D1D5DB" />
          <circle cx={x} cy={y - 84} r="30" fill={["#F472B6", "#FB923C", "#60A5FA", "#4ADE80"][i]} />
          <circle cx={x} cy={y - 84} r="30" fill="none" stroke="white" strokeWidth="7" strokeDasharray="22 16" opacity="0.6" />
        </g>
      ))}
      {[[180, 75], [430, 55], [660, 90]].map(([x, y], i) => (
        <g key={i} opacity="0.65">
          <ellipse cx={x} cy={y} rx="60" ry="26" fill="#FBCFE8" />
          <ellipse cx={x - 30} cy={y + 8} rx="38" ry="21" fill="#FBCFE8" />
          <ellipse cx={x + 30} cy={y + 8} rx="40" ry="21" fill="#FBCFE8" />
        </g>
      ))}
      {[[100, 200], [300, 160], [500, 180], [680, 150], [200, 350], [600, 340]].map(([x, y], i) => (
        <text key={i} x={x} y={y} fontSize={24 + i % 3 * 8} textAnchor="middle" opacity="0.5">
          {["💖", "⭐", "🌸", "💝", "🎀", "✨"][i]}
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
        </text>
      ))}
    </svg>
  );
}

function BgFire() {
  return (
    <svg className="fc-svg-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fireG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c0a00" />
          <stop offset="55%" stopColor="#7C2D12" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#fireG)" />
      {[[80, 600], [200, 600], [340, 600], [500, 600], [640, 600], [750, 600]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y - 42} rx={22 + i % 3 * 10} ry={64 + i % 2 * 32} fill="#F97316" opacity="0.75">
            <animate attributeName="ry" values={`${64 + i % 2 * 32};${84 + i % 2 * 32};${64 + i % 2 * 32}`} dur={`${0.5 + i * 0.15}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${y - 42};${y - 58};${y - 42}`} dur={`${0.5 + i * 0.15}s`} repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={x} cy={y - 52} rx={13 + i % 3 * 6} ry={42 + i % 2 * 22} fill="#FCD34D" opacity="0.65">
            <animate attributeName="ry" values={`${42 + i % 2 * 22};${58 + i % 2 * 22};${42 + i % 2 * 22}`} dur={`${0.4 + i * 0.12}s`} repeatCount="indefinite" />
          </ellipse>
        </g>
      ))}
      {[[210, 110], [610, 155]].map(([x, y], i) => (
        <polygon key={i} points={`${x},${y} ${x - 16},${y + 42} ${x + 5},${y + 42} ${x - 11},${y + 82} ${x + 21},${y + 31} ${x},${y + 31}`}
          fill="#FDE047" opacity="0.75">
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${0.8 + i * 0.3}s`} repeatCount="indefinite" />
        </polygon>
      ))}
      {[[310, 410], [155, 360], [560, 385], [685, 325]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#FDE047" opacity="0.85">
          <animate attributeName="cy" values={`${y};${y - 90};${y - 90}`} dur={`${1 + i * 0.25}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.85;0;0" dur={`${1 + i * 0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

const svgBgs = {
  blue: <BgSpace />,
  green: <BgNature />,
  teal: <BgOcean />,
  purple: <BgMagic />,
  pink: <BgCandy />,
  orange: <BgFire />,
};

function FunBackground({ color }) {
  return (
    <div className="fc-funbg" aria-hidden>
      {svgBgs[color] || svgBgs.blue}
    </div>
  );
}

function FloatingPoints({ value, id }) {
  return (
    <div className={`fc-fp ${value > 0 ? "pos" : "neg"}`} key={id}>
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

function BoomBurst({ show }) {
  if (!show) return null;
  return (
    <div className="fc-boom" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="fc-boom-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
      ))}
      <div className="fc-boom-center">✨</div>
    </div>
  );
}

// ─── HEARTS DISPLAY ───────────────────────────────────────
function Hearts({ mistakes }) {
  const lives = MAX_ATTEMPTS - mistakes;
  return (
    <div className="fc-hearts">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
        <span
          key={i}
          className={`fc-heart ${i < lives ? "alive" : "lost"}`}
        >
          {i < lives ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );
}

export default function FlipCards({ onFinish }) {
  const [cards] = useState(() => shuffle(cardsData));
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [comboShow, setComboShow] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [wrongOption, setWrongOption] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [boomShow, setBoomShow] = useState(false);
  const [mascotState, setMascotState] = useState("idle");
  const [bgColor, setBgColor] = useState("blue");

  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      confetti.reset();
    };
  }, []);

  useEffect(() => {
    const c = new Audio(correctoSound);
    const w = new Audio(incorrectoSound);
    c.preload = "auto"; c.load();
    w.preload = "auto"; w.load();
    correctAudio.current = c;
    wrongAudio.current = w;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!finished) setTimeElapsed(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    const card = cards[current];
    if (!card) return;
    setFlipped(false);
    setAnswered(false);
    setIsCorrect(false);
    setMistakes(0);
    setWrongOption(null);
    setShowCorrect(false);
    setBoomShow(false);
    setMascotState("idle");
    setBgColor(card.color);
    setShuffledOptions(shuffle(card.options));
  }, [current, cards]);

  const addFloater = (val) => {
    const id = Date.now() + Math.random();
    setFloaters(f => [...f, { val, id }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1100);
  };

  const handleFlip = () => {
    if (flipped) return;
    setFlipped(true);
    setBoomShow(true);
    setTimeout(() => setBoomShow(false), 700);
  };

  const handleAnswer = (option, idx) => {
    if (answered || showCorrect) return;
    const card = cards[current];
    const correct = option === card.correct;

    if (correct) {
      correctAudio.current.currentTime = 0;
      correctAudio.current.play();
      setAnswered(true);
      setIsCorrect(true);
      setMascotState("correct");
      setTotalAttempts(a => a + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const bonus = mistakes === 0 ? (newStreak >= 3 ? 15 : newStreak >= 2 ? 12 : 10) : 5;
      setPoints(p => p + bonus);
      setScore(s => s + 1);
      addFloater(bonus);
      if (newStreak >= 3 && mistakes === 0) {
        setComboShow(true);
        setTimeout(() => setComboShow(false), 1500);
      }
      if (mountedRef.current) {
        confetti({
          particleCount: 80, spread: 60, origin: { y: 0.55 },
          colors: ["#4ADE80", "#fff", "#FCD34D", "#60A5FA", "#F472B6"],
        });
      }
    } else {
      wrongAudio.current.currentTime = 0;
      wrongAudio.current.play();
      setStreak(0);
      setPoints(p => Math.max(0, p - 3));
      addFloater(-3);
      setWrongOption(idx);
      setTimeout(() => setWrongOption(null), 600);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setMascotState(newMistakes >= MAX_ATTEMPTS ? "wrong2" : "wrong1");

      if (newMistakes >= MAX_ATTEMPTS) {
        setShowCorrect(true);
        setAnswered(true);
        setIsCorrect(false);
        setTotalAttempts(a => a + 1);
        setTimeout(() => setMascotState("idle"), 2000);
        setTimeout(() => handleNext(), 2500); // Auto-advance
      }
    }

    // Auto-advance for correct answer
    if (correct) {
      setTimeout(() => handleNext(), 2000); // Auto-advance
    }
  };

  const handleNext = () => {
    if (current < cards.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setFinished(true);
      const end = Date.now() + 3500;
      const frame = () => {
        if (!mountedRef.current) return;
        confetti({ particleCount: 16, angle: 60, spread: 75, origin: { x: 0 } });
        confetti({ particleCount: 16, angle: 120, spread: 75, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  };

  const card = cards[current];
  const theme = themes[bgColor] || themes.blue;
  const mascot = MASCOT[mascotState];
  const unitStars = score >= cards.length ? 3 : score >= cards.length * 0.6 ? 2 : 1;

  // ── RESULT ────────────────────────────────────────────
  if (finished) {
    return (
      <div className="fc-screen fc-result" style={{ background: "linear-gradient(160deg,#0F0A1E,#1A1330,#0F0A1E)" }}>
        <FunBackground color="purple" />
        <div className="fc-result-card">
          <div className="fc-result-emoji">{unitStars === 3 ? "🏆" : unitStars === 2 ? "🎯" : "💪"}</div>
          <div className="fc-result-badge">Flip Cards · Complete</div>
          <h2>¡Nivel terminado!</h2>
          <div className="fc-result-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`fc-star ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
            ))}
          </div>
          <div className="fc-result-stats">
            <div className="fc-stat"><span>✅</span><span>Correct</span><strong>{score}/{cards.length}</strong></div>
            <div className="fc-stat"><span>⚡</span><span>Points</span><strong>{points}</strong></div>
            <div className="fc-stat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
            <div className="fc-stat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
          </div>
          {onFinish && (
            <button className="fc-btn-finish" onClick={() => onFinish(score)}>
              Continue 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── GAME ──────────────────────────────────────────────
  return (
    <div className="fc-screen" style={{ background: theme.bg }}>
      <FunBackground color={bgColor} />
      {floaters.map(({ val, id }) => <FloatingPoints key={id} value={val} id={id} />)}
      {comboShow && <div className="fc-combo-banner">🔥 COMBO x{streak}!</div>}

      <div className="fc-header">
        <div className="fc-header-left">
          <div className="fc-level-tag">Level 2</div>
          <div className="fc-title">Flip Cards</div>
        </div>
        <div className="fc-header-right">
          <div className="fc-stat-pill">⚡ {points}</div>
          {streak >= 2 && <div className="fc-streak">🔥 {streak}x</div>}
          <div className="fc-stat-pill">🎯 {totalAttempts}</div>
          <div className="fc-stat-pill">⏱ {timeElapsed}s</div>
        </div>
      </div>

      <div className="fc-dot-progress">
        {cards.map((_, i) => (
          <div key={i} className={`fc-dot ${i < current ? "done" : i === current ? "active" : "pending"}`}>
            {i < current ? "✓" : ""}
          </div>
        ))}
      </div>

      <div className="fc-body">

        <div className={`fc-mascot ${mascotState}`}>
          <div className="fc-mascot-emoji">{mascot.emoji}</div>
          {flipped && <Hearts mistakes={mistakes} />}
          {mascot.label && <div className="fc-mascot-label">{mascot.label}</div>}
        </div>

        <p className="fc-instruction">
          {!flipped
            ? "👆 Tap the card to see the question!"
            : answered && isCorrect
              ? "🎉 Excellent!"
              : showCorrect
                ? "😔 Keep going, you can do it!"
                : mistakes === 1
                  ? "🔁 One more try!"
                  : "👇 Choose the correct answer:"}
        </p>

        <div className="fc-card-scene-wrap">
          <div className="fc-card-scene" onClick={!flipped ? handleFlip : undefined}>
            <div className={`fc-card-inner ${flipped ? "flipped" : ""} ${answered && isCorrect ? "correct-glow" : ""} ${answered && !isCorrect && !showCorrect ? "wrong-shake" : ""}`}>
              <div className="fc-card-face fc-card-back">
                <div className="fc-card-back-content">
                  <span className="fc-card-back-icon">❓</span>
                  <span className="fc-card-back-label">Tap to flip!</span>
                </div>
              </div>
              <div className="fc-card-face fc-card-front" style={{ background: theme.card }}>
                <div className="fc-card-front-content">
                  <span className="fc-card-emoji">{card.emoji}</span>
                  <p className="fc-card-question">{card.question}</p>
                  <div className="fc-card-num">{current + 1} / {cards.length}</div>
                </div>
              </div>
            </div>
          </div>
          <BoomBurst show={boomShow} />
        </div>

        {flipped && (!answered || showCorrect) && (
          <div className="fc-options">
            {shuffledOptions.map((opt, i) => {
              const isWrong = wrongOption === i;
              const isTheCorrect = showCorrect && opt === card.correct;
              return (
                <button
                  key={i}
                  className={`fc-option ${isWrong ? "wrong-shake-btn wrong-opt" : ""} ${isTheCorrect ? "correct-opt" : ""}`}
                  onClick={() => handleAnswer(opt, i)}
                  disabled={showCorrect}
                >
                  <span className="fc-option-icon">
                    {isTheCorrect ? "✅" : isWrong ? "❌" : "💬"}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}



        {!flipped && (
          <div className="fc-tap-hint">
            <div className="fc-tap-circle">👆</div>
          </div>
        )}

      </div>
    </div>
  );
}