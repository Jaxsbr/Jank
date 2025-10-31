export interface DamageVisualConfig {
    flashDuration: number; // seconds
    effectTintIntensity: number; // 0..1 tint amount for effect visuals
    effectColors: {
        ATTACK: number;
        BUFF: number;
        HEAL: number;
        SHIELD: number;
        SPEED: number;
        DEFAULT: number;
    };
    teamColors: {
        core: {
            original: {
                main: number;
                secondary: number;
            };
            flash: {
                main: number;
                secondary: number;
            };
        };
        enemy: {
            original: {
                main: number;
                secondary: number;
            };
            flash: {
                main: number;
                secondary: number;
            };
        };
    };
    stunVisual: {
        level1: { color: number; tintIntensity: number; duration: number };
        level2: { color: number; tintIntensity: number; duration: number };
    };
}

export const defaultDamageVisualConfig: DamageVisualConfig = {
    flashDuration: 0.2, // seconds (was 200ms)
    effectTintIntensity: 0.3,
    effectColors: {
        ATTACK: 0xff4444, // Red
        BUFF: 0x44ff44, // Green
        HEAL: 0x4444ff, // Blue
        SHIELD: 0xffff44, // Yellow
        SPEED: 0xff44ff, // Magenta
        DEFAULT: 0xffffff, // White
    },
    teamColors: {
        core: {
            original: {
                main: 0xFFFFFF,    // White main sphere
                secondary: 0xFFFFFF // White secondary geometries
            },
            flash: {
                main: 0xFF0000,    // Red flash
                secondary: 0xFF6666 // Light red flash
            }
        },
        enemy: {
            original: {
                main: 0xFF0000,    // Red main sphere
                secondary: 0xFF6666 // Light red secondary geometries
            },
            flash: {
                main: 0xFFFFFF,    // White flash for visibility
                secondary: 0xFFFF00 // Bright yellow flash
            }
        }
    },
    stunVisual: {
        level1: { color: 0x00e5ff, tintIntensity: 0.4, duration: 0.3 }, // Cyan
        level2: { color: 0xff00ff, tintIntensity: 0.5, duration: 0.3 }, // Magenta
    }
};
