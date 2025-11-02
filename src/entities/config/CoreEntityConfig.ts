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
        ranged: {
            damage: number; // projectile damage (attacker-specific, not in projectile config)
            range: number; // maximum distance for ranged attacks
            cooldown: number; // seconds
            projectileType: 'pellet'; // which projectile type to use (visuals/movement from PelletProjectileConfig)
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
        baseY: 1.2
    },
    combat: {
        attack: {
            damage: 75,
            range: 1.4,
            cooldown: 1.0 // seconds (was 1000ms)
        },
        ranged: {
            damage: 5, // projectile damage (lower than melee 75)
            // Visuals (color, size) and movement (speed, range) come from PelletProjectileConfig
            range: 5.0, // maximum distance for ranged attacks
            cooldown: 0.25, // faster than melee
            projectileType: 'pellet' // references PelletProjectileConfig for visuals/movement/knockback
        },
        target: {
            searchRange: 9.0 // core can search target in this range 
        },
        attackAnimation: {
            scaleMultiplier: 1.2,
            duration: 0.2 // seconds (was 200ms)
        }
    },
    team: 'CORE'
};
