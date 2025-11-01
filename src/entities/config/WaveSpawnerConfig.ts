export interface RoundConfig {
    totalBatches: number;      // Number of spawn batches
    batchSize: number;         // Enemies per batch
    spawnInterval: number;     // Seconds between spawn batches
    breakDuration: number;     // Seconds to wait before next round
}

export interface WaveConfig {
    rounds: RoundConfig[];     // Array of 3 rounds per wave
    breakDuration: number;     // Seconds to wait before next wave
}

export const defaultWaveConfig: WaveConfig = {
    rounds: [
        // Round 1: Easy - Sequential spawning
        {
            totalBatches: 6,
            batchSize: 1,
            spawnInterval: 3.0,
            breakDuration: 5.0
        },
        // Round 2: Moderate - Pair spawning
        {
            totalBatches: 5,
            batchSize: 2,
            spawnInterval: 7.0,
            breakDuration: 5.0
        },
        // Round 3: Hard - Batch spawning
        {
            totalBatches: 7,
            batchSize: 3,
            spawnInterval: 3.5,
            breakDuration: 5.0
        }
    ],
    breakDuration: 8.0
};
