"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock3, Database, Mail, MessageSquareText, Workflow, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMOS = [
  {
    id: "lead", label: "Nuevo cliente", request: "Llega una consulta desde la web",
    steps: [
      { title: "Capturar", detail: "Registrar datos de contacto", icon: MessageSquareText },
      { title: "Enriquecer", detail: "Consultar y clasificar la solicitud", icon: Database },
      { title: "Responder", detail: "Enviar respuesta y avisar al equipo", icon: Mail },
    ],
    result: "Contacto registrado y siguiente paso preparado", metric: "Menos tareas manuales",
  },
  {
    id: "ops", label: "Tarea operativa", request: "Se recibe una solicitud interna",
    steps: [
      { title: "Interpretar", detail: "Identificar intención y prioridad", icon: MessageSquareText },
      { title: "Coordinar", detail: "Consultar reglas y herramientas", icon: Workflow },
      { title: "Ejecutar", detail: "Actualizar el sistema y notificar", icon: Zap },
    ],
    result: "Proceso coordinado con trazabilidad", metric: "Más consistencia",
  },
  {
    id: "followup", label: "Seguimiento", request: "Un cliente espera una actualización",
    steps: [
      { title: "Detectar", detail: "Revisar estado y contexto", icon: Database },
      { title: "Preparar", detail: "Generar mensaje contextual", icon: Mail },
      { title: "Dar seguimiento", detail: "Programar aviso o tarea", icon: Clock3 },
    ],
    result: "Seguimiento organizado sin perder contexto", metric: "Menos olvidos",
  },
];

export function AutomationPlayground() {
  const [selected, setSelected] = useState("lead");
  const demo = DEMOS.find((item) => item.id === selected) ?? DEMOS[0];
  const reduceMotion = useReducedMotion();

  return (
    <section className="automation-playground mt-14 overflow-hidden rounded-2xl border border-border bg-background-elevated/70">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-mono text-[10px] tracking-[.2em] text-cyan">AUTOMATION LAB / 01</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Mira cómo una tarea se convierte en un flujo</h3>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-sign-led/20 bg-sign-led/[0.06] px-3 py-1.5 text-[10px] tracking-wider text-sign-led">
          <motion.span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sign-led" animate={reduceMotion ? undefined : { opacity: [1, .35, 1], scale: [1, .8, 1] }} transition={{ duration: 1.8, repeat: reduceMotion ? 0 : Infinity }} />
          SIMULACIÓN INTERACTIVA
        </span>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr]">
        <div className="border-b border-border p-3 lg:border-b-0 lg:border-r">
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-[.16em] text-muted">Elige un escenario</p>
          <div className="flex gap-2 overflow-x-auto lg:flex-col">
            {DEMOS.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                aria-pressed={selected === item.id}
                whileHover={reduceMotion ? undefined : { x: 3 }}
                whileTap={reduceMotion ? undefined : { scale: .98 }}
                className={cn("shrink-0 rounded-xl border px-3 py-3 text-left text-sm transition-colors lg:w-full", selected === item.id ? "border-cyan/40 bg-cyan/[.07] text-cyan" : "border-transparent text-muted hover:border-border hover:text-foreground")}
              >
                <span className="flex items-center gap-2">{selected === item.id && <motion.span layoutId="automation-selected" className="h-1.5 w-1.5 rounded-full bg-cyan" />}{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={demo.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: reduceMotion ? .12 : .32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="font-mono text-[9px] tracking-[.16em] text-muted">DISPARADOR / EVENTO INICIAL</p>
                <p className="mt-2 text-sm font-medium text-foreground">{demo.request}</p>
              </div>

              <div className="relative mt-5 grid gap-3 md:grid-cols-3">
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[8%] right-[8%] top-7 hidden h-px origin-left bg-gradient-to-r from-cyan/0 via-cyan/70 to-cyan/0 md:block"
                  initial={{ scaleX: 0, opacity: .2 }}
                  animate={{ scaleX: 1, opacity: [.3, 1, .3] }}
                  transition={{ duration: reduceMotion ? .1 : 2.6, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}
                />
                {demo.steps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: .97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: reduceMotion ? .1 : .4, delay: reduceMotion ? 0 : .08 + index * .12 }}
                      className="relative"
                    >
                      <motion.div
                        whileHover={reduceMotion ? undefined : { y: -3, borderColor: "rgba(56,211,255,.55)" }}
                        className="automation-step-card h-full rounded-xl border border-cyan/15 bg-cyan/[.025] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] tracking-widest text-cyan">0{index + 1}</span>
                          <motion.span animate={reduceMotion ? undefined : { rotate: [0, 8, -8, 0] }} transition={{ duration: 4, delay: index * .3, repeat: reduceMotion ? 0 : Infinity }}><StepIcon className="h-4 w-4 text-cyan" aria-hidden="true" /></motion.span>
                        </div>
                        <h4 className="mt-5 text-sm font-semibold text-foreground">{step.title}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{step.detail}</p>
                      </motion.div>
                      {index < demo.steps.length - 1 && <ArrowRight className="automation-step-arrow absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-cyan md:block" aria-hidden="true" />}
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .35, delay: reduceMotion ? 0 : .45 }}
                className="mt-5 flex flex-col gap-3 rounded-xl border border-sign-led/15 bg-sign-led/[.035] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <motion.span animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }} transition={{ duration: 2.2, repeat: reduceMotion ? 0 : Infinity }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sign-led/10 text-sign-led"><Check className="h-4 w-4" /></motion.span>
                  <div><p className="text-sm font-semibold text-foreground">Resultado del flujo</p><p className="mt-1 text-xs leading-relaxed text-muted">{demo.result}</p></div>
                </div>
                <span className="shrink-0 text-xs font-medium text-sign-led">{demo.metric}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <p className="mt-4 text-[10px] leading-relaxed text-muted">Demo conceptual con datos ilustrativos. El flujo real se diseña según las herramientas, permisos y reglas de cada organización.</p>
        </div>
      </div>
    </section>
  );
}
