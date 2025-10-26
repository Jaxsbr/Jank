# ECS Architecture Refactoring TODO

## How to Process This Document

**IMPORTANT: Follow these guidelines strictly to maintain code quality and stability**

1. **Address only ONE phase at a time** - Do not skip ahead or work on multiple phases simultaneously
2. **Complete all sub-tasks within a phase** before moving to the next phase
3. **Mark sub-tasks as done** using `[x]` when completed
4. **Perform manual regression testing** after completing all sub-tasks in a phase:
   - Verify existing entities (core + enemies) still render correctly
   - Test combat system (targeting, attacking, damage, death)
   - Test movement system (enemy movement)
   - Test tile effects (visual effects, activation)
   - Check console for errors
   - Verify no performance degradation
5. **Commit changes after each phase** is fully completed AND regression testing is successful
   - Use descriptive commit messages referencing the phase
   - Example: `refactor: Phase 1 - Create EntityManager and centralize entity lifecycle`
6. **Do not proceed to next phase** if regression tests fail - fix issues first

---

## Phase 1: Create EntityManager (Critical - Foundation)

**Goal:** Centralize entity lifecycle management and remove direct entity array mutations from systems.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [x] Create `src/ecs/EntityManager.ts`
  - [x] Implement `createEntity()` method
  - [x] Implement `destroyEntity(entity: Entity)` method
  - [x] Implement `destroyEntityById(id: string)` method
  - [x] Implement `getEntities(): readonly Entity[]` method
  - [x] Implement `findEntityById(id: string): Entity | null` method
  - [x] Add internal entity array management
  - [x] Dispatch `EntityCreated` and `EntityDestroyed` events via EventDispatcher

- [x] Update `src/systems/eventing/EventType.ts`
  - [x] Add `EntityCreated` event type
  - [x] Add `EntityDestroyed` event type (if not already present)

- [x] Refactor `EntityFactory` to use `EntityManager`
  - [x] Pass `EntityManager` instance to constructor instead of managing entities array
  - [x] Call `entityManager.createEntity()` instead of `new Entity()`
  - [x] Remove `entities: Entity[] = []` field
  - [x] Remove `getEntities()` method (EntityManager provides this)
  - [x] Update `createCoreEntity()` to use EntityManager
  - [x] Update `createEnemyEntity()` to use EntityManager

- [x] Refactor `CombatSystem` to remove entity array management
  - [x] Remove `entities: Entity[] = []` field
  - [x] Remove `setEntities()` method
  - [x] Update `handleEntityDeath()` to dispatch event only (no array manipulation)
  - [x] Remove scene cleanup logic (will be handled by new system in Phase 2)
  - [x] Accept `EventDispatcher` instance via constructor instead of using global

- [x] Refactor `TargetingSystem` to remove entity storage
  - [x] Remove `entities: Entity[] = []` field
  - [x] Remove line 42: `this.entities = [...entities];`
  - [x] Update `clearEntityAsTarget()` to accept entities parameter
  - [x] Accept `EventDispatcher` instance via constructor instead of using global

- [x] Refactor `DamageVisualSystem` to remove entity storage
  - [x] Remove `entities: Entity[] = []` field
  - [x] Remove `setEntities()` method
  - [x] Update `handleDamageTaken()` to receive entity reference via event args
  - [x] Accept `EventDispatcher` instance via constructor instead of using global

- [x] Update `main.ts` to use EntityManager
  - [x] Create `EntityManager` instance
  - [x] Pass EntityManager to EntityFactory constructor
  - [x] Pass EventDispatcher instance to systems (not global)
  - [x] Remove all `setEntities()` calls
  - [x] Get entities from `entityManager.getEntities()` in animation loop

- [x] Update `EntityFinder` utility (or deprecate it)
  - [x] Consider moving functionality into EntityManager
  - [x] Or update to work with readonly entity arrays

**Regression Testing Checklist (USER MUST PERFORM):**
- [x] Core entity renders and animates correctly
- [x] Enemy entity spawns and moves toward core
- [x] Combat works (targeting, attacking, damage flash)
- [x] Entity death removes entity from scene
- [x] No console errors in browser dev tools
- [x] Performance is acceptable (no stuttering/frame drops)
- [x] All visual effects work as before refactor

