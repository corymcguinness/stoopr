import { getSupabase } from "../lib/supabase";

function ScorePill({ label, value }) {
  return (
    <span className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
      <span className="text-zinc-500">{label} </span>
      <span className="font-mono">{value ?? "—"}</span>
    </span>
  );
}

export default async function Home() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("buildings")
    .select(
      `
      id,
      bbl,
      address_norm,
      neighborhood_id,
      brownstone_confidence,
      intel_current (
        overall_score,
        expansion_score,
        reno_risk_score,
        landmark_friction_score,
        flags
      )
    `
    )
    .eq("neighborhood_id", "park-slope")
    .order("brownstone_confidence", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <pre className="text-sm text-red-600 whitespace-pre-wrap">
        {JSON.stringify(error, null, 2)}
      </pre>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="text-sm text-zinc-600">
        Browse buildings. Listings come and go — Stoopr pages stay put.
      </div>

      <div className="flex flex-wrap gap-2">
        {["For sale", "High upside", "Low headache", "Landmark-free", "Recently permitted"].map((t) => (
          <a
            key={t}
            href={t === "For sale" ? "/for-sale" : "#"}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:border-zinc-400"
            title={t === "For sale" ? "Listings only" : "Coming soon"}
          >
            {t}
          </a>
        ))}
      </div>

      <div className="border-y border-zinc-200">
        {rows.length === 0 ? (
          <div className="py-6 text-sm text-zinc-600">
            No buildings yet. (Next: import Park Slope.)
          </div>
        ) : (
          rows.map((r) => {
            const intel = Array.isArray(r.intel_current) ? r.intel_current[0] : null;
            const flags = Array.isArray(intel?.flags) ? intel.flags : [];

            return (
              <a key={r.id} href={`/b/${r.bbl}`} className="block py-4 hover:bg-zinc-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{r.address_norm ?? r.bbl}</div>
                    <div className="mt-1 font-mono text-xs text-zinc-600">BBL {r.bbl}</div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <ScorePill label="Overall" value={intel?.overall_score} />
                    <ScorePill label="Upside" value={intel?.expansion_score} />
                    <ScorePill label="Risk" value={intel?.reno_risk_score} />
                    <ScorePill label="Friction" value={intel?.landmark_friction_score} />
                  </div>
                </div>

                {flags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {flags.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200"
                      >
                        {f}
                      </span>
                    ))}
                    {flags.length > 4 && (
                      <span className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
                        +{flags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
