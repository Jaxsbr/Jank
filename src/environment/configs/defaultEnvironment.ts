import { EnvironmentConfig } from './EnvironmentConfig';

export const defaultEnvironment: EnvironmentConfig = {
    floor: {
        size: 100,
        material: {
            color: 0x1a1a1a,
            transparent: false,
            opacity: 1,
            wireframe: false,
            roughness: 0.8,
            metalness: 0.3
        },
        shadow: {
            receiveShadow: true,
            castShadow: false
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