**IMPORTANT:** The AI cannot perform actual regression testing. The user must:
1. Open the application at http://localhost:5174/Jank/
2. Test all functionality listed above
3. Report any issues found
4. Only proceed to commit after confirming all tests pass

**Commit after successful regression testing**

---

## Phase 2: Split CombatSystem Responsibilities (Critical - SRP)

**Goal:** Separate concerns and create focused systems that each do one thing well.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [ ] Create `src/entities/systems/EntityCleanupSystem.ts`
  - [ ] Implement `IEventListener` interface
  - [ ] Listen for `EntityDestroyed` events
  - [ ] Handle scene cleanup (remove GeometryComponent from scene)
  - [ ] Handle any other cleanup needed (dispose geometries, materials, etc.)
  - [ ] Accept Scene and EventDispatcher via constructor

- [ ] Refactor `CombatSystem` to focus only on damage application
  - [ ] Rename to `DamageSystem` (optional but clearer)
  - [ ] Keep only damage application logic
  - [ ] Keep death detection (HP reaches 0)
  - [ ] Dispatch `EntityDeath` event when entity dies
  - [ ] Remove all scene manipulation code
  - [ ] Remove all entity array manipulation code (should be done from Phase 1)

- [ ] Update `main.ts` to include new systems
  - [ ] Create `EntityCleanupSystem` instance
  - [ ] Add to system update loop (or just register as event listener)
  - [ ] Ensure proper system initialization order

- [ ] Update system destruction/cleanup
  - [ ] Ensure all systems properly deregister from EventDispatcher
  - [ ] Add `destroy()` method to EntityCleanupSystem

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] Entity death still works correctly
- [ ] Dead entities are removed from scene
- [ ] Dead entities are removed from entity list
- [ ] No memory leaks (check with browser dev tools)
- [ ] Combat flow unchanged from user perspective
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 3: Refactor EntityFactory (Important - DRY)

**Goal:** Eliminate code duplication between createCoreEntity and createEnemyEntity.

**Estimated Time:** 1.5-2 hours

### Sub-tasks:

- [ ] Extract geometry calculation into private method
  - [ ] Create `createSecondaryGeometryConfigs(config: GeometryConfig): SecondaryGeometryConfig[]`
  - [ ] Move lines 36-58 logic into this method
  - [ ] Handle embed depth calculation
  - [ ] Handle position normalization
  - [ ] Return array of SecondaryGeometryConfig

- [ ] Extract common component creation
  - [ ] Create `addBaseComponents(entity: Entity, config: BaseEntityConfig): void`
  - [ ] Add HealthComponent
  - [ ] Add PositionComponent
  - [ ] Add GeometryComponent
  - [ ] Add RotationComponent
  - [ ] Add BobAnimationComponent

- [ ] Extract combat component creation
  - [ ] Create `addCombatComponents(entity: Entity, config: CombatConfig, team: TeamType): void`
  - [ ] Add TeamComponent
  - [ ] Add AttackComponent
  - [ ] Add TargetComponent
  - [ ] Add AttackAnimationComponent

- [ ] Extract scene setup
  - [ ] Create `addEntityToScene(entity: Entity, geometryComponent: GeometryComponent, position: Vector3): void`
  - [ ] Set geometry group position
  - [ ] Add to scene

- [ ] Refactor `createCoreEntity()` to use extracted methods
  - [ ] Call `createSecondaryGeometryConfigs()`
  - [ ] Call `addBaseComponents()`
  - [ ] Call `addCombatComponents()`
  - [ ] Call `addEntityToScene()`
  - [ ] Keep only core-specific logic

- [ ] Refactor `createEnemyEntity()` to use extracted methods
  - [ ] Call `createSecondaryGeometryConfigs()`
  - [ ] Call `addBaseComponents()`
  - [ ] Call `addCombatComponents()`
  - [ ] Add MovementComponent (enemy-specific)
  - [ ] Call `addEntityToScene()`
  - [ ] Keep only enemy-specific logic

