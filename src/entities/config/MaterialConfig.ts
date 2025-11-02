export interface MaterialConfig {
    main: {
        color: number;
        metalness: number;
        roughness: number;
        envMapIntensity: number;
        emissive?: number; // Optional emissive color for glow
        emissiveIntensity?: number; // Optional emissive intensity (0-1)
    };
    secondary: {
        color: number;
        metalness: number;
        roughness: number;
        envMapIntensity: number;
        emissive?: number; // Optional emissive color for glow
        emissiveIntensity?: number; // Optional emissive intensity (0-1)
        cubeColor?: number; // Optional different color for cube protrusions (if not provided, uses color)
    };
}

export type CoreMaterialLevel = 'core-0' | 'core-1' | 'core-2' | 'core-3';

export interface LevelMaterialConfigs {
    'core-0': MaterialConfig;
    'core-1': MaterialConfig;
    'core-2': MaterialConfig;
    'core-3': MaterialConfig;
}

export const materialConfigsByLevel: LevelMaterialConfigs = {
    'core-0': {
        main: {
            color: 0x2a2a3a,      // Dark metallic purple-gray
            metalness: 0.6,       // Moderately metallic
            roughness: 0.3,       // Low roughness for shine
            envMapIntensity: 0.0
        },
        secondary: {
            color: 0x00d4ff,      // Cyan-blue
            metalness: 0.7,       // Highly metallic
            roughness: 0.2,       // Very smooth
            envMapIntensity: 0.0,
            emissive: 0x00d4ff,   // Cyan-blue glow
            emissiveIntensity: 0.8 // Strong emissive glow
        }
    },
    'core-1': {
        main: {
            color: 0x2a2a4a,      // Slightly lighter dark blue
            metalness: 0.65,
            roughness: 0.25,
            envMapIntensity: 0.0,
            emissive: 0x1a1a3a,
            emissiveIntensity: 0.2 // Subtle glow on main sphere
        },
        secondary: {
            color: 0x00e4ff,      // Brighter cyan
            metalness: 0.75,
            roughness: 0.15,
            envMapIntensity: 0.0,
            emissive: 0x00e4ff,
            emissiveIntensity: 1.0 // Stronger glow
        }
    },
    'core-2': {
        main: {
            color: 0x3a3a5a,      // Even lighter blue-gray
            metalness: 0.7,
            roughness: 0.2,
            envMapIntensity: 0.0,
            emissive: 0x2a2a5a,
            emissiveIntensity: 0.35
        },
        secondary: {
            color: 0x00f4ff,      // Very bright cyan
            metalness: 0.8,
            roughness: 0.1,
            envMapIntensity: 0.0,
            emissive: 0x00f4ff,
            emissiveIntensity: 1.2 // Very strong glow
        }
    },
    'core-3': {
        main: {
            color: 0x4a4a6a,      // Light blue-gray
            metalness: 0.75,
            roughness: 0.15,
            envMapIntensity: 0.0,
            emissive: 0x3a3a6a,
            emissiveIntensity: 0.5 // Moderate glow on main
        },
        secondary: {
            color: 0xffffff,      // Near-white cyan
            metalness: 0.85,
            roughness: 0.05,
            envMapIntensity: 0.0,
            emissive: 0x00ffff,
            emissiveIntensity: 1.5 // Maximum glow
        }
    }
};

// Export core-0 as default for backward compatibility
export const defaultMaterialConfig: MaterialConfig = materialConfigsByLevel['core-0'];
