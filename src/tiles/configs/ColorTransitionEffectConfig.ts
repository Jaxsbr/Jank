export interface ColorTransitionEffectConfig {
    color1: number;
    color2: number;
    intensity: number;
    transitionDuration: number; // Time to transition from color1 to color2 (seconds)
    duration: number; // Total effect duration (seconds)
}

export const defaultColorTransitionEffectConfig: ColorTransitionEffectConfig = {
    color1: 0xffd700, // Gold
    color2: 0xffffff, // White
    intensity: 0.5,
    transitionDuration: 1.5,
    duration: 10.0 // Total duration
};
