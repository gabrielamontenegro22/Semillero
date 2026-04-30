import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import "./Houselevel1.css";
import confetti from "canvas-confetti";

import bedroomAudio from "../../../../assets/sounds/bedroom.mp3";
import kitchenAudio from "../../../../assets/sounds/kitchen.mp3";
import bathroomAudio from "../../../../assets/sounds/bathroom.mp3";
import garageAudio from "../../../../assets/sounds/garage.mp3";
import gardenAudio from "../../../../assets/sounds/garden.mp3";
import stairsAudio from "../../../../assets/sounds/stairs.mp3";
import livingroomAudio from "../../../../assets/sounds/livingroom.mp3";
import diningroomAudio from "../../../../assets/sounds/diningroom.mp3";

import bedroomImg from "../../../../assets/bedroom.png";
import kitchenImg from "../../../../assets/kitchen.png";
import bathroomImg from "../../../../assets/bathroom.png";
import garageImg from "../../../../assets/garage.png";
import gardenImg from "../../../../assets/garden.png";
import stairsImg from "../../../../assets/stairs.png";
import livingroomImg from "../../../../assets/livingroom.png";
import diningroomImg from "../../../../assets/diningroom.png";

import correctoSound from "../../../../assets/sounds/correcto.mp3";
import incorrectoSound from "../../../../assets/sounds/incorrecto.mp3";

const PARTS = [
    { word: "bedroom", display: "bedroom", image: bedroomImg, audio: bedroomAudio, color: "#A78BFA", glow: "rgba(167,139,250,0.7)" },
    { word: "kitchen", display: "kitchen", image: kitchenImg, audio: kitchenAudio, color: "#FB923C", glow: "rgba(251,146,60,0.7)" },
    { word: "bathroom", display: "bathroom", image: bathroomImg, audio: bathroomAudio, color: "#38BDF8", glow: "rgba(56,189,248,0.7)" },
    { word: "garage", display: "garage", image: garageImg, audio: garageAudio, color: "#64748B", glow: "rgba(100,116,139,0.7)" },
    { word: "garden", display: "garden", image: gardenImg, audio: gardenAudio, color: "#10B981", glow: "rgba(16,185,129,0.7)" },
    { word: "stairs", display: "stairs", image: stairsImg, audio: stairsAudio, color: "#B45309", glow: "rgba(180,83,9,0.7)" },
    { word: "livingroom", display: "living room", image: livingroomImg, audio: livingroomAudio, color: "#FF6B9D", glow: "rgba(255,107,157,0.7)" },
    { word: "diningroom", display: "dining room", image: diningroomImg, audio: diningroomAudio, color: "#FCD34D", glow: "rgba(252,211,77,0.7)" },
];

const MAX_LIVES = 2;
const NUM_OPTIONS = 4;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function FloatingPoints({ points, id }) {
    return <div key={id} className={`hl1-floating-points ${points > 0 ? "pos" : "neg"}`}>
        {points > 0 ? `+${points}` : points}
    </div>;
}

const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
    cx: (i * 311 + 73) % 1440,
    cy: (i * 167 + 53) % 600,
    r: 2 + (i % 3) * 1.2,
    delay: `${(i * 0.31) % 4}s`,
    dur: `${1.8 + (i % 3) * 0.6}s`,
}));

