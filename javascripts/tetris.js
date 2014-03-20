var Board = function(options) {

  // initialize logic
  var options = options || {}
  var self = this

  this.width = options.width || 10
  this.height = options.height || 15
  this.refreshRate = options.refreshRate || 100

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
      return function() {
        // reset last row
        if (i != 0) {
          self.matrix[i-1].forEach(function(cell, idx){
            self.matrix[i-1][idx] = 0
          })
        }

        // increment row values
        // self.matrix[i].forEach(function(cell, idx){
        //     self.matrix[i][idx] = 1
        // })

        // square
        self.matrix[i][self.width/2] = 1
        self.matrix[i][(self.width/2)+1] = 1
        self.matrix[i+1][self.width/2] = 1
        self.matrix[i+1][(self.width/2)+1] = 1

        console.log("i: ", i)

        if (i < self.height-1) {
          i += 1
        } else {
          self.reset()
          
          // self.stopGame()
          i = 0
        }
        
      }

    })(),this.refreshRate
  )

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
  this.el.innerHTML = this.toString()
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