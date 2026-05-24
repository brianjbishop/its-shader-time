let bodySegmentation; // to store model
let video; // to store video
let segmentation; // to store segmentation

let x_step;
let y_step;

let options = {
  maskType: "parts", // the type of body segmentation
  flipped: true, // changes orientation of output
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("BodyPix", options); // assigns model by options using body pix engine
}

function setup() {
  createCanvas(640, 480);
  // Create the video, then hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodySegmentation.detectStart(video, gotResults); // detecting parts, callback runs with video as input
}

function draw() {
  background(255);
  image(video, 0, 0);

  if (segmentation) {
    image(segmentation.mask, 0, 0, width, height);
    let img = segmentation.mask;
    img.loadPixels();

    y_step = 20;
    x_step = 30;

    beginShape(TRIANGLE_STRIP);

    for (let y = 0; y < img.height; y += y_step) {
      // cols
      for (let x = 0; x < img.width; x += x_step) {
        // rows

        let i = (x + y * img.width) * 4; // find pixel index
        if (
          img.pixels[i] == 255 && // red
          img.pixels[i + 1] == 255 && // green
          img.pixels[i + 2] == 255 // blue
        ) {
          fill(random(255), random(255), random(255));
          vertex(x, y);
        }
      }
    }
  }
  endShape();
}

// callback function for body segmentation
function gotResults(result) {
  segmentation = result; //the segmentation is returned depending on the
}
