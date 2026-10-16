"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Pause, Play, RefreshCw, ShieldCheck, Users, Zap } from "lucide-react";
import { Mark } from "@/components/brand/Mark";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { INTEGRATIONS_DISCLAIMER, INTEGRATION_SYSTEMS } from "@/data/integration-systems";
import { FOCAL, TAU, hexToRgb, makeStars, rotate, shortestAngle, type Pt, type Vec3 } from "@/components/illustrations/orbit3d";

const SYSTEMS = INTEGRATION_SYSTEMS;
const COUNT = SYSTEMS.length;
const SYSTEM_RGB = SYSTEMS.map((s) => hexToRgb(s.color));
const TOUR_MS = 4000;
const MANUAL_HOLD_MS = 12000;

// Wheel geometry: the systems sit on an ellipse; the active one swings to the right,
// next to the detail panel, and that side of the wheel leans toward the viewer.
const RX = 1.22;
const RY = 0.95;
const BASE_YAW = -0.36;
const BASE_TILT = -0.16;
const theta = (i: number) => (i * TAU) / COUNT - Math.PI / 2;

const BENEFITS = [
  { icon: Zap, title: "Datos conectados", text: "Información entre herramientas" },
  { icon: RefreshCw, title: "Procesos automatizados", text: "Menos tareas repetitivas" },
  { icon: Users, title: "Equipos más productivos", text: "Más tiempo para lo estratégico" },
  { icon: ShieldCheck, title: "Información protegida", text: "Permisos y accesos controlados" },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Interactive integrations map: a 3D wheel of nine systems around the iA Connexion core, with a guided tour. */
export function IntegrationsHub() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const fillRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const manualUntilRef = useRef(0);
  const tourStartRef = useRef(0);
  const rotRef = useRef({ value: -theta(0), target: -theta(0) });
  const tiltRef = useRef({ value: BASE_TILT, target: BASE_TILT });
  const switchedAtRef = useRef(-Infinity);

  function focusSystem(next: number, timeStamp: number) {
    const i = ((next % COUNT) + COUNT) % COUNT;
    setIndex(i);
    indexRef.current = i;
    const rot = rotRef.current;
    rot.target = rot.value + shortestAngle(rot.value, -theta(i));
    tourStartRef.current = timeStamp;
    switchedAtRef.current = timeStamp;
  }

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the loop.
  function choose(next: number, timeStamp: number) {
    manualUntilRef.current = timeStamp + MANUAL_HOLD_MS;
    focusSystem(next, timeStamp);
  }

  function togglePause(timeStamp: number) {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) {
      manualUntilRef.current = 0;
      tourStartRef.current = timeStamp;
    }
  }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    if (reduce) {
      pausedRef.current = true;
      rotRef.current.value = rotRef.current.target;
    }

    const stars = makeStars(60);
    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    let yaw = BASE_YAW;

    const draw = (now: number) => {
      const time = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // The active tile parks on the right, enlarged and on the near side — leave it room.
      const R = Math.min(width / 3.9, height / 2.6);
      const cx = width * 0.47;
      const cy = height / 2;
      const tilt = tiltRef.current.value;
      const rot = rotRef.current.value;
      const project = (p: Vec3, extraYaw = 0): Pt => {
        const q = rotate(p, yaw + extraYaw, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * R * s, y: cy + q.y * R * s, z: q.z, s };
      };
      const active = indexRef.current;
      const sinceSwitch = (now - switchedAtRef.current) / 1000;
      const switchFlash = Math.exp(-((sinceSwitch - 0.35) ** 2) / 0.05);

      for (const star of stars) {
        const p = project({ x: star.x * 1.4, y: star.y * 1.1, z: star.z }, time * 0.02);
        const depth = (p.z + 1.7) / 3.4;
        const twinkle = reduce ? 1 : 0.65 + 0.35 * Math.sin(time * 1.6 + star.tw);
        ctx.fillStyle = `rgba(150, 210, 255, ${(0.06 + 0.32 * depth) * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.5 + 1 * depth * p.s, 0, TAU);
        ctx.fill();
      }

      // Concentric rings in the wheel's plane; the dashes travel so the hub reads as running.
      const ringLoop = (rx: number, ry: number, dash: number[], speed: number, alpha: number) => {
        ctx.setLineDash(dash);
        ctx.lineDashOffset = reduce ? 0 : -time * speed;
        ctx.strokeStyle = `rgba(64, 160, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k <= 96; k++) {
          const a = (k / 96) * TAU;
          const q = project({ x: Math.cos(a) * rx, y: Math.sin(a) * ry, z: 0 });
          if (k === 0) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };
      ringLoop(RX * 1.12, RY * 1.12, [2, 9], 6, 0.22);
      ringLoop(0.72, 0.72, [3, 8], -14, 0.32);
      ringLoop(0.46, 0.46, [2, 6], 22, 0.42);

      const center = project({ x: 0, y: 0, z: 0 });
      const halo = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, R * 0.9);
      halo.addColorStop(0, `rgba(22, 141, 255, ${0.26 + 0.18 * switchFlash})`);
      halo.addColorStop(0.55, "rgba(22, 141, 255, 0.06)");
      halo.addColorStop(1, "rgba(22, 141, 255, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(center.x, center.y, R * 0.9, 0, TAU);
      ctx.fill();

      const tiles = SYSTEMS.map((_, i) => {
        const a = theta(i) + rot;
        return project({ x: Math.cos(a) * RX, y: Math.sin(a) * RY, z: 0 });
      });

      // Wires from the core to each system, with data travelling both ways.
      tiles.forEach((q, i) => {
        const isActive = i === active;
        const rgb = SYSTEM_RGB[i];
        if (isActive) {
          ctx.strokeStyle = `rgba(69, 202, 255, ${0.22 + 0.2 * switchFlash})`;
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
        const gradient = ctx.createLinearGradient(center.x, center.y, q.x, q.y);
        gradient.addColorStop(0, `rgba(69, 202, 255, ${isActive ? 1 : 0.45})`);
        gradient.addColorStop(1, `rgba(${rgb}, ${isActive ? 0.95 : 0.25})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isActive ? 2.4 : 1.1;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();

        const node = (x: number, y: number, r: number, alpha: number) => {
          ctx.fillStyle = `rgba(69, 202, 255, ${alpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(x, y, r * 2.6, 0, TAU);
          ctx.fill();
          ctx.fillStyle = `rgba(235, 248, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fill();
        };
        // Junction where the wire crosses the inner ring.
        node(center.x + (q.x - center.x) * 0.37, center.y + (q.y - center.y) * 0.37, 1.8 * q.s, isActive ? 1 : 0.55);

        const flows = reduce ? [] : isActive ? [0, 0.33, 0.66] : [i * 0.11];
        flows.forEach((offset, k) => {
          const raw = (time * (isActive ? 0.55 : 0.22) + offset) % 1;
          const outward = isActive ? k !== 1 : i % 2 === 0;
          const u = outward ? raw : 1 - raw;
          const fade = Math.sin(raw * Math.PI);
          node(center.x + (q.x - center.x) * u, center.y + (q.y - center.y) * u, (isActive ? 2.2 : 1.4) * q.s, (isActive ? 1 : 0.5) * fade);
        });
      });

      tiles.forEach((q, i) => {
        const el = tileRefs.current[i];
        if (!el) return;
        const isActive = i === active;
        const depth = Math.max(0, Math.min(1, (q.z + 1) / 2));
        const scale = q.s * (isActive ? 1.08 + 0.05 * switchFlash : 1);
        el.style.transform = `translate3d(${q.x}px, ${q.y}px, 0) translate(-50%, -50%) rotateY(${yaw}rad) rotateX(${-tilt}rad) scale(${scale})`;
        el.style.opacity = String(isActive ? 1 : 0.62 + 0.38 * depth);
        el.style.zIndex = String(isActive ? 40 : 10 + Math.round(depth * 20));
      });

      // Tour progress for the current system.
      const manual = now < manualUntilRef.current;
      const fill = pausedRef.current || manual ? 1 : Math.min(1, (now - tourStartRef.current) / TOUR_MS);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${fill})`;
      if (statusRef.current) {
        statusRef.current.textContent = reduce
          ? "Usa las tarjetas para explorar"
          : pausedRef.current
            ? "Recorrido pausado"
            : manual
              ? "Exploración manual"
              : "Recorrido automático";
      }
    };

    let raf = 0;
    let last = 0; // set by start() before the first frame
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const rot = rotRef.current;
      if (!pausedRef.current && now >= manualUntilRef.current && now - tourStartRef.current >= TOUR_MS) {
        const next = (indexRef.current + 1) % COUNT;
        setIndex(next);
        indexRef.current = next;
        rot.target = rot.value + shortestAngle(rot.value, -theta(next));
        tourStartRef.current = now;
        switchedAtRef.current = now;
      }

      rot.value += (rot.target - rot.value) * (reduce ? 1 : 1 - Math.exp(-dt * 4.5));
      yaw = BASE_YAW + (reduce ? 0 : Math.sin(now / 6000) * 0.08);
      const tiltState = tiltRef.current;
      tiltState.value += (tiltState.target - tiltState.value) * (1 - Math.exp(-dt * 4));

      draw(now);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      // Only seed the tour clock once: the observer can stop/start the loop repeatedly
      // (e.g. mobile toolbars resizing the viewport), and resetting here froze the tour.
      if (tourStartRef.current === 0) tourStartRef.current = last;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      rootMargin: "80px",
    });
    visibility.observe(stage);
    draw(0);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
    };
  }, [reduce]);

  function handleStageMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.target = BASE_TILT - ny * 0.2;
  }

  const system = SYSTEMS[index];
  const whatsappText = `Hola, iA Connexion. Quiero solicitar una evaluación para implementar una integración de ${system.name}. Objetivo/flujo: ${system.flow
    .map((step) => step.label)
    .join(" → ")}. Aplicaciones de interés: ${system.apps.map(([name]) => name).join(", ")}. Quisiera conocer requisitos, alcance, plazo estimado y presupuesto. Mi negocio es: `;

  return (
    <div className="mt-10">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        {/* Map */}
        <div className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#152b4b] bg-[radial-gradient(ellipse_at_50%_48%,#0b2345_0%,#071124_50%,#050914_100%)]">
          <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
            <div>
              <p className="font-display text-sm font-semibold text-foreground">Mapa de integraciones</p>
              <p className="mt-0.5 text-xs text-muted">Explora cómo se conectan tus sistemas</p>
            </div>
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-[11px] text-[#9db3d3]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#4ce0b1] shadow-[0_0_10px_#4ce0b177]" aria-hidden="true" />
              <span ref={statusRef} aria-live="polite">
                Recorrido automático
              </span>
            </span>
          </div>

          <div
            ref={stageRef}
            className="relative h-[320px] w-full select-none sm:h-[420px] lg:h-auto lg:min-h-[450px] lg:flex-1"
            style={{ perspective: "1000px" }}
            onPointerMove={handleStageMove}
            onPointerLeave={() => {
              tiltRef.current.target = BASE_TILT;
            }}
          >
            <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-[#287fe7] bg-[radial-gradient(circle_at_35%_30%,#16336a,#0b2040_70%)] shadow-[0_0_0_5px_rgba(20,121,233,0.15),0_0_44px_-2px_rgba(20,141,255,0.65)] sm:h-24 sm:w-24">
                <Mark className="h-8 w-8 text-foreground sm:h-12 sm:w-12" title="iA Connexion" />
                <span className="mt-0.5 hidden text-[7px] font-semibold tracking-[0.25em] text-foreground/85 sm:block">CONNEXION</span>
              </div>
              <span className="mt-2 hidden text-[10px] text-[#8ca8cb] sm:block">Capa de integración</span>
            </div>

            {SYSTEMS.map((s, i) => {
              const isActive = i === index;
              return (
                <button
                  key={s.name}
                  ref={(el) => {
                    tileRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={(event) => choose(i, event.timeStamp)}
                  aria-pressed={isActive}
                  aria-label={`Seleccionar ${s.name}`}
                  className={cn(
                    "focus-ring absolute left-0 top-0 rounded-xl border text-left transition-[border-color,background-color,box-shadow] duration-200 [backface-visibility:hidden]",
                    "px-2 py-1.5 sm:w-[8.25rem] sm:px-3 sm:py-2",
                    isActive
                      ? "border-[#42baff] bg-[#0e2345] shadow-[0_0_22px_-2px_rgba(20,124,255,0.65)]"
                      : "border-[#24436b] bg-[#09152a] hover:border-[#66cfff] hover:bg-[#10264a]",
                  )}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-display text-sm font-bold text-[#51cfff] sm:text-base">{pad(i)}</span>
                    <span className="hidden min-w-0 truncate text-xs font-semibold text-foreground sm:block">{s.short}</span>
                    <s.icon className="h-3.5 w-3.5 sm:hidden" style={{ color: s.color }} aria-hidden="true" />
                  </span>
                  <span className="mt-1.5 hidden items-center gap-1.5 sm:flex">
                    {s.marks.map((MarkIcon, k) => (
                      <span
                        key={k}
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: `${s.color}22`, color: s.color }}
                      >
                        <MarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#172c4a] bg-[#060d1b] px-3 py-3 sm:px-4">
            <button
              type="button"
              onClick={(event) => togglePause(event.timeStamp)}
              aria-pressed={paused}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[#2b4569] bg-[#0c1a30] px-3 py-2 text-xs font-semibold text-foreground transition-[border-color,filter] duration-200 hover:border-[#59c4ff] hover:brightness-110"
            >
              {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
              {paused ? "Reanudar" : "Pausar"}
            </button>
            <div
              className="flex min-w-[90px] flex-1 gap-1"
              role="progressbar"
              aria-label="Progreso del recorrido"
              aria-valuemin={1}
              aria-valuemax={COUNT}
              aria-valuenow={index + 1}
            >
              {SYSTEMS.map((s, i) => (
                <span key={s.name} className="h-1 flex-1 overflow-hidden rounded-full bg-[#142641]">
                  {i < index ? <span className="block h-full w-full bg-gradient-to-r from-[#1769ff] to-[#52d8ff]" /> : null}
                  {i === index ? (
                    <span ref={fillRef} className="block h-full w-full origin-left bg-gradient-to-r from-[#1769ff] to-[#52d8ff]" />
                  ) : null}
                </span>
              ))}
            </div>
            <span className="whitespace-nowrap text-[11px] text-[#b9cce7]">
              {pad(index)} / {pad(COUNT - 1)} · {system.short}
            </span>
            <span className="hidden whitespace-nowrap text-[11px] text-muted xl:inline">Cambio automático cada 4 segundos</span>
          </div>
        </div>

        {/* Detail */}
        <aside className="flex min-w-0 flex-col rounded-2xl border border-[#203958] bg-[linear-gradient(145deg,#0b172b,#07101e)] p-5 sm:p-6" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={system.name}
              initial={{ opacity: 0, transform: reduce ? "none" : "translateY(8px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-6px)" }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-1 flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#40caff]">
                    {pad(index)} · {system.category}
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{system.name}</h3>
                </div>
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
                  style={{ background: `${system.color}1f`, borderColor: `${system.color}55`, color: system.color }}
                >
                  <system.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#a5b5ce]">{system.description}</p>

              <hr className="my-4 border-[#1b304d]" />
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#91a9ca]">Aplicaciones compatibles · ejemplos</p>
              <div className="grid grid-cols-2 gap-2">
                {system.apps.map(([name, detail]) => (
                  <div key={name} className="flex min-w-0 items-center gap-2 rounded-lg border border-[#1c3453] bg-[#091528] px-2.5 py-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#112b4b] text-[11px] font-bold text-[#58caff]">
                      {name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-foreground">{name}</span>
                      <span className="block truncate text-[10px] text-[#8fa4c2]">{detail}</span>
                    </span>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-[#1b304d]" />
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#91a9ca]">Requisitos de conexión</p>
              <ul className="grid gap-2">
                {system.requirements.map((text) => (
                  <li key={text} className="flex gap-2.5 text-xs leading-relaxed text-[#b5c5dc]">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[#1e6793] bg-[#10304a] text-[#59d3ff]">
                      <Check className="h-2.5 w-2.5" aria-hidden="true" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <hr className="my-4 border-[#1b304d]" />
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#91a9ca]">Ejemplo de flujo</p>
              <div className="flex items-start">
                {system.flow.map((step, k) => (
                  <div key={step.label} className="flex flex-1 items-start">
                    {k > 0 ? <ArrowRight className="mt-3.5 h-4 w-4 shrink-0 text-[#5aa9e6]" aria-hidden="true" /> : null}
                    <div className="min-w-0 flex-1 text-center">
                      <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg border border-[#244469] bg-[#0c2039] text-[#62ceff]">
                        <step.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="mt-1.5 block text-[11px] leading-snug text-[#c3d3e8]">{step.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-lg border border-[#1c3b59] bg-[#0a1a2c] p-2.5 text-[11px] leading-relaxed text-[#92aac7]">{system.note}</p>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(110deg,#2459ee,#1689ff)] px-4 py-3 text-sm font-bold text-white shadow-[0_5px_22px_#1258e933] transition-[filter] duration-200 hover:brightness-110"
              >
                Solicitar implementación <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-2 text-center text-[11px] text-[#8fa6c6]">Te asesoramos según tus herramientas y necesidades.</p>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>

      {/* Selector cards */}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9" aria-label="Seleccionar sistema por categoría">
        {SYSTEMS.map((s, i) => {
          const isActive = i === index;
          return (
            <button
              key={s.name}
              type="button"
              onClick={(event) => choose(i, event.timeStamp)}
              aria-pressed={isActive}
              className={cn(
                "focus-ring min-w-0 rounded-xl border px-2.5 py-3 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5",
                isActive
                  ? "border-[#42baff] bg-[#0d2345] shadow-[0_0_16px_#1269ff35]"
                  : "border-[#192e4c] bg-[#081224] hover:border-[#398bd2]",
              )}
            >
              <s.icon className="mb-2 h-[18px] w-[18px]" style={{ color: s.color }} aria-hidden="true" />
              <span className="block text-[9px] tracking-wider text-[#59c9ff]">{pad(i)}</span>
              <span className="mt-0.5 block text-[11px] font-semibold leading-tight text-foreground [overflow-wrap:anywhere]">{s.name}</span>
              <span className="mt-1 block text-[10px] leading-tight text-[#91a4c4]">{s.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-center gap-3 rounded-xl border border-[#172b47] bg-[#081224] p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#1d5793] bg-[#0a1d37] text-[#5ccaff]">
              <b.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-foreground">{b.title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-[#8fa4c3]">{b.text}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[#7388a9]">{INTEGRATIONS_DISCLAIMER}</p>
    </div>
  );
}
