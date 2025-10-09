# Implementation Phases

> **Purpose**: Phase-by-phase roadmap with task breakdowns
> 
> **When to read**: Planning work, understanding current phase, preparing for handoffs

---

## Overview

Development is split into 6 phases, each building on the previous. **Phase 1 is MVP focus.**

---

## Phase 1: Core MVP (Weeks 1-3)

**Goal**: Playable 5-wave single-run loop with basic systems

**Implementation Order** (each step should be tested before proceeding):

### 1. Setup & Infrastructure (~1 day)
- [ ] Project structure (see [Directory Structure](08-directory-structure.md))
- [ ] EventBus implementation
- [ ] Config file with foundation visual config (colors, basic sizes)
- [ ] Basic HTML/Canvas setup
- [ ] Game loop (requestAnimationFrame)
- [ ] Test: Game loop running, console shows frame updates

**Visual Foundation Setup**:
- Define core color palette (PRIMARY, DANGER, SUCCESS, WARNING, BACKGROUND)
- Define basic environment colors (FLOOR, WALL, PATH, GRID_LINE)
- Define basic UI colors (text, background, borders)
- Define base visual properties (TILE_SIZE, GRID_SIZE)
- **See**: [Configuration Management - Visual Configuration](09-configuration.md#visual-configuration-canvas-rendering)

**Deliverable**: ~80 lines of foundation config establishing visual theme

### 2. Grid & Rendering (~2 days)
- [ ] Grid data structure (12x12)
- [ ] GridRenderer implementation (canvas drawing)
- [ ] Tile rendering (floor, walls, path)
- [ ] Camera/viewport system
- [ ] Test: Can see rendered grid

**Visual Config**: Add grid-specific properties if needed (PATH_MARKER color, etc.)

### 3. Robot Entity (~2 days)
- [ ] Robot class with modifier pattern
- [ ] RobotRenderer implementation (canvas drawing)
- [ ] Manual target selection (click handler)
- [ ] Test: Robot appears, can click to select targets

**Visual Config**: Add ROBOT_BODY, ROBOT_ACCENT colors + ROBOT_SIZE, ROBOT_WEAPON_LENGTH

### 4. Basic Enemy (~3 days)
- [ ] Enemy class
- [ ] Pathfinding (A* algorithm)
- [ ] Enemy movement along path
- [ ] EnemyRenderer implementation (canvas drawing)
- [ ] Test: Enemy spawns, walks to goal

**Visual Config**: Add ENEMY_SCOUT color only + ENEMY_SIZE, ENEMY_HEALTH_BAR properties
**Note**: Only Scout enemy in Phase 1. Don't add Grunt/Tank/Swarm yet.

### 5. Combat System (~3 days)
- [ ] Projectile spawning
- [ ] Projectile movement
- [ ] Collision detection
- [ ] Damage application
- [ ] ProjectileRenderer implementation (canvas drawing)
- [ ] Test: Robot shoots, enemy takes damage and dies

**Visual Config**: Add PROJECTILE_BASIC color + PROJECTILE_SIZE, MUZZLE_FLASH_SIZE

### 6. Economy & Machines (~3 days)
- [ ] ScrapManager
- [ ] Machine upgrade UI
- [ ] Machine bonus application
- [ ] Energy machine (3 levels)
- [ ] MachineRenderer implementation (canvas drawing)
- [ ] Test: Kill enemies → earn scrap → upgrade machine → see stat increase

**Visual Config**: Add ENERGY_BASE, ENERGY_GLOW colors + MACHINE_SIZE, MACHINE_CORE_SIZE
**Note**: Only Energy machine in Phase 1. Don't add Heat/Pressure yet.

### 7. Wave System (~2 days)
- [ ] WaveSystem with timer
- [ ] Wave definitions (5 test waves)
- [ ] Wave start/complete logic
- [ ] Test: Waves spawn automatically with increasing difficulty

### 8. Win/Loss Conditions (~2 days)
- [ ] Factory health tracking
- [ ] Enemy reaching goal damages factory
- [ ] Game over screen
- [ ] Test: Factory health reaches 0 → game over

### 9. HUD & Polish (~2 days)
- [ ] Wave counter
- [ ] Factory health display
- [ ] Scrap counter
- [ ] Machine upgrade buttons
- [ ] Test: All info visible and updating

**Deliverable**: Playable 5-wave demo with Energy machine upgrades

### Handoff Checklist: Phase 1 → Phase 2
- [ ] All Phase 1 items working and tested
- [ ] RunState completely separate from any persistent data
- [ ] Robot using modifier pattern (base + permanent + temporary)
- [ ] Config file has all magic numbers extracted
- [ ] Event bus has clear event naming conventions
- [ ] Files are all under 300 lines
- [ ] This documentation updated with actual file locations

---

## Phase 2: Progression Systems (Weeks 4-5)

**Goal**: Roguelite loop with skill points and parts

**Prerequisites**: Phase 1 complete and tested

### 1. Data Structures (~1 day)
- [ ] PlayerProfile class
- [ ] Persistence adapter (localStorage)
- [ ] Save/load functions
- [ ] Test: Data persists between page refreshes

### 2. XP & Skill Points (~2 days)
- [ ] XP calculation (waves survived, enemies killed)
- [ ] XP → Skill Points conversion
- [ ] Update profile on run end
- [ ] Test: Complete run → earn skill points

### 3. Upgrade Screen UI (~3 days)
- [ ] Pre-run menu system
- [ ] Skill tree UI (simple list initially)
- [ ] Skill unlock buttons
- [ ] Visual feedback for unlocks
- [ ] Test: Spend skill points → see upgrades

### 4. Skill Application (~2 days)
- [ ] SkillTreeSystem
- [ ] Calculate permanentModifiers from skills
- [ ] Pass modifiers to Robot on run start
- [ ] Test: Unlock skill → start run → robot is stronger

### 5. Parts System (~3 days)
- [ ] Parts database in config
- [ ] Parts inventory UI
- [ ] Equip/unequip functionality
- [ ] Part drop logic (random from wave completion)
- [ ] Test: Complete wave → get part → equip → see bonus

**Deliverable**: Full roguelite loop with power progression

### Handoff Checklist: Phase 2 → Phase 3
- [ ] Player can accumulate and spend skill points
- [ ] Parts can be equipped and provide bonuses
- [ ] Progression feels meaningful (noticeable power increase)
- [ ] Data saves and loads correctly
- [ ] Files still under 300 lines (split if needed)
- [ ] Clear separation maintained between RunState and PlayerProfile

---

## Phase 3: Full Machine System & Enemy Variety (Weeks 6-7)

**Goal**: Strategic depth through machine choices and enemy types

- [ ] Implement Heat and Pressure machines
- [ ] Machine-specific attack effects:
  - Energy: Fire rate boost
  - Heat: DoT (damage over time) on hit
  - Pressure: Increased damage/knockback
- [ ] Add 3 more enemy types (Grunt, Tank, Swarm)
- [ ] Balance wave compositions (varied enemy mixes)
- [ ] Boss wave logic (spawn mini-boss every 5 waves)
- [ ] 2-3 boss enemy types with unique behaviors

**Deliverable**: Strategic machine upgrade decisions matter, enemy variety requires adaptation

See [SPEC.md Phase 3](../../SPEC.md#phase-3-full-machine-system--enemy-variety-weeks-6-7) for details.

---

## Phase 4: Special Abilities & Polish (Weeks 8-9)

**Goal**: High-impact player agency and juice

- [ ] Design 3-4 special abilities
- [ ] Implement ability cooldowns and manual activation
- [ ] Proximity blast AoE system
- [ ] Visual effects (explosions, machine glows, hit flashes)
- [ ] Sound effects (attacks, upgrades, enemies)
- [ ] Background music loop
- [ ] Particle effects for attacks and deaths
- [ ] Screen shake and impact feedback

**Deliverable**: Game feels satisfying and impactful to play

See [SPEC.md Phase 4](../../SPEC.md#phase-4-special-abilities--polish-weeks-8-9) for details.

---

## Phase 5: Content & Balance (Weeks 10-11)

**Goal**: 20-25 wave full game experience

- [ ] Create 5-7 map layouts
- [ ] Balance all 20-25 waves (difficulty curve)
- [ ] Add 5-10 more special parts (varied bonuses)
- [ ] Expand skill tree (10-15 total upgrades)
- [ ] Final boss design and implementation
- [ ] Victory screen with stats and rewards
- [ ] Defeat screen with progress summary
- [ ] Balance testing (ensure 2-5 minute runs)

**Deliverable**: Full game loop from first run to final boss victory

See [SPEC.md Phase 5](../../SPEC.md#phase-5-content--balance-weeks-10-11) for details.

---

## Phase 6: Responsive Design & QA (Weeks 12-13)

**Goal**: Polished cross-platform experience

- [ ] Responsive CSS breakpoints (mobile, tablet, desktop)
- [ ] Touch controls optimization
- [ ] Performance optimization (60fps target)
- [ ] Playtesting (balance tweaks, difficulty adjustments)
- [ ] Bug fixes
- [ ] Accessibility features (colorblind mode, audio cues)
- [ ] Tutorial/onboarding (first-time player experience)

**Deliverable**: Launch-ready web game

See [SPEC.md Phase 6](../../SPEC.md#phase-6-responsive-design--qa-weeks-12-13) for details.

---

## Current Phase Tracking

**Update this section as you progress**:

- **Current Phase**: Pre-implementation planning
- **Phase 1 Started**: [Date TBD]
- **Phase 1 Completed**: [Date TBD]
- **Phase 2 Started**: [Date TBD]
- ...

---

## Phase Transition Protocol

### Before Starting New Phase

1. Complete all checklist items from previous phase
2. Test all features thoroughly
3. Update this document with completion date
4. Review handoff checklist with team/AI
5. Commit and tag release (e.g., `v1.0-phase1-complete`)

### When Transitioning

1. Create new branch (e.g., `phase-2-development`)
2. Review phase goals and requirements
3. Break down tasks into daily work items
4. Update relevant architecture docs if patterns change

---

## Related Documentation

- See detailed component implementations: [Component Responsibilities](04-component-responsibilities.md)
- Understand data flow: [Data Architecture](03-data-architecture.md)
- Review complete spec: [SPEC.md](../../SPEC.md)
