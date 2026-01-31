export const runtime = "edge";

import Link from "next/link";
import { getSupabase } from "@/lib/supabase"; // ✅ relative path from /app/page.js

export default async function Home() {
  const supabase = getSupabase();

  const { data: buildings, error } = await supabase
    .from("building_cards")
    .select("*")
    .eq("neighborhood_id", "park-slope")
    .order("overall_score", { ascending: false, nullsFirst: false })
    .order("address_display", { ascending: true });

if (error) {
  console.error(error);
}

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>Stoopr</h1>
        <pre style={{ whiteSpace: "pre-wrap", color: "#b91c1c" }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Stoopr</h1>

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Park Slope brownstone intelligence (v0)
      </p>

      <h2 style={{ marginTop: 24, fontSize: 18, fontWeight: 600 }}>
        Buildings
      </h2>

      <div className="mt-6 space-y-3">
  {(buildings || []).map((b) => {
    const price =
      b.min_ask_price && b.max_ask_price
        ? b.min_ask_price === b.max_ask_price
          ? `$${Number(b.min_ask_price).toLocaleString()}`
          : `$${Number(b.min_ask_price).toLocaleString()}–$${Number(b.max_ask_price).toLocaleString()}`
        : null;

    return (
      <a
        key={b.bbl}
        href={`/b/${b.bbl}`}
        className="block rounded-lg border border-black/10 bg-white px-5 py-4 hover:border-black/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-lg font-semibold leading-snug text-black">
              {b.address_display}
            </div>
            <div className="mt-1 text-sm text-black/60">
              BBL {b.bbl}
              {b.active_listings_count > 0 ? (
                <>
                  {" • "}
                  {b.active_listings_count} active
                  {price ? ` • ${price}` : ""}
                </>
              ) : (
                " • no active listings"
              )}
            </div>

            {Array.isArray(b.flags) && b.flags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {b.flags.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/70"
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
                <div className="text-2xl font-semibold tabular-nums">
                  {b.overall_score}
                </div>
              </>
            ) : (
              <div className="text-sm text-black/40">No score</div>
            )}
          </div>
        </div>
      </a>
    );
  })}
</div>
    </main>
  );
}
