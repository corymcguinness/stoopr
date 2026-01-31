export const runtime = "edge";

import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

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

export default async function Home() {
  const supabase = getSupabase();

  const { data: cards, error } = await supabase
    .from("building_cards")
    .select(
      "bbl,address_display,neighborhood_id,overall_score,flags,active_listings_count,min_ask_price,max_ask_price"
    )
    .eq("neighborhood_id", "park-slope")
    .order("overall_score", { ascending: false, nullsFirst: false })
    .order("address_display", { ascending: true });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Stoopr</h1>
        <pre className="mt-6 whitespace-pre-wrap text-sm text-red-700">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  return (
    <main className="p-6">
      <header className="max-w-4xl">
        <h1 className="text-5xl font-extrabold tracking-tight">Stoopr</h1>
        <p className="mt-3 text-lg text-black/60">
          Park Slope brownstone intelligence (v0)
        </p>

        <nav className="mt-6 flex gap-4 text-sm">
          <Link className="underline underline-offset-4" href="/">
            Home
          </Link>
          <Link className="underline underline-offset-4" href="/for-sale">
            For sale
          </Link>
        </nav>
      </header>

      <section className="mt-10 max-w-4xl">
        <h2 className="text-xl font-bold">Buildings</h2>

        <div className="mt-6 divide-y divide-black/10 border-t border-black/10">
          {(cards || []).map((b) => {
            const flags = asFlags(b.flags).slice(0, 4);
            const price = moneyRange(b.min_ask_price, b.max_ask_price);

            return (
              <Link
                key={b.bbl}
                href={`/b/${b.bbl}`}
                className="block py-6 hover:bg-black/[0.02]"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="text-2xl font-bold leading-tight">
                      {b.address_display}
                    </div>

                    <div className="mt-2 text-sm text-black/60">
                      <span className="font-medium text-black/70">BBL</span>{" "}
                      {b.bbl}
                      {" • "}
                      {b.active_listings_count > 0 ? (
                        <>
                          {b.active_listings_count} active
                          {price ? ` • ${price}` : ""}
                        </>
                      ) : (
                        "no active listings"
                      )}
                    </div>

                    {flags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
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
                  </div>

                  <div className="shrink-0 text-right">
                    {typeof b.overall_score === "number" ? (
                      <>
                        <div className="text-xs uppercase tracking-wide text-black/50">
                          Score
                        </div>
                        <div className="mt-1 text-3xl font-bold tabular-nums">
                          {b.overall_score}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-black/40">No score</div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
