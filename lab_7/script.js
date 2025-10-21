const display = document.getElementById('display');
const buttonsContainer = document.getElementById('buttons');
const submenu = document.getElementById('submenu');

let currentMode = 'basic';

// Toggle three-dot menu
function toggleMenu() {
  submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
}

// Set calculator mode
function setMode(mode) {
  currentMode = mode;
  submenu.style.display = 'none';
  display.value = '';
  generateButtons(mode);
}

// Generate calculator buttons dynamically
function generateButtons(mode) {
  buttonsContainer.innerHTML = ''; // Clear old buttons

  if (mode === 'basic') {
    const basicButtons = [
      '7', '8', '9', '/',
      '4', '5', '6', '*',
      '1', '2', '3', '-',
      '0', '.', '=', '+',
      'C'
    ];
    basicButtons.forEach(text => createButton(text));
  }

  else if (mode === 'scientific') {
    const sciButtons = [
      'sin', 'cos', 'tan', '√',
      'x²', '^', 'π', 'C',
      '7', '8', '9', '/',
      '4', '5', '6', '*',
      '1', '2', '3', '-',
      '0', '.', '=', '+'
    ];
    sciButtons.forEach(text => createButton(text));
  }

  else if (mode === 'unit') {
    buttonsContainer.innerHTML = `
      <button onclick="convertLength()">Length (m → cm)</button>
      <button onclick="convertWeight()">Weight (kg → g)</button>
      <button onclick="convertTemp()">Temperature (°C → °F)</button>
    `;
  }

  else if (mode === 'currency') {
    buttonsContainer.innerHTML = `
      <button onclick="convertCurrency(1, 280)">USD → PKR</button>
      <button onclick="convertCurrency(1, 0.9)">USD → EUR</button>
      <button onclick="convertCurrency(1, 83)">USD → INR</button>
    `;
  }
}

// Create individual button element
function createButton(text) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.addEventListener('click', () => handleInput(text));
  buttonsContainer.appendChild(btn);
}

// Handle calculator input and logic
function handleInput(value) {
  if (value === 'C') display.value = '';
  else if (value === '=') {
    try {
      display.value = eval(display.value);
    } catch {
      display.value = 'Error';
    }
  } 
  else if (value === 'π') display.value += Math.PI.toFixed(6);
  else if (value === '√') display.value = Math.sqrt(parseFloat(display.value) || 0);
  else if (value === 'x²') display.value = Math.pow(parseFloat(display.value) || 0, 2);
  else if (value === 'sin') display.value = Math.sin(toRadians(display.value)).toFixed(4);
  else if (value === 'cos') display.value = Math.cos(toRadians(display.value)).toFixed(4);
  else if (value === 'tan') display.value = Math.tan(toRadians(display.value)).toFixed(4);
  else display.value += value;
}

function toRadians(deg) {
  return deg * (Math.PI / 180);
}

// Unit Conversion Functions
function convertLength() {
  let val = parseFloat(prompt('Enter meters:'));
  if (!isNaN(val)) alert(`${val} m = ${val * 100} cm`);
}

function convertWeight() {
  let val = parseFloat(prompt('Enter kilograms:'));
  if (!isNaN(val)) alert(`${val} kg = ${val * 1000} g`);
}

function convertTemp() {
  let val = parseFloat(prompt('Enter Celsius:'));
  if (!isNaN(val)) alert(`${val}°C = ${(val * 9/5) + 32}°F`);
}

// Currency Conversion
function convertCurrency(usd, rate) {
  let val = parseFloat(prompt('Enter amount in USD:'));
  if (!isNaN(val)) alert(`${val} USD = ${(val * rate).toFixed(2)} converted`);
}

// Initialize with Basic Mode
generateButtons('basic');
