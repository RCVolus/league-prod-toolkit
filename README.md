# Features

## Production Features

- Manage and dynamically update lower thirds for casters
- Track matchups and scores to automatically generate overlays for ingame, talks and breaks
- Apply consistent theming across all generated overlays
- Twitch integration to create predictions and show state in stream (requires a [Twitch-App](https://dev.twitch.tv/console/apps))

## League Features

### Pregame

- Lobby information with all players and op.gg links
- Custom Champ Select overlay (Implementation of [lol-pick-ban-ui](https://github.com/RCVolus/lol-pick-ban-ui))
- Recording and Replay of Champselect
- Rune overview (to kill time during spectator delay, game needs to be live)

### Ingame

- Custom Scoreboard
- Leader boards for Gold and Level + XP
- Animations for level ups and item purchases
- Animations for events (Baron | Dragons | Herald)
- Custom killfeed
- Power-Play timer for Baron ann Elder Dragon
- Inhibitor timers

### Postgame

Screens showing postgame stats

- Overview
- Pick order
- Item builds
- Damage graphs
- Gold graph

## Valorant Features
**Status 13.03.2023: VALORANT features are currently not maintained. While we focus on League, we will not actively support Valorant Features of the toolkit.**

### Pregame

- Custom Agent select overlay
- Loading screen overlay

### Postgame

- Stats for the winning team
- MVP screen

# Requirements & Limitations

- Champion Select / ingame overlays require our [Observer Tool](https://github.com/RCVolus/league-observer-tool) to send game data
- Some features require a Riot API Key
- Some features do not work on Tournament Realm

# Installation & Docs

- [Installation Guide](https://github.com/RCVolus/league-prod-toolkit/wiki/1.-Installation)
- [User Guide](https://github.com/RCVolus/league-prod-toolkit/wiki/2.-Using-Prod-Toolkit)
- [Customisation Guide](https://github.com/RCVolus/league-prod-toolkit/wiki/3.-Customisation)

# Troubleshooting & Help

Some common issues are listed in the [Wiki](https://github.com/RCVolus/league-prod-toolkit/wiki/FAQ).

If your problem is not listed in the Wiki, please check if there are any [open issues](https://github.com/RCVolus/league-prod-toolkit/issues). If not, open a [new issue](https://github.com/RCVolus/league-prod-toolkit/issues/new/choose) and include any error messages you see and steps to reproduce the problem.

# About Prod Toolkit

## Architecture/Sample setup

This shows the prod toolkit running on a dedicated server, with observer PCs sending data and overlays integrated into OBS/vMix with a browser source.

![Example Setup](Architecture.png)

Legend:

- Magenta - Clients running the observer tool
- Blue - The prod-toolkit
- Green - An external API that is being connected to
- Grey - Prod-toolkit interfaces

## Developing

The developer documentation can be found in the [wiki](https://github.com/RCVolus/league-prod-toolkit/wiki/4.-Developer-Documentation).

### Legal Disclaimer

league-prod-toolkit was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
