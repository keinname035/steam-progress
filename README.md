# Steam Progress

Desktop-App (Electron) für die eigene Steam-Bibliothek: Spielzeit, Fortschritt und geschätzte Restzeit bis zum Durchspielen.

## Features

- Bibliothek als Kachelansicht mit Cover und Spielzeit
- Fortschritt pro Spiel anhand der Achievements
- Geschätzte Restzeit: `Spielzeit / Fortschritt - Spielzeit` (erst ab 5 % Fortschritt und 30 min Spielzeit)
- Suche und Sortierung (Fortschritt, Restzeit, Spielzeit, zuletzt gespielt, Name)

## Start

```bash
npm install
npm start
```

Beim ersten Start in den Einstellungen eintragen:

1. Steam-API-Key: https://steamcommunity.com/dev/apikey
2. SteamID64 (z. B. über https://steamid.io)
3. Steam-Profil und "Spieldetails" müssen auf "Öffentlich" stehen

Die Zugangsdaten werden lokal im Electron-userData-Ordner gespeichert.

## Grenzen / Ideen

- Spiele ohne Achievements haben keinen Fortschritt und keine Schätzung.
- Die Schätzung ist eine Heuristik; Anbindung an HowLongToBeat wäre genauer (kein offizielles API).
- Caching der Achievements, damit das Neuladen schneller geht.
