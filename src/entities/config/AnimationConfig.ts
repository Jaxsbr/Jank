export interface AnimationConfig {
    bob: {
        multiplier: number; // Sine wave multiplier for bob animation
    };
    vibrate: {
        speedMultiplier: number; // Multiplier for vibrate effect during combat
    };
}

export const defaultAnimationConfig: AnimationConfig = {
    bob: {
        multiplier: 1.5 // Sine wave multiplier
    },
    vibrate: {
        speedMultiplier: 5 // 5x faster animation during combat
    }
};
