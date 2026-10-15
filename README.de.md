# Steam Progress

[English](README.md) · **Deutsch**

Desktop-App (Electron) für die eigene Steam-Bibliothek: Spielzeit, Achievement-Fortschritt und geschätzte Restzeit bis zum Story-Ende.

## Download

Den aktuellen Windows-Installer gibt es auf der [Releases-Seite](https://github.com/keinname035/steam-progress/releases/latest). Datei `Steam-Progress-Setup-<version>.exe` herunterladen und ausführen.

> Der Installer ist nicht signiert, daher kann Windows SmartScreen warnen. Dann "Weitere Informationen" → "Trotzdem ausführen" wählen.

## Features

- Bibliothek als Kachelansicht mit Cover und Spielzeit
- Achievement-Fortschritt pro Spiel
- Durchspielzeiten von HowLongToBeat (inoffizielle Schnittstelle, kann jederzeit brechen)
- Story-Fortschritt trägst du pro Spiel selbst ein (Steam liefert ihn nicht); Restzeit = HLTB-Story-Dauer × (1 − Fortschritt). Die Spielzeit wird nicht zur Schätzung benutzt.
- Suche und Sortierung (Fortschritt, Restzeit, Spielzeit, zuletzt gespielt, Name)
- Mehrsprachig (Englisch, Deutsch); Auswahl beim ersten Start und in den Einstellungen

## Einrichtung

Beim ersten Start Sprache wählen und in den Einstellungen eintragen:

1. Eigener Steam-Web-API-Key: https://steamcommunity.com/dev/apikey
2. Eigene SteamID64 (17 Ziffern, z. B. über https://steamid.io mit der Profil-URL ermitteln)
3. Steam-Profil und "Spieldetails" müssen auf "Öffentlich" stehen, "Gesamtspielzeit privat halten" muss deaktiviert sein

Die Zugangsdaten werden lokal im Datenordner der App gespeichert und nur an Steam gesendet.

## Aus dem Quellcode starten

Benötigt [Node.js](https://nodejs.org) (LTS).

```bash
git clone https://github.com/keinname035/steam-progress.git
cd steam-progress
npm install
npm start
```

Unter Windows PowerShell ggf. `npm.cmd` statt `npm` verwenden.

Den Installer lokal bauen: `npm run dist` (Ausgabe in `dist/`). Auf GitHub wird bei einem Tag wie `v0.1.0` automatisch ein Release gebaut.

## Weitere Sprache hinzufügen

In `src/i18n.js` einen Eintrag in `LANGUAGES` und `STRINGS` ergänzen, danach `npm run check` ausführen.

## Hinweise und Grenzen

- HowLongToBeat hat keine offizielle API. Die App nutzt denselben Endpunkt wie deren Webseite, der sich jederzeit ändern oder eingeschränkt werden kann. Das Projekt steht in keiner Verbindung zu HowLongToBeat oder Valve.
- Die Zuordnung zu HowLongToBeat läuft über den Spielnamen und kann bei ungewöhnlichen Titeln danebenliegen.
- Spiele ohne Achievements haben keinen Achievement-Fortschritt.

## Lizenz

[MIT](LICENSE)
