import { CoreGeometryLevel } from './GeometryConfig';

/**
 * Wave point thresholds for each core visual level
 * Each level unlocks progressively as the player earns wave points
 */
export interface CoreVisualLevelThresholds {
    'core-0': 0;
    'core-1': 10;
    'core-2': 25;
    'core-3': 50;
}

/**
 * Wave point thresholds required to unlock each visual level
 */
export const coreVisualLevelThresholds: CoreVisualLevelThresholds = {
    'core-0': 0,   // Starting appearance
    'core-1': 10,  // Unlock at 10 wave points
    'core-2': 25,  // Unlock at 25 wave points
    'core-3': 50   // Unlock at 50 wave points
};

export type CoreVisualLevel = CoreGeometryLevel;

/**
 * Determines the current core visual level based on total wave points earned
 * @param wavePoints Total wave points the player has earned
 * @returns The appropriate visual level (core-0 through core-3)
 */
export function getCoreVisualLevel(wavePoints: number): CoreVisualLevel {
    if (wavePoints >= coreVisualLevelThresholds['core-3']) {
        return 'core-3';
    } else if (wavePoints >= coreVisualLevelThresholds['core-2']) {
        return 'core-2';
    } else if (wavePoints >= coreVisualLevelThresholds['core-1']) {
        return 'core-1';
    } else {
        return 'core-0';
    }
}

/**
 * Gets the next visual level threshold
 * @param currentLevel Current visual level
 * @returns Wave point threshold for next level, or null if already at max
 */
export function getNextLevelThreshold(currentLevel: CoreVisualLevel): number | null {
    switch (currentLevel) {
        case 'core-0':
            return coreVisualLevelThresholds['core-1'];
        case 'core-1':
            return coreVisualLevelThresholds['core-2'];
        case 'core-2':
            return coreVisualLevelThresholds['core-3'];
        case 'core-3':
            return null; // Already at max level
    }
}

/**
 * Gets the wave points required to reach the next level
 * @param wavePoints Current wave points
 * @returns Wave points needed for next level, or 0 if already at max
 */
export function getWavePointsToNextLevel(wavePoints: number): number {
    const currentLevel = getCoreVisualLevel(wavePoints);
    const nextThreshold = getNextLevelThreshold(currentLevel);
    
    if (nextThreshold === null) {
        return 0; // Already at max level
    }
    
    return Math.max(0, nextThreshold - wavePoints);
}

