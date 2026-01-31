export const runtime = "edge";

import { getSupabase } from "@/lib/supabase";

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
    return <pre>{JSON.stringify(bErr, null, 2)}</pre>;
  }

  if (!building) {
    return <div>Not found.</div>;
  }

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
        <a href="/" className="back-link">← Park Slope</a>

        {/* A) headline */}
        <h1>{building.address_norm ?? building.bbl}</h1>

        {/* B) meta line */}
        <div className="meta">
          BBL {building.bbl} · Zoning {building.zoning_district ?? "—"} · FAR{" "}
          {building.far_built ?? "—"}/{building.far_allowed ?? "—"}
        </div>
      </div>

      <Section title="Intel">
        {/* C) intel line */}
        <div className="intel-line">
          Overall {intel?.overall_score ?? "—"} ·
          Upside {intel?.expansion_score ?? "—"} ·
          Risk {intel?.reno_risk_score ?? "—"} ·
          Friction {intel?.landmark_friction_score ?? "—"}
        </div>

        {/* D) flags */}
        {flags.length > 0 && (
          <div className="flags">
            {flags.map((f) => (
              <span key={f} className="flag">{f}</span>
            ))}
          </div>
        )}
      </Section>

      <Section title="Timeline">
        <div className="timeline">
          {(permits.data ?? []).slice(0, 5).map((p) => (
            <div key={p.id} className="timeline-item">
              <span className="timeline-date">{p.filed_date ?? "—"}</span>
              Permit — {p.type ?? "—"} {p.status ? `(${p.status})` : ""}
            </div>
          ))}

          {(violations.data ?? []).slice(0, 5).map((v) => (
            <div key={v.id} className="timeline-item">
              <span className="timeline-date">{v.issue_date ?? "—"}</span>
              Violation — {v.status ?? "—"}
            </div>
          ))}

          {(sales.data ?? []).slice(0, 3).map((s) => (
            <div key={s.id} className="timeline-item">
              <span className="timeline-date">{s.sale_date ?? "—"}</span>
              Sale — {formatPrice(s.sale_price)}
            </div>
          ))}
        </div>
      </Section>

      {(listings.data ?? []).length > 0 && (
        <Section title="Listings">
          <div className="listings">
            {(listings.data ?? []).map((l) => (
              <div key={l.id} className="listing-row">
                <div>
                  {l.status ?? "—"} · {formatPrice(l.ask_price)} ·{" "}
                  <span className="timeline-date">
                    {formatISODate(l.listed_at)}
                  </span>
                </div>

                {l.source_url && (
                  <a href={l.source_url} target="_blank" rel="noreferrer">
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
