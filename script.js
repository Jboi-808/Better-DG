const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brushButton = document.getElementById('brush');
const fillBucketButton = document.getElementById('fill-bucket');
const eraserButton = document.getElementById('eraser');
const clearButton = document.getElementById('clear');
const brushColorPicker = document.getElementById('brush-color');
const fillColorPicker = document.getElementById('fill-color');

let isDrawing = false;
let currentTool = 'brush';
let brushColor = brushColorPicker.value;
let fillColor = fillColorPicker.value;

// Set canvas size
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

// Set initial background color
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

brushButton.addEventListener('click', () => setTool('brush'));
fillBucketButton.addEventListener('click', () => setTool('fill-bucket'));
eraserButton.addEventListener('click', () => setTool('eraser'));
clearButton.addEventListener('click', clearCanvas);
brushColorPicker.addEventListener('input', (e) => {
  brushColor = e.target.value;
});
fillColorPicker.addEventListener('input', (e) => {
  fillColor = e.target.value;
});

function setTool(tool) {
  currentTool = tool;
  brushButton.classList.remove('active');
  fillBucketButton.classList.remove('active');
  eraserButton.classList.remove('active');
  if (tool === 'brush') brushButton.classList.add('active');
  if (tool === 'fill-bucket') fillBucketButton.classList.add('active');
  if (tool === 'eraser') eraserButton.classList.add('active');
}

function startDrawing(e) {
  isDrawing = true;
  if (currentTool === 'brush' || currentTool === 'eraser') {
    draw(e);
  } else if (currentTool === 'fill-bucket') {
    fillBucket(e);
  }
}

function draw(e) {
  if (!isDrawing) return;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}

function fillBucket(e) {
  const x = e.offsetX;
  const y = e.offsetY;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const targetColor = getPixelColor(imageData, x, y);
  const fillColorRgb = hexToRgb(fillColor);

  floodFill(imageData, x, y, targetColor, fillColorRgb);
  ctx.putImageData(imageData, 0, 0);
}

function clearCanvas() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Helper functions for flood fill
function getPixelColor(imageData, x, y) {
  const index = (y * imageData.width + x) * 4;
  return [
    imageData.data[index],
    imageData.data[index + 1],
    imageData.data[index + 2],
    imageData.data[index + 3],
  ];
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

function floodFill(imageData, x, y, targetColor, fillColor) {
  const stack = [[x, y]];
  const width = imageData.width;
  const height = imageData.height;

  while (stack.length) {
    const [cx, cy] = stack.pop();
    const index = (cy * width + cx) * 4;

    if (
      cx < 0 ||
      cx >= width ||
      cy < 0 ||
      cy >= height ||
      !colorsMatch(imageData.data.slice(index, index + 4), targetColor) ||
      colorsMatch(imageData.data.slice(index, index + 4), fillColor)
    ) {
      continue;
    }

    imageData.data.set(fillColor, index);
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}

function colorsMatch(color1, color2) {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  );
}