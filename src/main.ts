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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new Renderer()


const floor = createFloor(defaultFloor);
scene.add(floor);

// Create the game core
const core = new Core();
core.setPosition(0, 0, 0);
scene.add(core.getGroup());

// Create the UI
new DebugUI(core, camera, floor);

// Add scene lighting
const ambientLight = createAmbientLight()
const directionalLight = createDirectionalLight()
scene.add(ambientLight);
scene.add(directionalLight);

// Position camera
camera.position.set(0, 5, 5);
camera.lookAt(0, 0, 0);


function animate(): void {
    requestAnimationFrame(animate);
    core.update();
    renderer.update(scene, camera)
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // TODO: Renderer should handle this
    GlobalEventDispatcher.dispatch(new Event<{ width: number; height: number }>(EventType.WindowResize, { 
        width: window.innerWidth, 
        height: window.innerHeight 
    }));
});


animate();
