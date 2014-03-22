var Board = function(options) {

  // initialize logic
  var options = options || {}
  var self = this

  // number of rows and columns (height, width)
  this.sliceSize = Math.floor( 200*(80/document.body.clientWidth) ) || 1
  console.log("sliceSize", this.sliceSize)

  this.width = options.width || Math.floor(document.body.clientWidth/this.sliceSize)
  this.height = options.height || Math.floor(document.body.clientHeight/this.sliceSize)
  this.refreshRate = options.refreshRate || 100
  this.id = options.id || "main-container"

  this.activeCells = []

  var dynamicStyle = document.createElement('style')

  // speed improvement over dynamically adding style
  dynamicStyle.innerText = [
    ".row {",
      "height: ", self.sliceSize, ";",
    "}",
    ".cell {",
      "width: ", self.sliceSize, ";",
    "}"
  ].join("")

  document.head.appendChild(dynamicStyle)

  this.el = document.getElementById(this.id)

  // clear contents if any
  while (this.el.firstChild) {
    this.el.removeChild(this.el.firstChild)
  }

  // clear Timers if any
  this.stopAllIntervals()


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

  
  this.gridEl = document.createElement('div')
  this.gridEl.id = "grid"
  this.el.appendChild(this.gridEl)
  // document.getElementById('main-container').appendChild(this.el)

  // creates DOM grid
  this.buildGrid()

  // sets refresh logic
  this.refresh = setInterval(function(){
    self.updateBoard()
  }, 66)

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

Board.prototype.buildGrid = function(){
  var self = this

  while (this.gridEl.firstChild) {
    this.gridEl.removeChild(this.gridEl.firstChild)
  }

  this.matrix.forEach(function(value, rowIdx){
    
    var row = document.createElement('div')
    row.classList.add('row')
    self.matrix[rowIdx].forEach(function(value, colIdx){

      var cell = document.createElement('span')
      cell.className = 'cell '+rowIdx+'_'+colIdx
      if (value > 0) {
        cell.classList.add("filled")
        self.activeBoxes.push(cell)
      }

      cell.innerHTML = "&nbsp;"

      row.appendChild(cell)

    })

    self.gridEl.appendChild(row)

  })
}

Board.prototype.updateBoard = function(){
  // plain 0s and 1s
  // this.el.innerHTML = this.toString()

  var self = this

  // remove any existing filled boxes

  while (self.activeCells.length > 0) {
    var oldCell = self.activeCells.pop()
    oldCell.classList.remove("filled")
  }

  this.matrix.forEach(function(value, rowIdx){
    self.matrix[rowIdx].forEach(function(value, colIdx){

      if (value > 0) {
        // debugger
        var activeCell = document.getElementsByClassName('cell '+rowIdx+'_'+colIdx)[0]
        // debugger
        if (activeCell !== undefined) { 
          activeCell.classList.add("filled")
          self.activeCells.push(activeCell)
        }
      }

    })

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

Board.prototype.actions = function(ev){
  var direction = ev.keyIdentifier
  // console.log("key", keyName, ev)
  switch( direction ) {
    case "Up":
      // . key
      // rotate right
      ev.preventDefault()
      this.currentRotationIndex += 1
      this.renderShape(this.currentShape.name, this.currentRotationIndex)
      break
    // case 188:
    //   // , key
    //   // rotate left
    //   ev.preventDefault()
    //   // TODO: fix this, doesn't seem to work
    //   this.currentRotationIndex -= 1
    //   // quick fix
    //   if (this.currentRotationIndex < 0 ) this.currentRotationIndex = Math.abs(this.currentRotationIndex) 
    //   this.renderShape(this.currentShape.name, this.currentRotationIndex)
    //   break
  } 
  return false
}

Board.prototype.move = function(ev){
  
  var direction = ev.keyIdentifier
  switch ( direction ) {
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
      // console.log("no movement", ev)
  }

  // TODO: figure out way preview future positions without doing this
  if (newPosition && this.isValidPosition({}, this.currentShape.previewMove(this, newPosition) )) {
    this.changeCurrentPostion(newPosition)
    this.updateBoard()
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
    self.renderShape()
  } 


  

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

// Board EVENTS

Board.prototype.bindEvents = function(){

  var self = this;

  // set keybindings
  document.addEventListener("keydown", this.move.bind(self) )

  document.addEventListener("keyup", this.actions.bind(self) )

}

Board.prototype.stopAllIntervals = function(){
  this.stopGame()
  this.stopRefresh()
}


Board.prototype.isValidPosition = function(newPosition, positionsArray){
  var self = this
  if (!positionsArray) {
            //validates that new position is within board 
    return newPosition.y < this.height &&
           newPosition.y >= 0 && 
           newPosition.x < this.width && 
           newPosition.x >= 0 &&
           this.matrix[newPosition.y][newPosition.x] !== 3
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