// History data for the "Every commit" peak (data/history.json, written by scripts/build-history.py).

export type ProjectKey = "next" | "calautox" | "onerm" | "ads" | "atlas" | "wsigte" | "site" | "other";

export type DayEntry = { d: string } & Partial<Record<ProjectKey, number>>;

export type Milestone = { d: string; app: ProjectKey; label: string };

export type History = {
  generated: string;
  totals: Partial<Record<ProjectKey, number>>;
  total: number;
  first: string;
  last: string;
  series: DayEntry[];
  milestones: Milestone[];
  stats: {
    onerm: { version: string; released: string; updated: string; rating: number; ratings: number };
    atlas: { version: string; released: string; updated: string; rating: number; ratings: number };
    [k: string]: unknown;
  };
  races: { d: string; cls: number; clsN: number }[];
};

export const ORDER: ProjectKey[] = ["next", "calautox", "onerm", "ads", "atlas", "wsigte", "site", "other"]; // stack order, bottom to top
export const Y0 = 2018;
export const NY = 9;

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const dayTotal = (e: DayEntry) => ORDER.reduce((s, k) => s + (e[k] || 0), 0);

export function yearTotals(H: History): number[] {
  const t = new Array(NY).fill(0);
  for (const e of H.series) {
    const i = +e.d.slice(0, 4) - Y0;
    if (i >= 0 && i < NY) t[i] += dayTotal(e);
  }
  return t;
}

export const monthYear = (iso: string) => MONTHS[+iso.slice(5, 7) - 1] + " " + iso.slice(0, 4);

export const fmt = (n: number) => n.toLocaleString("en-US");
