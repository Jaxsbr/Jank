# Critical Design Patterns

> **Purpose**: Key patterns that enable Phase 2 features without refactoring Phase 1
> 
> **When to read**: Before implementing core systems, when making architectural decisions

---

## Pattern 1: Modifier Aggregation

**Problem**: Robot stats affected by multiple sources (skills, parts, machines)

**Solution**: Layered modifier system

```javascript
// Base stats (never change)
baseStats = { damage: 10, fireRate: 1.0 };

// Permanent modifiers (from skills + parts, calculated once per run)
permanentModifiers = { damage: +5, fireRate: +0.3 };

// Temporary modifiers (from machines, updated when machines upgrade)
temporaryModifiers = { fireRate: +0.5 };

// Actual stat = sum of all layers
actualDamage = 10 + 5 + 0 = 15
actualFireRate = 1.0 + 0.3 + 0.5 = 1.8
```

### Implementation

```javascript
class Robot {
  getActualStat(statName) {
    return this.baseStats[statName]
      + (this.permanentModifiers[statName] || 0)
      + (this.temporaryModifiers[statName] || 0);
  }
}
```

### Benefits
- Easy to debug (inspect each layer separately)
- Easy to extend (add new modifier sources)
- No refactoring needed between phases

### When to Use
- Any entity with upgradeable stats
- Any system where multiple sources affect same value
- Power progression systems

---

## Pattern 2: State Isolation

**Problem**: Must keep run state separate from persistent state

**Solution**: Two completely separate classes, bridged only at run start/end

```javascript
// Game initialization
const playerProfile = PlayerProfileManager.load(); // Persistent
const permanentMods = playerProfile.getAllModifiers(); // Calculate once

// Run start
const runState = new RunState(); // Fresh state
runState.robot = new Robot(position, baseStats, permanentMods); // Bridge point

// During gameplay
runState.update(); // Only touches run state, never profile

// Run end
const xpEarned = calculateXP(runState.stats); // Read from run
playerProfile.addXP(xpEarned); // Write to profile
PlayerProfileManager.save(playerProfile); // Persist
```

### Benefits
- Clear separation of concerns
- Easy to reset run without affecting progression
- Simple to add new persistent features

### When to Use
- Any roguelite/roguelike game
- Games with meta-progression
- Session-based games with permanent unlocks

---

## Pattern 3: Config-Driven Entities

**Problem**: Need flexible enemy/part/skill definitions

**Solution**: Data-driven approach with definitions in config

```javascript
// Config file defines entity types
CONFIG.ENEMIES = {
  scout: {
    health: 50,
    speed: 3.0,
    scrapValue: 5,
    factoryDamage: 1,
    sprite: 'scout_sprite'
  },
  tank: {
    health: 200,
    speed: 1.0,
    scrapValue: 20,
    factoryDamage: 5,
    sprite: 'tank_sprite'
  }
};

// Factory creates instances from config
class EnemyFactory {
  static create(type, position, path) {
    const definition = CONFIG.ENEMIES[type];
    return new Enemy(type, definition, position, path);
  }
}

// Usage
const scout = EnemyFactory.create('scout', spawnPoint, path);
```

### Benefits
- Easy to add new enemy types (just config, no code)
- Easy to balance (tweak numbers in one place)
- Clear data structure for designers
- Can load from JSON files for modding

### When to Use
- Enemy types, weapons, items
- Skill trees, abilities
- Wave definitions
- Any content that needs frequent balancing

---

## Pattern 4: Event-Driven Side Effects

**Problem**: One action triggers multiple consequences

**Solution**: Emit event, let interested systems react

```javascript
// Bad: Tight coupling
function killEnemy(enemy) {
  scrapManager.addScrap(enemy.scrapValue);     // Direct call
  waveSystem.decrementCount();                  // Direct call
  statsTracker.incrementKills();                // Direct call
  vfxSystem.spawnDeathAnimation(enemy.position); // Direct call
  // Every new feature needs to modify this function!
}

// Good: Event-driven
function killEnemy(enemy) {
  eventBus.emit('enemy:killed', { enemy }); // Single event
}

// Listeners can be added anywhere
eventBus.on('enemy:killed', ({ enemy }) => scrapManager.addScrap(enemy.scrapValue));
eventBus.on('enemy:killed', () => waveSystem.decrementCount());
eventBus.on('enemy:killed', () => statsTracker.incrementKills());
eventBus.on('enemy:killed', ({ enemy }) => vfxSystem.spawn(enemy.position));
// New features just add new listeners, no modifications needed!
```

### Benefits
- New features don't modify existing code
- Features can be toggled on/off easily
- Clear audit trail of what happens when
- Easy to test (mock event bus)

### When to Use
- Cross-system notifications
- Optional features (VFX, audio, analytics)
- Achievement systems
- UI updates

---

## Pattern Violations = Technical Debt

If you find yourself:

### ❌ Violating Modifier Aggregation
```javascript
// BAD
robot.damage = robot.baseDamage + skillBonus;
// Later, how do you add machine bonus?
```

### ❌ Violating State Isolation
```javascript
// BAD - mixing states
playerProfile.currentScrap = 100; // Scrap is temporary!
```

### ❌ Violating Config-Driven
```javascript
// BAD - hardcoded in class
class Scout extends Enemy {
  constructor() {
    this.health = 50;
    this.speed = 3.0;
    // Now you need a class for every enemy type!
  }
}
```

### ❌ Violating Event-Driven
```javascript
// BAD - direct calls everywhere
function updateGame() {
  if (enemyDied) {
    scrapManager.add(10);
    waveSystem.decrement();
    uiManager.update();
    soundManager.play('death');
    // Hard to add new systems!
  }
}
```

**STOP and refactor immediately**. These violations compound and make future work painful.

---

## Pattern Combinations

These patterns work together:

### Example: Enemy Death

```
1. Combat System detects collision
   ↓
2. Calls enemy.takeDamage() (direct call - ok, clear ownership)
   ↓
3. Enemy health reaches 0
   ↓
4. Enemy.die() emits 'enemy:killed' event (Pattern 4: Event-Driven)
   ↓
5. Multiple systems react:
   - ScrapManager adds scrap (config-driven value, Pattern 3)
   - WaveSystem decrements count
   - Robot.temporaryModifiers might change (Pattern 1: Modifier Aggregation)
   ↓
6. Scrap never touches PlayerProfile (Pattern 2: State Isolation)
```

All 4 patterns working in harmony!

---

## Anti-Pattern Detection Checklist

Before committing code, ask:

- [ ] Are stats calculated with modifier pattern?
- [ ] Is temporary state separate from persistent state?
- [ ] Are tuning values in config, not hardcoded?
- [ ] Are cross-system interactions using events?
- [ ] Can I add new content without changing code?
- [ ] Can I add new features without modifying existing systems?

If any answer is "no", consider refactoring.

---

## Related Documentation

- See patterns in action: [Component Responsibilities](04-component-responsibilities.md)
- Understand pattern rationale: [Core Principles](01-core-principles.md)
- See event usage: [Communication Patterns](05-communication-patterns.md)
