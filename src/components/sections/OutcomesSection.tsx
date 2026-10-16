import { ArrowDownRight, ArrowUpRight, Gauge, Layers3, ShieldCheck, Workflow } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/animations/Reveal";

const OUTCOMES = [
  { icon: Workflow, code: "01", title: "Procesos conectados", description: "Reduce los traspasos manuales conectando herramientas, reglas y responsables en un flujo coherente." },
  { icon: Gauge, code: "02", title: "Más visibilidad", description: "Define estados, responsables y puntos de control para comprender qué ocurre en cada etapa." },
  { icon: Layers3, code: "03", title: "Soluciones escalables", description: "Empieza con un proceso prioritario y amplía capacidades cuando el negocio esté preparado." },
  { icon: ShieldCheck, code: "04", title: "Control y supervisión", description: "Diseña permisos, validaciones y revisión humana según el riesgo de cada tarea." },
];

export function OutcomesSection() {
  return (
    <section className="outcomes-section border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              title="Tecnología que se conecta con objetivos reales"
              description="No se trata de añadir IA por añadirla. Diseñamos soluciones alrededor del trabajo que necesitas mejorar, con procesos claros, integración y supervisión."
              className="max-w-xl"
            />
            <div className="outcomes-principle mt-7 rounded-xl border border-cyan/15 bg-cyan/[.035] p-5">
              <p className="font-mono text-[10px] tracking-[.18em] text-cyan">NUESTRO PRINCIPIO</p>
              <p className="mt-2 font-display text-lg font-medium leading-snug text-foreground">Automatizar lo adecuado. Conectar lo necesario. Medir lo importante.</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted"><ArrowDownRight className="h-4 w-4 text-sign-amber" /> Diseño orientado a objetivos</div>
            </div>
          </div>
          <div className="outcomes-grid grid gap-3 sm:grid-cols-2">
            {OUTCOMES.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <Reveal key={item.code} delay={index * .06} className="h-full">
                  <article className="outcome-card group h-full rounded-2xl border border-border bg-background-elevated/55 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/30 hover:bg-cyan/[.025] sm:p-6">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/[.07] text-cyan"><ItemIcon className="h-5 w-5" /></span>
                      <span className="font-mono text-[10px] tracking-widest text-muted">{item.code}</span>
                    </div>
                    <h3 className="mt-7 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.13em] text-cyan/80">Diseñado a medida <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
