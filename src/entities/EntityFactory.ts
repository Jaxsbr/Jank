import { Scene, Vector3 } from 'three';
import { Entity } from '../ecs/Entity';
import { BobAnimationComponent } from './components/BobAnimationComponent';
import { GeometryComponent, SecondaryGeometryConfig, SecondaryGeometryType } from './components/GeometryComponent';
import { HealthComponent } from './components/HealthComponent';
import { MovementComponent } from './components/MovementComponent';
import { PositionComponent } from './components/PositionComponent';
import { RotationComponent } from './components/RotationComponent';

export interface IEntityFactory {
    createCoreEntity(): Entity;
}

export class EntityFactory implements IEntityFactory {
    private scene: Scene;
    private entities: Entity[] = []

    constructor(scene: Scene) {
        this.scene = scene
    }

    getEntities(): readonly Entity[] {
        return this.entities;
    }

    createCoreEntity(): Entity {
        const maxHP = 100;
        const position = new Vector3(0, 0, 0);
        const entity = new Entity();
        const mainSphereRadius = 0.5;
        const mainSphereSegments = 32;
        const protrusionRadius = 0.15;
        const protrusionWidthandHeight = 16;
        const embedDepth = protrusionRadius * 0.5; // 1/2 embedded, 1/2 protruding
        const baseY = 2.0;
        const bobAmplitude = 0.5;
        const bobAnimationSpeed = 0.02;
        // Using vertices of a cube for even distribution, positioned on sphere surface
        const positions = [
            // Original 8 cube vertices
            { x: 0.4, y: 0.4, z: 0.4 },     // +X +Y +Z
            { x: -0.4, y: 0.4, z: 0.4 },    // -X +Y +Z
            { x: 0.4, y: -0.4, z: 0.4 },    // +X -Y +Z
            { x: -0.4, y: -0.4, z: 0.4 },   // -X -Y +Z
            { x: 0.4, y: 0.4, z: -0.4 },    // +X +Y -Z
            { x: -0.4, y: 0.4, z: -0.4 },   // -X +Y -Z
            { x: 0.4, y: -0.4, z: -0.4 },   // +X -Y -Z
            { x: -0.4, y: -0.4, z: -0.4 },   // -X -Y -Z

            // Additional 6 knobs for symmetric distribution
            { x: 0.0, y: 0.4, z: 0.0 },     // Top center
            { x: 0.0, y: -0.4, z: 0.0 },    // Bottom center
            { x: 0.4, y: 0.0, z: 0.0 },     // Right center
            { x: -0.4, y: 0.0, z: 0.0 },    // Left center
            { x: 0.0, y: 0.0, z: 0.4 },     // Front center
            { x: 0.0, y: 0.0, z: -0.4 }     // Back center
        ];
        const secondaryConfigs: SecondaryGeometryConfig[] = [];

        positions.forEach(pos => {
            // Normalize the position to be on the sphere surface
            const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            const normalizedX = pos.x / length;
            const normalizedY = pos.y / length;
            const normalizedZ = pos.z / length;

            // Position the sphere so it's embedded (1/2 inside, 1/2 outside)
            const embedPosition = mainSphereRadius - embedDepth;
            const finalX = normalizedX * embedPosition;
            const finalY = normalizedY * embedPosition;
            const finalZ = normalizedZ * embedPosition;

            secondaryConfigs.push({
                type: SecondaryGeometryType.Sphere,
                position: new Vector3(finalX, finalY, finalZ),
                size: protrusionRadius,      // sphere radius
                segments: protrusionWidthandHeight, // sphere width and height
            })
        });
        
        entity.addComponent(new HealthComponent(maxHP))
        entity.addComponent(new PositionComponent(position.x, position.y, position.z))
        const geometryComponent = new GeometryComponent(mainSphereRadius, mainSphereSegments, secondaryConfigs)
        entity.addComponent(geometryComponent)
        entity.addComponent(new RotationComponent(0, 0.01, 0))
        entity.addComponent(new BobAnimationComponent(bobAnimationSpeed, bobAmplitude, baseY))

        // Set initial position of geometry group
        geometryComponent.getGeometryGroup().position.set(position.x, position.y, position.z);

        // Make entity geometry visible by adding to scene
        this.scene.add(geometryComponent.getGeometryGroup())

        // Add entity to entities to expose to various entity systems
        this.entities.push(entity)

        // We return the etity incase direct reference is required
        return entity
    }

