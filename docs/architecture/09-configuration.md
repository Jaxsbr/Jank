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

## Visual Configuration (Canvas Rendering)

### Two-Part System

```
CONFIG (what things look like)
    ↓
RENDERERS (how to draw them)
```

**Rule**: All visual properties (colors, sizes, animations) go in config. Renderers only contain drawing logic.

### Visual Config Structure

```javascript
export const CONFIG = {
  // ============================================
  // COLORS - Visual Palette
  // ============================================
  COLORS: {
    // Foundation (establishes theme)
    PRIMARY: '#00bfff',        // Electric blue accent
    DANGER: '#ff0000',         // Red for threats
    SUCCESS: '#00ff00',        // Green for positive
    WARNING: '#ffff00',        // Yellow for warnings
    BACKGROUND: '#1a1a1a',     // Dark industrial
    
    // Environment
    FLOOR: '#2a2a2a',
    WALL: '#1a1a1a',
    PATH: '#3a3a2a',
    GRID_LINE: '#333333',
    
    // Robot (added Phase 1 Step 3)
    ROBOT_BODY: '#808080',
    ROBOT_ACCENT: '#00bfff',   // Uses PRIMARY
    
    // Enemies (added as implemented)
    ENEMY_SCOUT: '#8b00ff',
    ENEMY_GRUNT: '#ff00ff',    // Added Phase 3
    ENEMY_TANK: '#ff0066',     // Added Phase 3
    ENEMY_HEALTH_BG: '#330000',
    ENEMY_HEALTH_FG: '#ff0000', // Uses DANGER
    
    // Machines (added as implemented)
    ENERGY_BASE: '#1e3a5f',    // Added Phase 1 Step 6
    ENERGY_GLOW: '#00bfff',    // Uses PRIMARY
    HEAT_BASE: '#5f1e1e',      // Added Phase 3
    HEAT_GLOW: '#ff4500',
    PRESSURE_BASE: '#5f5f1e',  // Added Phase 3
    PRESSURE_GLOW: '#ffd700',
    
    // Projectiles
    PROJECTILE_BASIC: '#ffffff',
    PROJECTILE_ENERGY: '#00bfff',
    PROJECTILE_HEAT: '#ff4500',
    PROJECTILE_PRESSURE: '#ffd700',
    
    // UI
    UI_TEXT: '#ffffff',
    UI_BACKGROUND: 'rgba(0, 0, 0, 0.7)',
    UI_BORDER: '#00bfff',
    UI_BUTTON_ENABLED: '#00ff00',
    UI_BUTTON_DISABLED: '#666666',
  },
  
  // ============================================
  // VISUAL - Sizes and Properties
  // ============================================
  VISUAL: {
    // Grid (Phase 1 Step 2)
    TILE_SIZE: 64,
    GRID_LINE_WIDTH: 1,
    SHOW_GRID_LINES: true,
    
    // Robot (Phase 1 Step 3)
    ROBOT_SIZE: 48,
    ROBOT_WEAPON_LENGTH: 20,
    ROBOT_WEAPON_WIDTH: 4,
    
    // Enemies (added as implemented)
    ENEMY_SIZE: 32,
    ENEMY_HEALTH_BAR_WIDTH: 40,
    ENEMY_HEALTH_BAR_HEIGHT: 4,
    
    // Machines (Phase 1 Step 6)
    MACHINE_SIZE: 60,
    MACHINE_CORE_SIZE: 20,
    
    // Projectiles (Phase 1 Step 5)
    PROJECTILE_SIZE: 4,
    PROJECTILE_TRAIL_LENGTH: 3,
    
    // Effects (Phase 4)
    EXPLOSION_RADIUS: 40,
    MUZZLE_FLASH_SIZE: 15,
  },
  
  // ============================================
  // ANIMATION - Timing and Motion
  // ============================================
  ANIMATION: {
    MACHINE_GLOW_PULSE_SPEED: 2.0,
    ROBOT_IDLE_BOB_SPEED: 1.0,
    ROBOT_IDLE_BOB_AMOUNT: 2,    // pixels
    ENEMY_WALK_CYCLE_SPEED: 4.0,
  },
  
  // ... other gameplay configs ...
};
```

### Just-In-Time Config Approach

**DO NOT define everything upfront.** Add visual configs incrementally as features are implemented:

#### Phase 1: Foundation + Basics
- **Day 1** (Step 1): Foundation colors (PRIMARY, DANGER, SUCCESS, etc.) + basic environment
- **Step 2**: Grid-specific visuals
- **Step 3**: Robot-specific visuals
- **Step 4**: Scout enemy only (not all enemies)
- **Step 5**: Basic projectile only
- **Step 6**: Energy machine only (not Heat/Pressure yet)

