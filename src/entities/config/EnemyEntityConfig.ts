import { Vector3 } from 'three';
import { GeometryConfig, defaultGeometryConfig } from './GeometryConfig';
import { MaterialConfig } from './MaterialConfig';

export interface EnemyEntityConfig {
    health: {
        maxHP: number;
    };
    position: Vector3;
    geometry: GeometryConfig;
    material: MaterialConfig;
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    bobAnimation: {
        speed: number;
        amplitude: number;
        baseY: number;
    };
    combat: {
        attack: {
            damage: number;
            range: number;
            cooldown: number; // seconds
        };
        target: {
            searchRange: number;
        };
        attackAnimation: {
            scaleMultiplier: number;
            duration: number; // seconds
        };
    };
    movement: {
        targetPosition: Vector3;
        maxSpeed: number;
        targetReachedThreshold: number;
        acceleration: number;
        deceleration: number;
        decelerationDistance: number;
    };
    respawn: {
        position: Vector3;
    };
    team: 'ENEMY';
}

export const defaultEnemyEntityConfig: EnemyEntityConfig = {
    health: {
        maxHP: 75
    },
    position: new Vector3(5, 0, 0),
    geometry: defaultGeometryConfig,
    material: {
        main: {
            color: 0xFF0000,      // Red main sphere
            metalness: 0.3,
            roughness: 0.5,
            envMapIntensity: 0.0
        },
        secondary: {
            color: 0xFF6666,      // Light red secondary geometries
            metalness: 0.6,
            roughness: 0.3,
            envMapIntensity: 0.0
        }
    },
    rotation: {
        x: 0,
        y: 0.01,
        z: 0
    },
    bobAnimation: {
        speed: 0.01,
        amplitude: 0.2,
        baseY: 1.5
    },
    combat: {
        attack: {
            damage: 5,
            range: 1.2,
            cooldown: 1.5 // seconds (was 1500ms)
        },
        target: {
            searchRange: 10.0
        },
        attackAnimation: {
            scaleMultiplier: 1.2,
            duration: 0.2 // seconds (was 200ms)
        }
    },
    movement: {
        targetPosition: new Vector3(0, 0, 0), // Core entity position
        maxSpeed: 0.02,
        targetReachedThreshold: 0.001,
        acceleration: 0.95,
        deceleration: 0.0025,
        decelerationDistance: 3.0
    },
    respawn: {
        position: new Vector3(5, 0, 0) // Same as initial position
    },
    team: 'ENEMY'
};
