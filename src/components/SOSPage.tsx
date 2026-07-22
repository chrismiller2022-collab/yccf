import { useMemo, useState } from "react";
import { TEAMS } from "../data/teams";
import type { Team } from "../data/teams";
import { SOS_BY_TEAM } from "../data/futures";
import {
  CONFERENCES,
  PageHero,
  RankFlag,
  SortHeader,
  useSort,
} from "./shared";

type SOSRow = {
  team: string;
  conf: string;
  div: string;
  rank: number;
  sos: number;
};

export function SOSPage({
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
  const { sortKey, sortDir, handleSort, sortFn } = useSort<SOSRow>("sos");

  const rows = useMemo(() => {
    let list: SOSRow[] = TEAMS.map((t) => {
      const sos = SOS_BY_TEAM[t.team];
      return {
        team: t.team,
        conf: t.conf,
        div: t.div,
        rank: t.rank,
        sos: sos ?? 0,
      };
    }).filter((r) => SOS_BY_TEAM[r.team] !== undefined);

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
        eyebrow="Strength of Schedule"
        title={subLabel.toUpperCase()}
        subtitle="Strength of schedule ratings — lower (more negative) means a tougher schedule. SOS is a key component of the overall power rating."
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
              <SortHeader label="Rank" sortKey="rank" active={sortKey === "rank"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Team" sortKey="team" active={sortKey === "team"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Conference" sortKey="conf" active={sortKey === "conf"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="SOS" sortKey="sos" active={sortKey === "sos"} dir={sortDir} onClick={handleSort} align="right" />
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
                <td className={`rating-cell ${r.sos < 0 ? "rating-good" : "rating-bad"}`}>
                  {r.sos > 0 ? "+" : ""}{r.sos.toFixed(2)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">No teams match that search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="footer-note">
        SOS measures the difficulty of a team's schedule. More negative = harder schedule. Ratings are model-derived from opponent strength.
      </div>
    </div>
  );
}
