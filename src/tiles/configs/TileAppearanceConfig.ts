import { TileType } from '../TileType';

export const TileAppearanceConfig = {
    tileSize: 0.85,
    materials: {
        center: {
            color: 0x00ff00, // Green
            roughness: 0.3,
            metalness: 0.1
        },
        [TileType.ONE]: {
            color: 0xff0000, // Red
            roughness: 0.8,
            metalness: 0.1
        },
        [TileType.TWO]: {
            color: 0x0000ff, // Blue
            roughness: 0.6,
            metalness: 0.1
        },
        [TileType.THREE]: {
            color: 0xffff00, // Yellow
            roughness: 0.5,
            metalness: 0.3
        },
        [TileType.FOUR]: {
            color: 0xff00ff, // Magenta
            roughness: 0.7,
            metalness: 0.2
        },
        [TileType.FIVE]: {
            color: 0x00ffff, // Cyan
            roughness: 0.4,
            metalness: 0.4
        },
        [TileType.SIX]: {
            color: 0xff8800, // Orange
            roughness: 0.9,
            metalness: 0.1
        }
    }
};
