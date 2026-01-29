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
          <header className="flex items-center justify-between gap-4">
            <a href="/" className="text-xl font-semibold tracking-tight">
              Stoopr
            </a>

            <div className="flex flex-1 justify-end gap-2">
              <input
                placeholder="Address / street"
                className="w-full max-w-md rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400"
              />
              <select className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900">
                <option>Park Slope</option>
              </select>
            </div>
          </header>

          <main className="mt-6">{children}</main>

          <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
            Data from NYC public records. Not a brokerage.
          </footer>
        </div>
      </body>
    </html>
  );
}
