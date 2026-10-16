import { Hero } from "@/components/hero/Hero";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { Evolution } from "@/components/sections/Evolution";
import { AgentsSection } from "@/components/sections/AgentsSection";
import { AutomationSection } from "@/components/sections/AutomationSection";
import { IntegrationsSection } from "@/components/sections/IntegrationsSection";
import { KnowledgeSection } from "@/components/sections/KnowledgeSection";
import { SolutionsSection } from "@/components/sections/SolutionsSection";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { WorkflowSection } from "@/components/sections/WorkflowSection";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <Evolution />
      <AgentsSection />
      <AutomationSection />
      <IntegrationsSection />
      <KnowledgeSection />
      <SolutionsSection />
      <IndustriesSection />
      <WorkflowSection />
    </>
  );
}
