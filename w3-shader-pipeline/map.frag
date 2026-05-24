#ifdef GL_ES
precision mediump float;
#endif

// Passed attributes.
varying vec2 vTexCoord;

// Custom uniforms.
uniform sampler2D uTexMap;
uniform float uTime;

void main() 
{
  vec4 sourceColor = texture2D(uTexMap, vTexCoord);
  
  float r = sourceColor.r;
  float g = sourceColor.g;
  float b = sourceColor.b;
  
  // We use abs(sin()) to keep the values between 0.0 and 1.0
  float rNew = r * abs(sin(uTime * 0.0002));       
  float gNew = g * abs(cos(uTime * 0.0004));    
  float bNew = b * abs(sin(uTime * 0.001));
  
  gl_FragColor = vec4(rNew, gNew, bNew, 1.0);
}