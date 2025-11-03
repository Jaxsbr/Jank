import { IComponent } from '../../ecs/IComponent';

export class RotationComponent implements IComponent {
    private x: number;
    private y: number;
    private z: number;
    private speedMultiplier: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.speedMultiplier = 1.0;
    }

    /**
     * Get the X coordinate
     * @returns The X coordinate value
     */
    public getX(): number {
        return this.x;
    }

    /**
     * Get the Y coordinate
     * @returns The Y coordinate value
     */
    public getY(): number {
        return this.y;
    }

    /**
     * Get the Z coordinate
     * @returns The Z coordinate value
     */
    public getZ(): number {
        return this.z;
    }

    /**
     * Set the X coordinate
     * @param x - The new X coordinate value
     */
    public setX(x: number): void {
        this.x = x;
    }

    /**
     * Set the Y coordinate
     * @param y - The new Y coordinate value
     */
    public setY(y: number): void {
        this.y = y;
    }

    /**
     * Set the Z coordinate
     * @param z - The new Z coordinate value
     */
    public setZ(z: number): void {
        this.z = z;
    }

    /**
     * Get the rotation speed multiplier
     * @returns The speed multiplier
     */
    public getSpeedMultiplier(): number {
        return this.speedMultiplier;
    }

    /**
     * Set the rotation speed multiplier
     * @param multiplier - The new speed multiplier
     */
    public setSpeedMultiplier(multiplier: number): void {
        this.speedMultiplier = multiplier;
    }
}