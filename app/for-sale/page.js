export const runtime = "edge";

import { getSupabase } from "../../lib/supabase";

export default async function ForSale() {
  const supabase = getSupabase();

  // 1) Grab active listings
  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, bbl, source, source_url, status, ask_price, last_seen")
    .eq("status", "active")
    .order("last_seen", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <pre className="text-sm text-red-600 whitespace-pre-wrap">
        {JSON.stringify(error, null, 2)}
      </pre>
    );
  }

  const bbls = Array.from(
    new Set((listings ?? []).map((l) => l.bbl).filter(Boolean))
  );

  // 2) Fetch building info by BBL (NOT id)
  const { data: buildings } = await supabase
    .from("buildings")
    .select("bbl, address_norm, neighborhood_id")
    .in("bbl", bbls);

  const byBBL = new Map((buildings ?? []).map((b) => [b.bbl, b]));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-500">
          <a href="/" className="hover:underline">← Park Slope</a>
        </div>
        <h1 className="mt-2 text-lg font-semibold">For sale</h1>
        <div className="mt-1 text-sm text-zinc-600">
          Active listing signals, matched to buildings.
        </div>
      </div>

      <div className="border-y border-zinc-200">
        {(listings ?? []).length === 0 ? (
          <div className="py-6 text-sm text-zinc-600">
            No active listings yet.
          </div>
        ) : (
          listings.map((l) => {
            const b = byBBL.get(l.bbl);
            const title = b?.address_norm ?? l.bbl ?? "Unknown building";

            return (
              <div key={l.id} className="block py-4 hover:bg-zinc-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <a
                      href={`/b/${l.bbl}`}
                      className="font-medium hover:underline"
                    >
                      {title}
                    </a>
                    <div className="mt-1 font-mono text-xs text-zinc-600">
                      BBL {l.bbl}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm text-zinc-700">
                      {l.ask_price
                        ? `$${Number(l.ask_price).toLocaleString()}`
                        : "—"}
                    </div>
