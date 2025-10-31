export interface SpatialConfig {
    // Logical spacing between hex tile centers in world units
    tileSpacing: number;
}

export const defaultSpatialConfig: SpatialConfig = {
    tileSpacing: 0.8,
};

export function hexRingsToWorldRadius(rings: number, config: SpatialConfig = defaultSpatialConfig): number {
    // For pointy-top hexes with axial coords, distance per ring in world units is tileSpacing * sqrt(3)
    const hexRadiusTo3D = config.tileSpacing * Math.sqrt(3);
    return hexRadiusTo3D * rings;
}


