import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

export class StardustEngine {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private composer: EffectComposer;
    private bloomPass: UnrealBloomPass;
    private particles: THREE.Points | null = null;
    private material: THREE.ShaderMaterial | null = null;
    private clock: THREE.Clock;
    private currentImageAspect: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true, // Quality boost
            alpha: false, // Solid black background for correct export colors
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true, // CRITICAL for capture
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Post processing
        const renderScene = new RenderPass(this.scene, this.camera);

        // FIX: Lower threshold (0.1) so particles are visible even if not pure white
        // Higher strength (2.0) for that premium "stardust" glow
        // SMART BLOOM: Threshold 0 ensures even dark images glow.
        // Radius increased for a more cinematic "nebula" spreading effect.
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.0, // Default to 0
            1.2, // Increased radius for more "spread"
            0.0  // Zero threshold = Maximum sensitivity
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);

        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.onResize.bind(this));
        this.animate();
    }

    public initParticles(
        imageData: Uint8ClampedArray,
        imgWidth: number,
        imgHeight: number,
        count: number = 30000
    ) {
        this.currentImageAspect = imgWidth / imgHeight;
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            (this.particles.material as THREE.Material).dispose();
        }

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const randoms = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const u = Math.random();
            const v = Math.random();

            const px = Math.floor(u * imgWidth);
            const py = Math.floor(v * imgHeight);
            const index = (py * imgWidth + px) * 4;

            const r = imageData[index] / 255;
            const g = imageData[index + 1] / 255;
            const b = imageData[index + 2] / 255;
            const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // Density bias: keep more particles in bright areas
            if (Math.random() > brightness + 0.1) {
                // If we skip, we just generate another random uv to try to fill bright spots
                // but for simplicity we'll just place them and let the shader handle alpha/glow
            }

            // Accurate aspect scaling
            const x = (u - 0.5) * 10 * this.currentImageAspect;
            const y = (0.5 - v) * 10;
            const z = (Math.random() - 0.5) * 0.2; // Shallow depth for better fidelity

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // SMART LUMINANCE BOOST:
            // If the image is very dark, we boost the particle colors slightly
            // so they don't get lost below the bloom threshold.
            const boost = 0.2 + (1.0 - brightness) * 0.15;
            colors[i * 3] = r + (r * boost);
            colors[i * 3 + 1] = g + (g * boost);
            colors[i * 3 + 2] = b + (b * boost);

            // Larger base size for better visibility on all screens
            // Factor in brightness more heavily to create depth
            sizes[i] = (Math.random() * 2.0 + 1.0) * (brightness * 0.6 + 0.4);
            randoms[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('random', new THREE.BufferAttribute(randoms, 1));

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uDrift: { value: 0.0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
        });

        this.particles = new THREE.Points(geometry, this.material);
        this.scene.add(this.particles);

        // Fit camera to the new content
        this.onResize();
    }

    public setDrift(value: number) {
        if (this.material) this.material.uniforms.uDrift.value = value;
    }

    public setBloom(value: number) {
        this.bloomPass.strength = value;
    }

    public screenshot(): string {
        this.composer.render();
        return this.renderer.domElement.toDataURL('image/png');
    }

    public resize() {
        this.onResize();
    }

    private onResize() {
        const parent = this.renderer.domElement.parentElement;
        if (!parent) return;

        const width = parent.clientWidth;
        const height = parent.clientHeight;
        const cameraAspect = width / height;

        this.camera.aspect = cameraAspect;

        // SMART CAMERA FITTING:
        // Adjust distance so the geometry (10 units high) fits properly.
        const fov = this.camera.fov * (Math.PI / 180);
        let distance = 5.5 / Math.tan(fov / 2); // 5.5 instead of 5 for a bit more padding

        // If the viewport is narrower than the image, pull back to fit width
        const imageAspect = this.currentImageAspect;
        if (cameraAspect < imageAspect) {
            distance = (5.5 * imageAspect) / (cameraAspect * Math.tan(fov / 2));
        }

        this.camera.position.z = distance;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);

        if (this.material) {
            this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
        }
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));
        const elapsedTime = this.clock.getElapsedTime();

        if (this.material) {
            this.material.uniforms.uTime.value = elapsedTime;
        }

        this.composer.render();
    }
}
