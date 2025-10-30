export interface DeathEffectConfig {
    durationSeconds: number;
    startRadius: number;
    endRadius: number;
    sphereColor: number;
    arcColor: number;
    arcCount: number;
}

export const defaultDeathEffectConfig: DeathEffectConfig = {
    durationSeconds: 0.3,
    startRadius: 0.2,
    endRadius: 1.4,
    sphereColor: 0x66ccff,
    arcColor: 0xaaddee,
    arcCount: 5
};


