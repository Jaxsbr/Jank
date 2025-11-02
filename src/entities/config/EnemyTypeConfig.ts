import { Vector3 } from 'three';
import { SecondaryGeometryType } from '../components/GeometryComponent';
import { GeometryConfig } from './GeometryConfig';
import { MaterialConfig } from './MaterialConfig';

export enum EnemyType {
    CHARGER = 'CHARGER',
    TANK = 'TANK',
    STANDARD = 'STANDARD'
}

/**
 * Configuration overrides for a specific enemy type.
 * These values override the base EnemyEntityConfig when an enemy type is specified.
 */
export interface EnemyTypeConfig {
    // Base stats (absolute values or multipliers)
    health: {
        maxHP: number; // Base HP value (wave scaling applied separately)
    };
    movement: {
        maxSpeed: number; // Absolute speed value
    };
    combat: {
        attack: {
            damage: number; // Absolute damage value
        };
    };
    // Visual overrides
    geometry: GeometryConfig; // Full geometry config (size, protrusions)
    material: MaterialConfig; // Full material config (colors, emissive)
    bobAnimation: {
        speed: number; // Animation speed multiplier
        amplitude: number; // Animation amplitude
        baseY: number; // Base Y position
    };
}

/**
 * Enemy type configurations following the milestone spec:
 * - Charger: Fast, Low HP, Medium Damage, smaller, bright orange-red with glow
 * - Tank: Slow, High HP, Low Damage, larger, dark gray
 * - Standard: Medium stats, current default appearance
 */
