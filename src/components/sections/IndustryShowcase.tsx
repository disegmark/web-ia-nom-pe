"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { INDUSTRY_CASES, type IndustryCase } from "@/data/industry-cases";

const N = INDUSTRY_CASES.length;
const STEP_DEG = 360 / N;
const MANUAL_HOLD_MS = 15000;

// Script pacing (ms).
const START_DELAY = 700;
const TYPING_MS = 900;
const AFTER = { user: 1100, agent: 1500, tool: 1600 } as const;
const END_HOLD_MS = 3400;

function panelState(c: IndustryCase, shown: number) {
  const rows = c.panel.rows.map((r) => [...r]);
  let highlight: number | null = null;
  let lastTool = -1;
  const doneTools = new Set<number>();
  c.script.slice(0, shown).forEach((s) => {
    if (s.kind !== "tool") return;
    if (s.update.addRow) rows.push([...s.update.addRow]);
    if (s.update.setRow) rows[s.update.setRow.index] = [...s.update.setRow.row];
    if (s.update.highlight !== undefined) highlight = s.update.highlight;
    lastTool = s.tool;
    doneTools.add(s.tool);
  });
  return { rows, highlight, lastTool, doneTools };
}

function shortestStep(from: number, to: number) {
  let d = (to - from) % N;
  if (d > N / 2) d -= N;
  if (d < -N / 2) d += N;
  return d;
}

