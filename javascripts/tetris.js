var Board = function(options) {

  // initialize logic
  var options = options || {}
  var self = this

  this.columns = options.columns || 30
  this.rows = options.rows || 15
  this.refreshRate = options.refreshRate || 100

  this.currentPosition = {
    row: 0,
    // start mid-board
    col: this.columns/2
  }

  // set to random starting shape
  self.currentShape = Shape.prototype.getShapeNames().sample()
  self.currentRotationIndex = 0


  this.matrix = []

  for (var row = 0; row <= this.rows; row += 1) {
    this.matrix.push([])
    for (var col = 0; col < this.columns; col += 1) {
      this.matrix[row].push([0])
    }
  }

  this.el = document.createElement('div')

  document.getElementById('main-container').appendChild(this.el)

  // sets refresh logic
  this.refresh = setInterval(function(){
    self.render()
  }, this.refreshRate)

  this.startGame()


  // bind Events

  this.bindEvents()

}

Board.prototype.toString = function(){
  var rows = ""
  this.matrix.forEach(function(row, idx){
    // console.log("row:", idx)
    rows += row.toString()+"</br>"
  })
  return rows
}

Board.prototype.startGame = function(){
  var self = this
  self.game = setInterval(
    (function(i){
      // initialize i
      var i = 0

      // set start position
      self.changeCurrentPostion()

      return function() {
        // reset last row
        
        self.changeCurrentPostion({
          row: self.currentPosition.row+1,
          col: self.currentPosition.col
        })

        if (i < self.rows-1) {
          i += 1
        } else {
          // self.reset()
          self.changeCurrentPostion({row: 0, col: self.currentPosition.col})
          self.currentShape = Shape.prototype.getShapeNames().sample()
          self.setShape(self.currentShape)
          // self.stopGame()
          i = 0
        }
        
      }

    })(),this.refreshRate
  )

  return self.game
}

Board.prototype.render = function(){
  // plain 0s and 1s
  // this.el.innerHTML = this.toString()

  var self = this
  this.el.innerHTML = ""

  this.matrix.forEach(function(value, idx){
    
    var row = document.createElement('div')
    row.classList.add('row')

    self.matrix[idx].forEach(function(value, idx){

      var cell = document.createElement('span')
      cell.className = 'cell'
      if (value > 0) {
        cell.classList.add("filled")
      }

      cell.innerHTML = "&nbsp;"

      row.appendChild(cell)

    })

    self.el.appendChild(row)

  })
}

Board.prototype.stopRefresh = function(){
  clearInterval(this.refresh)
}

Board.prototype.stopGame = function(){
  clearInterval(this.game)
}

Board.prototype.reset = function(){
  // console.log(this.matrix)
  // debugger
  var self = this
  self.matrix.forEach(function(value, row){
    self.matrix[row].forEach(function(value, col){
      if (self.matrix[row][col] !== 3 ) {
        self.matrix[row][col] = 0
      }
    })
  })
}

Board.prototype.move = function(ev){
  
  var direction = ev.keyIdentifier
  switch ( direction ) {
    case "Up":
      ev.preventDefault()
      this.changeCurrentPostion({ row: this.currentPosition.row-1, col: this.currentPosition.col })
      break
    case "Down":
      ev.preventDefault()
      this.changeCurrentPostion({ row: this.currentPosition.row+1, col: this.currentPosition.col })
      break
    case "Left":
      ev.preventDefault()
      this.changeCurrentPostion({ row: this.currentPosition.row, col: this.currentPosition.col-1 })
      break
    case "Right":
      ev.preventDefault()
      this.changeCurrentPostion({ row: this.currentPosition.row, col: this.currentPosition.col+1 })
      break
    case "Meta":
      ev.preventDefault()
      // console.log("rotate right!")
      this.currentRotationIndex += 1
      this.setShape(this.currentShape, this.currentRotationIndex)
      break
    case "Alt":
      ev.preventDefault()
      // TODO: fix this, doesn't seem to work
      // console.log("rotate left!")
      this.currentRotationIndex -= 1
      // quick fix
      if (this.currentRotationIndex < 0 ) this.currentRotationIndex = Math.abs(this.currentRotationIndex) 
      this.setShape(this.currentShape, this.currentRotationIndex)
      break
    default:
      // console.log("no movement", ev)
  }
  // this.setCurrentPostion()
  return false

}

Board.prototype.changeCurrentPostion = function(newPosition){
  var self = this
  this.reset()

  var validPosition = function(newPosition){
    return newPosition.row < self.rows && newPosition.row >= 0 && newPosition.col < self.columns && newPosition.col >= 0
  }
  if (newPosition !== undefined && validPosition(newPosition)) {
    this.matrix[this.currentPosition.row][this.currentPosition.col] = 0
    this.currentPosition = newPosition
    this.matrix[newPosition.row][newPosition.col] = 1
  } else {
    this.matrix[this.currentPosition.row][this.currentPosition.col] = 1
  }


  self.setShape()

}

var Shape = function(){

}

Shape.prototype.shapes = {

    // position modifiers (relative to current post)

    // shape[name][roation][pieceIndex]
    // square: [
    //   // first rotation
    //   [
    //     {x: 0, y: 0},
    //     {x: 0, y: 1},
    //     {x: 1, y: 0},
    //     {x: 1, y: 1}
    //   ]
    //   // second roation
    // ],
    line: [
      // first rotation
      [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0}
      ],
      // second rotation
      [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 0, y: 3}
      ]
    ]
}

Shape.prototype.getShapeNames = function(){

  var names = []
  for (key in Shape.prototype.shapes) {
    names.push(key)
  }
  return names
}

Board.prototype.setShape = function(name, rotationIndex){
  var self = this
  
  var shapeName = name || self.currentShape
  var rotationIndex = rotationIndex || self.currentRotationIndex || 0

  if ( Shape.prototype.shapes[shapeName][rotationIndex] ) {
    var rotation = Shape.prototype.shapes[shapeName][rotationIndex]
  } else {
    // reset current rotation
    self.currentRotationIndex = 0
    var rotation = Shape.prototype.shapes[shapeName][self.currentRotationIndex]
  }

  rotation.forEach(function(piece){

    // console.log(piece)
    var newPieceRow = self.currentPosition.row+piece.x
    var newPieceCol = self.currentPosition.col+piece.y
    if ( self.matrix[newPieceRow] ) {
      self.matrix[newPieceRow][newPieceCol] = 1
    } else {
      // handle case of piece not fitting the dimensions of the space here

      // console.log("invalid piece!")
    }
    

  })
}

Board.prototype.stampShape = function(){

  // TODO: Make this work

  var self = this

  Shape.prototype.shapes[self.currentShape][self.currentRotationIndex].forEach(function(shape){
    debugger
    self.matrix[self.currentPosition.row+shape.x][self.currentPosition.col+shape.y] = 3
    console.log("stamped!")

  })

}

Board.prototype.bindEvents = function(){

  var self = this;

  // set keybindings
  document.onkeyup = this.move.bind(self)

}

// HELPERS

Array.prototype.sample = function() {
  // returns a random element from the array
  return this[Math.floor(Math.random()*this.length)]
}