export const enemyTypeConfigs: Record<EnemyType, EnemyTypeConfig> = {
    [EnemyType.CHARGER]: {
        health: {
            maxHP: 55 // Low HP (vs 75 default)
        },
        movement: {
            maxSpeed: 0.035 // High speed (vs 0.02 default)
        },
        combat: {
            attack: {
                damage: 7 // Medium damage (vs 5 default)
            }
        },
        geometry: {
            mainSphere: {
                radius: 0.4, // Smaller sphere (vs 0.5 default)
                segments: 32
            },
            protrusions: {
                radius: 0.10, // Smaller protrusions for speed aesthetic
                segments: 8, // Lower segments for cubes
                embedRatio: 0.4 // Less embedded for more visible cubes
            },
            positions: [
                // Keep 14 positions, same locations as before
                new Vector3(0.32, 0.32, 0.32),
                new Vector3(-0.32, 0.32, 0.32),
                new Vector3(0.32, -0.32, 0.32),
                new Vector3(-0.32, -0.32, 0.32),
                new Vector3(0.32, 0.32, -0.32),
                new Vector3(-0.32, 0.32, -0.32),
                new Vector3(0.32, -0.32, -0.32),
                new Vector3(-0.32, -0.32, -0.32),
                new Vector3(0.0, 0.32, 0.0),
                new Vector3(0.0, -0.32, 0.0),
                new Vector3(0.32, 0.0, 0.0),
                new Vector3(-0.32, 0.0, 0.0),
                new Vector3(0.0, 0.0, 0.32),
                new Vector3(0.0, 0.0, -0.32)
            ],
            protrusionTypes: [
                // All cubes for angular look
                SecondaryGeometryType.Cube, SecondaryGeometryType.Cube, SecondaryGeometryType.Cube, SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube, SecondaryGeometryType.Cube, SecondaryGeometryType.Cube, SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube, SecondaryGeometryType.Cube, SecondaryGeometryType.Cube, SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube, SecondaryGeometryType.Cube
            ]
        },
        material: {
            main: {
                color: 0xFF4400, // Bright orange-red
                metalness: 0.3,
                roughness: 0.5,
                envMapIntensity: 0.0,
                emissive: 0xFF4400, // Glow effect for trail
                emissiveIntensity: 0.6
            },
            secondary: {
                color: 0xFF8844, // Lighter orange
                metalness: 0.6,
                roughness: 0.3,
                envMapIntensity: 0.0,
                emissive: 0xFF8844,
                emissiveIntensity: 0.8
            }
        },
        bobAnimation: {
            speed: 0.015, // Faster animation for trail effect (vs 0.01 default)
            amplitude: 0.2,
            baseY: 1.5
        }
    },
    [EnemyType.TANK]: {
        health: {
            maxHP: 175 // High HP (vs 75 default)
        },
        movement: {
            maxSpeed: 0.0125 // Low speed (vs 0.02 default)
        },
        combat: {
            attack: {
                damage: 3.5 // Low damage (vs 5 default)
            }
        },
        geometry: {
            mainSphere: {
                radius: 0.65, // Larger sphere (vs 0.5 default)
                segments: 32
            },
            protrusions: {
                radius: 0.22, // Larger protrusions for bulk feel
                segments: 16,
                embedRatio: 0.4 // Less embedded for more visible bulk
            },
            positions: [
                // 8 protrusions in mid-ring pattern (equatorial spread) - all spheres
                // Balanced around the middle of the sphere (Y near 0)
                new Vector3(0.52, 0.0, 0.52),      // Front-right
                new Vector3(-0.52, 0.0, 0.52),     // Front-left
                new Vector3(0.52, 0.0, -0.52),     // Back-right
                new Vector3(-0.52, 0.0, -0.52),    // Back-left
                new Vector3(0.0, 0.0, 0.52),       // Front center
                new Vector3(0.0, 0.0, -0.52),      // Back center
                new Vector3(0.52, 0.0, 0.0),       // Right center
                new Vector3(-0.52, 0.0, 0.0),      // Left center
                // Top and bottom cubes
                new Vector3(0.0, 0.52, 0.0),       // Top center
                new Vector3(0.0, -0.52, 0.0)       // Bottom center
            ],
            protrusionTypes: [
                // All mid-ring protrusions are spheres
                SecondaryGeometryType.Sphere, SecondaryGeometryType.Sphere,
                SecondaryGeometryType.Sphere, SecondaryGeometryType.Sphere,
                SecondaryGeometryType.Sphere, SecondaryGeometryType.Sphere,
                SecondaryGeometryType.Sphere, SecondaryGeometryType.Sphere,
                // Top and bottom are cubes
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube
            ],
            embedRatios: [
                // Mid-ring spheres use default embedRatio (0.4)
                0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4,
                // Top and bottom cubes sink more (higher embedRatio = more embedded)
                0.65,  // Top cube - sink more
                0.65   // Bottom cube - sink more
            ]
        },
        material: {
            main: {
                color: 0x666666, // Dark gray
                metalness: 0.3,
                roughness: 0.7, // Higher roughness for less shine
                envMapIntensity: 0.0,
                emissive: 0x444444, // Minimal glow
                emissiveIntensity: 0.1
            },
            secondary: {
                color: 0x777777, // Lighter gray for protrusions
                metalness: 0.4,
                roughness: 0.6,
                envMapIntensity: 0.0,
                emissive: 0x777777,
                emissiveIntensity: 0.15
            }
        },
        bobAnimation: {
            speed: 0.007, // Slower animation (vs 0.01 default)
            amplitude: 0.15, // Less amplitude
            baseY: 1.5
        }
    },
    [EnemyType.STANDARD]: {
        // Standard uses default values (no overrides needed, but defined for consistency)
        health: {
            maxHP: 75 // Default value
        },
        movement: {
            maxSpeed: 0.02 // Default value
        },
        combat: {
            attack: {
                damage: 5 // Default value
            }
        },
        geometry: {
            mainSphere: {
                radius: 0.5, // Standard size
                segments: 32
            },
            protrusions: {
                radius: 0.18, // Slightly larger than default for more presence
                segments: 16,
                embedRatio: 0.5
            },
            positions: [
                // 8 cube vertex positions (will be cubes)
                new Vector3(0.4, 0.4, 0.4),      // +X +Y +Z
                new Vector3(-0.4, 0.4, 0.4),    // -X +Y +Z
                new Vector3(0.4, -0.4, 0.4),    // +X -Y +Z
                new Vector3(-0.4, -0.4, 0.4),   // -X -Y +Z
                new Vector3(0.4, 0.4, -0.4),   // +X +Y -Z
                new Vector3(-0.4, 0.4, -0.4),   // -X +Y -Z
                new Vector3(0.4, -0.4, -0.4),   // +X -Y -Z
                new Vector3(-0.4, -0.4, -0.4),  // -X -Y -Z
                // 6 axis positions (top, bottom, sides - will be spheres)
                new Vector3(0.0, 0.4, 0.0),     // Top center
                new Vector3(0.0, -0.4, 0.0),    // Bottom center
                new Vector3(0.4, 0.0, 0.0),     // Right center (X+)
                new Vector3(-0.4, 0.0, 0.0),   // Left center (X-)
                new Vector3(0.0, 0.0, 0.4),    // Front center (Z+)
                new Vector3(0.0, 0.0, -0.4)     // Back center (Z-)
            ],
            // Spheres on axes (top, bottom, sides), cubes at vertices (in-between)
            protrusionTypes: [
                // 8 cube vertices - all cubes
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube,
                SecondaryGeometryType.Cube,
                // 6 axis positions - all spheres
                SecondaryGeometryType.Sphere,   // Top
                SecondaryGeometryType.Sphere,   // Bottom
                SecondaryGeometryType.Sphere,   // Right
                SecondaryGeometryType.Sphere,   // Left
                SecondaryGeometryType.Sphere,   // Front
                SecondaryGeometryType.Sphere    // Back
            ]
        },
        material: {
            main: {
                color: 0xAA2222, // Darker, more muted red (vs bright red)
                metalness: 0.4,
                roughness: 0.5,
                envMapIntensity: 0.0,
                emissive: 0x661111, // Subtle red glow
                emissiveIntensity: 0.3
            },
            secondary: {
                color: 0xDD4444, // Brighter red for sphere protrusions
                metalness: 0.6,
                roughness: 0.3,
                envMapIntensity: 0.0,
                emissive: 0xDD4444,
                emissiveIntensity: 0.5,
                cubeColor: 0xBB8855 // More distinct shade for cube protrusions (orange/brown tint to differentiate from spheres)
            }
        },
        bobAnimation: {
            speed: 0.01, // Default value
            amplitude: 0.2,
            baseY: 1.5
        }
    }
};

