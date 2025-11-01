export interface FloorPatternConfig {
    type: 'hexagonal' | 'radial' | 'grid' | 'none';
    intensity: number; // 0-1, controls pattern opacity/contrast
    scale: number; // controls pattern size/density
    color?: number; // optional pattern color, defaults to slightly lighter than base
}

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
    pattern?: FloorPatternConfig;
}
