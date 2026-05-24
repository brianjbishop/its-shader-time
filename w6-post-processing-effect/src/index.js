/* eslint-disable no-undef, no-unused-vars, import/first */

import "./styles.css";

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { KaleidoShader } from "three/examples/jsm/shaders/KaleidoShader";
import GUI from "lil-gui";

// Create debug GUI.
const gui = new GUI();

// Create renderer.
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create scene.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x292f33);

// Create camera.
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
camera.position.z = 5;
scene.add(camera);

// Add mouse controls for camera.
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Load textures.
const textureLoader = new THREE.TextureLoader();
const earthTex = textureLoader.load("/textures/terrain.jpg");
const myImage = textureLoader.load("./textures/b5.jpg");

// Create groups and objects.
const group = new THREE.Group();
scene.add(group);

// const ringGeo = new THREE.TorusGeometry(1.0, 0.05, 16, 64);
// const ringMat = new THREE.MeshNormalMaterial();
// const ringMesh = new THREE.Mesh(ringGeo, ringMat);
// group.add(ringMesh);

import vertShader from "./shaders/flower.vert";
import fragShader from "./shaders/flower.frag";

const planeGeo = new THREE.PlaneGeometry(2, 2, 100, 100);
const planeMat = new THREE.RawShaderMaterial({
  vertexShader: vertShader,
  fragmentShader: fragShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTerrainMap: { value: myImage },
    uTime: { value: 0.0 },
    uNoiseScale: { value: 1.0 },
    uOffsetScale: { value: 0.8 },
  },
});
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
const planeScale = {
  planeSize: 1.0,
  color: "#ff0000",
};
group.add(planeMesh);

// Add GUIs
gui
  .add(planeMat.uniforms.uNoiseScale, "value")
  .min(0)
  .max(3)
  .step(0.01)
  .name("noise scale");

gui
  .add(planeMat.uniforms.uOffsetScale, "value")
  .min(0)
  .max(2)
  .step(0.01)
  .name("offset scale");

gui
  .add(planeMesh.rotation, "x")
  .min(0)
  .max(Math.PI * 2)
  .step(0.01)
  .name("rotation");

gui
  .add(planeScale, "planeSize")
  .min(0.1)
  .max(3)
  .step(0.01)
  .name("Plane Scale")
  .onChange((value) => {
    planeMesh.scale.x = value;
    planeMesh.scale.y = value;
  });
// Create effect composer.
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(window.innerWidth, window.innerHeight);

// Add render passes.
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const dotScreenPass = new DotScreenPass();
effectComposer.addPass(dotScreenPass);

const kaleidoPass = new ShaderPass(KaleidoShader);
// effectComposer.addPass(kaleidoPass);

import warpVertShader from "./shaders/warp.vert";
import warpFragShader from "./shaders/warp.frag";

const warpShader = {
  vertexShader: warpVertShader,
  fragmentShader: warpFragShader,
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
  },
};
const warpPass = new ShaderPass(warpShader);
effectComposer.addPass(warpPass);

gui.add(warpPass, "enabled").name("warp");

// Animation loop.
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  planeMat.uniforms.uTime.value = elapsedTime;

  // sphereMesh.position.z = Math.sin(elapsedTime * 0.5) * 3.0;
  // sphereMesh.rotation.x += 0.03;

  group.rotation.x += 0.01;
  group.rotation.y += 0.02;

  controls.update();

  renderer.render(scene, camera);
  warpPass.uniforms.uTime.value = elapsedTime;

  effectComposer.render();

  requestAnimationFrame(tick);
};
tick();

// Window resize listener.
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
