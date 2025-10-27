/**
 * Combat configuration shared by entities that can fight
 */
export interface CombatConfig {
    attack: {
        damage: number;
        range: number;
        cooldown: number; // milliseconds
    };
    target: {
        searchRange: number;
    };
    attackAnimation: {
        scaleMultiplier: number;
        duration: number; // milliseconds
    };
}
