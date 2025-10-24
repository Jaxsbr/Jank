import { FloorConfig } from './FloorConfig';
import { WallConfig } from './WallConfig';

export interface SkyboxConfig {
    type: 'color' | 'texture' | 'gradient';
    size: number;
    segments: number;
    color?: number;
    textureUrl?: string;
    gradient?: {
        topColor: number;
        bottomColor: number;
    };
}

export interface EnvironmentConfig {
    floor: FloorConfig;
    walls?: WallConfig[];
    skybox?: SkyboxConfig;
}
