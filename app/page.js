export const runtime = "edge";

import { getSupabase } from "@/lib/supabase";

export default async function Home({ searchParams }) {
  const supabase = getSupabase();

  const sort = searchParams?.sort === "recent" ? "recent" : "score";

  let q = supabase
    .from("building_cards")
    .select("*")
    .eq("neighborhood_id", "park-slope");

  if (sort === "recent") {
    q = q
      .order("latest_listed_at", { ascending: false, nullsLast: true })
      .order("overall_score", { ascending: false, nullsLast: true })
      .order("address_display", { ascending: true });
  } else {
    q = q
      .order("overall_score", { ascending: false, nullsLast: true })
      .order("latest_listed_at", { ascending: false, nullsLast: true })
      .order("address_display", { ascending: true });
  }

  const { data: buildings, error } = await q;

  if (error) {
    console.error(error);
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>Stoopr</h1>
        <pre style={{ whiteSpace: "pre-wrap", color: "#b91c1c", marginTop: 16 }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  const count = (buildings || []).length;

  const mostRecent = (buildings || []).reduce((acc, b) => {
    const dates = [b.latest_listed_at, b.intel_updated_at].filter(Boolean);
    if (!dates.length) return acc;

    const newest = new Date(
      Math.max(...dates.map((d) => new Date(d).getTime()))
    );

    if (!acc) return newest;
    return newest > acc ? newest : acc;
  }, null);

  const updatedLabel = mostRecent
    ? `updated ${mostRecent.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`
    : "no recent updates";

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Stoopr</h1>

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Park Slope brownstone intelligence (v0)
      </p>

      {/* Header + sort */}
      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Buildings</h2>
          <div className="mt-2 text-sm text-black/60">
            Park Slope • {count} buildings tracked • {updatedLabel}
          </div>
        </div>

        <div className="shrink-0">
          <div className="inline-flex overflow-hidden rounded-full border border-black/10 text-sm">
            <a
              href="/"
              className={`px-3 py-1.5 ${
                sort === "score"
                  ? "bg-black text-white"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              Score
            </a>
            <a
              href="/?sort=recent"
              className={`px-3 py-1.5 ${
                sort === "recent"
                  ? "bg-black text-white"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              Recently listed
            </a>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="mt-8 divide-y divide-black/10">
        {(buildings || []).map((b) => {
          const price =
            b.min_ask_price && b.max_ask_price
              ? b.min_ask_price === b.max_ask_price
                ? `$${Number(b.min_ask_price).toLocaleString()}`
                : `$${Number(b.min_ask_price).toLocaleString()}–$${Number(
                    b.max_ask_price
                  ).toLocaleString()}`
              : null;

          const latestListed = b.latest_listed_at
            ? `latest listed ${new Date(b.latest_listed_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              )}`
            : null;

          return (
            <a
              key={b.bbl}
              href={`/b/${b.bbl}`}
              className="block px-2 py-7 hover:bg-black/[0.02]"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Left column */}
                <div className="min-w-0">
                  <div className="text-lg font-semibold leading-snug">
                    {b.address_display}
                  </div>

                  <div className="mt-1 text-sm text-black/60">
                    BBL {b.bbl}
                    {b.active_listings_count > 0 ? (
                      <>
                        {" • "}
                        {b.active_listings_count} active
                        {price ? ` • ${price}` : ""}
                        {latestListed ? ` • ${latestListed}` : ""}
                      </>
                    ) : (
                      " • no active listings"
                    )}
                  </div>

                  {Array.isArray(b.flags) && b.flags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {b.flags.slice(0, 3).map((f) => (
                        <span key={f} className="text-black/70">
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Right column */}
                <div className="flex h-full flex-col items-end justify-center text-right">
                  {typeof b.overall_score === "number" ? (
                    <>
                      <div className="text-xs uppercase tracking-wide text-black/50">
                        Score
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
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
