export interface DamageVisualConfig {
    flashDuration: number; // seconds
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
}

export const defaultDamageVisualConfig: DamageVisualConfig = {
    flashDuration: 0.2, // seconds (was 200ms)
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
    }
};
