/**
 * Centralized time management utility
 * All time values are in seconds for consistency across the application
 */
export class Time {
    private static currentTime: number = 0;
    private static lastTime: number = 0;
    private static deltaTime: number = 0;

    /**
     * Get the current time in seconds
     * @returns Current time in seconds since application start
     */
    public static now(): number {
        return this.currentTime;
    }

    /**
     * Get the delta time since last frame in seconds
     * @returns Delta time in seconds
     */
    public static getDeltaTime(): number {
        return this.deltaTime;
    }

    /**
     * Update the time system - should be called once per frame
     * @param currentTimeMs Current time in milliseconds (typically from performance.now())
     */
    public static update(currentTimeMs: number): void {
        const newTime = currentTimeMs / 1000; // Convert to seconds
        this.deltaTime = this.currentTime === 0 ? 0 : newTime - this.currentTime;
        this.currentTime = newTime;
    }

    /**
     * Advance the simulation time by a fixed delta (seconds) and set deltaTime to that value.
     * Use this inside a fixed-timestep simulation loop.
     */
    public static advanceFixed(dtSeconds: number): void {
        this.deltaTime = dtSeconds;
        this.currentTime += dtSeconds;
    }

    /**
     * Set the delta time for the current frame without advancing current time.
     * Useful to provide visual systems the real frame delta after fixed updates.
     */
    public static setDeltaForFrame(dtSeconds: number): void {
        this.deltaTime = dtSeconds;
    }

    /**
     * Convert milliseconds to seconds
     * @param milliseconds Time in milliseconds
     * @returns Time in seconds
     */
    public static msToSeconds(milliseconds: number): number {
        return milliseconds / 1000;
    }

    /**
     * Convert seconds to milliseconds
     * @param seconds Time in seconds
     * @returns Time in milliseconds
     */
    public static secondsToMs(seconds: number): number {
        return seconds * 1000;
    }
}
