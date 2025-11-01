import * as THREE from 'three';
import { FloorPatternConfig } from '../configs/FloorConfig';

/**
 * Shader-based animated circuitry pattern for floors
 * Creates animated circuit board patterns with glowing wires, pulsing lights, and flowing energy
 */
export class CircuitryPatternShader {
    static createShaderMaterial(
        config: FloorPatternConfig,
        baseColor: number
    ): THREE.ShaderMaterial {
        const uniforms = this.getUniforms(config, baseColor);
        
        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            transparent: false,
            side: THREE.DoubleSide
        });
    }

    private static getUniforms(
        config: FloorPatternConfig,
        baseColor: number
    ): Record<string, THREE.IUniform> {
        // Convert hex to vec3 for shader
        const baseR = ((baseColor >> 16) & 0xff) / 255;
        const baseG = ((baseColor >> 8) & 0xff) / 255;
        const baseB = (baseColor & 0xff) / 255;

        // Get circuitry-specific config or use defaults
        const circuitryConfig = config.circuitry ?? {};
        
        return {
            uTime: { value: 0.0 },
            uBaseColor: { value: new THREE.Vector3(baseR, baseG, baseB) },
            uPatternColor: { value: new THREE.Vector3(
                circuitryConfig.patternColor?.r ?? 0.2,
                circuitryConfig.patternColor?.g ?? 0.9,
                circuitryConfig.patternColor?.b ?? 0.5
            )},
            uIntensity: { value: config.intensity },
            uScale: { value: config.scale },
            uPatternDensity: { value: circuitryConfig.density ?? 8.0 },
            uWireGlow: { value: circuitryConfig.wireGlow ?? 0.6 },
            uPulseSpeed: { value: circuitryConfig.pulseSpeed ?? 2.0 }
        };
    }

    private static getVertexShader(): string {
        return `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    private static getFragmentShader(): string {
        return `
            uniform float uTime;
            uniform vec3 uBaseColor;
            uniform vec3 uPatternColor;
            uniform float uIntensity;
            uniform float uScale;
            uniform float uPatternDensity;
            uniform float uWireGlow;
            uniform float uPulseSpeed;

            varying vec2 vUv;
            varying vec3 vWorldPosition;

            // Hash function for noise
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // Noise function
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            // Draw a grid of circuit lines
            float circuitGrid(vec2 uv, float density) {
                vec2 grid = fract(uv * density) - 0.5;
                return min(abs(grid.x), abs(grid.y));
            }

            // Animated flowing energy along lines
            float flowEnergy(vec2 uv, float density, float time) {
                vec2 grid = uv * density;
                vec2 cell = floor(grid);
                vec2 cellUv = fract(grid) - 0.5;
                
                // Create flowing effect using sin wave modulated by cell position
                float flow = sin(time * 0.5 + hash(cell) * 10.0) * 0.5 + 0.5;
                
                // Energy travels along lines
                float dist = min(abs(cellUv.x), abs(cellUv.y));
                float energy = 1.0 - smoothstep(0.0, 0.15, abs(dist - flow * 0.5));
                
                return energy * 0.4;
            }

            // Pulsing node lights at intersections
            float nodePulse(vec2 uv, float density, float time) {
                vec2 cell = floor(uv * density);
                vec2 cellUv = fract(uv * density) - 0.5;
                
                float dist = length(cellUv);
                float pulseTime = hash(cell) * 3.14159 * 2.0 + time * uPulseSpeed;
                float pulse = sin(pulseTime) * 0.5 + 0.5;
                
                // Bright center with glow falloff
                return pulse * exp(-dist * 10.0);
            }

            // Random circuit paths between nodes
            float randomPath(vec2 uv, float density) {
                vec2 cell = floor(uv * density);
                vec2 cellUv = fract(uv * density);
                
                // Use hash to decide if this cell has a path
                float hasPath = step(0.6, hash(cell));
                
                // Create simple diagonal paths
                float path = 1.0 - smoothstep(0.0, 0.02, min(abs(cellUv.x), abs(cellUv.y)));
                
                return hasPath * path * 0.3;
            }

            void main() {
                vec2 uv = vUv * uScale;
                
                // Layer multiple pattern effects
                float grid = circuitGrid(uv, uPatternDensity);
                float wires = 1.0 - smoothstep(0.0, 0.03, grid);
                
                float flow = flowEnergy(uv, uPatternDensity, uTime);
                float pulse = nodePulse(uv, uPatternDensity, uTime);
                float paths = randomPath(uv, uPatternDensity * 0.7);
                
                // Combine effects
                vec3 color = uBaseColor;
                
                // Add wire lines with glow
                color = mix(color, uPatternColor, wires * uWireGlow * uIntensity);
                
                // Add flowing energy
                color += uPatternColor * flow * 0.8 * uIntensity;
                
                // Add pulsing nodes
                color += uPatternColor * pulse * 1.5 * uIntensity;
                
                // Add random paths
                color += uPatternColor * paths * uIntensity;
                
                // Subtle overall circuit board noise texture
                float n = noise(uv * 5.0 + uTime * 0.05);
                color *= 0.95 + n * 0.05;
                
                // Debug: uncomment to see UV mapping
                // color = mix(color, vec3(1.0, 0.0, 0.0), step(0.5, uv.x));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    /**
     * Update uniform values for animation
     * Call this in the render loop
     */
    static updateTime(material: THREE.ShaderMaterial, deltaTime: number): void {
        if (material.uniforms['uTime']) {
            material.uniforms['uTime'].value += deltaTime;
        }
    }
}

