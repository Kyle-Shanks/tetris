// Player Piece drop timer
let lastTime = 0;
let dropCount = 0;
const dropInterval = 1000;

// Player
const player = {
  // Props
  matrix: [],
  nextPiece: [],
  heldPiece: randomPiece(),
  pos: {x: 0, y: 0},
  score: 0,
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
    // if(this.collisionCheck()) { reset(); }
    if(this.collisionCheck()) {
      gameOver = true;
      openModal();
    }
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
