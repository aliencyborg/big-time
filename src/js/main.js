import bigTimeSprites from '../images/bigtime_sprites.png'
import clapper from '../images/clapper.png'
import Score from './score'

const BLACK = '#000000'
const BROWN = '#FBD38D'
const GREEN_2 = '#00EE00'
const MIDNIGHT_BLUE = '#191970'
const WHITE = '#FFFFFF'

$(() => {
  /* Local Vars:
   *   models : Object[] --
   *   lengths : Object[] --
   *   rows : Int[] -- y-coords of rows starting with first traffic row
   *   context : Canvas Context -- used for drawing to main canvas.
   */
  const models = [
    { width: 30, height: 22, dir: 1 },
    { width: 29, height: 24, dir: -1 },
    { width: 24, height: 26, dir: 1 },
    { width: 24, height: 21, dir: -1 },
    { width: 46, height: 19, dir: 1 }
  ]
  const lengths = [
    { width: 179, height: 21 },
    { width: 118, height: 21 },
    { width: 85, height: 22 }
  ]

  const rows = [473, 443, 413, 383, 353, 323, 288, 261, 233, 203, 173, 143, 113]

  let cars
  let context
  let deadsprite
  let game
  let highscore = 0
  let highscoreUser = ''
  let logs
  let sprites

  function onStartButtonClick() {
    if (game && game.restart) {
      game.restart()
    } else {
      startGame()
    }
  }

  $('#startButton').click(onStartButtonClick)

  async function initHighScores() {
    const { data } = await Score.getHighScore()

    if (data.length) {
      highscore = parseInt(data[0].value, 10)
      highscoreUser = data[0].username
    }
  }

  async function startGame() {
    game = new Game()
    await initHighScores()

    $('#startButton')[0].innerHTML = "restart"

    $(document).keydown(function(e) {
      var arrowKey = getArrowKey(e)
      if (arrowKey) {
        e.preventDefault()
      }
      if (arrowKey === 'u') {
        moveGil(up)
      } else if (arrowKey === 'd') {
        moveGil(down)
      } else if (arrowKey === 'l') {
        moveGil(left)
      } else if (arrowKey === 'r') {
        moveGil(right)
      }
    })

    $('#upButton').click(() => moveGil(up))
    $('#leftButton').click(() => moveGil(left))
    $('#rightButton').click(() => moveGil(right))
    $('#downButton').click(() => moveGil(down))

    const board = document.getElementById('game')
    context = board.getContext('2d')

    sprites = new Image()
    deadsprite = new Image()
    sprites.src = bigTimeSprites
    deadsprite.src = clapper

    sprites.onload = async function() {
      drawBg()
      drawInfo()
      makeCars()
      makeLogs()
      drawGil()
      setInterval(await gameLoop, 50)
    }
  }

  var gameLoop = function() {
      drawBg()
      drawInfo()
      drawCars()
      drawLogs()
      drawWins()
      if (game.lives > 0) {
        drawGil()
      } else {
        if (game.gameOver === 0) {
          gameOver()
        }
      }
  }

  var getArrowKey = function(e) {
    /* 
    Args:
        e -- event

    Returns: the name of the arrow key that was pressed when a key is pressed or null.
    */
    switch (e.keyCode) {
      case 37:
        return 'l'
      case 38:
        return 'u'
      case 39:
        return 'r'
      case 40:
        return 'd'
    }
    return null
  }

  // drawer functions: bg, info, gil, cars, logs, wins
  var drawBg = function() {
    context.fillStyle = MIDNIGHT_BLUE
    context.fillRect(0, 0, 399, 70)
    context.fillStyle = BROWN
    context.fillRect(0, 71, 399, 287)
    context.fillStyle = BLACK
    context.fillRect(0, 288, 399, 565)
    context.drawImage(sprites, 0, 0, 399, 113, 0, 0, 399, 113)
    context.drawImage(sprites, 0, 119, 399, 34, 0, 283, 399, 34)
    context.drawImage(sprites, 0, 119, 399, 34, 0, 495, 399, 34)
  }

  var drawInfo = function() {
    drawLives()
    context.font = 'bold 14pt arial'
    context.fillStyle = GREEN_2
    context.fillText('Level ', 100, 545)
    drawLevel()
    context.font = 'bold 10pt arial'
    context.fillText('Score: ', 25, 560)
    context.fillText('Highscore: ', 160, 560)
    drawScore()
  }

  var drawLives = function() {
    var x = 25
    var y = 532
    if (game.score - game.extra * 10000 >= 10000 && game.lives < 4) {
      game.extra++
    }
    for (var i = 0; i < game.lives + game.extra; i++) {
      context.drawImage(sprites, 13, 334, 17, 23, x, y, 11, 15)
      x += 14
    }
  }

  var drawLevel = function() {
    context.font = 'bold 15pt arial'
    context.fillStyle = GREEN_2
    context.fillText(game.level, 155, 545)
  }

  var drawScore = function() {
    const highscoreAndUsername = `${highscore}   ${highscoreUser}`

    context.font = 'bold 10pt arial'
    context.fillStyle = GREEN_2
    context.fillText(game.score, 85, 560)
    context.fillText(highscoreAndUsername, 240, 560)
  }

  var drawGil = function() {
    game.log = logCollision()
    if (game.dead > 0) {
      // @4,2 ; 19x24
      context.drawImage(deadsprite, 4, 2, 19, 24, game.posX, game.posY, 19, 24)
      game.dead--
    } else if (game.dead === 0) {
      game.reset()
    } else if (game.win > 0) {
      game.win--
    } else if (game.win === 0) {
      game.reset()
    } else if (carCollision()) {
      sploosh()
    } else if (waterCollision() && game.log === -1) {
      sploosh()
    } else if (checkWin()) {
      win()
    } else {
      if (game.log >= 0) {
        var tempX = game.posX - logs[game.log].dir * logs[game.log].speed
        if (boundsCheck(tempX, game.posY)) {
          game.posX = tempX
        }
      }
      if (game.facing === 'u') {
        context.drawImage(
          sprites,
          12,
          369,
          23,
          17,
          game.posX,
          game.posY,
          23,
          17
        )
        game.width = 23
        game.height = 17
      } else if (game.facing === 'd') {
        context.drawImage(
          sprites,
          80,
          369,
          23,
          17,
          game.posX,
          game.posY,
          23,
          17
        )
        game.width = 23
        game.height = 17
      } else if (game.facing === 'l') {
        context.drawImage(
          sprites,
          80,
          335,
          19,
          23,
          game.posX,
          game.posY,
          19,
          23
        )
        game.width = 19
        game.height = 23
      } else if (game.facing === 'r') {
        context.drawImage(
          sprites,
          12,
          335,
          19,
          23,
          game.posX,
          game.posY,
          19,
          23
        )
        game.width = 19
        game.height = 23
      }
    }
  }

  var drawWins = function() {
    for (var i = 0; i < game.won.length; i++) {
      if (game.won[i]) {
        switch (i) {
          case 0:
            context.drawImage(sprites, 80, 369, 23, 17, 15, 80, 23, 17)
            break
          case 1:
            context.drawImage(sprites, 80, 369, 23, 17, 101, 80, 23, 17)
            break
          case 2:
            context.drawImage(sprites, 80, 369, 23, 17, 187, 80, 23, 17)
            break
          case 3:
            context.drawImage(sprites, 80, 369, 23, 17, 270, 80, 23, 17)
            break
          case 4:
            context.drawImage(sprites, 80, 369, 23, 17, 354, 80, 23, 17)
            break
        }
      }
    }
  }

  var drawCars = function() {
    for (var i = 0; i < cars.length; i++) {
      cars[i].move()
      if (cars[i].out_of_bounds()) {
        cars[i] = makeCar(cars[i].lane, null, cars[i].model)
      }
      cars[i].draw()
    }
  }

  var drawLogs = function() {
    for (var i = 0; i < logs.length; i++) {
      logs[i].move()
      if (logs[i].out_of_bounds()) {
        logs[i] = makeLog(logs[i].row)
      }
      logs[i].draw()
    }
  }

  var gameOver = async function() {
    game.gameOver = 1
    const topFive = await Score.isTopFive(game.score)

    if (topFive) {
      context.font = 'bold 48pt arial'
      context.fillStyle = GREEN_2
      context.fillText('YOU GOT A', 20, 380)
      context.fillText('HIGHSCORE', 6, 460)
      const username = window.prompt(`You got a high score of ${game.score}!\n Please enter your name:`)
      return Score.submitScore(username, game.score)
    } else {
      context.font = 'bold 72pt arial'
      context.fillStyle = WHITE
      context.fillText('GAME', 60, 150)
      context.fillText('OVER', 60, 300)
    }
  }

  const checkHighScores = async function() {
  }

  // move
  function moveGil(dirFun) {
    if (game.dead === -1 && game.lives > 0) {
      dirFun()
    }
  }

  var up = function() {
    if (boundsCheck(game.posX, game.posY - 30)) {
      game.posY -= 30
      game.current++
    }
    if (game.current > game.highest) {
      game.score += 10
      game.highest++
    }
    game.facing = 'u'
  }

  var down = function() {
    if (boundsCheck(game.posX, game.posY + 30)) {
      game.posY += 30
      game.current--
    }
    game.facing = 'd'
  }

  var left = function() {
    if (boundsCheck(game.posX - 30, game.posY)) game.posX -= 30
    game.facing = 'l'
  }

  var right = function() {
    if (boundsCheck(game.posX + 30, game.posY)) game.posX += 30
    game.facing = 'r'
  }

  var boundsCheck = function(x, y) {
    if (y > 90 && y < 510 && x > 0 && x < 369) {
      return true
    } else if (
      y > 60 &&
      y < 100 &&
      ((x > 5 && x < 40 && !game.won[0]) ||
        (x > 92 && x < 128 && !game.won[1]) ||
        (x > 178 && x < 214 && !game.won[2]) ||
        (x > 263 && x < 299 && !game.won[3]) ||
        (x > 347 && x < 383 && !game.won[4]))
    ) {
      return true
    }
    return false
  }

  var checkWin = function() {
    if (game.posY > 60 && game.posY < 100) {
      if (game.posX > 5 && game.posX < 40 && !game.won[0]) {
        game.won[0] = true
        return true
      } else if (game.posX > 92 && game.posX < 128 && !game.won[1]) {
        game.won[1] = true
        return true
      } else if (game.posX > 178 && game.posX < 214 && !game.won[2]) {
        game.won[2] = true
        return true
      } else if (game.posX > 263 && game.posX < 299 && !game.won[3]) {
        game.won[3] = true
        return true
      } else if (game.posX > 347 && game.posX < 383 && !game.won[4]) {
        game.won[4] = true
        return true
      }
    }
    return false
  }

  var win = function() {
    game.score += 50
    game.win = 15
    if (
      game.won[0] &&
      game.won[1] &&
      game.won[2] &&
      game.won[3] &&
      game.won[4]
    ) {
      level()
    }
  }

  var level = function() {
    for (var i = 0; i < game.won.length; i++) {
      game.won[i] = false
    }
    game.score += 1000
    game.level++
  }

  var collides = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (
      (x1 <= x2 + w2 && x1 >= x2 && (y1 <= y2 + h2 && y1 >= y2)) ||
      (x1 + w1 <= x2 + w2 && x1 + w1 >= x2 && (y1 <= y2 + h2 && y1 >= y2)) ||
      (x1 <= x2 + w2 && x1 >= x2 && (y1 + h1 <= y2 + h2 && y1 + h1 >= y2)) ||
      (x1 + w1 <= x2 + w2 &&
        x1 + w1 >= x2 &&
        (y1 + h1 <= y2 + h2 && y1 + h1 >= y2))
    )
  }

  var carCollision = function() {
    if (game.posY < 505 && game.posY > 270) {
      for (var i = 0; i < cars.length; i++) {
        if (
          collides(
            game.posX,
            game.posY,
            game.width,
            game.height,
            cars[i].posX,
            cars[i].posY,
            cars[i].width,
            cars[i].height
          )
        ) {
          return true
        }
      }
    }
    return false
  }

  var logCollision = function() {
    if (game.posY < 270) {
      for (var i = 0; i < logs.length; i++) {
        if (
          collides(
            game.posX,
            game.posY,
            game.width,
            game.height,
            logs[i].posX,
            logs[i].posY,
            logs[i].width,
            logs[i].height
          )
        )
          return i
      }
    }
    return -1
  }

  var waterCollision = function() {
    return game.posY > 105 && game.posY < 270
  }

  var sploosh = function() {
    game.lives--
    game.dead = 20
  }

  // object initializers

  var makeCars = function() {
    cars = [
      makeCar(0),
      makeCar(0, 130, 3),
      makeCar(0, 260, 3),
      makeCar(1),
      makeCar(2),
      makeCar(2, 150, 0),
      makeCar(3, 200),
      makeCar(4),
      makeCar(5),
      makeCar(5, 80),
      makeCar(5, 240)
    ]
  }

  var makeCar = function(row, x, model) {
    switch (row) {
      case 0:
        return new Car(
          x == null ? -25 : x,
          rows[row],
          row,
          3,
          model == null ? 1 : model
        )
      case 1:
        return new Car(
          x == null ? 399 : x,
          rows[row],
          row,
          2,
          model == null ? 0 : model
        )
      case 2:
        return new Car(
          x == null ? 399 : x,
          rows[row],
          row,
          4,
          model == null ? 2 : model
        )
      case 3:
        return new Car(
          x == null ? -25 : x,
          rows[row],
          row,
          3,
          model == null ? 3 : model
        )
      case 4:
        return new Car(
          x == null ? 399 : x,
          rows[row],
          row,
          3,
          model == null ? 0 : model
        )
      case 5:
        return new Car(
          x == null ? 399 : x,
          rows[row],
          row,
          4,
          model == null ? 4 : model
        )
    }
  }

  var makeLogs = function() {
    logs = [
      makeLog(7),
      makeLog(7, 170),
      makeLog(8),
      makeLog(8, 200),
      makeLog(9),
      makeLog(10),
      makeLog(11),
      makeLog(11, 100, 0),
      makeLog(12)
    ]
  }

  var makeLog = function(row, x, len) {
    switch (row) {
      case 7:
        return new Log(
          x == null ? 399 : x,
          rows[row],
          row,
          1,
          1,
          len == null ? 1 : len
        )
      case 8:
        return new Log(
          x == null ? -85 : x,
          rows[row],
          row,
          4,
          -1,
          len == null ? 2 : len
        )
      case 9:
        return new Log(
          x == null ? 399 : x,
          rows[row],
          row,
          2,
          1,
          len == null ? 0 : len
        )
      case 10:
        return new Log(
          x == null ? -85 : x,
          rows[row],
          row,
          2,
          -1,
          len == null ? 1 : len
        )
      case 11:
        return new Log(
          x == null ? 399 : x,
          rows[row],
          row,
          3,
          1,
          len == null ? 1 : len
        )
      case 12:
        return new Log(
          x == null ? -85 : x,
          rows[row],
          row,
          3,
          -1,
          len == null ? 2 : len
        )
    }
  }

  /* game "classes" - game, car, log
   * Car models:
   *   0: pink sedan
   *   1: white sedan
   *   2: yellow sedan
   *   3: white bulldozer
   *   4: white truck
   */
  var Car = function(x, y, lane, speed, model) {
    this.posX = x
    this.posY = y
    this.lane = lane
    this.speed = speed
    this.model = model
    this.width = models[model].width
    this.height = models[model].height
    this.move = function() {
      this.posX = this.posX - models[model].dir * this.speed * game.level
    }
    this.draw = function() {
      switch (this.model) {
        case 0:
          context.drawImage(
            sprites,
            8,
            265,
            30,
            22,
            this.posX,
            this.posY,
            30,
            22
          )
          break
        case 1:
          context.drawImage(
            sprites,
            45,
            264,
            29,
            24,
            this.posX,
            this.posY,
            29,
            24
          )
          break
        case 2:
          context.drawImage(
            sprites,
            81,
            263,
            24,
            26,
            this.posX,
            this.posY,
            24,
            26
          )
          break
        case 3:
          context.drawImage(
            sprites,
            9,
            300,
            24,
            21,
            this.posX,
            this.posY,
            24,
            21
          )
          break
        case 4:
          context.drawImage(
            sprites,
            105,
            301,
            46,
            19,
            this.posX,
            this.posY,
            46,
            19
          )
          break
      }
    }
    this.out_of_bounds = function() {
      return this.posX + this.width < 0 || this.posX > 399
    }
  }

  /* Log lengths:
   *   0: long
   *   1: medium
   *   2: small
   */
  var Log = function(x, y, row, speed, dir, length) {
    this.posX = x
    this.posY = y
    this.row = row
    this.speed = speed
    this.dir = dir
    this.length = length
    this.width = lengths[length].width
    this.height = lengths[length].height
    this.move = function() {
      this.posX = this.posX - this.dir * this.speed
    }
    this.draw = function() {
      switch (this.length) {
        case 0:
          context.drawImage(
            sprites,
            6,
            165,
            179,
            21,
            this.posX,
            this.posY,
            179,
            21
          )
          break
        case 1:
          context.drawImage(
            sprites,
            5,
            197,
            118,
            21,
            this.posX,
            this.posY,
            118,
            21
          )
          break
        case 2:
          context.drawImage(
            sprites,
            6,
            229,
            85,
            22,
            this.posX,
            this.posY,
            85,
            22
          )
          break
      }
    }
    this.out_of_bounds = function() {
      return this.posX + this.width < 0 || this.posX > 399
    }
  }

  var Game = function() {
    this.current = -1
    this.dead = -1
    this.extra = 0
    this.facing = 'u'
    this.gameOver = 0
    this.highest = -1
    this.level = 1
    this.lives = 5
    this.log = -1
    this.posX = 187
    this.posY = 503
    this.score = 0
    this.win = -1
    this.won = [false, false, false, false, false]

    this.reset = () => {
      this.current = -1
      this.dead = -1
      this.facing = 'u'
      this.highest = -1
      this.log = -1
      this.posX = 187
      this.posY = 503
      this.win = -1
    }

    this.restart = () => {
      initHighScores()
      this.current = -1
      this.dead = -1
      this.extra = 0
      this.facing = 'u'
      this.gameOver = 0
      this.highest = -1
      this.level = 1
      this.lives = 5
      this.log = -1
      this.posX = 187
      this.posY = 503
      this.score = 0
      this.win = -1
      this.won = [false, false, false, false, false]
    }
  }
})
