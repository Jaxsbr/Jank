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

- [x] Create `src/entities/systems/EntityCleanupSystem.ts`
  - [x] Implement `IEventListener` interface
  - [x] Listen for `EntityDestroyed` events
  - [x] Handle scene cleanup (remove GeometryComponent from scene)
  - [x] Handle any other cleanup needed (dispose geometries, materials, etc.)
  - [x] Accept Scene and EventDispatcher via constructor

- [x] Refactor `CombatSystem` to focus only on damage application
  - [x] Rename to `DamageSystem` (optional but clearer) - Kept as CombatSystem
  - [x] Keep only damage application logic
  - [x] Keep death detection (HP reaches 0)
  - [x] Dispatch `EntityDeath` event when entity dies
  - [x] Remove all scene manipulation code
  - [x] Remove all entity array manipulation code (should be done from Phase 1)

- [x] Update `main.ts` to include new systems
  - [x] Create `EntityCleanupSystem` instance
  - [x] Add to system update loop (or just register as event listener)
  - [x] Ensure proper system initialization order

- [x] Update system destruction/cleanup
  - [x] Ensure all systems properly deregister from EventDispatcher
  - [x] Add `destroy()` method to EntityCleanupSystem

**Regression Testing Checklist (USER MUST PERFORM):**
- [x] Entity death still works correctly
- [x] Dead entities are removed from scene
- [x] Dead entities are removed from entity list
- [x] No memory leaks (check with browser dev tools)
- [x] Combat flow unchanged from user perspective
- [x] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 3: Refactor EntityFactory (Important - DRY)

**Goal:** Eliminate code duplication between createCoreEntity and createEnemyEntity.

**Estimated Time:** 1.5-2 hours

### Sub-tasks:

- [x] Extract geometry calculation into private method
  - [x] Create `createSecondaryGeometryConfigs(config: GeometryConfig): SecondaryGeometryConfig[]`
  - [x] Move lines 36-58 logic into this method
  - [x] Handle embed depth calculation
  - [x] Handle position normalization
  - [x] Return array of SecondaryGeometryConfig

- [x] Extract common component creation
  - [x] Create `addBaseComponents(entity: Entity, config: BaseEntityConfig): void`
  - [x] Add HealthComponent
  - [x] Add PositionComponent
  - [x] Add GeometryComponent
  - [x] Add RotationComponent
  - [x] Add BobAnimationComponent

- [x] Extract combat component creation
  - [x] Create `addCombatComponents(entity: Entity, config: CombatConfig, team: TeamType): void`
  - [x] Add TeamComponent
  - [x] Add AttackComponent
  - [x] Add TargetComponent
  - [x] Add AttackAnimationComponent

- [x] Extract scene setup
  - [x] Create `addEntityToScene(entity: Entity, geometryComponent: GeometryComponent, position: Vector3): void`
  - [x] Set geometry group position
  - [x] Add to scene

- [x] Refactor `createCoreEntity()` to use extracted methods
  - [x] Call `createSecondaryGeometryConfigs()`
  - [x] Call `addBaseComponents()`
  - [x] Call `addCombatComponents()`
  - [x] Call `addEntityToScene()`
  - [x] Keep only core-specific logic

- [x] Refactor `createEnemyEntity()` to use extracted methods
  - [x] Call `createSecondaryGeometryConfigs()`
  - [x] Call `addBaseComponents()`
  - [x] Call `addCombatComponents()`
  - [x] Add MovementComponent (enemy-specific)
  - [x] Call `addEntityToScene()`
  - [x] Keep only enemy-specific logic

- [x] Create type definitions for shared config structure
  - [x] Define `BaseEntityConfig` interface
  - [x] Define `CombatConfig` interface
  - [x] Update existing config types to extend these

**Regression Testing Checklist (USER MUST PERFORM):**
- [x] Core entity still renders with correct appearance
- [x] Enemy entity still renders with correct appearance
- [x] Both entities have all expected components
- [x] No visual differences from before refactor
- [x] No console errors
- [x] Code is more readable and maintainable

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 4: Fix TileEffectTrigger Event Pattern (Important - Event System)

**Goal:** Replace command-style events with proper state-based tile effect triggering.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [x] Design new tile effect trigger system
  - [x] Decide on trigger mechanisms (proximity, cooldown, manual activation)
  - [x] Document the new approach in comments

- [x] Create proper event types for tile interactions
  - [x] Add `EntityEnteredTileRange` event (entity approaches tile)
  - [x] Add `EntityExitedTileRange` event (entity leaves tile)
  - [x] Add `TileEffectActivated` event (tile effect starts - informational)
  - [x] Add `TileEffectDeactivated` event (tile effect ends - informational)
  - [x] Remove `TileEffectTrigger` event type

