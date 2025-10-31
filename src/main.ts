import * as THREE from 'three';
import { EntityManager } from './ecs/EntityManager';
import { EntityFactory } from './entities/EntityFactory';
import { AttackAnimationSystem } from './entities/systems/AttackAnimationSystem';
import { BobAnimationSystem } from './entities/systems/BobAnimationSystem';
import { CombatSystem } from './entities/systems/CombatSystem';
import { DamageVisualSystem } from './entities/systems/DamageVisualSystem';
import { EffectTickSystem } from './entities/systems/EffectTickSystem';
import { EnemySpawnerSystem } from './entities/systems/EnemySpawnerSystem';
import { EntityCleanupSystem } from './entities/systems/EntityCleanupSystem';
import { HitParticleSystem } from './entities/systems/HitParticleSystem';
import { KnockbackOnHitSystem } from './entities/systems/KnockbackOnHitSystem';
import { MeleeAttackSystem } from './entities/systems/MeleeAttackSystem';
import { MovementSystem } from './entities/systems/MovementSystem';
import { RenderSystem } from './entities/systems/RenderSystem';
import { RotationSystem } from './entities/systems/RotationSystem';
import { TargetingSystem } from './entities/systems/TargetingSystem';
import { EnvironmentManager } from './environment/EnvironmentManager';
import { defaultEnvironment } from './environment/configs/defaultEnvironment';
import './styles.css';
import { Renderer } from './systems/Renderer';
import { Event } from './systems/eventing/Event';
import { GlobalEventDispatcher } from './systems/eventing/EventDispatcher';
import { EventType } from './systems/eventing/EventType';
import { CoreEnemyVFXBridge } from './tiles/CoreEnemyVFXBridge';
import { TileManager } from './tiles/TileManager';
import { TileVFXController } from './tiles/TileVFXController';
import { defaultTileAnimationConfig } from './tiles/configs/TileAnimationConfig';
import { TileAnimationSystem } from './tiles/systems/TileAnimationSystem';
import { TileRangeRingSystem } from './tiles/systems/TileRangeRingSystem';
import { CoreHPBarSystem } from './ui/CoreHPBarSystem';
import { CoreHPHUD } from './ui/CoreHPHUD';
// import { TileHeightSystem } from './tiles/systems/TileHeightSystem';
import { defaultDeathEffectConfig } from './entities/config/DeathEffectConfig';
import { defaultEffectTickConfig } from './entities/config/EffectTickConfig';
import { defaultKnockbackConfig } from './entities/config/KnockbackConfig';
import { DeathEffectSystem } from './entities/systems/DeathEffectSystem';
import { DebugUI } from './ui/DebugUI';
import { Time } from './utils/Time';

const scene = new THREE.Scene();
const renderer = new Renderer(window.innerWidth, window.innerHeight)
const renderSystem = new RenderSystem(renderer, scene)
const bobAnimationSystem = new BobAnimationSystem()
const movementSystem = new MovementSystem()
const rotationSystem = new RotationSystem()
const targetingSystem = new TargetingSystem(GlobalEventDispatcher)
const meleeAttackSystem = new MeleeAttackSystem()
const entityManager = new EntityManager(GlobalEventDispatcher)
const combatSystem = new CombatSystem(GlobalEventDispatcher)
const damageVisualSystem = new DamageVisualSystem(GlobalEventDispatcher)
const effectTickSystem = new EffectTickSystem(GlobalEventDispatcher, defaultEffectTickConfig.intervalSeconds)
const attackAnimationSystem = new AttackAnimationSystem()
const knockbackOnHitSystem = new KnockbackOnHitSystem(GlobalEventDispatcher, defaultKnockbackConfig)
const hitParticleSystem = new HitParticleSystem(GlobalEventDispatcher, scene)
const deathEffectSystem = new DeathEffectSystem(scene, entityManager, GlobalEventDispatcher, defaultDeathEffectConfig)
new EntityCleanupSystem(scene, GlobalEventDispatcher)
const entityFactory = new EntityFactory(scene, entityManager)
const enemySpawner = new EnemySpawnerSystem(entityFactory, entityManager, {
    innerRadius: 6,
    outerRadius: 12,
    intervalSeconds: 4,
    spawnImmediately: true,
})

