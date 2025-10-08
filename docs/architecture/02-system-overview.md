# System Overview

> **Purpose**: High-level view of how all systems fit together
> 
> **When to read**: Understanding overall architecture, planning new features

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Game Application                   │
│  ┌───────────────────────────────────────────────┐  │
│  │          Menu System (Phase 2+)               │  │
│  │  - Main Menu                                  │  │
│  │  - Upgrade Screen (skill tree)                │  │
│  │  - Parts Inventory                            │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐  │
│  │              Game Loop (Phase 1)              │  │
│  │                                               │  │
│  │  ┌─────────────┐      ┌──────────────┐       │  │
│  │  │ Run State   │      │ Event Bus    │       │  │
│  │  │ Manager     │◄────►│ (Central Hub)│       │  │
│  │  └─────────────┘      └──────────────┘       │  │
│  │         │                    ▲                │  │
│  │         │                    │                │  │
│  │         ▼                    │                │  │
│  │  ┌─────────────┐      ┌──────────────┐       │  │
│  │  │ Systems     │      │ Renderer     │       │  │
│  │  │ - Robot     │      │ - Canvas     │       │  │
│  │  │ - Enemies   │      │ - UI/HUD     │       │  │
│  │  │ - Combat    │      │ - VFX        │       │  │
│  │  │ - Waves     │      └──────────────┘       │  │
│  │  │ - Machines  │                             │  │
│  │  └─────────────┘                             │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐  │
│  │       Persistence Layer (Phase 2)             │  │
│  │  - localStorage adapter                       │  │
│  │  - Profile save/load                          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## System Dependencies

```
┌──────────────┐
│   Config     │ ◄─── Everyone depends on Config
└──────────────┘
       ▲
       │
┌──────────────┐
│  Event Bus   │ ◄─── Most systems depend on Event Bus
└──────────────┘
       ▲
       │
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Robot System │      │ Enemy System │      │ Wave Spawner │
└──────────────┘      └──────────────┘      └──────────────┘
       │                      │                      │
       └──────────────────────┴──────────────────────┘
                              ▲
                              │
                    ┌──────────────────┐
                    │  Combat System   │
                    │  (collision,     │
                    │   damage, etc)   │
                    └──────────────────┘
```

### Dependency Rules:
1. **Config** - Zero dependencies, everyone depends on it
2. **EventBus** - Depends only on Config
3. **Systems** - Depend on Config + EventBus
4. **Entities** - Can depend on Config only (no EventBus dependency)

---

## System Layers

### Layer 1: Foundation
- **Config**: All tuning values
- **EventBus**: Communication infrastructure
- **InputHandler**: User input processing

### Layer 2: State Management
- **RunState**: Temporary game state (Phase 1)
- **PlayerProfile**: Persistent progression (Phase 2)

### Layer 3: Core Gameplay
- **Robot**: Player entity
- **Enemy**: Enemy entities
- **CombatSystem**: Projectiles, collisions, damage
- **WaveSystem**: Enemy spawning
- **MachineSystem**: Factory machine upgrades
- **ScrapManager**: Economy

### Layer 4: Progression (Phase 2+)
- **PlayerProfileManager**: Save/load persistence
- **SkillTreeSystem**: Skill point management
- **PartsSystem**: Special parts management

### Layer 5: Presentation
- **Renderer**: Orchestrates all rendering
- **GridRenderer**: Map/tiles
- **EntityRenderer**: Sprites
- **UIRenderer**: HUD/menus
- **VFXRenderer**: Effects (Phase 4)

---

## Data Flow: Complete Loop

```
┌─────────────────────────────────────────────────────────┐
│                 GAME INITIALIZATION                     │
│  1. Load Config                                         │
│  2. Create EventBus                                     │
│  3. Load PlayerProfile (Phase 2)                        │
│  4. Show Menu (Phase 2) OR Start Run (Phase 1)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   RUN START                             │
│  1. Calculate permanent modifiers (skills + parts)      │
│  2. Create fresh RunState                               │
│  3. Initialize Robot (base + permanent mods)            │
│  4. ⚠️ STATS LOCKED ⚠️                                  │
│  5. Load map, spawn robot                               │
│  6. Start game loop                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  GAME LOOP                              │
│  Every frame:                                           │
│  1. Process input                                       │
│  2. Update all systems (deltaTime)                      │
│     - Robot (targeting, firing)                         │
│     - Enemies (movement, pathfinding)                   │
│     - Combat (projectiles, collisions)                  │
│     - Waves (spawning)                                  │
│  3. Render frame                                        │
│  4. Check win/loss conditions                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   RUN END                               │
│  1. Calculate XP earned                                 │
│  2. Discard RunState (scrap, machines, etc)             │
│  3. Update PlayerProfile (XP, stats, parts)             │
│  4. Save to localStorage                                │
│  5. Show game over screen                               │
│  6. Return to menu OR restart                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     └──────► Return to INITIALIZATION
```

---

## Communication Flow Example

**Scenario**: Enemy reaches factory goal

```
1. Enemy.update() 
   └─► checkReachedGoal() returns true

2. Enemy.reachedGoal()
   └─► eventBus.emit('enemy:reached_goal', { enemy, damage: 5 })

3. Event listeners respond:
   ├─► FactoryHealthSystem: reduces factory health by 5
   ├─► WaveSystem: decrements active enemy count
   ├─► VFXSystem: spawns "breach" animation
   └─► AudioSystem: plays alarm sound

4. FactoryHealthSystem checks health
   └─► If health <= 0: eventBus.emit('game:over')

5. GameLoop hears 'game:over'
   └─► Triggers run end flow
```

**Key**: No direct calls between systems, all via events.

---

## System Initialization Order

Critical for avoiding race conditions:

```javascript
// 1. Config (always first)
import { CONFIG } from './config/config.js';

// 2. Event Bus
const eventBus = new EventBus();

// 3. State Managers
const runState = new RunState();
const playerProfile = PlayerProfileManager.load(); // Phase 2

// 4. Core Systems (order-independent due to events)
const scrapManager = new ScrapManager(eventBus);
const machineSystem = new MachineSystem(eventBus, scrapManager);
const combatSystem = new CombatSystem(eventBus);
const waveSystem = new WaveSystem(eventBus);

// 5. Entities (created on run start)
// Robot, Enemies created during game initialization

// 6. Renderer (last, needs everything else ready)
const renderer = new Renderer(eventBus, runState);

// 7. Start game loop
requestAnimationFrame(gameLoop);
```

---

## Phase Evolution

### Phase 1 (MVP)
- RunState only
- Core gameplay systems
- Single-run loop
- No persistence

### Phase 2 (Progression)
- Add PlayerProfile
- Add Menu system
- Add SkillTree + Parts systems
- Persistence layer

### Phase 3+ (Content)
- Additional machines (Heat, Pressure)
- More enemy types
- Boss waves
- Additional parts

See [Implementation Phases](06-implementation-phases.md) for detailed roadmap.

---

## Related Documentation

- See individual system details: [Component Responsibilities](04-component-responsibilities.md)
- Understand event flow: [Communication Patterns](05-communication-patterns.md)
- View file organization: [Directory Structure](08-directory-structure.md)
