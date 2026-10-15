const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try { return JSON.parse(fs.readFileSync(settingsFile(), 'utf8')); } catch { return {}; }
}
function saveSettings(s) {
  fs.writeFileSync(settingsFile(), JSON.stringify(s, null, 2));
}

const API = 'https://api.steampowered.com';

async function steamGet(pathAndQuery) {
  const res = await fetch(API + pathAndQuery);
  if (!res.ok) throw new Error(`Steam API: HTTP ${res.status}`);
  return res.json();
}

async function fetchAchievements(key, steamId, appid) {
  try {
    const data = await steamGet(
      `/ISteamUserStats/GetPlayerAchievements/v1/?key=${key}&steamid=${steamId}&appid=${appid}`
    );
    const list = data?.playerstats?.achievements;
    if (!data?.playerstats?.success || !list?.length) return null;
    return { done: list.filter(a => a.achieved).length, total: list.length };
  } catch {
    return null; // Spiel ohne Achievements oder privat
  }
}

// Schätzung: Spielzeit / Fortschritt = Gesamtdauer. Nur belastbar bei genug Fortschritt.
function estimate(playtimeMin, ach) {
  if (!ach) return null;
  const progress = ach.done / ach.total;
  if (progress >= 1) return { totalMin: playtimeMin, remainingMin: 0 };
  if (progress < 0.05 || playtimeMin < 30) return null;
  const totalMin = playtimeMin / progress;
  return { totalMin, remainingMin: totalMin - playtimeMin };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) { const n = i++; out[n] = await fn(items[n]); }
  }));
  return out;
}

// ---- HowLongToBeat (inoffiziell, kann jederzeit brechen) ----
const HLTB = 'https://howlongtobeat.com';
const HLTB_HEADERS = { 'User-Agent': 'Mozilla/5.0', Referer: HLTB + '/', Origin: HLTB };
const cacheFile = () => path.join(app.getPath('userData'), 'hltb-cache.json');
let hltbCache = null;
let hltbToken = null;

function readCache() {
  if (!hltbCache) {
    try { hltbCache = JSON.parse(fs.readFileSync(cacheFile(), 'utf8')); } catch { hltbCache = {}; }
  }
  return hltbCache;
}

async function hltbInit() {
  const r = await fetch(`${HLTB}/api/search/site/init?t=${Date.now()}`, { headers: HLTB_HEADERS });
  if (!r.ok) throw new Error(`HLTB init: HTTP ${r.status}`);
  hltbToken = (await r.json()).token;
}

const norm = s => s.toLowerCase().replace(/[™®©]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

async function hltbSearch(name, retry = true) {
  if (!hltbToken) await hltbInit();
  const body = {
    searchType: 'games', searchTerms: name.split(' '), searchPage: 1, size: 10,
    searchOptions: {
      games: { userId: 0, platform: '', sortCategory: 'popular', rangeCategory: 'main',
        rangeTime: { min: 0, max: 0 }, gameplay: { perspective: '', flow: '', genre: '', difficulty: '' },
        rangeYear: { min: '', max: '' }, modifier: '' },
      users: { sortCategory: 'postcount' }, lists: { sortCategory: 'follows' },
      filter: '', sort: 0, randomizer: 0,
    },
    useCache: true,
  };
  const r = await fetch(`${HLTB}/api/search/site`, {
    method: 'POST',
    headers: { ...HLTB_HEADERS, 'Content-Type': 'application/json', 'x-auth-token': hltbToken },
    body: JSON.stringify(body),
  });
  if (r.status === 403 && retry) { hltbToken = null; return hltbSearch(name, false); }
  if (!r.ok) throw new Error(`HLTB: HTTP ${r.status}`);
  const { data = [] } = await r.json();
  const games = data.filter(d => d.game_type === 'game');
  const hit = games.find(d => norm(d.game_name) === norm(name)) || games[0];
  if (!hit || !(hit.comp_main || hit.comp_plus || hit.comp_100)) return null;
  return {
    matched: hit.game_name,
    mainMin: Math.round(hit.comp_main / 60),
    plusMin: Math.round(hit.comp_plus / 60),
    fullMin: Math.round(hit.comp_100 / 60),
  };
}

async function hltbFor(game) {
  const cache = readCache();
  const hit = cache[game.appid];
  if (hit !== undefined && (hit !== null || Date.now() - (cache._miss?.[game.appid] || 0) < 7 * 864e5)) return hit;
  try {
    const res = await hltbSearch(game.name);
    cache[game.appid] = res;
    if (res === null) (cache._miss ||= {})[game.appid] = Date.now();
    return res;
  } catch {
    return null; // nicht cachen, nächster Versuch beim Neuladen
  }
}

// ---- eigene Ziele pro Spiel (z. B. "Goldenes Armband") ----
const goalsFile = () => path.join(app.getPath('userData'), 'goals.json');
const loadGoals = () => { try { return JSON.parse(fs.readFileSync(goalsFile(), 'utf8')); } catch { return {}; } };
ipcMain.handle('goals:get', () => loadGoals());
ipcMain.handle('goals:set', (_e, appid, goal) => {
  const g = loadGoals();
  const pct = Number(goal?.pct);
  if (goal && Number.isFinite(pct) && pct >= 0 && pct <= 100) g[appid] = { pct };
  else delete g[appid];
  fs.writeFileSync(goalsFile(), JSON.stringify(g, null, 2));
  return g;
});

ipcMain.handle('settings:get', () => loadSettings());
ipcMain.handle('settings:set', (_e, s) => { saveSettings({ ...loadSettings(), ...s }); return true; });

ipcMain.handle('library:load', async () => {
  const { apiKey, steamId } = loadSettings();
  if (!apiKey || !steamId) throw new Error('ERR_NO_CREDENTIALS');
  const data = await steamGet(
    `/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`
  );
  const games = data?.response?.games;
  if (!games) throw new Error('ERR_NO_GAMES');
  const result = await mapLimit(games, 8, async g => {
    const ach = await fetchAchievements(apiKey, steamId, g.appid);
    return {
      appid: g.appid,
      name: g.name,
      playtimeMin: g.playtime_forever,
      lastPlayed: g.rtime_last_played || 0,
      img: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      achievements: ach,
      estimate: estimate(g.playtime_forever, ach),
    };
  });
  // Nur Spiele mit Spielzeit abfragen (Backlog ohne Spielzeit braucht keine Restzeit-Anzeige),
  // und höflich: wenige parallele Anfragen. Ergebnisse werden gecacht.
  const played = result.filter(g => g.playtimeMin > 0);
  await mapLimit(played, 3, async g => { g.hltb = await hltbFor(g); });
  fs.writeFileSync(cacheFile(), JSON.stringify(readCache()));
  return result;
});

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1100, height: 760,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));
});
app.on('window-all-closed', () => app.quit());
