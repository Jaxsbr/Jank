# Implementation Milestones: Ranged Combat & Enemy Variety

## Design Analysis

### Current State
- **Combat**: Melee-only for both core and enemies
- **Enemies**: Single type (basic melee sphere)
- **Waves**: 3 rounds per wave with escalating batch sizes and spawn rates
- **Architecture**: Well-structured ECS with attack/targeting systems ready for extension

### Competing Priorities

#### Priority 1: Ranged Combat
**Impact**: Fundamental gameplay change
- Adds spatial positioning depth (range matters)
- Creates new strategic layer (melee vs ranged decision for core)
- Requires new systems: projectiles, ranged attack logic, visual feedback
- Aligns with spec's vision: "melee if close, ranged otherwise"

#### Priority 2: Enemy Variety
**Impact**: Tactical diversity and engagement
- Increases replayability and visual interest
- Supports difficulty scaling through composition
- Requires enemy type system and spawn configuration
- Aligns with spec's enemy roles: "charger, tank, shooter"

## Design Decision: Enemy Variety Approach

### Option A: Mixed Types Per Round
**Pros:**
- Rounds feel more dynamic and unpredictable
- Composition puzzles (tanks + shooters = new challenge)
- Natural difficulty scaling within waves

**Cons:**
- Can feel chaotic or hard to read
- Requires careful balance testing for each mix
- More complex spawn logic

### Option B: Homogeneous Rounds with Wave Progression
**Pros:**
- Clear, readable rounds (Round 1 = chargers, Round 2 = tanks, Round 3 = shooters)
- Predictable escalation (learn patterns)
- Easier to balance and test

**Cons:**
- Can become repetitive ("I know Round 3 is always shooters")
- Less tactical variety within rounds
- May feel less dynamic

### Recommended Hybrid Approach
**Progressive Mixing Strategy:**
- **Early waves (1-3)**: Homogeneous rounds per type (teaching phase)
  - Round 1: All Chargers
  - Round 2: All Tanks  
  - Round 3: All Shooters
- **Mid waves (4-6)**: Two-type mixes (escalation phase)
  - Round 1: Chargers + Tanks
  - Round 2: Tanks + Shooters
  - Round 3: All three types
- **Late waves (7+)**: Varied compositions (mastery phase)
  - Randomized mixes with weighted difficulty
  - Elite variants appear

**Benefits:**
- Teaches enemy types individually first
- Gradually increases complexity
- Maintains readability while adding variety
- Scales difficulty naturally

## Recommended Milestone Sequence

### Milestone 1: Ranged Combat Foundation
**Goal**: Add ranged attacks for core only (enemy ranged comes later)

**Why First?**
- Core ranged is the spec's primary combat mechanic ("melee if close, ranged otherwise")
- Enemies can remain melee-only initially (simpler to test)
- Establishes projectile/range infrastructure that enemies can reuse
- Core is player-controlled; this has immediate gameplay impact

**Tasks:**
1. Create `ProjectileComponent` (position, velocity, damage, lifetime)
2. Create `ProjectileSystem` (movement, collision detection, cleanup)
3. Create `RangedAttackComponent` (range threshold, projectile config)
4. Extend `MeleeAttackSystem` → split into `CombatSystem` with melee/ranged branches
5. Update core targeting: melee within range, ranged otherwise
6. Visual: Simple projectile mesh (energy orb/beam)
7. Config: Ranged range, damage, projectile speed in `CoreEntityConfig`
8. Meta upgrades: Ranged range/range rings (like melee)

**Acceptance Criteria:**
- Core automatically switches between melee/ranged based on target distance
- Projectiles travel and damage enemies on hit
- Visual feedback clear (projectile visible, impact effects)
- Melee/ranged balance feels good (melee stronger but risky, ranged safer but slower)

**Estimated Complexity**: Medium (2-3 systems, projectile lifecycle)

---

### Milestone 2: Basic Enemy Types (Melee Variants)
**Goal**: Add 2-3 distinct melee enemy types with clear roles

**Why Second?**
- Can implement without ranged complexity
- Tests enemy variety system foundation
- Provides immediate visual/tactical diversity
- Melee-only keeps combat readable while adding depth

**Enemy Type Design:**
1. **Charger** (Fast, Low HP, Medium Damage)
   - Speed: High (0.03-0.04)
   - HP: Low (50-60 base)
   - Damage: Medium (6-8)
   - Visual: Smaller sphere, brighter/redder, slight trail
   - Role: Rush the core, pressure early game

2. **Tank** (Slow, High HP, Low Damage)
   - Speed: Low (0.01-0.015)
   - HP: High (150-200 base)
   - Damage: Low (3-4)
   - Visual: Larger sphere, darker/grayscale, thicker
   - Role: Bulky frontline, requires sustained focus

3. **Standard** (Current default)
   - Speed: Medium (0.02)
   - HP: Medium (75 base)
   - Damage: Medium (5)
   - Visual: Current red sphere
   - Role: Baseline enemy

