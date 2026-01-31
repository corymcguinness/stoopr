export const runtime = "edge";

import { getSupabase } from "../../../lib/supabase"; // <-- safest path (no @ alias)

function formatPrice(n) {
  if (n === null || n === undefined) return "—";
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "—";
  return `$${num.toLocaleString()}`;
}

function formatISODate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toISOString().slice(0, 10);
}

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default async function BuildingPage({ params }) {
  const supabase = getSupabase();
  const bbl = params.bbl;

  const { data: building, error: bErr } = await supabase
    .from("buildings")
    .select("*")
    .eq("bbl", bbl)
    .maybeSingle();

  if (bErr) {
    return (
      <pre className="text-sm text-red-600 whitespace-pre-wrap">
        {JSON.stringify(bErr, null, 2)}
      </pre>
    );
  }

  if (!building) {
    return <div className="text-sm text-zinc-600">Not found.</div>;
  }

  // join intel_current by BBL
  const { data: intelRows } = await supabase
    .from("intel_current")
    .select("*")
    .eq("bbl", building.bbl)
    .limit(1);

  const intel = Array.isArray(intelRows) ? intelRows[0] : null;
  const flags = Array.isArray(intel?.flags) ? intel.flags : [];

  const [permits, violations, sales, listings] = await Promise.all([
    supabase
      .from("dob_permits")
      .select("*")
      .eq("bbl", building.bbl)
      .order("filed_date", { ascending: false })
      .limit(25),

    supabase
      .from("dob_violations")
      .select("*")
      .eq("bbl", building.bbl)
      .order("issue_date", { ascending: false })
      .limit(25),

    supabase
      .from("sales")
      .select("*")
      .eq("bbl", building.bbl)
      .order("sale_date", { ascending: false })
      .limit(10),

    // listings ordered by listed_at (not last_seen)
    supabase
      .from("listings")
      .select("*")
      .eq("bbl", building.bbl)
      .order("listed_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div>
      <div>
        <div className="text-xs text-zinc-500">
          <a href="/" className="hover:underline">
            ← Park Slope
          </a>
        </div>

        <h1 className="mt-2 text-lg font-semibold">
          {building.address_norm ?? building.bbl}
        </h1>

        <div className="mt-1 font-mono text-xs text-zinc-600">
          BBL {building.bbl} ·{" "}
          <span className="text-zinc-500">
            BBL = NYC’s building ID (borough-block-lot)
          </span>
        </div>

        <div className="mt-1 font-mono text-xs text-zinc-600">
          Zoning {building.zoning_district ?? "—"} · FAR{" "}
          {building.far_built ?? "—"}/{building.far_allowed ?? "—"}
        </div>
      </div>

      <Section title="Intel">
        <div className="font-mono text-sm text-zinc-700">
          Overall {intel?.overall_score ?? "—"} · Upside{" "}
          {intel?.expansion_score ?? "—"} · Risk {intel?.reno_risk_score ?? "—"} ·
          Friction {intel?.landmark_friction_score ?? "—"}
        </div>

        {flags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {flags.map((f) => (
              <span
                key={f}
                className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {intel?.summary_text && (
          <div className="mt-3 text-sm text-zinc-700">{intel.summary_text}</div>
        )}
      </Section>

      <Section title="Timeline">
        <div className="space-y-2 text-sm">
          {(permits.data ?? []).slice(0, 5).map((p) => (
            <div key={p.id} className="text-zinc-700">
              <span className="font-mono text-xs text-zinc-500">
                {p.filed_date ?? "—"}
              </span>{" "}
              Permit — {p.type ?? "—"} {p.status ? `(${p.status})` : ""}
            </div>
          ))}

          {(violations.data ?? []).slice(0, 5).map((v) => (
            <div key={v.id} className="text-zinc-700">
              <span className="font-mono text-xs text-zinc-500">
                {v.issue_date ?? "—"}
              </span>{" "}
              Violation — {v.status ?? "—"}
            </div>
          ))}

          {(sales.data ?? []).slice(0, 3).map((s) => (
            <div key={s.id} className="text-zinc-700">
              <span className="font-mono text-xs text-zinc-500">
                {s.sale_date ?? "—"}
              </span>{" "}
              Sale — {formatPrice(s.sale_price)}
            </div>
          ))}
        </div>
      </Section>

      {(listings.data ?? []).length > 0 && (
        <Section title="Listings">
          <div className="space-y-2 text-sm">
            {(listings.data ?? []).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="text-zinc-700">
                  {l.status ?? "—"} · {formatPrice(l.ask_price)} ·{" "}
                  <span className="font-mono text-xs text-zinc-500">
                    {formatISODate(l.listed_at)}
                  </span>
                </div>

                {l.source_url && (
                  <a
                    className="text-xs text-zinc-600 hover:underline"
                    href={l.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    source →
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
