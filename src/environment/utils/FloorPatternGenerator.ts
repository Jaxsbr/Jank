import * as THREE from 'three';
import { FloorPatternConfig } from '../configs/FloorConfig';

export class FloorPatternGenerator {
    private static readonly DEFAULT_TEXTURE_SIZE = 1024;

    static generatePatternTexture(
        config: FloorPatternConfig,
        baseColor: number
    ): THREE.Texture | null {
        if (config.type === 'none') {
            return null;
        }

        const canvas = document.createElement('canvas');
        const size = FloorPatternGenerator.DEFAULT_TEXTURE_SIZE;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.warn('Failed to get canvas context for floor pattern');
            return null;
        }

        // Fill canvas with white - texture map multiplies with material color
        // White areas will use full material color, pattern areas will be darker/lighter
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Determine pattern color - use gray or provided color, but convert to brightness value
        // For map textures, we need to think in terms of brightness (0-1) that multiplies with material color
        let patternBrightness: number;
        if (config.color !== undefined) {
            // Convert hex color to brightness (0-1 range)
            const r = ((config.color >> 16) & 0xff) / 255;
            const g = ((config.color >> 8) & 0xff) / 255;
            const b = (config.color & 0xff) / 255;
            // Calculate perceived brightness
            patternBrightness = (r * 0.299 + g * 0.587 + b * 0.114);
        } else {
            // Default: slightly lighter than base color would make it
            // Calculate base brightness and add intensity adjustment
            const baseR = ((baseColor >> 16) & 0xff) / 255;
            const baseG = ((baseColor >> 8) & 0xff) / 255;
            const baseB = (baseColor & 0xff) / 255;
            const baseBrightness = (baseR * 0.299 + baseG * 0.587 + baseB * 0.114);
            patternBrightness = Math.min(1.0, baseBrightness + 0.15);
        }

        // Adjust pattern brightness based on intensity (higher intensity = more visible)
        // Interpolate between white (1.0) and pattern brightness based on intensity
        // High intensity = more contrast (closer to pattern brightness), low intensity = closer to white (less visible)
        const finalBrightness = 1.0 - (1.0 - patternBrightness) * config.intensity;
        
        // Convert brightness to RGB for stroke color
        const patternValue = Math.floor(finalBrightness * 255);
        const patternColorHex = (patternValue << 16) | (patternValue << 8) | patternValue;

        // Draw pattern based on type
        ctx.strokeStyle = `#${patternColorHex.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = Math.max(1, Math.floor(size / 512)); // Scale line width with texture size for visibility
        ctx.globalAlpha = 1.0; // Don't use alpha here, we're controlling brightness directly

        switch (config.type) {
            case 'hexagonal':
                FloorPatternGenerator.drawHexagonalPattern(ctx, size, config.scale);
                break;
            case 'radial':
                FloorPatternGenerator.drawRadialPattern(ctx, size, config.scale);
                break;
            case 'grid':
                FloorPatternGenerator.drawGridPattern(ctx, size, config.scale);
                break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;

        return texture;
    }

    private static drawHexagonalPattern(
        ctx: CanvasRenderingContext2D,
        size: number,
        scale: number
    ): void {
        // Clamp scale to reasonable values to avoid division by zero or extreme sizes
        const clampedScale = Math.max(0.1, Math.min(10.0, scale));
        const hexSize = (size / 8) / clampedScale; // Adjust density based on scale
        const spacing = hexSize * Math.sqrt(3);

        // Draw hexagonal grid
        for (let y = -size; y < size * 2; y += spacing) {
            const offset = (Math.floor(y / spacing) % 2 === 0) ? 0 : hexSize * 1.5;
            
            for (let x = -size; x < size * 2; x += hexSize * 3) {
                const centerX = x + offset;
                const centerY = y;

                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const xPos = centerX + hexSize * Math.cos(angle);
                    const yPos = centerY + hexSize * Math.sin(angle);
                    
                    if (i === 0) {
                        ctx.moveTo(xPos, yPos);
                    } else {
                        ctx.lineTo(xPos, yPos);
                    }
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    private static drawRadialPattern(
        ctx: CanvasRenderingContext2D,
        size: number,
        scale: number
    ): void {
        const centerX = size / 2;
        const centerY = size / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        const clampedScale = Math.max(0.1, Math.min(10.0, scale));
        const ringSpacing = (maxRadius / 10) / clampedScale;

        // Draw concentric circles
        for (let radius = ringSpacing; radius < maxRadius; radius += ringSpacing) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw radial lines
        const lineCount = Math.floor(16 * clampedScale);
        for (let i = 0; i < lineCount; i++) {
            const angle = (Math.PI * 2 * i) / lineCount;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + maxRadius * Math.cos(angle),
                centerY + maxRadius * Math.sin(angle)
            );
            ctx.stroke();
        }
    }

    private static drawGridPattern(
        ctx: CanvasRenderingContext2D,
        size: number,
        scale: number
    ): void {
        const clampedScale = Math.max(0.1, Math.min(10.0, scale));
        const cellSize = (size / 10) / clampedScale;

        // Draw vertical lines
        for (let x = 0; x <= size; x += cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= size; y += cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }
    }
}

