export const runtime = "edge";

import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

function money(v) {
  if (v == null) return null;
  return `$${Number(v).toLocaleString()}`;
}

function moneyRange(min, max) {
  if (min == null && max == null) return null;
  if (min != null && max != null) {
    if (Number(min) === Number(max)) return `$${Number(min).toLocaleString()}`;
    return `$${Number(min).toLocaleString()}–$${Number(max).toLocaleString()}`;
  }
  const v = min ?? max;
  return `$${Number(v).toLocaleString()}`;
}

function asFlags(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default async function BuildingPage({ params }) {
  const supabase = getSupabase();
  const bbl = params.bbl;

  const { data: card, error: cardErr } = await supabase
    .from("building_cards")
    .select("*")
    .eq("bbl", bbl)
    .maybeSingle();

  const { data: listings, error: listingsErr } = await supabase
    .from("listings")
    .select("id,source,status,ask_price,listed_at,url,source_url")
    .eq("bbl", bbl)
    .order("listed_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (cardErr || listingsErr) {
    return (
      <main className="p-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Stoopr</h1>
        <pre className="mt-6 whitespace-pre-wrap text-sm text-red-700">
          {JSON.stringify({ cardErr, listingsErr }, null, 2)}
        </pre>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="p-6">
        <Link className="underline underline-offset-4" href="/">
          ← Back
        </Link>
        <p className="mt-6 text-black/60">No building found for BBL {bbl}.</p>
      </main>
    );
  }

  const flags = asFlags(card.flags);
  const priceRange = moneyRange(card.min_ask_price, card.max_ask_price);

  return (
    <main className="p-6">
      <header className="max-w-4xl">
        <Link className="underline underline-offset-4 text-sm" href="/">
          ← Home
        </Link>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
          {card.address_display}
        </h1>

        <div className="mt-3 text-sm text-black/60">
          BBL {card.bbl}
          {" • "}
          {card.active_listings_count > 0
            ? `${card.active_listings_count} active${priceRange ? ` • ${priceRange}` : ""}`
            : "no active listings"}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-black/10 p-4">
            <div className="text-xs uppercase tracking-wide text-black/50">
              Overall score
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums">
              {typeof card.overall_score === "number" ? card.overall_score : "—"}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 p-4">
            <div className="text-xs uppercase tracking-wide text-black/50">
              Reno risk
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums">
              {typeof card.reno_risk_score === "number" ? card.reno_risk_score : "—"}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 p-4">
            <div className="text-xs uppercase tracking-wide text-black/50">
              Landmark friction
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums">
              {typeof card.landmark_friction_score === "number"
                ? card.landmark_friction_score
                : "—"}
            </div>
          </div>
        </div>

        {flags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {flags.map((f) => (
              <span
                key={f}
                className="rounded-full border border-black/10 px-2 py-1 text-xs text-black/70"
              >
                {f}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <section className="mt-10 max-w-4xl">
        <h2 className="text-xl font-bold">Listings</h2>

        <div className="mt-4 divide-y divide-black/10 border-t border-black/10">
          {(listings || []).map((l) => {
            const href = l.url || l.source_url || null;
            const when = l.listed_at ? new Date(l.listed_at).toLocaleDateString() : null;

            return (
              <div key={l.id} className="py-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="text-sm text-black/60">
                      <span className="font-medium text-black/70">{l.source}</span>
                      {" • "}
                      {l.status}
                      {when ? ` • ${when}` : ""}
                    </div>

                    <div className="mt-1 text-lg font-semibold">
                      {money(l.ask_price) ?? "Price unknown"}
                    </div>

                    {href ? (
                      <a
                        className="mt-2 inline-block text-sm underline underline-offset-4"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View source
                      </a>
                    ) : (
                      <div className="mt-2 text-sm text-black/40">No URL</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {(listings || []).length === 0 ? (
            <div className="py-6 text-sm text-black/60">No listings yet.</div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
