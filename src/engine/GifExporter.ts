import GIF from 'gif.js';

export class GifExporter {
    public static async export(
        canvas: HTMLCanvasElement,
        durationMs: number = 2000,
        fps: number = 20,
        onProgress?: (progress: number) => void
    ): Promise<Blob> {
        return new Promise((resolve) => {
            const gif = new GIF({
                workers: 4,
                quality: 10,
                workerScript: '/gif.worker.js'
            });

            const frameDelay = 1000 / fps;
            const totalFrames = (durationMs / 1000) * fps;
            let framesCaptured = 0;
            let lastFrameTime = performance.now();

            gif.on('progress', (p: number) => {
                if (onProgress) onProgress(p);
            });

            const captureLoop = (time: number) => {
                if (framesCaptured < totalFrames) {
                    if (time - lastFrameTime >= frameDelay) {
                        gif.addFrame(canvas, { copy: true, delay: frameDelay });
                        framesCaptured++;
                        lastFrameTime = time;
                        // During capture, we are at 0-50% progress
                        if (onProgress) onProgress((framesCaptured / totalFrames) * 0.5);
                    }
                    requestAnimationFrame(captureLoop);
                } else {
                    gif.on('finished', (blob: Blob) => {
                        if (onProgress) onProgress(1);
                        resolve(blob);
                    });
                    gif.render();
                }
            };

            requestAnimationFrame(captureLoop);
        });
    }
}
