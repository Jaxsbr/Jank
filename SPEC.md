# Factory Defense - Game Development Specification

## 1. Executive Summary

**Game Title**: Factory Defense  
**Genre**: Roguelite Tower Defense  
**Platform**: Web-based (responsive design)  
**Session Length**: 2-5 minutes per run  
**Target Loop**: Die → Upgrade → Retry → Progress Further

### High-Level Concept
Players control a stationary robot defending a factory from waves of enemies. Through repeated playthroughs, players accumulate permanent upgrades (skill points and special parts) that make subsequent runs more powerful. Within each run, players earn scrap to upgrade factory machines that enable and enhance combat abilities. Success requires balancing machine upgrades, managing cooldown abilities, and strategic target prioritization.

---

## 2. Core Gameplay Systems

### 2.1 Player Robot

**Position & Control**:
- Stationary position on 12x12 grid (location determined by map layout)
- Auto-attacks nearest enemy within range
- Manual target override available (click/tap enemy)
- Manual activation of special abilities on cooldown

**Combat Mechanics**:
- **Basic Attack**: Ranged projectile with base damage and fire rate
- **Proximity Blast**: Area-of-effect damage around robot
- **Special Abilities**: High-impact attacks with cooldowns (requires separate design session)
  - Examples: Laser beam, EMP pulse, missile barrage
  - Reserved for critical moments (boss waves, overwhelming hordes)

**Stats (Upgradeable via Skill Points)**:
- Damage (base attack power)
- Fire Rate (attacks per second)
- Range (attack radius)
- Health/Durability
- Ability Cooldown Reduction
- Area of Effect Size (for proximity blasts)

### 2.2 Enemy System

**Behavior**:
- Spawn at designated start point(s) marked 's'
- Pathfind to factory finish point marked 'f'
- A* or similar algorithm required (map layouts vary per run)
- No collision with other enemies (can overlap/pass through)

**Enemy Types** (Initial Set):
1. **Scout**: Fast, low HP, low damage to factory
2. **Grunt**: Medium speed, medium HP
3. **Tank**: Slow, high HP, high damage to factory
4. **Swarm**: Very fast, very low HP, spawns in groups

**Future Consideration**: Special behaviors (flying, teleporting, shielded)

**Wave Structure**:
- Waves spawn on fixed time intervals (e.g., every 15-20 seconds)
- Wave difficulty increases: more enemies, tougher compositions
- Boss waves every X waves (e.g., every 5 waves)
- Final boss wave as ultimate challenge

### 2.3 Factory Machines

**Purpose**: Upgraded within a run using scrap; enable and enhance robot abilities

**Machine Types**:

| Machine | Function | Upgrade Levels |
|---------|----------|----------------|
| **Energy** | Determines attack speed / fire rate multiplier | 3-5 levels |
| **Heat** | Enables/enhances fire/melting damage over time effects | 3-5 levels |
| **Pressure** | Provides strength for heavy/explosive attacks | 3-5 levels |

**Upgrade Mechanics**:
- Each machine has multiple levels (suggest 3-5)
- Scrap cost increases per level (e.g., 50, 100, 200, 400)
- Visual changes required for each upgrade level
- Upgrades reset at start of each new run

**Strategic Layer**:
- Player must choose which machine to prioritize based on:
  - Current enemy wave composition
  - Scrap availability
  - Upcoming boss wave preparation
  - Synergy with equipped special parts

### 2.4 Grid & Map System

**Grid Specifications**:
- 12x12 tile grid
- Tile types:
  - Path (0): Walkable by enemies
  - Wall (-/|): Blocks pathfinding
  - Start (s): Enemy spawn points
  - Finish (f): Factory goal (loss condition)
  - Machine tiles (e/h/p): Energy, Heat, Pressure locations
  - Robot position (1): Player robot location

**Map Layouts**:
- Fixed initially for MVP
- Each new run selects from pool of hand-crafted layouts
- Future: Procedural generation with guaranteed solvable paths
- Pathfinding required (enemies must adapt to different layouts)

**Example Layout**:
```
| s s | - - - - - - - |
| 0 0 | e 0 0 0 0 0 0 |
| 0 0 | e 0 0 0 0 0 0 |
| 0 0 0 0 0 0 1 1 0 0 |
| 0 0 0 0 0 0 1 1 0 0 |
| - - - - - - - - 0 0 |
| h h h 0 0 0 0 0 0 0 |
| h h h 0 0 0 0 0 0 0 |
| - - - 0 0 - - - - - |
| p p p 0 0 0 0 0 0 0 f
| p p p 0 0 0 0 0 0 0 f
| - - - - - - - - - - |
```

