# Core Architectural Principles

> **Purpose**: The 4 foundational principles that guide all implementation decisions
> 
> **When to read**: Before writing any code, when making architectural decisions

---

## Overview

These principles are **non-negotiable** and must be followed from Phase 1 onwards. They enable Phase 2 features to be added without refactoring Phase 1 code.

---

## 1. State Separation (CRITICAL)

**Run State** and **Persistent State** must be completely separate from day one.

This creates the **dual progression loop** that defines the game:
- **Strategic Meta-Progression**: Permanent robot upgrades (skills, parts)
- **Tactical Run Management**: Temporary machine upgrades (always reset to 0)

```javascript
// Within-Run State (resets each game - NEVER persisted)
const runState = {
  currentWave: 1,
  factoryHealth: 20,
  scrap: 0,                                    // ❌ Lost at run end
  machineUpgrades: { energy: 0, heat: 0, pressure: 0 }, // ❌ Always reset to 0
  enemies: [],
  projectiles: []
};

// Persistent State (survives between runs - saved to localStorage)
const playerProfile = {
  skillPoints: { total: 0, spent: {} },        // ✅ Persists
  equippedParts: { weapon: null, utility: null, passive: null }, // ✅ Persists
  unlockedParts: [],                           // ✅ Persists
  statistics: { highestWave: 0, totalRuns: 0, enemiesKilled: 0 } // ✅ Persists
};
```

### When each state is modified:
- **PlayerProfile**: Modified in pre-run menu (spend skill points, equip parts) and at run end (earn XP/parts)
- **RunState**: Created fresh at run start, modified during gameplay, **discarded** at run end

### Why this matters:
Phase 2 progression systems plug in seamlessly without refactoring. The "chore layer" of rebuilding machines each run adds strategic depth.

---

## 2. Modifier-Based Stats

All entity stats use **base + modifiers** pattern for extensibility.

```javascript
class Robot {
  constructor(baseStats, permanentModifiers = {}, temporaryModifiers = {}) {
    this.baseStats = { damage: 10, fireRate: 1, range: 200, health: 100 };
    this.permanentModifiers = permanentModifiers; // From skills+parts (locked at run start)
    this.temporaryModifiers = temporaryModifiers; // From machines (change during run)
  }
  
  getActualStat(statName) {
    const base = this.baseStats[statName];
    const permanent = this.permanentModifiers[statName] || 0; // Set at run start, never changes
    const temporary = this.temporaryModifiers[statName] || 0; // Updated when machines upgrade
    return base + permanent + temporary;
  }
}
```

### Modifier Timeline:
- **Base**: Never changes (hardcoded in config)
- **Permanent**: Set once at run start from PlayerProfile, then **locked** for entire run
- **Temporary**: Updated during gameplay when machines are upgraded

### Why this matters:
Skill tree upgrades and machine upgrades use same system, no refactoring needed. Clear separation between locked (permanent) and dynamic (temporary) bonuses.

---

## 3. Event-Driven Communication

Systems communicate via event bus, not direct method calls.

```javascript
// Good: Decoupled
eventBus.emit('enemy:killed', { enemyId: 123, scrapValue: 10 });

// Bad: Tight coupling
scrapManager.addScrap(10);
waveManager.decrementEnemyCount();
statsTracker.incrementKills();
```

### Why this matters:
Features can be added/removed without breaking existing systems.

### Example Flow:
```
Enemy dies
    │
    ├──► CombatSystem detects collision, calls enemy.takeDamage()
    │
    └──► Enemy.die() emits 'enemy:killed' event
            │
            ├──► ScrapManager hears event → adds scrap
            ├──► WaveSystem hears event → decrements enemy count
            ├──► StatTracker hears event → increments kills
            └──► VFXSystem hears event → spawns death animation
```

### Benefits:
- Add new listeners without modifying existing code
- Features can be enabled/disabled easily
- Clear separation of concerns

See [Communication Patterns](05-communication-patterns.md) for detailed usage.

---

## 4. Configuration Over Hardcoding

All tuning values live in central config, never inline.

```javascript
// Good
if (distance < CONFIG.ROBOT.ATTACK_RANGE) { }

// Bad
if (distance < 200) { } // What is 200? Where does it change?
```

### Rules:
1. **Never hardcode numbers** - if you type a number twice, it goes in config
2. **Group logically** - related values stay together
3. **Comment units** - specify pixels, seconds, percentages
4. **Version changes** - track config changes in git commits

### Why this matters:
Easy balancing, clear documentation, no magic numbers scattered through code.

See [Configuration Management](09-configuration.md) for complete config structure.

---

## Principle Violations = Technical Debt

If you find yourself:
- ❌ Mixing temporary and permanent state in same object
- ❌ Hardcoding stat calculations instead of using modifiers
- ❌ Direct method calls between systems instead of events
- ❌ Magic numbers in implementation code

**STOP** and refactor immediately. These violations compound and make Phase 2 painful.

---

## Next Steps

- Understand system relationships: [System Overview](02-system-overview.md)
- See principles in action: [Data Architecture](03-data-architecture.md)
- Review concrete patterns: [Critical Design Patterns](07-critical-patterns.md)
