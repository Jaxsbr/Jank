import { Vector3 } from 'three';
import { GeometryConfig } from './GeometryConfig';
import { MaterialConfig } from './MaterialConfig';

/**
 * Base configuration shared by all entities
 */
export interface BaseEntityConfig {
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
}