---

## 3. Progression Systems

### 3.1 Within-Run Progression (Temporary)

**Scrap Currency**:
- Earned by destroying enemies (amount varies by enemy type)
- Used exclusively for machine upgrades **during the run**
- Does NOT carry over between runs
- **Strategic timing is critical**: upgrade early for economy vs. save for boss waves
- Creates decision points: upgrade now or save for higher tier?

**Machine Upgrades** (The "Chore Layer"):
- All machines **always start at level 0** each new run
- Player must rebuild machine infrastructure every run
- Adds strategic depth: which machine to prioritize when?
- Example: Wave 5 has frost boss → upgrade Heat machine to level 2 for damage boost
- Balancing act: invest in economy (early Energy upgrades) vs. survival (defensive upgrades)

**Experience/Level** (Optional):
- Within-run XP could unlock temporary buffs
- OR keep progression simple: scrap only

### 3.2 Between-Run Progression (Persistent)

**Skill Points**:
- Earned as XP during runs, converted to skill points
- Spent on permanent stat upgrades **in pre-run menu** (before clicking "Start Run")
- **Robot stats are locked once run starts** - no stat changes during gameplay
- Carries over between runs (accumulated total)
- These provide the **permanent power progression** of the roguelite loop
- Example skill tree:
  ```
  Damage Branch:
  - Base Damage +10% (1 point)
  - Critical Hit Chance 5% (2 points)
  - Armor Piercing (3 points)
  
  Speed Branch:
  - Fire Rate +15% (1 point)
  - Movement Speed +20% (if robot moves in future) (2 points)
  
  Survival Branch:
  - Max Health +25% (1 point)
  - Health Regeneration (2 points)
  - Shield (3 points)
  
  Utility Branch:
  - Ability Cooldown -10% (1 point)
  - Range +20% (2 points)
  - AoE Size +30% (2 points)
  ```

**Special Parts**:
- Rare drops from enemies or wave completion rewards
- Equippable bonuses (suggest 2-3 slots: weapon, utility, passive)
- Swap system: new part replaces old part in that slot
- Examples:
  - **Overclocked Servo**: +25% fire rate, -10% damage
  - **Reinforced Plating**: +50% health, -15% cooldown reduction
  - **Thermal Cores**: Heat attacks deal 30% more damage
  - **Chain Lightning Module**: Attacks jump to nearby enemies

**Persistent Data Structure**:
```javascript
playerProfile = {
  totalSkillPoints: 15,
  spentSkillPoints: {
    damage: 3,
    fireRate: 2,
    health: 1,
    // ...
  },
  equippedParts: {
    weapon: "Overclocked Servo",
    utility: "Chain Lightning Module",
    passive: "Reinforced Plating"
  },
  unlockedParts: ["part1", "part2", ...],
  highestWaveReached: 12,
  bossesDefeated: 2
}
```

### 3.3 Game Session Flow (Critical Understanding)

This section clarifies **WHEN** each type of upgrade happens:

```
┌─────────────────────────────────────────────────────────┐
│               PRE-RUN MENU (Phase 2+)                   │
│                                                         │
│  Actions Available:                                     │
│  - View accumulated skill points                       │
│  - Spend skill points on permanent upgrades            │
│  - Equip/swap special parts                            │
│  - Review stats and progression                        │
│                                                         │
│  Then: Click "Start Run"                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  RUN INITIALIZATION                     │
│                                                         │
│  What happens:                                          │
│  - Robot stats calculated: base + skill bonuses + part │
│    bonuses                                              │
│  - Robot stats LOCKED for entire run                   │
│  - All machines reset to level 0                       │
│  - Scrap reset to 0                                    │
│  - Map loaded                                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DURING RUN (Phase 1 Focus)                 │
│                                                         │
│  Player Actions:                                        │
│  - Kill enemies → earn scrap                           │
│  - Spend scrap → upgrade machines (strategic timing!)  │
│  - Manual target selection                             │
│  - Activate special abilities (Phase 4)                │
│                                                         │
│  Robot stats: UNCHANGED (machines provide temporary    │
│               modifiers only)                           │
│                                                         │
│  Strategic Decisions:                                   │
│  - Which machine to upgrade first?                     │
│  - Upgrade now or save for next machine level?         │
│  - Prepare for upcoming boss wave?                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    RUN ENDS                             │
│                                                         │
│  What happens:                                          │
│  - Calculate XP earned (waves survived, enemies killed)│
│  - Convert XP to skill points                          │
│  - Add to persistent profile                           │
│  - Display rewards and stats                           │
│  - Save profile to localStorage                        │
│                                                         │
│  What's lost:                                           │
│  - All scrap (resets to 0)                             │
│  - All machine upgrades (back to level 0)              │
│  - Run-specific state (enemies, projectiles, etc.)     │
│                                                         │
│  What persists:                                         │
│  - Skill points (available to spend next run)          │
│  - Special parts (if earned this run)                  │
│  - Statistics (high scores, total kills, etc.)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     └──────► Return to PRE-RUN MENU
```

