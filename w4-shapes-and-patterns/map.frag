#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uAudio;
uniform float pixelDensity;

varying vec2 vTexCoord; 
// uniform float u_time;

void main(){
  // vec2 st = gl_FragCoord.xy/uResolution.xy;
  vec2 st = vTexCoord;
  // vec2 st = vTexCoord.xy;
  st.x *= uResolution.x/(uResolution.y);
  vec3 color = vec3(0.0);
  // float d = 0.0;
  // float d = length(centeredSt);

  // Remap the space to -1. to 1.
  st = st * 2.0 - 1.0;
  vec2 centeredSt = vec2(st.x - uMouse.x, st.y + uMouse.y);

  // Make the distance field
  float d = length( abs(centeredSt) - 0.2);
  // d = length( min(abs(st)-.3,0.) );
  // d = length( max(abs(st)-.3,0.) );

  // Visualize the distance field
  gl_FragColor = vec4(vec3(fract(d * (uAudio * 600.0))),1.0);

}
