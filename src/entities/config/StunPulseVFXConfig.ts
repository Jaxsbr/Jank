export interface CoreBurstConfig {
    arcCount: number;
    colors: number[];
    ringParticleCount: number;
    ringParticleSize: number;
    ringExpansionSpeed: number;
    lifetime: number;
    arcOpacity: number;
    particleOpacity: number;
}

export interface EnemyBurstConfig {
    arcCount: number;
    colors: number[];
    particleCount: number;
    particleSize: number;
    lifetime: number;
    arcOpacity: number;
    particleOpacity: number;
}

export interface StunPulseVFXConfig {
    level1: {
        coreBurst: CoreBurstConfig;
        enemyBurst: EnemyBurstConfig;
    };
    level2: {
        coreBurst: CoreBurstConfig;
        enemyBurst: EnemyBurstConfig;
    };
}

export const defaultStunPulseVFXConfig: StunPulseVFXConfig = {
    level1: {
        coreBurst: {
            arcCount: 8,
            colors: [0x00e5ff, 0xffffff], // Cyan and white
            ringParticleCount: 24,
            ringParticleSize: 0.08,
            ringExpansionSpeed: 25.0,
            lifetime: 0.5,
            arcOpacity: 0.8,
            particleOpacity: 0.9
        },
        enemyBurst: {
            arcCount: 4,
            colors: [0x00e5ff, 0xffffff],
            particleCount: 8,
            particleSize: 0.1,
            lifetime: 0.5,
            arcOpacity: 0.7,
            particleOpacity: 0.8
        }
    },
    level2: {
        coreBurst: {
            arcCount: 12,
            colors: [0x0080ff, 0xff00ff, 0xffffff], // Electric blue, magenta, white
            ringParticleCount: 36,
            ringParticleSize: 0.1,
            ringExpansionSpeed: 30.0,
            lifetime: 0.7,
            arcOpacity: 1.0,
            particleOpacity: 1.0
        },
        enemyBurst: {
            arcCount: 6,
            colors: [0x0080ff, 0xff00ff, 0xffffff],
            particleCount: 12,
            particleSize: 0.12,
            lifetime: 0.7,
            arcOpacity: 0.9,
            particleOpacity: 1.0
        }
    }
};

