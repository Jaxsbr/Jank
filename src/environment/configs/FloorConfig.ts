export interface FloorConfig {
    size: number;
    material: {
        color: number;
        transparent: boolean;
        opacity: number;
        wireframe: boolean;
        roughness: number;
        metalness: number;
    };
    shadow: {
        receiveShadow: boolean;
        castShadow: boolean;
    };
}
