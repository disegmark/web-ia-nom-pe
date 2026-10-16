"use client";

import { useState } from "react";
import { LayoutDashboard, MessageCircle, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoAgent } from "./DemoAgent";
import { DemoWhatsApp } from "./DemoWhatsApp";
import { DemoDashboard } from "./DemoDashboard";

type Tab = "chat" | "whatsapp" | "dashboard";

const TABS: Array<{ key: Tab; label: string; icon: typeof MessageCircle }> = [
  { key: "chat", label: "Conversación web", icon: MessageCircle },
  { key: "whatsapp", label: "WhatsApp", icon: Smartphone },
  { key: "dashboard", label: "Panel de control", icon: LayoutDashboard },
];

export function DemoTabs() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={cn(
              "focus-ring flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "border-cyan/60 bg-primary/10 text-cyan"
                : "border-border text-muted hover:border-cyan/40 hover:text-cyan",
            )}
          >
            <TabIcon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "chat" ? <DemoAgent /> : tab === "whatsapp" ? <DemoWhatsApp /> : <DemoDashboard />}
      </div>
    </div>
  );
}
