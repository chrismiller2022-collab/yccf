import { useMemo } from "react";
import type { Team } from "../data/teams";
import {
  BRACKET_SEED_NAMES,
  NATTY_BY_TEAM,
  RESUME_BY_TEAM,
} from "../data/futures";
import { PageHero, RankFlag, TEAMS_BY_NAME } from "./shared";

type SeedData = {
  name: string;
  seed: number;
  team: Team;
  resumeRating: number;
  nattyPct: number;
};

export function BracketPage({
  subLabel,
  onHome,
  onNavigateTeam,
}: {
  subLabel: string;
  onHome: () => void;
  onNavigateTeam: (t: Team) => void;
}) {
  const seeds = useMemo<SeedData[]>(() => {
    return BRACKET_SEED_NAMES.map((name, i) => {
      const team = TEAMS_BY_NAME[name];
      const resume = RESUME_BY_TEAM[name];
      const natty = NATTY_BY_TEAM[name];
      return {
        name,
        seed: i + 1,
        team,
        resumeRating: resume?.rating ?? 0,
        nattyPct: natty ?? 0,
      };
    });
  }, []);

  const quarters = useMemo(() => {
    return [
      { label: "Quarterfinal 1", higher: seeds[4], lower: seeds[7] },
      { label: "Quarterfinal 2", higher: seeds[5], lower: seeds[6] },
      { label: "Quarterfinal 3", higher: seeds[2], lower: seeds[9] },
      { label: "Quarterfinal 4", higher: seeds[3], lower: seeds[8] },
    ];
  }, [seeds]);

  const semis = useMemo(() => {
    return [
      { label: "Semifinal 1", team1: seeds[0], team2: seeds[3] },
      { label: "Semifinal 2", team1: seeds[1], team2: seeds[2] },
    ];
  }, [seeds]);

  const final = useMemo(() => {
    return { team1: seeds[0], team2: seeds[1] };
  }, [seeds]);

  const totalNattyPct = seeds.reduce((sum, s) => sum + s.nattyPct, 0);

  return (
    <div>
      <PageHero
        eyebrow="FBS Playoff Bracket"
        title={subLabel.toUpperCase()}
        subtitle="The 12-team FBS playoff bracket, projected from resume ratings and power ratings. Seeds 1–4 receive first-round byes."
        onHome={onHome}
      />

      <div className="bracket-wrap">
        <div className="bracket-section">
          <div className="section-label bracket-section-label">First Round · Quarterfinals</div>
          <div className="bracket-grid">
            {quarters.map((q) => (
              <BracketMatchup
                key={q.label}
                label={q.label}
                team1={q.higher}
                team2={q.lower}
                onNavigateTeam={onNavigateTeam}
              />
            ))}
          </div>
        </div>

        <div className="bracket-section">
          <div className="section-label bracket-section-label">Semifinals</div>
          <div className="bracket-grid bracket-grid-2">
            {semis.map((s) => (
              <BracketMatchup
                key={s.label}
                label={s.label}
                team1={s.team1}
                team2={s.team2}
                onNavigateTeam={onNavigateTeam}
              />
            ))}
          </div>
        </div>

        <div className="bracket-section">
          <div className="section-label bracket-section-label">National Championship</div>
          <div className="bracket-grid bracket-grid-1">
            <BracketMatchup
              label="National Championship"
              team1={final.team1}
              team2={final.team2}
              onNavigateTeam={onNavigateTeam}
              isFinal
            />
          </div>
        </div>
      </div>

      <div className="bracket-seeds">
        <div className="section-label bracket-section-label">Championship Odds</div>
        <div className="natty-grid">
          {seeds.map((s) => (
            <div key={s.name} className="natty-card" onClick={() => onNavigateTeam(s.team)}>
              <div className="natty-card-header">
                <RankFlag rank={s.seed} />
                <span className="natty-team">{s.name}</span>
              </div>
              <div className="natty-bar-wrap">
                <div
                  className="natty-bar-fill"
                  style={{ width: `${(s.nattyPct / totalNattyPct) * 100}%` }}
                />
              </div>
              <div className="natty-pct">{(s.nattyPct * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-note">
        Bracket projections are model-derived from resume ratings and power ratings. Seeds 1–4 receive first-round byes. Championship odds reflect each team's probability of winning the title.
      </div>
    </div>
  );
}

function BracketMatchup({
  label,
  team1,
  team2,
  onNavigateTeam,
  isFinal,
}: {
  label: string;
  team1: SeedData;
  team2: SeedData;
  onNavigateTeam: (t: Team) => void;
  isFinal?: boolean;
}) {
  const spread = team1.team.rating - team2.team.rating;

  return (
    <div className={`bracket-card ${isFinal ? "bracket-card-final" : ""}`}>
      <div className="bracket-card-label">{label}</div>
      <div className="bracket-team-row">
        <button className="bracket-team-btn" onClick={() => onNavigateTeam(team1.team)}>
          <span className="bracket-seed-num">{team1.seed}</span>
          <span className="bracket-team-name">{team1.name}</span>
          <span className="bracket-team-rating">
            {team1.team.rating > 0 ? "+" : ""}{team1.team.rating.toFixed(2)}
          </span>
        </button>
      </div>
      <div className="bracket-vs">vs</div>
      <div className="bracket-team-row">
        <button className="bracket-team-btn" onClick={() => onNavigateTeam(team2.team)}>
          <span className="bracket-seed-num">{team2.seed}</span>
          <span className="bracket-team-name">{team2.name}</span>
          <span className="bracket-team-rating">
            {team2.team.rating > 0 ? "+" : ""}{team2.team.rating.toFixed(2)}
          </span>
        </button>
      </div>
      <div className="bracket-spread">
        {spread < 0
          ? `${team1.name} favored by ${Math.abs(spread).toFixed(1)}`
          : spread > 0
          ? `${team2.name} favored by ${Math.abs(spread).toFixed(1)}`
          : "Pick'em"}
      </div>
    </div>
  );
}
