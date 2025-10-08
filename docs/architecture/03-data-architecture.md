# Data Architecture

> **Purpose**: State management, data flows, and persistence patterns
> 
> **When to read**: Implementing state, adding persistence, understanding data flow

---

## Overview

Two completely separate state trees:
1. **RunState** - Temporary, discarded at run end
2. **PlayerProfile** - Persistent, saved to localStorage

See [Core Principles](01-core-principles.md#1-state-separation-critical) for rationale.

---

## Phase 1: Single-Run State (MVP)

```javascript
// File: src/state/RunState.js
class RunState {
  constructor() {
    this.phase = 'playing'; // 'playing' | 'paused' | 'gameOver'
    this.currentWave = 1;
    this.factoryHealth = CONFIG.FACTORY.MAX_HEALTH;
    this.scrap = 0;
    
    // Entities
    this.robot = null;      // Single Robot instance
    this.enemies = [];      // Array of Enemy instances
    this.projectiles = [];  // Array of Projectile instances
    
    // Machine states
    this.machines = {
      energy: { level: 0, position: { x: 0, y: 0 } },
      heat: { level: 0, position: { x: 0, y: 0 } },     // Phase 3
      pressure: { level: 0, position: { x: 0, y: 0 } }  // Phase 3
    };
    
    // Map data
    this.currentMap = null; // Loaded from map definitions
  }
  
  reset() {
    // Reset all state for new run
  }
}
```

---

## Phase 2: Persistent Profile State

```javascript
// File: src/state/PlayerProfile.js
class PlayerProfile {
  constructor() {
    this.version = '1.0'; // For migration compatibility
    
    // Progression
    this.skillPoints = {
      total: 0,
      available: 0,
      spent: {
        damage: 0,
        fireRate: 0,
        health: 0,
        range: 0,
        cooldown: 0,
        aoe: 0
        // Expand as skill tree grows
      }
    };
    
    // Parts system
    this.equippedParts = {
      weapon: null,   // Part ID or null
      utility: null,
      passive: null
    };
    this.unlockedParts = []; // Array of part IDs
    
    // Statistics
    this.stats = {
      totalRuns: 0,
      highestWaveReached: 0,
      totalEnemiesKilled: 0,
      totalScrapEarned: 0,
      bossesDefeated: 0,
      victoriesAchieved: 0
    };
    
    // Settings (bonus: persist player preferences)
    this.settings = {
      audioEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 1.0
    };
  }
  
  // Computed properties
  getSkillModifiers() {
    // Convert spent skill points to actual stat bonuses
    return {
      damage: this.skillPoints.spent.damage * CONFIG.SKILLS.DAMAGE_PER_POINT,
      fireRate: this.skillPoints.spent.fireRate * CONFIG.SKILLS.FIRE_RATE_PER_POINT,
      // ... etc
    };
  }
  
  getPartModifiers() {
    // Aggregate bonuses from equipped parts
    const modifiers = {};
    Object.values(this.equippedParts).forEach(partId => {
      if (partId) {
        const part = PARTS_DATABASE[partId];
        // Merge part.modifiers into modifiers
      }
    });
    return modifiers;
  }
}
```

---

## Data Flow: Run Start

```
Player clicks "Start Run" (in pre-run menu)
         │
         ▼
┌────────────────────┐
│ Load PlayerProfile │ (from localStorage - Phase 2)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Calculate Modifiers│ (skills + parts → permanent modifiers)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Create RunState    │ (fresh state for this run)
│                    │ - Machines: ALL at level 0
│                    │ - Scrap: 0
│                    │ - Wave: 1
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Initialize Robot   │ (baseStats + permanentModifiers)
│                    │ ⚠️ ROBOT STATS NOW LOCKED ⚠️
│                    │ (no skill/part changes until run ends)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Start Game Loop    │
│                    │ - Only machine upgrades available now
│                    │ - Robot stats unchanged during gameplay
└────────────────────┘
```

**Critical**: Once the run starts, robot base stats are **frozen**. Only machine upgrades can provide temporary modifiers during gameplay.

---

## Data Flow: Run End

```
Factory health reaches 0 (or victory)
         │
         ▼
┌────────────────────┐
│ Calculate XP earned│ (based on waves survived, enemies killed)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Discard Run State  │ ❌ Lost:
│                    │   - All scrap
│                    │   - All machine upgrades (back to 0)
│                    │   - Enemies, projectiles, etc.
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Update Profile     │ ✅ Kept:
│                    │   - Add XP → convert to skill points
│                    │   - Add any parts earned
│                    │   - Update statistics
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Save to localStorage│ (PlayerProfile only)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Show Game Over     │ (display rewards: XP earned, parts)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Return to Menu     │ (Phase 2) or Restart (Phase 1)
│                    │ Player can now spend new skill points
└────────────────────┘
```

**Critical**: Machine upgrades are **never saved**. Every run starts with all machines at level 0, creating the "chore layer" that adds tactical depth to each run.

---

## Persistence Layer (Phase 2)

### localStorage Adapter

```javascript
// File: src/systems/PlayerProfileManager.js
class PlayerProfileManager {
  static STORAGE_KEY = 'factory_defense_profile';
  
  static save(profile) {
    try {
      const serialized = JSON.stringify(profile);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      return false;
    }
  }
  
  static load() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) {
        return new PlayerProfile(); // New profile
      }
      
      const data = JSON.parse(serialized);
      return this.migrate(data); // Handle version migrations
    } catch (error) {
      console.error('Failed to load profile:', error);
      return new PlayerProfile(); // Fallback to new profile
    }
  }
  
  static migrate(data) {
    // Handle profile version migrations
    if (!data.version || data.version < '1.0') {
      // Migration logic here
    }
    
    const profile = new PlayerProfile();
    Object.assign(profile, data);
    return profile;
  }
  
  static clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

### Save Points

**When to save**:
1. After run ends (XP earned, parts acquired)
2. After skill points spent (in pre-run menu)
3. After parts equipped/unequipped
4. On settings changes (optional but nice)

**When NOT to save**:
- During gameplay (performance concern)
- On machine upgrades (temporary state)
- On scrap changes (temporary state)

---

## State Migration Strategy

As the game evolves, profile structure will change. Handle migrations:

```javascript
// Version 1.0 → 1.1 migration example
if (data.version === '1.0') {
  // v1.1 added new skill: cooldown
  data.skillPoints.spent.cooldown = 0;
  data.version = '1.1';
}

// Version 1.1 → 1.2 migration example
if (data.version === '1.1') {
  // v1.2 changed parts structure
  data.equippedParts = {
    weapon: data.equippedWeapon || null,
    utility: data.equippedUtility || null,
    passive: null // new slot
  };
  delete data.equippedWeapon;
  delete data.equippedUtility;
  data.version = '1.2';
}
```

**Migration Rules**:
1. Never lose player data
2. Provide sensible defaults for new fields
3. Log migrations for debugging
4. Test migrations thoroughly

---

## Data Validation

### On Load
```javascript
static validate(profile) {
  // Ensure critical fields exist
  if (!profile.skillPoints) {
    profile.skillPoints = { total: 0, available: 0, spent: {} };
  }
  
  // Sanitize invalid values
  if (profile.skillPoints.available < 0) {
    profile.skillPoints.available = 0;
  }
  
  // Fix corrupted data
  if (!Array.isArray(profile.unlockedParts)) {
    profile.unlockedParts = [];
  }
  
  return profile;
}
```

### On Save
```javascript
static sanitize(profile) {
  // Remove temporary data that shouldn't persist
  const clean = { ...profile };
  delete clean.tempData;
  delete clean.runtimeCache;
  
  return clean;
}
```

---

## State Access Patterns

### ❌ BAD: Global state access
```javascript
// Don't do this
const scrap = window.gameState.scrap;
```

### ✅ GOOD: Injected dependencies
```javascript
class MachineSystem {
  constructor(eventBus, scrapManager) {
    this.scrapManager = scrapManager; // Injected
  }
  
  canUpgrade() {
    return this.scrapManager.hasScrap(cost);
  }
}
```

### ✅ GOOD: Event-driven updates
```javascript
// System A changes state
eventBus.emit('scrap:earned', { amount: 10 });

// System B reacts to state change
eventBus.on('scrap:earned', ({ amount }) => {
  this.updateUI(amount);
});
```

---

## Related Documentation

- Understand why states are separate: [Core Principles](01-core-principles.md#1-state-separation-critical)
- See state usage in components: [Component Responsibilities](04-component-responsibilities.md)
- Review persistence implementation: [Implementation Phases](06-implementation-phases.md#phase-2-progression-systems-weeks-4-5)