/** Tool call inside the chat: spins briefly, then settles as done. */
function ToolChip({ running, done, color, instant }: { running: string; done: string; color: string; instant: boolean }) {
  const [finished, setFinished] = useState(instant);
  useEffect(() => {
    if (instant) return;
    const t = setTimeout(() => setFinished(true), 850);
    return () => clearTimeout(t);
  }, [instant]);
  return (
    <div className="mx-auto flex max-w-[92%] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium" style={{ borderColor: `${color}66`, background: `${color}14`, color }}>
      {finished ? <Check className="h-3 w-3 shrink-0" aria-hidden="true" /> : <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" />}
      <span className="truncate">{finished ? done : running}</span>
    </div>
  );
}

/** Industry showcase: a 3D carousel of real (anonymised) deployments, each with a live demo of the agent at work. */
export function IndustryShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [ringStep, setRingStep] = useState(0);
  const manualUntilRef = useRef(0);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotX = useSpring(tiltX, { stiffness: 80, damping: 18 });
  const rotY = useSpring(tiltY, { stiffness: 80, damping: 18 });

  const c = INDUSTRY_CASES[active];
  const shown = reduce ? c.script.length : step;
  const { rows, highlight, lastTool, doneTools } = panelState(c, shown);
  const lastShown = c.script[shown - 1];
  const flyLabel = !reduce && lastShown?.kind === "tool" ? c.tools[lastShown.tool] : null;

  // Play the conversation; when it ends, move on to the next industry (or replay while the visitor is exploring).
  useEffect(() => {
    if (reduce) return;
    const script = INDUSTRY_CASES[active].script;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = START_DELAY;
    script.forEach((s, i) => {
      if (s.kind === "agent") {
        timers.push(setTimeout(() => setTyping(true), t));
        t += TYPING_MS;
      }
      timers.push(
        setTimeout(() => {
          setTyping(false);
          setStep(i + 1);
        }, t),
      );
      t += AFTER[s.kind];
    });
    timers.push(
      setTimeout(() => {
        setStep(0);
        if (performance.now() < manualUntilRef.current) {
          setNonce((n) => n + 1);
          return;
        }
        setActive((a) => (a + 1) % N);
        setRingStep((r) => r + 1);
      }, t + END_HOLD_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [active, nonce, reduce]);

  // The solution finder can ask to show a specific case ("Ver este caso en acción").
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    const onShowCase = (event: Event) => {
      const target = INDUSTRY_CASES.findIndex((item) => item.id === (event as CustomEvent<string>).detail);
      if (target < 0) return;
      setRingStep((r) => r + shortestStep(activeRef.current, target));
      setActive(target);
      setStep(0);
      setTyping(false);
      setNonce((n) => n + 1);
      manualUntilRef.current = event.timeStamp + MANUAL_HOLD_MS;
    };
    window.addEventListener("ia:show-case", onShowCase);
    return () => window.removeEventListener("ia:show-case", onShowCase);
  }, []);

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the timers.
  function select(next: number, timeStamp: number) {
    const target = ((next % N) + N) % N;
    setRingStep((r) => r + shortestStep(active, target));
    setActive(target);
    setStep(0);
    setTyping(false);
    setNonce((n) => n + 1);
    manualUntilRef.current = timeStamp + MANUAL_HOLD_MS;
  }

  function handleScenePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 10);
    tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 7);
  }

  const whatsappText = `Hola, iA Connexion. Vi el caso "${c.title}" en su web y quiero un sistema agéntico similar para mi negocio. Mi negocio es: `;

  return (
    <div className="mt-10">
      {/* 3D carousel of industries */}
      <div className="relative">
        <div className="relative mx-auto h-[132px] w-full overflow-hidden sm:h-[150px]" style={{ perspective: "1100px" }}>
          <motion.div
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: -ringStep * STEP_DEG }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16 }}
          >
            {INDUSTRY_CASES.map((item, i) => {
              const dist = Math.min((i - active + N) % N, (active - i + N) % N);
              const isActive = i === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(event) => select(i, event.timeStamp)}
                  aria-pressed={isActive}
                  aria-label={`Ver caso: ${item.title} (${item.rubro})`}
                  tabIndex={dist > 1 ? -1 : 0}
                  className={cn(
                    "focus-ring absolute left-0 top-0 flex h-[104px] w-36 flex-col justify-between rounded-2xl border p-3 text-left transition-[opacity,border-color,box-shadow,background-color] duration-500 [backface-visibility:hidden] sm:h-[120px] sm:w-44 sm:p-4",
                    "[--r:150px] sm:[--r:230px]",
                    isActive ? "bg-[#0d2345]" : "bg-[#081224]",
                  )}
                  style={{
                    transform: `translate(-50%, -50%) rotateY(${i * STEP_DEG}deg) translateZ(var(--r))`,
                    opacity: dist === 0 ? 1 : dist === 1 ? 0.5 : 0.12,
                    borderColor: isActive ? item.color : "#1c3453",
                    boxShadow: isActive ? `0 0 30px -6px ${item.color}aa` : "none",
                  }}
                >
                  <span className="flex items-center justify-between">
                    <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${item.color}22`, color: item.color }}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted">{item.rubro}</span>
                  </span>
                  <span className="font-display text-sm font-semibold leading-tight text-foreground sm:text-base">{item.title}</span>
                </button>
              );
            })}
          </motion.div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={(event) => select(active - 1, event.timeStamp)}
            aria-label="Rubro anterior"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-[#24436b] text-muted transition-colors hover:border-cyan/60 hover:text-cyan"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex gap-1.5">
            {INDUSTRY_CASES.map((item, i) => (
              <span
                key={item.id}
                className="h-1.5 rounded-full transition-[width,background-color] duration-300"
                style={{ width: i === active ? 22 : 6, background: i === active ? item.color : "#24436b" }}
                aria-hidden="true"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={(event) => select(active + 1, event.timeStamp)}
            aria-label="Rubro siguiente"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-[#24436b] text-muted transition-colors hover:border-cyan/60 hover:text-cyan"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        {/* Live demo: phone + app panel in perspective */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[#12305a] bg-[radial-gradient(ellipse_at_40%_45%,#0b2451_0%,#06132a_50%,#030711_85%)] p-4 sm:p-6"
          style={{ perspective: "1200px" }}
          onPointerMove={handleScenePointer}
          onPointerLeave={() => {
            tiltX.set(0);
            tiltY.set(0);
          }}
        >
          <motion.div
            className="relative flex flex-col items-center gap-6 xl:min-h-[520px] xl:flex-row xl:items-center xl:justify-between xl:gap-4"
            style={{ transformStyle: "preserve-3d", rotateX: reduce ? 0 : rotX, rotateY: reduce ? 0 : rotY }}
          >
            {/* Phone */}
            <div
              className="relative w-[250px] shrink-0 sm:w-[270px] xl:[transform:rotateY(14deg)_rotateX(3deg)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative rounded-[2.2rem] border-[3px] border-[#2a3b5c] bg-[#05080f] p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_0_50px_-10px_rgba(56,211,255,0.35)]">
                <div className="flex h-[400px] flex-col overflow-hidden rounded-[1.7rem] bg-[#0b141a] sm:h-[430px]">
                  <div className="flex items-center gap-2 bg-[#1f2c34] px-3 py-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: `${c.color}33`, color: c.color }}>
                      <c.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-[#e9edef]">{c.chatName}</p>
                      <p className="text-[10px] text-[#8696a0]">{typing ? "escribiendo…" : `en línea · ${c.channels[0]}`}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden px-2.5 py-3" aria-live="polite">
                    <AnimatePresence initial={false}>
                      {c.script.slice(0, shown).map((s, i) => (
                        <motion.div
                          key={`${c.id}-${nonce}-${i}`}
                          initial={reduce ? false : { opacity: 0, transform: "translateY(10px) scale(0.97)" }}
                          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                          className={cn("flex", s.kind === "user" ? "justify-end" : s.kind === "agent" ? "justify-start" : "justify-center")}
                        >
                          {s.kind === "tool" ? (
                            <ToolChip running={s.running} done={s.done} color={c.color} instant={!!reduce || i < shown - 1} />
                          ) : (
                            <p
                              className={cn(
                                "max-w-[82%] rounded-lg px-2.5 py-1.5 text-[12px] leading-snug text-[#e9edef]",
                                s.kind === "user" ? "rounded-tr-none bg-[#005c4b]" : "rounded-tl-none bg-[#202c33]",
                              )}
                            >
                              {s.text}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {typing ? (
                      <div className="flex w-14 gap-1 rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2.5" aria-hidden="true">
                        {[0, 1, 2].map((k) => (
                          <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0]" style={{ animationDelay: `${k * 120}ms` }} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 bg-[#1f2c34] px-2.5 py-2">
                    <span className="flex-1 rounded-full bg-[#2a3942] px-3 py-1.5 text-[11px] text-[#8696a0]">Mensaje</span>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-[50%] bg-cyan/20 blur-2xl" aria-hidden="true" />
            </div>

            {/* Flying tool call: phone → app panel */}
            <AnimatePresence>
              {flyLabel ? (
                <motion.div
                  key={`fly-${c.id}-${nonce}-${shown}`}
                  className="pointer-events-none absolute z-20 hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold xl:flex"
                  style={{ borderColor: c.color, background: "#071632", color: c.color, boxShadow: `0 0 18px -2px ${c.color}` }}
                  initial={{ left: "34%", top: "50%", opacity: 0, scale: 0.6 }}
                  animate={{ left: "56%", top: "21%", opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  {flyLabel}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* App panel */}
            <div className="w-full max-w-[340px] xl:min-w-0 xl:flex-1 xl:max-w-[310px] xl:[transform:rotateY(-12deg)_translateZ(-20px)]" style={{ transformStyle: "preserve-3d" }}>
              <div className="rounded-2xl border border-[#1c3b63] bg-[linear-gradient(160deg,#0c1a33,#070f20)] p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.85),0_0_40px_-12px_rgba(56,211,255,0.3)]">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <c.panel.icon className="h-4 w-4" style={{ color: c.color }} aria-hidden="true" />
                    {c.panel.title}
                  </p>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#50e7b3]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#50e7b3]" aria-hidden="true" />
                    En vivo
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_1fr_1.1fr] gap-x-2 border-b border-[#1c3453] pb-1.5 text-[10px] uppercase tracking-wider text-muted">
                  {c.panel.columns.map((col) => (
                    <span key={col}>{col}</span>
                  ))}
                </div>
                <div className="mt-1 grid gap-1">
                  <AnimatePresence initial={false}>
                    {rows.map((row, r) => {
                      const hot = r === highlight;
                      return (
                        <motion.div
                          key={`${c.id}-${r}`}
                          layout={!reduce}
                          initial={reduce ? false : { opacity: 0, transform: "translateX(12px)" }}
                          animate={{ opacity: 1, transform: "translateX(0px)" }}
                          className="grid grid-cols-[1fr_1fr_1.1fr] items-center gap-x-2 rounded-lg px-1.5 py-2 text-[12px] transition-[background-color,box-shadow] duration-300"
                          style={hot ? { background: `${c.color}1c`, boxShadow: `inset 0 0 0 1px ${c.color}88` } : undefined}
                        >
                          <span className="truncate text-foreground">{row[0]}</span>
                          <span className="truncate text-[#a8bad4]">{row[1]}</span>
                          <span className="truncate font-medium" style={{ color: hot ? c.color : "#a8bad4" }}>
                            {row[2]}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                <p className="mt-3 text-[10px] text-muted">Panel del sistema · datos de ejemplo</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Case detail */}
        <aside className="rounded-2xl border border-[#153d6b] bg-[linear-gradient(145deg,#0a1830,#050c1b)] p-5 sm:p-6" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={c.id}
              initial={{ opacity: 0, transform: reduce ? "none" : "translateY(8px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-6px)" }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-2">
                <span className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ background: `${c.color}1f`, color: c.color }}>
                  {c.rubro}
                </span>
                <span className="text-[10px] text-muted">Caso implementado · nombre reservado</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a8bad4]">{c.summary}</p>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Qué hace el agente</p>
              <ul className="mt-2 grid gap-1.5">
                {c.tools.map((tool, k) => {
                  const running = k === lastTool && lastShown?.kind === "tool";
                  const done = doneTools.has(k);
                  return (
                    <li
                      key={tool}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-xs transition-[border-color,background-color,color] duration-300",
                        running ? "text-foreground" : done ? "border-[#1c3453] text-foreground/90" : "border-[#1c3453] text-muted",
                      )}
                      style={running ? { borderColor: c.color, background: `${c.color}14` } : undefined}
                    >
                      <span
                        className="grid h-5 w-5 shrink-0 place-items-center rounded-full border"
                        style={{ borderColor: done || running ? c.color : "#24436b", color: c.color }}
                      >
                        {done ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                      </span>
                      {tool}
                    </li>
                  );
                })}
              </ul>

              {c.highlight ? (
                <p className="mt-3 flex gap-2 rounded-lg border border-[#1b4266] bg-[#091c31] p-2.5 text-[11px] leading-relaxed text-[#9ab5d2]">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#50e7b3]" aria-hidden="true" />
                  {c.highlight}
                </p>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Canales</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.channels.map((ch) => (
                      <span key={ch} className="rounded-full border border-[#24436b] px-2.5 py-1 text-[11px] text-foreground/90">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Apps del panel</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.modules.map((m) => (
                      <span key={m} className="rounded-full bg-[#0c2039] px-2.5 py-1 text-[11px] text-[#9fdcff]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(110deg,#1858f3,#078cff)] px-4 py-3 text-sm font-bold text-white transition-[filter] duration-200 hover:brightness-110"
              >
                Quiero algo así para mi negocio <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[#7189ac]">
        Casos implementados por iA Connexion. Por confidencialidad mostramos el rubro y no el nombre de cada cliente; las conversaciones y los datos de la
        demostración son de ejemplo y las funciones son las que tiene cada sistema en producción.
      </p>
    </div>
  );
}
