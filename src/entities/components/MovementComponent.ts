import { Vector3 } from 'three';
import { IComponent } from '../../ecs/IComponent';

export class MovementComponent implements IComponent {
    private targetPosition: Vector3;
    private movementSpeed: number; // This becomes maxSpeed
    private targetReached: boolean;
    private targetReachedThreshold: number;
    
    // Acceleration and deceleration properties
    private maxSpeed: number;
    private acceleration: number;
    private deceleration: number;
    private currentSpeed: number;
    private decelerationDistance: number; // Distance from target to start decelerating

    constructor(
        targetPosition: Vector3 = new Vector3(0, 0, 0),
        maxSpeed: number = 1.0,
        targetReachedThreshold: number = 0.1,
        acceleration: number = 0.02,
        deceleration: number = 0.03,
        decelerationDistance: number = 2.0
    ) {
        this.targetPosition = targetPosition.clone();
        this.movementSpeed = maxSpeed; // Keep for backward compatibility
        this.maxSpeed = maxSpeed;
        this.targetReached = false;
        this.targetReachedThreshold = targetReachedThreshold;
        this.acceleration = acceleration;
        this.deceleration = deceleration;
        this.currentSpeed = 0;
        this.decelerationDistance = decelerationDistance;
    }

    /**
     * Get the target position
     * @returns The target position as a Vector3
     */
    public getTargetPosition(): Vector3 {
        return this.targetPosition.clone();
    }

    /**
     * Set the target position
     * @param targetPosition - The new target position
     */
    public setTargetPosition(targetPosition: Vector3): void {
        this.targetPosition.copy(targetPosition);
        this.targetReached = false; // Reset target reached when target changes
    }

    /**
     * Get the movement speed
     * @returns The movement speed value
     */
    public getMovementSpeed(): number {
        return this.movementSpeed;
    }

    /**
     * Set the movement speed
     * @param speed - The new movement speed
     */
    public setMovementSpeed(speed: number): void {
        this.movementSpeed = speed;
    }

    /**
     * Check if the target has been reached
     * @returns True if target is reached, false otherwise
     */
    public isTargetReached(): boolean {
        return this.targetReached;
    }

    /**
     * Set the target reached status
     * @param reached - Whether the target has been reached
     */
    public setTargetReached(reached: boolean): void {
        this.targetReached = reached;
    }

    /**
     * Get the target reached threshold
     * @returns The threshold distance for considering target reached
     */
    public getTargetReachedThreshold(): number {
        return this.targetReachedThreshold;
    }

    /**
     * Set the target reached threshold
     * @param threshold - The new threshold distance
     */
    public setTargetReachedThreshold(threshold: number): void {
        this.targetReachedThreshold = threshold;
    }

    /**
     * Calculate the direction vector from current position to target
     * @param currentPosition - The current position
     * @returns Normalized direction vector
     */
    public getDirectionToTarget(currentPosition: Vector3): Vector3 {
        const direction = this.targetPosition.clone().sub(currentPosition);
        return direction.normalize();
    }

    /**
     * Calculate the distance to the target
     * @param currentPosition - The current position
     * @returns The distance to the target
     */
    public getDistanceToTarget(currentPosition: Vector3): number {
        return currentPosition.distanceTo(this.targetPosition);
    }

    /**
     * Check if the current position is within the target threshold
     * @param currentPosition - The current position
     * @returns True if within threshold, false otherwise
     */
    public isWithinThreshold(currentPosition: Vector3): boolean {
        return this.getDistanceToTarget(currentPosition) <= this.targetReachedThreshold;
    }

    // Acceleration and deceleration getters and setters

    /**
     * Get the maximum speed
     * @returns The maximum speed value
     */
    public getMaxSpeed(): number {
        return this.maxSpeed;
    }

    /**
     * Set the maximum speed
     * @param maxSpeed - The new maximum speed
     */
    public setMaxSpeed(maxSpeed: number): void {
        this.maxSpeed = maxSpeed;
        this.movementSpeed = maxSpeed; // Keep backward compatibility
    }

    /**
     * Get the current speed
     * @returns The current speed value
     */
    public getCurrentSpeed(): number {
        return this.currentSpeed;
    }

    /**
     * Set the current speed
     * @param speed - The new current speed
     */
    public setCurrentSpeed(speed: number): void {
        this.currentSpeed = Math.max(0, Math.min(speed, this.maxSpeed));
    }

    /**
     * Get the acceleration rate
     * @returns The acceleration value
     */
    public getAcceleration(): number {
        return this.acceleration;
    }

    /**
     * Set the acceleration rate
     * @param acceleration - The new acceleration rate
     */
    public setAcceleration(acceleration: number): void {
        this.acceleration = acceleration;
    }

    /**
     * Get the deceleration rate
     * @returns The deceleration value
     */
    public getDeceleration(): number {
        return this.deceleration;
    }

    /**
     * Set the deceleration rate
     * @param deceleration - The new deceleration rate
     */
    public setDeceleration(deceleration: number): void {
        this.deceleration = deceleration;
    }

    /**
     * Get the deceleration distance
     * @returns The distance from target to start decelerating
     */
    public getDecelerationDistance(): number {
        return this.decelerationDistance;
    }

    /**
     * Set the deceleration distance
     * @param distance - The new deceleration distance
     */
    public setDecelerationDistance(distance: number): void {
        this.decelerationDistance = distance;
    }

    /**
     * Check if the entity should start decelerating based on distance to target
     * @param currentPosition - The current position
     * @returns True if should decelerate, false otherwise
     */
    public shouldDecelerate(currentPosition: Vector3): boolean {
        return this.getDistanceToTarget(currentPosition) <= this.decelerationDistance;
    }
}