- [x] Create `src/tiles/systems/TileProximitySystem.ts`
  - [x] Implement `IEntitySystem` interface
  - [x] Track which entities are near which tiles
  - [x] Dispatch `EntityEnteredTileRange` when entity gets close
  - [x] Dispatch `EntityExitedTileRange` when entity moves away
  - [x] Use configurable radius for proximity detection
  - [x] Use TileGrid for spatial queries

- [x] Refactor `TileEffectSystem`
  - [x] Remove `onEvent()` method handling `TileEffectTrigger`
  - [x] Add `onEvent()` handling for `EntityEnteredTileRange` (optional trigger)
  - [x] Implement automatic activation based on cooldowns
  - [x] Implement activation based on proximity (if tile has proximity trigger)
  - [x] Dispatch `TileEffectActivated` when effect starts
  - [x] Dispatch `TileEffectDeactivated` when effect ends
  - [x] Remove entity index-based activation

- [x] Add tile trigger configuration
  - [x] Add `TileTriggerComponent` (defines how tile activates)
  - [x] Support trigger types: AUTO (cooldown), PROXIMITY, MANUAL, ALWAYS_ON
  - [x] Update TileFactory to add trigger components

- [x] Update `main.ts`
  - [x] Remove manual tile effect triggering code (lines 72-117)
  - [x] Add TileProximitySystem to system list
  - [x] Remove random activation timer logic

- [x] Update tile configs to specify trigger behavior
  - [x] Update CENTER tile config (always on)
  - [x] Update TileType.ONE config (auto with cooldown)
  - [x] Update TileType.TWO config (proximity-based)
  - [x] Update TileType.THREE config (auto with cooldown)

**Regression Testing Checklist (USER MUST PERFORM):**
- [x] Tile effects still activate and display correctly
- [x] Center tile always shows effect
- [x] Other tiles activate based on new trigger system
- [x] Proximity-based triggers work when entities approach
- [x] No more entity index errors
- [x] Event flow is logical and traceable
- [x] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing**

---

## Phase 5: Standardize Time Units (Important - Consistency)

**Goal:** Use seconds consistently throughout the codebase and create time utility.

**Estimated Time:** 1-2 hours

### Sub-tasks:

- [x] Create `src/utils/Time.ts`
  - [x] Create `Time` class with static methods
  - [x] Implement `now(): number` (returns seconds)
  - [x] Implement `deltaTime: number` (calculated each frame)
  - [x] Implement `update(currentTimeMs: number): void` (call each frame)
  - [x] Add JSDoc comments explaining time is in seconds

- [x] Update `AttackComponent` to use seconds
  - [x] Change `cooldownDuration` from milliseconds to seconds
  - [x] Update JSDoc comments
  - [x] Update `canAttack()` logic (already correct, just units change)
  - [x] Update `getTimeUntilNextAttack()` to return seconds

- [x] Update `AttackAnimationComponent` to use seconds
  - [x] Change duration from milliseconds to seconds
  - [x] Update all time-related calculations

- [x] Update all entity configs to use seconds
  - [x] Update `CoreEntityConfig` cooldown (1000ms → 1.0s)
  - [x] Update `CoreEntityConfig` animation duration (200ms → 0.2s)
  - [x] Update `EnemyEntityConfig` cooldown
  - [x] Update `EnemyEntityConfig` animation duration
  - [x] Add comments indicating units are seconds

- [x] Update `MeleeAttackSystem`
  - [x] Replace `Date.now()` with `Time.now()`
  - [x] Verify all time comparisons work with seconds

- [x] Update `DamageVisualSystem`
  - [x] Replace `Date.now()` with `Time.now()`
  - [x] Update flash duration to seconds
  - [x] Update all time calculations

- [x] Update `TileEffectSystem`
  - [x] Already uses seconds, verify consistency
  - [x] Replace `performance.now() / 1000` with `Time.now()`

- [x] Update `TileAnimationSystem`
  - [x] Replace `performance.now() / 1000` with `Time.now()`
  - [x] Use `Time.deltaTime` instead of hardcoded 1/60

- [x] Update `main.ts`
  - [x] Initialize Time system
  - [x] Call `Time.update()` at start of animation loop
  - [x] Replace `performance.now()` calls with `Time.now()`
  - [x] Replace `Date.now()` calls with `Time.now()`

- [x] Add time unit tests
  - [x] Test Time.now() returns seconds
  - [x] Test Time.deltaTime is calculated correctly
  - [x] Test time-based components work with new system

**Regression Testing Checklist (USER MUST PERFORM):**
- [x] Attack cooldowns work correctly (feel the same)
- [x] Attack animations have correct duration
- [x] Tile effects have correct timing
- [x] Bob animations are smooth
- [x] No timing-related bugs
- [x] All time-based features work as before
- [x] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing** ✅ COMMITTED

---

