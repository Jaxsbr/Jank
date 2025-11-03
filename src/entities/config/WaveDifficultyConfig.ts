import { RoundConfig, WaveConfig } from './WaveSpawnerConfig';

/**
 * Wave difficulty scaling configuration
 * Implements milestone-based tiers with exponential growth within tiers
 */

export enum DifficultyTier {
    EARLY = 'EARLY',    // Waves 1-3: Gentle introduction
    MID = 'MID',        // Waves 4-6: Noticeable ramp
    LATE = 'LATE',      // Waves 7-10: Serious challenge
    EXTREME = 'EXTREME' // Waves 11+: End-game intensity
}

export interface DifficultyScalers {
    hpMultiplier: number;           // HP scaling per wave
    damageMultiplier: number;        // Damage scaling per wave
    speedMultiplier: number;         // Speed scaling per wave
    batchSizeMultiplier: number;     // Spawn batch size multiplier
    spawnIntervalMultiplier: number; // Spawn rate multiplier (lower = faster)
    breakDurationMultiplier: number; // Break time multiplier (lower = less rest)
}

interface TierConfig {
    minWave: number;
    maxWave: number;
    baseScalers: DifficultyScalers;
    waveGrowthRate: number; // Exponential growth rate within this tier
}

const tierConfigs: TierConfig[] = [
    {
        minWave: 1,
        maxWave: 3,
        baseScalers: {
            hpMultiplier: 1.0,
            damageMultiplier: 1.0,
            speedMultiplier: 1.0,
            batchSizeMultiplier: 1.0,
            spawnIntervalMultiplier: 1.0,
            breakDurationMultiplier: 1.0
        },
        waveGrowthRate: 0.05 // 5% increase per wave
    },
    {
        minWave: 4,
        maxWave: 6,
        baseScalers: {
            hpMultiplier: 1.3,
            damageMultiplier: 1.2,
            speedMultiplier: 1.1,
            batchSizeMultiplier: 1.2,
            spawnIntervalMultiplier: 0.85, // 15% faster spawning
            breakDurationMultiplier: 0.9 // 10% shorter breaks
        },
        waveGrowthRate: 0.08 // 8% increase per wave
    },
    {
        minWave: 7,
        maxWave: 10,
        baseScalers: {
            hpMultiplier: 2.0,
            damageMultiplier: 1.8,
            speedMultiplier: 1.25,
            batchSizeMultiplier: 1.5,
            spawnIntervalMultiplier: 0.7, // 30% faster spawning
            breakDurationMultiplier: 0.8 // 20% shorter breaks
        },
        waveGrowthRate: 0.12 // 12% increase per wave
    },
    {
        minWave: 11,
        maxWave: Infinity,
        baseScalers: {
            hpMultiplier: 3.5,
            damageMultiplier: 2.5,
            speedMultiplier: 1.5,
            batchSizeMultiplier: 2.0,
            spawnIntervalMultiplier: 0.5, // 50% faster spawning
            breakDurationMultiplier: 0.6 // 40% shorter breaks
        },
        waveGrowthRate: 0.15 // 15% increase per wave, exponential
    }
];

/**
 * Get the tier configuration for a given wave
 */
function getTierForWave(wave: number): TierConfig {
    for (const tier of tierConfigs) {
        if (wave >= tier.minWave && wave <= tier.maxWave) {
            return tier;
        }
    }
    // Fallback to extreme tier (array is non-empty, so this is safe)
    return tierConfigs[tierConfigs.length - 1]!;
}

/**
 * Get difficulty tier for a wave
 */
export function getDifficultyTier(wave: number): DifficultyTier {
    if (wave <= 3) return DifficultyTier.EARLY;
    if (wave <= 6) return DifficultyTier.MID;
    if (wave <= 10) return DifficultyTier.LATE;
    return DifficultyTier.EXTREME;
}

/**
 * Calculate scaling multipliers for a given wave
 * 
 * @param wave The current wave number (1-based)
 * @returns DifficultyScalers with all scaling multipliers
 */
export function calculateWaveScalers(wave: number): DifficultyScalers {
    const tier = getTierForWave(wave);
    const wavesIntoThisTier = wave - tier.minWave;
    
    // Exponential growth: base * (1 + growthRate) ^ wavesIntoThisTier
    const growthFactor = Math.pow(1 + tier.waveGrowthRate, wavesIntoThisTier);
    
    return {
        hpMultiplier: tier.baseScalers.hpMultiplier * growthFactor,
        damageMultiplier: tier.baseScalers.damageMultiplier * growthFactor,
        speedMultiplier: tier.baseScalers.speedMultiplier * growthFactor,
        batchSizeMultiplier: tier.baseScalers.batchSizeMultiplier * growthFactor,
        spawnIntervalMultiplier: tier.baseScalers.spawnIntervalMultiplier / growthFactor, // Inverted for faster spawning
        breakDurationMultiplier: tier.baseScalers.breakDurationMultiplier / growthFactor // Inverted for shorter breaks
    };
}

/**
 * Apply wave scaling to a base WaveConfig
 * 
 * @param baseConfig The base wave configuration
 * @param wave The current wave number
 * @returns A new scaled WaveConfig
 */
export function scaleWaveConfig(baseConfig: WaveConfig, wave: number): WaveConfig {
    const scalers = calculateWaveScalers(wave);
    
    const scaledRounds: RoundConfig[] = baseConfig.rounds.map(round => ({
        totalBatches: round.totalBatches, // Keep batch count the same
        batchSize: Math.max(1, Math.floor(round.batchSize * scalers.batchSizeMultiplier)), // Scale batch size, min 1
        spawnInterval: Math.max(0.5, round.spawnInterval * scalers.spawnIntervalMultiplier), // Scale interval, min 0.5s
        breakDuration: Math.max(2.0, round.breakDuration * scalers.breakDurationMultiplier) // Scale break, min 2.0s
    }));
    
    return {
        rounds: scaledRounds,
        breakDuration: Math.max(3.0, baseConfig.breakDuration * scalers.breakDurationMultiplier) // Scale wave break, min 3.0s
    };
}

/**
 * Calculate HP bonus for a given wave
 * Uses exponential scaling based on tier and wave position
 * 
 * @param baseHP The base HP value
 * @param wave The current wave number
 * @returns HP value scaled by wave difficulty
 */
export function calculateScaledHP(baseHP: number, wave: number): number {
    const scalers = calculateWaveScalers(wave);
    return baseHP * scalers.hpMultiplier;
}

/**
 * Calculate damage for a given wave
 * 
 * @param baseDamage The base damage value
 * @param wave The current wave number
 * @returns Damage value scaled by wave difficulty
 */
export function calculateScaledDamage(baseDamage: number, wave: number): number {
    const scalers = calculateWaveScalers(wave);
    return baseDamage * scalers.damageMultiplier;
}

/**
 * Calculate speed for a given wave
 * 
 * @param baseSpeed The base speed value
 * @param wave The current wave number
 * @returns Speed value scaled by wave difficulty
 */
export function calculateScaledSpeed(baseSpeed: number, wave: number): number {
    const scalers = calculateWaveScalers(wave);
    return baseSpeed * scalers.speedMultiplier;
}

