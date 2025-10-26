import { Vector3 } from 'three';

export interface GeometryConfig {
    mainSphere: {
        radius: number;
        segments: number;
    };
    protrusions: {
        radius: number;
        segments: number;
        embedRatio: number; // How much of the protrusion is embedded (0.5 = half embedded)
    };
    positions: Vector3[]; // 14 positions for even distribution on sphere surface
}

export const defaultGeometryConfig: GeometryConfig = {
    mainSphere: {
        radius: 0.5,
        segments: 32
    },
    protrusions: {
        radius: 0.15,
        segments: 16,
        embedRatio: 0.5 // 1/2 embedded, 1/2 protruding
    },
    positions: [
        // Original 8 cube vertices
        new Vector3(0.4, 0.4, 0.4),     // +X +Y +Z
        new Vector3(-0.4, 0.4, 0.4),    // -X +Y +Z
        new Vector3(0.4, -0.4, 0.4),    // +X -Y +Z
        new Vector3(-0.4, -0.4, 0.4),   // -X -Y +Z
        new Vector3(0.4, 0.4, -0.4),    // +X +Y -Z
        new Vector3(-0.4, 0.4, -0.4),   // -X +Y -Z
        new Vector3(0.4, -0.4, -0.4),   // +X -Y -Z
        new Vector3(-0.4, -0.4, -0.4),  // -X -Y -Z

        // Additional 6 knobs for symmetric distribution
        new Vector3(0.0, 0.4, 0.0),     // Top center
        new Vector3(0.0, -0.4, 0.0),    // Bottom center
        new Vector3(0.4, 0.0, 0.0),     // Right center
        new Vector3(-0.4, 0.0, 0.0),    // Left center
        new Vector3(0.0, 0.0, 0.4),     // Front center
        new Vector3(0.0, 0.0, -0.4)     // Back center
    ]
};
