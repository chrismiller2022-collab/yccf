import { useState } from "react";
import { TEAMS } from "../data/teams";
import type { Team } from "../data/teams";

export const MIN_RATING = Math.min(...TEAMS.map((t) => t.rating));
export const MAX_RATING = Math.max(...TEAMS.map((t) => t.rating));
export const MAX_ABS = Math.max(Math.abs(MIN_RATING), Math.abs(MAX_RATING));

export const CONFERENCES = Array.from(new Set(TEAMS.map((t) => t.conf))).sort();

export const TEAMS_BY_NAME: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.team, t])
);

export const HFA = 2.4;

export const WEEKS = Array.from({ length: 16 }, (_, i) => ({
  key: `week${i + 1}`,
  label: `Week ${i + 1}`,
}));

export function conferencesForDivision(div: string): string[] {
  return Array.from(
    new Set(TEAMS.filter((t) => t.div === div).map((t) => t.conf))
  ).sort();
}

export function teamsForConference(div: string, conf: string): Team[] {
  return TEAMS.filter((t) => t.div === div && t.conf === conf).sort(
    (a, b) => a.rank - b.rank
  );
}

export function conferenceOptionsFor(division: string): string[] {
  return division === "All" ? CONFERENCES : conferencesForDivision(division);
}

export function teamsFilteredFor(division: string, conference: string): Team[] {
  return TEAMS.filter(
    (t) =>
      (division === "All" || t.div === division) &&
      (conference === "All" || t.conf === conference)
  ).sort((a, b) => a.team.localeCompare(b.team));
}

export function RatingBar({ rating }: { rating: number }) {
  const pct = (Math.abs(rating) / MAX_ABS) * 50;
  const isGood = rating < 0;
  return (
    <div className="bar-track">
      <div className="bar-center" />
      <div
        className={`bar-fill ${isGood ? "bar-good" : "bar-bad"}`}
        style={{
          width: `${pct}%`,
          left: isGood ? `${50 - pct}%` : "50%",
        }}
      />
    </div>
  );
}

export type SortKey = "rank" | "team" | "conf" | "rating";

export function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onClick,
  align,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  align?: "right";
}) {
  return (
    <th
      onClick={() => onClick(sortKey)}
      className={`th ${align === "right" ? "th-right" : ""}`}
    >
      <span className="th-inner">
        {label}
        <span className={`th-arrow ${active ? "th-arrow-active" : ""}`}>
          {active ? (dir === "asc" ? "▲" : "▼") : "—"}
        </span>
      </span>
    </th>
  );
}

export function useSort<T extends Record<string, unknown>>(
  initialKey: SortKey,
  initialDir: "asc" | "desc" = "asc"
) {
  const [sortKey, setSortKey] = useState<SortKey>(initialKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialDir);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortFn = (a: T, b: T) => {
    let av: string | number = a[sortKey];
    let bv: string | number = b[sortKey];
    if (typeof av === "string") {
      av = av.toLowerCase();
      bv = (bv as string).toLowerCase();
      return sortDir === "asc"
        ? (av as string).localeCompare(bv as string)
        : (bv as string).localeCompare(av as string);
    }
    return sortDir === "asc"
      ? (av as number) - (bv as number)
      : (bv as number) - (av as number);
  };

  return { sortKey, sortDir, handleSort, sortFn };
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  onHome,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onHome: () => void;
}) {
  return (
    <div className="team-hero">
      <button className="back-link" onClick={onHome}>
        ‹ All rankings
      </button>
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="title matchup-title">{title}</h1>
      <p className="subtitle team-subtitle">{subtitle}</p>
    </div>
  );
}

export function RankFlag({ rank }: { rank: number }) {
  return (
    <span
      className={`rank-flag ${rank <= 4 ? "top4" : rank <= 12 ? "top12" : ""}`}
    >
      {rank}
    </span>
  );
}

export function fmtPct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return "—";
  return `${(pct * 100).toFixed(1)}%`;
}

export function fmtOdds(odds: number | null | undefined): string {
  if (odds === null || odds === undefined) return "—";
  if (odds > 0) return `+${odds}`;
  return `${odds}`;
}

export function fmtNum(
  val: number | null | undefined,
  decimals = 2
): string {
  if (val === null || val === undefined) return "—";
  return val.toFixed(decimals);
}
