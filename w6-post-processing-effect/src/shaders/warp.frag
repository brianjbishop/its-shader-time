varying vec2 vUv;
        
uniform sampler2D tDiffuse;
uniform float uTime;

void main()
{
    vec4 sourceColor = texture2D(tDiffuse, vUv);
    
    float r = sourceColor.r;
    float g = sourceColor.g;
    float b = sourceColor.b;
    
    // We use abs(sin()) to keep the values between 0.0 and 1.0
    float rNew = sourceColor.r * abs(sin(uTime * 1.2));       
    float gNew = sourceColor.g * abs(cos(uTime * 0.7));    
    float bNew = sourceColor.b * abs(sin(uTime * 1.8));
    
    gl_FragColor = vec4(rNew, gNew, bNew, 1.0);

    // gl_FragColor = sourceColor;
}
