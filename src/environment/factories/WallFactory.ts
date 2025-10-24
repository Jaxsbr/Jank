import * as THREE from 'three';
import { WallConfig } from '../configs/WallConfig';

export class WallFactory {
    static createWall(config: WallConfig): THREE.Group {
        const wallGroup = new THREE.Group();

        const geometry = new THREE.BoxGeometry(
            config.size.width,
            config.size.height,
            config.size.depth
        );
        const material = new THREE.MeshStandardMaterial({
            color: config.material.color,
            roughness: config.material.roughness,
            metalness: config.material.metalness
        });

        const wall = new THREE.Mesh(geometry, material);
        wall.position.copy(config.position);
        wall.rotation.copy(config.rotation);
        wall.receiveShadow = config.shadow.receiveShadow;
        wall.castShadow = config.shadow.castShadow;

        wallGroup.add(wall);
        return wallGroup;
    }
}
