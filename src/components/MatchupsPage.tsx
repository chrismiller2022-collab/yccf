import { useMemo, useState } from "react";
import type { Team } from "../data/teams";
import { GAMES } from "../data/games";
import { TEAMS_BY_NAME, HFA, PageHero } from "./shared";

export function MatchupsPage({
  subKey,
  subLabel,
  onNavigateTeam,
  onHome,
}: {
  subKey: string;
  subLabel: string;
  onNavigateTeam: (t: Team) => void;
  onHome: () => void;
}) {
  const [query, setQuery] = useState("");

  const weekNum = subKey.startsWith("week") ? parseInt(subKey.replace("week", "")) : null;

  const games = useMemo(() => {
    let list = GAMES;
    if (weekNum !== null) {
      list = list.filter((g) => g.week === weekNum);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (g) =>
          g.away.toLowerCase().includes(q) || g.home.toLowerCase().includes(q)
      );
    }
    return [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [weekNum, query]);

  const gamesByWeek = useMemo(() => {
    const map = new Map<number, typeof GAMES>();
    for (const g of games) {
      if (!map.has(g.week)) map.set(g.week, []);
      map.get(g.week)!.push(g);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [games]);

  return (
    <div className="matchups-page">
      <PageHero
        eyebrow="Weekly Matchups"
        title={subLabel.toUpperCase()}
        subtitle="Projected spreads for every game, based on team power ratings and home field advantage."
        onHome={onHome}
      />

      <div className="controls matchups-controls">
        <input
          className="search"
          placeholder="Search for a team…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {gamesByWeek.length === 0 && (
        <div className="table-wrap">
          <div className="empty matchups-empty">No games found for this week.</div>
        </div>
      )}

      {gamesByWeek.map(([week, weekGames]) => (
        <div key={week} className="table-wrap week-group">
          {weekNum === null && (
            <div className="section-label week-group-label">Week {week}</div>
          )}
          <div className="table-scroll">
            <table className="matchups-table">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Away</th>
                  <th className="th">Home</th>
                  <th className="th th-right">Projected Spread</th>
                  <th className="th th-right">Favorite</th>
                </tr>
              </thead>
              <tbody>
                {weekGames.map((g) => {
                  const away = TEAMS_BY_NAME[g.away];
                  const home = TEAMS_BY_NAME[g.home];
                  if (!away || !home) return null;
                  const spread = away.rating - home.rating - HFA;
                  const favored = spread < 0 ? away : home;
                  const margin = Math.abs(spread);
                  const dateLabel = new Date(g.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "numeric",
                    day: "numeric",
                  });
                  return (
                    <tr key={g.id}>
                      <td className="game-date-cell">{dateLabel}</td>
                      <td className="matchup-team-cell">
                        <button className="team-link matchup-team-btn" onClick={() => onNavigateTeam(away)}>
                          {g.away}
                        </button>
                        <span className="matchup-rating">
                          {away.rating > 0 ? "+" : ""}{away.rating.toFixed(2)}
                        </span>
                      </td>
                      <td className="matchup-team-cell">
                        <button className="team-link matchup-team-btn" onClick={() => onNavigateTeam(home)}>
                          {g.home}
                        </button>
                        <span className="matchup-rating">
                          {home.rating > 0 ? "+" : ""}{home.rating.toFixed(2)}
                        </span>
                      </td>
                      <td className={`matchups-projected-cell ${spread < 0 ? "rating-good" : "rating-bad"}`}>
                        {favored.team} -{margin.toFixed(1)}
                      </td>
                      <td className="matchups-winner-cell">{favored.team}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="footer-note">
        Spreads are model-derived from power ratings with a {HFA}-point home field advantage. Negative spread = away team favored.
      </div>
    </div>
  );
}