**Key Takeaways**:
1. **Robot upgrades = Strategic meta-progression** (permanent, spend between runs)
2. **Machine upgrades = Tactical run management** (temporary, rebuild every run)
3. **Dual progression loop creates depth**: Get stronger across runs, but still need to execute well within each run

---

## 4. Win/Loss Conditions

### Loss Condition
- Factory has damage threshold (suggest 10-20 enemy breaches initially)
- Each enemy that reaches 'f' deals damage based on type:
  - Scout: 1 damage
  - Grunt: 2 damage
  - Tank: 5 damage
- UI shows factory health/integrity gauge
- On loss: return to upgrade menu with accumulated XP/skill points

### Win Condition
- Survive all waves and defeat final boss
- Boss waves occur every X waves (suggest every 5 waves)
- Final boss appears at wave Y (suggest wave 20-25 for full completion)
- Victory grants bonus rewards (XP, rare parts)

### Victory Screen
- Total waves survived
- Enemies destroyed
- Scrap earned
- XP earned → Skill points gained
- Parts collected (if any)
- "Play Again" or "Upgrade Robot"

---

## 5. Game Flow & UI/UX

### 5.1 Main Menu
- **Start Run**: Begin new game session
- **Upgrade Robot**: Spend skill points on permanent upgrades
- **Parts Inventory**: View/equip collected parts
- **Settings**: Audio, graphics quality, controls
- **Stats**: High scores, total runs, enemies defeated

### 5.2 Pre-Run Upgrade Screen
- Display available skill points
- Show skill tree with locked/unlocked nodes
- Equip special parts (drag-and-drop or click to swap)
- Confirm and start run

### 5.3 In-Game HUD
**Top Bar**:
- Wave counter (e.g., "Wave 7/20")
- Factory health/integrity gauge
- Scrap counter

**Side Panel** (or bottom on mobile):
- Machine upgrade buttons with costs
- Visual indicator of current machine levels
- Robot health bar
- Special ability cooldown timers

**Grid View**:
- Centered game grid with clear visibility
- Enemy health bars (small, above sprite)
- Projectile animations
- Damage numbers (optional)

### 5.4 Machine Upgrade Interface
- Click machine on grid to open upgrade panel
- Shows:
  - Current level
  - Next level benefits
  - Scrap cost
  - Visual preview of upgraded machine
- Confirm upgrade button
- Can upgrade mid-wave (pause optional for accessibility)

### 5.5 Responsive Design Considerations
**Desktop** (1920x1080+):
- Grid centered, side panels for upgrades/stats
- Keyboard shortcuts for abilities (1, 2, 3, etc.)
- Mouse click for targeting

**Tablet** (768px - 1024px):
- Grid scales down, bottom panel for upgrades
- Touch controls for targeting

**Mobile** (320px - 767px):
- Grid occupies majority of screen
- Compact HUD elements
- Swipe gestures for menu access
- Large touch targets for abilities

---

## 6. Technical Architecture

### 6.1 Core Technologies (Suggested)
- **Frontend**: Vanilla JS + Canvas (Phase 1), evaluate React for Phase 2+ if UI complexity requires it
- **Game Loop**: RequestAnimationFrame (custom game loop)
- **Rendering**: HTML5 Canvas 2D
- **Pathfinding**: A* algorithm implementation (custom)
- **State Management**: Plain JavaScript objects with event system
- **Persistence**: LocalStorage for player profile (skill points, parts)
- **Styling**: Vanilla CSS (responsive, no framework needed)
- **Animation**: Canvas-based rendering + CSS for UI overlays

### 6.2 Key Systems to Implement

**1. Game State Manager**
```javascript
gameState = {
  phase: "menu" | "playing" | "paused" | "gameOver" | "victory",
  currentWave: 1,
  factoryHealth: 20,
  scrap: 0,
  enemies: [...],
  projectiles: [...],
  machineStates: {
    energy: { level: 0, position: {x, y} },
    heat: { level: 0, position: {x, y} },
    pressure: { level: 0, position: {x, y} }
  },
  robot: {
    position: {x, y},
    health: 100,
    target: null,
    abilityCooldowns: {...}
  }
}
```

