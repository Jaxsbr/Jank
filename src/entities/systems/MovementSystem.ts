import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { MovementComponent } from '../components/MovementComponent';
import { PositionComponent } from '../components/PositionComponent';

export class MovementSystem implements IEntitySystem {
    update(entities: readonly Entity[]): void {
        entities.forEach(entity => {
            if (entity.hasComponent(MovementComponent) &&
                entity.hasComponent(PositionComponent) &&
                entity.hasComponent(GeometryComponent) &&
                entity.hasComponent(HealthComponent)) {
                
                const movement = entity.getComponent(MovementComponent);
                const position = entity.getComponent(PositionComponent);
                const geometry = entity.getComponent(GeometryComponent);
                const health = entity.getComponent(HealthComponent);
                
                if (movement && position && geometry && health && health.isAlive()) {
                    // Skip movement if target is already reached
                    if (movement.isTargetReached()) {
                        // TEMP: reset enemy pos once target is reached (create move reach loop)
                        // Use geometry group's Y position which is already bob-animated
                        const geometryGroup = geometry.getGeometryGroup();
                        const currentY = geometryGroup.position.y;
                        position.setPosition(5, currentY, 0);
                        geometryGroup.position.set(5, currentY, 0);
                        movement.setTargetReached(false);
                        movement.setCurrentSpeed(0); // Reset speed for smooth restart
                        return;
                    }
                    
                    // Get current position (ignore Y for movement calculations)
                    const currentPosition = position.toVector3();
                    const currentPosition2D = new THREE.Vector3(currentPosition.x, 0, currentPosition.z);
                    const targetPosition2D = new THREE.Vector3(movement.getTargetPosition().x, 0, movement.getTargetPosition().z);
                    
                    // Check if we're within threshold (2D distance only)
                    const distance2D = currentPosition2D.distanceTo(targetPosition2D);
                    if (distance2D <= movement.getTargetReachedThreshold()) {
                        movement.setTargetReached(true);
                        return;
                    }
                    
                    // Calculate movement direction (2D only)
                    const direction2D = targetPosition2D.clone().sub(currentPosition2D).normalize();
                    
                    // Update current speed based on acceleration/deceleration
                    let newSpeed = movement.getCurrentSpeed();
                    
                    if (movement.shouldDecelerate(currentPosition2D)) {
                        // Decelerate when approaching target
                        newSpeed = Math.max(0, newSpeed - movement.getDeceleration());
                    } else {
                        // Accelerate towards max speed
                        newSpeed = Math.min(movement.getMaxSpeed(), newSpeed + movement.getAcceleration());
                    }
                    
                    movement.setCurrentSpeed(newSpeed);
                    
                    // Calculate movement delta for this frame using current speed
                    const movementDelta = Math.min(newSpeed, distance2D);
                    
                    // Calculate new position (2D movement, preserve Y)
                    const movementVector2D = direction2D.multiplyScalar(movementDelta);
                    const newPosition = new THREE.Vector3(
                        currentPosition.x + movementVector2D.x,
                        currentPosition.y, // Preserve Y for bob animation
                        currentPosition.z + movementVector2D.z
                    );
                    
                    // Update position component
                    position.setPosition(newPosition.x, newPosition.y, newPosition.z);
                    
                    // Update geometry group position (preserving Y for bob animation)
                    const geometryGroup = geometry.getGeometryGroup();
                    geometryGroup.position.set(newPosition.x, geometryGroup.position.y, newPosition.z);
                }
            }
        });
    }
}
