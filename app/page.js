const FILTERS = [
  { label: "For sale", hint: "Listings only" },
  { label: "High upside", hint: "Unused FAR" },
  { label: "Low headache", hint: "Clean history" },
  { label: "Landmark-free", hint: "Less friction" },
  { label: "Recently permitted", hint: "Fresh activity" }
];

const MOCK_ROWS = [
  {
    address: "123 7th Ave",
    bbl: "3001270012",
    overall: 82,
    upside: 74,
    risk: 22,
    friction: 61,
    flags: ["Unused FAR", "Historic District", "20ft Lot"]
  },
  {
    address: "456 3rd St",
    bbl: "3001270456",
    overall: 76,
    upside: 61,
    risk: 35,
    friction: 28,
    flags: ["Permit History Quiet", "No Landmark"]
  },
  {
    address: "89 10th St",
    bbl: "3001270789",
    overall: 69,
    upside: 58,
    risk: 41,
    friction: 52,
    flags: ["Open Permits", "Possible SRO History"]
  }
];

function ScorePill({ label, value }) {
  return (
    <span className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
      <span className="text-zinc-500">{label} </span>
      <span className="font-mono">{value}</span>
    </span>
  );
}

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-zinc-600">
          Browse buildings. Listings come and go — Stoopr pages stay put.
        </div>
      </div>

      <div>
        <div className="text-xs text-zinc-500">Quick filters</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:border-zinc-400"
              title={f.hint}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-y border-zinc-200">
        {MOCK_ROWS.map((r) => (
          <a key={r.bbl} href="#" className="block py-4 hover:bg-zinc-50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{r.address}</div>
                <div className="mt-1 font-mono text-xs text-zinc-600">
                  BBL {r.bbl}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <ScorePill label="Overall" value={r.overall} />
                <ScorePill label="Upside" value={r.upside} />
                <ScorePill label="Risk" value={r.risk} />
                <ScorePill label="Friction" value={r.friction} />
              </div>
            </div>

            {r.flags?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.flags.slice(0, 4).map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200"
                  >
                    {f}
                  </span>
                ))}
                {r.flags.length > 4 && (
                  <span className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
                    +{r.flags.length - 4}
                  </span>
                )}
              </div>
            ) : null}
          </a>
        ))}
      </div>

      <div className="text-xs text-zinc-500">
        Next: replace mock rows with Supabase data + building pages.
      </div>
    </div>
  );
}

