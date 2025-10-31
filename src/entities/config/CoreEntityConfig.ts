import { Vector3 } from 'three';
import { GeometryConfig, defaultGeometryConfig } from './GeometryConfig';
import { MaterialConfig, defaultMaterialConfig } from './MaterialConfig';

export interface CoreEntityConfig {
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
    team: 'CORE';
}

export const defaultCoreEntityConfig: CoreEntityConfig = {
    health: {
        maxHP: 100
    },
    position: new Vector3(0, 0, 0),
    geometry: defaultGeometryConfig,
    material: defaultMaterialConfig,
    rotation: {
        x: 0,
        y: 0.01,
        z: 0
    },
    bobAnimation: {
        speed: 0.02,
        amplitude: 0.1,
        baseY: 1.6
    },
    combat: {
        attack: {
            damage: 50,
            range: 1.3,
            cooldown: 1.0 // seconds (was 1000ms)
        },
        target: {
            searchRange: 10.0
        },
        attackAnimation: {
            scaleMultiplier: 1.2,
            duration: 0.2 // seconds (was 200ms)
        }
    },
    team: 'CORE'
};
