"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { RotateCcw } from "lucide-react";

// Lima, Miraflores — fixed example coordinates. Nothing here is a real GPS feed.
const STORE: [number, number] = [-12.1211, -77.0269];
const DESTINATION: [number, number] = [-12.1175, -77.023];
const COURIER_B_BASE: [number, number] = [-12.125, -77.031];
const COURIER_C_FIXED: [number, number] = [-12.116, -77.03];

const COURIER_A_ROUTE: Array<[number, number]> = [
  [-12.1195, -77.0295],
  [-12.1195, -77.0245],
  [-12.123, -77.0245],
  [-12.123, -77.0295],
];

type SignalStatus = "en_vivo" | "senal_debil" | "sin_senal";

const STATUS_COLOR: Record<SignalStatus, string> = {
  en_vivo: "#2fe0a8",
  senal_debil: "#f5a524",
  sin_senal: "#f15757",
};

const STATUS_LABEL: Record<SignalStatus, string> = {
  en_vivo: "En vivo",
  senal_debil: "Señal débil",
  sin_senal: "Sin señal",
};

type Courier = { id: string; name: string; status: SignalStatus };

const INITIAL_COURIERS: Courier[] = [
  { id: "c1", name: "Carlos M.", status: "en_vivo" },
  { id: "c2", name: "Rosa T.", status: "senal_debil" },
  { id: "c3", name: "Miguel A.", status: "sin_senal" },
];

function dotHtml(color: string, pulse: boolean) {
  return `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:20px;height:20px;">
    ${pulse ? `<span style="position:absolute;width:14px;height:14px;border-radius:9999px;background:${color};animation:courier-pulse 1.8s ease-out infinite;"></span>` : ""}
    <span style="position:relative;width:13px;height:13px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45);"></span>
  </div>`;
}

function storeHtml() {
  return `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:linear-gradient(135deg,#2f5dfa,#38d3ff);font-size:14px;box-shadow:0 0 0 4px rgba(56,211,255,0.25),0 2px 8px rgba(0,0,0,0.4);">☕</div>`;
}

function destinationHtml() {
  return `<div style="width:15px;height:15px;border-radius:9999px;background:#3b82f6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45);"></div>`;
}

function jitter([lat, lng]: [number, number], amount: number): [number, number] {
  return [lat + (Math.random() - 0.5) * amount, lng + (Math.random() - 0.5) * amount];
}

