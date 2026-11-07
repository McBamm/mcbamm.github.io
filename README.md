# GM Tracker – 5e Monsters & NPCs

A React + TypeScript (Vite) web app for D&D 5th Edition Game Masters to add, edit and track monsters and NPCs using the standard 5e stat block format. All data is stored in your browser's `localStorage` – no backend.

## Features

- Add / edit / duplicate / delete monsters and NPCs (two samples are seeded on first run)
- Full 5e stat block fields: name, size, type, alignment, AC, HP + hit dice, speed, six ability scores, saving throws, skills, damage vulnerabilities/resistances/immunities, condition immunities, senses, languages, challenge rating, traits, actions, bonus actions, reactions, legendary actions
- Auto-calculated: ability modifiers, saving throw and skill bonuses (proficiency and expertise), passive Perception, XP from CR, proficiency bonus from CR, average HP from hit dice
- Combat tracker: current HP, temp HP (absorbs damage first), conditions, initiative
- Search, Monster/NPC filter, and sorting by name, CR or initiative
- Stat-block-style display

## Run

Requires Node.js 18+.

```sh
npm install
npm run dev      # http://localhost:5173
```

## Deploy to GitHub Pages

The app is deployed to the user site <https://mcbamm.github.io> by `.github/workflows/deploy.yml` on every push to `main`.

1. Push this repo to `McBamm/mcbamm.github.io` (`main` branch).
2. In that repo, go to **Settings > Pages** and set **Source** to **GitHub Actions**.

> **Warning:** the existing site content in `McBamm/mcbamm.github.io` (if any) will be replaced by this app. Back it up first.

## Build and test

```sh
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
npm test         # Vitest unit and component tests
```

## Notes

Data lives only in the browser it was entered in. Clearing site data removes it.
