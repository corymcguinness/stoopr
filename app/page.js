export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Park Slope</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Brownstones, scored by permits, FAR, and friction.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["For sale", "High upside", "Low headache", "Landmark-free", "Recently permitted"].map((t) => (
          <button
            key={t}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:border-zinc-400"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="divide-y divide-zinc-200 border-y border-zinc-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <a key={i} href="#" className="block py-4 hover:bg-zinc-50">
            <div className="flex items-center justify-between">
              <div className="font-medium">123 7th Ave</div>
              <div className="text-zinc-400">→</div>
            </div>
            <div className="mt-1 font-mono text-xs text-zinc-600">
              Overall 82 · Upside 74 · Risk 22 · Friction 61
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Unused FAR", "Historic District", "+2"].map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200"
                >
                  {f}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
