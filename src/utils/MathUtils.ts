import { PositionComponent } from '../entities/components/PositionComponent';

/**
 * Utility functions for mathematical calculations
 */
export class MathUtils {
    /**
     * Calculate 2D distance between two position components, ignoring Y position
     * This is useful for combat calculations where bob animation affects Y position
     * @param pos1 - First position component
     * @param pos2 - Second position component
     * @returns The 2D distance (X, Z plane only)
     */
    public static calculate2DDistance(pos1: PositionComponent, pos2: PositionComponent): number {
        const dx = pos1.getX() - pos2.getX();
        const dz = pos1.getZ() - pos2.getZ();
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Calculate 3D distance between two position components
     * @param pos1 - First position component
     * @param pos2 - Second position component
     * @returns The 3D distance
     */
    public static calculate3DDistance(pos1: PositionComponent, pos2: PositionComponent): number {
        const dx = pos1.getX() - pos2.getX();
        const dy = pos1.getY() - pos2.getY();
        const dz = pos1.getZ() - pos2.getZ();
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Clamp a value between min and max
     * @param value - The value to clamp
     * @param min - Minimum value
     * @param max - Maximum value
     * @returns The clamped value
     */
    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Linear interpolation between two values
     * @param start - Start value
     * @param end - End value
     * @param t - Interpolation factor (0-1)
     * @returns Interpolated value
     */
    public static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }
}
