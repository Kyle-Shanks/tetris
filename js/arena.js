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
