import * as THREE from 'three';
import { EntityFactory } from './entities/EntityFactory';
import { AttackAnimationSystem } from './entities/systems/AttackAnimationSystem';
import { BobAnimationSystem } from './entities/systems/BobAnimationSystem';
import { CombatSystem } from './entities/systems/CombatSystem';
import { DamageVisualSystem } from './entities/systems/DamageVisualSystem';
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
import { TileEffectComponent } from './tiles/components/TileEffectComponent';
// import { TileAnimationSystem } from './tiles/systems/TileAnimationSystem';
import { TileEffectSystem } from './tiles/systems/TileEffectSystem';
// import { TileHeightSystem } from './tiles/systems/TileHeightSystem';
import { DebugUI } from './ui/DebugUI';

const scene = new THREE.Scene();
const renderer = new Renderer(window.innerWidth, window.innerHeight)
const renderSystem = new RenderSystem(renderer, scene)
const bobAnimationSystem = new BobAnimationSystem()
const movementSystem = new MovementSystem()
const rotationSystem = new RotationSystem()
const targetingSystem = new TargetingSystem()
const meleeAttackSystem = new MeleeAttackSystem()
const combatSystem = new CombatSystem(scene)
const damageVisualSystem = new DamageVisualSystem()
const attackAnimationSystem = new AttackAnimationSystem()
const entityFactory = new EntityFactory(scene)

// const tileAnimationSystem = new TileAnimationSystem(0.2);
const tileEffectSystem = new TileEffectSystem(15, 2);
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

// Set entities reference for combat system
combatSystem.setEntities([...entityFactory.getEntities()])
attackAnimationSystem.setEntities([...entityFactory.getEntities()])
damageVisualSystem.setEntities([...entityFactory.getEntities()])

// Create the UI
new DebugUI(environmentManager.getFloorComponent().getFloorGroup());

// Timer for random tile activation
let lastTriggerTime = 0;
const triggerInterval = 2000 + Math.random() * 1000; // 2-3 seconds

function animate(): void {
    requestAnimationFrame(animate);

    const entities = entityFactory.getEntities();
    bobAnimationSystem.update(entities);
    movementSystem.update(entities);
    rotationSystem.update(entities);
    
    // Update combat systems
    targetingSystem.update(entities);
    meleeAttackSystem.update(entities);
    
    // Update visual effects
    damageVisualSystem.update();
    attackAnimationSystem.update();
    
    const tileEntities = tileManager.getAllTiles()
    // tileAnimationSystem.update(tileEntities);
    tileEffectSystem.update(tileEntities);
    // tileHeightSystem.update(tileEntities);
    renderSystem.update();

    // Trigger random tile effect
    const currentTime = performance.now();
    if (currentTime - lastTriggerTime >= triggerInterval) {
        lastTriggerTime = currentTime;
        
        // Get all tiles with effect components
        const tilesWithEffects = tileEntities.filter(tile => 
            tile.hasComponent(TileEffectComponent)
        );
        
        // Randomly select one tile to activate
        if (tilesWithEffects.length > 0) {
            const randomIndex = Math.floor(Math.random() * tilesWithEffects.length);
            const currentTimeSeconds = currentTime / 1000;
            
            GlobalEventDispatcher.dispatch(new Event(EventType.TileEffectTrigger, {
                entityIndex: randomIndex,
                currentTime: currentTimeSeconds
            }));
        }
    }
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
