import * as THREE from 'three';
import { defaultFloor } from './configs/defaultFloor';
import { EntityFactory } from './game/ecs/EntityFactory';
import { BobAnimationSystem } from './game/ecs/systems/BobAnimationSystem';
import { RenderSystem } from './game/ecs/systems/RenderSystem';
import { RotationSystem } from './game/ecs/systems/RotationSystem';
import './styles.css';
import { createAmbientLight, createDirectionalLight } from './systems/DirectionalLight';
import { createFloor } from './systems/ObjectFactory';
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

const floor = createFloor(defaultFloor);
scene.add(floor);

// Create the game core
entityFactory.createCoreEntity()

// Create the UI
new DebugUI(floor);

// Add scene lighting
const ambientLight = createAmbientLight()
const directionalLight = createDirectionalLight()
scene.add(ambientLight);
scene.add(directionalLight);

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
