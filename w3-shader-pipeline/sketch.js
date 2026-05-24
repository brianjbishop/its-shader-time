/* eslint-disable no-undef, no-unused-vars */

let mapShader;
let bImage;
let elapsedTime;
let images = [];

function preload() {
  mapShader = loadShader("map.vert", "map.frag");
  bImage = loadImage("b5.jpg");
  // for (let i = 0; i < 9; i++) {
  //   // Create the file path string
  //   let filename = `b${i}.png`;
  //   // Load the image and push it into the array
  //   images.push(loadImage(filename));
  // }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  elapsedTime = 0;
}

function draw() {
  background("#292f33");

  noStroke();

  elapsedTime += deltaTime;

  const paddingX = width * 0.1;
  const paddingY = height * 0.1;

  const left = paddingX;
  const top = paddingY;
  const right = width - paddingX;
  const bottom = height - paddingY;

  mapShader.setUniform("uResolution", [width, height]);
  mapShader.setUniform("uTexMap", bImage);
  mapShader.setUniform("uTime", elapsedTime);

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

// mousePressed();
