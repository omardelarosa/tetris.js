var Board = function(options) {

  // initialize logic
  var options = options || {}
  var self = this

  this.width = options.width || 10
  this.height = options.height || 15
  this.refreshRate = options.refreshRate || 100

  this.currentPosition = {
    row: 0,
    col: 0
  }

  this.matrix = []

  for (var row = 0; row <= this.height; row += 1) {
    this.matrix.push([])
    for (var col = 0; col < this.width; col += 1) {
      this.matrix[row].push([0])
    }
  }

  this.el = document.createElement('div')

  document.getElementById('main-container').appendChild(this.el)

  // sets refresh logic
  this.refresh = setInterval(function(){
    self.render()
  }, this.refreshRate)

  this.startGame = setInterval(
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

        // square
        // self.matrix[i][self.width/2] = 1
        // self.matrix[i][(self.width/2)+1] = 1
        // self.matrix[i+1][self.width/2] = 1
        // self.matrix[i+1][(self.width/2)+1] = 1

        // console.log("i: ", i)

        if (i < self.height-1) {
          i += 1
        } else {
          // self.reset()
          self.changeCurrentPostion({row: 0, col: self.currentPosition.col})
          
          // self.stopGame()
          i = 0
        }
        
      }

    })(),this.refreshRate
  )


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
  clearInterval(this.startGame)
}

Board.prototype.reset = function(){
  // console.log(this.matrix)
  // debugger
  var self = this
  self.matrix.forEach(function(value, row){
    self.matrix[row].forEach(function(value, col){
      self.matrix[row][col] = 0
    })
  })
}

Board.prototype.move = function(ev){
  ev.preventDefault()
  var direction = ev.keyIdentifier
  switch ( direction ) {
    case "Up":
      this.changeCurrentPostion({ row: this.currentPosition.row-1, col: this.currentPosition.col })
      break
    case "Down":

      this.changeCurrentPostion({ row: this.currentPosition.row+1, col: this.currentPosition.col })
      break
    case "Left":

      this.changeCurrentPostion({ row: this.currentPosition.row, col: this.currentPosition.col-1 })
      break
    case "Right":

      this.changeCurrentPostion({ row: this.currentPosition.row, col: this.currentPosition.col+1 })
      break
    default:
      // console.log("no movement")
  }
  // this.setCurrentPostion()
  return false

}

Board.prototype.changeCurrentPostion = function(newPosition){
  var self = this
  this.reset()

  var validPosition = function(newPosition){
    return newPosition.row < self.height && newPosition.row >= 0 && newPosition.col < self.width && newPosition.col >= 0
  }
  if (newPosition !== undefined && validPosition(newPosition)) {
    this.matrix[this.currentPosition.row][this.currentPosition.col] = 0
    this.currentPosition = newPosition
    this.matrix[newPosition.row][newPosition.col] = 1
  } else {
    this.matrix[this.currentPosition.row][this.currentPosition.col] = 1
  }

  self.setCurrentShape()

}

Board.prototype.setCurrentShape = function(){
  var self = this

  var shapes = {

    // position modifiers (relative to current post)

    // shape[name][roation][pieceIndex]
    square: [
      // first rotation
      [ 
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 1, y: 1}
      ]
      // second roation
    ]
  }
  var shapeName = "square"

  _.each(shapes[shapeName][0], function(piece){

    // console.log(piece)
    self.matrix[self.currentPosition.row+piece.x][self.currentPosition.col+piece.y] = 1

  })
}

Board.prototype.bindEvents = function(){

  var self = this;

  document.onkeyup = this.move.bind(self)

}