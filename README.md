# Factory Defense

> A roguelite tower defense web game - Robot factory defense in vanilla JavaScript

**Status**: Pre-implementation planning  
**Tech Stack**: Vanilla JS + HTML5 Canvas (no frameworks)  
**Target Platform**: Web (GitHub Pages)

---

## Quick Start

```bash
# Run local dev server
python3 -m http.server 3456

# Open browser
open http://localhost:3456
```

---

## Documentation

- **[SPEC.md](SPEC.md)** - Full game design specification
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture index & navigation
- **[docs/VANILLA_JS_SETUP.md](docs/VANILLA_JS_SETUP.md)** - Vanilla JS architecture guide
- **[docs/VISUAL_CONFIG_SUMMARY.md](docs/VISUAL_CONFIG_SUMMARY.md)** - Canvas rendering & visual config approach

---

## Core Concept

Control a stationary robot defending a factory from waves of enemies. Earn scrap to upgrade machines during each run. Between runs, spend skill points on permanent upgrades.

**Target Loop**: Die → Upgrade → Retry → Progress Further  
**Session Length**: 2-5 minutes per run

---

## Technology Choices

**Vanilla JavaScript** - No React, no build tools (Phase 1)
- Faster prototyping
- Zero dependencies
- Perfect for GitHub Pages
- Can add React later if UI complexity demands it

**HTML5 Canvas** - For game rendering
- 12x12 grid-based gameplay
- 60fps target performance

---

## Phase 1 Goals (Current)

- [ ] Grid rendering system
- [ ] Robot entity with auto-attack
- [ ] Basic enemy with pathfinding
- [ ] Wave spawning system
- [ ] Projectile collision & damage
- [ ] Factory health & loss condition
- [ ] Basic HUD & scrap economy
- [ ] Energy machine with 3 upgrade levels

**Deliverable**: Playable 5-wave demo

---

## Contributing

This is a solo project following strict architectural principles. See:
- `.cursor/rules/` for AI collaboration protocols
- `docs/architecture/` for detailed architecture docs

---

## License

[TBD]
