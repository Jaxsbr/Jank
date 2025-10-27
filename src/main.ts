import * as THREE from 'three';
import { EntityManager } from './ecs/EntityManager';
import { EntityFactory } from './entities/EntityFactory';
import { AttackAnimationSystem } from './entities/systems/AttackAnimationSystem';
import { BobAnimationSystem } from './entities/systems/BobAnimationSystem';
import { CombatSystem } from './entities/systems/CombatSystem';
import { DamageVisualSystem } from './entities/systems/DamageVisualSystem';
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
import { TileManager } from './tiles/TileManager';
import { TileType } from './tiles/TileType';
// import { TileAnimationSystem } from './tiles/systems/TileAnimationSystem';
import { TileEffectSystem } from './tiles/systems/TileEffectSystem';
import { TileProximitySystem } from './tiles/systems/TileProximitySystem';
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
const attackAnimationSystem = new AttackAnimationSystem()
new EntityCleanupSystem(scene, GlobalEventDispatcher)
const entityFactory = new EntityFactory(scene, entityManager)

// const tileAnimationSystem = new TileAnimationSystem(0.2);
const tileEffectSystem = new TileEffectSystem(GlobalEventDispatcher, 15, 2);
const tileProximitySystem = new TileProximitySystem(GlobalEventDispatcher);
// const tileHeightSystem = new TileHeightSystem(2, 3);
const tileManager = new TileManager(scene);
tileManager.initialize()

// Hexagon ring around center tile
tileManager.addTile({ q: 0, r: -1.2 }, TileType.ONE);      // 1
tileManager.addTile({ q: 1.2, r: -1.2 }, TileType.TWO);    // 2
tileManager.addTile({ q: 1.2, r: 0 }, TileType.THREE);     // 3
tileManager.addTile({ q: 0, r: 1.2 }, TileType.ONE);       // 4
tileManager.addTile({ q: -1.2, r: 1.2 }, TileType.TWO);    // 5
tileManager.addTile({ q: -1.2, r: 0 }, TileType.THREE);    // 6

// Create environment
const environmentManager = new EnvironmentManager(scene, defaultEnvironment);

// Create the game core
entityFactory.createCoreEntity()

// TMP: Test enemy
entityFactory.createEnemyEntity()

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
    
    const tileEntities = tileManager.getAllTiles()
    // tileAnimationSystem.update(tileEntities);
    tileProximitySystem.update([...entities, ...tileEntities]); // Update proximity system with all entities
    tileEffectSystem.update(tileEntities);
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
