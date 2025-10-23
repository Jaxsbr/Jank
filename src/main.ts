import * as THREE from 'three';
import { defaultFloor } from './configs/defaultFloor';
import { Core } from './game/Core';
import './styles.css';
import { createAmbientLight, createDirectionalLight } from './systems/DirectionalLight';
import { createFloor } from './systems/ObjectFactory';
import { Renderer } from './systems/Renderer';
import { Event } from './systems/eventing/Event';
import { GlobalEventDispatcher } from './systems/eventing/EventDispatcher';
import { EventType } from './systems/eventing/EventType';
import { DebugUI } from './ui/DebugUI';
import { EntityFactory } from './game/EntityFactory';
import { RenderSystem } from './game/systems/RenderSystem';
import { BobAnimationSystem } from './game/systems/BobAnimationSystem';
import { RotationSystem } from './game/systems/RotationSystem';

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
const core = new Core();
core.setPosition(0, 0, 0);
// scene.add(core.getGroup());

// Create the UI
new DebugUI(core, floor);

// Add scene lighting
const ambientLight = createAmbientLight()
const directionalLight = createDirectionalLight()
scene.add(ambientLight);
scene.add(directionalLight);

function animate(): void {
    requestAnimationFrame(animate);
    core.update();

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
