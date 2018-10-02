document.addEventListener('DOMContentLoaded', ()=>{
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
  const pieceArray = ['T','O','I','L','J','S','Z'];

  // Arena
  const arena = {
    // Props
    pos: {x: 10, y: 2},
    matrix: createMatrix(10,20),
    // Methods
    draw: function() {
      drawMatrix(this.matrix, this.pos);
      this.drawOutline();
    },
    drawOutline: function() {
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "#FFF";
      ctx.strokeRect(this.pos.x,this.pos.y,this.matrix[0].length,this.matrix.length);
    },
  };

  // Player
  const player = {
    // Props
    matrix: [],
    nextPiece: [],
    heldPiece: randomPiece(),
    pos: {x: 0, y: 0},
    score: 0,
    highscore: 0,
    // Methods
    collisionCheck: function(pos) {
      const m = this.matrix, o = pos||this.pos;
      for(let y = 0; y < m.length; ++y) {
        for(let x = 0; x < m[y].length; ++x) {
          if(m[y][x] !== 0 && (arena.matrix[y + o.y] && arena.matrix[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    },
    draw: function() {
      drawMatrix(this.matrix, {x: this.pos.x + arena.pos.x, y: this.pos.y + arena.pos.y});
      // Ghost piece
      for(let y = 0; y < 20; y++) {
        if(this.collisionCheck({x:this.pos.x, y: y}) && y >= this.pos.y){
          drawMatrix(this.matrix, {x:this.pos.x + arena.pos.x, y: y + arena.pos.y - 1}, 'rgba(255,255,255,0.15)');
          return false;
        }
      }
    },
    drop: function() {
      this.pos.y++;
      if(this.collisionCheck()) {
        this.pos.y--;
        this.merge();
        lineCheck();
        this.reset();
      }
      dropCount = 0;
    },
    hardDrop: function() {
      let count = 0;
      while((!this.collisionCheck()) && count < 20) {
        this.pos.y++;
        count++;
      }
      this.pos.y--;
      this.score += Math.max(count-1,0) * 2;
      this.highscore = Math.max(this.highscore,this.score);
      this.drop();
    },
    merge: function() {
      this.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if(value !== 0) {
            arena.matrix[y + this.pos.y][x + this.pos.x] = value;
          }
        });
      });
    },
    reset: function() {
      this.matrix = this.nextPiece;
      this.nextPiece = randomPiece();
      this.pos.y = 0;
      this.pos.x = Math.floor(arena.matrix[0].length/2) - Math.floor(this.matrix[0].length/2);

      // Game Over check
      if(this.collisionCheck()) { reset(); }
    },
    rotate: function(dir) {
      for(let y = 0; y < this.matrix.length; ++y) {
        for(let x = 0; x < y; ++x) {
          [
            this.matrix[x][y],
            this.matrix[y][x],
          ] = [
            this.matrix[y][x],
            this.matrix[x][y],
          ];
        }
      }

      if(dir > 0) { this.matrix.forEach(row => row.reverse()); }
      else { matrix.reverse(); }

      // collision check in case we rotate into the wall/another piece
      const pos = this.pos.x;
      let offset = 1;
      while(this.collisionCheck()) {
        this.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > this.matrix[0].length) {
          this.rotate(-dir);
          this.pos.x = pos;
          return;
        }
      }
    },
    shift: function(dir) {
      this.pos.x += dir;
      if(this.collisionCheck()) { this.pos.x -= dir; }
    },
    switchPiece: function() {
      [this.heldPiece, this.matrix] = [this.matrix, this.heldPiece];

      // collision check in case we rotate into the wall/another piece
      const pos = this.pos.x;
      let offset = 1;
      while(this.collisionCheck()) {
        this.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > this.matrix[0].length) {
          player.switchPiece();
          this.pos.x = pos;
          return;
        }
      }
    },
  };

  // Player Piece drop timer
  let lastTime = 0;
  let dropCount = 0;
  const dropInterval = 1000;

  // - Input Handling -
  document.addEventListener('keydown', function(e){
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
  });

  // - Functions -
  function init() {
    reset();
    frameFunction();
  }
  function reset() {
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
    if(!paused) {
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

  function createMatrix(w,h) {
    const matrix = [];
    while(h--) { matrix.push(new Array(w).fill(0)); }
    return matrix;
  }

  function createPiece(type) {
    switch(type) {
      case 'O':
        return [
          [1,1],
          [1,1],
        ]; break;
      case 'T':
        return [
          [0,0,0],
          [2,2,2],
          [0,2,0],
        ]; break;
      case 'L':
        return [
          [0,3,0],
          [0,3,0],
          [0,3,3],
        ]; break;
      case 'J':
        return [
          [0,4,0],
          [0,4,0],
          [4,4,0],
        ]; break;
      case 'I':
        return [
          [0,5,0,0],
          [0,5,0,0],
          [0,5,0,0],
          [0,5,0,0],
        ]; break;
      case 'S':
        return [
          [0,6,6],
          [6,6,0],
          [0,0,0],
        ]; break;
      case 'Z':
        return [
          [7,7,0],
          [0,7,7],
          [0,0,0],
        ]; break;
    }
  }

  function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if(value !== 0) {
          if(color) {
            ctx.fillStyle = paused?'rgba(0,0,0,0)':color;
          } else {
            ctx.fillStyle = paused?'rgba(255,255,255,0.2)':(palette[value - 1]||'white');
          };
          ctx.strokeStyle = 'rgba(0,10,30,1)';
          ctx.fillRect(x + offset.x,y + offset.y,1,1);
          ctx.strokeRect(x + offset.x,y + offset.y,1,1);
        }
      });
    });
  }

  function draw() {
    player.draw();
    arena.draw();
    drawUI();
  }

  function drawUI() {
    ctx.fillStyle = '#FFF';
    ctx.font = '1px monospace';
    ctx.textAlign = 'left';
    // Title or something
    ctx.fillText('Tetris',3,3);
    ctx.fillText('by Kyle',3,4);
    // Instructions
    ctx.fillText('← / → = Move Horizontally',6,25);
    ctx.fillText('↑ = Rotate    // SHIFT = Switch',6,26);
    ctx.fillText('↓ = Soft Drop // SPACE = Hard Drop',6,27);
    ctx.fillText('P = Pause     // R = Reset',6,28);
    // Highscore
    ctx.fillText('Highscore',21,3);
    ctx.fillText(player.highscore,21,4);
    // Player Score
    ctx.fillText('Player Score',21,6);
    ctx.fillText(player.score,21,7);
    // Level
    ctx.fillText('Level',21,9);
    ctx.fillText(level,21,10);
    // Lines
    ctx.fillText('Lines Cleared',21,12);
    ctx.fillText(linesCleared,21,13);
    // Held Piece
    ctx.fillText('Held Piece',3,15);
    ctx.lineWidth = 0.1;
    ctx.strokeStyle="#FFF";
    ctx.strokeRect(3,16,6,6);
    drawMatrix(player.heldPiece,{x:4,y:17})
    // Next Piece
    ctx.fillStyle = '#FFF';
    ctx.fillText('Next Piece',21,15);
    ctx.lineWidth = 0.1;
    ctx.strokeStyle="#FFF";
    ctx.strokeRect(21,16,6,6);
    drawMatrix(player.nextPiece,{x:22,y:17})
    // Pause Text
    if(paused) {
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.fillText('Game Paused',5 + arena.pos.x,8 + arena.pos.y);
    }
  }

  function lineCheck() {
    let rowMultiplier = 1;
    for(let y = arena.matrix.length - 1; y > 0; y--) {
        if(arena.matrix[y].every(function(x) {return x > 0;})) {
        linesCleared++;
        let row = arena.matrix.splice(y,1)[0];
        arena.matrix.unshift(row.fill(0));
        player.score += rowMultiplier*50;
        player.highscore = Math.max(player.highscore,player.score);
        rowMultiplier *= 2;
        y++; // Because of the splicing offset
        // Level
        level = Math.floor(linesCleared/10);
      }
    }
  }

  function randomPiece() {
    return (createPiece( pieceArray[Math.floor(Math.random() * pieceArray.length)] ));
  }

  // - Game Time -
  init();
});