**2. Pathfinding System**
- Pre-calculate paths for each map layout
- Cache paths for performance
- Handle dynamic obstacles (if added later)

**3. Combat System**
- Attack range calculation
- Projectile physics (speed, collision detection)
- Damage calculation with machine modifiers
- AoE blast radius detection

**4. Wave Spawner**
- Timer-based wave generation
- Enemy composition tables per wave
- Boss wave logic (every X waves)

**5. Upgrade System**
- Skill point allocation logic
- Part equip/swap validation
- Machine upgrade state persistence within run

**6. Persistence Layer**
- Save player profile to localStorage
- Load profile on game start
- Auto-save after each run completion

---

## 7. Art & Visual Design Requirements

### 7.1 Visual Style Suggestions
- **Industrial/Factory Theme**: Gritty, mechanical aesthetic
- **Color Palette**: 
  - Energy: Blue/Electric
  - Heat: Orange/Red
  - Pressure: Yellow/Industrial
  - Enemies: Contrasting colors (red/purple)
  - Robot: Gray/Silver with accent colors
- **Grid**: Isometric OR top-down (recommend top-down for simplicity)

### 7.2 Asset List

**Sprites/Animations**:
- Robot (idle, attacking, damaged, special abilities)
- Enemy types (4 types × animations)
- Bosses (distinct designs per boss type)
- Machines (3 types × 3-5 upgrade states each = 9-15 variants)
- Projectiles (bullet, laser, explosions)
- Environmental tiles (floor, walls, path markers)

**UI Elements**:
- HUD frames and bars
- Buttons (upgrade, abilities, menu)
- Icons (scrap, XP, skill points, parts)
- Factory health gauge
- Wave counter display

**VFX**:
- Muzzle flashes
- Impact effects
- AoE blast rings
- Machine activation glows
- Death animations

### 7.3 Animation Requirements
- Robot attack cycle (200-300ms)
- Enemy movement (smooth pathfinding walk)
- Projectile travel (fast, visible)
- Machine upgrade transition (visual level-up effect)
- UI transitions (smooth menu fades)

---

## 8. Audio Design Requirements

### 8.1 Sound Effects
- Robot attack sounds (pew, blast, special abilities)
- Enemy sounds (spawning, death, reaching factory)
- Machine upgrade sound (power-up)
- UI interactions (click, hover, error)
- Scrap collection (pickup)
- Wave start/complete fanfare
- Boss entrance/defeat

### 8.2 Music
- Main menu theme (ambient, industrial)
- In-game combat loop (tense, rhythmic)
- Boss battle theme (intense, driving)
- Victory/defeat stingers

---

## 9. Implementation Priorities

### Phase 1: Core MVP (Weeks 1-3)
**Goal**: Playable single-run loop with basic systems

- [ ] Grid rendering system (12x12, tile types)
- [ ] Robot entity (stationary, auto-attack, manual target)
- [ ] Basic enemy (Scout type, pathfinding to goal)
- [ ] Wave spawner (timed intervals, 5 test waves)
- [ ] Projectile system (collision, damage)
- [ ] Factory health and loss condition
- [ ] Basic HUD (wave counter, factory health, scrap)
- [ ] One machine type (Energy) with 3 upgrade levels
- [ ] Scrap economy (earn from kills, spend on upgrades)

**Deliverable**: Can play through 5 waves, upgrade Energy machine, lose when factory health depletes.

---

### Phase 2: Progression Systems (Weeks 4-5)
**Goal**: Roguelite loop with persistent upgrades

- [ ] Skill point system (earn XP, convert to points)
- [ ] Pre-run upgrade screen (spend skill points)
- [ ] 3-5 basic permanent upgrades (damage, fire rate, health)
- [ ] Persistence layer (localStorage save/load)
- [ ] Special parts system (drop, collect, equip)
- [ ] 2-3 starter parts with simple bonuses
- [ ] Victory condition (reach wave 10)

**Deliverable**: Can replay multiple runs, accumulate skill points, equip parts, see progressive power increase.

---

### Phase 3: Full Machine System & Enemy Variety (Weeks 6-7)
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

**Deliverable**: Strategic machine upgrade decisions matter, enemy variety requires adaptation.

---

### Phase 4: Special Abilities & Polish (Weeks 8-9)
**Goal**: High-impact player agency and juice

