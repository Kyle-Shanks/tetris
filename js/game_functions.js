function createMatrix(w,h) {
  const matrix = [];
  while(h--) { matrix.push(new Array(w).fill(0)); }
  return matrix;
}

const pieceArray = ['T','O','I','L','J','S','Z'];
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

function randomPiece() {
  return (createPiece( pieceArray[Math.floor(Math.random() * pieceArray.length)] ));
}

function lineCheck() {
  let rowMultiplier = 1;
  for(let y = arena.matrix.length - 1; y > 0; y--) {
      if(arena.matrix[y].every(function(x) {return x > 0;})) {
      linesCleared++;
      let row = arena.matrix.splice(y,1)[0];
      arena.matrix.unshift(row.fill(0));
      player.score += rowMultiplier*50;
      rowMultiplier *= 2;
      y++; // Because of the splicing offset
      // Level
      level = Math.floor(linesCleared/10);
    }
  }
}
