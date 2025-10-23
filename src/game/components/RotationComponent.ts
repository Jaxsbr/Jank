import { IComponent } from '../ecs/IComponent';

export class RotationComponent implements IComponent {
    private x: number;
    private y: number;
    private z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
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
}