## Phase 6: Create EntityQuery System (Nice-to-have - Code Quality)

**Goal:** Reduce boilerplate when querying entities by components.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [x] Create `src/ecs/EntityQuery.ts`
  - [x] Implement `withComponents<T>()` method
  - [x] Return array of entities matching all component types
  - [x] Return strongly-typed component tuples
  - [x] Add optional `filter()` callback for additional criteria
  - [x] Add JSDoc with usage examples

- [x] Create type helpers
  - [x] Define `ComponentType<T>` type
  - [x] Define `QueryResult<T>` type for typed results
  - [x] Ensure type safety with generics

- [x] Refactor `TargetingSystem` to use EntityQuery
  - [x] Replace manual component checks with query
  - [x] Simplify entity filtering logic
  - [x] Reduce null checks

- [x] Refactor `MeleeAttackSystem` to use EntityQuery
  - [x] Replace manual component checks with query
  - [x] Simplify entity iteration

- [x] Refactor `MovementSystem` to use EntityQuery
  - [x] Replace manual component checks with query
  - [x] Simplify entity filtering

- [x] Refactor `BobAnimationSystem` to use EntityQuery
  - [x] Replace manual component checks with query

- [x] Refactor `RotationSystem` to use EntityQuery
  - [x] Replace manual component checks with query

- [x] Refactor `AttackAnimationSystem` to use EntityQuery
  - [x] Replace manual component checks with query

- [x] Refactor `TileEffectSystem` to use EntityQuery
  - [x] Replace manual component checks with query
  - [x] Simplify tile filtering logic

- [x] Refactor `TileAnimationSystem` to use EntityQuery
  - [x] Replace manual component checks with query

- [x] Add EntityQuery tests
  - [x] Test querying with single component
  - [x] Test querying with multiple components
  - [x] Test with no matching entities
  - [x] Test type safety

**Regression Testing Checklist (USER MUST PERFORM):**
- [x] All systems still work correctly
- [x] No change in behavior
- [x] Code is more readable
- [x] Type safety is maintained
- [x] No performance degradation
- [x] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing** ✅ COMPLETED

---

## Phase 7: Reduce Three.js Coupling (Nice-to-have - Architecture)

**Goal:** Encapsulate Three.js objects within components and reduce direct access.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [x] Audit Three.js exposure
  - [x] List all places where Three.js objects are exposed
  - [x] Identify which exposures are necessary
  - [x] Plan alternative APIs

- [x] Refactor `GeometryComponent`
  - [x] Make `getGeometryGroup()` package-private or remove
  - [x] Add methods for position/rotation/scale manipulation
  - [x] Keep Three.js objects private where possible
  - [x] Update systems to use new API

- [x] Refactor `TileVisualComponent`
  - [x] Make `getTileMesh()` package-private or remove
  - [x] Add methods for visual property manipulation
  - [x] Keep Three.js objects private where possible

- [x] Update `RenderSystem`
  - [x] Ensure it's the only system accessing Three.js scene directly
  - [x] Add methods for scene management if needed

- [x] Update `EntityCleanupSystem`
  - [x] Work with component APIs instead of direct Three.js access
  - [x] Or allow limited access for cleanup purposes

- [x] Update `EntityFactory`
  - [x] Minimize direct Three.js manipulation
  - [x] Use component APIs where possible

- [x] Update `TileFactory`
  - [x] Minimize direct Three.js manipulation
  - [x] Use component APIs where possible

- [x] Document the new boundaries
  - [x] Add comments explaining which systems can access Three.js
  - [x] Document the component APIs

**Regression Testing Checklist (USER MUST PERFORM):**
- [x] All rendering works correctly
- [x] Entities and tiles appear as before
- [x] Animations work correctly
- [x] Scene cleanup works
- [x] No visual regressions
- [x] No console errors

**IMPORTANT:** The AI cannot perform actual regression testing. The user must test the application and report any issues before committing.

**Commit after successful regression testing** ✅ COMMITTED

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

**Current Phase:** Phase 7 Complete ✅

**Completed Phases:**
- Phase 1: Create EntityManager (Critical - Foundation) - COMPLETED ✅
- Phase 2: Split CombatSystem Responsibilities (Critical - SRP) - COMPLETED ✅
- Phase 3: Refactor EntityFactory (Important - DRY) - COMPLETED ✅
- Phase 4: Fix TileEffectTrigger Event Pattern (Important - Event System) - COMPLETED ✅
- Phase 5: Standardize Time Units (Important - Consistency) - COMPLETED ✅
- Phase 6: Create EntityQuery System (Nice-to-have - Code Quality) - COMPLETED ✅
- Phase 7: Reduce Three.js Coupling (Nice-to-have - Architecture) - COMPLETED ✅

**Date Started:** December 19, 2024
**Last Updated:** December 19, 2024

