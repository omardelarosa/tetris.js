var Board = function(options) {

  // initialize logic
  var options = options || {}
  var self = this

  this.width = options.width || Math.floor(window.innerWidth/22.25)
  this.height = options.height || Math.floor(window.innerHeight/19.5)
  this.refreshRate = options.refreshRate || 100
  this.id = options.id || "main-container"

  this.currentPosition = {
    y: 0,
    // start mid-board
    x: Math.floor(this.width/2)
  }

  // set to random starting shape
  self.currentShape = new Shape()
  self.currentRotationIndex = 0


  this.matrix = []

  for (var row = 0; row < this.height; row += 1) {
    this.matrix.push([])
    for (var col = 0; col < this.width; col += 1) {
      this.matrix[row].push([0])
    }
  }

  this.el = document.getElementById(this.id)
  // this.el.id = 'grid'

  // document.getElementById('main-container').appendChild(this.el)

  // sets refresh logic
  this.refresh = setInterval(function(){
    self.render()
  }, this.refreshRate)

  this.startGame()


  // bind Events

  this.bindEvents()

}

Board.prototype.toString = function(){
  var height = ""
  this.matrix.forEach(function(row, idx){
    // console.log("row:", idx)
    height += row.toString()+"</br>"
  })
  return height
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
          y: self.currentPosition.y+1,
          x: self.currentPosition.x
        })

        if (i < self.height-1) {
          i += 1
        } else {
          // self.reset()
          self.changeCurrentPostion({y: 0, x: self.currentPosition.x})
          self.currentShape = new Shape()
          self.renderShape(self.currentShape.name)
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
  self.matrix.forEach(function(value, y){
    self.matrix[y].forEach(function(value, x){
      if (self.matrix[y][x] !== 3 ) {
        self.matrix[y][x] = 0
      }
    })
  })
}

Board.prototype.move = function(ev){
  
  var direction = ev.keyIdentifier
  switch ( direction ) {
    case "Up":
      ev.preventDefault()
      var newPosition = { y: this.currentPosition.y-1, x: this.currentPosition.x }
      break
    case "Down":
      ev.preventDefault()
      var newPosition = { y: this.currentPosition.y+1, x: this.currentPosition.x }
      break
    case "Left":
      ev.preventDefault()
      var newPosition = { y: this.currentPosition.y, x: this.currentPosition.x-1 }
      break
    case "Right":
      ev.preventDefault()
      var newPosition = { y: this.currentPosition.y, x: this.currentPosition.x+1 }
      break
    case "Meta":
      ev.preventDefault()
      // console.log("rotate right!")
      this.currentRotationIndex += 1
      this.renderShape(this.currentShape.name, this.currentRotationIndex)
      break
    case "Alt":
      ev.preventDefault()
      // TODO: fix this, doesn't seem to work
      // console.log("rotate left!")
      this.currentRotationIndex -= 1
      // quick fix
      if (this.currentRotationIndex < 0 ) this.currentRotationIndex = Math.abs(this.currentRotationIndex) 
      this.renderShape(this.currentShape.name, this.currentRotationIndex)
      break
    default:
      // console.log("no movement", ev)
  }

  // TODO: figure out way preview future positions without doing this
  if (newPosition && this.isValidPosition({}, this.currentShape.previewMove(this, newPosition) )) {
    this.changeCurrentPostion(newPosition)
  }
  // this.setCurrentPostion()
  return false

}

Board.prototype.changeCurrentPostion = function(newPosition){
  var self = this
  this.reset()

  if (newPosition !== undefined && self.isValidPosition(newPosition) ) {
    this.matrix[this.currentPosition.y][this.currentPosition.x] = 0
    this.currentPosition = newPosition
    this.matrix[newPosition.y][newPosition.x] = 1
  } else {
    this.matrix[this.currentPosition.y][this.currentPosition.x] = 1
  }


  self.renderShape()

}


Board.prototype.renderShape = function(name, rotationIndex){
  var self = this
  
  var shapeName = name || self.currentShape.name
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
    var newPieceY = self.currentPosition.y+piece.y
    var newPieceX = self.currentPosition.x+piece.x
    if ( self.matrix[newPieceY] && self.isValidPosition({y: newPieceY, x: newPieceX})) {
      self.matrix[newPieceY][newPieceX] = 1
    } else {
      // handle case of piece not fitting the dimensions of the space here

      // console.log("invalid piece!")
    }
    

  })
}

Board.prototype.stampShape = function(){

  // TODO: Make this work

  var self = this

  Shape.prototype.shapes[self.currentShape.name][self.currentRotationIndex].forEach(function(shape){
    debugger
    self.matrix[self.currentPosition.y+shape.y][self.currentPosition.x+shape.x] = 3
    console.log("stamped!")

  })

}

Board.prototype.bindEvents = function(){

  var self = this;

  // set keybindings
  document.onkeydown = this.move.bind(self)

}

Board.prototype.isValidPosition = function(newPosition, positionsArray){
  var self = this
  if (!positionsArray) {
    return newPosition.y < this.height && newPosition.y >= 0 && newPosition.x < this.width && newPosition.x >= 0
  } else {
    // debugger 
    var result = true
    positionsArray.forEach(function(position){
      if ( !self.isValidPosition(position) ) {
        result = false
      }
    })
    return result
  }
}

// SHAPES

var Shape = function(name){
  if (!name || name === "random") {
    name = this.getShapeNames().sample()
  }
  this.name = name || "dot"
  this.rotations = this.shapes[name]

}

Shape.prototype.isValidMove = function(board){
  var self = this
  var result = true
  var rotation = this.rotations[board.currentRotationIndex] 
  
  rotation.forEach(function(positionModifier){
    if (!board.isValidPosition({
      x: board.currentPosition.x+positionModifier.x,
      y: board.currentPosition.y+positionModifier.y
    })) {
      result = false
    }
  })

  return result
}

Shape.prototype.previewMove = function(board, destinationPosition){
  // returns an array of points that would be made in a move
  var currentRotationModifiers = this.rotations[board.currentRotationIndex]
  var futureOccupiedPositions = []
  currentRotationModifiers.forEach(function(modifiers){
    futureOccupiedPositions.push({
      x: destinationPosition.x+modifiers.x,
      y: destinationPosition.y+modifiers.y
    })
  })
  return futureOccupiedPositions
}

Shape.prototype.shapes = {

    // position modifiers (relative to current post)

    // shape[name][roation][pieceIndex]

    // dot: [
    //   [
    //     {x: 0, y: 0}
    //   ]
    // ]

    square: [
      // first rotation
      [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 1, y: 1}
      ]
      // second roation
    ],
    line: [
      // first rotation
      [
        {y: 0, x: 0},
        {y: 1, x: 0},
        {y: 2, x: 0},
        {y: 3, x: 0}
      ],
      // second rotation
      [
        {y: 0, x: 0},
        {y: 0, x: 1},
        {y: 0, x: 2},
        {y: 0, x: 3}
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


// HELPERS

Array.prototype.sample = function() {
  // returns a random element from the array
  return this[Math.floor(Math.random()*this.length)]
}