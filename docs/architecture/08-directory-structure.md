# Directory Structure

> **Purpose**: File organization and naming conventions
> 
> **When to read**: Creating new files, organizing codebase, onboarding

---

## Complete Structure

```
factory-defense/
├── src/
│   ├── core/
│   │   ├── EventBus.js               # Central event system
│   │   ├── GameLoop.js               # Main game loop, orchestrates systems
│   │   └── InputHandler.js           # Keyboard/mouse/touch input
│   │
│   ├── state/
│   │   ├── RunState.js               # Phase 1: Within-run state
│   │   └── PlayerProfile.js          # Phase 2: Persistent state
│   │
│   ├── entities/
│   │   ├── Robot.js                  # Player robot entity
│   │   ├── Enemy.js                  # Enemy entity
│   │   └── Projectile.js             # Projectile entity (or in CombatSystem)
│   │
│   ├── systems/
│   │   ├── CombatSystem.js           # Projectiles, collisions, damage
│   │   ├── WaveSystem.js             # Wave spawning and management
│   │   ├── MachineSystem.js          # Machine upgrades
│   │   ├── ScrapManager.js           # Currency management
│   │   ├── PathfindingSystem.js      # A* pathfinding
│   │   ├── PlayerProfileManager.js   # Phase 2: Persistence
│   │   └── SkillTreeSystem.js        # Phase 2: Skill management
│   │
│   ├── rendering/
│   │   ├── Renderer.js               # Main renderer (orchestrator)
│   │   ├── GridRenderer.js           # Grid, tiles (Phase 1 Step 2)
│   │   ├── RobotRenderer.js          # Robot rendering (Phase 1 Step 3)
│   │   ├── EnemyRenderer.js          # Enemy rendering (Phase 1 Step 4)
│   │   ├── ProjectileRenderer.js     # Projectiles (Phase 1 Step 5)
│   │   ├── MachineRenderer.js        # Machines (Phase 1 Step 6)
│   │   ├── UIRenderer.js             # HUD, buttons, overlays
│   │   └── VFXRenderer.js            # Phase 4: Particle effects
│   │
│   ├── ui/
│   │   ├── HUD.js                    # In-game HUD
│   │   ├── MainMenu.js               # Phase 2: Menu screen
│   │   ├── UpgradeScreen.js          # Phase 2: Skill tree UI
│   │   ├── PartsInventory.js         # Phase 2: Parts management
│   │   └── GameOverScreen.js         # End screen
│   │
│   ├── utils/
│   │   ├── Math.js                   # Vector math, distance, etc.
│   │   ├── Collision.js              # Collision detection helpers
│   │   └── Pathfinding.js            # A* implementation
│   │
│   └── index.js                      # Entry point
│
├── config/
│   └── config.js                     # Central configuration (CRITICAL)
│
├── assets/
│   ├── sprites/
│   ├── audio/
│   └── fonts/
│
├── tests/
│   └── [unit tests]                  # Test files mirror src structure
│
├── docs/
│   ├── ARCHITECTURE.md               # Architecture index
│   └── architecture/
│       ├── README.md                 # Management guide
│       ├── 01-core-principles.md
│       ├── 02-system-overview.md
│       └── [...]
│
├── index.html                        # Entry HTML
├── package.json                      # Dependencies
├── README.md                         # Quick start guide
└── SPEC.md                           # Full game design spec
```

---

## Organization Principles

### By Responsibility, Not Type

✅ **Good** - Organized by what systems do:
```
/systems/
  ├── CombatSystem.js
  ├── WaveSystem.js
  └── MachineSystem.js
```

❌ **Bad** - Organized by technical role:
```
/managers/
  ├── CombatManager.js
  ├── WaveManager.js
  └── MachineManager.js
```

### File Size Limits

- **Target**: < 200 lines per file
- **Refactor at**: 300 lines
- **Hard limit**: 400 lines

**When file grows**:
1. Identify distinct responsibilities
2. Extract into separate files
3. Update this document
4. Update imports

### Naming Conventions

**Files**:
- PascalCase for classes: `EnemySystem.js`, `Robot.js`
- camelCase for utilities: `pathfinding.js`, `collision.js`
- Descriptive, not abbreviated: `ConfigurationManager.js` not `CfgMgr.js`

**Directories**:
- Plural for collections: `entities/`, `systems/`
- Singular for singletons: `state/`, `rendering/`
- lowercase with hyphens if multi-word: `player-ui/`

