import * as THREE from 'three';
import { EntityManager } from './ecs/EntityManager';
import { EntityFactory } from './entities/EntityFactory';
import { AttackAnimationSystem } from './entities/systems/AttackAnimationSystem';
import { BobAnimationSystem } from './entities/systems/BobAnimationSystem';
import { CombatSystem } from './entities/systems/CombatSystem';
import { DamageVisualSystem } from './entities/systems/DamageVisualSystem';
import { EffectTickSystem } from './entities/systems/EffectTickSystem';
import { EntityCleanupSystem } from './entities/systems/EntityCleanupSystem';
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
import { TileAnimationSystem } from './tiles/systems/TileAnimationSystem';
// import { TileHeightSystem } from './tiles/systems/TileHeightSystem';
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
const effectTickSystem = new EffectTickSystem(GlobalEventDispatcher, 1.0)
const attackAnimationSystem = new AttackAnimationSystem()
new EntityCleanupSystem(scene, GlobalEventDispatcher)
const entityFactory = new EntityFactory(scene, entityManager)

const tileAnimationSystem = new TileAnimationSystem(0.2);
const tileVFXController = new TileVFXController(GlobalEventDispatcher);
// Bridge listens on global dispatcher; instance retained for lifecycle
// Instantiate bridge (no direct usage needed)
new CoreEnemyVFXBridge(GlobalEventDispatcher, tileVFXController);
// const tileHeightSystem = new TileHeightSystem(2, 3);
const tileManager = new TileManager(scene);
tileManager.initialize()

// Create a larger uniform grid for demo
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 1
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 2
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 3

// Create environment
const environmentManager = new EnvironmentManager(scene, defaultEnvironment);

// Create the game core
entityFactory.createCoreEntity()

// TMP: Test enemy
entityFactory.createEnemyEntity()

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

// Create the UI
new DebugUI(environmentManager.getFloorComponent().getFloorGroup());

function animate(): void {
    requestAnimationFrame(animate);

    // Update Time system at the start of each frame
    Time.update(performance.now());

    const entities = entityManager.getEntities();
    bobAnimationSystem.update(entities);
    movementSystem.update(entities);
    rotationSystem.update(entities);
    
    // Update combat systems
    targetingSystem.update(entities);
    meleeAttackSystem.update(entities);
    
    // Update visual effects
    damageVisualSystem.update();
    attackAnimationSystem.update(entities);
    
    // Update effect systems
    effectTickSystem.update(entities);
    
    const tileEntities = tileManager.getAllTiles()
    tileVFXController.setTiles(tileEntities);
    tileVFXController.setCenterFromGrid(tileManager.getTileGrid());
    tileAnimationSystem.update(tileEntities);
    tileVFXController.update(Time.getDeltaTime());
    // tileHeightSystem.update(tileEntities);
    renderSystem.update();
}

animate();

// Browser Events
window.addEventListener('resize', () => {
    GlobalEventDispatcher.dispatch(new Event<{ width: number; height: number }>(
        EventType.WindowResize, {
            width: window.innerWidth,
            height: window.innerHeight
        }));
});
