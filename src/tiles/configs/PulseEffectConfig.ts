export interface PulseEffectConfig {
    color: number;
    maxIntensity: number;
    pulseDuration: number;   // Total duration of one complete pulse (seconds)
    pulseFrequency: number;  // Number of pulses per duration
    duration: number; // Total effect duration (seconds)
}

export const defaultPulseEffectConfig: PulseEffectConfig = {
    color: 0xff4444,
    maxIntensity: 0.6,
    pulseDuration: 2.0,
    pulseFrequency: 1.0,
    duration: 10.0 // Total duration
};
