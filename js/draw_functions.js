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
  // ctx.fillText('by Kyle',3,4);
  // Leaderboard
  ctx.fillText('- Top 3 -',3,5);
  ctx.fillText('- Scores -',3,6);
  for (let i = 0; i < highscores.length; i++) {
    ctx.fillText(highscores[i].name,3,7+(i*2));
    ctx.fillText(" "+highscores[i].score,3,8+(i*2));
  }
  // Instructions
  ctx.fillText('← / → = Move Horizontally',6,25);
  ctx.fillText('↑ = Rotate    // SHIFT = Switch',6,26);
  ctx.fillText('↓ = Soft Drop // SPACE = Hard Drop',6,27);
  ctx.fillText('P = Pause     // R = Reset',6,28);
  // Player Score
  ctx.fillText('Player Score',21,3);
  ctx.fillText(player.score,21,4);
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
