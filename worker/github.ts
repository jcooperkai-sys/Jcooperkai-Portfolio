export const GITHUB_USER = "jcooperkai-sys";

export type ActivityDay = [date: string, count: number, level: number];

export type Activity = {
  user: string;
  fetchedAt: string;
  total: number;
  activeDays: number;
  bestDay: { date: string; count: number } | null;
  currentStreak: number;
  longestStreak: number;
  days: ActivityDay[];
};

const MIN_DAYS = 300;
const MAX_DAYS = 400;
const FRESH_MS = 120_000;
const FETCH_TIMEOUT_MS = 6_000;
const MAX_HTML_BYTES = 2_000_000;

function attr(tag: string, name: string) {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
}

export function parseContributions(html: string, now = new Date()): Activity {
  const counts = new Map<string, number>();
  for (const tip of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)</g)) {
    const target = attr(tip[1], "for");
    if (!target) continue;
    const n = /^\s*(\d{1,5}) contribution/.exec(tip[2]);
    counts.set(target, n ? Number(n[1]) : 0);
  }

  const days: ActivityDay[] = [];
  for (const cell of html.matchAll(/<td\b([^>]*\sdata-date="[^"]*"[^>]*)>/g)) {
    const date = attr(cell[1], "data-date");
    const level = Number(attr(cell[1], "data-level"));
    const id = attr(cell[1], "id");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(level) || level < 0 || level > 4) continue;
    days.push([date, (id && counts.get(id)) || 0, level]);
  }
  if (days.length < MIN_DAYS || days.length > MAX_DAYS) {
    throw new Error(`unexpected contribution calendar: ${days.length} days`);
  }
  days.sort((a, b) => (a[0] < b[0] ? -1 : 1));

  let total = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let run = 0;
  let bestDay: Activity["bestDay"] = null;
  for (const [date, count] of days) {
    total += count;
    if (count > 0) {
      activeDays += 1;
      run += 1;
      if (run > longestStreak) longestStreak = run;
      if (!bestDay || count > bestDay.count) bestDay = { date, count };
    } else {
      run = 0;
    }
  }

  let currentStreak = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i][1] === 0) i -= 1;
  for (; i >= 0 && days[i][1] > 0; i -= 1) currentStreak += 1;

  return {
    user: GITHUB_USER,
    fetchedAt: now.toISOString(),
    total,
    activeDays,
    bestDay,
    currentStreak,
    longestStreak,
    days,
  };
}

let memo: { at: number; activity: Activity } | null = null;

export async function loadActivity(fetcher: typeof fetch = fetch, now = Date.now()) {
  if (memo && now - memo.at < FRESH_MS) return { activity: memo.activity, stale: false };
  try {
    // Security: the upstream URL is a constant. Nothing from the incoming request reaches it,
    // so this route cannot be steered into fetching another host or path.
    const response = await fetcher(`https://github.com/users/${GITHUB_USER}/contributions`, {
      headers: { "X-Requested-With": "XMLHttpRequest", "User-Agent": "jcooperkai.com", Accept: "text/html" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "manual",
    });
    if (!response.ok) throw new Error(`upstream status ${response.status}`);
    const html = await response.text();
    if (html.length > MAX_HTML_BYTES) throw new Error("upstream body too large");
    const activity = parseContributions(html, new Date(now));
    memo = { at: now, activity };
    return { activity, stale: false };
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "github_activity_failed",
        reason: String((err as { message?: string })?.message ?? err).slice(0, 160),
        servedStale: memo !== null,
      }),
    );
    if (memo) return { activity: memo.activity, stale: true };
    return null;
  }
}

export function resetActivityMemo() {
  memo = null;
}
