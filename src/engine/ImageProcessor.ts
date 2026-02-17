export class ImageProcessor {
    static async getImageData(file: File): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    // Maintain aspect ratio while sizing for processing
                    const maxDim = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxDim) {
                            height *= maxDim / width;
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width *= maxDim / height;
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const data = ctx.getImageData(0, 0, width, height).data;
                    resolve({ data, width, height });
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static sampleColor(
        imageData: Uint8ClampedArray,
        imgWidth: number,
        imgHeight: number,
        u: number,
        v: number
    ): { r: number; g: number; b: number; a: number; brightness: number } {
        const x = Math.floor(u * imgWidth);
        const y = Math.floor(v * imgHeight);
        const index = (y * imgWidth + x) * 4;

        const r = imageData[index] / 255;
        const g = imageData[index + 1] / 255;
        const b = imageData[index + 2] / 255;
        const a = imageData[index + 3] / 255;

        // Luminance formula
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        return { r, g, b, a, brightness };
    }
}
