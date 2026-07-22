import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, Clock } from "lucide-react";
import type { Team } from "./data/teams";
import {
  WEEKS,
  conferencesForDivision,
  teamsForConference,
} from "./components/shared";
import { HomePage } from "./components/HomePage";
import { TeamPage } from "./components/TeamPage";
import { MatchupPage } from "./components/MatchupPage";
import { MatchupsPage } from "./components/MatchupsPage";
import { PowerRatingPage } from "./components/PowerRatingPage";
import { WinTotalsPage } from "./components/WinTotalsPage";
import { ResumePage } from "./components/ResumePage";
import { SOSPage } from "./components/SOSPage";
import { BracketPage } from "./components/BracketPage";

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

type Page =
  | { type: "home" }
  | { type: "sub"; catKey: string; catLabel: string; subKey: string; subLabel: string }
  | { type: "team"; team: Team }
  | { type: "matchup" };

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
    window.scrollTo?.(0, 0);
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

  const renderSubPage = () => {
    if (page.type !== "sub") return null;
    const { catKey, catLabel, subKey, subLabel } = page;

    switch (catKey) {
      case "ratings":
        return (
          <PowerRatingPage
            subLabel={subLabel}
            onHome={handleHome}
            onNavigateTeam={handleNavigateTeam}
          />
        );
      case "wintotals":
        return (
          <WinTotalsPage
            subLabel={subLabel}
            onHome={handleHome}
            onNavigateTeam={handleNavigateTeam}
          />
        );
      case "matchups":
        return (
          <MatchupsPage
            subKey={subKey}
            subLabel={subLabel}
            onNavigateTeam={handleNavigateTeam}
            onHome={handleHome}
          />
        );
      case "resume":
        return (
          <ResumePage
            subLabel={subLabel}
            onHome={handleHome}
            onNavigateTeam={handleNavigateTeam}
          />
        );
      case "sos":
        return (
          <SOSPage
            subLabel={subLabel}
            onHome={handleHome}
            onNavigateTeam={handleNavigateTeam}
          />
        );
      case "bracket":
        return (
          <BracketPage
            subLabel={subLabel}
            onHome={handleHome}
            onNavigateTeam={handleNavigateTeam}
          />
        );
      default:
        return <ComingSoon categoryLabel={catLabel} subLabel={subLabel} />;
    }
  };

  return (
    <div className="page">
      <TopNav
        onNavigate={handleNavigate}
        onNavigateTeam={handleNavigateTeam}
        onNavigateMatchup={handleNavigateMatchup}
        onHome={handleHome}
      />

      {page.type === "home" && <HomePage onNavigateTeam={handleNavigateTeam} />}

      {page.type === "sub" && renderSubPage()}

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
