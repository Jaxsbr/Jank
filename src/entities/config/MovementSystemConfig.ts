export interface MovementSystemConfig {
    steeringLerp: number; // 0..1, higher turns faster
}

export const defaultMovementSystemConfig: MovementSystemConfig = {
    steeringLerp: 0.25
};


