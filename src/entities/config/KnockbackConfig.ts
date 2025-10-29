export interface KnockbackConfig {
    distance: number; // world units displacement target
    staggerDuration: number; // seconds
    initialSpeed: number; // units per second
    damping: number; // per-second exponential decay factor
}

export const defaultKnockbackConfig: KnockbackConfig = {
    distance: 1.0,
    staggerDuration: 0.15,
    initialSpeed: 20.0,
    damping: 8.0
};


