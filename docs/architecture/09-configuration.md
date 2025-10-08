# Configuration Management

> **Purpose**: Central configuration structure and rules
> 
> **When to read**: Adding config values, balancing game, extracting magic numbers

---

## Location

**File**: `config/config.js`

**Critical Rule**: ALL tuning values, magic numbers, and constants go here. Never hardcode in implementation files.

---

## Complete Config Structure

```javascript
// config/config.js
export const CONFIG = {
  // Grid
  GRID: {
    ROWS: 12,
    COLS: 12,
    TILE_SIZE: 64, // pixels
  },
  
  // Robot
  ROBOT: {
    BASE_DAMAGE: 10,
    BASE_FIRE_RATE: 1.0,      // attacks per second
    BASE_RANGE: 200,          // pixels
    BASE_HEALTH: 100,
    BASE_AOE_RADIUS: 50,
  },
  
  // Enemies
  ENEMIES: {
    scout: {
      health: 50,
      speed: 3.0,              // tiles per second
      scrapValue: 5,
      factoryDamage: 1,
      sprite: 'scout'
    },
    grunt: {
      health: 100,
      speed: 2.0,
      scrapValue: 10,
      factoryDamage: 2,
      sprite: 'grunt'
    },
    tank: {
      health: 250,
      speed: 1.0,
      scrapValue: 25,
      factoryDamage: 5,
      sprite: 'tank'
    },
    swarm: {
      health: 20,
      speed: 4.0,
      scrapValue: 2,
      factoryDamage: 1,
      sprite: 'swarm'
    }
  },
  
  // Machines
  MACHINES: {
    energy: {
      MAX_LEVEL: 3,
      COSTS: [null, 50, 100, 200], // Level 0 (base), 1, 2, 3
      BONUSES: [
        null,
        { fireRate: 0.3 },         // Level 1
        { fireRate: 0.6 },         // Level 2
        { fireRate: 1.0 }          // Level 3
      ]
    },
    heat: {
      MAX_LEVEL: 3,
      COSTS: [null, 75, 150, 300],
      BONUSES: [
        null,
        { dotDamage: 5, dotDuration: 3 },
        { dotDamage: 10, dotDuration: 5 },
        { dotDamage: 20, dotDuration: 7 }
      ]
    },
    pressure: {
      MAX_LEVEL: 3,
      COSTS: [null, 100, 200, 400],
      BONUSES: [
        null,
        { damage: 5 },
        { damage: 12 },
        { damage: 25 }
      ]
    }
  },
  
  // Skills (Phase 2)
  SKILLS: {
    DAMAGE_PER_POINT: 2,
    FIRE_RATE_PER_POINT: 0.1,
    HEALTH_PER_POINT: 20,
    RANGE_PER_POINT: 20,
    // Expand in Phase 2 with full skill tree
  },
  
  // Parts (Phase 2)
  PARTS: {
    overclocked_servo: {
      name: "Overclocked Servo",
      slot: "weapon",
      modifiers: { fireRate: 0.25, damage: -2 },
      rarity: "common"
    },
    reinforced_plating: {
      name: "Reinforced Plating",
      slot: "passive",
      modifiers: { health: 50 },
      rarity: "common"
    },
    // Expand in Phase 2
  },
  
  // Waves
  WAVE: {
    INTERVAL: 15.0,           // seconds between waves
    MAX_WAVES: 25,
  },
  
  WAVES: {
    1: {
      enemies: [
        { type: 'scout', delay: 0 },
        { type: 'scout', delay: 1000 },
        { type: 'scout', delay: 2000 }
      ]
    },
    2: {
      enemies: [
        { type: 'scout', delay: 0 },
        { type: 'scout', delay: 500 },
        { type: 'grunt', delay: 1000 },
        { type: 'scout', delay: 1500 }
      ]
    },
    // Define first 5 waves for Phase 1
    // Expand to 25 waves in Phase 5
  },
  
  // Factory
  FACTORY: {
    MAX_HEALTH: 20,
    GOAL_POSITION: { x: 11, y: 10 } // Grid coordinates
  },
  
  // Combat
  PROJECTILE: {
    SPEED: 300,               // pixels per second
    SIZE: 8,                  // pixels
  },
  
  COLLISION: {
    THRESHOLD: 20,            // pixels for collision detection
  },
  
  // Rendering
  RENDERING: {
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    FPS_TARGET: 60,
  },
  
  // Progression (Phase 2)
  PROGRESSION: {
    XP_PER_WAVE: 10,
    XP_PER_KILL: 1,
    XP_PER_SKILL_POINT: 50,
    PART_DROP_CHANCE: 0.2,    // 20% per wave completion
  },
  
  // Debug
  DEBUG: {
    ENABLED: true,
    SHOW_GRID: false,
    SHOW_PATHS: false,
    SHOW_COLLISION: false,
    SHOW_FPS: true,
    LOG_EVENTS: false,
  }
};
```

---

## Configuration Rules

### 1. Never Hardcode Numbers

❌ **Bad**:
```javascript
if (distance < 200) { }
enemy.health = 50;
const cost = 100;
```

✅ **Good**:
```javascript
if (distance < CONFIG.ROBOT.BASE_RANGE) { }
enemy.health = CONFIG.ENEMIES[type].health;
const cost = CONFIG.MACHINES.energy.COSTS[level];
```

### 2. Group Logically