- [ ] Create type definitions for shared config structure
  - [ ] Define `BaseEntityConfig` interface
  - [ ] Define `CombatConfig` interface
  - [ ] Update existing config types to extend these

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] Core entity still renders with correct appearance
- [ ] Enemy entity still renders with correct appearance
- [ ] Both entities have all expected components
- [ ] No visual differences from before refactor
- [ ] No console errors
- [ ] Code is more readable and maintainable

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 4: Fix TileEffectTrigger Event Pattern (Important - Event System)

**Goal:** Replace command-style events with proper state-based tile effect triggering.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [ ] Design new tile effect trigger system
  - [ ] Decide on trigger mechanisms (proximity, cooldown, manual activation)
  - [ ] Document the new approach in comments

- [ ] Create proper event types for tile interactions
  - [ ] Add `EntityEnteredTileRange` event (entity approaches tile)
  - [ ] Add `EntityExitedTileRange` event (entity leaves tile)
  - [ ] Add `TileEffectActivated` event (tile effect starts - informational)
  - [ ] Add `TileEffectDeactivated` event (tile effect ends - informational)
  - [ ] Remove `TileEffectTrigger` event type

- [ ] Create `src/tiles/systems/TileProximitySystem.ts`
  - [ ] Implement `IEntitySystem` interface
  - [ ] Track which entities are near which tiles
  - [ ] Dispatch `EntityEnteredTileRange` when entity gets close
  - [ ] Dispatch `EntityExitedTileRange` when entity moves away
  - [ ] Use configurable radius for proximity detection
  - [ ] Use TileGrid for spatial queries

- [ ] Refactor `TileEffectSystem`
  - [ ] Remove `onEvent()` method handling `TileEffectTrigger`
  - [ ] Add `onEvent()` handling for `EntityEnteredTileRange` (optional trigger)
  - [ ] Implement automatic activation based on cooldowns
  - [ ] Implement activation based on proximity (if tile has proximity trigger)
  - [ ] Dispatch `TileEffectActivated` when effect starts
  - [ ] Dispatch `TileEffectDeactivated` when effect ends
  - [ ] Remove entity index-based activation

- [ ] Add tile trigger configuration
  - [ ] Add `TileTriggerComponent` (defines how tile activates)
  - [ ] Support trigger types: AUTO (cooldown), PROXIMITY, MANUAL, ALWAYS_ON
  - [ ] Update TileFactory to add trigger components

- [ ] Update `main.ts`
  - [ ] Remove manual tile effect triggering code (lines 72-117)
  - [ ] Add TileProximitySystem to system list
  - [ ] Remove random activation timer logic

- [ ] Update tile configs to specify trigger behavior
  - [ ] Update CENTER tile config (always on)
  - [ ] Update TileType.ONE config (auto with cooldown)
  - [ ] Update TileType.TWO config (proximity-based)
  - [ ] Update TileType.THREE config (auto with cooldown)

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] Tile effects still activate and display correctly
- [ ] Center tile always shows effect
- [ ] Other tiles activate based on new trigger system
- [ ] Proximity-based triggers work when entities approach
- [ ] No more entity index errors
- [ ] Event flow is logical and traceable
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 5: Standardize Time Units (Important - Consistency)

**Goal:** Use seconds consistently throughout the codebase and create time utility.

**Estimated Time:** 1-2 hours

### Sub-tasks:

- [ ] Create `src/utils/Time.ts`
  - [ ] Create `Time` class with static methods
  - [ ] Implement `now(): number` (returns seconds)
  - [ ] Implement `deltaTime: number` (calculated each frame)
  - [ ] Implement `update(currentTimeMs: number): void` (call each frame)
  - [ ] Add JSDoc comments explaining time is in seconds

- [ ] Update `AttackComponent` to use seconds
  - [ ] Change `cooldownDuration` from milliseconds to seconds
  - [ ] Update JSDoc comments
  - [ ] Update `canAttack()` logic (already correct, just units change)
  - [ ] Update `getTimeUntilNextAttack()` to return seconds

