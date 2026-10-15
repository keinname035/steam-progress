# Steam Progress

Desktop-App (Electron) für die eigene Steam-Bibliothek: Spielzeit, Fortschritt und geschätzte Restzeit bis zum Durchspielen.

## Features

- Bibliothek als Kachelansicht mit Cover und Spielzeit
- Fortschritt pro Spiel anhand der Achievements
- Durchspielzeiten von HowLongToBeat (inoffizielle Schnittstelle, kann jederzeit brechen)
- Story-Fortschritt trägst du pro Spiel selbst ein (Steam liefert ihn nicht); Restzeit = HLTB-Story-Dauer × (1 − Fortschritt). Die Spielzeit wird nicht zur Schätzung benutzt.
- Suche und Sortierung (Fortschritt, Restzeit, Spielzeit, zuletzt gespielt, Name)

## Start

```bash
npm install
npm start
```

Unter Windows PowerShell ggf. `npm.cmd` statt `npm` verwenden.

Beim ersten Start in den Einstellungen eintragen:

1. Steam-API-Key: https://steamcommunity.com/dev/apikey
2. SteamID64 (17 Ziffern, z. B. über https://steamid.io mit der Profil-URL ermitteln)
3. Steam-Profil und "Spieldetails" müssen auf "Öffentlich" stehen, "Gesamtspielzeit privat halten" muss deaktiviert sein

Die Zugangsdaten werden lokal im Electron-userData-Ordner gespeichert.

## Grenzen / Ideen

- Spiele ohne Achievements haben keinen Achievement-Fortschritt.
- Die Zuordnung zu HowLongToBeat läuft über den Spielnamen und kann bei ungewöhnlichen Titeln danebenliegen.
- Caching der Achievements, damit das Neuladen schneller geht.