---

## Directory Purpose

### `/src/core/`
**Foundation systems** that everything else depends on.
- EventBus, GameLoop, InputHandler
- Zero game logic, pure infrastructure

### `/src/state/`
**State management** classes.
- RunState (temporary)
- PlayerProfile (persistent)

### `/src/entities/`
**Game entities** - things that exist in the game world.
- Robot, Enemy, Projectile
- Have position, can be rendered, can interact

### `/src/systems/`
**Game systems** - logic that operates on entities.
- Combat, Waves, Machines, Scrap
- Usually manage collections of entities or state

### `/src/rendering/`
**Rendering systems** - draw things to canvas using Canvas 2D API.
- Keep render logic separate from game logic
- Each renderer handles one concern
- Read visual configs from config.js (colors, sizes, animations)
- Only contain drawing logic, no hardcoded visual values
- See: [Configuration Management - Visual Configuration](../architecture/09-configuration.md#visual-configuration-canvas-rendering)

### `/src/ui/`
**User interface** - menus, HUD, screens.
- DOM-based UI (not canvas)
- Vanilla JS DOM manipulation and event handling

### `/src/utils/`
**Utility functions** - pure helpers with no state.
- Math, collision detection, pathfinding algorithms
- Stateless, reusable across project

### `/config/`
**Configuration** - all tuning values and constants.
- Single source of truth for game balance
- See [Configuration Management](09-configuration.md)

### `/assets/`
**Game assets** - images, audio, fonts.
- Organized by type
- Loaded at runtime

### `/tests/`
**Unit tests** - mirror src structure.
```
/tests/
  /systems/
    CombatSystem.test.js
  /entities/
    Robot.test.js
```

### `/docs/`
**Documentation** - architecture and guides.
- Modular, split by concern
- Always up-to-date with code

---

## Adding New Files

### Checklist

Before creating a new file:
1. **Identify responsibility** - What does this do?
2. **Find correct directory** - Where does it belong?
3. **Check for duplication** - Does similar file exist?
4. **Name descriptively** - Clear what it contains?
5. **Update this document** - Add to structure above

### Example: Adding New Enemy Type

❌ **Wrong approach**:
```
Create /src/entities/FastEnemy.js
Create /src/entities/TankEnemy.js
Create /src/entities/BossEnemy.js
```

✅ **Right approach**:
```
Add to CONFIG.ENEMIES in config/config.js
Use existing /src/entities/Enemy.js
Enemy class reads from config
```

See [Critical Patterns](07-critical-patterns.md#pattern-3-config-driven-entities)

---

## File Splitting Strategy

### When to Split

A file needs splitting if:
- Exceeds 300 lines (warning)
- Exceeds 400 lines (must split)
- Does multiple unrelated things
- Hard to navigate/understand

### How to Split

**Example**: `CombatSystem.js` grows to 600 lines

**Before**:
```
/systems/
  └── CombatSystem.js (600 lines)
      - Projectile management
      - Collision detection
      - Damage calculation
      - AoE effects
```

**After**:
```
/systems/combat/
  ├── CombatSystem.js (150 lines) - Orchestrator
  ├── ProjectileManager.js (150 lines)
  ├── CollisionDetector.js (150 lines)
  └── DamageCalculator.js (150 lines)
```

Update imports and this document.

---

## Import Conventions

### Absolute vs Relative

**Use relative imports** for nearby files:
```javascript
// In /src/systems/MachineSystem.js
import { ScrapManager } from './ScrapManager.js';
import { CONFIG } from '../config/config.js';
```

**Use absolute imports** from root for common utilities:
```javascript
// If using module resolution
import { EventBus } from '@/core/EventBus';
import { CONFIG } from '@/config/config';
```

### Import Order

```javascript
// 1. Core/infrastructure
import { EventBus } from './core/EventBus.js';
import { CONFIG } from './config/config.js';

// 2. Systems
import { ScrapManager } from './systems/ScrapManager.js';

// 3. Entities
import { Robot } from './entities/Robot.js';

// 4. Utils
import { distance } from './utils/Math.js';
```

---

## Related Documentation

- See what goes in files: [Component Responsibilities](04-component-responsibilities.md)
- Understand organization principles: [Core Principles](01-core-principles.md)
- See config structure: [Configuration Management](09-configuration.md)
