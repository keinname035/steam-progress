# Steam Progress

Desktop-App (Electron) fÃ¼r die eigene Steam-Bibliothek: Spielzeit, Fortschritt und geschÃ¤tzte Restzeit bis zum Durchspielen.

## Features

- Bibliothek als Kachelansicht mit Cover und Spielzeit
- Fortschritt pro Spiel anhand der Achievements
- GeschÃ¤tzte Restzeit: `Spielzeit / Fortschritt - Spielzeit` (erst ab 5 % Fortschritt und 30 min Spielzeit)
- Suche und Sortierung (Fortschritt, Restzeit, Spielzeit, zuletzt gespielt, Name)

## Start

```bash
npm install
npm start
```

Beim ersten Start in den Einstellungen eintragen:

1. Steam-API-Key: https://steamcommunity.com/dev/apikey
2. SteamID64 (z. B. Ã¼ber https://steamid.io)
3. Steam-Profil und "Spieldetails" mÃ¼ssen auf "Ã–ffentlich" stehen

Die Zugangsdaten werden lokal im Electron-userData-Ordner gespeichert.

## Grenzen / Ideen

- Spiele ohne Achievements haben keinen Fortschritt und keine SchÃ¤tzung.
- Die SchÃ¤tzung ist eine Heuristik; Anbindung an HowLongToBeat wÃ¤re genauer (kein offizielles API).
- Caching der Achievements, damit das Neuladen schneller geht.