export function RepartosMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const courierAMarker = useRef<LeafletMarker | null>(null);
  const courierBMarker = useRef<LeafletMarker | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    import("leaflet").then((leafletModule) => {
      if (cancelled || !containerRef.current) return;
      const L = leafletModule.default;

      const map = L.map(containerRef.current, {
        center: STORE,
        zoom: 14,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.marker(STORE, { icon: L.divIcon({ html: storeHtml(), className: "", iconSize: [30, 30], iconAnchor: [15, 15] }) })
        .addTo(map)
        .bindTooltip("Café Aurora", { permanent: false });

      L.marker(DESTINATION, { icon: L.divIcon({ html: destinationHtml(), className: "", iconSize: [15, 15], iconAnchor: [7, 7] }) })
        .addTo(map)
        .bindTooltip("Destino cliente — Av. Larco 345", { permanent: false });

      courierAMarker.current = L.marker(COURIER_A_ROUTE[0], {
        icon: L.divIcon({ html: dotHtml(STATUS_COLOR.en_vivo, true), className: "", iconSize: [20, 20], iconAnchor: [10, 10] }),
      })
        .addTo(map)
        .bindTooltip("Carlos M. — en vivo", { permanent: false });

      courierBMarker.current = L.marker(COURIER_B_BASE, {
        icon: L.divIcon({ html: dotHtml(STATUS_COLOR.senal_debil, false), className: "", iconSize: [20, 20], iconAnchor: [10, 10] }),
      })
        .addTo(map)
        .bindTooltip("Rosa T. — señal débil", { permanent: false });

      L.marker(COURIER_C_FIXED, {
        icon: L.divIcon({ html: dotHtml(STATUS_COLOR.sin_senal, false), className: "", iconSize: [20, 20], iconAnchor: [10, 10] }),
      })
        .addTo(map)
        .bindTooltip("Miguel A. — sin señal (última posición)", { permanent: false });

      let step = 0;
      intervalId = setInterval(() => {
        step = (step + 1) % COURIER_A_ROUTE.length;
        courierAMarker.current?.setLatLng(COURIER_A_ROUTE[step]);
        courierBMarker.current?.setLatLng(jitter(COURIER_B_BASE, 0.0015));
      }, 1800);

      setTimeout(() => map.invalidateSize(), 80);
    });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [resetKey]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border">
      <div ref={containerRef} className="h-72 w-full sm:h-80" />
      <span className="absolute right-2 top-2 z-[1000] flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
        en vivo (ejemplo)
      </span>
      <button
        type="button"
        onClick={() => setResetKey((k) => k + 1)}
        aria-label="Reiniciar simulación del mapa"
        className="focus-ring absolute left-2 top-2 z-[1000] flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black/80"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function RepartosPanel() {
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [newName, setNewName] = useState("");
  const [reference, setReference] = useState("");
  const [clientName, setClientName] = useState("");
  const [hours, setHours] = useState("12");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  function addCourier(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCouriers((prev) => [...prev, { id: `c-${prev.length}-${Date.now()}`, name: trimmed, status: "en_vivo" }]);
    setNewName("");
  }

  function generateLink(event: React.FormEvent) {
    event.preventDefault();
    const code = Math.random().toString(36).slice(2, 8);
    setGeneratedLink(`https://ia.nom.pe/demo/ubicacion/${code}`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="space-y-4 rounded-xl border border-border bg-background p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Panel de repartos</p>
          <p className="mt-1 text-xs text-muted">Simulación — nada de esto crea repartidores ni enlaces reales.</p>
        </div>

        <form onSubmit={addCourier} className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">Nuevo repartidor</label>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Nombre del repartidor"
              className="focus-ring min-w-0 flex-1 rounded-lg border border-border bg-background-elevated px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted"
            />
            <button type="submit" className="focus-ring shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">
              Crear
            </button>
          </div>
        </form>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Repartidores</p>
          <ul className="mt-2 space-y-1.5">
            {couriers.map((courier) => (
              <li key={courier.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-foreground">{courier.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[courier.status] }} />
                  {STATUS_LABEL[courier.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={generateLink} className="space-y-2 border-t border-border pt-3">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">Pedir ubicación a cliente</label>
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Referencia / pedido (opcional)"
            className="focus-ring w-full rounded-lg border border-border bg-background-elevated px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted"
          />
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Nombre del cliente (opcional)"
            className="focus-ring w-full rounded-lg border border-border bg-background-elevated px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted"
          />
          <div className="flex items-center gap-2 text-xs text-muted">
            <input
              type="number"
              min={1}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              className="focus-ring w-16 rounded-lg border border-border bg-background-elevated px-2 py-1.5 text-sm text-foreground"
            />
            horas de validez
          </div>
          <button type="submit" className="focus-ring w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white">
            Generar enlace de cliente
          </button>
          {generatedLink ? (
            <p className="break-all rounded-lg border border-cyan/30 bg-background-elevated px-2.5 py-2 text-[11px] text-cyan">
              {generatedLink} <span className="text-muted">(enlace de ejemplo)</span>
            </p>
          ) : null}
        </form>

        <div className="border-t border-border pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Leyenda</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR.en_vivo }} /> En vivo
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR.senal_debil }} /> Señal débil
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR.sin_senal }} /> Sin señal
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Destino cliente
            </li>
          </ul>
        </div>
      </div>

      <RepartosMap />
    </div>
  );
}
