import * as THREE from 'three';
import { defaultFloor } from './configs/defaultFloor';
import { Core } from './game/Core';
import './styles.css';
import { createAmbientLight, createDirectionalLight } from './systems/DirectionalLight';
import { createFloor } from './systems/ObjectFactory';
import { Renderer } from './systems/Renderer';
import { Event, EventType, GlobalEventDispatcher } from './systems/eventing';
import { DebugUI } from './ui/DebugUI';

const scene = new THREE.Scene();
const renderer = new Renderer(window.innerWidth, window.innerHeight)

const floor = createFloor(defaultFloor);
scene.add(floor);

// Create the game core
const core = new Core();
core.setPosition(0, 0, 0);
scene.add(core.getGroup());

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
    renderer.update(scene)
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
