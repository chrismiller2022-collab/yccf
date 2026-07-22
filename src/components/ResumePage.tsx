import { useMemo, useState } from "react";
import { TEAMS } from "../data/teams";
import type { Team } from "../data/teams";
import { RESUME_BY_TEAM } from "../data/futures";
import {
  CONFERENCES,
  PageHero,
  RankFlag,
  SortHeader,
  useSort,
} from "./shared";

type ResumeRow = {
  team: string;
  conf: string;
  div: string;
  rank: number;
  rating: number;
  powerRank: number;
};

export function ResumePage({
  subLabel,
  onHome,
  onNavigateTeam,
}: {
  subLabel: string;
  onHome: () => void;
  onNavigateTeam: (t: Team) => void;
}) {
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("All");
  const [conference, setConference] = useState("All");
  const { sortKey, sortDir, handleSort, sortFn } = useSort<ResumeRow>("rank");

  const rows = useMemo(() => {
    let list: ResumeRow[] = TEAMS.map((t) => {
      const r = RESUME_BY_TEAM[t.team];
      return {
        team: t.team,
        conf: t.conf,
        div: t.div,
        rank: r?.rank ?? 999,
        rating: r?.rating ?? 0,
        powerRank: t.rank,
      };
    }).filter((r) => r.rank !== 999);

    list = list.filter((r) => {
      if (division !== "All" && r.div !== division) return false;
      if (conference !== "All" && r.conf !== conference) return false;
      if (query && !r.team.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });

    return [...list].sort(sortFn);
  }, [query, division, conference, sortFn]);

  return (
    <div>
      <PageHero
        eyebrow="Resume Ratings"
        title={subLabel.toUpperCase()}
        subtitle="Resume ratings blend wins, quality wins, and schedule strength into a single résumé score — the selection committee's lens."
        onHome={onHome}
      />

      <div className="controls">
        <input
          className="search"
          placeholder="Search for a team…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="filter"
          value={division}
          onChange={(e) => {
            setDivision(e.target.value);
            setConference("All");
          }}
        >
          <option value="All">All divisions</option>
          <option value="FBS">FBS</option>
          <option value="FCS">FCS</option>
        </select>
        <select
          className="filter"
          value={conference}
          onChange={(e) => setConference(e.target.value)}
        >
          <option value="All">All conferences</option>
          {CONFERENCES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortHeader label="Resume Rank" sortKey="rank" active={sortKey === "rank"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Team" sortKey="team" active={sortKey === "team"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Conference" sortKey="conf" active={sortKey === "conf"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Power Rank" sortKey="powerRank" active={sortKey === "powerRank"} dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader label="Rating" sortKey="rating" active={sortKey === "rating"} dir={sortDir} onClick={handleSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.team}>
                <td><RankFlag rank={r.rank} /></td>
                <td>
                  <button className="team-link" onClick={() => {
                    const t = TEAMS.find((t) => t.team === r.team);
                    if (t) onNavigateTeam(t);
                  }}>
                    <span className="team-name">{r.team}</span>
                  </button>
                </td>
                <td className="conf-cell">{r.conf}</td>
                <td className="rating-cell">{r.powerRank}</td>
                <td className="rating-cell rating-good">{r.rating.toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">No teams match that search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="footer-note">
        Resume ratings are a composite of game results, quality of wins, and schedule strength — designed to mirror the playoff committee's evaluation.
      </div>
    </div>
  );
}
