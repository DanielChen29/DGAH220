let center;
let particles = [];
let cols, rows, size = 20;

let video;
let faceMesh;
let faces = [];
let mouthX, mouthY, mouthW;

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  faceMesh.detectStart(video, gotFaces);
  
  center = createVector(width / 2, height / 2);
  cols = width / size;
  rows = height / size;
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
  
  if (faces.length > 0) {
    let face = faces[0];
    let keypoints = face.keypoints;
    let mouthTop = keypoints[13];
    let mouthBottom = keypoints[14];
    let mouthLeft = keypoints[61];
    let mouthRight = keypoints[291];
    
    mouthX = (mouthTop.x + mouthBottom.x) / 2;
    mouthY = (mouthTop.y + mouthBottom.y) / 2;
    mouthW = mouthRight.x - mouthLeft.x;
    let mouthH = mouthBottom.y - mouthTop.y;
    let smiling = mouthH > 8;
    let frowning = mouthH < 1;
    
    particles.push(new Particle(mouthX, mouthY, smiling, frowning));
  }
  
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y, smiling, frowning) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.growth = random(1, 3);
    this.alpha = 255;
    this.smiling = smiling;
    this.frowning = frowning;
  }
  
  update() {
    this.size += this.growth;
    this.alpha -= 4;
  }
  
  finished() {
    return this.alpha < 0;
  }
  
  show() {
    noStroke();
    if (this.smiling) {
      fill(0, 255, 0, this.alpha);
      ellipse(this.x, this.y, this.size);
    } else if (this.frowning) {
      fill(255, 0, 0, this.alpha);
      rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    } else {
      fill(255, 255, 0, this.alpha);
      triangle(this.x, this.y - this.size / 2, this.x - this.size / 2, this.y + this.size / 2, this.x + this.size / 2, this.y + this.size / 2);
    }
  }
}