**Tasks:**
1. Create `EnemyType` enum/type system
2. Create enemy type configs (extend `EnemyEntityConfig` with type field)
3. Create `EnemyTypeConfig` mapping (HP, speed, damage, visuals per type)
4. Update `EntityFactory.createEnemyEntity()` to accept enemy type
5. Update `EnemySpawnerSystem` to spawn specific types per round
6. Visual: Material/geometry variants per type
7. Update wave config: Type specification per round
8. Update spawn logic: Wave-based type selection (homogeneous early, mixed later)

**Acceptance Criteria:**
- 3 distinct enemy types spawn with different behaviors
- Visual differences are immediately readable
- Wave progression uses types meaningfully (Round 1 = chargers, etc.)
- Balance: Each type feels distinct but fair

**Estimated Complexity**: Low-Medium (config system + spawn logic)

---

### Milestone 3: Enemy Ranged Attacks
**Goal**: Add ranged attacks to shooter-type enemies

**Why Third?**
- Builds on ranged foundation from Milestone 1
- Enemy ranged adds significant tactical depth (positioning matters)
- Shooter type creates new enemy role (backline threat)
- Can reuse projectile system from core

**Tasks:**
1. Create **Shooter** enemy type
   - HP: Low-Medium (60-70 base)
   - Damage: Medium (6-7)
   - Speed: Medium (0.015-0.02)
   - Range: 4-6 units
   - Visual: Distinct (maybe angular/crystal shape vs spheres)
   - Behavior: Stops and shoots when in range, kites if core gets close
2. Extend enemy `AttackComponent` to support ranged (range threshold)
3. Update enemy attack system to check range and use projectiles
4. Enemy projectile visuals (different from core projectiles)
5. Shooter movement logic: Stop to shoot, retreat if melee threatened
6. Update spawn config: Include shooters in mid/late waves
7. Balance: Shooter damage/range vs core's ability to handle them

**Acceptance Criteria:**
- Shooter enemies attack from range
- They pose a distinct threat (can't be easily melee'd)
- Visual distinction from melee enemies is clear
- Core can counter with ranged attacks (shooters die fast if targeted)

**Estimated Complexity**: Medium (reuse systems but add behavior logic)

---

### Milestone 4: Advanced Enemy Variety & Composition
**Goal**: Expand enemy types, add modifiers, refine spawn composition

**Why Fourth?**
- After ranged works, expand variety
- Adds replayability and depth
- Can experiment with more exotic types

**Tasks:**
1. Add **Elite** variants (1.5x stats, special visual, rare spawns)
2. Add enemy modifiers (fast/slow, armored/weak, etc.)
3. Implement spawn composition system (weighted random, wave-based rules)
4. Visual polish: More distinct shapes/materials per type
5. Optional: **Boss** enemy type (huge HP, multiple phases, unique mechanics)

**Acceptance Criteria:**
- Multiple enemy types coexist meaningfully
- Elite variants feel special but fair
- Composition system allows interesting mixes
- Visual clarity maintained despite variety

**Estimated Complexity**: High (many configs, spawn logic complexity)

---

## Implementation Priority Summary

1. **Milestone 1: Ranged Combat (Core)** ⭐ Start Here
   - Highest impact on gameplay feel
   - Foundation for enemy ranged
   - Aligns with spec's core vision

2. **Milestone 2: Basic Enemy Types** 
   - Quick win for visual/tactical diversity
   - Tests variety system
   - Can be melee-only initially

3. **Milestone 3: Enemy Ranged**
   - Completes the combat triangle (melee/ranged for both sides)
   - Adds significant tactical depth
   - Reuses established systems

4. **Milestone 4: Advanced Variety**
   - Polish and expansion
   - Adds long-term replayability
   - Requires all prior systems stable

## Decision Matrix

| Milestone | Gameplay Impact | Technical Complexity | Visual Polish | Priority |
|-----------|----------------|---------------------|---------------|----------|
| Ranged (Core) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | **1st** |
| Enemy Types (Melee) | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | **2nd** |
| Enemy Ranged | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | **3rd** |
| Advanced Variety | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **4th** |

## Open Questions to Resolve

1. **Projectile Collision**: Hit-scan vs. travel-time? (Travel-time is more interesting but harder)
2. **Ranged Range**: How far should core/enemy ranged reach? (Balance melee vs ranged)
3. **Shooter Behavior**: Stationary shooters vs. moving shooters? (Stationary = easier to counter)
4. **Enemy Type Count**: 3 types (MVP) vs. 5+ (ambitious)? (Start with 3)

## Notes

- Each milestone should be playable and fun before moving to the next
- Balance is iterative; expect adjustments after each milestone
- Visual distinction is critical—players must instantly recognize enemy types
- Ranged combat changes core gameplay feel significantly—test thoroughly before adding enemy variety