- [ ] Update `AttackAnimationComponent` to use seconds
  - [ ] Change duration from milliseconds to seconds
  - [ ] Update all time-related calculations

- [ ] Update all entity configs to use seconds
  - [ ] Update `CoreEntityConfig` cooldown (1000ms → 1.0s)
  - [ ] Update `CoreEntityConfig` animation duration (200ms → 0.2s)
  - [ ] Update `EnemyEntityConfig` cooldown
  - [ ] Update `EnemyEntityConfig` animation duration
  - [ ] Add comments indicating units are seconds

- [ ] Update `MeleeAttackSystem`
  - [ ] Replace `Date.now()` with `Time.now()`
  - [ ] Verify all time comparisons work with seconds

- [ ] Update `DamageVisualSystem`
  - [ ] Replace `Date.now()` with `Time.now()`
  - [ ] Update flash duration to seconds
  - [ ] Update all time calculations

- [ ] Update `TileEffectSystem`
  - [ ] Already uses seconds, verify consistency
  - [ ] Replace `performance.now() / 1000` with `Time.now()`

- [ ] Update `TileAnimationSystem`
  - [ ] Replace `performance.now() / 1000` with `Time.now()`
  - [ ] Use `Time.deltaTime` instead of hardcoded 1/60

- [ ] Update `main.ts`
  - [ ] Initialize Time system
  - [ ] Call `Time.update()` at start of animation loop
  - [ ] Replace `performance.now()` calls with `Time.now()`
  - [ ] Replace `Date.now()` calls with `Time.now()`

- [ ] Add time unit tests
  - [ ] Test Time.now() returns seconds
  - [ ] Test Time.deltaTime is calculated correctly
  - [ ] Test time-based components work with new system

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] Attack cooldowns work correctly (feel the same)
- [ ] Attack animations have correct duration
- [ ] Tile effects have correct timing
- [ ] Bob animations are smooth
- [ ] No timing-related bugs
- [ ] All time-based features work as before
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 6: Create EntityQuery System (Nice-to-have - Code Quality)

**Goal:** Reduce boilerplate when querying entities by components.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [ ] Create `src/ecs/EntityQuery.ts`
  - [ ] Implement `withComponents<T>()` method
  - [ ] Return array of entities matching all component types
  - [ ] Return strongly-typed component tuples
  - [ ] Add optional `filter()` callback for additional criteria
  - [ ] Add JSDoc with usage examples

- [ ] Create type helpers
  - [ ] Define `ComponentType<T>` type
  - [ ] Define `QueryResult<T>` type for typed results
  - [ ] Ensure type safety with generics

- [ ] Refactor `TargetingSystem` to use EntityQuery
  - [ ] Replace manual component checks with query
  - [ ] Simplify entity filtering logic
  - [ ] Reduce null checks

- [ ] Refactor `MeleeAttackSystem` to use EntityQuery
  - [ ] Replace manual component checks with query
  - [ ] Simplify entity iteration

- [ ] Refactor `MovementSystem` to use EntityQuery
  - [ ] Replace manual component checks with query
  - [ ] Simplify entity filtering

- [ ] Refactor `BobAnimationSystem` to use EntityQuery
  - [ ] Replace manual component checks with query

- [ ] Refactor `RotationSystem` to use EntityQuery
  - [ ] Replace manual component checks with query

- [ ] Refactor `AttackAnimationSystem` to use EntityQuery
  - [ ] Replace manual component checks with query

- [ ] Refactor `TileEffectSystem` to use EntityQuery
  - [ ] Replace manual component checks with query
  - [ ] Simplify tile filtering logic

- [ ] Refactor `TileAnimationSystem` to use EntityQuery
  - [ ] Replace manual component checks with query

- [ ] Add EntityQuery tests
  - [ ] Test querying with single component
  - [ ] Test querying with multiple components
  - [ ] Test with no matching entities
  - [ ] Test type safety

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] All systems still work correctly
- [ ] No change in behavior
- [ ] Code is more readable
- [ ] Type safety is maintained
- [ ] No performance degradation
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 7: Reduce Three.js Coupling (Nice-to-have - Architecture)

