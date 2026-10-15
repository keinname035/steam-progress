const $ = id => document.getElementById(id);
let games = [];

const fmt = min => {
  if (min == null) return '–';
  if (min < 60) return `${Math.round(min)} min`;
  return `${(min / 60).toFixed(min < 600 ? 1 : 0)} h`;
};
const progressOf = g => (g.achievements ? g.achievements.done / g.achievements.total : -1);

function render() {
  const q = $('search').value.toLowerCase();
  const sort = $('sort').value;
  const list = games.filter(g => g.name.toLowerCase().includes(q));
  const by = {
    progress: (a, b) => progressOf(b) - progressOf(a),
    remaining: (a, b) => (a.estimate?.remainingMin ?? Infinity) - (b.estimate?.remainingMin ?? Infinity),
    playtime: (a, b) => b.playtimeMin - a.playtimeMin,
    last: (a, b) => b.lastPlayed - a.lastPlayed,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  list.sort(by[sort]);

  $('grid').replaceChildren(...list.map(g => {
    const p = progressOf(g);
    const card = document.createElement('article');
    const img = document.createElement('img');
    img.src = g.img; img.loading = 'lazy'; img.alt = '';
    const h = document.createElement('h3'); h.textContent = g.name;
    const bar = document.createElement('div'); bar.className = 'bar';
    const fill = document.createElement('div');
    fill.style.width = `${Math.max(p, 0) * 100}%`;
    bar.append(fill);
    const meta = document.createElement('p');
    const ach = g.achievements
      ? `${g.achievements.done}/${g.achievements.total} Achievements (${Math.round(p * 100)} %)`
      : 'Keine Achievements';
    const rest = g.estimate
      ? (g.estimate.remainingMin === 0 ? 'Abgeschlossen' : `~${fmt(g.estimate.remainingMin)} verbleibend`)
      : 'Restzeit unbekannt';
    meta.textContent = `${fmt(g.playtimeMin)} gespielt · ${ach} · ${rest}`;
    card.append(img, h, bar, meta);
    return card;
  }));
  $('status').textContent = `${list.length} von ${games.length} Spielen`;
}

async function load() {
  $('status').textContent = 'Lade Bibliothek und Achievements…';
  try {
    games = await window.steam.loadLibrary();
    render();
  } catch (e) {
    $('status').textContent = e.message.replace(/^Error invoking remote method [^:]+: (Error: )?/, '');
  }
}

$('search').addEventListener('input', render);
$('sort').addEventListener('change', render);
$('reload').addEventListener('click', load);
$('settingsBtn').addEventListener('click', async () => {
  const s = await window.steam.getSettings();
  $('apiKey').value = s.apiKey || '';
  $('steamId').value = s.steamId || '';
  $('settings').showModal();
});
$('save').addEventListener('click', async () => {
  await window.steam.setSettings({ apiKey: $('apiKey').value.trim(), steamId: $('steamId').value.trim() });
  load();
});

window.steam.getSettings().then(s => (s.apiKey && s.steamId ? load() : $('settingsBtn').click()));
