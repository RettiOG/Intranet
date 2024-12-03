const canvas = document.getElementById('cadCanvas');
const ctx = canvas.getContext('2d');

let mode = 'line';  // Aktueller Modus: 'line', 'rect', oder 'move'
let shapes = [];    // Liste der gezeichneten Formen
let isDrawing = false;
let startX, startY;
let selectedShape = null;

// Setzt den Modus für das Werkzeug
function setMode(newMode) {
  mode = newMode;
  selectedShape = null;  // Auswahl aufheben, wenn der Modus geändert wird
}

// Event-Listener für Mausinteraktionen
canvas.addEventListener('mousedown', (e) => {
  const { offsetX, offsetY } = e;
  startX = offsetX;
  startY = offsetY;

  if (mode === 'move') {
    // Form auswählen, wenn man sich im Move-Modus befindet
    selectedShape = shapes.find(shape => isPointInShape(offsetX, offsetY, shape));
  } else {
    isDrawing = true;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing && mode !== 'move') return;

  const { offsetX, offsetY } = e;
  
  if (isDrawing) {
    draw(); // Leinwand leeren und neu zeichnen

    // Vorschau des Zeichnens
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    if (mode === 'line') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(offsetX, offsetY);
    } else if (mode === 'rect') {
      ctx.rect(startX, startY, offsetX - startX, offsetY - startY);
    }
    ctx.stroke();
  } else if (mode === 'move' && selectedShape) {
    const dx = offsetX - startX;
    const dy = offsetY - startY;
    selectedShape.x += dx;
    selectedShape.y += dy;
    startX = offsetX;
    startY = offsetY;
    draw();
  }
});

canvas.addEventListener('mouseup', (e) => {
  const { offsetX, offsetY } = e;
  
  if (isDrawing) {
    // Endgültige Form hinzufügen
    if (mode === 'line') {
      shapes.push({ type: 'line', x1: startX, y1: startY, x2: offsetX, y2: offsetY });
    } else if (mode === 'rect') {
      shapes.push({ type: 'rect', x: startX, y: startY, width: offsetX - startX, height: offsetY - startY });
    }
  }

  isDrawing = false;
  selectedShape = null;
  draw();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  shapes.forEach(shape => {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    if (shape.type === 'line') {
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
    } else if (shape.type === 'rect') {
      ctx.rect(shape.x, shape.y, shape.width, shape.height);
    }
    ctx.stroke();
  });
}

function isPointInShape(x, y, shape) {
  if (shape.type === 'rect') {
    return x >= shape.x && x <= shape.x + shape.width &&
           y >= shape.y && y <= shape.y + shape.height;
  }
  return false;
}

function clearCanvas() {
  shapes = [];
  draw();
}
