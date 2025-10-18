import * as THREE from 'three';
import './styles.css';

// Create a simple Three.js scene with JANK text
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Set up the renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1a1a1a);

// Add renderer to DOM
const app = document.getElementById('app');
if (app) {
    app.appendChild(renderer.domElement);
}

// Create a simple cube to represent "JANK"
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position camera
camera.position.z = 5;

// Animation loop
function animate(): void {
    requestAnimationFrame(animate);

    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Add JANK text overlay
const textOverlay = document.createElement('div');
textOverlay.textContent = 'JANK';
textOverlay.style.position = 'absolute';
textOverlay.style.top = '50%';
textOverlay.style.left = '50%';
textOverlay.style.transform = 'translate(-50%, -50%)';
textOverlay.style.fontSize = '4rem';
textOverlay.style.fontWeight = 'bold';
textOverlay.style.color = '#ffffff';
textOverlay.style.fontFamily = 'monospace';
textOverlay.style.pointerEvents = 'none';
textOverlay.style.zIndex = '1000';
textOverlay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';

if (app) {
    app.appendChild(textOverlay);
}
