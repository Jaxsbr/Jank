export interface TileRangeRingConfig {
    maxRings: number;
    ring1: number;
    ring2: number;
    ring3: number;
}

export const defaultTileRangeRingConfig: TileRangeRingConfig = {
    maxRings: 3,
    ring1: 0.95,
    ring2: 0.55,
    ring3: 0.15,
};