Related values stay together:
```javascript
ROBOT: {
  BASE_DAMAGE: 10,
  BASE_FIRE_RATE: 1.0,
  BASE_RANGE: 200,
}
```

Not scattered:
```javascript
BASE_ROBOT_DAMAGE: 10,
// ... 50 other values ...
ROBOT_FIRE_RATE: 1.0,
// ... 50 more values ...
ROBOT_RANGE: 200,
```

### 3. Comment Units

Always specify what the number represents:
```javascript
TILE_SIZE: 64,        // pixels
FIRE_RATE: 1.0,       // attacks per second
SPEED: 3.0,           // tiles per second
PART_DROP_CHANCE: 0.2, // 20% chance (0.0 - 1.0)
```

### 4. Version Changes

Track config changes in git commits:
```bash
git commit -m "balance(config): reduce scout health from 50 to 40"
git commit -m "config(machines): add heat machine costs"
```

---

## Adding New Config Values

### Checklist

Before adding a new value:
1. **Check if exists** - Search config for similar values
2. **Choose location** - Which section does it belong to?
3. **Name clearly** - Descriptive, consistent with existing names
4. **Comment units** - Add unit comment
5. **Update usage** - Replace hardcoded values in code

### Example: Adding New Stat

```javascript
// 1. Add to config
ROBOT: {
  BASE_DAMAGE: 10,
  BASE_FIRE_RATE: 1.0,
  BASE_RANGE: 200,
  BASE_CRIT_CHANCE: 0.1,     // NEW: 10% chance (0.0 - 1.0)
  BASE_CRIT_MULTIPLIER: 2.0, // NEW: 2x damage on crit
}

// 2. Update code usage
if (Math.random() < CONFIG.ROBOT.BASE_CRIT_CHANCE) {
  damage *= CONFIG.ROBOT.BASE_CRIT_MULTIPLIER;
}
```

---

## Config Access Patterns

### ✅ Direct Access (Simple Values)

```javascript
const tileSize = CONFIG.GRID.TILE_SIZE;
const maxHealth = CONFIG.FACTORY.MAX_HEALTH;
```

### ✅ Dynamic Access (Variable Keys)

```javascript
const enemyStats = CONFIG.ENEMIES[enemyType];
const machineBonus = CONFIG.MACHINES[machineType].BONUSES[level];
```

### ❌ Don't Cache Unless Necessary

```javascript
// BAD - unnecessary caching
constructor() {
  this.cachedTileSize = CONFIG.GRID.TILE_SIZE;
}

// GOOD - just use directly
render() {
  const x = gridX * CONFIG.GRID.TILE_SIZE;
}
```

### ✅ Do Cache for Performance-Critical

```javascript
// GOOD - called thousands of times per frame
constructor() {
  this.tileSize = CONFIG.GRID.TILE_SIZE; // Cache once
}

update() {
  // Use cached value in hot path
  const x = this.gridX * this.tileSize;
}
```

---

## Balancing Workflow

### Initial Values

Start with rough estimates:
```javascript
ENEMIES: {
  scout: {
    health: 50,        // Guess
    speed: 3.0,        // Guess
    scrapValue: 5,     // Guess
  }
}
```

### Playtest and Adjust

1. Play the game
2. Identify issues ("scouts too weak")
3. Adjust config values
4. Test again
5. Repeat

### Document Rationale

```javascript
scout: {
  health: 40,        // Reduced from 50 - was too tanky for wave 1
  speed: 3.5,        // Increased from 3.0 - needed to pressure player more
  scrapValue: 5,
}
```

---

## Environment-Specific Config

For different builds (dev, prod, test):

```javascript
// config/config.js
const base = {
  // ... base config ...
};

const development = {
  ...base,
  DEBUG: {
    ENABLED: true,
    SHOW_GRID: true,
    SHOW_PATHS: true,
    SHOW_COLLISION: true,
    SHOW_FPS: true,
    LOG_EVENTS: true,
  }
};

const production = {
  ...base,
  DEBUG: {
    ENABLED: false,
    SHOW_GRID: false,
    SHOW_PATHS: false,
    SHOW_COLLISION: false,
    SHOW_FPS: false,
    LOG_EVENTS: false,
  }
};

export const CONFIG = process.env.NODE_ENV === 'production' ? production : development;
```

---

## Config Validation

Add validation for development:

```javascript
// config/validation.js
export function validateConfig(config) {
  // Check required fields
  if (!config.GRID || !config.ROBOT || !config.ENEMIES) {
    throw new Error('Missing required config sections');
  }
  
  // Validate ranges
  if (config.ROBOT.BASE_FIRE_RATE <= 0) {
    throw new Error('ROBOT.BASE_FIRE_RATE must be positive');
  }
  
  // Validate enemy definitions
  Object.entries(config.ENEMIES).forEach(([type, stats]) => {
    if (!stats.health || stats.health <= 0) {
      throw new Error(`Enemy ${type} has invalid health`);
    }
  });
  
  // ... more validations ...
}

// In main entry point
if (CONFIG.DEBUG.ENABLED) {
  validateConfig(CONFIG);
}
```

---

## Related Documentation

- See config usage: [Component Responsibilities](04-component-responsibilities.md)
- Understand why config matters: [Core Principles](01-core-principles.md#4-configuration-over-hardcoding)
- See config in patterns: [Critical Design Patterns](07-critical-patterns.md#pattern-3-config-driven-entities)
