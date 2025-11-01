export interface CircuitryConfig {
    patternColor?: { r: number; g: number; b: number }; // Neon pattern color (0-1 range), defaults to cyan/green
    density?: number; // Grid density for circuitry pattern, default 8.0
    wireGlow?: number; // Wire glow intensity (0-1), default 0.6
    pulseSpeed?: number; // Speed of pulsing animations, default 2.0
}

export interface FloorPatternConfig {
    type: 'hexagonal' | 'radial' | 'grid' | 'circuitry' | 'none';
    intensity: number; // 0-1, controls pattern opacity/contrast
    scale: number; // controls pattern size/density
    color?: number; // optional pattern color, defaults to slightly lighter than base
    circuitry?: CircuitryConfig; // Circuitry-specific configuration
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
