export interface TileVFXConfig {
    pulseStrength: number;
    pulseFalloff: number;
    pulseDecayPerSecond: number;
    shockwaveStrength: number;
    shockwaveRadius: number;
    shockwaveDecayPerSecond: number;
    waveWidth: number;
    intensityMultipliers: {
        ripple: number;
        shock: number;
        burst: number;
        stunpulse: number;
    };
    stunPulseLevels: {
        level1: {
            strength: number;
            speed: number;
            radius: number;
        };
        level2: {
            strength: number;
            speed: number;
            radius: number;
            secondaryRingDelayMs: number;
            secondaryRing: {
                strength: number;
                speed: number;
                radius: number;
            };
        };
    };
}

export const defaultTileVFXConfig: TileVFXConfig = {
    pulseStrength: 2.0,
    pulseFalloff: 0.6,
    pulseDecayPerSecond: 3.0,
    shockwaveStrength: 1.8,
    shockwaveRadius: 10.0,
    shockwaveDecayPerSecond: 2.0,
    waveWidth: 2.0,
    intensityMultipliers: {
        ripple: 1.5,
        shock: 2.0,
        burst: 1.8,
        stunpulse: 2.5,
    },
    stunPulseLevels: {
        level1: { strength: 2.5, speed: 20.0, radius: 12.0 },
        level2: {
            strength: 3.5,
            speed: 25.0,
            radius: 15.0,
            secondaryRingDelayMs: 50,
            secondaryRing: { strength: 2.5, speed: 20.0, radius: 12.0 },
        },
    },
};


