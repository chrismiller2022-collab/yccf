import { useMemo, useState } from "react";
import { TEAMS } from "../data/teams";
import type { Team } from "../data/teams";
import {
  CONFERENCES,
  RatingBar,
  SortHeader,
  useSort,
  RankFlag,
} from "./shared";

export function HomePage({
  onNavigateTeam,
}: {
  onNavigateTeam: (t: Team) => void;
}) {
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("All");
  const [conference, setConference] = useState("All");
  const { sortKey, sortDir, handleSort, sortFn } = useSort<Team>("rank");

  const filtered = useMemo(() => {
    const rows = TEAMS.filter((t) => {
      if (division !== "All" && t.div !== division) return false;
      if (conference !== "All" && t.conf !== conference) return false;
      if (query && !t.team.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
    return [...rows].sort(sortFn);
  }, [query, division, conference, sortFn]);

  const showCutlines =
    sortKey === "rank" &&
    sortDir === "asc" &&
    !query &&
    division === "All" &&
    conference === "All";

  return (
    <div>
      <div className="hero">
        <div className="eyebrow">2026 Season · Preseason Ratings</div>
        <h1 className="title">YC<span>•</span>POWER RATINGS</h1>
        <p className="subtitle">
          An unbiased, data-driven power rating for all 265 FBS & FCS college football teams.
        </p>

        <div className="hero-search-wrap">
          <input
            className="hero-search"
            placeholder="Search for a team…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && filtered.length > 0 && (
            <div className="hero-suggest">
              {filtered.slice(0, 6).map((t) => (
                <button
                  key={t.team}
                  className="hero-suggest-item"
                  onClick={() => {
                    onNavigateTeam(t);
                    setQuery("");
                  }}
                >
                  <RankFlag rank={t.rank} />
                  <span className="hero-suggest-name">{t.team}</span>
                  <span className="hero-suggest-conf">{t.conf}</span>
                </button>
              ))}
            </div>
          )}
          {query && filtered.length === 0 && (
            <div className="hero-suggest">
              <div className="hero-suggest-empty">No teams found.</div>
            </div>
          )}
        </div>
      </div>

      <div className="controls">
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
              <th className="th">Spread</th>
              <SortHeader label="Rating" sortKey="rating" active={sortKey === "rating"} dir={sortDir} onClick={handleSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <>
                {showCutlines && t.rank === 5 && (
                  <tr key="cut-top4">
                    <td colSpan={5} className="cutline">‒‒‒ Top 4 · Automatic Byes ‒‒‒</td>
                  </tr>
                )}
                {showCutlines && t.rank === 13 && (
                  <tr key="cut-top12">
                    <td colSpan={5} className="cutline">‒‒‒ Cutline · 12-Team Playoff Field ‒‒‒</td>
                  </tr>
                )}
                <tr key={t.team}>
                  <td><RankFlag rank={t.rank} /></td>
                  <td>
                    <button className="team-link" onClick={() => onNavigateTeam(t)}>
                      <span className="team-name">{t.team}</span>
                    </button>
                    <span className={`div-pill ${t.div === "FBS" ? "div-fbs" : "div-fcs"}`}>
                      {t.div}
                    </span>
                  </td>
                  <td className="conf-cell">{t.conf}</td>
                  <td className="bar-cell"><RatingBar rating={t.rating} /></td>
                  <td className={`rating-cell ${t.rating < 0 ? "rating-good" : "rating-bad"}`}>
                    {t.rating > 0 ? "+" : ""}{t.rating.toFixed(2)}
                  </td>
                </tr>
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">No teams match that search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="footer-note">
        Ratings reflect scoring margin adjusted for strength of schedule. Lower rating = stronger team. Top 4 seeds receive playoff byes.
      </div>
    </div>
  );
}
