import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, ChevronDown, Clock } from "lucide-react";
import { TEAMS, type Team } from "./data/teams";
import { GAMES, type Game } from "./data/games";

const MIN_RATING = Math.min(...TEAMS.map((t) => t.rating));
const MAX_RATING = Math.max(...TEAMS.map((t) => t.rating));
const MAX_ABS = Math.max(Math.abs(MIN_RATING), Math.abs(MAX_RATING));

const CONFERENCES = Array.from(new Set(TEAMS.map((t) => t.conf))).sort();

const TEAMS_BY_NAME: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.team, t])
);

function conferencesForDivision(div: string): string[] {
  return Array.from(
    new Set(TEAMS.filter((t) => t.div === div).map((t) => t.conf))
  ).sort();
}

function teamsForConference(div: string, conf: string): Team[] {
  return TEAMS.filter((t) => t.div === div && t.conf === conf).sort(
    (a, b) => a.rank - b.rank
  );
}

const HFA = 2.4;

function conferenceOptionsFor(division: string): string[] {
  return division === "All" ? CONFERENCES : conferencesForDivision(division);
}

function teamsFilteredFor(division: string, conference: string): Team[] {
  return TEAMS.filter(
    (t) =>
      (division === "All" || t.div === division) &&
      (conference === "All" || t.conf === conference)
  ).sort((a, b) => a.team.localeCompare(b.team));
}

const WEEKS = Array.from({ length: 16 }, (_, i) => ({
  key: `week${i + 1}`,
  label: `Week ${i + 1}`,
}));

type NavSub = { key: string; label: string };
type NavCat = {
  key: string;
  label: string;
  drill?: boolean;
  single?: boolean;
  subs?: NavSub[];
};

const NAV: NavCat[] = [
  { key: "teampages", label: "Team Pages", drill: true },
  { key: "matchup", label: "Hypothetical Matchup", single: true },
  {
    key: "ratings",
    label: "Weekly Power Rating",
    subs: [{ key: "preseason", label: "Preseason" }, ...WEEKS],
  },
  {
    key: "wintotals",
    label: "Win Totals",
    subs: [...WEEKS, { key: "live", label: "Live" }],
  },
  {
    key: "matchups",
    label: "Weekly Matchups",
    subs: [...WEEKS, { key: "all", label: "All" }],
  },
  {
    key: "resume",
    label: "Resume Ratings",
    subs: [...WEEKS, { key: "live", label: "Live" }],
  },
  {
    key: "sos",
    label: "Strength of Schedule",
    subs: [...WEEKS, { key: "live", label: "Live" }],
  },
  {
    key: "bracket",
    label: "FBS Playoff Bracket",
    subs: [...WEEKS, { key: "live", label: "Live" }],
  },
];

