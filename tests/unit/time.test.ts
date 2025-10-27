import { Time } from '../../src/utils/Time';

describe('Time', () => {
    beforeEach(() => {
        // Reset Time state before each test
        Time.update(0);
    });

    describe('now()', () => {
        it('should return current time in seconds', () => {
            Time.update(1000); // 1 second in milliseconds
            expect(Time.now()).toBe(1.0);
        });

        it('should return fractional seconds', () => {
            Time.update(1500); // 1.5 seconds in milliseconds
            expect(Time.now()).toBe(1.5);
        });
    });

    describe('getDeltaTime()', () => {
        it('should return delta time between updates', () => {
            Time.update(1000); // 1 second
            Time.update(1500); // 1.5 seconds
            expect(Time.getDeltaTime()).toBe(0.5);
        });

        it('should return 0 for first update', () => {
            Time.update(1000);
            expect(Time.getDeltaTime()).toBe(0);
        });
    });

    describe('msToSeconds()', () => {
        it('should convert milliseconds to seconds', () => {
            expect(Time.msToSeconds(1000)).toBe(1.0);
            expect(Time.msToSeconds(500)).toBe(0.5);
            expect(Time.msToSeconds(2000)).toBe(2.0);
        });
    });

    describe('secondsToMs()', () => {
        it('should convert seconds to milliseconds', () => {
            expect(Time.secondsToMs(1.0)).toBe(1000);
            expect(Time.secondsToMs(0.5)).toBe(500);
            expect(Time.secondsToMs(2.0)).toBe(2000);
        });
    });

    describe('update()', () => {
        it('should update internal time state', () => {
            Time.update(2000);
            expect(Time.now()).toBe(2.0);
        });

        it('should calculate delta time correctly', () => {
            Time.update(1000);
            const firstDelta = Time.getDeltaTime();
            Time.update(1500);
            const secondDelta = Time.getDeltaTime();
            
            expect(firstDelta).toBe(0);
            expect(secondDelta).toBe(0.5);
        });
    });
});
