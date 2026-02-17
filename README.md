# Stardust

Stardust is a casual creative project developed by Jack Pision. It is a high-fidelity particle cloud engine that transforms static images into dynamic, atmospheric stardust compositions.

## What is it

Stardust is a browser-based creative tool that uses WebGL and custom GLSL shaders to reinterpret image data as thousands of individual particles. The engine extracts color and luminance data from your uploads to generate a three-degree-of-freedom particle system that simulates depth, motion, and light.

## How it works

The core of the engine follows a three-stage pipeline:

1. Image Processing: The application downscales and analyzes the uploaded image to extract a pixel-perfect color and brightness map.
2. Particle Generation: Based on the selected density, the engine instantiates thousands of points. Their initial positions, sizes, and base colors are derived directly from the source image.
3. Rendering and Shaders: A custom vertex shader handles the stellar drift and motion physics on the GPU, while a fragment shader manages the particle shape and emissive properties. An Unreal Bloom pass is applied to create the signature stellar glow (Stellar Bloom).

## Use Cases

- Creative Art Generation: Transform standard photography into abstract, space-themed art.
- Visual Experimentation: Explore how different image compositions react to particle density and motion drift.
- High-Quality Exports: Generate PNGs or cinematic GIF loops for use as backgrounds, social media content, or digital assets.

## Project Details

This project is open for experimentation and creative use. It is built using:

- Three.js for the 3D core
- GLSL for high-performance GPU effects
- Vite for the development environment

### Socials

- GitHub: [https://github.com/Jack-Pision/stardust](https://github.com/Jack-Pision/stardust)
- X (Twitter): [https://x.com/Jack_pision](https://x.com/Jack_pision)

Feel free to use it, experiment with it, and create something unique.
