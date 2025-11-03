import { IComponent } from '../../ecs/IComponent';

export class TileComponent implements IComponent {
    private q: number; // Hex coordinate Q
    private r: number; // Hex coordinate R
    private tileType: string;
    private isCenter: boolean;
    private isActive: boolean;
    private level: number;

    constructor(q: number, r: number, tileType: string, isCenter = false) {
        this.q = q;
        this.r = r;
        this.tileType = tileType;
        this.isCenter = isCenter;
        this.isActive = true;
        this.level = 1;
    }

    // Getters
    public getQ(): number {
        return this.q;
    }

    public getR(): number {
        return this.r;
    }

    public getTileType(): string {
        return this.tileType;
    }

    public isCenterTile(): boolean {
        return this.isCenter;
    }

    public getIsActive(): boolean {
        return this.isActive;
    }

    public getLevel(): number {
        return this.level;
    }

    // Setters
    public setActive(active: boolean): void {
        this.isActive = active;
    }

    public setLevel(level: number): void {
        this.level = Math.max(1, level);
    }

    public upgrade(): void {
        this.level++;
    }

    // Utility methods
    public getHexKey(): string {
        return `${this.q},${this.r}`;
    }

    public getDistanceFromCenter(): number {
        if (this.isCenter) return 0;
        return (Math.abs(this.q) + Math.abs(this.q + this.r) + Math.abs(this.r)) / 2;
    }
}