function RatingBar({ rating }: { rating: number }) {
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

type SortKey = "rank" | "team" | "conf" | "rating";

function SortHeader({
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

function HomePage({ onNavigateTeam }: { onNavigateTeam: (t: Team) => void }) {
  const [heroQuery, setHeroQuery] = useState("");
  const [heroFocused, setHeroFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("All");
  const [conference, setConference] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let rows = TEAMS.filter((t) => {
      if (division !== "All" && t.div !== division) return false;
      if (conference !== "All" && t.conf !== conference) return false;
      if (query && !t.team.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
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
    });

    return rows;
  }, [query, division, conference, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const fbsCount = TEAMS.filter((t) => t.div === "FBS").length;
  const top = TEAMS[0];
  const heroMatches =
    heroQuery.trim().length > 0
      ? TEAMS.filter((t) =>
          t.team.toLowerCase().includes(heroQuery.trim().toLowerCase())
        ).slice(0, 6)
      : [];
  const showCutlines =
    sortKey === "rank" &&
    sortDir === "asc" &&
    !query &&
    division === "All" &&
    conference === "All";

  return (
    <>
      <div className="hero">
        <div className="eyebrow">Week 1 · Power Ratings</div>
        <h1 className="title">
          YC <span>POWER</span> RATINGS
        </h1>
        <p className="subtitle">
          An unbiased power rating for all {TEAMS.length} FBS &amp; FCS programs, ranked purely on scoring margin and schedule strength.
        </p>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-num">{TEAMS.length}</div>
            <div className="stat-label">Teams ranked</div>
          </div>
          <div className="stat">
            <div className="stat-num">{fbsCount}</div>
            <div className="stat-label">FBS programs</div>
          </div>
          <div className="stat">
            <div className="stat-num">{top.team}</div>
            <div className="stat-label">No. 1 this week</div>
          </div>
        </div>

        <div className="hero-search-wrap">
          <input
            className="hero-search"
            placeholder="Jump to a team page…"
            value={heroQuery}
            onChange={(e) => setHeroQuery(e.target.value)}
            onFocus={() => setHeroFocused(true)}
            onBlur={() => setTimeout(() => setHeroFocused(false), 120)}
          />
          {heroFocused && heroMatches.length > 0 && (
            <div className="hero-suggest">
              {heroMatches.map((t) => (
                <button
                  key={t.team}
                  className="hero-suggest-item"
                  onClick={() => {
                    onNavigateTeam(t);
                    setHeroQuery("");
                  }}
                >
                  <span
                    className={`rank-flag ${
                      t.rank <= 4 ? "top4" : t.rank <= 12 ? "top12" : ""
                    }`}
                  >
                    {t.rank}
                  </span>
                  <span className="hero-suggest-name">{t.team}</span>
                  <span className="hero-suggest-conf">{t.conf}</span>
                </button>
              ))}
            </div>
          )}
          {heroFocused && heroQuery.trim().length > 0 && heroMatches.length === 0 && (
            <div className="hero-suggest">
              <div className="hero-suggest-empty">No teams match "{heroQuery}"</div>
            </div>
          )}
        </div>
      </div>

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
          onChange={(e) => setDivision(e.target.value)}
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
            <option key={c} value={c}>
              {c}
            </option>
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
              <Fragment key={t.team}>
                <tr>
                  <td>
                    <span
                      className={`rank-flag ${t.rank <= 4 ? "top4" : t.rank <= 12 ? "top12" : ""}`}
                    >
                      {t.rank}
                    </span>
                  </td>
                  <td>
                    <span className="team-name">{t.team}</span>
                    <span className={`div-pill ${t.div === "FBS" ? "div-fbs" : "div-fcs"}`}>
                      {t.div}
                    </span>
                  </td>
                  <td className="conf-cell">{t.conf}</td>
                  <td className="bar-cell">
                    <RatingBar rating={t.rating} />
                  </td>
                  <td className={`rating-cell ${t.rating < 0 ? "rating-good" : "rating-bad"}`}>
                    {t.rating > 0 ? "+" : ""}
                    {t.rating.toFixed(2)}
                  </td>
                </tr>
                {showCutlines && t.rank === 4 && (
                  <tr>
                    <td colSpan={5} className="cutline">
                      ‒‒‒ Top 4 · Automatic Byes ‒‒‒
                    </td>
                  </tr>
                )}
                {showCutlines && t.rank === 12 && (
                  <tr>
                    <td colSpan={5} className="cutline">
                      ‒‒‒ Cutline · 12-Team Playoff Field ‒‒‒
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  No teams match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="footer-note">
        Ratings reflect scoring margin adjusted for strength of schedule. Lower rating = stronger team. Prototype built from your spreadsheet export — swap in live weekly data once your model updates.
      </div>
    </>
  );
}

function TeamPage({
  team,
  onNavigateTeam,
  onHome,
}: {
  team: Team;
  onNavigateTeam: (t: Team) => void;
  onHome: () => void;
}) {
  const peers = teamsForConference(team.div, team.conf);

  return (
    <div className="team-page">
      <div className="team-hero">
        <button className="back-link" onClick={onHome}>
          ‹ All rankings
        </button>
        <div className="eyebrow">
          {team.div} · {team.conf}
        </div>
        <h1 className="title team-title">{team.team}</h1>
        <div className="team-hero-row">
          <span
            className={`rank-flag rank-flag-lg ${
              team.rank <= 4 ? "top4" : team.rank <= 12 ? "top12" : ""
            }`}
          >
            {team.rank}
          </span>
          <div className="team-hero-rating">
            <div
              className={`team-rating-num ${
                team.rating < 0 ? "rating-good" : "rating-bad"
              }`}
            >
              {team.rating > 0 ? "+" : ""}
              {team.rating.toFixed(2)}
            </div>
            <div className="stat-label">Power rating</div>
          </div>
        </div>
        <div className="team-hero-bar">
          <RatingBar rating={team.rating} />
        </div>
        <p className="subtitle team-subtitle">
          {team.team} ranks No. {team.rank} out of {TEAMS.length} teams nationally
          and No. {peers.findIndex((p) => p.team === team.team) + 1} of{" "}
          {peers.length} in the {team.conf}.
        </p>
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
              <tr
                key={p.team}
                className={p.team === team.team ? "row-active" : ""}
              >
                <td>
                  <span
                    className={`rank-flag ${
                      p.rank <= 4 ? "top4" : p.rank <= 12 ? "top12" : ""
                    }`}
                  >
                    {p.rank}
                  </span>
                </td>
                <td>
                  {p.team === team.team ? (
                    <span className="team-name">{p.team}</span>
                  ) : (
                    <button
                      className="team-link"
                      onClick={() => onNavigateTeam(p)}
                    >
                      {p.team}
                    </button>
                  )}
                </td>
                <td
                  className={`rating-cell ${
                    p.rating < 0 ? "rating-good" : "rating-bad"
                  }`}
                >
                  {p.rating > 0 ? "+" : ""}
                  {p.rating.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="footer-note">
        Detailed schedule, results, and player pages for {team.team} are coming
        soon — this profile will expand as more data is connected.
      </div>
    </div>
  );
}

function TeamPicker({
  label,
  division,
  conference,
  teamName,
  onDivision,
  onConference,
  onTeam,
}: {
  label: string;
  division: string;
  conference: string;
  teamName: string;
  onDivision: (v: string) => void;
  onConference: (v: string) => void;
  onTeam: (v: string) => void;
}) {
  const confOptions = conferenceOptionsFor(division);
  const teamOptions = teamsFilteredFor(division, conference);

  return (
    <div className="picker-card">
      <div className="picker-label">{label}</div>
      <div className="picker-row">
        <select
          className="filter picker-select"
          value={division}
          onChange={(e) => onDivision(e.target.value)}
        >
          <option value="All">All divisions</option>
          <option value="FBS">FBS</option>
          <option value="FCS">FCS</option>
        </select>
        <select
          className="filter picker-select"
          value={conference}
          onChange={(e) => onConference(e.target.value)}
        >
          <option value="All">All conferences</option>
          {confOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <select
        className="filter picker-team-select"
        value={teamName}
        onChange={(e) => onTeam(e.target.value)}
      >
        <option value="">Select a team…</option>
        {teamOptions.map((t) => (
          <option key={t.team} value={t.team}>
            {t.team} ({t.conf})
          </option>
        ))}
      </select>
    </div>
  );
}

function MatchupPage({ onHome }: { onHome: () => void }) {
  const [divA, setDivA] = useState("All");
  const [confA, setConfA] = useState("All");
  const [teamAName, setTeamAName] = useState("");

  const [divB, setDivB] = useState("All");
  const [confB, setConfB] = useState("All");
  const [teamBName, setTeamBName] = useState("");

  const [home, setHome] = useState("neutral");

  const teamA = TEAMS.find((t) => t.team === teamAName) || null;
  const teamB = TEAMS.find((t) => t.team === teamBName) || null;
  const bothSelected = teamA && teamB;
  const sameTeam = bothSelected && teamA.team === teamB.team;

  let spreadA: number | null = null;
  if (bothSelected && !sameTeam && teamA && teamB) {
    spreadA = teamA.rating - teamB.rating;
    if (home === "A") spreadA -= HFA;
    if (home === "B") spreadA += HFA;
  }
  const spreadB = spreadA === null ? null : -spreadA;

  const favored =
    spreadA === null ? null : spreadA < 0 ? teamA : spreadA > 0 ? teamB : null;
  const margin = spreadA === null ? null : Math.abs(spreadA);

  const siteLabel =
    home === "A" && teamA
      ? `at ${teamA.team}`
      : home === "B" && teamB
      ? `at ${teamB.team}`
      : "neutral site";

  return (
    <div className="matchup-page">
      <div className="team-hero">
        <button className="back-link" onClick={onHome}>
          ‹ All rankings
        </button>
        <div className="eyebrow">Simulator</div>
        <h1 className="title matchup-title">HYPOTHETICAL MATCHUP</h1>
        <p className="subtitle team-subtitle">
          Pick any two teams to calculate a projected spread from their power
          ratings, with a flat {HFA}-point home field advantage. Team-specific
          HFA is coming later.
        </p>
      </div>

      <div className="matchup-body">
        <div className="picker-grid">
          <TeamPicker
            label="Team A"
            division={divA}
            conference={confA}
            teamName={teamAName}
            onDivision={(v) => {
              setDivA(v);
              setConfA("All");
              setTeamAName("");
            }}
            onConference={(v) => {
              setConfA(v);
              setTeamAName("");
            }}
            onTeam={setTeamAName}
          />

          <div className="vs-divider">VS</div>

          <TeamPicker
            label="Team B"
            division={divB}
            conference={confB}
            teamName={teamBName}
            onDivision={(v) => {
              setDivB(v);
              setConfB("All");
              setTeamBName("");
            }}
            onConference={(v) => {
              setConfB(v);
              setTeamBName("");
            }}
            onTeam={setTeamBName}
          />
        </div>

        <div className="home-select">
          <div className="section-label home-select-label">Field</div>
          <div className="home-toggle">
            <button
              className={`home-btn ${home === "neutral" ? "home-btn-active" : ""}`}
              onClick={() => setHome("neutral")}
            >
              Neutral site
            </button>
            <button
              className={`home-btn ${home === "A" ? "home-btn-active" : ""}`}
              disabled={!teamA}
              onClick={() => setHome("A")}
            >
              {teamA ? `${teamA.team} home` : "Team A home"}
            </button>
            <button
              className={`home-btn ${home === "B" ? "home-btn-active" : ""}`}
              disabled={!teamB}
              onClick={() => setHome("B")}
            >
              {teamB ? `${teamB.team} home` : "Team B home"}
            </button>
          </div>
        </div>

        {sameTeam && (
          <div className="matchup-note">Pick two different teams to see a spread.</div>
        )}

        {bothSelected && !sameTeam && teamA && teamB && (
          <div className="spread-result">
            <div className="spread-cards">
              <div
                className={`spread-card ${
                  favored && favored.team === teamA.team ? "spread-favored" : ""
                }`}
              >
                <div className="spread-team">{teamA.team}</div>
                <div className="spread-context">
                  <span
                    className={`rank-flag ${
                      teamA.rank <= 4 ? "top4" : teamA.rank <= 12 ? "top12" : ""
                    }`}
                  >
                    {teamA.rank}
                  </span>
                  <span className="spread-context-rating">
                    {teamA.rating > 0 ? "+" : ""}
                    {teamA.rating.toFixed(2)} rating
                  </span>
                </div>
                <div
                  className={`spread-value ${
                    spreadA! < 0 ? "rating-good" : spreadA! > 0 ? "rating-bad" : ""
                  }`}
                >
                  {spreadA! > 0 ? "+" : ""}
                  {spreadA!.toFixed(1)}
                </div>
                <div className="spread-tag">
                  {spreadA! < 0 ? "Favored" : spreadA! > 0 ? "Underdog" : "Pick'em"}
                </div>
              </div>

              <div
                className={`spread-card ${
                  favored && favored.team === teamB.team ? "spread-favored" : ""
                }`}
              >
                <div className="spread-team">{teamB.team}</div>
                <div className="spread-context">
                  <span
                    className={`rank-flag ${
                      teamB.rank <= 4 ? "top4" : teamB.rank <= 12 ? "top12" : ""
                    }`}
                  >
                    {teamB.rank}
                  </span>
                  <span className="spread-context-rating">
                    {teamB.rating > 0 ? "+" : ""}
                    {teamB.rating.toFixed(2)} rating
                  </span>
                </div>
                <div
                  className={`spread-value ${
                    spreadB! < 0 ? "rating-good" : spreadB! > 0 ? "rating-bad" : ""
                  }`}
                >
                  {spreadB! > 0 ? "+" : ""}
                  {spreadB!.toFixed(1)}
                </div>
                <div className="spread-tag">
                  {spreadB! < 0 ? "Favored" : spreadB! > 0 ? "Underdog" : "Pick'em"}
                </div>
              </div>
            </div>

            <p className="spread-sentence">
              {favored
                ? `${favored.team} is favored by ${margin!.toFixed(1)} points (${siteLabel}).`
                : `Dead even matchup — a true pick'em (${siteLabel}).`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GameRow({
  game,
  onNavigateTeam,
}: {
  game: Game;
  onNavigateTeam: (t: Team) => void;
}) {
  const away = TEAMS_BY_NAME[game.away];
  const home = TEAMS_BY_NAME[game.home];
  if (!away || !home) return null;

  const awaySpread = away.rating - home.rating + HFA;
  const winner = awaySpread < 0 ? away : awaySpread > 0 ? home : null;

  const dateObj = new Date(game.date);
  const dateLabel = dateObj.toLocaleDateString(undefined, {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });

  return (
    <tr>
      <td className="game-date-cell">{dateLabel}</td>
      <td className="matchup-team-cell">
        <button
          className="team-link matchup-team-btn"
          onClick={() => onNavigateTeam(away)}
        >
          {away.team}
        </button>
        <span
          className={`matchup-rating ${
            away.rating < 0 ? "rating-good" : "rating-bad"
          }`}
        >
          {away.rating > 0 ? "+" : ""}
          {away.rating.toFixed(2)}
        </span>
      </td>
      <td className="matchup-team-cell">
        <button
          className="team-link matchup-team-btn"
          onClick={() => onNavigateTeam(home)}
        >
          {home.team}
        </button>
        <span
          className={`matchup-rating ${
            home.rating < 0 ? "rating-good" : "rating-bad"
          }`}
        >
          {home.rating > 0 ? "+" : ""}
          {home.rating.toFixed(2)}
        </span>
      </td>
      <td className="matchups-empty-cell">–</td>
      <td className="matchups-projected-cell">
        {awaySpread > 0 ? "+" : ""}
        {awaySpread.toFixed(1)}
      </td>
      <td className="matchups-empty-cell">–</td>
      <td className="matchups-empty-cell">–</td>
      <td className="matchups-empty-cell">–</td>
      <td className="matchups-winner-cell">
        {winner ? winner.team : "Pick'em"}
      </td>
      <td className="matchups-empty-cell">–</td>
    </tr>
  );
}

function MatchupsTable({
  games,
  onNavigateTeam,
}: {
  games: Game[];
  onNavigateTeam: (t: Team) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="matchups-table">
        <thead>
          <tr>
            <th className="th">Date</th>
            <th className="th">Away</th>
            <th className="th">Home</th>
            <th className="th th-right">Vegas Line</th>
            <th className="th th-right">Projected</th>
            <th className="th th-right">Off</th>
            <th className="th th-right">Away Score</th>
            <th className="th th-right">Home Score</th>
            <th className="th">Projected Winner</th>
            <th className="th">Team to Cover</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <GameRow key={g.id} game={g} onNavigateTeam={onNavigateTeam} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchupsPage({
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
  const isAll = subKey === "all";
  const weekNum = isAll ? null : parseInt(subKey.replace("week", ""), 10);

  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("All");

  const matchesFilters = (g: Game) => {
    const home = TEAMS_BY_NAME[g.home];
    const away = TEAMS_BY_NAME[g.away];
    if (division !== "All") {
      const homeMatches = home && home.div === division;
      const awayMatches = away && away.div === division;
      if (!homeMatches && !awayMatches) return false;
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (
        !g.home.toLowerCase().includes(q) &&
        !g.away.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  };

  const filteredGames = useMemo(() => {
    let list = isAll ? GAMES : GAMES.filter((g) => g.week === weekNum);
    return list.filter(matchesFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAll, weekNum, division, query]);

  const groupedByWeek = useMemo(() => {
    if (!isAll) return [];
    const map: Record<number, Game[]> = {};
    filteredGames.forEach((g) => {
      (map[g.week] = map[g.week] || []).push(g);
    });
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map((w) => ({ week: w, games: map[w] }));
  }, [isAll, filteredGames]);

  return (
    <div className="matchups-page">
      <div className="team-hero">
        <button className="back-link" onClick={onHome}>
          ‹ All rankings
        </button>
        <div className="eyebrow">Weekly Matchups</div>
        <h1 className="title matchup-title">{subLabel.toUpperCase()}</h1>
        <p className="subtitle team-subtitle">
          Projected spreads for every game, calculated from current power
          ratings with a flat {HFA}-point home field advantage.
        </p>
      </div>

      <div className="controls matchups-controls">
        <input
          className="search"
          placeholder="Search for a team…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="filter"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
        >
          <option value="All">All divisions</option>
          <option value="FBS">FBS</option>
          <option value="FCS">FCS</option>
        </select>
      </div>

      <div className="table-wrap">
        {!isAll && filteredGames.length === 0 && (
          <div className="empty matchups-empty">
            No games scheduled for {subLabel} yet.
          </div>
        )}

        {!isAll && filteredGames.length > 0 && (
          <MatchupsTable games={filteredGames} onNavigateTeam={onNavigateTeam} />
        )}

        {isAll && groupedByWeek.length === 0 && (
          <div className="empty matchups-empty">
            No games match that search.
          </div>
        )}

        {isAll &&
          groupedByWeek.map(({ week, games }) => (
            <div key={week} className="week-group">
              <div className="section-label week-group-label">
                Week {week}
              </div>
              <MatchupsTable games={games} onNavigateTeam={onNavigateTeam} />
            </div>
          ))}
      </div>

      <div className="footer-note">
        Projections use each team's current power rating and do not yet
        account for injuries, weather, or other game-specific factors.
      </div>
    </div>
  );
}

function ComingSoon({
  categoryLabel,
  subLabel,
}: {
  categoryLabel: string;
  subLabel: string;
}) {
  return (
    <div className="cs-wrap">
      <div className="cs-card">
        <Clock size={26} strokeWidth={1.75} />
        <div className="cs-eyebrow">{categoryLabel}</div>
        <div className="cs-week">{subLabel}</div>
        <div className="cs-msg">Data coming soon</div>
        <p className="cs-note">
          This page is wired up and ready to go — numbers will appear here once this week's data is in.
        </p>
      </div>
    </div>
  );
}

type Page =
  | { type: "home" }
  | { type: "sub"; catKey: string; catLabel: string; subKey: string; subLabel: string }
  | { type: "team"; team: Team }
  | { type: "matchup" };

function TopNav({
  onNavigate,
  onNavigateTeam,
  onNavigateMatchup,
  onHome,
}: {
  onNavigate: (catKey: string, catLabel: string, subKey: string, subLabel: string) => void;
  onNavigateTeam: (t: Team) => void;
  onNavigateMatchup: () => void;
  onHome: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [teamDivision, setTeamDivision] = useState<string | null>(null);
  const [teamConference, setTeamConference] = useState<string | null>(null);
  const topbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = topbarRef.current;
    if (!el) return;

    const setHeightVar = () => {
      document.documentElement.style.setProperty(
        "--topbar-h",
        `${el.offsetHeight}px`
      );
    };

    setHeightVar();
    const ro = new ResizeObserver(setHeightVar);
    ro.observe(el);
    window.addEventListener("resize", setHeightVar);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setHeightVar);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setHeightVar);
    };
  }, []);

  const resetDrill = () => {
    setTeamDivision(null);
    setTeamConference(null);
  };

  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    setOpenCategory(null);
    resetDrill();
  };

  const openCat = (key: string) => {
    if (openCategory !== key) resetDrill();
    setOpenCategory(openCategory === key ? null : key);
  };

  return (
    <>
      <div className="topbar" ref={topbarRef}>
        <button className="brand" onClick={onHome}>
          YC<span>•</span>POWER RATINGS
        </button>
        <button className="menu-btn" onClick={toggleMenu}>
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="menu-overlay" onClick={toggleMenu}>
          <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
            <button
              className="menu-home-item"
              onClick={() => {
                onHome();
                toggleMenu();
              }}
            >
              Home
            </button>
            <div className="menu-divider" />
            {NAV.map((cat) => (
              <div key={cat.key} className="menu-cat">
                <button
                  className="menu-cat-btn"
                  onClick={() => {
                    if (cat.single) {
                      onNavigateMatchup();
                      toggleMenu();
                    } else {
                      openCat(cat.key);
                    }
                  }}
                >
                  {cat.label}
                  {!cat.single && (
                    <ChevronDown
                      size={14}
                      className={`chev ${
                        openCategory === cat.key ? "chev-open" : ""
                      }`}
                    />
                  )}
                </button>

                {!cat.single && openCategory === cat.key && cat.drill && (
                  <div className="sub-panel">
                    {!teamDivision && (
                      <div className="sub-grid two-col">
                        {["FBS", "FCS"].map((d) => (
                          <button
                            key={d}
                            className="sub-chip"
                            onClick={() => setTeamDivision(d)}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}

                    {teamDivision && !teamConference && (
                      <>
                        <button
                          className="drill-back"
                          onClick={() => setTeamDivision(null)}
                        >
                          ‹ {teamDivision}
                        </button>
                        <div className="sub-grid">
                          {conferencesForDivision(teamDivision).map((c) => (
                            <button
                              key={c}
                              className="sub-chip"
                              onClick={() => setTeamConference(c)}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {teamDivision && teamConference && (
                      <>
                        <button
                          className="drill-back"
                          onClick={() => setTeamConference(null)}
                        >
                          ‹ {teamConference}
                        </button>
                        <div className="sub-grid">
                          {teamsForConference(teamDivision, teamConference).map(
                            (t) => (
                              <button
                                key={t.team}
                                className="sub-chip"
                                onClick={() => {
                                  onNavigateTeam(t);
                                  toggleMenu();
                                }}
                              >
                                {t.team}
                              </button>
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!cat.single && openCategory === cat.key && !cat.drill && (
                  <div className="sub-grid">
                    {cat.subs!.map((s) => (
                      <button
                        key={s.key}
                        className="sub-chip"
                        onClick={() => {
                          onNavigate(cat.key, cat.label, s.key, s.label);
                          toggleMenu();
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>({ type: "home" });

  const handleNavigate = (
    catKey: string,
    catLabel: string,
    subKey: string,
    subLabel: string
  ) => {
    setPage({ type: "sub", catKey, catLabel, subKey, subLabel });
  };

  const handleNavigateTeam = (team: Team) => {
    setPage({ type: "team", team });
    window.scrollTo?.(0, 0);
  };

  const handleNavigateMatchup = () => {
    setPage({ type: "matchup" });
    window.scrollTo?.(0, 0);
  };

  const handleHome = () => setPage({ type: "home" });

  return (
    <div className="page">
      <TopNav
        onNavigate={handleNavigate}
        onNavigateTeam={handleNavigateTeam}
        onNavigateMatchup={handleNavigateMatchup}
        onHome={handleHome}
      />

      {page.type === "home" && <HomePage onNavigateTeam={handleNavigateTeam} />}

      {page.type === "sub" && page.catKey === "matchups" && (
        <MatchupsPage
          subKey={page.subKey}
          subLabel={page.subLabel}
          onNavigateTeam={handleNavigateTeam}
          onHome={handleHome}
        />
      )}

      {page.type === "sub" && page.catKey !== "matchups" && (
        <ComingSoon categoryLabel={page.catLabel} subLabel={page.subLabel} />
      )}

      {page.type === "team" && (
        <TeamPage
          team={page.team}
          onNavigateTeam={handleNavigateTeam}
          onHome={handleHome}
        />
      )}

      {page.type === "matchup" && <MatchupPage onHome={handleHome} />}
    </div>
  );
}
