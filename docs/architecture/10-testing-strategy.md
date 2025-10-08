# Testing Strategy

> **Purpose**: Testing approach and manual testing checklists
> 
> **When to read**: Before implementing features, after completing features, during QA

---

## Testing Philosophy

1. **Make it work first** - Get feature working
2. **Then test thoroughly** - Before moving on
3. **Manual testing** - For Phase 1 MVP
4. **Add unit tests** - When time permits or for complex logic

---

## Unit Tests (Recommended)

### Priority for Testing

1. **High Priority**: Core logic
   - Stat calculations (modifier aggregation)
   - Pathfinding algorithms
   - Collision detection
   - Damage calculations

2. **Medium Priority**: State management
   - Event emission
   - State transitions
   - Data persistence

3. **Low Priority**: Rendering
   - Visual tests better than unit tests
   - Manual QA sufficient

### Example Test Structure

```javascript
// tests/entities/Robot.test.js
import { Robot } from '../../src/entities/Robot.js';
import { CONFIG } from '../../config/config.js';

describe('Robot', () => {
  describe('getActualStat', () => {
    it('should sum base, permanent, and temporary modifiers', () => {
      const robot = new Robot(
        { x: 0, y: 0 },
        { damage: 10 },
        { damage: 5 },  // permanent
        { damage: 3 }   // temporary
      );
      
      expect(robot.getActualStat('damage')).toBe(18);
    });
    
    it('should handle missing modifiers gracefully', () => {
      const robot = new Robot({ x: 0, y: 0 }, { damage: 10 });
      expect(robot.getActualStat('damage')).toBe(10);
    });
  });
  
  describe('updateFiring', () => {
    it('should fire when enough time has elapsed', () => {
      const robot = new Robot({ x: 0, y: 0 }, { fireRate: 1.0 });
      robot.currentTarget = { position: { x: 100, y: 100 } };
      
      const fireSpy = jest.spyOn(robot, 'fire');
      
      robot.updateFiring(1.5); // 1.5 seconds = 1.5 shots at 1.0 fire rate
      
      expect(fireSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Test File Organization

Mirror `src/` structure:
```
/tests/
  /core/
    EventBus.test.js
  /entities/
    Robot.test.js
    Enemy.test.js
  /systems/
    CombatSystem.test.js
    WaveSystem.test.js
