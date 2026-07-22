import { useMemo, useState } from "react";
import { TEAMS } from "../data/teams";
import type { Team } from "../data/teams";
import {
  CONF_FUTURES,
} from "../data/futures";
import {
  CONFERENCES,
  PageHero,
  RankFlag,
  fmtNum,
} from "./shared";

type FutureSortKey = SortKey | "totalWins" | "confProjWins" | "confLine" | "value" | "confWinPct";

export function WinTotalsPage({
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
  const [sortKey, setSortKey] = useState<FutureSortKey>("value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    let list = CONF_FUTURES.map((f) => {
      const team = TEAMS.find((t) => t.team === f.team);
      return {
        ...f,
        rank: team?.rank ?? 999,
        conf: team?.conf ?? "",
        div: team?.div ?? "",
      };
    });

    list = list.filter((f) => {
      if (division !== "All" && f.div !== division) return false;
      if (conference !== "All" && f.conf !== conference) return false;
      if (query && !f.team.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });

    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string") {
        return sortDir === "asc"
          ? (av as string).localeCompare(bv as string)
          : (bv as string).localeCompare(av as string);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [query, division, conference, sortKey, sortDir]);

  const handleSort = (key: FutureSortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Win Totals"
        title={subLabel.toUpperCase()}
        subtitle="Conference win projections, fair prices, and betting value for every FBS team. Negative value = bet is favorable."
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
        <div className="table-scroll">
          <table className="futures-table">
            <thead>
              <tr>
                <th className="th" onClick={() => handleSort("rank")}>Rank</th>
                <th className="th" onClick={() => handleSort("team")}>Team</th>
                <th className="th" onClick={() => handleSort("conf")}>Conf</th>
                <th className="th th-right" onClick={() => handleSort("totalWins")}>Total Wins</th>
                <th className="th th-right" onClick={() => handleSort("confProjWins")}>Conf Wins</th>
                <th className="th th-right" onClick={() => handleSort("confLine")}>Conf Line</th>
                <th className="th th-right" onClick={() => handleSort("dif")}>Dif</th>
                <th className="th th-right">Bet</th>
                <th className="th th-right" onClick={() => handleSort("confWinPct")}>Win %</th>
                <th className="th th-right" onClick={() => handleSort("fairPrice")}>Fair Price</th>
                <th className="th th-right" onClick={() => handleSort("odds")}>Odds</th>
                <th className="th th-right" onClick={() => handleSort("value")}>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.team}>
                  <td><RankFlag rank={f.rank} /></td>
                  <td>
                    <button className="team-link" onClick={() => {
                      const t = TEAMS.find((t) => t.team === f.team);
                      if (t) onNavigateTeam(t);
                    }}>
                      <span className="team-name">{f.team}</span>
                    </button>
                  </td>
                  <td className="conf-cell">{f.conf}</td>
                  <td className="rating-cell">{fmtNum(f.totalWins, 1)}</td>
                  <td className="rating-cell">{fmtNum(f.confProjWins, 1)}</td>
                  <td className="rating-cell">{fmtNum(f.confLine, 1)}</td>
                  <td className={`rating-cell ${f.dif !== null && f.dif > 0 ? "rating-good" : ""}`}>
                    {f.dif !== null ? (f.dif > 0 ? "+" : "") + fmtNum(f.dif, 2) : "—"}
                  </td>
                  <td className="rating-cell">
                    {f.bet ? (
                      <span className={`bet-pill ${f.bet === "Over" ? "bet-over" : "bet-under"}`}>
                        {f.bet}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="rating-cell">{f.confWinPct !== null ? (f.confWinPct * 100).toFixed(1) + "%" : "—"}</td>
                  <td className="rating-cell">{f.fairPrice !== null ? fmtOdds(f.fairPrice) : "—"}</td>
                  <td className="rating-cell">{f.odds !== null ? fmtOdds(f.odds) : "—"}</td>
                  <td className={`rating-cell ${f.value !== null && f.value > 0 ? "rating-good" : f.value !== null && f.value < 0 ? "rating-bad" : ""}`}>
                    {f.value !== null ? (f.value > 0 ? "+" : "") + (f.value * 100).toFixed(1) + "%" : "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="empty">No teams match that search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="footer-note">
        Conference win projections are model-derived. "Value" = edge between fair probability and implied probability of listed odds. Positive value suggests a favorable bet.
      </div>
    </div>
  );
}

function fmtOdds(odds: number): string {
  if (odds > 0) return `+${odds}`;
  return `${odds}`;
}
