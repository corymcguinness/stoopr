export const runtime = 'edge';
// edge runtime enabled

import { getSupabase } from "../../../lib/supabase";

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
    return <pre className="text-sm text-red-600 whitespace-pre-wrap">{JSON.stringify(bErr, null, 2)}</pre>;
  }
  if (!building) {
    return <div className="text-sm text-zinc-600">Not found.</div>;
  }

  const { data: intelRows } = await supabase
    .from("intel_current")
    .select("*")
    .eq("building_id", building.id)
    .limit(1);

  const intel = Array.isArray(intelRows) ? intelRows[0] : null;
  const flags = Array.isArray(intel?.flags) ? intel.flags : [];

  const [permits, violations, sales, listings] = await Promise.all([
    supabase.from("dob_permits").select("*").eq("building_id", building.id).order("filed_date", { ascending: false }).limit(25),
    supabase.from("dob_violations").select("*").eq("building_id", building.id).order("issue_date", { ascending: false }).limit(25),
    supabase.from("sales").select("*").eq("building_id", building.id).order("sale_date", { ascending: false }).limit(10),
    supabase.from("listings").select("*").eq("building_id", building.id).order("last_seen", { ascending: false }).limit(10),
  ]);

  return (
    <div>
      <div>
        <div className="text-xs text-zinc-500">
          <a href="/" className="hover:underline">← Park Slope</a>
        </div>

        <h1 className="mt-2 text-lg font-semibold">
          {building.address_norm ?? building.bbl}
        </h1>

        <div className="mt-1 font-mono text-xs text-zinc-600">
          BBL {building.bbl} · Zoning {building.zoning_district ?? "—"} · FAR {building.far_built ?? "—"}/{building.far_allowed ?? "—"}
        </div>
      </div>

      <Section title="Intel">
        <div className="font-mono text-sm text-zinc-700">
          Overall {intel?.overall_score ?? "—"} · Upside {intel?.expansion_score ?? "—"} · Risk {intel?.reno_risk_score ?? "—"} · Friction {intel?.landmark_friction_score ?? "—"}
        </div>

        {flags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {flags.map((f) => (
              <span key={f} className="rounded-full bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
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
              <span className="font-mono text-xs text-zinc-500">{p.filed_date ?? "—"}</span>{" "}
              Permit — {p.type ?? "—"} {p.status ? `(${p.status})` : ""}
            </div>
          ))}
          {(violations.data ?? []).slice(0, 5).map((v) => (
            <div key={v.id} className="text-zinc-700">
              <span className="font-mono text-xs text-zinc-500">{v.issue_date ?? "—"}</span>{" "}
              Violation — {v.status ?? "—"}
            </div>
          ))}
          {(sales.data ?? []).slice(0, 3).map((s) => (
            <div key={s.id} className="text-zinc-700">
              <span className="font-mono text-xs text-zinc-500">{s.sale_date ?? "—"}</span>{" "}
              Sale — {s.sale_price ? `$${Number(s.sale_price).toLocaleString()}` : "—"}
            </div>
          ))}
        </div>
      </Section>

      {(listings.data ?? []).length > 0 && (
        <Section title="Listings">
          <div className="space-y-2 text-sm">
            {(listings.data ?? []).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3">
                <div className="text-zinc-700">
                  {l.status ?? "—"} · {l.ask_price ? `$${Number(l.ask_price).toLocaleString()}` : "—"} ·{" "}
                  <span className="font-mono text-xs text-zinc-500">{new Date(l.last_seen).toISOString().slice(0, 10)}</span>
                </div>
                <a className="text-xs text-zinc-600 hover:underline" href={l.source_url} target="_blank" rel="noreferrer">
                  source →
                </a>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
