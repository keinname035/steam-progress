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

ipcMain.handle('settings:get', () => loadSettings());
ipcMain.handle('settings:set', (_e, s) => { saveSettings(s); return true; });

ipcMain.handle('library:load', async () => {
  const { apiKey, steamId } = loadSettings();
  if (!apiKey || !steamId) throw new Error('API-Key und Steam-ID in den Einstellungen eintragen.');
  const data = await steamGet(
    `/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`
  );
  const games = data?.response?.games;
  if (!games) throw new Error('Keine Spiele gefunden – Profil/Spieldetails auf "Öffentlich" stellen?');
  return mapLimit(games, 8, async g => {
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
});

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1100, height: 760,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));
});
app.on('window-all-closed', () => app.quit());
