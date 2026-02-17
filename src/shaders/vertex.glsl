uniform float uTime;
uniform float uDrift;
uniform float uPixelRatio;

attribute float size;
attribute float random;

varying vec3 vColor;

void main() {
    vColor = color;
    vec3 pos = position;

    // LIGHTWEIGHT high-performance drift
    // Avoids expensive noise functions to fix lag
    float time = uTime * 0.5;
    float drift = uDrift * 0.2;
    
    pos.x += sin(time + pos.y * 0.5 + random * 10.0) * drift;
    pos.y += cos(time + pos.x * 0.5 + random * 10.0) * drift;
    pos.z += sin(time * 1.5 + random * 20.0) * drift * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * uPixelRatio * (20.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
