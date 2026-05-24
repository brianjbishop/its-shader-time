// Built-in transformation matrices.
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

// Mesh attributes.
attribute vec3 aPosition;
attribute vec2 aTexCoord;

// Custom uniforms.
uniform vec2 uResolution;

// Passed attributes.
varying vec2 vTexCoord;

void main() 
{
  // Copy the vec3 position into a vec4.
  vec4 position = vec4(aPosition, 1.0);

  // Move the shape for the origin in the center.
  // position.xy -= uResolution * 1;
  
  // Set the clip space position.
  gl_Position = uProjectionMatrix * uModelViewMatrix * position;

  // Pass data to the fragment shader.
  vTexCoord = aTexCoord;
}