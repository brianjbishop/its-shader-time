/* eslint-disable no-undef, no-unused-vars, import/first */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// --- SHADER SOURCE CODE ---
// These replace your .vert and .frag file imports

const updateVert = `
  uniform mat4 projectionMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 modelMatrix;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
  }
`;

const updateFrag = `
  precision mediump float;
  uniform sampler2D uTexPositions;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
      vec4 modelPos = texture2D(uTexPositions, vUv);
      gl_FragColor = modelPos;
  }
`;

const renderVert = `
  uniform mat4 projectionMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 modelMatrix;
  attribute vec2 uv;
  uniform sampler2D uTexPositions;
  varying vec2 vUv;
  float random(vec2 st){
      return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
  }
  void main() {
      vec4 modelPos = texture2D(uTexPositions, uv);
      modelPos.w = 1.0;
      gl_PointSize = 20.0 + random(uv) * 40.0;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * modelPos;
      vUv = uv;
  }
`;

const renderFrag = `
  precision mediump float;
  uniform float uTime;
  uniform float uLastClickTime;
  varying vec2 vUv;
  float random(vec2 st){
      return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
  }
  mat2 rotate2d(float _angle){
      return mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle));
  }
  void main() {
      float angle = random(vUv * 1.5) * 6.28;
      vec2 pt = gl_PointCoord - vec2(0.5);
      pt = rotate2d(angle) * pt;
      pt += vec2(0.5);
      float w = 0.2 + random(vUv * 2.1) * 0.8;
      float h = 0.1 + random(vUv * 3.4) * 0.3;
      if(abs(pt.x - 0.5) > (w / 2.0) || abs(pt.y - 0.5) > (h / 2.0)){
          discard;
      }
      float timeSinceClick = max(0.0, uTime - uLastClickTime);
      float randOffset = random(vUv) * 6.28;
      float flicker = sin(15.0 * pow(timeSinceClick, 0.8) + randOffset);
      flicker = flicker * 0.5 + 0.5;
      float fade = exp(-timeSinceClick * 0.4);
      vec3 baseColor = vec3(0.1, 0.6, 1.0);
      float flashMix = clamp(1.0 - (timeSinceClick / 0.2), 0.0, 1.0);
      vec3 mixedColor = mix(baseColor, vec3(1.0), flashMix);
      vec3 finalColor = mixedColor * flicker * fade;
      float alpha = smoothstep(6.0, 4.0, timeSinceClick);
      gl_FragColor = vec4(finalColor, alpha);
  }
`;

// --- BOILERPLATE SETUP ---

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x292f33);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5.0;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const clock = new THREE.Clock();
let lastClickTime = -999.0;
window.addEventListener("mousedown", () => {
  lastClickTime = clock.getElapsedTime();
});

// --- GPGPU SETUP ---

const size = 64;
const posData = new Float32Array(size * size * 4);
for (let i = 0; i < size * size; i++) {
  posData[i * 4 + 0] = Math.random() * 30.0 - 15.0;
  posData[i * 4 + 1] = Math.random() * 30.0 - 15.0;
  posData[i * 4 + 2] = Math.random() * 30.0 - 15.0;
  posData[i * 4 + 3] = 1.0;
}

const texPositions = new THREE.DataTexture(
  posData,
  size,
  size,
  THREE.RGBAFormat,
  THREE.FloatType
);
texPositions.needsUpdate = true;

const bufferPosition = new THREE.WebGLRenderTarget(size, size, {
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
});

const planeGeo = new THREE.PlaneGeometry(2, 2);
const updatePosScene = new THREE.Scene();
const updatePosMat = new THREE.RawShaderMaterial({
  vertexShader: updateVert,
  fragmentShader: updateFrag,
  uniforms: {
    uTexPositions: { value: texPositions },
    uTime: { value: 0.0 },
  },
});
const updatePosMesh = new THREE.Mesh(planeGeo, updatePosMat);
updatePosScene.add(updatePosMesh);

const uvs = [];
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    uvs.push(x / size, y / size);
  }
}
const pointsGeo = new THREE.BufferGeometry();
pointsGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
pointsGeo.setDrawRange(0, size * size);

const pointsMat = new THREE.RawShaderMaterial({
  vertexShader: renderVert,
  fragmentShader: renderFrag,
  uniforms: {
    uTexPositions: { value: bufferPosition.texture },
    uTime: { value: 0.0 },
    uLastClickTime: { value: -999.0 },
  },
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true,
});

const points = new THREE.Points(pointsGeo, pointsMat);
scene.add(points);

// --- ANIMATION LOOP ---

const tick = () => {
  const time = clock.getElapsedTime();
  const timeSinceClick = Math.max(0.0, time - lastClickTime);

  if (timeSinceClick < 0.2) {
    const flash = 1.0 - timeSinceClick / 0.2;
    scene.background.setRGB(flash, flash, flash);
  } else {
    scene.background.setHex(0x000000);
  }

  updatePosMat.uniforms.uTime.value = time;
  renderer.setRenderTarget(bufferPosition);
  renderer.render(updatePosScene, camera);

  renderer.setRenderTarget(null);
  pointsMat.uniforms.uTime.value = time;
  pointsMat.uniforms.uLastClickTime.value = lastClickTime;
  renderer.render(scene, camera);

  controls.update();
  requestAnimationFrame(tick);
};
tick();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
