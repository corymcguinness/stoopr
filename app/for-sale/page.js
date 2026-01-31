export const runtime = "edge";

import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

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

function daysAgo(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const diffMs = Date.now() - dt.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

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
    return (
      <pre className="text-sm text-red-600 whitespace-pre-wrap">
        {JSON.stringify(error, null, 2)}
      </pre>
    );
  }

  const bbls = Array.from(
    new Set((listings ?? []).map((l) => l.bbl).filter(Boolean))
  );

  // 2) Fetch building info for those BBLs
  const { data: buildings, error: bErr } = await supabase
    .from("buildings")
    .select("bbl, address_norm, address_display")
    .in("bbl", bbls);

  if (bErr) {
    return (
      <pre className="text-sm text-red-600 whitespace-pre-wrap">
        {JSON.stringify(bErr, null, 2)}
      </pre>
    );
  }

  const byBBL = new Map((buildings ?? []).map((b) => [b.bbl, b]));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs text-zinc-500">
          <Link href="/" className="hover:underline">
            ← Park Slope
          </Link>
        </div>

        <h1 className="text-lg font-semibold">For sale</h1>

        <div className="text-sm text-zinc-600">
          Active listing signals matched to buildings by <span className="font-mono">BBL</span>.
        </div>
      </header>

      <div className="border-y border-zinc-200">
        {(listings ?? []).length === 0 ? (
          <div className="py-6 text-sm text-zinc-600">No active listings yet.</div>
        ) : (
          (listings ?? []).map((l) => {
            const b = byBBL.get(l.bbl);
            const title = b?.address_display ?? b?.address_norm ?? `BBL ${l.bbl}`;
            const ago = daysAgo(l.listed_at);

            return (
              <div key={l.id} className="block py-4 hover:bg-zinc-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/b/${l.bbl}`} className="font-medium hover:underline">
                      {title}
                    </Link>

                    <div className="mt-1 font-mono text-xs text-zinc-600">
                      BBL {l.bbl}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm text-zinc-700">
                      {formatPrice(l.ask_price)}
                    </div>
                    <div className="mt-1 font-mono text-xs text-zinc-500">
                      {formatISODate(l.listed_at)}
                      {ago ? ` · ${ago}` : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-zinc-600">
                  {l.source ?? "source"} ·{" "}
                  {l.source_url ? (
                    <a className="hover:underline" href={l.source_url} target="_blank" rel="noreferrer">
                      source →
                    </a>
                  ) : (
                    <span>no link</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
