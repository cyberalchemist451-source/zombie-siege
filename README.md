# 🧟 Zombie Siege

A browser-based 3D wave survival game built with Next.js, React Three Fiber, and Zustand.

## Features

- **Wave-based zombie survival** — fight off increasingly large waves of normal zombies and brutes
- **Staggered spawning** — waves with 20+ enemies spawn in batches of 20 every 40 seconds to keep performance smooth
- **Spell system** — unlock and upgrade Fireball, Lightning, Frostbolt, and Shadowbolt with tiered effects
  - Lightning chains between enemies with vivid arcing bolt visuals (glow fringe, fork branch, impact flash)
  - Fireball AOE explosions at higher tiers
  - Frostbolt slows/chills nearby enemies
  - Shadowbolt applies damage-over-time that spreads on death
- **Skill tree** — spend skill points on spells, HP, damage, and speed upgrades
- **Pause / Resume** — press `P` or click the Pause button at any time
- **Third-person 3D camera** — lock/unlock with `C`, drag to orbit, scroll to zoom

## Controls

| Key | Action |
|-----|--------|
| `W A S D` / Arrow Keys | Move |
| `Q / E` | Strafe left / right |
| `Mouse click` | Shoot crossbow |
| `1 / 2 / 3 / 4` | Cast spells |
| `Tab` | Cycle / lock target |
| `Esc` | Clear target |
| `C` | Toggle camera lock |
| `P` | Pause / Resume |

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js 16](https://nextjs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Three.js](https://threejs.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- TypeScript
