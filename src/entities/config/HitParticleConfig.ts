export type HitFXKind = 'shards' | 'fluffy' | 'arcs';

export interface ShardFXConfig {
    opacity: number;
    shardWidth: number;
    shardHeight: number;
    shardCount: number;
    yOffset: number;
    rotationMaxX: number;
    rotationMaxY: number;
    rotationMaxZ: number;
    midpointYOffset: number;
}

export interface FluffyFXConfig {
    opacity: number;
    count: number;
    sizeMin: number;
    sizeMax: number;
    baseUpwardVelocity: number;
    randomVelocityScale: number;
    yOffset: number;
    gravity: number;
    localJitterXZ: number;
    localJitterY: number;
    localJitterYBias: number;
    midpointYOffset: number;
    upwardRandom: number;
    velocityRandom: number;
}

export interface ArcFXConfig {
    color: number;
    opacity: number;
    count: number;
    segments: number;
    radiusStart: number;
    radiusEnd: number;
    jitter: number;
    midpointYOffset: number;
}

export interface HitParticleConfig {
    mode: 'random' | HitFXKind;
    lifetime: number;
    startScale: number;
    endScale: number;
    shards: ShardFXConfig;
    fluffy: FluffyFXConfig;
    arcs: ArcFXConfig;
}

export const defaultHitParticleConfig: HitParticleConfig = {
    mode: 'random',
    lifetime: 0.45,
    startScale: 1.0,
    endScale: 1.6,
    shards: {
        opacity: 0.95,
        shardWidth: 0.6,
        shardHeight: 0.14,
        shardCount: 3,
        yOffset: 0.4,
        rotationMaxX: 0.3,
        rotationMaxY: Math.PI,
        rotationMaxZ: 0.3,
        midpointYOffset: 0.4
    },
    fluffy: {
        opacity: 0.95,
        count: 12,
        sizeMin: 0.06,
        sizeMax: 0.12,
        baseUpwardVelocity: 0.6,
        randomVelocityScale: 0.9,
        yOffset: 0.35,
        gravity: -4.5,
        localJitterXZ: 0.12,
        localJitterY: 0.1,
        localJitterYBias: -0.2,
        midpointYOffset: 0.35,
        upwardRandom: 0.4,
        velocityRandom: 0.6
    },
    arcs: {
        color: 0x00e5ff,
        opacity: 0.95,
        count: 6,
        segments: 10,
        radiusStart: 0.2,
        radiusEnd: 0.9,
        jitter: 0.35,
        midpointYOffset: 0.35
    }
};