```

---

## Manual Testing Checklists

### Phase 1: Core MVP

#### Grid & Rendering
- [ ] Grid renders correctly (12x12 tiles)
- [ ] Tiles display different colors/sprites
- [ ] Walls block pathfinding
- [ ] Machine tiles visible
- [ ] No rendering glitches or flicker

#### Robot
- [ ] Robot appears in correct position
- [ ] Robot faces toward target
- [ ] Robot auto-targets nearest enemy
- [ ] Clicking enemy selects target (manual override)
- [ ] Robot fires projectiles at target
- [ ] Fire rate matches expected (visual timing check)

#### Enemies
- [ ] Enemy spawns at correct location
- [ ] Enemy follows path to goal
- [ ] Enemy moves smoothly (no jittering)
- [ ] Health bar displays correctly
- [ ] Health bar updates when damaged
- [ ] Enemy dies when health reaches 0
- [ ] Enemy disappears when reaching goal

#### Combat
- [ ] Projectiles spawn from robot position
- [ ] Projectiles travel toward target
- [ ] Projectiles hit enemies
- [ ] Damage numbers appear (if implemented)
- [ ] Enemy health decreases on hit
- [ ] Multiple projectiles don't interfere

#### Economy
- [ ] Scrap awarded when enemy dies
- [ ] Scrap counter updates correctly
- [ ] Can upgrade Energy machine with scrap
- [ ] Scrap deducted after upgrade
- [ ] Machine level indicator updates
- [ ] Cannot upgrade without enough scrap
- [ ] Cannot upgrade beyond max level

#### Machines
- [ ] Energy machine level 1 increases fire rate (visually noticeable)
- [ ] Energy machine level 2 increases fire rate more
- [ ] Energy machine level 3 increases fire rate even more
- [ ] Machine sprite changes with upgrade level

#### Waves
- [ ] Wave timer counts down
- [ ] New wave spawns after interval
- [ ] Wave counter displays correctly
- [ ] Enemy composition matches wave definition
- [ ] Wave completes when all enemies dead/reached goal
- [ ] Difficulty increases with wave number

#### Factory Health
- [ ] Factory health displays correctly
- [ ] Health decreases when enemy reaches goal
- [ ] Different enemies deal correct damage
- [ ] Game over triggers when health reaches 0
- [ ] Game over screen displays correctly

#### HUD
- [ ] Wave counter visible
- [ ] Factory health bar visible
- [ ] Scrap counter visible
- [ ] Machine upgrade buttons visible
- [ ] All UI elements update in real-time
- [ ] No UI elements overlap or obscure gameplay

---

### Phase 2: Progression Systems

#### XP & Skill Points
- [ ] XP earned at run end
- [ ] XP calculation correct (waves * 10 + kills * 1)
- [ ] XP converts to skill points
- [ ] Skill points added to profile
- [ ] Skill point counter displays correctly

#### Skill Tree
- [ ] Can unlock skills from tree
- [ ] Skill points deducted correctly
- [ ] Cannot unlock without enough points
- [ ] Prerequisites enforced
- [ ] Skills persist after page refresh
- [ ] Skill effects apply on next run

#### Persistence
- [ ] Profile saves to localStorage
- [ ] Profile loads on game start
- [ ] Stats persist (highest wave, total runs, etc.)
- [ ] Page refresh doesn't lose data
- [ ] Clear data button works (if implemented)

#### Parts
- [ ] Parts drop from waves
- [ ] Parts added to inventory
- [ ] Can equip parts
- [ ] Can unequip parts
- [ ] Part bonuses apply correctly
- [ ] Parts persist after page refresh

#### Pre-Run Menu
- [ ] Menu displays correctly
- [ ] Can view skill tree
- [ ] Can view parts inventory
- [ ] Can start run from menu
- [ ] Stats display correctly
- [ ] Navigation works smoothly

---

## Regression Testing

### After Each Major Change

Test that previous features still work:

**Quick Regression Checklist** (5 minutes):
- [ ] Game starts without errors
- [ ] Can play through wave 1
- [ ] Robot shoots enemies
- [ ] Enemies die and award scrap
- [ ] Can upgrade machine
- [ ] Factory health decreases when enemy reaches goal
- [ ] Game over works

**Full Regression** (30 minutes):
- Run through all Phase 1 checklist items
- Run through applicable Phase 2 checklist items
- Test edge cases

---

## Performance Testing

### Frame Rate
- [ ] Consistent 60fps with 10 enemies
- [ ] No drops with 20 enemies
- [ ] No drops with 50 projectiles
- [ ] No memory leaks over long sessions

### Load Time
- [ ] Initial load < 3 seconds
- [ ] Asset loading doesn't block gameplay
- [ ] No noticeable lag when spawning enemies

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile browsers (Phase 6)

---

## Bug Reporting Template

When reporting bugs found during testing:

```
**Bug**: [Short description]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Frequency**:
[Always / Sometimes / Rare]

**Console Errors**:
```
[Paste any errors here]
```

**Additional Context**:
[Screenshots, browser info, etc.]
```

---

## Testing Before Commits

Before committing any code:
1. **Test the feature** - Does it work?
2. **Test related features** - Did you break anything?
3. **Test edge cases** - What happens at boundaries?
4. **Visual check** - Does it look right?
5. **Performance check** - Any frame rate drops?

---

## Related Documentation

- See manual testing as part of phases: [Implementation Phases](06-implementation-phases.md)
- Understand what to test: [Component Responsibilities](04-component-responsibilities.md)
- See testing in workflow: [Handoff Checklist](11-handoff-checklist.md)
