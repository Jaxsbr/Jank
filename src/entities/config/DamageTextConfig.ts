export type TextAnimationCurve = 'linear' | 'easeOut' | 'easeInOut';

export interface TextAnimationConfig {
    floatSpeed: number; // units per second upward movement
    lifetime: number; // seconds
    fadeStartTime: number; // 0-1 normalized, when fade begins
    animationCurve: TextAnimationCurve;
    scaleAnimation?: {
        startScale: number;
        peakScale: number;
        peakTime: number; // 0-1 normalized
    };
}

export interface TextStyleConfig {
    fontSize: number;
    fontWeight: string;
    outlineWidth: number;
    outlineColor: string;
    glowBlur?: number; // Optional glow for special effects
}

export interface DamageTextConfig {
    // Per-text-type animation configs
    normal: TextAnimationConfig;
    critical: TextAnimationConfig;
    effect: TextAnimationConfig;
    
    // Per-text-type style configs
    normalStyle: TextStyleConfig;
    criticalStyle: TextStyleConfig;
    effectStyle: TextStyleConfig;
    
    // Colors (hex)
    colors: {
        normal: number;
        critical: number;
    };
    
    // Positioning
    yOffset: number; // Above entity center
    
    // Performance
    maxConcurrentText: number;
}

export const defaultDamageTextConfig: DamageTextConfig = {
    normal: {
        floatSpeed: 1.7,
        lifetime: 0.6,
        fadeStartTime: 0.5, // Start fading after 50% lifetime
        animationCurve: 'easeOut'
    },
    critical: {
        floatSpeed: 3.0,
        lifetime: 1.5,
        fadeStartTime: 0.4,
        animationCurve: 'easeOut',
        scaleAnimation: {
            startScale: 1.0,
            peakScale: 1.4,
            peakTime: 0.3 // Scale up to peak at 30% of lifetime
        }
    },
    effect: {
        floatSpeed: 1.5,
        lifetime: 0.8,
        fadeStartTime: 0.6,
        animationCurve: 'easeInOut'
    },
    normalStyle: {
        fontSize: 48,
        fontWeight: 'bold',
        outlineWidth: 3,
        outlineColor: '#000000',
        glowBlur: 8 // Subtle glow for visibility
    },
    criticalStyle: {
        fontSize: 60,
        fontWeight: '900', // Extra bold for emphasis
        outlineWidth: 4,
        outlineColor: '#1a1a1a', // Dark outline
        glowBlur: 20 // Stronger glow for crits
    },
    effectStyle: {
        fontSize: 44,
        fontWeight: 'bold',
        outlineWidth: 3,
        outlineColor: '#000000',
        glowBlur: 8
    },
    colors: {
        normal: 0xff6b6b, // Muted coral red (less vibrant)
        critical: 0xffe66d // Pale yellow-gold for crits
    },
    yOffset: 1.5, // 1.5 units above entity center
    maxConcurrentText: 30
};