    createEnemyEntity(): Entity {
        const maxHP = 100;
        const position = new Vector3(5, 0, 0);
        const entity = new Entity();
        const mainSphereRadius = 0.5;
        const mainSphereSegments = 32;
        const protrusionRadius = 0.15;
        const protrusionWidthandHeight = 16;
        const embedDepth = protrusionRadius * 0.5; // 1/2 embedded, 1/2 protruding
        const baseY = 1.5;
        const bobAmplitude = 0.2;
        const bobAnimationSpeed = 0.01;
        // Using vertices of a cube for even distribution, positioned on sphere surface
        const positions = [
            // Original 8 cube vertices
            { x: 0.4, y: 0.4, z: 0.4 },     // +X +Y +Z
            { x: -0.4, y: 0.4, z: 0.4 },    // -X +Y +Z
            { x: 0.4, y: -0.4, z: 0.4 },    // +X -Y +Z
            { x: -0.4, y: -0.4, z: 0.4 },   // -X -Y +Z
            { x: 0.4, y: 0.4, z: -0.4 },    // +X +Y -Z
            { x: -0.4, y: 0.4, z: -0.4 },   // -X +Y -Z
            { x: 0.4, y: -0.4, z: -0.4 },   // +X -Y -Z
            { x: -0.4, y: -0.4, z: -0.4 },   // -X -Y -Z

            // Additional 6 knobs for symmetric distribution
            { x: 0.0, y: 0.4, z: 0.0 },     // Top center
            { x: 0.0, y: -0.4, z: 0.0 },    // Bottom center
            { x: 0.4, y: 0.0, z: 0.0 },     // Right center
            { x: -0.4, y: 0.0, z: 0.0 },    // Left center
            { x: 0.0, y: 0.0, z: 0.4 },     // Front center
            { x: 0.0, y: 0.0, z: -0.4 }     // Back center
        ];
        const secondaryConfigs: SecondaryGeometryConfig[] = [];

        positions.forEach(pos => {
            // Normalize the position to be on the sphere surface
            const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            const normalizedX = pos.x / length;
            const normalizedY = pos.y / length;
            const normalizedZ = pos.z / length;

            // Position the sphere so it's embedded (1/2 inside, 1/2 outside)
            const embedPosition = mainSphereRadius - embedDepth;
            const finalX = normalizedX * embedPosition;
            const finalY = normalizedY * embedPosition;
            const finalZ = normalizedZ * embedPosition;

            secondaryConfigs.push({
                type: SecondaryGeometryType.Sphere,
                position: new Vector3(finalX, finalY, finalZ),
                size: protrusionRadius,      // sphere radius
                segments: protrusionWidthandHeight, // sphere width and height
            })
        });

        entity.addComponent(new HealthComponent(maxHP))
        entity.addComponent(new PositionComponent(position.x, position.y, position.z))
        const geometryComponent = new GeometryComponent(mainSphereRadius, mainSphereSegments, secondaryConfigs)
        
        // Make enemy visually distinct with red color
        geometryComponent.updateMainSphereColor(0xFF0000) // Red main sphere
        geometryComponent.updateSecondaryColor(0xFF6666)  // Light red secondary geometries
        
        entity.addComponent(geometryComponent)
        entity.addComponent(new RotationComponent(0, 0.01, 0))
        entity.addComponent(new BobAnimationComponent(bobAnimationSpeed, bobAmplitude, baseY))
        
        // Add movement component to make enemy move towards core entity (0, 0, 0)
        // Configure with acceleration, deceleration, and deceleration distance
        entity.addComponent(new MovementComponent(
            new Vector3(0, 0, 0),  // Target position (core entity)
            0.10,                  // Max speed (much faster)
            0.001,                  // Target reached threshold
            0.95,                  // Acceleration rate (much faster acceleration)
            0.0025,                  // Deceleration rate (much faster deceleration)
            3.0                    // Deceleration distance (start slowing down when 3 units away)
        ))

        // Set initial position of geometry group
        geometryComponent.getGeometryGroup().position.set(position.x, position.y, position.z);

        // Make entity geometry visible by adding to scene
        this.scene.add(geometryComponent.getGeometryGroup())

        // Add entity to entities to expose to various entity systems
        this.entities.push(entity)

        // We return the etity incase direct reference is required
        return entity
    }
}