# Communication Patterns

> **Purpose**: How systems talk to each other
> 
> **When to read**: Before implementing cross-system interactions, adding new events

---

## Primary Pattern: Event-Driven

**Use for**: 
- Cross-system notifications
- Loosely coupled interactions
- Triggering multiple side effects

###

 Example Flow

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

### Benefits

- Add new listeners without modifying existing code
- Features can be enabled/disabled easily
- Clear separation of concerns
- Easy to debug (trace event flow)

---

## Secondary Pattern: Direct Injection

**Use for**:
- Core utilities (Config, EventBus)
- Performance-critical paths
- Clear ownership relationships

### Example

```javascript
class GameLoop {
  constructor() {
    this.eventBus = new EventBus();
    this.config = CONFIG;
    
    // Systems own their dependencies
    this.scrapManager = new ScrapManager(this.eventBus);
    this.machineSystem = new MachineSystem(this.eventBus, this.scrapManager);
    this.robot = new Robot(position, baseStats, permanentModifiers);
  }
}
```

---

## Event Naming Convention

Format: `domain:action`

### Examples

```javascript
// Good
'enemy:killed'
'player:moved'
'machine:upgraded'
'wave:started'

// Bad
'killEnemy'          // Not descriptive of what happened
'enemyDead'          // Missing domain
'ENEMY_KILLED'       // Wrong case
```

### Tense

Use **past tense** for completed actions:
- ✅ `enemy:killed` (action completed)
- ❌ `enemy:kill` (sounds like a command)

---

## Event Catalog

See [Component Responsibilities](04-component-responsibilities.md#1-eventbus) for complete event list.

---

## Anti-Patterns to Avoid

### ❌ Direct System Calls

```javascript
// BAD: Tight coupling
class EnemySystem {
  enemyDied(enemy) {
    scrapManager.addScrap(enemy.scrapValue);     // Direct call
    waveSystem.decrementEnemyCount();            // Direct call
    statsTracker.incrementKills();               // Direct call
  }
}
```

### ✅ Event-Driven Alternative

```javascript
// GOOD: Loose coupling
class EnemySystem {
  enemyDied(enemy) {
    eventBus.emit('enemy:killed', { enemy }); // Single event
  }
}

// Other systems listen independently
eventBus.on('enemy:killed', ({ enemy }) => scrapManager.addScrap(enemy.scrapValue));
eventBus.on('enemy:killed', () => waveSystem.decrementCount());
eventBus.on('enemy:killed', () => statsTracker.incrementKills());
```

### ❌ Global State Access

```javascript
// BAD
const scrap = window.gameState.scrap;
```

### ✅ Injected Dependencies

```javascript
// GOOD
class MachineSystem {
  constructor(eventBus, scrapManager) {
    this.scrapManager = scrapManager; // Injected
  }
  
  canUpgrade() {
    return this.scrapManager.hasScrap(cost);
  }
}
```

---

## When to Use Which Pattern

| Scenario | Pattern | Why |
|----------|---------|-----|
| System A notifies multiple systems | Event | Loose coupling, extensibility |
| System needs Config values | Injection | Clear dependency |
| System needs another specific system | Injection | Direct relationship |
| User action triggers update | Event | UI decoupled from logic |
| Performance-critical loop | Direct | Avoid event overhead |
| Optional feature (like VFX) | Event | Can be disabled easily |

---

## Event Listener Cleanup

Remember to remove listeners when systems are destroyed:

```javascript
class SomeSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.handleKill = this.handleEnemyKilled.bind(this);
    this.eventBus.on('enemy:killed', this.handleKill);
  }
  
  destroy() {
    this.eventBus.off('enemy:killed', this.handleKill);
  }
  
  handleEnemyKilled({ enemy }) {
    // Handle event
  }
}
```

**When cleanup matters**:
- Long-running game sessions
- Dynamic system creation/destruction
- Testing (avoid listener leaks between tests)

---

## Debugging Event Flow

### Add Event Logging

```javascript
// In EventBus for debugging
emit(eventName, data) {
  if (CONFIG.DEBUG.LOG_EVENTS) {
    console.log(`[EVENT] ${eventName}`, data);
  }
  
  if (this.listeners[eventName]) {
    this.listeners[eventName].forEach(callback => callback(data));
  }
}
```

### Trace Event Chain

```javascript
// Log which systems are listening
on(eventName, callback) {
  if (CONFIG.DEBUG.LOG_EVENTS) {
    console.log(`[LISTENER] ${callback.name || 'anonymous'} → ${eventName}`);
  }
  
  if (!this.listeners[eventName]) {
    this.listeners[eventName] = [];
  }
  this.listeners[eventName].push(callback);
}
```

---

## Performance Considerations

### Event Overhead

Events have minimal overhead but add up at scale:
- ✅ Use events for gameplay logic (dozens per second)
- ❌ Don't use events in tight loops (thousands per second)

### Example: Good

```javascript
// Game loop emits events for major actions
update() {
  enemies.forEach(enemy => {
    enemy.update(deltaTime);
    // Enemy emits 'enemy:died' if health reaches 0
  });
}
```

### Example: Bad

```javascript
// DON'T emit events for every pixel of movement
update() {
  enemy.x += speed * deltaTime;
  eventBus.emit('enemy:moved', { x: enemy.x }); // Too frequent!
}
```

---

## Related Documentation

- See all events: [Component Responsibilities](04-component-responsibilities.md#1-eventbus)
- Understand why events: [Core Principles](01-core-principles.md#3-event-driven-communication)
- See usage examples: [Critical Design Patterns](07-critical-patterns.md#pattern-4-event-driven-side-effects)
