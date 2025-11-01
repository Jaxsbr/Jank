export interface TileAnimationConfig {
    speed: number;
    idleHeartbeatFrequency: number;
    activeHeartbeatFrequency: number;
    criticalHeartbeatFrequency: number;
    criticalHealthThreshold: number;
    colors: {
        idle: number;
        active: number;
        critical: number;
    };
}

export const defaultTileAnimationConfig: TileAnimationConfig = {
    speed: 0.2,
    idleHeartbeatFrequency: 1.0,    // Slow heartbeat during breaks between rounds/waves
    activeHeartbeatFrequency: 4.0,  // Fast heartbeat during enemy rounds
    criticalHeartbeatFrequency: 6.0, // Faster heartbeat when core is critical
    criticalHealthThreshold: 0.15,   // 15% of max HP
    colors: {
        idle: 0x88ccff,    // Light blue (current default)
        active: 0x88ccff,  // Same as idle for now
        critical: 0xff6600 // Reddish-orange
    }
};


