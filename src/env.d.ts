declare module '*.glsl' {
    const content: string;
    export default content;
}

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
    import { WebGLRenderer, WebGLRenderTarget } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
    export class EffectComposer {
        constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
        addPass(pass: Pass): void;
        render(delta?: number): void;
        setSize(width: number, height: number): void;
    }
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
    import { Scene, Camera } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
    export class RenderPass extends Pass {
        constructor(scene: Scene, camera: Camera);
    }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
    import { Vector2 } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
    export class UnrealBloomPass extends Pass {
        constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
        strength: number;
        radius: number;
        threshold: number;
    }
}

declare module 'three/examples/jsm/postprocessing/Pass' {
    export class Pass {
        enabled: boolean;
        needsSwap: boolean;
        clear: boolean;
        renderToScreen: boolean;
    }
}
