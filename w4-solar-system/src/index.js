/* eslint-disable no-undef, no-unused-vars */

import * as THREE from "three";
import ml5 from "ml5";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
camera.position.z = -500;
camera.lookAt(0, 0, 0);
scene.add(camera);

// Add mouse controls for camera.
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// -- CODE -- //

// Planet Class

export class Planet {
  constructor(x, y, z) {
    this.instance = new THREE.Group();
    this.instance.position.set(x, y, z);

    // want to generate the rotation only once
    this.groupRotation = {
      x: Math.random() * 0.03,
      y: Math.random() * 0.02,
      z: Math.random() * 0.04,
    };

    // random colors
    const colorPlanet = new THREE.Color();
    const colorMoon = new THREE.Color();
    colorPlanet.setHSL(Math.random(), 0.7, 0.5);
    colorMoon.setHSL(Math.random(), 0.7, 0.5);

    // new planet
    this.earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(13, 10, 10),
      new THREE.MeshBasicMaterial({ color: colorPlanet })
    );
    this.instance.add(this.earthMesh);

    // new Moon
    this.moonMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 2),
      new THREE.MeshBasicMaterial({ color: colorMoon })
    );
    this.instance.add(this.moonMesh);

    this.moonMesh.position.set(15, 15, 15);
  }

  // methods

  rotate() {
    // Example: move the car forward
    this.instance.rotation.x += this.groupRotation.x;
    this.instance.rotation.y += this.groupRotation.y;
    this.instance.rotation.z += this.groupRotation.z;
  }

  rotateMoon() {
    // Example: move the car forward
    this.moonMesh.rotation.x += 0.02;
    this.moonMesh.rotation.y += 0.02;
    this.moonMesh.rotation.z += 0.02;
  }

  rotatePlanet() {
    // Example: move the car forward
    this.earthMesh.rotation.x += 0.01;
    this.earthMesh.rotation.y += 0.02;
    this.earthMesh.rotation.z += 0.02;
  }
}

// Sun
const Sun = new THREE.Group();
const SunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(40),
  new THREE.MeshBasicMaterial({ color: 0xfff222 })
);
Sun.add(SunMesh);

// Planets

// // Planet 1
// const Planet1 = new Planet(Math.floor(Math.random() * 80), 1, 1);
// Sun.add(Planet1.instance);

// // Planet 2
// const Planet2 = new Planet(Math.floor(Math.random() * 80), 2, 2);
// Sun.add(Planet2.instance);

const planets = [];
const totalPlanets = 120;

// Create as many as you want in a loop
for (let i = 0; i < totalPlanets; i++) {
  const p = new Planet(
    Math.floor(Math.random() * 1000),
    Math.floor(Math.random() * 360),
    Math.floor(Math.random() * 360)
  );
  Sun.add(p.instance);
  planets.push(p);
}

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);

const audio = new THREE.Audio(listener);
let analyser;

// Function to start the mic (Call this on a button click or first interaction)
function startMic() {
  console.log("Attempting to start Mic..."); // Checkpoint 1
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    console.log("Microphone Access Granted!"); // Checkpoint 2
    const audioContext = listener.context;
    const source = audioContext.createMediaStreamSource(stream);
    audio.setNodeSource(source);

    // Create the analyser (32 is the resolution, higher = more detail)
    analyser = new THREE.AudioAnalyser(audio, 32);
    console.log("Microphone connected!");
  });
}

// Faces

// ML5 Faces
// let faces = [];
// let planetList = [];

// const video = document.createElement("video");
// video.width = 640;
// video.height = 480;
// video.autoplay = true;
// video.style.display = "none"; // Hide camera

// navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
//   video.srcObject = stream;
// });

// // For the latest ml5 version
// const faceMesh = ml5.faceMesh(video, { flipped: true }, () => {
//   console.log("Model is ready!");

//   // Use detectStart here
//   faceMesh.detectStart(video, (results) => {
//     faces = results;
//   });
// });

// // Match faces with planets
// function syncPlanetsWithFaces() {
//   // Add Planets
//   while (planetList.length < faces.length) {
//     const newPlanet = new Planet(Math.floor(Math.random() * 80), 1, 1);
//     scene.add(newPlanet.instance);
//     planetList.push(newPlanet);
//   }

//   // Remove Planets
//   while (planetList.length > faces.length) {
//     const p = planetList.pop();
//     scene.remove(p.instance);
//   }

//   // Always run the rotation for each planet
//   planetList.forEach((p) => {
//     p.rotate();
//     p.rotateMoon();
//     p.rotatePlanet();
//   });
// }

scene.add(Sun);

let easedVolumeSpeed = 0;
const NOISE_THRESHOLD = 30;

// Animation loop.
const tick = () => {
  // syncPlanetsWithFaces();

  let targetSpeed = 0.01; // Base "idle" speed

  if (analyser) {
    // getAverageFrequency returns a number from 0 to 255
    const volume = analyser.getAverageFrequency();

    // Normalize it (0 to 1) and use it as a multiplier
    targetSpeed = volume / 255;
    // console.log(volumeSpeed);
  }
  easedVolumeSpeed += (targetSpeed - easedVolumeSpeed) * 0.1;

  // Apply the volume to the rotation
  Sun.rotation.y += easedVolumeSpeed;
  Sun.rotation.z += 0.02;

  // Sun.rotation.y += 0.02;
  // Sun.rotation.z += 0.02;

  // Planet1.rotatePlanet();
  // Planet1.rotateMoon();
  // Planet1.rotate();

  // Planet2.rotatePlanet();
  // Planet2.rotateMoon();
  // Planet2.rotate();

  planets.forEach((p) => {
    p.rotate();
    p.rotateMoon();
    p.rotatePlanet();
  });

  controls.update();

  renderer.render(scene, camera);

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

window.addEventListener("click", () => {
  if (!analyser) {
    startMic();
    console.log("User clicked! Starting microphone...");
  }
});