const HouseBg = memo(function HouseBg({ color }) {
    return (
        <svg className="hl1-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                {/* Pared con gradiente cálido pastel SUAVE */}
                <linearGradient id="hl1Wall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FEFCE8" />
                    <stop offset="50%" stopColor="#FEF9C3" />
                    <stop offset="100%" stopColor="#FEF3C7" />
                </linearGradient>

                {/* Glow del color de la ronda */}
                <radialGradient id="hl1Glow" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>

                {/* Piso de madera */}
                <linearGradient id="hl1Floor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#92400E" />
                    <stop offset="100%" stopColor="#451A03" />
                </linearGradient>

                {/* Vista al jardín por la ventana */}
                <linearGradient id="hl1WindowSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7DD3FC" />
                    <stop offset="60%" stopColor="#BAE6FD" />
                    <stop offset="100%" stopColor="#86EFAC" />
                </linearGradient>

                {/* Cortinas */}
                <linearGradient id="hl1Curtain" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F472B6" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#DB2777" />
                </linearGradient>

                {/* Sofá */}
                <linearGradient id="hl1Sofa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>

                {/* Alfombra */}
                <linearGradient id="hl1Rug" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="50%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>

                {/* Maceta */}
                <linearGradient id="hl1Pot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#9A3412" />
                </linearGradient>

                {/* Lámpara */}
                <radialGradient id="hl1Lamp" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF9C3" />
                    <stop offset="80%" stopColor="#FCD34D" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </radialGradient>

                {/* Vignette */}
                <radialGradient id="hl1Vignette" cx="50%" cy="50%" r="75%">
                    <stop offset="60%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#451A03" stopOpacity="0.25" />
                </radialGradient>

                {/* Patrón de papel tapiz: corazoncitos más sutiles */}
                <pattern id="hl1Wallpaper" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M40,30 C30,20 18,28 22,38 C26,48 40,55 40,55 C40,55 54,48 58,38 C62,28 50,20 40,30 Z"
                        fill="#F472B6" opacity="0.10" />
                </pattern>
            </defs>

            {/* === PARED === más alta para más espacio */}
            <rect width="1440" height="650" fill="url(#hl1Wall)" />
            <rect width="1440" height="650" fill="url(#hl1Wallpaper)" />

            {/* Glow del color de la ronda */}
            <rect width="1440" height="900" fill="url(#hl1Glow)" />

            {/* Zócalo de madera */}
            <rect x="0" y="630" width="1440" height="20" fill="#92400E" />
            <rect x="0" y="650" width="1440" height="6" fill="#451A03" />

            {/* === PISO === ahora desde y=650 */}
            <rect y="650" width="1440" height="250" fill="url(#hl1Floor)" />
            {/* Tablones del piso */}
            {Array.from({ length: 8 }, (_, i) => (
                <line key={`fl${i}`}
                    x1={i * 180} y1="650" x2={i * 180} y2="900"
                    stroke="#451A03" strokeWidth="2" opacity="0.6" />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
                <line key={`fh${i}`}
                    x1="0" y1={680 + i * 30} x2="1440" y2={680 + i * 30}
                    stroke="#7C2D12" strokeWidth="0.5" opacity="0.4" />
            ))}

            {/* === VENTANA con cortinas (izquierda superior) === */}
            <g>
                {/* Marco exterior */}
                <rect x="80" y="100" width="280" height="220" fill="#92400E" rx="6" />
                {/* Vidrio con vista al jardín */}
                <rect x="92" y="112" width="256" height="196" fill="url(#hl1WindowSky)" />
                {/* Cruz de la ventana */}
                <line x1="220" y1="112" x2="220" y2="308" stroke="#92400E" strokeWidth="6" />
                <line x1="92" y1="210" x2="348" y2="210" stroke="#92400E" strokeWidth="6" />
                {/* Sol pequeño en el horizonte */}
                <circle cx="280" cy="160" r="22" fill="#FCD34D" opacity="0.95">
                    <animate attributeName="r" values="22;25;22" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Nubes pequeñas */}
                <ellipse cx="140" cy="150" rx="22" ry="10" fill="white" opacity="0.9">
                    <animate attributeName="cx" values="140;160;140" dur="6s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="170" cy="170" rx="16" ry="8" fill="white" opacity="0.85">
                    <animate attributeName="cx" values="170;190;170" dur="7s" repeatCount="indefinite" />
                </ellipse>
                {/* Pájaro volando */}
                <path d="M 200,190 Q 205,186 210,190 Q 215,186 220,190" stroke="#1F2937" strokeWidth="2" fill="none">
                    <animateMotion path="M 0,0 L 50,-10 L 100,5 L 150,-15" dur="8s" repeatCount="indefinite" />
                </path>
                {/* Pasto en el horizonte */}
                <rect x="92" y="270" width="256" height="38" fill="#10B981" opacity="0.6" />
                {/* Cortinas izquierda */}
                <path d="M 60,90 Q 70,180 65,320 L 95,320 Q 92,180 95,90 Z" fill="url(#hl1Curtain)" opacity="0.95" />
                {/* Cortinas derecha */}
                <path d="M 380,90 Q 370,180 375,320 L 345,320 Q 348,180 345,90 Z" fill="url(#hl1Curtain)" opacity="0.95" />
                {/* Barra de la cortina */}
                <rect x="50" y="80" width="340" height="10" fill="#451A03" rx="4" />
                <circle cx="55" cy="85" r="8" fill="#FCD34D" />
                <circle cx="385" cy="85" r="8" fill="#FCD34D" />
                {/* Maceta en el alféizar */}
                <rect x="180" y="325" width="80" height="35" fill="url(#hl1Pot)" rx="4" />
                {/* Plantita en la maceta */}
                <ellipse cx="220" cy="315" rx="28" ry="22" fill="#10B981" />
                <ellipse cx="205" cy="305" rx="14" ry="14" fill="#34D399" />
                <ellipse cx="235" cy="305" rx="14" ry="14" fill="#86EFAC" />
                <circle cx="200" cy="300" r="6" fill="#F472B6" />
                <circle cx="240" cy="300" r="6" fill="#FCD34D" />
                <circle cx="220" cy="290" r="6" fill="#FF6B9D" />
            </g>

            {/* === 3 CUADROS A LA DERECHA === */}
            <g>
                {/* Cuadro 1 - Casa */}
                <rect x="950" y="130" width="120" height="100" fill="#fff" stroke="#92400E" strokeWidth="6" rx="4" />
                <rect x="958" y="138" width="104" height="84" fill="#BAE6FD" />
                <polygon points="980,190 980,160 1010,140 1040,160 1040,190" fill="#DC2626" />
                <rect x="990" y="170" width="40" height="20" fill="#FEF3C7" />
                <rect x="1005" y="175" width="10" height="15" fill="#92400E" />
                <circle cx="1050" cy="150" r="6" fill="#FCD34D" />

                {/* Cuadro 2 - Corazón */}
                <rect x="1100" y="150" width="100" height="100" fill="#fff" stroke="#92400E" strokeWidth="6" rx="4" />
                <rect x="1108" y="158" width="84" height="84" fill="#FFE4F1" />
                <path d="M1150,230 C1130,215 1118,195 1130,185 C1140,180 1148,185 1150,192 C1152,185 1160,180 1170,185 C1182,195 1170,215 1150,230 Z"
                    fill="#FF6B9D">
                    <animateTransform attributeName="transform" type="scale" values="1;1.08;1"
                        additive="sum" dur="1.5s" repeatCount="indefinite" />
                </path>

                {/* Cuadro 3 - Estrella */}
                <rect x="1230" y="130" width="100" height="100" fill="#fff" stroke="#92400E" strokeWidth="6" rx="4" />
                <rect x="1238" y="138" width="84" height="84" fill="#FEF3C7" />
                <polygon points="1280,150 1290,180 1322,180 1296,198 1306,228 1280,210 1254,228 1264,198 1238,180 1270,180"
                    fill="#FCD34D" stroke="#F59E0B" strokeWidth="2">
                    <animateTransform attributeName="transform" type="rotate" from="0 1280 189" to="360 1280 189" dur="20s" repeatCount="indefinite" />
                </polygon>
            </g>

            {/* === LÁMPARA COLGANTE === */}
            <g>
                {/* Cable */}
                <line x1="720" y1="0" x2="720" y2="100" stroke="#451A03" strokeWidth="3" />
                {/* Lámpara */}
                <ellipse cx="720" cy="120" rx="50" ry="35" fill="url(#hl1Lamp)" />
                <ellipse cx="720" cy="115" rx="50" ry="8" fill="#F59E0B" />
                {/* Luz que emite */}
                <ellipse cx="720" cy="160" rx="80" ry="20" fill="#FEF9C3" opacity="0.5">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.5s" repeatCount="indefinite" />
                </ellipse>
            </g>

            {/* === ESTANTERÍA pequeña a la izquierda === SUBIDA */}
            <g>
                <rect x="60" y="400" width="220" height="220" fill="#92400E" rx="2" />
                <rect x="68" y="408" width="204" height="64" fill="#451A03" />
                <rect x="68" y="480" width="204" height="64" fill="#451A03" />
                <rect x="68" y="552" width="204" height="60" fill="#451A03" />
                {/* Libros estante 1 */}
                {[
                    { x: 75, color: "#DC2626", h: 56 },
                    { x: 95, color: "#FCD34D", h: 50 },
                    { x: 110, color: "#10B981", h: 58 },
                    { x: 130, color: "#A78BFA", h: 52 },
                    { x: 145, color: "#FF6B9D", h: 56 },
                    { x: 165, color: "#38BDF8", h: 54 },
                    { x: 185, color: "#FB923C", h: 58 },
                    { x: 205, color: "#F472B6", h: 50 },
                    { x: 225, color: "#06D6A0", h: 56 },
                    { x: 245, color: "#FBBF24", h: 52 },
                ].map((b, i) => (
                    <rect key={`bk${i}`} x={b.x} y={470 - b.h} width="14" height={b.h} fill={b.color} stroke="#1F2937" strokeWidth="1" />
                ))}
                {/* Estante 2 - macetas y decoración */}
                <rect x="85" y="490" width="40" height="50" fill="url(#hl1Pot)" rx="2" />
                <ellipse cx="105" cy="485" rx="20" ry="12" fill="#10B981" />
                <ellipse cx="98" cy="478" rx="8" ry="8" fill="#34D399" />
                <ellipse cx="115" cy="478" rx="8" ry="8" fill="#86EFAC" />
                {/* Globo terráqueo */}
                <circle cx="170" cy="515" r="22" fill="#3B82F6" />
                <ellipse cx="170" cy="515" rx="22" ry="6" fill="#60A5FA" opacity="0.5" />
                <path d="M 156,510 Q 165,508 175,512 Q 178,515 173,520 Q 162,522 158,518 Z" fill="#10B981" />
                <path d="M 178,522 Q 184,518 186,524 Q 184,530 178,528 Z" fill="#10B981" />
                <line x1="148" y1="515" x2="192" y2="515" stroke="#1F2937" strokeWidth="1" />
                <rect x="166" y="538" width="8" height="6" fill="#451A03" />
                {/* Trofeo */}
                <path d="M 215,490 L 215,510 Q 215,525 225,530 Q 235,525 235,510 L 235,490 Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" />
                <rect x="220" y="530" width="10" height="6" fill="#92400E" />
                <rect x="215" y="536" width="20" height="4" fill="#451A03" />
                {/* Estante 3 - relojes y cositas */}
                <circle cx="105" cy="580" r="20" fill="#fff" stroke="#92400E" strokeWidth="2" />
                <line x1="105" y1="580" x2="105" y2="568" stroke="#1F2937" strokeWidth="2">
                    <animateTransform attributeName="transform" type="rotate" from="0 105 580" to="360 105 580" dur="60s" repeatCount="indefinite" />
                </line>
                <line x1="105" y1="580" x2="115" y2="585" stroke="#1F2937" strokeWidth="1.5">
                    <animateTransform attributeName="transform" type="rotate" from="0 105 580" to="360 105 580" dur="3600s" repeatCount="indefinite" />
                </line>
                <circle cx="105" cy="580" r="2" fill="#1F2937" />
                <text x="105" y="565" fontSize="6" textAnchor="middle" fill="#1F2937" fontWeight="bold">12</text>
                <text x="118" y="582" fontSize="6" textAnchor="middle" fill="#1F2937" fontWeight="bold">3</text>
                <text x="105" y="598" fontSize="6" textAnchor="middle" fill="#1F2937" fontWeight="bold">6</text>
                <text x="92" y="582" fontSize="6" textAnchor="middle" fill="#1F2937" fontWeight="bold">9</text>
                {/* Carrito de juguete */}
                <rect x="160" y="575" width="40" height="20" fill="#DC2626" rx="3" />
                <rect x="170" y="565" width="22" height="14" fill="#EF4444" rx="2" />
                <circle cx="170" cy="600" r="6" fill="#1F2937" />
                <circle cx="190" cy="600" r="6" fill="#1F2937" />
                <circle cx="170" cy="600" r="2" fill="#fff" />
                <circle cx="190" cy="600" r="2" fill="#fff" />
                {/* Pelota */}
                <circle cx="240" cy="590" r="14" fill="#FF6B9D" />
                <path d="M 226,590 Q 240,582 254,590" stroke="#fff" strokeWidth="1.5" fill="none" />
                <path d="M 226,590 Q 240,598 254,590" stroke="#fff" strokeWidth="1.5" fill="none" />
            </g>

            {/* === SOFÁ === SUBIDO ARRIBA, MÁS PEQUEÑO */}
            <g>
                {/* Sombra */}
                <ellipse cx="720" cy="780" rx="180" ry="10" fill="#000" opacity="0.2" />
                {/* Cuerpo del sofá */}
                <rect x="580" y="660" width="280" height="80" fill="url(#hl1Sofa)" rx="12" />
                {/* Espaldar */}
                <rect x="580" y="635" width="280" height="50" fill="url(#hl1Sofa)" rx="12" />
                {/* Cojines */}
                <rect x="595" y="670" width="80" height="40" fill="#C4B5FD" rx="6" stroke="#7C3AED" strokeWidth="1.5" />
                <rect x="685" y="670" width="80" height="40" fill="#DDD6FE" rx="6" stroke="#7C3AED" strokeWidth="1.5" />
                <rect x="775" y="670" width="80" height="40" fill="#C4B5FD" rx="6" stroke="#7C3AED" strokeWidth="1.5" />
                {/* Cojines decorativos */}
                <circle cx="618" cy="652" r="18" fill="#FCD34D" />
                <circle cx="822" cy="652" r="18" fill="#FF6B9D" />
                <text x="618" y="657" fontSize="16" textAnchor="middle">⭐</text>
                <text x="822" y="657" fontSize="16" textAnchor="middle">💗</text>
                {/* Patas */}
                <rect x="595" y="740" width="12" height="20" fill="#451A03" rx="2" />
                <rect x="833" y="740" width="12" height="20" fill="#451A03" rx="2" />
            </g>

            {/* === MESA DE CENTRO con tetera === SUBIDA */}
            <g>
                <rect x="650" y="745" width="140" height="12" fill="#92400E" rx="3" />
                <rect x="660" y="757" width="6" height="35" fill="#451A03" />
                <rect x="774" y="757" width="6" height="35" fill="#451A03" />
                {/* Tetera */}
                <ellipse cx="700" cy="735" rx="20" ry="16" fill="#fff" stroke="#92400E" strokeWidth="2" />
                <path d="M 680,737 Q 670,737 670,745 Q 670,752 678,749" fill="none" stroke="#92400E" strokeWidth="2" />
                <path d="M 718,724 Q 728,721 726,716" fill="none" stroke="#92400E" strokeWidth="2" />
                <ellipse cx="700" cy="722" rx="6" ry="4" fill="#92400E" />
                <circle cx="700" cy="733" r="2.5" fill="#FF6B9D" />
                <circle cx="690" cy="736" r="2" fill="#FF6B9D" />
                <circle cx="710" cy="738" r="2" fill="#FF6B9D" />
                {/* Vapor */}
                <path d="M 700,716 Q 696,706 700,698 Q 704,690 700,682" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.7">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                </path>
                {/* Tazas */}
                <ellipse cx="745" cy="743" rx="9" ry="5" fill="#fff" stroke="#92400E" strokeWidth="1.5" />
                <ellipse cx="745" cy="741" rx="7" ry="2.5" fill="#7C2D12" />
                <path d="M 753,743 Q 760,741 758,746" stroke="#92400E" strokeWidth="1.5" fill="none" />
                <ellipse cx="660" cy="743" rx="9" ry="5" fill="#fff" stroke="#92400E" strokeWidth="1.5" />
                <ellipse cx="660" cy="741" rx="7" ry="2.5" fill="#7C2D12" />
                <path d="M 668,743 Q 675,741 673,746" stroke="#92400E" strokeWidth="1.5" fill="none" />
            </g>

            {/* === ALFOMBRA en el piso === MÁS ARRIBA */}
            <g>
                <ellipse cx="720" cy="800" rx="340" ry="22" fill="url(#hl1Rug)" />
                {/* Patrón de la alfombra */}
                <ellipse cx="720" cy="800" rx="280" ry="18" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
                <ellipse cx="720" cy="800" rx="200" ry="12" fill="none" stroke="#FCD34D" strokeWidth="2" opacity="0.7" />
                <ellipse cx="720" cy="800" rx="120" ry="8" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
            </g>

            {/* === GATO DORMIDO en la alfombra === SUBIDO Y MÁS PEQUEÑO */}
            <g>
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="3s" repeatCount="indefinite" />
                {/* Cuerpo */}
                <ellipse cx="1050" cy="790" rx="45" ry="18" fill="#FCD34D" />
                <ellipse cx="1050" cy="788" rx="45" ry="16" fill="#FBBF24" />
                {/* Cabeza */}
                <circle cx="1090" cy="784" r="18" fill="#FCD34D" />
                {/* Orejas */}
                <polygon points="1080,772 1084,762 1088,772" fill="#FCD34D" />
                <polygon points="1092,772 1096,762 1100,772" fill="#FCD34D" />
                <polygon points="1082,770 1084,766 1086,770" fill="#FF6B9D" />
                <polygon points="1094,770 1096,766 1098,770" fill="#FF6B9D" />
                {/* Ojos cerrados */}
                <path d="M 1083,783 Q 1085,781 1087,783" stroke="#1F2937" strokeWidth="1.5" fill="none" />
                <path d="M 1093,783 Q 1095,781 1097,783" stroke="#1F2937" strokeWidth="1.5" fill="none" />
                {/* Naricita */}
                <path d="M 1090,788 L 1088,791 L 1092,791 Z" fill="#FF6B9D" />
                {/* Bigotes */}
                <line x1="1078" y1="789" x2="1070" y2="788" stroke="#92400E" strokeWidth="0.6" />
                <line x1="1078" y1="791" x2="1070" y2="792" stroke="#92400E" strokeWidth="0.6" />
                <line x1="1102" y1="789" x2="1110" y2="788" stroke="#92400E" strokeWidth="0.6" />
                <line x1="1102" y1="791" x2="1110" y2="792" stroke="#92400E" strokeWidth="0.6" />
                {/* Cola enroscada */}
                <path d="M 1010,790 Q 998,786 1002,778 Q 1010,773 1015,782" fill="none" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" />
                {/* Rayas */}
                <ellipse cx="1030" cy="784" rx="2.5" ry="5" fill="#F59E0B" />
                <ellipse cx="1050" cy="784" rx="2.5" ry="5" fill="#F59E0B" />
                <ellipse cx="1070" cy="784" rx="2.5" ry="5" fill="#F59E0B" />
                {/* Z de dormir */}
                <text x="1118" y="760" fontSize="14" fill="#A78BFA" fontWeight="bold" opacity="0.7">
                    💤
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                </text>
            </g>

            {/* === PLANTA GRANDE en maceta a la derecha === SUBIDA */}
            <g>
                {/* Maceta */}
                <path d="M 1280,750 L 1290,800 L 1370,800 L 1380,750 Z" fill="url(#hl1Pot)" stroke="#7C2D12" strokeWidth="2" />
                <ellipse cx="1330" cy="750" rx="50" ry="8" fill="#9A3412" stroke="#7C2D12" strokeWidth="1.5" />
                {/* Tallos */}
                <path d="M 1330,750 Q 1310,720 1300,680" stroke="#10B981" strokeWidth="3" fill="none" />
                <path d="M 1330,750 Q 1340,730 1355,700" stroke="#10B981" strokeWidth="3" fill="none" />
                <path d="M 1330,750 Q 1330,720 1330,670" stroke="#10B981" strokeWidth="3" fill="none" />
                {/* Hojas grandes */}
                <ellipse cx="1300" cy="675" rx="22" ry="38" fill="#10B981" transform="rotate(-15 1300 675)">
                    <animateTransform attributeName="transform" type="rotate" values="-15 1300 675;-10 1300 675;-15 1300 675" dur="4s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="1355" cy="695" rx="20" ry="34" fill="#34D399" transform="rotate(20 1355 695)">
                    <animateTransform attributeName="transform" type="rotate" values="20 1355 695;15 1355 695;20 1355 695" dur="4.5s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="1330" cy="665" rx="22" ry="40" fill="#059669">
                    <animateTransform attributeName="transform" type="rotate" values="0 1330 665;5 1330 665;0 1330 665" dur="5s" repeatCount="indefinite" />
                </ellipse>
                {/* Cara feliz en la maceta */}
                <circle cx="1320" cy="775" r="2" fill="#1F2937" />
                <circle cx="1340" cy="775" r="2" fill="#1F2937" />
                <path d="M 1320,785 Q 1330,790 1340,785" stroke="#1F2937" strokeWidth="1.5" fill="none" />
            </g>

            {/* === ESPEJO REDONDO en la pared === */}
            <g>
                <circle cx="450" cy="260" r="55" fill="#fff" stroke="#FCD34D" strokeWidth="6" />
                <circle cx="450" cy="260" r="50" fill="#E0F2FE" />
                {/* Reflejo */}
                <ellipse cx="430" cy="240" rx="18" ry="22" fill="#fff" opacity="0.7" />
                {/* Adorno superior */}
                <circle cx="450" cy="200" r="6" fill="#FCD34D" />
                <path d="M 450,206 L 450,214" stroke="#FCD34D" strokeWidth="3" />
            </g>

            {/* === MARIPOSA volando === */}
            <g>
                <animateMotion path="M 0,0 Q 200,-50 400,30 Q 600,-30 800,40 Q 1000,-20 1200,30" dur="20s" repeatCount="indefinite" />
                <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FF6B9D" opacity="0.9" transform="rotate(-25 0 0)" />
                <ellipse cx="14" cy="2" rx="14" ry="10" fill="#A78BFA" opacity="0.9" transform="rotate(25 14 2)" />
                <ellipse cx="2" cy="8" rx="9" ry="6" fill="#F472B6" opacity="0.7" />
                <ellipse cx="12" cy="9" rx="9" ry="6" fill="#7C3AED" opacity="0.7" />
                <line x1="7" y1="-5" x2="7" y2="14" stroke="#1F2937" strokeWidth="1.5" />
            </g>

            {/* === SPARKLES dispersos === */}
            {SPARKLES.map((s, i) => (
                <circle key={`sp${i}`}
                    cx={s.cx} cy={s.cy} r={s.r}
                    fill="#fff" opacity="0.85"
                    style={{ animation: `hl1-sparkle ${s.dur} ${s.delay} ease-in-out infinite alternate` }} />
            ))}

            {/* Vignette suave */}
            <rect width="1440" height="900" fill="url(#hl1Vignette)" />
        </svg>
    );
});

