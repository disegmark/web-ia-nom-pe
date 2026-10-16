"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";

const INPUT_CLASSES =
  "focus-ring w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/70";

const LABEL_CLASSES = "text-sm font-medium text-foreground";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      need: String(data.get("need") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("request_failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-cyan/30 bg-background-elevated p-8 text-center"
      >
        <p className="text-lg font-semibold text-foreground">Mensaje enviado</p>
        <p className="mt-2 text-sm text-muted">
          Gracias por escribirnos. Te responderemos en cuanto revisemos tu solicitud.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className={LABEL_CLASSES}>
            Nombre
          </label>
          <input id="name" name="name" type="text" required className={INPUT_CLASSES} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <label htmlFor="company" className={LABEL_CLASSES}>
            Empresa
          </label>
          <input id="company" name="company" type="text" className={INPUT_CLASSES} autoComplete="organization" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className={LABEL_CLASSES}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={INPUT_CLASSES} autoComplete="email" />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className={LABEL_CLASSES}>
            Teléfono
          </label>
          <input id="phone" name="phone" type="tel" className={INPUT_CLASSES} autoComplete="tel" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="need" className={LABEL_CLASSES}>
          ¿Qué necesitas?
        </label>
        <select id="need" name="need" className={INPUT_CLASSES} defaultValue="">
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="agente-ia">Un agente iA</option>
          <option value="automatizacion">Automatización de procesos</option>
          <option value="integracion">Integración de herramientas</option>
          <option value="diagnostico">Diagnóstico / no estoy seguro</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className={LABEL_CLASSES}>
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={INPUT_CLASSES}
        />
      </div>

      {status === "error" ? (
        <p role="alert" className="text-sm text-red-400">
          No pudimos enviar tu mensaje. Intenta nuevamente en unos minutos.
        </p>
      ) : null}

      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Enviando…" : "Quiero conectar inteligencia"}
      </Button>
    </form>
  );
}
