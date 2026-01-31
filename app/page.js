export const runtime = "edge";

import Link from "next/link";
import { getSupabase } from "@/lib/supabase"; // ✅ relative path from /app/page.js

export default async function Home() {
  const supabase = getSupabase();

  const { data: buildings, error } = await supabase
    .from("buildings")
    .select("bbl,address_display,neighborhood_id,created_at")
    .eq("neighborhood_id", "park-slope") // Park Slope–first
    .order("created_at", { ascending: false })
    .limit(50);

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

      <ul style={{ marginTop: 12, lineHeight: 1.9 }}>
        {(buildings ?? []).map((b) => (
          <li key={b.bbl}>
            <Link href={`/b/${b.bbl}`}>{b.address_display ?? b.bbl}</Link>{" "}
            <span style={{ opacity: 0.6 }}>({b.bbl})</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
