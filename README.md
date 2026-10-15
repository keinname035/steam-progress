# Steam Progress

Eine App, um die eigene Steam-Bibliothek einzusehen, den Spielfortschritt zu verfolgen und die geschätzte Restzeit bis zum Durchspielen zu sehen.

## Geplante Features

- Steam-Bibliothek anzeigen (Cover, Name, Spielzeit)
- Fortschritt pro Spiel (Achievements als Näherung)
- Geschätzte Zeit bis zum Durchspielen (Spielzeit vs. durchschnittliche Dauer, z. B. HowLongToBeat)
- Sortieren/Filtern (nach Fortschritt, Restzeit, zuletzt gespielt)

## Datenquellen

- Steam Web API: `IPlayerService/GetOwnedGames`, `ISteamUserStats/GetPlayerAchievements`
- Durchspielzeit: HowLongToBeat (inoffiziell, kein offizielles API)

## Setup

1. Steam-API-Key holen: https://steamcommunity.com/dev/apikey
2. `.env.example` nach `.env` kopieren und `STEAM_API_KEY` sowie `STEAM_ID` eintragen
3. Steam-Profil muss auf "Öffentlich" stehen (Spieldetails)

## Status

Frühes Planungsstadium.
