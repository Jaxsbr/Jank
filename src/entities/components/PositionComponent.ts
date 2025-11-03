import { Vector3 } from 'three';
import { IComponent } from '../../ecs/IComponent';

export class PositionComponent implements IComponent {
    private x: number;
    private y: number;
    private z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
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
     * Set all coordinates at once
     * @param x - The new X coordinate value
     * @param y - The new Y coordinate value
     * @param z - The new Z coordinate value
     */
    public setPosition(x: number, y: number, z: number): void {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Get the position as an object with x, y, z properties
     * @returns An object containing the x, y, z coordinates
     */
    public getPosition(): { x: number; y: number; z: number } {
        return { x: this.x, y: this.y, z: this.z };
    }

    /**
     * Convert the position to a Three.js Vector3
     * @returns A new Vector3 with the current position coordinates
     */
    public toVector3(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Set the position from a Three.js Vector3
     * @param vector - The Vector3 to copy coordinates from
     */
    public fromVector3(vector: Vector3): void {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
    }

    /**
     * Move the position by adding offset values
     * @param dx - The amount to move in the X direction
     * @param dy - The amount to move in the Y direction
     * @param dz - The amount to move in the Z direction
     */
    public translate(dx: number, dy: number, dz: number): void {
        this.x += dx;
        this.y += dy;
        this.z += dz;
    }

    /**
     * Move the position by adding a Vector3 offset
     * @param vector - The Vector3 offset to add to the current position
     */
    public translateVector3(vector: Vector3): void {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
    }

    /**
     * Calculate the distance to another position component
     * @param other - The other PositionComponent to calculate distance to
     * @returns The Euclidean distance between the two positions
     */
    public distanceTo(other: PositionComponent): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Create a copy of this position component
     * @returns A new PositionComponent with the same coordinates
     */
    public clone(): PositionComponent {
        return new PositionComponent(this.x, this.y, this.z);
    }
}
