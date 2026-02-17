varying vec3 vColor;

void main() {
    // Distance from center of point (0.0 to 0.5)
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // Create a soft glowing circle with a sharp core
    float core = 1.0 - smoothstep(0.0, 0.1, dist);
    float glow = exp(-dist * 5.0) * 0.6;
    
    float alpha = core + glow;
    
    // Discard outside the glow radius to keep it clean
    if (dist > 0.5) discard;

    gl_FragColor = vec4(vColor * 1.2, alpha);
}
