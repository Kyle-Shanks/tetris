// Highscores
let getScores = firebase.database().ref('scores/')
  .orderByChild('score').limitToLast(3);

function scoreCompare(a,b) {
  if (a.score < b.score)
    return 1;
  if (a.score > b.score)
    return -1;
  return 0;
}

let highscores = [];
getScores.on('child_added', snapshot => {
  highscores.push(snapshot.val());
  highscores = highscores.sort(scoreCompare);
  highscores.length = Math.min(highscores.length,3);
});

// GameOver Modal
const modal = document.getElementsByClassName('modal')[0];
const input = document.getElementsByClassName('input')[0];
function submitScore(e) {
  e.preventDefault();
  console.log(input.value, player.score);
  firebase.database().ref('scores/').push({
  	name: input.value || '???', score: player.score
  });
  closeModal();
  reset();
}
function openModal() {
  modalOpen = true;
  modal.className = modal.className.split('hidden').join('');
}
function closeModal() {
  modalOpen = false;
  modal.className += ' hidden';
}

// - Canvas Context -
const cnv = document.getElementById('cnv'),
      ctx = cnv.getContext('2d');
ctx.scale(20, 20);

// Color palette for the blocks
const palettes = {
  standard: ['#ffeb3b','#9c27b0','#ff9800','#3f51b5','#03a9f4','#4caf50','#f44336'],
  experiment: ['#607d8b','#8bc34a','#009688','#e91e63','#ffc107','#00bcd4','#673ab7'],
}
const palette = palettes.standard;

// Game information
let level = 0;
let linesCleared = 0;
let paused = false;
let gameOver = false;
let modalOpen = false;

// - Input Handling -
document.addEventListener('keydown', function(e){
  if (!modalOpen) {
    switch(e.keyCode) {
      case 80: paused = !paused; break; // P - Pause
      case 82: reset(); break;          // R - Reset
    }
    if(!paused) {
      e.preventDefault();
      switch(e.keyCode) {
        case 37: player.shift(-1); break;     // Left
        case 38: player.rotate(1); break;     // Up
        case 39: player.shift(1); break;      // Right
        case 40: player.drop(); break;        // Down
        case 32: player.hardDrop(); break;    // Space
        case 16: player.switchPiece(); break; // Shift
      }
    }
  }
});

// - Functions -
function init() {
  reset();
  frameFunction();
}
function reset() {
  gameOver = false;
  player.nextPiece = randomPiece();
  arena.matrix.forEach(row => row.fill(0));
  player.reset();
  player.score = 0;
  player.heldPiece = randomPiece();
  dropCount = 0;
  linesCleared = 0;
  level = 0;
}

function frameFunction(time = 0) {
  // Cover previous frame
  coverFrame();

  // Timer for player piece drop
  if(!paused && !gameOver) {
    let deltaTime = time - lastTime;
    lastTime = time;
    dropCount += deltaTime;
    if(dropCount > Math.max((dropInterval - (level*60)),60)) { player.drop(); }
  }

  // Draw stuff
  draw();

  // Next Frame
  requestAnimationFrame(frameFunction);
}

function coverFrame() {
  ctx.fillStyle = 'rgba(0,10,30,1)';
  ctx.fillRect(0,0,cnv.width, cnv.height);
}

// - Game Time -
init();
