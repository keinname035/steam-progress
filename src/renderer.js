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

// Story-Fortschritt (%) kommt nur von dir; Spielzeit wird NICHT zur Schätzung benutzt.
const storyPct = g => goals[g.appid]?.pct;

// Restzeit bis Story-Ende: HLTB-Story-Dauer * (1 - Fortschritt). Ohne Eingabe: unbekannt.
function storyLeft(g) {
  const pct = storyPct(g);
  if (pct == null || !g.hltb?.mainMin) return null;
  return g.hltb.mainMin * (1 - pct / 100);
}
const sortRemaining = g => storyLeft(g) ?? Infinity;

function row(label, value) {
  const el = document.createElement('div');
  el.className = 'row';
  const a = document.createElement('span'); a.textContent = label;
  const b = document.createElement('span'); b.textContent = value;
  el.append(a, b);
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
    if (g.hltb) {
      box.append(row('Story-Dauer (HLTB)', fmt(g.hltb.mainMin)));
      const pct = storyPct(g);
      box.append(row('Dein Story-Fortschritt', pct == null ? 'nicht eingetragen' : `${pct} %`));
      const left = storyLeft(g);
      if (left != null) box.append(row('Restzeit bis Story-Ende', left <= 0 ? '✔ fertig' : `~${fmt(left)}`));
    } else {
      box.append(row('Story-Dauer', 'keine Daten gefunden'));
    }

    const edit = document.createElement('button');
    edit.className = 'goalBtn';
    edit.textContent = storyPct(g) != null ?'Fortschritt ändern' : 'Story-Fortschritt eintragen';
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
  $('goalPct').value = cur?.pct ?? '';
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
    pct: parseFloat($('goalPct').value.replace(',', '.')),
  });
  render();
});
$('goalClear').addEventListener('click', async () => {
  goals = await window.steam.setGoal(editingAppid, null);
  render();
});

window.steam.getSettings().then(s => (s.apiKey && s.steamId ? load() : $('settingsBtn').click()));
