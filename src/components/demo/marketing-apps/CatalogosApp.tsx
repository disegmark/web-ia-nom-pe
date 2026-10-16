"use client";

import { useState } from "react";

type Catalog = { title: string };

/**
 * Faithful recreation of the "Catálogos virtuales" tool (catalogos.ia.nom.pe)
 * — same layout and copy as the real app, branded for Café Aurora instead of
 * Comercio Global 360.
 */
export function CatalogosApp() {
  const [title, setTitle] = useState("");
  const [filename, setFilename] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);

  function pickFile() {
    setFilename("menu-cafe-aurora.pdf");
  }

  function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!filename) return;
    setStatus("uploading");
    setTimeout(() => {
      setCatalogs((prev) => [{ title: title.trim() || "Catálogo Café Aurora" }, ...prev]);
      setTitle("");
      setFilename("");
      setStatus("idle");
    }, 900);
  }

  return (
    <div className="bg-[#f4f6fb] px-6 py-6 text-[#1a1f2e] sm:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2f5dfa] to-[#38d3ff] text-base text-white">
              ☕
            </span>
            <div>
              <p className="text-base font-bold text-[#0f1730]">Catálogos Café Aurora</p>
              <p className="text-xs text-black/50">cafeaurora@ia.nom.pe (ejemplo)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[#1a1f2e]">
              Cambiar contraseña
            </button>
            <button type="button" className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[#1a1f2e]">
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#2f5dfa] to-[#38d3ff]" />
        </div>

        <form onSubmit={upload} className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          <p className="text-sm font-semibold text-[#0f1730]">Subir nuevo catálogo (PDF)</p>

          <label className="mt-4 block text-xs text-black/60">
            Título (opcional)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Catálogo Café Aurora — Temporada 2025"
              className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-[#0f1730] placeholder:text-black/40"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={pickFile}
              className="rounded-lg bg-[#f97316] px-3 py-2 text-xs font-semibold text-white"
            >
              Seleccionar archivo
            </button>
            <span className="text-xs text-black/50">{filename || "Sin archivos seleccionados"}</span>
          </div>

          <button
            type="submit"
            disabled={!filename || status === "uploading"}
            className="mt-4 rounded-lg bg-[#0f1730] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {status === "uploading" ? "Subiendo (ejemplo)…" : "Subir catálogo"}
          </button>

          <p className="mt-3 text-xs text-black/50">Sin límite de páginas. La conversión sigue en segundo plano después de subir.</p>
        </form>

        <div className="mt-6">
          {catalogs.length === 0 ? (
            <p className="text-sm text-black/50">Todavía no subiste ningún catálogo.</p>
          ) : (
            <ul className="space-y-2">
              {catalogs.map((catalog, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
                  <span className="text-sm font-medium text-[#0f1730]">{catalog.title}</span>
                  <span className="rounded-full bg-[#2f5dfa]/10 px-2.5 py-1 text-[10px] font-medium text-[#2f5dfa]">Procesando (ejemplo)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
