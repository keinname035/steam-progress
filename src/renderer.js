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

// Story progress (%) comes only from the user; playtime is NOT used for estimates.
const storyPct = g => goals[g.appid]?.pct;

// Time left to finish the story: HLTB story length * (1 - progress). Unknown without input.
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
      ? t('ach', { d: g.achievements.done, t: g.achievements.total, p: Math.round(p * 100) })
      : t('no_ach');
    meta.textContent = `${t('played', { t: fmt(g.playtimeMin) })} · ${ach}`;

    const box = document.createElement('div'); box.className = 'targets';
    if (g.hltb) {
      box.append(row(t('story_len'), fmt(g.hltb.mainMin)));
      const pct = storyPct(g);
      box.append(row(t('your_progress'), pct == null ? t('not_entered') : `${pct} %`));
      const left = storyLeft(g);
      if (left != null) box.append(row(t('rest_story'), left <= 0 ? t('done') : `~${fmt(left)}`));
    } else {
      box.append(row(t('story_len'), t('no_data')));
    }

    const edit = document.createElement('button');
    edit.className = 'goalBtn';
    edit.textContent = storyPct(g) != null ? t('change_progress') : t('set_progress');
    edit.addEventListener('click', () => openGoal(g));

    card.append(img, h, bar, meta, box, edit);
    return card;
  }));
  $('status').textContent = t('status_count', { n: list.length, m: games.length });
}

function openGoal(g) {
  editingAppid = g.appid;
  $('goalGame').textContent = g.name;
  $('goalPct').value = goals[g.appid]?.pct ?? '';
  $('goalDialog').showModal();
}

// Main process throws plain codes or Steam errors; map known codes to translated text.
function errorText(e) {
  const msg = String(e.message).replace(/^Error invoking remote method [^:]+: (Error: )?/, '');
  const known = { ERR_NO_CREDENTIALS: 'err_no_credentials', ERR_NO_GAMES: 'err_no_games' };
  return known[msg] ? t(known[msg]) : msg;
}

async function load() {
  $('status').textContent = t('loading');
  try {
    goals = await window.steam.getGoals();
    games = await window.steam.loadLibrary();
    render();
  } catch (e) {
    $('status').textContent = errorText(e);
  }
}

function fillLanguageSelect(sel, current) {
  sel.replaceChildren(...Object.entries(LANGUAGES).map(([code, name]) => {
    const o = document.createElement('option');
    o.value = code; o.textContent = name; o.selected = code === current;
    return o;
  }));
}

async function applyLanguage(lang) {
  setLanguage(lang);
  await window.steam.setSettings({ lang });
  if (games.length) render(); else $('status').textContent = '';
}

$('search').addEventListener('input', render);
$('sort').addEventListener('change', render);
$('reload').addEventListener('click', load);

$('settingsBtn').addEventListener('click', async () => {
  const s = await window.steam.getSettings();
  fillLanguageSelect($('langSelect'), s.lang || DEFAULT_LANG);
  $('apiKey').value = s.apiKey || '';
  $('steamId').value = s.steamId || '';
  $('settings').showModal();
});
$('save').addEventListener('click', async () => {
  const lang = $('langSelect').value;
  setLanguage(lang);
  await window.steam.setSettings({
    lang,
    apiKey: $('apiKey').value.trim(),
    steamId: $('steamId').value.trim(),
  });
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

// Live-preview the language inside the first-run dialog.
$('langFirst').addEventListener('change', () => setLanguage($('langFirst').value));

async function start() {
  const s = await window.steam.getSettings();
  setLanguage(s.lang || DEFAULT_LANG);
  if (!s.lang) {
    // First launch: ask for the language (English preselected), then continue.
    fillLanguageSelect($('langFirst'), DEFAULT_LANG);
    $('langDialog').addEventListener('close', async () => {
      await applyLanguage($('langFirst').value);
      if (s.apiKey && s.steamId) load(); else $('settingsBtn').click();
    }, { once: true });
    $('langDialog').showModal();
    return;
  }
  if (s.apiKey && s.steamId) load(); else $('settingsBtn').click();
}
start();
