"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Day = [date: string, count: number, level: number];
type Activity = {
  user: string;
  fetchedAt: string;
  total: number;
  activeDays: number;
  bestDay: { date: string; count: number } | null;
  currentStreak: number;
  longestStreak: number;
  days: Day[];
  stale?: boolean;
};

const PROFILE = "https://github.com/jcooperkai-sys";
const REFRESH_MS = 5 * 60_000;
const MIN_REFETCH_GAP_MS = 60_000;
const WEEKS = 53;

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function asDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function plural(n: number, word: string) {
  return `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;
}

function describe(day: Day) {
  return `${dayFormat.format(asDate(day[0]))}: ${day[1] === 0 ? "no contributions" : plural(day[1], "contribution")}`;
}

function isActivity(value: unknown): value is Activity {
  const v = value as Activity;
  return Boolean(v) && Array.isArray(v.days) && typeof v.total === "number" && v.days.every((d) => Array.isArray(d) && d.length === 3);
}

export function GitHubActivity() {
  const [data, setData] = useState<Activity | null>(null);
  const [failed, setFailed] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const lastFetch = useRef(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      lastFetch.current = Date.now();
      try {
        const response = await fetch("/api/github", { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(String(response.status));
        const body: unknown = await response.json();
        if (!isActivity(body)) throw new Error("shape");
        if (!alive) return;
        setData(body);
        setFailed(false);
        setCheckedAt(timeFormat.format(new Date()));
      } catch {
        if (alive) setFailed(true);
      }
    }
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    function onVisible() {
      if (document.visibilityState === "visible" && Date.now() - lastFetch.current > MIN_REFETCH_GAP_MS) load();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const weeks = useMemo(() => {
    if (!data) return null;
    const out: { index: number; day: Day }[][] = [];
    data.days.forEach((day, index) => {
      const column = Math.floor(index / 7);
      (out[column] ??= []).push({ index, day });
    });
    return out.slice(-WEEKS);
  }, [data]);

  const lastActive = useMemo(() => (data ? data.days.findLast((d) => d[1] > 0) ?? null : null), [data]);
  const hovered = data && hover !== null ? data.days[hover] ?? null : null;
  const stats: { label: string; value: string; note?: string }[] = data
    ? [
        { label: "Contributions, last year", value: data.total.toLocaleString("en-US") },
        { label: "Active days", value: String(data.activeDays) },
        { label: "Best day", value: data.bestDay ? String(data.bestDay.count) : "0", note: data.bestDay ? dayFormat.format(asDate(data.bestDay.date)) : undefined },
        { label: "Current streak", value: plural(data.currentStreak, "day") },
        { label: "Longest streak", value: plural(data.longestStreak, "day") },
      ]
    : ["Contributions, last year", "Active days", "Best day", "Current streak", "Longest streak"].map((label) => ({ label, value: "" }));

  let status: string;
  if (data && failed) status = `GitHub didn't answer just now. Showing the last good copy from ${checkedAt}.`;
  else if (data && data.stale) status = `GitHub is slow to answer. Showing the last good copy, checked ${checkedAt}.`;
  else if (data && data.total === 0) status = "No public contributions in the last year.";
  else if (data) status = `Live from GitHub, checked ${checkedAt}`;
  else if (failed) status = "GitHub didn't answer. This will try again in a few minutes.";
  else status = "Loading the last year from GitHub";

  return (
    <>
      <div className="band-rail">
        <h2 className="label" id="activity">GitHub activity</h2>
        <p className="activity-status" role="status">
          <span className={`pulse${data && !failed && !data.stale ? " pulse-on" : ""}`} aria-hidden="true" />
          {status}
        </p>
      </div>
      <div className="activity">
      {weeks ? (
        <div
          className="heat heat-ready"
          role="img"
          aria-label={`${plural(data!.total, "contribution")} on GitHub in the last year, on ${plural(data!.activeDays, "day")}.`}
          onPointerLeave={() => setHover(null)}
          onPointerOver={(e) => {
            const i = (e.target as HTMLElement).dataset?.i;
            if (i !== undefined) setHover(Number(i));
          }}
        >
          {weeks.map((week, w) => {
            const first = asDate(week[0].day[0]);
            const previous = w > 0 ? asDate(weeks[w - 1][0].day[0]) : null;
            const newMonth = !previous || previous.getUTCMonth() !== first.getUTCMonth();
            return (
              <div className="heat-week" key={week[0].day[0]} style={{ "--w": w } as React.CSSProperties}>
                <span className="heat-month">{newMonth && w < weeks.length - 1 ? monthFormat.format(first) : ""}</span>
                {week.map(({ index, day }) => (
                  <span key={day[0]} className={`heat-cell heat-${day[2]}`} data-i={index} title={describe(day)} />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`heat${failed ? "" : " heat-loading"}`} aria-hidden="true">
          {Array.from({ length: WEEKS }, (_, w) => (
            <div className="heat-week" key={w} style={{ "--w": w } as React.CSSProperties}>
              <span className="heat-month" />
              {Array.from({ length: 7 }, (_, d) => (
                <span key={d} className="heat-cell heat-0" />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="heat-foot">
        <p className="heat-readout">
          {hovered ? describe(hovered) : lastActive ? `Last active ${describe(lastActive)}` : data ? "No contributions yet" : failed ? (
            <a href={PROFILE} rel="noopener noreferrer">See the activity on my GitHub profile</a>
          ) : (
            " "
          )}
        </p>
        <p className="heat-legend" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`heat-cell heat-${level}`} />
          ))}
          More
        </p>
      </div>

      <dl className="stats">
        {stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>
              {s.value || <span className="stat-blank" aria-label={failed ? "Unavailable" : "Loading"} />}
              {s.note && <small>{s.note}</small>}
            </dd>
          </div>
        ))}
      </dl>
      </div>
    </>
  );
}
