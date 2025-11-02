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
