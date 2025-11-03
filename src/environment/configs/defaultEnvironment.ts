import { EnvironmentConfig } from './EnvironmentConfig';

export const defaultEnvironment: EnvironmentConfig = {
    floor: {
        size: 100,
        material: {
            color: 0x1a1a1a, // Lighter floor color
            transparent: false,
            opacity: 1,
            wireframe: false,
            roughness: 0.8,
            metalness: 0.3
        },
        shadow: {
            receiveShadow: true,
            castShadow: false
        },
        pattern: {
            type: 'circuitry',
            intensity: 0.7,
            scale: 9.5,
            color: 0x1a1a1a,
            // Optional circuitry-specific settings
            circuitry: {
                patternColor: { r: 0.2, g: 0.4, b: 0.5 }, // Neon cyan/green
                density: 6.0,     // Grid density
                wireGlow: 0.6,    // Wire glow intensity (0-1)
                pulseSpeed: 1.5   // Animation speed
            }
        }
    },
    skybox: {
        type: 'gradient',
        size: 50,
        segments: 32,
        gradient: {
            topColor: 0x87ceeb,
            bottomColor: 0x2d1b69
        }
    }
};
 