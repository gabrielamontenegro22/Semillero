import React from "react";
import "./GameBackgrounds.css";

function BgSpace() {
  return (
    <svg className="gbg-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
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
      <g className="gbg-rocket">
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
    <svg className="gbg-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
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
      <g className="gbg-butterfly">
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
    <svg className="gbg-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
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
      <g className="gbg-fish1">
        <ellipse cx="200" cy="250" rx="36" ry="20" fill="#FCD34D" />
        <polygon points="236,250 262,232 262,268" fill="#FCD34D" />
        <circle cx="195" cy="245" r="5" fill="#1e1b4b" />
        <circle cx="196" cy="244" r="2" fill="white" />
      </g>
      <g className="gbg-fish2">
        <ellipse cx="600" cy="180" rx="28" ry="16" fill="#F472B6" />
        <polygon points="572,180 548,164 548,196" fill="#F472B6" />
        <circle cx="605" cy="176" r="4" fill="#1e1b4b" />
        <circle cx="606" cy="175" r="1.5" fill="white" />
      </g>
      <g className="gbg-dolphin">
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
    <svg className="gbg-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
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
        <text key={i} x={x} y={y} fontSize="32" textAnchor="middle" opacity="0.75">{e}
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
    <svg className="gbg-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
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
      {[[100, 200], [300, 160], [500, 180], [680, 150], [200, 350], [600, 340]].map(([x, y, e], i) => (
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
    <svg className="gbg-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
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

const bgMap = {
  blue: <BgSpace />,
  green: <BgNature />,
  teal: <BgOcean />,
  purple: <BgMagic />,
  pink: <BgCandy />,
  orange: <BgFire />,
};

export default function GameBackground({ color = "blue" }) {
  return (
    <div className="gbg-wrap" aria-hidden>
      {bgMap[color] || bgMap.blue}
    </div>
  );
}