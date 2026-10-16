"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type Project = { name: string; rubro: string };

const STEPS = [
  { title: "Crea un proyecto", body: "Uno por cada negocio o cliente." },
  { title: "Estudio de mercado", body: "Sabrás quién compite, qué cobra y a quién venderle." },
  { title: "Anuncios de la competencia", body: "Guarda los que veas y descubre sus ganchos y huecos." },
  { title: "Ideas de anuncios", body: "La iA crea anuncios nuevos con todo lo anterior." },
  { title: "Palabras clave", body: "Qué busca la gente en Google en tu país." },
];

/**
 * Faithful recreation of "Mercado IA" (mercado.ia.nom.pe) — same layout and
 * copy as the real app, running on fictitious Café Aurora data only.
 */
export function MercadoIAApp() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ nombre: "", rubro: "", producto: "", pais: "Perú", ciudad: "", publico: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<string[]>([]);

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    setStatus("loading");
    setTimeout(() => {
      setProjects((prev) => [...prev, { name: form.nombre, rubro: form.rubro || "Sin rubro" }]);
      setResult([
        `Estudio de mercado de ejemplo — ${form.nombre}`,
        `• Rubro: ${form.rubro || "No especificado"} · Producto/servicio: ${form.producto || "No especificado"}`,
        `• 3 competidores directos identificados en ${form.ciudad || "tu ciudad"}, ${form.pais}.`,
        `• Precio promedio del ticket en la categoría: S/ 28 (tu negocio: S/ 24 — margen para ajustar precio).`,
        `• Búsqueda relacionada en alza: "delivery" (+34% en 30 días)${form.publico ? ` entre ${form.publico}` : ""}.`,
        "(Contenido de ejemplo — la app real lo genera con datos reales del mercado.)",
      ]);
      setStatus("done");
    }, 1000);
  }

  return (
    <div className="bg-background-elevated">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-cyan">
            <Search className="h-3.5 w-3.5" />
          </span>
          <p className="text-sm font-semibold text-foreground">Mercado IA</p>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">Café Aurora</span>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[14rem_1fr_16rem]">
        <div>
          <button
            type="button"
            onClick={() => document.getElementById("mercado-form-nombre")?.focus()}
            className="focus-ring w-full rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white"
          >
            + Nuevo proyecto
          </button>
          <div className="mt-4 space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-muted">Aún no hay proyectos.</p>
            ) : (
              projects.map((project, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2">
                  <p className="truncate text-sm text-foreground">{project.name}</p>
                  <p className="truncate text-xs text-muted">{project.rubro}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Estudio de mercado</h2>
          <p className="mt-1.5 text-sm text-muted">
            Crea un proyecto por cada negocio o cliente: tendrá su propio estudio, anuncios guardados, ideas y palabras
            clave.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted">Nombre del proyecto</label>
              <input
                id="mercado-form-nombre"
                value={form.nombre}
                onChange={(e) => setField("nombre", e.target.value)}
                placeholder="Ej. Café Aurora — Miraflores"
                className="focus-ring mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Negocio o rubro</label>
              <input
                value={form.rubro}
                onChange={(e) => setField("rubro", e.target.value)}
                placeholder="Qué es el negocio (rubro)"
                className="focus-ring mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Producto o servicio</label>
              <input
                value={form.producto}
                onChange={(e) => setField("producto", e.target.value)}
                placeholder="Producto o servicio a estudiar"
                className="focus-ring mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted">País</label>
                <select
                  value={form.pais}
                  onChange={(e) => setField("pais", e.target.value)}
                  className="focus-ring mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option>Perú</option>
                  <option>Colombia</option>
                  <option>México</option>
                  <option>Chile</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Ciudad</label>
                <input
                  value={form.ciudad}
                  onChange={(e) => setField("ciudad", e.target.value)}
                  placeholder="Opcional"
                  className="focus-ring mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Público objetivo</label>
              <input
                value={form.publico}
                onChange={(e) => setField("publico", e.target.value)}
                placeholder="A quién quiere venderle el cliente (opcional)"
                className="focus-ring mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || !form.nombre.trim()}
              className="focus-ring w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {status === "loading" ? "Generando estudio (ejemplo)…" : "Crear proyecto y generar estudio (ejemplo)"}
            </button>
          </form>

          {status === "done" ? (
            <div className="mt-5 space-y-1.5 rounded-xl border border-cyan/30 bg-background p-4 text-sm leading-relaxed text-foreground">
              {result.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Cómo funciona</p>
          <ol className="mt-3 space-y-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/20 text-[11px] font-semibold text-cyan">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
