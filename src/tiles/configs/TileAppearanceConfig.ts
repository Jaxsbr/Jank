// Note: TileType removed; visuals are unified

export const TileAppearanceConfig = {
    // Visual hex size (geometry). Smaller than spacing to create gaps
    tileSize: 0.6,
    // Logical spacing used to place tiles on the grid
    tileSpacing: 0.8,
    // Unified sterile lab-like material for all tiles
    defaultMaterial: {
        color: 0xe6eef2, // Cool white
        roughness: 0.35,
        metalness: 0.15
    },
    // Idle emissive color for heartbeat effect
    idleEmissiveColor: 0x88ccff,
    // Legacy per-type materials removed
};
