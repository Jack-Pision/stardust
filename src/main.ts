import { StardustEngine } from './engine/StardustEngine';
import { ImageProcessor } from './engine/ImageProcessor';
import { GifExporter } from './engine/GifExporter';

class App {
  private engine: StardustEngine;
  private dropZone: HTMLElement;
  private fileInput: HTMLInputElement;
  private settings: HTMLElement;
  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.querySelector('#canvas-webgl') as HTMLCanvasElement;
    this.dropZone = document.querySelector('#drop-zone') as HTMLElement;
    this.fileInput = document.querySelector('#file-input') as HTMLInputElement;
    this.settings = document.querySelector('#settings') as HTMLElement;

    this.engine = new StardustEngine(this.canvas);

    this.initEventListeners();
  }

  private initEventListeners() {
    // File Upload Handlers
    this.dropZone.addEventListener('click', () => this.fileInput.click());

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFile(files[0]);
      }
    });

    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files && this.fileInput.files.length > 0) {
        this.handleFile(this.fileInput.files[0]);
      }
    });

    // Control Handlers
    const densityInput = document.querySelector('#density') as HTMLInputElement;
    const driftInput = document.querySelector('#drift') as HTMLInputElement;
    const bloomInput = document.querySelector('#bloom') as HTMLInputElement;
    const resetBtn = document.querySelector('#reset-btn') as HTMLButtonElement;
    const downloadPng = document.querySelector('#download-png') as HTMLButtonElement;
    const downloadGif = document.querySelector('#download-gif') as HTMLButtonElement;

    // Sync slider displays
    const densityVal = document.querySelector('#density-val') as HTMLElement;
    const driftVal = document.querySelector('#drift-val') as HTMLElement;
    const bloomVal = document.querySelector('#bloom-val') as HTMLElement;

    driftInput.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.engine.setDrift(parseFloat(val));
      driftVal.textContent = val;
    });

    bloomInput.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.engine.setBloom(parseFloat(val));
      bloomVal.textContent = val;
    });

    densityInput.addEventListener('input', (e) => {
      densityVal.textContent = parseInt((e.target as HTMLInputElement).value).toLocaleString();
    });

    // Re-initialize particles on density change (debounced or on change)
    densityInput.addEventListener('change', () => {
      if (this.currentImageData) {
        this.engine.initParticles(
          this.currentImageData.data,
          this.currentImageData.width,
          this.currentImageData.height,
          parseInt(densityInput.value)
        );
      }
    });

    resetBtn.addEventListener('click', () => {
      const viewer = document.querySelector('.viewer-container') as HTMLElement;
      const placeholder = document.querySelector('#viewer-placeholder') as HTMLElement;
      this.settings.classList.add('hidden');
      viewer.classList.add('hidden');
      placeholder.classList.remove('hidden');
      this.dropZone.classList.remove('hidden');
      this.fileInput.value = '';
    });

    downloadPng.addEventListener('click', () => {
      const dataUrl = this.engine.screenshot();
      const link = document.createElement('a');
      link.download = `stardust-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    });

    downloadGif.addEventListener('click', async () => {
      try {
        downloadGif.disabled = true;

        const gifBlob = await GifExporter.export(this.canvas, 3000, 20, (p) => {
          const percent = Math.round(p * 100);
          downloadGif.textContent = percent < 50
            ? `Capturing ${percent * 2}%`
            : `Encoding ${Math.round((p - 0.5) * 200)}%`;
        });

        const url = URL.createObjectURL(gifBlob);
        const link = document.createElement('a');
        link.download = `stardust-${Date.now()}.gif`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert('GIF export failed.');
      } finally {
        downloadGif.disabled = false;
        downloadGif.textContent = 'Record GIF';
      }
    });
  }

  private currentImageData: { data: Uint8ClampedArray; width: number; height: number } | null = null;

  private async handleFile(file: File) {
    try {
      this.currentImageData = await ImageProcessor.getImageData(file);

      const densityInput = document.querySelector('#density') as HTMLInputElement;
      const viewer = document.querySelector('.viewer-container') as HTMLElement;

      // Update viewer aspect ratio to match image
      const aspect = this.currentImageData.width / this.currentImageData.height;
      viewer.style.aspectRatio = aspect.toString();

      // Reveal viewer so dimensions can be calculated
      const placeholder = document.querySelector('#viewer-placeholder') as HTMLElement;
      this.dropZone.classList.add('hidden');
      this.settings.classList.remove('hidden');
      viewer.classList.remove('hidden');
      placeholder.classList.add('hidden');

      // Wait for layout to settle before init
      requestAnimationFrame(() => {
        this.engine.resize();

        this.engine.initParticles(
          this.currentImageData!.data,
          this.currentImageData!.width,
          this.currentImageData!.height,
          parseInt(densityInput.value)
        );
      });
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try another one.');
    }
  }
}

// Initialize the app
new App();
