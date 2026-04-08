"use client";

import { DashboardSection } from "@/components/dashboard-section";
import { HeroSection } from "@/components/hero-section";
import { ProcessSection } from "@/components/process-section";
import { SceneBackground } from "@/components/scene-background";
import { WaitlistFooter } from "@/components/waitlist-footer";

export function MainExperience() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0A0A0A] text-[#E5E5E5]">
      <SceneBackground />

      <main className="relative z-10">
        <HeroSection />
        <ProcessSection />
        <DashboardSection />
        <WaitlistFooter />
      </main>
    </div>
  );
}
