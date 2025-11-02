import { KnockbackConfig } from './KnockbackConfig';
import { MaterialConfig } from './MaterialConfig';

/**
 * Configuration for pellet-type projectiles
 * Contains all visual, movement, and knockback properties shared across all users (core and enemies)
 * 
 * NOTE: Damage is NOT configured here - it's an attacker property, not a projectile property.
 * See CoreEntityConfig.combat.ranged.damage or EnemyEntityConfig.combat.ranged.damage for damage values.
 */
export interface PelletProjectileConfig {
    // Visual properties
    material: MaterialConfig;
    radius: number; // visual size (sphere radius)
    
    // Movement properties
    speed: number; // units per second
    maxRange: number; // maximum travel distance before expiry
    lifetime: number; // max time before auto-expiry (seconds)
    
    // Knockback properties
    knockback?: KnockbackConfig; // optional knockback config
}

/**
 * Default pellet projectile configuration
 * Orange glowing pellets with reduced knockback
 */
export const defaultPelletProjectileConfig: PelletProjectileConfig = {
    // Visual: bright orange glowing sphere
    material: {
        main: {
            color: 0xFF6600, // Orange color
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.0,
            emissive: 0xFF6600, // Orange emissive glow
            emissiveIntensity: 1.5 // Strong glow to overcome metalness
        },
        secondary: {
            color: 0xFF6600, // Orange color
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.0,
            emissive: 0xFF6600, // Orange emissive glow
            emissiveIntensity: 1.5 // Strong glow to overcome metalness
        }
    },
    radius: 0.1, // small pellet
    
    // Movement: fast travel speed
    speed: 15.0, // fast travel speed
    maxRange: 25.0,
    lifetime: 4.0, // expire after 4 seconds if still alive
    
    // Knockback: reduced impact
    knockback: {
        distance: 0.001, // reduced knockback
        staggerDuration: 0.001, // reduced stagger
        initialSpeed: 0.2, // reduced initial speed
        damping: 8.0
    }
};

