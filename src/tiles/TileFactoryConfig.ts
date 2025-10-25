import { TileType } from './TileType';

export interface TileFactoryConfig {
    tileSize: number;
    materials: {
        center: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.ONE]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.TWO]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.THREE]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.FOUR]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.FIVE]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.SIX]: {
            color: number;
            roughness: number;
            metalness: number;
        };
    };
}
