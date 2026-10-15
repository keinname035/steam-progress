# Steam Progress

**English** · [Deutsch](README.de.md)

A desktop app (Electron) for your Steam library: playtime, achievement progress and the estimated time left to finish a game's story.

## Download

Get the latest Windows installer from the [Releases page](https://github.com/keinname035/steam-progress/releases/latest) and run `Steam-Progress-Setup-<version>.exe`.

> The installer is not code-signed, so Windows SmartScreen may show a warning. Choose "More info" → "Run anyway".

## Features

- Library as a tile view with cover art and playtime
- Achievement progress per game
- Completion times from HowLongToBeat (unofficial interface, may break at any time)
- You enter your story progress per game yourself (Steam doesn't provide it); time left = HLTB story length × (1 − progress). Playtime is not used for the estimate.
- Search and sorting (progress, time left, playtime, last played, name)
- Multilingual (English, German); choose on first launch and in the settings

## Setup

On first launch, pick your language and enter in the settings:

1. Your own Steam Web API key: https://steamcommunity.com/dev/apikey
2. Your SteamID64 (17 digits, e.g. look it up on https://steamid.io using your profile URL)
3. Your Steam profile and "Game details" must be set to "Public", and "Always keep my total playtime private" must be turned off

Your credentials are stored locally in the app's data folder and are only sent to Steam.

## Run from source

Requires [Node.js](https://nodejs.org) (LTS).

```bash
git clone https://github.com/keinname035/steam-progress.git
cd steam-progress
npm install
npm start
```

On Windows PowerShell you may need `npm.cmd` instead of `npm`.

Build the installer locally with `npm run dist` (output in `dist/`). A release is built automatically on GitHub when a tag like `v0.1.0` is pushed.

## Adding a language

Add an entry to `LANGUAGES` and `STRINGS` in `src/i18n.js`, then run `npm run check`.

## Notes and limitations

- HowLongToBeat has no official API. This app uses the same endpoint as their website, which may change or be restricted at any time. This project is not affiliated with HowLongToBeat or Valve.
- Matching to HowLongToBeat is done by game name and can be wrong for unusual titles.
- Games without achievements have no achievement progress.

## License

[MIT](LICENSE)
