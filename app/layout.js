import "./globals.css";

export const metadata = {
  title: "Stoopr",
  description: "Brownstone intelligence for Brooklyn."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <header className="border-b border-zinc-200 pb-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <a href="/" className="text-xl font-semibold tracking-tight">
                  Stoopr
                </a>
                <div className="mt-1 text-xs text-zinc-500">
                  Park Slope brownstones — scored by permits, FAR, and friction.
                </div>
              </div>

              <div className="text-xs text-zinc-500">
                NYC-only • Not a brokerage
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                placeholder="Search address / street"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400"
              />
              <select className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900">
                <option>Park Slope</option>
              </select>
            </div>
          </header>

          <main className="mt-6">{children}</main>

          <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
            Data from NYC public records. Not affiliated with any broker/MLS.
          </footer>
        </div>
      </body>
    </html>
  );
}

