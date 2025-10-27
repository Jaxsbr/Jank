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
