import { MaterialConfig } from './MaterialConfig';

/**
 * Configuration for ranged attack upgrades
 * Level-based progression with range, damage, and cooldown modifiers
 */
export interface RangedAttackLevel {
    range: number;
    damage: number;
    cooldown: number;
    // Visual properties (optional, used if provided)
    visual?: {
        radius: number;
        material: MaterialConfig;
        segments?: number; // Optional, defaults to 16
    };
}

export interface RangedAttackConfig {
    levels: RangedAttackLevel[];
}

/**
 * Default ranged attack configuration
 * Level 1: Unlock ranged attacks
 * Level 2: Enhanced stats with more dramatic visuals
 */
export const defaultRangedAttackConfig: RangedAttackConfig = {
    levels: [
        // Level 0: Not unlocked (no ranged attack)
        { range: 0, damage: 0, cooldown: 0 },
        // Level 1: Unlock with base stats - bright orange glowing pellet
        { 
            range: 5.0, 
            damage: 5, 
            cooldown: 0.25,
            visual: {
                radius: 0.15, // Slightly larger than default
                material: {
                    main: {
                        color: 0xFF6600, // Orange
                        metalness: 0.3,
                        roughness: 0.3,
                        envMapIntensity: 1.5,
                        emissive: 0xFF8800, // Bright orange glow
                        emissiveIntensity: 2.5 // Very bright glow
                    },
                    secondary: {
                        color: 0xFF6600,
                        metalness: 0.3,
                        roughness: 0.3,
                        envMapIntensity: 1.5,
                        emissive: 0xFF8800,
                        emissiveIntensity: 2.5
                    }
                }
            }
        },
        // Level 2: Enhanced stats - larger, brighter, white-hot energy pellet
        { 
            range: 6.0, 
            damage: 10, 
            cooldown: 0.2,
            visual: {
                radius: 0.22, // Significantly larger
                material: {
                    main: {
                        color: 0xFFFFFF, // White-hot center
                        metalness: 0.1,
                        roughness: 0.2,
                        envMapIntensity: 2.0,
                        emissive: 0xFFAA00, // Bright orange-yellow glow
                        emissiveIntensity: 4.0 // Extremely bright
                    },
                    secondary: {
                        color: 0xFFD700, // Gold
                        metalness: 0.2,
                        roughness: 0.2,
                        envMapIntensity: 2.0,
                        emissive: 0xFFAA00,
                        emissiveIntensity: 4.0
                    }
                },
                segments: 24 // Smoother sphere for more dramatic effect
            }
        },
    ]
};

