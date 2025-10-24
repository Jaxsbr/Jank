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
import { DebugUI } from './ui/DebugUI';

const scene = new THREE.Scene();
const renderer = new Renderer(window.innerWidth, window.innerHeight)
const renderSystem = new RenderSystem(renderer, scene)
const bobAnimationSystem = new BobAnimationSystem()
const rotationSystem = new RotationSystem()
const entityFactory = new EntityFactory(scene)

// Create environment
const environmentManager = new EnvironmentManager(scene, defaultEnvironment);

// Create the game core
entityFactory.createCoreEntity()

// Create the UI
new DebugUI(environmentManager.getFloorComponent().getFloorGroup());

function animate(): void {
    requestAnimationFrame(animate);

    const entities = entityFactory.getEntities()
    bobAnimationSystem.update(entities)
    rotationSystem.update(entities)
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
