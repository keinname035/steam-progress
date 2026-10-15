# Steam Progress

**English** · [Deutsch](README.de.md)

A desktop app (Electron) for your Steam library: playtime, progress and the estimated time left to finish a game.

## Features

- Library as a tile view with cover art and playtime
- Achievement progress per game
- Completion times from HowLongToBeat (unofficial interface, may break at any time)
- You enter your story progress per game yourself (Steam doesn't provide it); time left = HLTB story length × (1 − progress). Playtime is not used for the estimate.
- Search and sorting (progress, time left, playtime, last played, name)
- Multilingual (English, German); choose on first launch and in the settings

## Getting started

```bash
npm install
npm start
```

On Windows PowerShell you may need `npm.cmd` instead of `npm`.

On first launch, pick your language and enter in the settings:

1. Steam API key: https://steamcommunity.com/dev/apikey
2. SteamID64 (17 digits, e.g. look it up on https://steamid.io using your profile URL)
3. Your Steam profile and "Game details" must be set to "Public", and "Always keep my total playtime private" must be turned off

Your credentials are stored locally in Electron's userData folder.

## Adding a language

Add an entry to `LANGUAGES` and `STRINGS` in `src/i18n.js`.

## Limitations / ideas

- Games without achievements have no achievement progress.
- Matching to HowLongToBeat is done by game name and can be wrong for unusual titles.
- Cache achievements to make reloading faster.
