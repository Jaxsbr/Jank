import { Vector3 } from 'three';
import { IComponent } from '../../ecs/IComponent';
import { KnockbackConfig } from '../config/KnockbackConfig';

export class ProjectileComponent implements IComponent {
    private velocity: Vector3;
    private damage: number;
    private maxRange: number;
    private startPosition: Vector3;
    private attackerId: string;
    private targetId: string | null;
    private knockbackConfig: KnockbackConfig | null;
    private spawnTime: number;

    constructor(
        velocity: Vector3,
        damage: number,
        maxRange: number,
        startPosition: Vector3,
        attackerId: string,
        targetId: string | null = null,
        knockbackConfig: KnockbackConfig | null = null,
        spawnTime: number = 0
    ) {
        this.velocity = velocity.clone();
        this.damage = damage;
        this.maxRange = maxRange;
        this.startPosition = startPosition.clone();
        this.attackerId = attackerId;
        this.targetId = targetId;
        this.knockbackConfig = knockbackConfig;
        this.spawnTime = spawnTime;
    }

    public getVelocity(): Vector3 {
        return this.velocity.clone();
    }

    public setVelocity(velocity: Vector3): void {
        this.velocity = velocity.clone();
    }

    public getDamage(): number {
        return this.damage;
    }

    public setDamage(damage: number): void {
        this.damage = damage;
    }

    public getMaxRange(): number {
        return this.maxRange;
    }

    public getStartPosition(): Vector3 {
        return this.startPosition.clone();
    }

    public getAttackerId(): string {
        return this.attackerId;
    }

    public getTargetId(): string | null {
        return this.targetId;
    }

    public getKnockbackConfig(): KnockbackConfig | null {
        return this.knockbackConfig;
    }

    public getSpawnTime(): number {
        return this.spawnTime;
    }

    /**
     * Calculate distance traveled from start position
     */
    public getDistanceTraveled(currentPosition: Vector3): number {
        return this.startPosition.distanceTo(currentPosition);
    }
}