- [ ] Design 3-4 special abilities (separate design session)
- [ ] Implement ability cooldowns and manual activation
- [ ] Proximity blast AoE system
- [ ] Visual effects (explosions, machine glows, hit flashes)
- [ ] Sound effects (attacks, upgrades, enemies)
- [ ] Background music loop
- [ ] Particle effects for attacks and deaths
- [ ] Screen shake and impact feedback

**Deliverable**: Game feels satisfying and impactful to play.

---

### Phase 5: Content & Balance (Weeks 10-11)
**Goal**: 20-25 wave full game experience

- [ ] Create 5-7 map layouts
- [ ] Balance all 20-25 waves (difficulty curve)
- [ ] Add 5-10 more special parts (varied bonuses)
- [ ] Expand skill tree (10-15 total upgrades)
- [ ] Final boss design and implementation
- [ ] Victory screen with stats and rewards
- [ ] Defeat screen with progress summary
- [ ] Balance testing (ensure 2-5 minute runs)

**Deliverable**: Full game loop from first run to final boss victory.

---

### Phase 6: Responsive Design & QA (Weeks 12-13)
**Goal**: Polished cross-platform experience

- [ ] Responsive CSS breakpoints (mobile, tablet, desktop)
- [ ] Touch controls optimization
- [ ] Performance optimization (60fps target)
- [ ] Playtesting (balance tweaks, difficulty adjustments)
- [ ] Bug fixes
- [ ] Accessibility features (colorblind mode, audio cues)
- [ ] Tutorial/onboarding (first-time player experience)

**Deliverable**: Launch-ready web game.

---

## 10. Design Sessions Required

### Session 1: Special Abilities Deep Dive
**Topics**:
- Define 3-5 unique special abilities
- Cooldown timings and balance
- Visual and gameplay impact
- Synergies with machines and parts
- Unlock progression (all available or unlocked via skill points?)

### Session 2: Boss Design
**Topics**:
- Boss archetypes (tank, swarmer, technical)
- Attack patterns and phases
- Visual designs
- Loot tables (guaranteed rare parts?)
- Difficulty scaling across multiple boss encounters

### Session 3: Map Layout Design
**Topics**:
- Handcraft 5-7 layouts with varying difficulty
- Path length and complexity balance
- Machine placement strategy
- Robot position optimization
- Future procedural generation rules

### Session 4: Balancing & Economy
**Topics**:
- Scrap earn rates vs. machine costs
- XP earn rates vs. skill point costs
- Part drop rates and power levels
- Wave difficulty curve
- Time-to-victory targets (ensure 2-5 min runs)

---

## 11. Success Metrics

**Player Engagement**:
- Average session length: 2-5 minutes
- Average runs per player: 10+ (indicates roguelite hook)
- Retention: 40%+ return within 24 hours

**Balance Indicators**:
- Wave 10 clear rate: 60-70% (mid-game checkpoint)
- Final boss clear rate: 15-25% (aspirational challenge)
- Machine upgrade diversity: No single machine dominates 80%+ of runs

**Technical Performance**:
- Load time: <3 seconds
- Frame rate: Consistent 60fps on target devices
- Mobile playable: 80%+ of users can complete tutorial

---

## 12. Future Expansion Ideas

*Post-launch considerations (not in initial scope):*

- **Daily Challenges**: Fixed seed runs with leaderboards
- **New Robot Types**: Unlock alternative robots with different playstyles
- **Endless Mode**: Survive as long as possible, leaderboard ranking
- **Multiplayer Co-op**: Two robots defending together
- **New Machine Types**: Introduce 4th/5th machine categories
- **Procedural Map Generation**: Algorithm-generated layouts
- **Prestige System**: Reset skill points for powerful meta-upgrades
- **Cosmetic Customization**: Robot skins, machine themes

---

## 13. Appendix: Reference Links

**Inspiration Games**:
- Vampire Survivors (roguelite progression)
- Bloons TD (tower defense mechanics)
- Hades (roguelite design excellence)
- Risk of Rain (item synergies)

**Technical References**:
- A* Pathfinding: [Red Blob Games Guide](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
- Game Loop Patterns: [Game Programming Patterns](https://gameprogrammingpatterns.com/game-loop.html)
- Roguelike Design: [RogueBasin Wiki](http://www.roguebasin.com/)

---

## Document Version
**Version**: 1.0  
**Date**: October 8, 2025  
**Status**: Ready for Development  
**Next Steps**: Begin Phase 1 implementation, schedule design sessions