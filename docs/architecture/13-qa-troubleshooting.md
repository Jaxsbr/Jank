# Q&A / Troubleshooting

> **Purpose**: Common questions and their answers
> 
> **When to read**: When stuck, confused, or curious about implementation details

---

## Architecture Questions

### Q: Why separate RunState and PlayerProfile?
**A**: Phase 2 adds persistent progression. If we mix temporary and permanent state, refactoring is painful. Separating now means Phase 2 is just adding new code, not refactoring existing code.

The "chore layer" of machines resetting creates strategic depth - even with strong robot stats, you still need to execute well within each run.

---

### Q: When can the player upgrade their robot stats?
**A**: **ONLY in the pre-run menu** (between runs). Once "Start Run" is clicked, robot stats are LOCKED for the entire run. During gameplay, only machine upgrades provide temporary bonuses.

This is intentional design to create two distinct progression systems:
- **Meta-progression**: Robot gets permanently stronger (skills, parts)
- **Tactical progression**: Must rebuild machines each run

---

### Q: Why don't machine upgrades persist between runs?
**A**: This is intentional design - the "chore layer". It creates:
1. **Strategic timing decisions** (upgrade Heat before frost boss?)
2. **Economic management** (invest early in Energy for scrap farming?)
3. **Run-to-run variety** (different upgrade paths each run)
4. **Prevents trivializing content** (can't just max all machines permanently)

The challenge is: even with strong robot stats, you still need to execute well within each run.

---

### Q: How do machine upgrades apply to robot?
**A**: Machine upgraded → emit `machine:upgraded` event → Robot listens → updates `temporaryModifiers` → next attack uses new stats.

Flow:
```
1. Player clicks upgrade button
2. MachineSystem.upgradeMachine()
3. Emits 'machine:upgraded' event
4. Robot hears event
5. Updates temporaryModifiers.fireRate (or damage, etc.)
6. robot.getActualStat('fireRate') now returns higher value
7. Next fire() call uses new rate
```

---

### Q: How do skill points apply to robot?
**A**: On run start → load PlayerProfile → calculate `permanentModifiers` from skills → pass to Robot constructor → Robot stores them separately from `temporaryModifiers`.

Flow:
```
1. Pre-run menu: player spends skill points
2. Click "Start Run"
3. PlayerProfile.getSkillModifiers() calculates bonuses
4. new Robot(pos, base, permanentMods)
5. Robot locked for entire run
6. Skills don't change until next run
```

---

### Q: Where does pathfinding happen?
**A**: Pre-calculated when map loads. Stored as array of waypoints. Enemy just follows waypoints, no runtime pathfinding.

```
1. Map loads → PathfindingSystem.calculatePaths()
2. Stores paths for each spawn point
3. Enemy spawns → gets precalculated path
4. Enemy.moveAlongPath() just follows waypoints
5. No A* running during gameplay
```

**Why**: Performance. A* is expensive, don't run every frame.

---

### Q: Why not use a game framework like Phaser?
**A**: Lighter weight for this scope. We only need canvas rendering and game loop. Framework overhead not justified for 2-5 minute web game.

Also: Learning opportunity to understand game architecture from scratch.

---

## Implementation Questions

### Q: Can I add [feature] to Phase 1?
**A**: Only if it's in the Phase 1 checklist. Scope discipline is critical. Feature creep destroys timelines.

If you think something should be in Phase 1 that isn't, discuss with team first. Have clear rationale for why it's essential for MVP.

---

### Q: What if a file exceeds 400 lines?
**A**: Stop and refactor immediately. Split by responsibility. 

Example: CombatSystem could split into:
- `ProjectileManager.js` - Manage projectile lifecycle
- `CollisionDetector.js` - Detect collisions
- `DamageApplicator.js` - Apply damage and effects

See [Directory Structure](08-directory-structure.md#file-splitting-strategy)

---

### Q: Should I use events or direct calls?
**A**: 
- **Events**: Cross-system notifications, optional features, triggering multiple side effects
- **Direct calls**: Clear ownership, performance-critical paths, simple queries

See [Communication Patterns](05-communication-patterns.md) for details.

---

### Q: Where do I put this constant?
**A**: In `config/config.js`. Always. No exceptions.

Even if you only use it once, it might change during balancing. Config is single source of truth.

---

### Q: How do I test my changes?
**A**: 
1. **Manual testing first** - Does it work? See [Testing Strategy](10-testing-strategy.md)
2. **Regression testing** - Did you break anything?
3. **Unit tests if complex** - Pathfinding, collision, calculations

---

## Common Issues

### Issue: Robot not firing

**Symptoms**: Robot targets enemy but no projectiles appear

**Possible Causes**:
1. Fire rate calculation wrong (dividing by zero?)
2. EventBus not wired up (`projectile:spawn` not heard by CombatSystem)
3. Target out of range
4. timeSinceLastShot not updating

**Debug**:
```javascript
console.log('Fire rate:', this.getActualStat('fireRate'));
console.log('Fire interval:', 1.0 / this.getActualStat('fireRate'));
console.log('Time since last shot:', this.timeSinceLastShot);
console.log('Has target:', !!this.currentTarget);
```

---

### Issue: Machine upgrade doesn't affect robot

**Symptoms**: Upgrade machine, robot stats don't change

**Possible Causes**:
1. Robot not listening to `machine:upgraded` event
2. temporaryModifiers not being updated
3. getActualStat() not summing correctly
4. Machine bonus config wrong

**Debug**:
```javascript
// In Robot.constructor
this.eventBus.on('machine:upgraded', (data) => {
  console.log('Machine upgraded:', data);
  console.log('Before modifiers:', this.temporaryModifiers);
  // Update modifiers
  console.log('After modifiers:', this.temporaryModifiers);
  console.log('Actual fire rate:', this.getActualStat('fireRate'));
});
```

---

### Issue: Enemies not pathfinding correctly

**Symptoms**: Enemies walk through walls, get stuck, or go wrong direction

**Possible Causes**:
1. Path calculation wrong (A* implementation bug)
2. Grid data doesn't match visuals
3. Enemy speed too high (overshooting waypoints)
4. Path not precalculated

**Debug**:
```javascript
// Visualize paths
if (CONFIG.DEBUG.SHOW_PATHS) {
  ctx.beginPath();
  enemy.path.forEach((waypoint, i) => {
    if (i === 0) {
      ctx.moveTo(waypoint.x, waypoint.y);
    } else {
      ctx.lineTo(waypoint.x, waypoint.y);
    }
  });
  ctx.strokeStyle = 'yellow';
  ctx.stroke();
}
```

---

### Issue: Scrap not awarded

**Symptoms**: Kill enemy, no scrap

**Possible Causes**:
1. ScrapManager not listening to `enemy:killed`
2. Enemy.die() not emitting event
3. Enemy scrapValue is 0 or undefined
4. Event emitted but with wrong data structure

**Debug**:
```javascript
// In Enemy.die()
console.log('Enemy dying, scrapValue:', this.scrapValue);
this.eventBus.emit('enemy:killed', {
  enemy: this,
  scrapValue: this.scrapValue
});

// In ScrapManager
this.eventBus.on('enemy:killed', (data) => {
  console.log('Enemy killed event heard:', data);
  this.addScrap(data.scrapValue);
});
```

---

### Issue: Game Over not triggering

**Symptoms**: Factory health reaches 0, game continues

**Possible Causes**:
1. Not checking factory health after enemy reaches goal
2. Game over condition wrong (< 0 instead of <= 0)
3. Not emitting `game:over` event
4. GameLoop not listening to `game:over`

**Debug**:
```javascript
// When enemy reaches goal
console.log('Enemy reached goal, factory damage:', enemy.factoryDamage);
console.log('Factory health before:', this.factoryHealth);
this.factoryHealth -= enemy.factoryDamage;
console.log('Factory health after:', this.factoryHealth);

if (this.factoryHealth <= 0) {
  console.log('Game over!');
  this.eventBus.emit('game:over', { reason: 'factory_destroyed' });
}
```

---

## Performance Issues

### Issue: Frame rate drops with many enemies

**Solutions**:
1. **Object pooling** for projectiles (Phase 4)
2. **Spatial partitioning** for collision detection
3. **Limit simultaneous enemies** (wave design)
4. **Optimize rendering** (don't redraw static elements)

See [System Overview](02-system-overview.md) for optimization strategies.

---

### Issue: High memory usage

**Solutions**:
1. **Remove event listeners** when systems destroyed
2. **Clean up inactive projectiles** regularly
3. **Don't keep references** to dead enemies
4. **Check for memory leaks** in browser dev tools

---

## Debugging Tips

### Enable Debug Mode

```javascript
// In config/config.js
DEBUG: {
  ENABLED: true,
  SHOW_GRID: true,
  SHOW_PATHS: true,
  SHOW_COLLISION: true,
  SHOW_FPS: true,
  LOG_EVENTS: true,
}
```

### Add Keyboard Shortcuts

```javascript
// Helpful debugging shortcuts
window.addEventListener('keydown', (e) => {
  if (e.key === 'p') {
    // Print current state
    console.log('RunState:', runState);
    console.log('Robot:', robot);
    console.log('Enemies:', enemies.length);
  }
  if (e.key === 'k') {
    // Kill all enemies
    enemies.forEach(e => e.die(true));
  }
  if (e.key === 's') {
    // Add scrap
    scrapManager.addScrap(1000);
  }
});
```

---

## Still Stuck?

If your question isn't answered here:
1. Check relevant architecture doc section
2. Search codebase for similar implementations
3. Ask team/AI assistant
4. **Add your question and answer here** once resolved!

---

## Related Documentation

- Understand architecture: [Core Principles](01-core-principles.md)
- See how systems work: [Component Responsibilities](04-component-responsibilities.md)
- See decisions rationale: [Architecture Decisions Log](12-decisions-log.md)
