"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Lightweight cinematic centerpiece for the home hero.
 * SVG keeps it crisp and responsive without introducing a WebGL dependency.
 */
export function CinematicCore() {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : 18;

  return (
    <div className="cinematic-core relative mx-auto aspect-square w-full max-w-[430px]" aria-hidden="true">
      <div className="core-halo absolute inset-[8%] rounded-full" />
      <div className="core-grid absolute inset-[4%] rounded-full" />
      <svg viewBox="0 0 420 420" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <radialGradient id="core-fill" cx="35%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#8ff2ff" stopOpacity=".95" />
            <stop offset="35%" stopColor="#38d3ff" stopOpacity=".68" />
            <stop offset="72%" stopColor="#2f5dfa" stopOpacity=".2" />
            <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="core-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38d3ff" />
            <stop offset="52%" stopColor="#5b8bff" />
            <stop offset="100%" stopColor="#ffb648" />
          </linearGradient>
          <filter id="core-blur"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>

        <circle cx="210" cy="210" r="112" fill="url(#core-fill)" filter="url(#core-blur)" opacity=".8" />
        <motion.g
          style={{ transformOrigin: "210px 210px" }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        >
          <ellipse cx="210" cy="210" rx="155" ry="57" fill="none" stroke="url(#core-stroke)" strokeWidth="1.2" opacity=".8" />
          <ellipse cx="210" cy="210" rx="155" ry="57" fill="none" stroke="#38d3ff" strokeWidth="5" strokeDasharray="2 42" strokeLinecap="round" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "210px 210px" }}
          animate={reduce ? undefined : { rotate: -42 }}
          transition={{ duration: 0.01 }}
        >
          <motion.ellipse
            cx="210" cy="210" rx="118" ry="162"
            fill="none" stroke="url(#core-stroke)" strokeWidth="1.1" opacity=".7"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "210px 210px" }}
          />
          <ellipse cx="210" cy="210" rx="118" ry="162" fill="none" stroke="#5b8bff" strokeWidth="4" strokeDasharray="1 55" strokeLinecap="round" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "210px 210px" }}
          animate={reduce ? undefined : { rotate: -360 }}
          transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
        >
          <ellipse cx="210" cy="210" rx="90" ry="170" transform="rotate(58 210 210)" fill="none" stroke="#38d3ff" strokeWidth=".8" strokeDasharray="3 8" opacity=".5" />
          <circle cx="210" cy="40" r="4" fill="#8ff2ff" />
          <circle cx="210" cy="40" r="10" fill="#38d3ff" opacity=".18" />
        </motion.g>

        <circle cx="210" cy="210" r="72" fill="#05070f" fillOpacity=".68" stroke="#38d3ff" strokeOpacity=".48" />
        <circle cx="210" cy="210" r="60" fill="url(#core-fill)" opacity=".8" />
        <motion.circle
          cx="210" cy="210" r="46"
          fill="none" stroke="#8ff2ff" strokeWidth="1.5" strokeOpacity=".8"
          animate={reduce ? undefined : { r: [43, 51, 43], opacity: [.45, .95, .45] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <path d="M184 210h52M210 184v52" stroke="#d8fbff" strokeWidth="1" strokeOpacity=".55" />
        <circle cx="210" cy="210" r="25" fill="#38d3ff" fillOpacity=".14" stroke="#8ff2ff" strokeOpacity=".9" />
        <text x="210" y="207" textAnchor="middle" fill="#f4f6fb" fontSize="19" fontWeight="700" letterSpacing="1.5">iA</text>
        <text x="210" y="225" textAnchor="middle" fill="#8ff2ff" fontSize="8" letterSpacing="3">CONNEXION</text>

        {[
          { x: 90, y: 123, label: "AGENTES", tx: 50, ty: 112 },
          { x: 330, y: 139, label: "DATOS", tx: 342, ty: 127 },
          { x: 95, y: 302, label: "FLUJOS", tx: 46, ty: 326 },
          { x: 325, y: 298, label: "ACCIÓN", tx: 338, ty: 323 },
        ].map((node, i) => (
          <g key={node.label}>
            <motion.line
              x1="210" y1="210" x2={node.x} y2={node.y}
              stroke="url(#core-stroke)" strokeWidth="1" strokeOpacity=".45"
              animate={reduce ? undefined : { strokeOpacity: [.18, .7, .18] }}
              transition={{ duration: 3 + i * .4, delay: i * .3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx={node.x} cy={node.y} r="5" fill={i === 3 ? "#ffb648" : "#38d3ff"}
              animate={reduce ? undefined : { scale: [1, 1.45, 1], opacity: [.7, 1, .7] }}
              transition={{ duration: 2.8 + i * .25, delay: i * .2, repeat: Infinity, ease: "easeInOut" }}
            />
            <text x={node.tx} y={node.ty} fill="#aebbd7" fontSize="9" letterSpacing="1.8">{node.label}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan/20 bg-background/80 px-3 py-1.5 font-mono text-[9px] tracking-[.22em] text-cyan/90 backdrop-blur">
        SISTEMA CONECTADO <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sign-led" />
      </div>
    </div>
  );
}
