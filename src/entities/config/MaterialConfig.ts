export interface MaterialConfig {
    main: {
        color: number;
        metalness: number;
        roughness: number;
        envMapIntensity: number;
    };
    secondary: {
        color: number;
        metalness: number;
        roughness: number;
        envMapIntensity: number;
    };
}

export const defaultMaterialConfig: MaterialConfig = {
    main: {
        color: 0xFFFFFF,      // White
        metalness: 0.3,       // Slightly metallic
        roughness: 0.5,       // Medium roughness
        envMapIntensity: 0.0  // No environment mapping
    },
    secondary: {
        color: 0xFFFFFF,      // White
        metalness: 0.6,       // More metallic
        roughness: 0.3,       // Less rough
        envMapIntensity: 0.0  // No environment mapping
    }
};
