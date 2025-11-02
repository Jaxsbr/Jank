import { Vector3 } from 'three';

import { SecondaryGeometryType } from '../components/GeometryComponent';

export interface GeometryConfig {
    mainSphere: {
        radius: number;
        segments: number;
    };
    protrusions: {
        radius: number;
        segments: number;
        embedRatio: number; // How much of the protrusion is embedded (0.5 = half embedded) - default for all
    };
    positions: Vector3[]; // Positions for protrusions on sphere surface
    protrusionTypes?: SecondaryGeometryType[]; // Optional array specifying geometry type for each position (defaults to Sphere if not provided)
    embedRatios?: number[]; // Optional array specifying embedRatio for each position (defaults to protrusions.embedRatio if not provided)
}

export type CoreGeometryLevel = 'core-0' | 'core-1' | 'core-2' | 'core-3';

export interface LevelGeometryConfigs {
    'core-0': GeometryConfig;
    'core-1': GeometryConfig;
    'core-2': GeometryConfig;
    'core-3': GeometryConfig;
}

export const geometryConfigsByLevel: LevelGeometryConfigs = {
    'core-0': {
        mainSphere: {
            radius: 0.75,    // 0.5 * 1.5 = 0.75
            segments: 32
        },
        protrusions: {
            radius: 0.225,   // 0.15 * 1.5 = 0.225
            segments: 16,
            embedRatio: 0.5 // 1/2 embedded, 1/2 protruding
        },
        positions: [
            // Original 8 cube vertices (scaled by 1.5)
            new Vector3(0.6, 0.6, 0.6),     // 0.4 * 1.5 = 0.6 (+X +Y +Z)
            new Vector3(-0.6, 0.6, 0.6),    // -0.6 (-X +Y +Z)
            new Vector3(0.6, -0.6, 0.6),    // +X -Y +Z
            new Vector3(-0.6, -0.6, 0.6),   // -X -Y +Z
            new Vector3(0.6, 0.6, -0.6),    // +X +Y -Z
            new Vector3(-0.6, 0.6, -0.6),   // -X +Y -Z
            new Vector3(0.6, -0.6, -0.6),   // +X -Y -Z
            new Vector3(-0.6, -0.6, -0.6),  // -X -Y -Z

            // Additional 6 knobs for symmetric distribution
            new Vector3(0.0, 0.6, 0.0),     // Top center
            new Vector3(0.0, -0.6, 0.0),    // Bottom center
            new Vector3(0.6, 0.0, 0.0),     // Right center
            new Vector3(-0.6, 0.0, 0.0),    // Left center
            new Vector3(0.0, 0.0, 0.6),     // Front center
            new Vector3(0.0, 0.0, -0.6)     // Back center
        ]
    },
    'core-1': {
        mainSphere: {
            radius: 0.75,
            segments: 32
        },
        protrusions: {
            radius: 0.27,    // 0.18 * 1.5 = 0.27
            segments: 16,
            embedRatio: 0.5
        },
        positions: [
            // Same positions as core-0 for now
            new Vector3(0.6, 0.6, 0.6),
            new Vector3(-0.6, 0.6, 0.6),
            new Vector3(0.6, -0.6, 0.6),
            new Vector3(-0.6, -0.6, 0.6),
            new Vector3(0.6, 0.6, -0.6),
            new Vector3(-0.6, 0.6, -0.6),
            new Vector3(0.6, -0.6, -0.6),
            new Vector3(-0.6, -0.6, -0.6),
            new Vector3(0.0, 0.6, 0.0),
            new Vector3(0.0, -0.6, 0.0),
            new Vector3(0.6, 0.0, 0.0),
            new Vector3(-0.6, 0.0, 0.0),
            new Vector3(0.0, 0.0, 0.6),
            new Vector3(0.0, 0.0, -0.6)
        ]
    },
    'core-2': {
        mainSphere: {
            radius: 0.78,    // 0.52 * 1.5 = 0.78
            segments: 32
        },
        protrusions: {
            radius: 0.3,     // 0.2 * 1.5 = 0.3
            segments: 16,
            embedRatio: 0.5
        },
        positions: [
            // Same positions as core-0 for now
            new Vector3(0.6, 0.6, 0.6),
            new Vector3(-0.6, 0.6, 0.6),
            new Vector3(0.6, -0.6, 0.6),
            new Vector3(-0.6, -0.6, 0.6),
            new Vector3(0.6, 0.6, -0.6),
            new Vector3(-0.6, 0.6, -0.6),
            new Vector3(0.6, -0.6, -0.6),
            new Vector3(-0.6, -0.6, -0.6),
            new Vector3(0.0, 0.6, 0.0),
            new Vector3(0.0, -0.6, 0.0),
            new Vector3(0.6, 0.0, 0.0),
            new Vector3(-0.6, 0.0, 0.0),
            new Vector3(0.0, 0.0, 0.6),
            new Vector3(0.0, 0.0, -0.6)
        ]
    },
    'core-3': {
        mainSphere: {
            radius: 0.825,   // 0.55 * 1.5 = 0.825
            segments: 32
        },
        protrusions: {
            radius: 0.33,    // 0.22 * 1.5 = 0.33
            segments: 16,
            embedRatio: 0.5
        },
        positions: [
            // Same positions as core-0 for now
            new Vector3(0.6, 0.6, 0.6),
            new Vector3(-0.6, 0.6, 0.6),
            new Vector3(0.6, -0.6, 0.6),
            new Vector3(-0.6, -0.6, 0.6),
            new Vector3(0.6, 0.6, -0.6),
            new Vector3(-0.6, 0.6, -0.6),
            new Vector3(0.6, -0.6, -0.6),
            new Vector3(-0.6, -0.6, -0.6),
            new Vector3(0.0, 0.6, 0.0),
            new Vector3(0.0, -0.6, 0.0),
            new Vector3(0.6, 0.0, 0.0),
            new Vector3(-0.6, 0.0, 0.0),
            new Vector3(0.0, 0.0, 0.6),
            new Vector3(0.0, 0.0, -0.6)
        ]
    }
};

// Export original-sized config as default for backward compatibility (enemies use this)
export const defaultGeometryConfig: GeometryConfig = {
    mainSphere: {
        radius: 0.5,
        segments: 32
    },
    protrusions: {
        radius: 0.15,
        segments: 16,
        embedRatio: 0.5
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
