export interface StaticEffectConfig {
    color: number;
    staticGlowIntensity: number;
    fadeInDuration: number;  // seconds
    fadeOutDuration: number; // seconds
    duration: number; // Total effect duration (seconds)
}

export const defaultStaticEffectConfig: StaticEffectConfig = {
    color: 0x8a2be2, // Violet
    staticGlowIntensity: 0.5,
    fadeInDuration: 0.3,
    fadeOutDuration: 2.0,
    duration: 5.0 // Total duration
};
