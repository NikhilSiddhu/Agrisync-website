import { Activity, AlertTriangle, Sprout } from "lucide-react";

const yieldBars = [22, 30, 42, 49, 60, 72, 85];

export function DashboardSection() {
  return (
    <section className="px-6 py-24 md:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black tracking-tight text-zinc-100 md:text-4xl">Command Center Dashboard</h2>
        <p className="mt-3 max-w-2xl text-zinc-400">Live field intelligence mapped to actionable distribution controls.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[#00FF41]">
              <Sprout size={18} />
              <p className="text-xs tracking-[0.15em]">EFFICIENCY</p>
            </div>
            <p className="mt-5 text-sm text-zinc-400">Current Fertilizer Waste Reduction</p>
            <p className="mt-1 text-3xl font-black text-zinc-100">42.7%</p>
          </article>

          <article className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[#FF5500]">
              <AlertTriangle size={18} />
              <p className="text-xs tracking-[0.15em]">CHEMICAL STATUS</p>
            </div>
            <p className="mt-5 text-sm text-zinc-400">Pesticide Distribution</p>
            <p className="mt-1 text-3xl font-black text-[#00FF41]">Optimal</p>
          </article>

          <article className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-zinc-300">
              <Activity size={18} />
              <p className="text-xs tracking-[0.15em]">YIELD TREND</p>
            </div>
            <p className="mt-5 text-sm text-zinc-400">Crop Yield Prediction</p>
            <div className="mt-4 flex h-24 items-end gap-1.5">
              {yieldBars.map((bar, index) => (
                <div key={index} style={{ height: `${bar}%` }} className="w-full rounded-sm bg-gradient-to-t from-[#00FF41]/30 to-[#00FF41]" />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
