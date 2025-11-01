import { EnvironmentConfig } from './EnvironmentConfig';

export const defaultEnvironment: EnvironmentConfig = {
    floor: {
        size: 100,
        material: {
            color: 0x4a4a4a, // Lighter floor color
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
            type: 'radial',
            intensity: 0.5,
            scale: 1.0,
            color: 0x1a1a1a
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
