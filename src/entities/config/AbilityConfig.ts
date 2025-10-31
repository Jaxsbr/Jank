export interface AbilityConfig {
    cooldownDuration: number; // seconds
    stunRadius: number; // hex rings (-1 means all enemies)
    stunDuration: number; // seconds
}

export const abilityConfigByLevel: Record<number, AbilityConfig> = {
    1: {
        cooldownDuration: 8,
        stunRadius: 2, // Stun rings 0-2
        stunDuration: 2
    },
    2: {
        cooldownDuration: 8,
        stunRadius: -1, // Special value: stun ALL enemies
        stunDuration: 3
    }
};