**Goal:** Encapsulate Three.js objects within components and reduce direct access.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [ ] Audit Three.js exposure
  - [ ] List all places where Three.js objects are exposed
  - [ ] Identify which exposures are necessary
  - [ ] Plan alternative APIs

- [ ] Refactor `GeometryComponent`
  - [ ] Make `getGeometryGroup()` package-private or remove
  - [ ] Add methods for position/rotation/scale manipulation
  - [ ] Keep Three.js objects private where possible
  - [ ] Update systems to use new API

- [ ] Refactor `TileVisualComponent`
  - [ ] Make `getTileMesh()` package-private or remove
  - [ ] Add methods for visual property manipulation
  - [ ] Keep Three.js objects private where possible

- [ ] Update `RenderSystem`
  - [ ] Ensure it's the only system accessing Three.js scene directly
  - [ ] Add methods for scene management if needed

- [ ] Update `EntityCleanupSystem`
  - [ ] Work with component APIs instead of direct Three.js access
  - [ ] Or allow limited access for cleanup purposes

- [ ] Update `EntityFactory`
  - [ ] Minimize direct Three.js manipulation
  - [ ] Use component APIs where possible

- [ ] Update `TileFactory`
  - [ ] Minimize direct Three.js manipulation
  - [ ] Use component APIs where possible

- [ ] Document the new boundaries
  - [ ] Add comments explaining which systems can access Three.js
  - [ ] Document the component APIs

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] All rendering works correctly
- [ ] Entities and tiles appear as before
- [ ] Animations work correctly
- [ ] Scene cleanup works
- [ ] No visual regressions
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 8: Implement Spatial Query System (Future Feature)

**Goal:** Enable efficient spatial queries for tile-entity interactions.

**Estimated Time:** 3-4 hours

### Sub-tasks:

- [ ] Extend `TileGrid` with spatial query methods
  - [ ] Implement `getTilesNearPosition(position: Vector3, radius: number): Entity[]`
  - [ ] Implement `getTileAtPosition(position: Vector3): Entity | null`
  - [ ] Implement `getEntitiesOnTile(tile: Entity): Entity[]`
  - [ ] Optimize with spatial hashing if needed

- [ ] Create `src/utils/SpatialQuery.ts`
  - [ ] Implement `getEntitiesInRadius(entities: Entity[], center: Vector3, radius: number): Entity[]`
  - [ ] Implement `getClosestEntity(entities: Entity[], position: Vector3): Entity | null`
  - [ ] Implement `getEntitiesInBox(entities: Entity[], min: Vector3, max: Vector3): Entity[]`

- [ ] Update `TileProximitySystem` to use spatial queries
  - [ ] Use TileGrid spatial methods
  - [ ] Optimize proximity checks
  - [ ] Reduce unnecessary distance calculations

- [ ] Update `TargetingSystem` to use spatial queries
  - [ ] Use SpatialQuery for finding targets
  - [ ] Optimize target search

- [ ] Add spatial query tests
  - [ ] Test radius queries
  - [ ] Test tile position queries
  - [ ] Test edge cases

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] Proximity detection works correctly
- [ ] Targeting works correctly
- [ ] Performance is improved or same
- [ ] No spatial query bugs
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 9: Implement Effect Application System (Future Feature)

**Goal:** Create system for tiles to apply effects (buffs/debuffs) to entities.

**Estimated Time:** 3-4 hours

### Sub-tasks:

- [ ] Create `src/entities/components/EffectComponent.ts`
  - [ ] Define effect types (damage over time, speed buff, damage buff, etc.)
  - [ ] Store active effects on entity
  - [ ] Track effect duration and strength
  - [ ] Support stacking or replacement logic

- [ ] Create `src/entities/systems/EffectApplicationSystem.ts`
  - [ ] Listen for `EntityEnteredTileRange` events
  - [ ] Apply tile effects to entities
  - [ ] Check tile effect type and apply appropriate component changes
  - [ ] Respect effect duration and cooldowns

- [ ] Create `src/entities/systems/EffectTickSystem.ts`
  - [ ] Update active effects each frame
  - [ ] Apply damage over time effects
  - [ ] Remove expired effects
  - [ ] Dispatch effect-related events

