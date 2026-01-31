export const runtime = "edge";

import { getSupabase } from "@/lib/supabase";

export default async function ForSale() {
  const supabase = getSupabase();

  // 1) Grab active listings
  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, bbl, source, source_url, status, ask_price, listed_at")
    .eq("status", "active")
    .order("listed_at", { ascending: false })
    .limit(100);

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  const bbls = [...new Set((listings ?? []).map(l => l.bbl))];

  // 2) Fetch buildings by BBL (IMPORTANT FIX)
  const { data: buildings } = await supabase
    .from("buildings")
    .select("bbl, address_norm")
    .in("bbl", bbls);

  const byBBL = new Map((buildings ?? []).map(b => [b.bbl, b]));

  return (
    <div style={{ padding: 24 }}>
      <h1>For Sale</h1>

      {(listings ?? []).map(l => {
        const b = byBBL.get(l.bbl);

        return (
          <div key={l.id} style={{ marginTop: 16 }}>
            <a href={`/b/${l.bbl}`}>
              {b?.address_norm ?? l.bbl}
            </a>

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              ${Number(l.ask_price).toLocaleString()} ·{" "}
              {l.listed_at?.slice(0, 10)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
