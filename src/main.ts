import * as THREE from 'three';
import { EntityFactory } from './entities/EntityFactory';
import { BobAnimationSystem } from './entities/systems/BobAnimationSystem';
import { RenderSystem } from './entities/systems/RenderSystem';
import { RotationSystem } from './entities/systems/RotationSystem';
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
// import { TileEffectSystem } from './tiles/systems/TileEffectSystem';
// import { TileHeightSystem } from './tiles/systems/TileHeightSystem';
import { DebugUI } from './ui/DebugUI';

const scene = new THREE.Scene();
const renderer = new Renderer(window.innerWidth, window.innerHeight)
const renderSystem = new RenderSystem(renderer, scene)
const bobAnimationSystem = new BobAnimationSystem()
const rotationSystem = new RotationSystem()
const entityFactory = new EntityFactory(scene)

// const tileAnimationSystem = new TileAnimationSystem(0.2);
// const tileEffectSystem = new TileEffectSystem(15, 2);
// const tileHeightSystem = new TileHeightSystem(2, 3);
const tileSize = 5;
const maxRadius = 7
const centerPosition = new THREE.Vector3(0, 0, 0);
const tileManager = new TileManager(scene, { tileSize, maxRadius, centerPosition })
tileManager.initialize()

// Hexagon ring around center tile
tileManager.addTile({ q: 1.1, r: 0 }, TileType.ONE);
tileManager.addTile({ q: -1.1, r: 0 }, TileType.TWO);
tileManager.addTile({ q: -1.1, r: 1.1 }, TileType.THREE);
tileManager.addTile({ q: 0, r: -1.1 }, TileType.FOUR);
tileManager.addTile({ q: 1.1, r: -1.1 }, TileType.FIVE);
tileManager.addTile({ q: 0, r: 1.1 }, TileType.SIX);

// Create environment
const environmentManager = new EnvironmentManager(scene, defaultEnvironment);

// Create the game core
entityFactory.createCoreEntity()

// Create the UI
new DebugUI(environmentManager.getFloorComponent().getFloorGroup());

function animate(): void {
    requestAnimationFrame(animate);

    const entities = entityFactory.getEntities();
    bobAnimationSystem.update(entities);
    rotationSystem.update(entities);
    // const tileEntities = tileManager.getAllTiles()
    // tileAnimationSystem.update(tileEntities);
    // tileEffectSystem.update(tileEntities);
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
