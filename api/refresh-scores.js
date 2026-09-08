/**
 * Vercel serverless function — pull ESPN scores and write to Supabase.
 * Secured by CRON_SECRET (Authorization: Bearer <secret> or ?secret=).
 *
 * Env vars (Vercel project settings):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   CRON_SECRET
 */

function normalizeTeamName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`´ʻʼ]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(university|univ|college|the)\b/g, ' ')
    .replace(/\b(st|saint)\b/g, 'state')
    .replace(/\s+/g, ' ')
    .trim();
}

const TEAM_ALIASES = {
  'hawaii': ['hawaii', 'hawai i'],
  'miami fl': ['miami', 'miami florida', 'miami fl'],
  'miami oh': ['miami ohio', 'miami oh'],
  'louisiana': ['louisiana', 'louisiana lafayette', 'ull', 'lafayette'],
  'ul monroe': ['ul monroe', 'louisiana monroe', 'ulm'],
  'umass': ['umass', 'massachusetts'],
  'unlv': ['unlv', 'nevada las vegas'],
  'smu': ['smu', 'southern methodist'],
  'tcu': ['tcu', 'texas christian'],
  'fresno state': ['fresno state', 'fresno st'],
  'san jose state': ['san jose state', 'san jose st'],
  'jacksonville state': ['jacksonville state', 'jacksonville st'],
  'north dakota state': ['north dakota state', 'north dakota st', 'ndsu'],
  'eastern michigan': ['eastern michigan', 'e michigan'],
  'eastern illinois': ['eastern illinois', 'e illinois'],
  'indiana state': ['indiana state', 'indiana st'],
  'new mexico state': ['new mexico state', 'new mexico st'],
  'sacramento state': ['sacramento state', 'sacramento st'],
  'georgia tech': ['georgia tech', 'ga tech'],
  'florida state': ['florida state', 'florida st', 'fsu'],
  'michigan state': ['michigan state', 'michigan st', 'msu'],
  'ole miss': ['ole miss', 'mississippi'],
  'southern miss': ['southern miss', 'southern mississippi'],
  'uconn': ['uconn', 'connecticut'],
  'utsa': ['utsa', 'texas san antonio'],
  'utep': ['utep', 'texas el paso'],
  'byu': ['byu', 'brigham young'],
  'lsu': ['lsu', 'louisiana state'],
  'usc': ['usc', 'southern california'],
  'central michigan': ['central michigan', 'c michigan'],
  'western michigan': ['western michigan', 'w michigan'],
  'northern illinois': ['northern illinois', 'n illinois'],
  'middle tennessee': ['middle tennessee', 'middle tennessee state', 'mtsu'],
  'appalachian state': ['appalachian state', 'app state'],
  'coastal carolina': ['coastal carolina', 'coastal'],
  'james madison': ['james madison', 'jmu'],
  'sam houston': ['sam houston', 'sam houston state'],
  'texas a&m': ['texas a and m', 'texas am', 'texas a m'],
  'miami': ['miami fl', 'miami florida'],
};

function teamMatches(ourName, espnName) {
  const a = normalizeTeamName(ourName);
  const b = normalizeTeamName(espnName);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aliases = TEAM_ALIASES[a] || [a];
  if (aliases.some((al) => {
    const n = normalizeTeamName(al);
    return n === b || b.includes(n) || n.includes(b);
  })) return true;
  for (const [key, list] of Object.entries(TEAM_ALIASES)) {
    const keyN = normalizeTeamName(key);
    const listN = list.map(normalizeTeamName);
    if ((keyN === a || listN.includes(a)) && (keyN === b || listN.includes(b) || listN.some((x) => b.includes(x) || x.includes(b)))) {
      return true;
    }
  }
  return false;
}

function espnTeamRecord(comp) {
  const recs = comp?.records || [];
  const overall = recs.find((r) => r.type === 'total' || /overall/i.test(r.name || '')) || recs[0];
  const summary = overall?.summary || overall?.displayValue || '';
  return summary ? String(summary).trim() : '';
}

function espnTeamRank(comp) {
  const raw = comp?.curatedRank?.current ?? comp?.rank ?? comp?.team?.rank;
  const n = Number(raw);
  if (!n || n < 1 || n >= 99) return null;
  return n;
}

async function fetchEspnScoreboard(dates, sport = 'college-football') {
  const path = sport === 'nfl'
    ? `football/nfl/scoreboard?limit=100&dates=${dates}`
    : `football/college-football/scoreboard?groups=80&limit=500&dates=${dates}`;
  const url = `https://site.api.espn.com/apis/site/v2/sports/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('ESPN HTTP ' + res.status);
  return res.json();
}

function authorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // if not set, allow (dev); set it in production
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const q = req.query && req.query.secret;
  const header = req.headers['x-cron-secret'];
  return bearer === secret || q === secret || header === secret;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'
    });
  }

  try {
    // Open/active weeks + NFL Test week (week_number = -1)
    const weeksRes = await fetch(
      `${supabaseUrl}/rest/v1/weeks?or=(is_active.eq.true,picks_open.eq.true,week_number.eq.-1)&select=id,week_number,label`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    if (!weeksRes.ok) throw new Error('weeks fetch ' + weeksRes.status + ' ' + (await weeksRes.text()));
    const weeks = await weeksRes.json();
    if (!weeks.length) {
      return res.status(200).json({ ok: true, message: 'No open/active weeks', updated: 0 });
    }

    const weekIds = weeks.map((w) => w.id);
    const hasNflTest = weeks.some((w) => w.week_number === -1 || /nfl/i.test(String(w.label || '')));
    const gamesRes = await fetch(
      `${supabaseUrl}/rest/v1/games?week_id=in.(${weekIds.join(',')})&select=id,week_id,away_team,home_team,away_score,home_score,status,game_date,kickoff_at,away_record,home_record,away_rank,home_rank`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    if (!gamesRes.ok) throw new Error('games fetch ' + gamesRes.status);
    const games = await gamesRes.json();

    // Date windows from slate + defaults
    const cfbWindows = new Set(['20260829-20260914']);
    const nflWindows = new Set(['20260806-20260820']);
    games.forEach((g) => {
      const d = (g.game_date || '').replace(/-/g, '');
      if (/^\d{8}$/.test(d)) {
        cfbWindows.add(d);
        nflWindows.add(d);
      }
      if (g.kickoff_at) {
        const k = g.kickoff_at.slice(0, 10).replace(/-/g, '');
        if (/^\d{8}$/.test(k)) {
          cfbWindows.add(k);
          nflWindows.add(k);
        }
      }
    });

    const seen = new Set();
    const espnGames = [];
    async function collect(windows, sport) {
      for (const dates of windows) {
        try {
          const data = await fetchEspnScoreboard(dates, sport);
          (data.events || []).forEach((ev) => {
            const key = sport + ':' + (ev.id || ev.name);
            if (seen.has(key)) return;
            seen.add(key);
            const comp = (ev.competitions && ev.competitions[0]) || {};
            const competitors = comp.competitors || [];
            const home = competitors.find((c) => c.homeAway === 'home');
            const away = competitors.find((c) => c.homeAway === 'away');
            if (!home || !away) return;
            const statusType = (ev.status && ev.status.type) || {};
            let status = 'scheduled';
            if (statusType.completed || statusType.name === 'STATUS_FINAL') status = 'final';
            else if (
              statusType.state === 'in' ||
              (statusType.name || '').includes('IN_PROGRESS') ||
              statusType.description === 'In Progress' ||
              (statusType.name || '').includes('HALFTIME')
            ) {
              status = 'live';
            }
            espnGames.push({
              awayName: away.team?.displayName || away.team?.shortDisplayName || away.team?.name,
              homeName: home.team?.displayName || home.team?.shortDisplayName || home.team?.name,
              awayScore: away.score != null && away.score !== '' ? parseInt(away.score, 10) : null,
              homeScore: home.score != null && home.score !== '' ? parseInt(home.score, 10) : null,
              status,
              awayRecord: espnTeamRecord(away),
              homeRecord: espnTeamRecord(home),
              awayRank: espnTeamRank(away),
              homeRank: espnTeamRank(home),
            });
          });
        } catch (e) {
          console.warn('ESPN window failed', sport, dates, e.message);
        }
      }
    }
    await collect(cfbWindows, 'college-football');
    if (hasNflTest) await collect(nflWindows, 'nfl');

    let matched = 0;
    let updated = 0;
    const details = [];

    for (const g of games) {
      const match = espnGames.find(
        (eg) => teamMatches(g.away_team, eg.awayName) && teamMatches(g.home_team, eg.homeName)
      );
      if (!match) continue;
      matched++;
      if (
        g.away_score === match.awayScore &&
        g.home_score === match.homeScore &&
        g.status === match.status &&
        String(g.away_record || '') === String(match.awayRecord || '') &&
        String(g.home_record || '') === String(match.homeRecord || '') &&
        Number(g.away_rank || 0) === Number(match.awayRank || 0) &&
        Number(g.home_rank || 0) === Number(match.homeRank || 0)
      ) {
        continue;
      }

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/games?id=eq.${g.id}`, {
        method: 'PATCH',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          away_score: match.awayScore,
          home_score: match.homeScore,
          status: match.status,
          away_record: match.awayRecord || null,
          home_record: match.homeRecord || null,
          away_rank: match.awayRank,
          home_rank: match.homeRank,
        }),
      });
      if (!patchRes.ok) {
        const t = await patchRes.text();
        details.push({ id: g.id, error: t });
        continue;
      }
      updated++;
      details.push({
        id: g.id,
        matchup: `${g.away_team} @ ${g.home_team}`,
        status: match.status,
        score: `${match.awayScore}-${match.homeScore}`,
      });
    }

    return res.status(200).json({
      ok: true,
      weeks: weeks.map((w) => w.label),
      espnEvents: espnGames.length,
      matched,
      updated,
      details,
      at: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};
