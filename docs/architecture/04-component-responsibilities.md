# Component Responsibilities

> **Purpose**: Detailed breakdown of every system and its responsibilities
> 
> **When to read**: Before implementing a feature, when unclear about where code belongs

---

## Table of Contents

- [Core Systems (Phase 1)](#core-systems-phase-1)
  - [1. EventBus](#1-eventbus)
  - [2. Robot System](#2-robot-system)
  - [3. Enemy System](#3-enemy-system)
  - [4. Combat System](#4-combat-system)
  - [5. Wave System](#5-wave-system)
  - [6. Machine System](#6-machine-system)
  - [7. Scrap Manager](#7-scrap-manager)
- [Progression Systems (Phase 2)](#progression-systems-phase-2)
  - [8. Player Profile Manager](#8-player-profile-manager)
  - [9. Skill Tree System](#9-skill-tree-system)
- [Rendering Systems](#rendering-systems)
  - [10. Renderer](#10-renderer)

---

## Core Systems (Phase 1)

### 1. EventBus

**File**: `src/core/EventBus.js`

**Purpose**: Central communication hub for all systems

**Responsibilities**:
- Register event listeners
- Emit events to all listeners
- Remove event listeners (cleanup)

**Pattern**:
```javascript
class EventBus {
  constructor() {
    this.listeners = {};
  }
  
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }
  
  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(data));
    }
  }
  
  off(eventName, callback) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
  }
}
```

**Key Events** (build this list as you implement):

```javascript
// Combat
'enemy:spawned'      → { enemy: Enemy }
'enemy:killed'       → { enemy: Enemy, scrapValue: number }
'enemy:reached_goal' → { enemy: Enemy, damage: number }
'projectile:hit'     → { projectile: Projectile, target: Enemy }

// Economy
'scrap:earned'       → { amount: number, source: string }
'scrap:spent'        → { amount: number, purpose: string }

// Machines
'machine:upgraded'   → { machineType: string, newLevel: number }

// Waves
'wave:started'       → { waveNumber: number }
'wave:completed'     → { waveNumber: number }

// Game State
'game:started'       → { }
'game:over'          → { reason: string, stats: object }
'game:paused'        → { }
'game:resumed'       → { }

// Phase 2+
'xp:earned'          → { amount: number }
'skill:unlocked'     → { skillName: string }
'part:equipped'      → { slot: string, partId: string }
```

See [Communication Patterns](05-communication-patterns.md) for detailed event usage.

---

### 2. Robot System

**File**: `src/entities/Robot.js`

**Purpose**: Player-controlled robot entity with combat and abilities

**Responsibilities**:
- Auto-targeting nearest enemy in range
- Manual target override (player clicks enemy)
- Firing projectiles at target
- Managing health and damage taken
- Applying stat modifiers from machines and skills

**Key Properties**:
```javascript
class Robot {
  constructor(position, baseStats, permanentModifiers = {}) {
    this.position = position; // { x, y } grid coordinates
    
    // Stats (using modifier pattern)
    this.baseStats = {
      damage: 10,
      fireRate: 1.0,      // attacks per second
      range: 200,         // pixels
      health: 100,
      aoeRadius: 50       // for proximity blast (Phase 4)
    };
    
    this.permanentModifiers = permanentModifiers; // From skills/parts (locked at run start)
    this.temporaryModifiers = {};                 // From machines (updated during run)
    
    this.currentHealth = this.getActualStat('health');
    
    // Combat state
    this.currentTarget = null;
    this.timeSinceLastShot = 0;
    this.abilityCooldowns = {}; // Phase 4
  }
  
  getActualStat(statName) {
    return this.baseStats[statName]
      + (this.permanentModifiers[statName] || 0)
      + (this.temporaryModifiers[statName] || 0);
  }
  
  update(deltaTime, enemies) {
    this.updateTargeting(enemies);
    this.updateFiring(deltaTime);
  }
  
  updateTargeting(enemies) {
    // Auto-target nearest enemy in range
    // (unless manual target override exists)
  }
  
  updateFiring(deltaTime) {
    this.timeSinceLastShot += deltaTime;
    const fireInterval = 1.0 / this.getActualStat('fireRate');
    
    if (this.timeSinceLastShot >= fireInterval && this.currentTarget) {
      this.fire();
      this.timeSinceLastShot = 0;
    }
  }
  
  fire() {
    // Emit event to spawn projectile
    eventBus.emit('projectile:spawn', {
      source: this.position,
      target: this.currentTarget.position,
      damage: this.getActualStat('damage')
    });
  }
  
  setManualTarget(enemy) {
    this.currentTarget = enemy;
  }
  
  clearManualTarget() {
    this.currentTarget = null;
  }
}
```

**Events**:
- Emits: `projectile:spawn`, `robot:damaged`, `robot:died`
- Listens: `machine:upgraded` (to update temporaryModifiers)

**Notes**:
- Robot stats are LOCKED at run start (permanentModifiers never change during run)
- Only temporaryModifiers change (when machines upgrade)

---

### 3. Enemy System

**File**: `src/entities/Enemy.js`

**Purpose**: Enemy entities with pathfinding and health

**Responsibilities**:
- Follow precalculated path to factory goal
- Take damage from projectiles
- Die and award scrap when killed
- Damage factory when reaching goal

**Key Properties**:
```javascript
class Enemy {
  constructor(type, spawnPosition, path) {
    this.type = type; // 'scout', 'grunt', 'tank', 'swarm'
    this.position = { ...spawnPosition };
    this.path = path; // Array of {x, y} waypoints from pathfinding
    this.pathIndex = 0;
    
    // Stats from enemy type definition
    const stats = CONFIG.ENEMIES[type];
    this.maxHealth = stats.health;
    this.currentHealth = this.maxHealth;
    this.speed = stats.speed;
    this.scrapValue = stats.scrapValue;
    this.factoryDamage = stats.factoryDamage;
    
    this.isAlive = true;
  }
  
  update(deltaTime) {
    if (!this.isAlive) return;
    
    this.moveAlongPath(deltaTime);
    this.checkReachedGoal();
  }
  
  moveAlongPath(deltaTime) {
    // Move toward next waypoint in path
    // When reached, increment pathIndex
  }
  
  checkReachedGoal() {
    if (this.pathIndex >= this.path.length - 1) {
      this.reachedGoal();
    }
  }
  
  reachedGoal() {
    eventBus.emit('enemy:reached_goal', {
      enemy: this,
      damage: this.factoryDamage
    });
    this.die(false); // die without scrap reward
  }
  
  takeDamage(amount) {
    this.currentHealth -= amount;
    if (this.currentHealth <= 0) {
      this.die(true); // die with scrap reward
    }
  }
  
  die(giveScrap) {
    this.isAlive = false;
    if (giveScrap) {
      eventBus.emit('enemy:killed', {
        enemy: this,
        scrapValue: this.scrapValue
      });
    }
  }
}
```

**Events**:
- Emits: `enemy:killed`, `enemy:reached_goal`
- Listens: `projectile:hit` (indirectly via CombatSystem calling takeDamage)

**Notes**:
- Path is precalculated on spawn (see PathfindingSystem)
- Enemy just follows waypoints, no runtime pathfinding

---

### 4. Combat System

**File**: `src/systems/CombatSystem.js`

**Purpose**: Handle projectiles, collision detection, damage application

**Responsibilities**:
- Manage projectile lifecycle (spawn, move, destroy)
- Detect projectile-enemy collisions
- Apply damage to enemies on hit
- Handle AoE effects (Phase 4)

**Key Methods**:
```javascript
class CombatSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.projectiles = [];
    
    this.eventBus.on('projectile:spawn', this.spawnProjectile.bind(this));
  }
  
  spawnProjectile({ source, target, damage }) {
    const projectile = {
      position: { ...source },
      targetPosition: { ...target },
      damage: damage,
      speed: CONFIG.PROJECTILE.SPEED,
      isActive: true
    };
    this.projectiles.push(projectile);
  }
  
  update(deltaTime, enemies) {
    this.updateProjectiles(deltaTime);
    this.checkCollisions(enemies);
    this.cleanupInactiveProjectiles();
  }
  
  updateProjectiles(deltaTime) {
    this.projectiles.forEach(proj => {
      // Move projectile toward target
      const dx = proj.targetPosition.x - proj.position.x;
      const dy = proj.targetPosition.y - proj.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < proj.speed * deltaTime) {
        // Reached target
        proj.isActive = false;
      } else {
        // Move toward target
        proj.position.x += (dx / distance) * proj.speed * deltaTime;
        proj.position.y += (dy / distance) * proj.speed * deltaTime;
      }
    });
  }
  
  checkCollisions(enemies) {
    this.projectiles.forEach(proj => {
      if (!proj.isActive) return;
      
      enemies.forEach(enemy => {
        if (!enemy.isAlive) return;
        
        if (this.isColliding(proj, enemy)) {
          this.handleHit(proj, enemy);
        }
      });
    });
  }
  
  isColliding(projectile, enemy) {
    const dx = projectile.position.x - enemy.position.x;
    const dy = projectile.position.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < CONFIG.COLLISION.THRESHOLD;
  }
  
  handleHit(projectile, enemy) {
    enemy.takeDamage(projectile.damage);
    projectile.isActive = false;
    
    this.eventBus.emit('projectile:hit', {
      projectile: projectile,
      target: enemy
    });
  }
  
  cleanupInactiveProjectiles() {
    this.projectiles = this.projectiles.filter(p => p.isActive);
  }
}
```

**Events**:
- Emits: `projectile:hit`
- Listens: `projectile:spawn`

---

### 5. Wave System

**File**: `src/systems/WaveSystem.js`

**Purpose**: Spawn enemy waves on timer with increasing difficulty

**Responsibilities**:
- Track current wave number
- Spawn enemies based on wave definitions
- Manage wave timing (interval between waves)
- Detect wave completion (all enemies dead or reached goal)

**Key Methods**:
```javascript
class WaveSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.currentWave = 1;
    this.waveInProgress = false;
    this.timeSinceWaveStart = 0;
    this.activeEnemyCount = 0;
    
    this.eventBus.on('enemy:spawned', () => this.activeEnemyCount++);
    this.eventBus.on('enemy:killed', () => this.handleEnemyRemoved());
    this.eventBus.on('enemy:reached_goal', () => this.handleEnemyRemoved());
  }
  
  update(deltaTime) {
    if (!this.waveInProgress) {
      this.timeSinceWaveStart += deltaTime;
      
      if (this.timeSinceWaveStart >= CONFIG.WAVE.INTERVAL) {
        this.startNextWave();
      }
    }
  }
  
  startNextWave() {
    this.waveInProgress = true;
    this.timeSinceWaveStart = 0;
    
    const waveDefinition = this.getWaveDefinition(this.currentWave);
    this.spawnWave(waveDefinition);
    
    this.eventBus.emit('wave:started', {
      waveNumber: this.currentWave
    });
  }
  
  getWaveDefinition(waveNumber) {
    // Return enemy composition for this wave
    // Could be from config, or calculated algorithmically
    return CONFIG.WAVES[waveNumber] || this.generateWave(waveNumber);
  }
  
  spawnWave(waveDefinition) {
    waveDefinition.enemies.forEach((enemyDef, index) => {
      setTimeout(() => {
        this.eventBus.emit('enemy:spawn_request', {
          type: enemyDef.type,
          spawnPoint: enemyDef.spawnPoint || 'default'
        });
      }, enemyDef.delay || (index * 500)); // Stagger spawns
    });
  }
  
  handleEnemyRemoved() {
    this.activeEnemyCount--;
    
    if (this.activeEnemyCount <= 0 && this.waveInProgress) {
      this.completeWave();
    }
  }
  
  completeWave() {
    this.waveInProgress = false;
    
    this.eventBus.emit('wave:completed', {
      waveNumber: this.currentWave
    });
    
    this.currentWave++;
  }
}
```

**Events**:
- Emits: `wave:started`, `wave:completed`, `enemy:spawn_request`
- Listens: `enemy:spawned`, `enemy:killed`, `enemy:reached_goal`

---

### 6. Machine System

**File**: `src/systems/MachineSystem.js`

**Purpose**: Manage factory machine upgrades and their effects (temporary, within-run only)

**Critical Behavior**: 
⚠️ **All machines ALWAYS start at level 0 each new run**. This is the "chore layer" that creates tactical depth and strategic timing decisions.

**Responsibilities**:
- Track machine upgrade levels (temporary - resets each run)
- Calculate upgrade costs (scrap-based)
- Apply machine bonuses to robot stats (as temporary modifiers)
- Handle upgrade UI and validation
- **NOT responsible for persistence** (machines never save between runs)

**Key Methods**:
```javascript
class MachineSystem {
  constructor(eventBus, scrapManager) {
    this.eventBus = eventBus;
    this.scrapManager = scrapManager;
    
    this.machines = {
      energy: { level: 0, maxLevel: 3 },
      heat: { level: 0, maxLevel: 3 },     // Phase 3
      pressure: { level: 0, maxLevel: 3 }  // Phase 3
    };
  }
  
  canUpgrade(machineType) {
    const machine = this.machines[machineType];
    if (!machine || machine.level >= machine.maxLevel) {
      return false;
    }
    
    const cost = this.getUpgradeCost(machineType, machine.level + 1);
    return this.scrapManager.hasScrap(cost);
  }
  
  getUpgradeCost(machineType, level) {
    return CONFIG.MACHINES[machineType].COSTS[level];
  }
  
  upgradeMachine(machineType) {
    if (!this.canUpgrade(machineType)) {
      return false;
    }
    
    const cost = this.getUpgradeCost(machineType, this.machines[machineType].level + 1);
    this.scrapManager.spendScrap(cost);
    
    this.machines[machineType].level++;
    
    this.eventBus.emit('machine:upgraded', {
      machineType: machineType,
      newLevel: this.machines[machineType].level,
      bonuses: this.getMachineBonuses(machineType, this.machines[machineType].level)
    });
    
    return true;
  }
  
  getMachineBonuses(machineType, level) {
    // Return stat modifiers for this machine at this level
    const definition = CONFIG.MACHINES[machineType];
    return definition.BONUSES[level];
  }
  
  getCurrentBonuses() {
    // Aggregate all machine bonuses for robot
    const totalBonuses = {};
    
    Object.keys(this.machines).forEach(machineType => {
      const level = this.machines[machineType].level;
      if (level > 0) {
        const bonuses = this.getMachineBonuses(machineType, level);
        // Merge bonuses into totalBonuses
      }
    });
    
    return totalBonuses;
  }
}
```

**Events**:
- Emits: `machine:upgraded`
- Listens: None

---

### 7. Scrap Manager

**File**: `src/systems/ScrapManager.js`

**Purpose**: Track scrap currency earned and spent within a run

**Responsibilities**:
- Track current scrap amount
- Award scrap when enemies killed
- Deduct scrap when machines upgraded
- Validate scrap availability for purchases

**Key Methods**:
```javascript
class ScrapManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.currentScrap = 0;
    
    this.eventBus.on('enemy:killed', this.handleEnemyKilled.bind(this));
  }
  
  handleEnemyKilled({ scrapValue }) {
    this.addScrap(scrapValue);
  }
  
  addScrap(amount) {
    this.currentScrap += amount;
    this.eventBus.emit('scrap:earned', { amount, total: this.currentScrap });
  }
  
  spendScrap(amount) {
    if (this.currentScrap >= amount) {
      this.currentScrap -= amount;
      this.eventBus.emit('scrap:spent', { amount, remaining: this.currentScrap });
      return true;
    }
    return false;
  }
  
  hasScrap(amount) {
    return this.currentScrap >= amount;
  }
  
  getScrap() {
    return this.currentScrap;
  }
}
```

**Events**:
- Emits: `scrap:earned`, `scrap:spent`
- Listens: `enemy:killed`

---

## Progression Systems (Phase 2)

### 8. Player Profile Manager

**File**: `src/systems/PlayerProfileManager.js`

**Purpose**: Manage persistent player progression (skills, parts, stats)

**Responsibilities**:
- Save PlayerProfile to localStorage
- Load PlayerProfile on game start
- Handle profile version migrations
- Validate loaded data

See [Data Architecture](03-data-architecture.md#persistence-layer-phase-2) for implementation details.

---

### 9. Skill Tree System

**File**: `src/systems/SkillTreeSystem.js`

**Purpose**: Manage skill point allocation and unlock logic

**Responsibilities**:
- Validate skill unlock prerequisites
- Deduct skill points on unlock
- Calculate stat bonuses from spent skills
- Handle skill tree UI state

**Key Pattern**:
```javascript
class SkillTreeSystem {
  constructor(playerProfile, eventBus) {
    this.profile = playerProfile;
    this.eventBus = eventBus;
  }
  
  canUnlockSkill(skillName) {
    const skill = CONFIG.SKILLS[skillName];
    
    // Check prerequisites
    if (skill.requires) {
      if (!this.profile.skillPoints.spent[skill.requires]) {
        return false;
      }
    }
    
    // Check skill points available
    return this.profile.skillPoints.available >= skill.cost;
  }
  
  unlockSkill(skillName) {
    if (!this.canUnlockSkill(skillName)) return false;
    
    const skill = CONFIG.SKILLS[skillName];
    this.profile.skillPoints.available -= skill.cost;
    this.profile.skillPoints.spent[skillName]++;
    
    this.eventBus.emit('skill:unlocked', { skillName });
    return true;
  }
}
```

**Events**:
- Emits: `skill:unlocked`
- Listens: None

---

## Rendering Systems

### 10. Renderer

**File**: `src/rendering/Renderer.js`

**Purpose**: Orchestrate all rendering operations

**Responsibilities**:
- Clear and setup canvas each frame
- Delegate to specialized renderers
- Handle camera/viewport (if needed)
- Manage render order (layers)

**Keep this file small** (~100 lines). Extract rendering logic into:
- `GridRenderer.js` - Draw tiles, walls, paths, machines
- `EntityRenderer.js` - Draw robot, enemies, projectiles
- `UIRenderer.js` - Draw HUD elements (wave counter, health, scrap)
- `VFXRenderer.js` - Draw particle effects (Phase 4)

**Pattern**:
```javascript
class Renderer {
  constructor(canvas, runState) {
    this.ctx = canvas.getContext('2d');
    this.runState = runState;
    
    this.gridRenderer = new GridRenderer(this.ctx);
    this.entityRenderer = new EntityRenderer(this.ctx);
    this.uiRenderer = new UIRenderer(this.ctx);
  }
  
  render() {
    // Clear
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render layers (back to front)
    this.gridRenderer.render(this.runState.currentMap);
    this.entityRenderer.render(this.runState.robot, this.runState.enemies, this.runState.projectiles);
    this.uiRenderer.render(this.runState);
  }
}
```

---

## Component Interaction Example

**Scenario**: Machine upgraded, robot fires faster

```
1. User clicks "Upgrade Energy Machine" button

2. UI handler calls:
   machineSystem.upgradeMachine('energy')

3. MachineSystem:
   - Checks scrap availability (via scrapManager)
   - Deducts scrap
   - Increments energy.level
   - Emits 'machine:upgraded' event

4. Robot listens to 'machine:upgraded':
   - Updates temporaryModifiers.fireRate
   - Next fire() call uses new rate

5. HUD listens to 'scrap:spent':
   - Updates scrap counter display

6. GridRenderer (next frame):
   - Renders upgraded machine sprite
```

**Key**: No direct calls, all via events!

---

## Related Documentation

- Understand component principles: [Core Principles](01-core-principles.md)
- See how components communicate: [Communication Patterns](05-communication-patterns.md)
- View implementation order: [Implementation Phases](06-implementation-phases.md)
