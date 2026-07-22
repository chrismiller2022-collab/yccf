import { useMemo } from "react";
import { TEAMS } from "../data/teams";
import type { Team } from "../data/teams";
import { GAMES } from "../data/games";
import {
  CONF_FUTURES_BY_TEAM,
  SOS_BY_TEAM,
  RESUME_BY_TEAM,
  NATTY_BY_TEAM,
  BRACKET_SEED_NAMES,
} from "../data/futures";
import {
  RatingBar,
  RankFlag,
  teamsForConference,
  HFA,
  TEAMS_BY_NAME,
  fmtNum,
} from "./shared";

export function TeamPage({
  team,
  onNavigateTeam,
  onHome,
}: {
  team: Team;
  onNavigateTeam: (t: Team) => void;
  onHome: () => void;
}) {
  const peers = teamsForConference(team.div, team.conf);

  const teamGames = useMemo(() => {
    return GAMES.filter(
      (g) => g.away === team.team || g.home === team.team
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [team.team]);

  const future = CONF_FUTURES_BY_TEAM[team.team];
  const sos = SOS_BY_TEAM[team.team];
  const resume = RESUME_BY_TEAM[team.team];
  const natty = NATTY_BY_TEAM[team.team];
  const isBracketSeed = BRACKET_SEED_NAMES.includes(team.team);
  const seedNum = BRACKET_SEED_NAMES.indexOf(team.team) + 1;

  return (
    <div className="team-page">
      <div className="team-hero">
        <button className="back-link" onClick={onHome}>
          ‹ All rankings
        </button>
        <div className="eyebrow">{team.div} · {team.conf}</div>
        <h1 className="title team-title">{team.team}</h1>
        <div className="team-hero-row">
          <span className={`rank-flag rank-flag-lg ${team.rank <= 4 ? "top4" : team.rank <= 12 ? "top12" : ""}`}>
            {team.rank}
          </span>
          <div className="team-hero-rating">
            <div className={`team-rating-num ${team.rating < 0 ? "rating-good" : "rating-bad"}`}>
              {team.rating > 0 ? "+" : ""}{team.rating.toFixed(2)}
            </div>
            <div className="stat-label">Power rating</div>
          </div>
        </div>
        <div className="team-hero-bar">
          <RatingBar rating={team.rating} />
        </div>
        <p className="subtitle team-subtitle">
          {team.team} ranks No. {team.rank} out of {TEAMS.length} teams nationally
          and No. {peers.findIndex((p) => p.team === team.team) + 1} of {peers.length} in the {team.conf}.
        </p>
      </div>

      <div className="team-stats-row">
        {resume && (
          <div className="team-stat-card">
            <div className="stat-label">Resume Rating</div>
            <div className="team-stat-value rating-good">{resume.rating.toFixed(2)}</div>
            <div className="team-stat-sub">Rank #{resume.rank}</div>
          </div>
        )}
        {sos !== undefined && (
          <div className="team-stat-card">
            <div className="stat-label">Strength of Schedule</div>
            <div className={`team-stat-value ${sos < 0 ? "rating-good" : "rating-bad"}`}>
              {sos > 0 ? "+" : ""}{sos.toFixed(2)}
            </div>
            <div className="team-stat-sub">{sos < 0 ? "Tough schedule" : "Easier schedule"}</div>
          </div>
        )}
        {future && future.confWinPct !== null && (
          <div className="team-stat-card">
            <div className="stat-label">Conf Win Probability</div>
            <div className="team-stat-value rating-good">{(future.confWinPct * 100).toFixed(1)}%</div>
            <div className="team-stat-sub">{fmtNum(future.confProjWins, 1)} proj conf wins</div>
          </div>
        )}
        {natty !== undefined && (
          <div className="team-stat-card">
            <div className="stat-label">Championship Odds</div>
            <div className="team-stat-value rating-good">{(natty * 100).toFixed(1)}%</div>
            <div className="team-stat-sub">
              {isBracketSeed ? `Seed #${seedNum}` : "Not seeded"}
            </div>
          </div>
        )}
      </div>

      {future && (future.confLine !== null || future.value !== null) && (
        <div className="table-wrap">
          <div className="section-label">Conference Win Total</div>
          <div className="futures-summary">
            <div className="futures-summary-item">
              <span className="futures-label">Total Wins</span>
              <span className="futures-value">{fmtNum(future.totalWins, 1)}</span>
            </div>
            <div className="futures-summary-item">
              <span className="futures-label">Conf Wins</span>
              <span className="futures-value">{fmtNum(future.confProjWins, 1)}</span>
            </div>
            {future.confLine !== null && (
              <div className="futures-summary-item">
                <span className="futures-label">Conf Line</span>
                <span className="futures-value">{fmtNum(future.confLine, 1)}</span>
              </div>
            )}
            {future.dif !== null && (
              <div className="futures-summary-item">
                <span className="futures-label">Difference</span>
                <span className={`futures-value ${future.dif > 0 ? "rating-good" : ""}`}>
                  {future.dif > 0 ? "+" : ""}{fmtNum(future.dif, 2)}
                </span>
              </div>
            )}
            {future.bet && (
              <div className="futures-summary-item">
                <span className="futures-label">Recommendation</span>
                <span className={`bet-pill ${future.bet === "Over" ? "bet-over" : "bet-under"}`}>
                  {future.bet}
                </span>
              </div>
            )}
            {future.value !== null && (
              <div className="futures-summary-item">
                <span className="futures-label">Value</span>
                <span className={`futures-value ${future.value > 0 ? "rating-good" : "rating-bad"}`}>
                  {future.value > 0 ? "+" : ""}{(future.value * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="table-wrap">
        <div className="section-label">Schedule</div>
        <div className="table-scroll">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="th">Week</th>
                <th className="th">Date</th>
                <th className="th">Opponent</th>
                <th className="th">Location</th>
                <th className="th th-right">Projected Spread</th>
              </tr>
            </thead>
            <tbody>
              {teamGames.map((g) => {
                const isHome = g.home === team.team;
                const opp = TEAMS_BY_NAME[isHome ? g.away : g.home];
                if (!opp) return null;
                const spread = isHome
                  ? team.rating - opp.rating + HFA
                  : opp.rating - team.rating + HFA;
                const dateLabel = new Date(g.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "numeric",
                  day: "numeric",
                });
                return (
                  <tr key={g.id}>
                    <td className="game-date-cell">{g.week}</td>
                    <td className="game-date-cell">{dateLabel}</td>
                    <td>
                      <button className="team-link" onClick={() => onNavigateTeam(opp)}>
                        {opp.team}
                      </button>
                      <span className={`rank-flag-sm ${opp.rank <= 4 ? "top4" : opp.rank <= 12 ? "top12" : ""}`}>
                        {opp.rank}
                      </span>
                    </td>
                    <td className="game-date-cell">{isHome ? "Home" : "Away"}</td>
                    <td className={`matchups-projected-cell ${spread < 0 ? "rating-good" : "rating-bad"}`}>
                      {spread > 0 ? "+" : ""}{spread.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
              {teamGames.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">No games scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-wrap">
        <div className="section-label">{team.conf} standings</div>
        <table>
          <thead>
            <tr>
              <th className="th">Rank</th>
              <th className="th">Team</th>
              <th className="th th-right">Rating</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((p) => (
              <tr key={p.team} className={p.team === team.team ? "row-active" : ""}>
                <td><RankFlag rank={p.rank} /></td>
                <td>
                  {p.team === team.team ? (
                    <span className="team-name">{p.team}</span>
                  ) : (
                    <button className="team-link" onClick={() => onNavigateTeam(p)}>
                      {p.team}
                    </button>
                  )}
                </td>
                <td className={`rating-cell ${p.rating < 0 ? "rating-good" : "rating-bad"}`}>
                  {p.rating > 0 ? "+" : ""}{p.rating.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="footer-note">
        Projections use each team's current power rating with a flat {HFA}-point home field advantage.
      </div>
    </div>
  );
}