export default function HouseLevel1({ onFinish }) {
    const [questions] = useState(() => shuffle([...PARTS]));
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
    const [feedback, setFeedback] = useState(null);
    const [revealCorrect, setRevealCorrect] = useState(null);
    const [lives, setLives] = useState(MAX_LIVES);
    const [audioReady, setAudioReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [solved, setSolved] = useState(false);
    const [showRetryBanner, setShowRetryBanner] = useState(false);

    const audioRefs = useRef({});
    const correctRef = useRef(null);
    const wrongRef = useRef(null);
    const mountedRef = useRef(true);
    const audioRef = useRef(null);
    const isProcessingRef = useRef(false);
    const perfectRef = useRef(0);
    const timeoutRef = useRef([]);

    const currentPart = questions[current];

    // Generar 4 opciones para esta ronda
    const options = useState(() => {
        return questions.map(q => {
            const others = PARTS.filter(p => p.word !== q.word);
            const distractors = shuffle(others).slice(0, NUM_OPTIONS - 1);
            return shuffle([q, ...distractors]);
        });
    })[0];

    const currentOptions = options[current];

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
        const audiosToLoad = PARTS.filter(p => roundWords.includes(p.word));

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
        if (audioReady && !finished && !solved) {
            const timer = setTimeout(() => {
                if (mountedRef.current && !hasPlayed) playAudio();
            }, 50);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, audioReady, finished]);

    const playAudio = useCallback(() => {
        const baseAudio = audioRefs.current[currentPart.word];
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
    }, [currentPart]);

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
            setHasPlayed(false);
            setSolved(false);
            setErrorsThisRound(0);
            setLives(MAX_LIVES);
            setFeedback(null);
            setRevealCorrect(null);
            setShowRetryBanner(false);
        } else {
            setFinished(true);
            const end = Date.now() + 3000;
            const frame = () => {
                if (!mountedRef.current) return;
                confetti({ particleCount: 16, angle: 60, spread: 80, origin: { x: 0 }, colors: ["#FCD34D", "#FF6B9D", "#A78BFA", "#10B981"] });
                confetti({ particleCount: 16, angle: 120, spread: 80, origin: { x: 1 }, colors: ["#FCD34D", "#FF6B9D", "#A78BFA", "#10B981"] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, [questions]);

    const handleSelect = useCallback((selectedPart) => {
        if (solved || finished) return;
        if (!correctRef.current || !wrongRef.current) return;
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const isCorrect = selectedPart.word === currentPart.word;

        if (isCorrect) {
            setSolved(true);
            setFeedback({ word: selectedPart.word, type: "correct" });
            setAnswers(prev => ({ ...prev, [currentPart.word]: true }));
            correctRef.current.cloneNode().play().catch(() => { });
            setAttempts(a => a + 1);

            let bonus = 20;
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
                particleCount: 130, spread: 110, origin: { y: 0.5 },
                colors: [currentPart.color, "#FCD34D", "#fff", "#FF6B9D", "#10B981", "#A78BFA"]
            });

            setBounce(true);
            const t1 = setTimeout(() => setBounce(false), 600);
            timeoutRef.current.push(t1);

            const t2 = setTimeout(() => {
                if (mountedRef.current) triggerNext(current);
            }, 1800);
            timeoutRef.current.push(t2);
        } else {
            wrongRef.current.cloneNode().play().catch(() => { });
            setFeedback({ word: selectedPart.word, type: "wrong" });
            setShake(true);
            const tShake = setTimeout(() => setShake(false), 500);
            timeoutRef.current.push(tShake);
            setErrorsThisRound(e => e + 1);
            setStreak(0);

            const newLives = lives - 1;
            setLives(newLives);

            if (newLives <= 0) {
                setSolved(true);
                setRevealCorrect(currentPart.word);
                setShowRetryBanner(false);
                setAnswers(prev => ({ ...prev, [currentPart.word]: false }));
                setAttempts(a => a + 1);

                const tAudio = setTimeout(() => {
                    if (mountedRef.current) playAudio();
                }, 500);
                timeoutRef.current.push(tAudio);

                const tNext = setTimeout(() => {
                    if (mountedRef.current) triggerNext(current);
                }, 2200);
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

                const tRelease = setTimeout(() => {
                    if (mountedRef.current) {
                        isProcessingRef.current = false;
                        setFeedback(null);
                    }
                }, 700);
                timeoutRef.current.push(tRelease);
            }
        }
    }, [solved, finished, currentPart, errorsThisRound, streak, bestStreak, lives, current, triggerNext, playAudio]);

    const score = questions.reduce((acc, q) => (answers[q.word] === true ? acc + 1 : acc), 0);
    const progress = ((current + (solved ? 1 : 0)) / questions.length) * 100;
    const roundColor = currentPart?.color || "#FBBF24";
    const roundGlow = currentPart?.glow || "rgba(251,191,36,0.7)";
    const unitStars = perfectRef.current >= questions.length ? 3 : score >= questions.length * 0.6 ? 2 : 1;

    if (finished) return (
        <div className="hl1-game-root hl1-result-container">
            <HouseBg color="#FBBF24" />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}
            <div className="hl1-result-card">
                <div className="hl1-result-emoji">🏆</div>
                <div className="hl1-result-badge">🏠 House · Level 1 🎧</div>
                <h2 className="hl1-result-title">¡Conoces tu casa!</h2>
                <div className="hl1-result-stars">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`hl1-rstar ${i < unitStars ? "lit" : "dim"}`}>⭐</span>
                    ))}
                </div>
                <div className="hl1-result-stats">
                    <div className="hl1-rstat"><span>✅</span><span>Correct</span><strong>{score}/{questions.length}</strong></div>
                    <div className="hl1-rstat"><span>⚡</span><span>Points</span><strong>{totalPoints}</strong></div>
                    <div className="hl1-rstat"><span>🔥</span><span>Best streak</span><strong>{bestStreak}x</strong></div>
                    <div className="hl1-rstat"><span>🎯</span><span>Attempts</span><strong>{attempts}</strong></div>
                    <div className="hl1-rstat"><span>⏱</span><span>Time</span><strong>{timeElapsed}s</strong></div>
                </div>
                {onFinish && (
                    <button className="hl1-result-btn" onClick={() => onFinish(score)}>
                        Finalizar 🎉
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="hl1-game-root">
            <HouseBg color={roundColor} />
            {floatingPoints.map(({ pts, id }) => <FloatingPoints key={id} points={pts} id={id} />)}

            <div className="hl1-header-bar">
                <div className="hl1-header-left">
                    <span className="hl1-header-badge">Level 1</span>
                    <span className="hl1-header-title">🎧 Listening</span>
                </div>
                <div className="hl1-header-right">
                    <div className="hl1-header-pill">⚡ {totalPoints}</div>
                    {streak >= 2 && <div className="hl1-header-pill hl1-streak-pill">🔥 {streak}x</div>}
                    <div className="hl1-header-pill">🎯 {attempts}</div>
                    <div className="hl1-header-pill">⏱ {timeElapsed}s</div>
                </div>
            </div>

            <div className="hl1-listen-container">
                <div className={`hl1-wrapper ${shake ? "hl1-shake" : ""} ${bounce ? "hl1-bounce" : ""}`}>

                    <div className="hl1-progress-track">
                        <div className="hl1-progress-fill"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg,${roundColor},#FCD34D)`,
                                boxShadow: `0 0 12px ${roundGlow}`
                            }} />
                        <div className="hl1-progress-steps">
                            {questions.map((_, i) => (
                                <div key={i} className={`hl1-progress-dot ${i < current ? "done" : i === current ? "active" : ""}`}
                                    style={i === current ? { background: roundColor, boxShadow: `0 0 8px ${roundColor}` } : {}} />
                            ))}
                        </div>
                    </div>

                    <p className="hl1-instruction">🎧 Listen and tap the correct part of the house!</p>

                    {/* Botón Play + Lives */}
                    <div className="hl1-play-row">
                        <button
                            className={`hl1-play-btn ${isPlaying ? "playing" : ""}`}
                            onClick={playAudio}
                            disabled={isPlaying || solved}
                            style={{
                                background: `linear-gradient(135deg, ${roundColor}, #FCD34D)`,
                                boxShadow: `0 14px 40px ${roundGlow}, 0 0 32px ${roundGlow}`
                            }}
                            aria-label="Reproducir audio"
                        >
                            <span className="hl1-play-icon">{isPlaying ? "🔊" : "▶"}</span>
                            <span className="hl1-play-text">{isPlaying ? "Listen…" : "Play"}</span>
                        </button>

                        <div className="hl1-lives-container">
                            {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                <span key={i} className={`hl1-heart ${i < lives ? "alive" : "lost"}`}>
                                    {i < lives ? "❤️" : "🖤"}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Banner slot reservado */}
                    <div className="hl1-banner-slot">
                        {showRetryBanner && (
                            <div className="hl1-retry-banner">❌ ¡Casi! 🎧 Escucha otra vez</div>
                        )}
                        {revealCorrect && (
                            <div className="hl1-retry-banner found">
                                ✨ Era "{currentPart.display}"
                            </div>
                        )}
                    </div>

                    {/* Grid de opciones - imágenes libres con pill */}
                    <div className="hl1-options-grid">
                        {currentOptions.map((opt) => {
                            const isFb = feedback?.word === opt.word;
                            const isCorrect = isFb && feedback.type === "correct";
                            const isWrong = isFb && feedback.type === "wrong";
                            const isReveal = revealCorrect === opt.word;

                            return (
                                <button
                                    key={opt.word}
                                    className={`hl1-option ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""} ${isReveal ? "reveal-correct" : ""}`}
                                    onClick={() => handleSelect(opt)}
                                    disabled={solved || finished}
                                    style={{
                                        "--opt-color": opt.color,
                                        "--opt-glow": opt.glow
                                    }}
                                >
                                    <img src={opt.image} alt={opt.display} className="hl1-option-img" />
                                    <span className="hl1-option-pill">{opt.display}</span>
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}