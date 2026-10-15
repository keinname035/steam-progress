// Add a language: copy an entry below, translate the values, and add it to LANGUAGES.
const LANGUAGES = { en: 'English', de: 'Deutsch' };
const DEFAULT_LANG = 'en';

const STRINGS = {
  en: {
    search: 'Search…',
    sort_progress: 'Achievement progress',
    sort_remaining: 'Time left (shortest first)',
    sort_playtime: 'Playtime',
    sort_last: 'Last played',
    sort_name: 'Name',
    reload: 'Reload',
    settings: 'Settings',
    settings_title: 'Settings',
    language: 'Language',
    api_key: 'Steam API key',
    steam_id: 'SteamID64',
    settings_hint: 'Key: steamcommunity.com/dev/apikey · Your profile and game details must be public.',
    cancel: 'Cancel',
    save: 'Save',
    continue: 'Continue',
    lang_title: 'Choose your language',
    lang_text: 'You can change this later in the settings.',
    status_count: '{n} of {m} games',
    loading: 'Loading library, achievements and completion times… (the first run takes a while)',
    played: '{t} played',
    ach: '{d}/{t} achievements ({p} %)',
    no_ach: 'No achievements',
    story_len: 'Story length (HLTB)',
    your_progress: 'Your story progress',
    not_entered: 'not entered',
    rest_story: 'Time left to finish the story',
    done: '✔ done',
    no_data: 'no data found',
    set_progress: 'Enter story progress',
    change_progress: 'Change progress',
    progress_title: 'Story progress',
    progress_q: 'How far are you in the story? (0–100 %)',
    progress_ph: 'e.g. 40',
    progress_hint: 'Time left = story length per HowLongToBeat × (100 % − your progress).',
    reset: 'Reset',
    err_no_credentials: 'Please enter your API key and Steam ID in the settings.',
    err_no_games: 'No games found. Is your profile and "Game details" set to public, and is "Always keep my total playtime private" turned off?',
  },
  de: {
    search: 'Suchen…',
    sort_progress: 'Achievement-Fortschritt',
    sort_remaining: 'Restzeit (kürzeste zuerst)',
    sort_playtime: 'Spielzeit',
    sort_last: 'Zuletzt gespielt',
    sort_name: 'Name',
    reload: 'Neu laden',
    settings: 'Einstellungen',
    settings_title: 'Einstellungen',
    language: 'Sprache',
    api_key: 'Steam-API-Key',
    steam_id: 'SteamID64',
    settings_hint: 'Key: steamcommunity.com/dev/apikey · Profil und Spieldetails müssen öffentlich sein.',
    cancel: 'Abbrechen',
    save: 'Speichern',
    continue: 'Weiter',
    lang_title: 'Sprache wählen',
    lang_text: 'Du kannst das später in den Einstellungen ändern.',
    status_count: '{n} von {m} Spielen',
    loading: 'Lade Bibliothek, Achievements und Durchspielzeiten… (beim ersten Mal dauert das)',
    played: '{t} gespielt',
    ach: '{d}/{t} Achievements ({p} %)',
    no_ach: 'Keine Achievements',
    story_len: 'Story-Dauer (HLTB)',
    your_progress: 'Dein Story-Fortschritt',
    not_entered: 'nicht eingetragen',
    rest_story: 'Restzeit bis Story-Ende',
    done: '✔ fertig',
    no_data: 'keine Daten gefunden',
    set_progress: 'Story-Fortschritt eintragen',
    change_progress: 'Fortschritt ändern',
    progress_title: 'Story-Fortschritt',
    progress_q: 'Wie weit bist du in der Story? (0–100 %)',
    progress_ph: 'z. B. 40',
    progress_hint: 'Restzeit = Story-Dauer laut HowLongToBeat × (100 % − dein Fortschritt).',
    reset: 'Zurücksetzen',
    err_no_credentials: 'Bitte API-Key und Steam-ID in den Einstellungen eintragen.',
    err_no_games: 'Keine Spiele gefunden. Sind Profil und "Spieldetails" öffentlich und ist "Gesamtspielzeit privat halten" deaktiviert?',
  },
};

let currentLang = DEFAULT_LANG;

function t(key, vars = {}) {
  const s = STRINGS[currentLang]?.[key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function setLanguage(lang) {
  currentLang = STRINGS[lang] ? lang : DEFAULT_LANG;
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}
