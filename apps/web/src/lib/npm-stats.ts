import { cacheLife } from "next/cache";

export const statPackages = [
  { name: "@zeroth-ai/sdk-node", short: "sdk-node", blurb: "Node, Electron and Tauri sidecars. The runtime that runs models today." },
  { name: "@zeroth-ai/sdk", short: "sdk", blurb: "The core API and types. Installed automatically by the other packages." },
  { name: "@zeroth-ai/sdk-web", short: "sdk-web", blurb: "Browser runtime on WebAssembly. Preview." },
  { name: "@zeroth-ai/sdk-react-native", short: "sdk-react-native", blurb: "iOS and Android through React Native. Preview." },
] as const;

export interface PackageStats {
  name: string;
  short: string;
  blurb: string;
  /** False when npm has not reported any counts for the package yet. */
  counted: boolean;
  day: number;
  week: number;
  month: number;
  lifetime: number;
  /** Daily downloads for the last 30 days, oldest first. */
  series: { day: string; downloads: number }[];
}

const API = "https://api.npmjs.org/downloads";
// All Zeroth packages were published after this date, so summing from here gives lifetime downloads.
const SINCE = "2026-10-01";

const iso = (d: Date) => d.toISOString().slice(0, 10);

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const body = (await res.json()) as T & { error?: string };
    return body.error ? null : body;
  } catch {
    return null;
  }
}

/** Download counts from npm's public API. Cached and refreshed hourly. */
export async function getNpmStats(): Promise<{ packages: PackageStats[]; updated: string }> {
  "use cache";
  cacheLife("hours");

  const today = iso(new Date());
  const packages = await Promise.all(
    statPackages.map(async (p): Promise<PackageStats> => {
      const [day, week, month, range] = await Promise.all([
        getJson<{ downloads: number }>(`${API}/point/last-day/${p.name}`),
        getJson<{ downloads: number }>(`${API}/point/last-week/${p.name}`),
        getJson<{ downloads: number }>(`${API}/point/last-month/${p.name}`),
        getJson<{ downloads: { day: string; downloads: number }[] }>(`${API}/range/${SINCE}:${today}/${p.name}`),
      ]);
      const all = range?.downloads ?? [];
      return {
        ...p,
        counted: Boolean(range),
        day: day?.downloads ?? 0,
        week: week?.downloads ?? 0,
        month: month?.downloads ?? 0,
        lifetime: all.reduce((n, d) => n + d.downloads, 0),
        series: all.slice(-30),
      };
    }),
  );
  return { packages, updated: new Date().toISOString() };
}
