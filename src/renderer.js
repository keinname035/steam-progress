const $ = id => document.getElementById(id);
let games = [];
let goals = {};
let editingAppid = null;

const fmt = min => {
  if (min == null) return '–';
  if (min < 60) return `${Math.round(min)} min`;
  return `${(min / 60).toFixed(min < 600 ? 1 : 0)} h`;
};
const progressOf = g => (g.achievements ? g.achievements.done / g.achievements.total : -1);

// Zeilen "Ziel: gesamt (noch X)" für ein Spiel
function targets(g) {
  const rows = [];
  const goal = goals[g.appid];
  if (goal) rows.push({ label: goal.label, total: goal.hours * 60, custom: true });
  if (g.hltb) {
    rows.push({ label: 'Story', total: g.hltb.mainMin });
    rows.push({ label: 'Story + Extras', total: g.hltb.plusMin });
    rows.push({ label: '100 %', total: g.hltb.fullMin });
  }
  return rows.filter(r => r.total > 0).map(r => ({
    ...r,
    left: Math.max(0, r.total - g.playtimeMin),
  }));
}

// Kürzeste noch offene Restzeit zum Sortieren: eigenes Ziel, sonst Story
function sortRemaining(g) {
  const goal = goals[g.appid];
  if (goal) return Math.max(0, goal.hours * 60 - g.playtimeMin);
  if (g.hltb?.mainMin) return Math.max(0, g.hltb.mainMin - g.playtimeMin);
  return g.estimate?.remainingMin ?? Infinity;
}

function row(t, g) {
  const el = document.createElement('div');
  el.className = 'row' + (t.custom ? ' custom' : '');
  const pct = Math.min(100, Math.round((g.playtimeMin / t.total) * 100));
  const name = document.createElement('span');
  name.textContent = t.label;
  const val = document.createElement('span');
  val.textContent = t.left === 0 ? `✔ erreicht (${fmt(t.total)})` : `noch ${fmt(t.left)} von ${fmt(t.total)} · ${pct} %`;
  el.append(name, val);
  return el;
}

function render() {
  const q = $('search').value.toLowerCase();
  const sort = $('sort').value;
  const list = games.filter(g => g.name.toLowerCase().includes(q));
  const by = {
    progress: (a, b) => progressOf(b) - progressOf(a),
    remaining: (a, b) => sortRemaining(a) - sortRemaining(b),
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
    meta.textContent = `${fmt(g.playtimeMin)} gespielt · ${ach}`;

    const box = document.createElement('div'); box.className = 'targets';
    const ts = targets(g);
    ts.forEach(t => box.append(row(t, g)));
    if (!ts.length) {
      const none = document.createElement('div');
      none.className = 'row';
      none.textContent = g.estimate && g.estimate.remainingMin > 0
        ? `Restzeit (Schätzung aus Achievements): ~${fmt(g.estimate.remainingMin)}`
        : 'Keine Zeitdaten gefunden';
      box.append(none);
    }

    const edit = document.createElement('button');
    edit.className = 'goalBtn';
    edit.textContent = goals[g.appid] ? 'Ziel ändern' : 'Eigenes Ziel setzen';
    edit.addEventListener('click', () => openGoal(g));

    card.append(img, h, bar, meta, box, edit);
    return card;
  }));
  $('status').textContent = `${list.length} von ${games.length} Spielen`;
}

function openGoal(g) {
  editingAppid = g.appid;
  const cur = goals[g.appid];
  $('goalGame').textContent = g.name;
  $('goalLabel').value = cur?.label || '';
  $('goalHours').value = cur?.hours || '';
  $('goalDialog').showModal();
}

async function load() {
  $('status').textContent = 'Lade Bibliothek, Achievements und Durchspielzeiten… (beim ersten Mal dauert das)';
  try {
    goals = await window.steam.getGoals();
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
$('goalSave').addEventListener('click', async () => {
  goals = await window.steam.setGoal(editingAppid, {
    label: $('goalLabel').value.trim() || 'Ziel',
    hours: parseFloat($('goalHours').value.replace(',', '.')),
  });
  render();
});
$('goalClear').addEventListener('click', async () => {
  goals = await window.steam.setGoal(editingAppid, null);
  render();
});

window.steam.getSettings().then(s => (s.apiKey && s.steamId ? load() : $('settingsBtn').click()));
