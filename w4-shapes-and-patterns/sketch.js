/* eslint-disable no-undef, no-unused-vars */

let mapShader;
let elapsedTime;
let mousePos;
let mic;

function preload() {
  mapShader = loadShader("map.vert", "map.frag");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Audio
  mic = new p5.AudioIn();
  mic.start();

  elapsedTime = 0;
}

function draw() {
  background("#292f33");

  noStroke();

  let vol = mic.getLevel();

  elapsedTime += deltaTime;
  mousePos = [mouseX / width, 1.0 - mouseY / height];

  const w = width * 0.4;
  const h = height * 0.4;

  const left = -w;
  const right = w;
  const top = -h;
  const bottom = h;

  mapShader.setUniform("uResolution", [width, height]);
  // mapShader.setUniform("uTime", elapsedTime);
  mapShader.setUniform("uMouse", mousePos);
  mapShader.setUniform("uAudio", vol);
  mapShader.setUniform("uPixelDensity", pixelDensity);

  shader(mapShader);

  beginShape(TRIANGLE_STRIP);

  vertex(left, top, 0, 0, 0);
  vertex(right, top, 0, 1, 0);
  vertex(left, bottom, 0, 0, 1);
  vertex(right, bottom, 0, 1, 1);

  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Check for sound
  if (typeof userStartAudio === "function") {
    userStartAudio();
    console.log("Mic activated!");
  }
}
