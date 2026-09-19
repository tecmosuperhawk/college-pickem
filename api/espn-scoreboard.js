/**
 * Same-origin ESPN scoreboard proxy — avoids browser CORS.
 * GET /api/espn-scoreboard?dates=20260918
 * GET /api/espn-scoreboard?dates=20260917-20260921&sport=college-football
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const sport = req.query.sport === 'nfl' ? 'nfl' : 'college-football';
  const dates = String(req.query.dates || '').replace(/[^0-9-]/g, '');
  const path = sport === 'nfl'
    ? `football/nfl/scoreboard?limit=100`
    : `football/college-football/scoreboard?groups=80&limit=500`;
  const url = `https://site.api.espn.com/apis/site/v2/sports/${path}${dates ? `&dates=${dates}` : ''}`;

  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const text = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(r.ok ? 200 : r.status).send(text);
  } catch (e) {
    res.status(502).json({ error: 'ESPN proxy failed', detail: e.message || String(e) });
  }
};