const tileAnimationSystem = new TileAnimationSystem(defaultTileAnimationConfig.speed);
const tileRangeRingSystem = new TileRangeRingSystem();
const tileVFXController = new TileVFXController(GlobalEventDispatcher);
// Bridge listens on global dispatcher; instance retained for lifecycle
// Instantiate bridge (no direct usage needed)
new CoreEnemyVFXBridge(GlobalEventDispatcher, tileVFXController);
// const tileHeightSystem = new TileHeightSystem(2, 3);
const tileManager = new TileManager(scene);
tileManager.initialize()

// Create HP HUD (screen-space) and systems
const coreHPHUD = new CoreHPHUD(window.innerWidth, window.innerHeight);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const coreHPBarSystem = new CoreHPBarSystem(coreHPHUD as unknown as any, entityManager);

// Create a larger uniform grid for demo
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 1
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 2
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 3

// Create environment (side effects: adds floor, skybox, etc. to scene)
new EnvironmentManager(scene, defaultEnvironment);

// Create the game core
entityFactory.createCoreEntity()



// Test VFX effects after a short delay
setTimeout(() => {
    console.log('Testing VFX effects...');
    // Test ripple effect
    tileVFXController.emitRippleFromCenter(2.0, 5.0, 0.6);
    
    // Test shockwave after 2 seconds
    setTimeout(() => {
        tileVFXController.emitShockwave(new THREE.Vector3(0, 0, 0), 1.8, 10.0, 8.0);
    }, 2000);
    
    // Test burst after 4 seconds
    setTimeout(() => {
        tileVFXController.emitLocalBurst(new THREE.Vector3(3, 0, 3), 1.4);
    }, 4000);
}, 1000);

// Set entities reference for systems
combatSystem.setEntities(entityManager.getEntities())
damageVisualSystem.setEntities(entityManager.getEntities())
knockbackOnHitSystem.setEntities(entityManager.getEntities())
hitParticleSystem.setEntities(entityManager.getEntities())

// Create the UI
new DebugUI(entityManager);

// Fixed timestep game loop with rAF rendering
let lastNow = performance.now();
let accumulator = 0;
const FIXED_DT = 1 / 60; // seconds per tick
const MAX_STEPS = 5;

function animate(): void {
    requestAnimationFrame(animate);

    const now = performance.now();
    let frameDelta = (now - lastNow) / 1000;
    lastNow = now;
    // Avoid spiral of death
    if (frameDelta > 0.25) frameDelta = 0.25;
    accumulator += frameDelta;

    // Fixed-step simulation updates
    let steps = 0;
    while (accumulator >= FIXED_DT && steps < MAX_STEPS) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        Time.advanceFixed(FIXED_DT);
        const entities = entityManager.getEntities();

        // Gameplay-affecting systems (order matters)
        knockbackOnHitSystem.update(entities);
        movementSystem.update(entities);
        rotationSystem.update(entities);
        targetingSystem.update(entities);
        meleeAttackSystem.update(entities);
        effectTickSystem.update(entities);
        enemySpawner.update(FIXED_DT);

        steps++;
        accumulator -= FIXED_DT;
    }

    // Frame-based visuals (use actual frame delta for smoothness)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    Time.setDeltaForFrame(frameDelta);
    const entities = entityManager.getEntities();
    bobAnimationSystem.update(entities);
    damageVisualSystem.update();
    hitParticleSystem.update();
    deathEffectSystem.update();
    attackAnimationSystem.update(entities);

    const tileEntities = tileManager.getAllTiles();
    tileVFXController.setTiles(tileEntities);
    tileVFXController.setCenterFromGrid(tileManager.getTileGrid());
    // Apply range ring overlays before idle heartbeat/glow calculations
    tileRangeRingSystem.update(tileEntities, entities);
    tileAnimationSystem.update(tileEntities);
    tileVFXController.update(frameDelta);

    // UI
    coreHPBarSystem.update();

    // Render
    renderSystem.update();
    renderer.renderOverlay(coreHPHUD.getUIScene(), coreHPHUD.getUICamera());
}

animate();

// Browser Events
window.addEventListener('resize', () => {
    GlobalEventDispatcher.dispatch(new Event<{ width: number; height: number }>(
        EventType.WindowResize, {
            width: window.innerWidth,
            height: window.innerHeight
        }));
    coreHPHUD.onResize(window.innerWidth, window.innerHeight);
});
