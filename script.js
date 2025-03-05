const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brushButton = document.getElementById('brush');
const fillButton = document.getElementById('fill');
const eraserButton = document.getElementById('eraser');
const clearButton = document.getElementById('clear');

let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#000000';

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

brushButton.addEventListener('click', () => currentTool = 'brush');
fillButton.addEventListener('click', () => currentTool = 'fill');
eraserButton.addEventListener('click', () => currentTool = 'eraser');
clearButton.addEventListener('click', clearCanvas);

function startDrawing(e) {
    isDrawing = true;
    if (currentTool === 'brush' || currentTool === 'eraser') {
        draw(e);
    } else if (currentTool === 'fill') {
        fill(e);
    }
}

function draw(e) {
    if (!isDrawing) return;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    if (currentTool === 'brush') {
        ctx.strokeStyle = currentColor;
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
    }

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function fill(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, x, y);
    const fillColor = hexToRgb(currentColor);

    floodFill(imageData, targetColor, fillColor, x, y);
    ctx.putImageData(imageData, 0, 0);
}

function floodFill(imageData, targetColor, fillColor, x, y) {
    const stack = [[x, y]];
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    while (stack.length) {
        const [cx, cy] = stack.pop();
        const index = (cy * width + cx) * 4;

        if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
        if (!colorsMatch(data, index, targetColor)) continue;

        setPixel(data, index, fillColor);

        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
    }
}

function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3]
    ];
}

function colorsMatch(data, index, targetColor) {
    return (
        data[index] === targetColor[0] &&
        data[index + 1] === targetColor[1] &&
        data[index + 2] === targetColor[2] &&
        data[index + 3] === targetColor[3]
    );
}

function setPixel(data, index, color) {
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = color[3];
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255,
        255
    ];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}