- [ ] Update tile effect configs
  - [ ] Add effect application parameters
  - [ ] Define what each tile type does to entities
  - [ ] Configure effect strength and duration

- [ ] Add visual feedback for effects
  - [ ] Update DamageVisualSystem to show buffs/debuffs
  - [ ] Add particle effects (optional)
  - [ ] Update entity colors based on active effects

- [ ] Add effect system tests
  - [ ] Test effect application
  - [ ] Test effect expiration
  - [ ] Test effect stacking
  - [ ] Test damage over time

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] Effects apply when entities enter tile range
- [ ] Effects expire correctly
- [ ] Visual feedback is clear
- [ ] No effect-related bugs
- [ ] Performance is acceptable
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 10: Create Generic Cooldown System (Future Feature)

**Goal:** Centralize cooldown management for reusability.

**Estimated Time:** 1-2 hours

### Sub-tasks:

- [ ] Create `src/ecs/components/CooldownComponent.ts`
  - [ ] Store multiple named cooldowns
  - [ ] Track last activation time for each
  - [ ] Track cooldown duration for each
  - [ ] Provide `canActivate(name: string): boolean`
  - [ ] Provide `activate(name: string): void`
  - [ ] Provide `getRemainingCooldown(name: string): number`

- [ ] Refactor `AttackComponent` to use CooldownComponent
  - [ ] Remove cooldown-specific fields
  - [ ] Delegate to CooldownComponent
  - [ ] Keep attack-specific logic

- [ ] Refactor `TileEffectComponent` to use CooldownComponent
  - [ ] Remove cooldown-specific fields
  - [ ] Delegate to CooldownComponent
  - [ ] Keep effect-specific logic

- [ ] Create `src/entities/systems/CooldownSystem.ts` (optional)
  - [ ] Update all cooldowns each frame
  - [ ] Dispatch cooldown ready events
  - [ ] Provide centralized cooldown management

- [ ] Add cooldown tests
  - [ ] Test cooldown activation
  - [ ] Test cooldown expiration
  - [ ] Test multiple cooldowns on same entity

**Regression Testing Checklist (USER MUST PERFORM):**
- [ ] Attack cooldowns work correctly
- [ ] Tile effect cooldowns work correctly
- [ ] No cooldown-related bugs
- [ ] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Additional Improvements (Low Priority)

These can be addressed as needed, not necessarily in order:

- [ ] Fix inconsistent naming
  - [ ] Rename `getIsActive()` to `isActive()` throughout
  - [ ] Standardize on `HP` or `Health` (pick one)
  - [ ] Review all boolean getters

- [ ] Complete incomplete implementations
  - [ ] Implement `TileManager.removeTile()`
  - [ ] Complete `TileEffectSystem.processEffectActivation()`
  - [ ] Complete `TileEffectSystem.getActiveEffectsInRadius()`

- [ ] Add comprehensive tests
  - [ ] Unit tests for all components
  - [ ] Unit tests for all systems
  - [ ] Integration tests for combat flow
  - [ ] Integration tests for tile effects

- [ ] Performance optimization
  - [ ] Profile system update times
  - [ ] Optimize hot paths
  - [ ] Consider object pooling for entities
  - [ ] Consider spatial partitioning for large entity counts

- [ ] Documentation
  - [ ] Add JSDoc to all public APIs
  - [ ] Create architecture documentation
  - [ ] Document event flow
  - [ ] Create system dependency diagram

---

## Notes

- Each phase is designed to be independent and testable
- Phases 1-5 are critical/important and should be completed before major feature additions
- Phases 6-10 are nice-to-have and can be done as time permits
- Always run regression tests before committing
- If a phase introduces bugs, fix them before proceeding
- Keep commits atomic and well-described
- Update this document as you complete tasks

---

## Progress Tracking

**Current Phase:** Phase 1 Complete ✅

**Completed Phases:**
- Phase 1: Create EntityManager (Critical - Foundation) - COMPLETED ✅

**Date Started:** December 19, 2024
**Last Updated:** December 19, 2024

