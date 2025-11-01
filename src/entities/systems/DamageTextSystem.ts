import * as THREE from 'three';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { Time } from '../../utils/Time';
import { EffectType } from '../EffectType';
import { DamageTextConfig, TextAnimationConfig, defaultDamageTextConfig } from '../config/DamageTextConfig';

interface DamageTextInstance {
    sprite: THREE.Sprite;
    startTime: number;
    config: TextAnimationConfig;
    startPosition: THREE.Vector3;
    textType: 'normal' | 'critical' | 'effect';
    effectType?: EffectType;
    baseScale: number;
}

export class DamageTextSystem implements IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private config: DamageTextConfig;
    private activeTexts: DamageTextInstance[] = [];
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private effectColors: Map<EffectType, number>;

    constructor(
        eventDispatcher: EventDispatcherSingleton,
        scene: THREE.Scene,
        camera: THREE.Camera,
        config: DamageTextConfig = defaultDamageTextConfig
    ) {
        this.eventDispatcher = eventDispatcher;
        this.scene = scene;
        this.camera = camera;
        this.config = config;
        this.eventDispatcher.registerListener('DamageTextSystem', this);
        
        // Map effect types to colors (muted for dark aesthetic)
        this.effectColors = new Map([
            [EffectType.ATTACK, 0xff8c8c],    // Soft red
            [EffectType.BUFF, 0x7aff7a],      // Soft green
            [EffectType.HEAL, 0x8cafff],      // Soft blue
            [EffectType.SHIELD, 0xffff8c],    // Soft yellow
            [EffectType.SPEED, 0xff8cff]      // Soft magenta
        ]);
    }

    public onEvent(event: Event): void {
        if (event.eventName === EventType.DamageTaken) {
            this.handleDamageTaken(event);
        }
    }

    private handleDamageTaken(event: Event): void {
        // Support both targetId (CombatSystem) and entityId (EffectTickSystem)
        const targetId = (event.args['targetId'] || event.args['entityId']) as string;
        const damage = event.args['damage'] as number;
        const position = event.args['position'] as THREE.Vector3;
        const isCritical = event.args['isCritical'] as boolean | undefined;
        const effectType = event.args['effectType'] as EffectType | undefined;

        if (!targetId || typeof damage !== 'number' || !position) {
            return;
        }

        // Limit concurrent text instances
        if (this.activeTexts.length >= this.config.maxConcurrentText) {
            return;
        }

        // Determine text type
        let textType: 'normal' | 'critical' | 'effect';
        if (effectType) {
            textType = 'effect';
        } else if (isCritical) {
            textType = 'critical';
        } else {
            textType = 'normal';
        }

        this.spawnDamageText(damage, position, textType, effectType);
    }

    private spawnDamageText(
        damage: number,
        position: THREE.Vector3,
        textType: 'normal' | 'critical' | 'effect',
        effectType?: EffectType
    ): void {
        // Get config for this text type
        const animConfig = textType === 'critical' 
            ? this.config.critical 
            : textType === 'effect' 
            ? this.config.effect 
            : this.config.normal;

        // Get color
        const color = this.getColorForTextType(textType, effectType);

        // Get base scale for this text type
        const baseScale = textType === 'critical' ? 1.5 : textType === 'effect' ? 1.2 : 1.3;

        // Create sprite
        const sprite = this.createTextSprite(damage, textType, color, baseScale);

        // Position above entity
        const startPos = position.clone();
        startPos.y += this.config.yOffset;
        sprite.position.copy(startPos);

        // Add to scene
        this.scene.add(sprite);

        // Track instance
        const instance: DamageTextInstance = {
            sprite,
            startTime: Time.now(),
            config: animConfig,
            startPosition: startPos.clone(),
            textType,
            effectType,
            baseScale
        };
        this.activeTexts.push(instance);
    }

    private createTextSprite(
        damage: number,
        textType: 'normal' | 'critical' | 'effect',
        color: number,
        baseScale: number
    ): THREE.Sprite {
        // Get style config
        const styleConfig = textType === 'critical'
            ? this.config.criticalStyle
            : textType === 'effect'
            ? this.config.effectStyle
            : this.config.normalStyle;

        // Create canvas with text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        // Set canvas size
        canvas.width = 256;
        canvas.height = 128;

        // Configure text style
        ctx.font = `${styleConfig.fontWeight} ${styleConfig.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw text with outline
        const text = Math.round(damage).toString();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Apply glow if configured
        if (styleConfig.glowBlur) {
            ctx.shadowColor = `#${color.toString(16).padStart(6, '0')}`;
            ctx.shadowBlur = styleConfig.glowBlur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // Draw outline
        ctx.strokeStyle = styleConfig.outlineColor;
        ctx.lineWidth = styleConfig.outlineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeText(text, centerX, centerY);

        // Draw text (glow will also apply to fill)
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.fillText(text, centerX, centerY);

        // Clear shadow after both
        ctx.shadowBlur = 0;

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);

        // Create sprite material with appropriate blending
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            blending: textType === 'critical' ? THREE.AdditiveBlending : THREE.NormalBlending
        });

        // Create sprite
        const sprite = new THREE.Sprite(material);

        // Set initial scale
        sprite.scale.setScalar(baseScale);

        return sprite;
    }

    private getColorForTextType(
        textType: 'normal' | 'critical' | 'effect',
        effectType?: EffectType
    ): number {
        if (textType === 'effect' && effectType && this.effectColors.has(effectType)) {
            return this.effectColors.get(effectType)!;
        }
        if (textType === 'critical') {
            return this.config.colors.critical;
        }
        return this.config.colors.normal;
    }

    private applyEasing(t: number, curve: string): number {
        switch (curve) {
            case 'easeOut':
                return 1 - Math.pow(1 - t, 3);
            case 'easeInOut':
                return t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2;
            case 'linear':
            default:
                return t;
        }
    }

    public update(): void {
        if (this.activeTexts.length === 0) {
            return;
        }

        const now = Time.now();

        for (let i = this.activeTexts.length - 1; i >= 0; i--) {
            const text = this.activeTexts[i];
            if (!text) {
                continue;
            }

            // Calculate normalized lifetime
            const elapsed = now - text.startTime;
            const t = elapsed / text.config.lifetime;

            if (t >= 1) {
                // Expired - cleanup
                this.scene.remove(text.sprite);
                text.sprite.material.map?.dispose();
                text.sprite.material.dispose();
                text.sprite.geometry.dispose();
                this.activeTexts.splice(i, 1);
                continue;
            }

            // Apply easing
            const easedT = this.applyEasing(t, text.config.animationCurve);

            // Move upward
            const floatDistance = text.config.floatSpeed * elapsed;
            text.sprite.position.copy(text.startPosition);
            text.sprite.position.y += floatDistance;

            // Apply scale animation if configured
            if (text.config.scaleAnimation) {
                const scaleAnim = text.config.scaleAnimation;
                let scale: number;
                if (t < scaleAnim.peakTime) {
                    // Scale up to peak
                    const peakT = t / scaleAnim.peakTime;
                    scale = scaleAnim.startScale + 
                        (scaleAnim.peakScale - scaleAnim.startScale) * this.applyEasing(peakT, 'easeOut');
                } else {
                    // Scale down from peak
                    const scaleDownT = (t - scaleAnim.peakTime) / (1 - scaleAnim.peakTime);
                    scale = scaleAnim.peakScale + 
                        (scaleAnim.startScale - scaleAnim.peakScale) * this.applyEasing(scaleDownT, 'easeInOut');
                }
                text.sprite.scale.setScalar(scale * text.baseScale);
            }

            // Apply fade-out
            const fadeStart = text.config.fadeStartTime;
            let opacity = 1;
            if (t > fadeStart) {
                const fadeT = (t - fadeStart) / (1 - fadeStart);
                opacity = 1 - fadeT;
            }
            text.sprite.material.opacity = opacity;
        }
    }

    public destroy(): void {
        this.eventDispatcher.deregisterListener('DamageTextSystem');
        // Cleanup all active texts
        for (const text of this.activeTexts) {
            this.scene.remove(text.sprite);
            text.sprite.material.map?.dispose();
            text.sprite.material.dispose();
            text.sprite.geometry.dispose();
        }
        this.activeTexts = [];
    }
}

