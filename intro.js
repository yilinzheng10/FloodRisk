let lines = [];
let numRows, numCols;
let spacingX, spacingY;
let waveFactor = 0.05; // Controls wave strength
let decay = 0.98; // Dampens motion over time

function setup() {
  createCanvas(windowWidth, windowHeight);
  adjustGrid();
  initLines();
}

function draw() {
  background(0); // Black background

  stroke(51); // Dark gray lines, visible but subtle
  strokeWeight(2);

  for (let line of lines) {
    line.update(mouseX, mouseY);
    line.display();
  }
}

// Adjust grid dynamically based on window size
function adjustGrid() {
  numCols = floor(width / 30);  // Adjust columns based on width
  numRows = floor(height / 30); // Adjust rows based on height
  spacingX = width / numCols;
  spacingY = height / numRows;
}

// Initialize lines in a flexible grid
function initLines() {
  lines = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      let x = j * spacingX;
      let y = i * spacingY;
      lines.push(new WaveLine(x, y, spacingX * 0.8));
    }
  }
}

// Line object with smooth wave motion
class WaveLine {
  constructor(x, y, length) {
    this.originX = x;
    this.originY = y;
    this.x1 = x - length / 2;
    this.y1 = y;
    this.x2 = x + length / 2;
    this.y2 = y;
    this.length = length;
    this.angleOffset = random(TWO_PI);
    this.waveIntensity = 0;
  }

  update(mx, my) {
    let d = dist(mx, my, this.originX, this.originY);

    // Wave effect when mouse is nearby
    if (d < 150) {
      this.waveIntensity = sin(frameCount * 0.1 + this.angleOffset) * d * waveFactor;
    }

    // Gradual decay for smooth transitions
    this.waveIntensity *= decay;

    // Create sinusoidal wave movement
    let angle = sin(frameCount * 0.05 + this.angleOffset) * this.waveIntensity;
    let targetX1 = this.originX - this.length / 2 + cos(angle) * this.length * 0.3;
    let targetY1 = this.originY + sin(angle) * 10;
    let targetX2 = this.originX + this.length / 2 - cos(angle) * this.length * 0.3;
    let targetY2 = this.originY - sin(angle) * 10;

    this.x1 = lerp(this.x1, targetX1, 0.1);
    this.y1 = lerp(this.y1, targetY1, 0.1);
    this.x2 = lerp(this.x2, targetX2, 0.1);
    this.y2 = lerp(this.y2, targetY2, 0.1);
  }

  display() {
    line(this.x1, this.y1, this.x2, this.y2);
  }
}

// Resize canvas and reinitialize grid dynamically
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  adjustGrid();
  initLines();
}

// Runs once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const introOption = document.getElementById('intro-option');
    const dataOption = document.getElementById('data-option');
  
    // Click behavior for "Start the tool"
    introOption.addEventListener('click', () => {
      window.location.href = 'tool.html';
    });
  
    // Click behavior for "Visualize Data"
    dataOption.addEventListener('click', () => {
      window.location.href = 'systems_diagram1.html';
    });
  });