#### Phase 3: Expand Variety
- Add Heat machine colors when implementing Heat
- Add Pressure machine colors when implementing Pressure
- Add Grunt/Tank/Swarm colors when implementing each

#### Phase 5: Wave-Specific Content
- Add specific enemy variants as needed (e.g., Slime for Wave 12)

**Benefits**:
- Only define what's currently used
- Avoid wasted effort on unused configs
- Iterate visually as you see results
- Configs grow gradually (manageable)

### Visual Consistency

Reuse foundation colors to maintain theme:

```javascript
// Foundation defined Day 1
PRIMARY: '#00bfff',

// Later features reference foundation
ENERGY_GLOW: '#00bfff',    // Same as PRIMARY
ROBOT_ACCENT: '#00bfff',   // Same as PRIMARY
UI_BORDER: '#00bfff',      // Same as PRIMARY
```

### Adding Visual Configs

**Workflow for each feature**:

1. **Before implementing renderer**: Add required colors/sizes to config
2. **Implement renderer**: Reference config values (no hardcoding)
3. **View and iterate**: Adjust config values until satisfied
4. **Commit**: Feature working + configs defined

**Example: Adding Tank Enemy**

```javascript
// Step 1: Add to config (2 minutes)
COLORS: {
  ENEMY_TANK: '#ff0066',
}
VISUAL: {
  ENEMY_SIZE_TANK: 48,  // Larger than Scout
}

// Step 2: Implement in EnemyRenderer (10 minutes)
renderTankEnemy(tank) {
  const size = CONFIG.VISUAL.ENEMY_SIZE_TANK;
  const color = CONFIG.COLORS.ENEMY_TANK;
  // ... drawing logic ...
}

// Step 3: View, adjust size to 52 in config
// Step 4: Commit when satisfied
```

### Config Organization

Group visual configs logically:

```javascript
COLORS: {
  // ============ FOUNDATION ============
  PRIMARY: '#00bfff',
  
  // ============ ENVIRONMENT ============
  FLOOR: '#2a2a2a',
  
  // ============ ROBOT ============
  ROBOT_BODY: '#808080',
  
  // ============ ENEMIES ============
  ENEMY_SCOUT: '#8b00ff',
  // (Add more as implemented)
  
  // ============ MACHINES ============
  ENERGY_BASE: '#1e3a5f',
  // (Add Heat/Pressure when implemented)
}
```

Add comments to track when configs were added:

```javascript
// ============ WAVE 12: SLIME ENEMIES ============
ENEMY_SLIME_GREEN: '#00ff88',  // Added Phase 5
SLIME_WOBBLE_SPEED: 3.0,
```

### Renderer Implementation

Renderers read from config and implement drawing:

```javascript
// src/rendering/RobotRenderer.js
import { CONFIG } from '../config/config.js';

export class RobotRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }
  
  render(robot, time) {
    const ctx = this.ctx;
    const x = robot.position.x;
    const y = robot.position.y;
    const size = CONFIG.VISUAL.ROBOT_SIZE;
    
    // Idle bobbing animation
    const bobOffset = Math.sin(time * CONFIG.ANIMATION.ROBOT_IDLE_BOB_SPEED) 
                      * CONFIG.ANIMATION.ROBOT_IDLE_BOB_AMOUNT;
    
    // Main body
    this.drawHexagon(
      x, 
      y + bobOffset, 
      size / 2, 
      CONFIG.COLORS.ROBOT_BODY
    );
    
    // Glowing core
    this.drawGlowingCircle(
      x, 
      y + bobOffset, 
      size / 4, 
      CONFIG.COLORS.ROBOT_ACCENT
    );
  }
  
  drawHexagon(x, y, radius, color) {
    // Canvas drawing logic using color parameter
  }
  
  drawGlowingCircle(x, y, radius, color) {
    // Canvas drawing logic using color parameter
  }
}
```

**Key principles**:
- Config = What to draw (colors, sizes)
- Renderer = How to draw (canvas API calls)
- No hardcoded visual values in renderers

### Expected Config Growth

| Phase | Config Lines | What's Added |
|-------|-------------|--------------|
| **Phase 1 Start** | ~80 | Foundation + environment |
| **Phase 1 End** | ~150 | + Energy, Scout, projectiles |
| **Phase 2 End** | ~200 | + UI, menu, skill tree |
| **Phase 3 End** | ~300 | + 2 machines, 3 enemies |
| **Phase 5 End** | ~400 | + Bosses, special enemies, VFX |

File stays manageable because growth is incremental.

---

## Related Documentation

- See config usage: [Component Responsibilities](04-component-responsibilities.md)
- Understand why config matters: [Core Principles](01-core-principles.md#4-configuration-over-hardcoding)
- See config in patterns: [Critical Design Patterns](07-critical-patterns.md#pattern-3-config-driven-entities)
- See renderer organization: [Directory Structure](08-directory-structure.md#srcrendering)
