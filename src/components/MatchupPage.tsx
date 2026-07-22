import { useMemo, useState } from "react";
import type { Team } from "../data/teams";
import {
  conferenceOptionsFor,
  teamsFilteredFor,
  TEAMS_BY_NAME,
  HFA,
  PageHero,
} from "./shared";

export function MatchupPage({ onHome }: { onHome: () => void }) {
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayDiv, setAwayDiv] = useState("All");
  const [awayConf, setAwayConf] = useState("All");
  const [homeDiv, setHomeDiv] = useState("All");
  const [homeConf, setHomeConf] = useState("All");
  const [homeAdv, setHomeAdv] = useState(true);

  const awayOptions = teamsFilteredFor(awayDiv, awayConf);
  const homeOptions = teamsFilteredFor(homeDiv, homeConf);

  const result = useMemo(() => {
    if (!awayTeam || !homeTeam) return null;
    const awayRating = awayTeam.rating + (homeAdv ? 0 : HFA);
    const homeRating = homeTeam.rating + (homeAdv ? -HFA : 0);
    const spread = awayRating - homeRating;
    const favored = spread < 0 ? awayTeam : homeTeam;
    const margin = Math.abs(spread);
    return { spread, favored, margin, awayRating, homeRating };
  }, [awayTeam, homeTeam, homeAdv]);

  return (
    <div>
      <PageHero
        eyebrow="Hypothetical Matchup"
        title="MATCHUP SIMULATOR"
        subtitle="Pick any two teams and see the projected spread, adjusted for home field advantage."
        onHome={onHome}
      />

      <div className="matchup-body">
        <div className="picker-grid">
          <div className="picker-card">
            <div className="picker-label">Away Team</div>
            <div className="picker-row">
              <select
                className="picker-select filter"
                value={awayDiv}
                onChange={(e) => {
                  setAwayDiv(e.target.value);
                  setAwayConf("All");
                }}
              >
                <option value="All">All divisions</option>
                <option value="FBS">FBS</option>
                <option value="FCS">FCS</option>
              </select>
              <select
                className="picker-select filter"
                value={awayConf}
                onChange={(e) => setAwayConf(e.target.value)}
              >
                <option value="All">All conferences</option>
                {conferenceOptionsFor(awayDiv).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <select
              className="picker-team-select filter"
              value={awayTeam?.team ?? ""}
              onChange={(e) => {
                const t = TEAMS_BY_NAME[e.target.value];
                setAwayTeam(t ?? null);
              }}
            >
              <option value="">Select away team…</option>
              {awayOptions.map((t) => (
                <option key={t.team} value={t.team}>
                  {t.team} (#{t.rank})
                </option>
              ))}
            </select>
          </div>

          <div className="vs-divider">VS</div>

          <div className="picker-card">
            <div className="picker-label">Home Team</div>
            <div className="picker-row">
              <select
                className="picker-select filter"
                value={homeDiv}
                onChange={(e) => {
                  setHomeDiv(e.target.value);
                  setHomeConf("All");
                }}
              >
                <option value="All">All divisions</option>
                <option value="FBS">FBS</option>
                <option value="FCS">FCS</option>
              </select>
              <select
                className="picker-select filter"
                value={homeConf}
                onChange={(e) => setHomeConf(e.target.value)}
              >
                <option value="All">All conferences</option>
                {conferenceOptionsFor(homeDiv).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <select
              className="picker-team-select filter"
              value={homeTeam?.team ?? ""}
              onChange={(e) => {
                const t = TEAMS_BY_NAME[e.target.value];
                setHomeTeam(t ?? null);
              }}
            >
              <option value="">Select home team…</option>
              {homeOptions.map((t) => (
                <option key={t.team} value={t.team}>
                  {t.team} (#{t.rank})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="home-select">
          <div className="home-select-label section-label">Home field advantage</div>
          <div className="home-toggle">
            <button
              className={`home-btn ${homeAdv ? "home-btn-active" : ""}`}
              onClick={() => setHomeAdv(true)}
            >
              Home team (+{HFA})
            </button>
            <button
              className={`home-btn ${!homeAdv ? "home-btn-active" : ""}`}
              onClick={() => setHomeAdv(false)}
              disabled={!awayTeam || !homeTeam}
            >
              Neutral site
            </button>
          </div>
        </div>

        {!result && (
          <div className="matchup-note">
            Select both teams to see the projected spread.
          </div>
        )}

        {result && (
          <div className="spread-result">
            <div className="spread-cards">
              <div className={`spread-card ${result.favored === awayTeam ? "spread-favored" : ""}`}>
                <div className="spread-team">{awayTeam!.team}</div>
                <div className="spread-context">
                  <span className="spread-context-rating">
                    Rating {awayTeam!.rating > 0 ? "+" : ""}{awayTeam!.rating.toFixed(2)}
                  </span>
                </div>
                <div className="spread-value">
                  {result.favored === awayTeam ? `-${result.margin.toFixed(1)}` : `+${result.margin.toFixed(1)}`}
                </div>
                <div className="spread-tag">
                  {result.favored === awayTeam ? "Favored" : "Underdog"}
                </div>
              </div>
              <div className={`spread-card ${result.favored === homeTeam ? "spread-favored" : ""}`}>
                <div className="spread-team">{homeTeam!.team}</div>
                <div className="spread-context">
                  <span className="spread-context-rating">
                    Rating {homeTeam!.rating > 0 ? "+" : ""}{homeTeam!.rating.toFixed(2)}
                  </span>
                </div>
                <div className="spread-value">
                  {result.favored === homeTeam ? `-${result.margin.toFixed(1)}` : `+${result.margin.toFixed(1)}`}
                </div>
                <div className="spread-tag">
                  {result.favored === homeTeam ? "Favored" : "Underdog"}
                </div>
              </div>
            </div>
            <div className="spread-sentence">
              {result.favored.team} favored by {result.margin.toFixed(1)} points
              {!homeAdv && " at a neutral site"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
