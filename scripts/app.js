function init() {
  //DOM Elements
  const start = document.querySelector('#start-button')
  const reset = document.querySelector('#reset-button')
  const musicButton = document.querySelector('#play-pause')
  const livesSpan = document.querySelector('#live-counter')
  const level = document.querySelector('#level-span')
  const gameOverBox = document.querySelector('#game-over-container')
  const controlBox = document.querySelector('#controls-box')
  const nameInput = document.querySelector('#input')
  const gameStats = document.querySelector('#game-stats')
  const submit = document.querySelector('#submit')
  const close = document.querySelector('#close')
  const score = document.querySelector('#score')
  const leaderList = document.querySelector('#leader-list')
  const currentHighScore = document.querySelector('#current-game-score')
  let finishedGameScore = 0
  let scoreNumber = 0
  let highScore = 0

  //audio Bank
  const sfx = {
    laser: 'assets/audio-assets/01-lazer.mp3',
    playerMiss: 'assets/audio-assets/08-playerMiss.mp3',
    playerHit: 'assets/audio-assets/04-playerHit.wav',
    virusAttack: 'assets/audio-assets/09-enemyFire.wav',
    virusMiss: 'assets/audio-assets/5 Park View 5.m4a',
    virusHit: 'assets/audio-assets/10-enemyHit.wav',
    gameStart: 'assets/audio-assets/062-startLevel.wav',
    gameOver: 'assets/audio-assets/02-gameOver.wav',
    levelWin: 'assets/audio-assets/07-levelWin.wav',
  }

  //audio DOM Channels
  const generalChannel = document.querySelector('#general-channel')
  const musicChannel = document.querySelector('#music-channel')
  musicChannel.loop = true
  const channel1 = document.querySelector('#channel-1')
  const channel2 = document.querySelector('#channel-2')
  const channel3 = document.querySelector('#channel-3')
  const channel4 = document.querySelector('#channel-4')
  const channel5 = document.querySelector('#channel-5')
  const channel6 = document.querySelector('#channel-6')

  //Grid variables
  const grid = document.querySelector('#grid')
  const width = 15
  const cellCount = width * width
  const cells = []

  //Player Char Varaibles
  const charClass = 'character'
  const startPosition = 217 //Must be on the bottom line (210 - 224)
  let charCurrentPosition = startPosition
  const fireSpeed = 15 // (1000 / num) How fast fire moves up the grid

  //Lives variables
  const startLives = 3
  let lives = startLives
  livesSpan.innerText = ('💉').repeat(startLives)

  //Virus Variables
  const virusClass = 'virus'
  const virusFireClass = 'virusFire'
  const virusStartPosition = 16
  let virusLinesNumber = 1
  let virusEnemyAmount = 5
  let VirusMovementSpeedFactor = 2
  let virusFireSpeedFactor = 1
  let virusCurrentPositionArray = []
  let direction = 1 //right

  //Difficulty & scaling varaibles
  let diffuculty = 0
  let enemyScaling = 0
  let enemyLineScaling = 0
  let enemySpeedScaling = 0
  let enemyFireSpeedScaling = 0
  const speed = 1000

  //Fire shot Varaibles
  const fireClass = 'fire'
  const fireSpawnPostion = charCurrentPosition - width
  let fireMovement = fireSpawnPostion

  //Set up fucntions
  reset.disabled = true

  function startUpGame() {
    diffuculty += 1
    direction = 1

    //New level virus line length scaling
    enemyScaling = diffuculty * 0.1 + 1
    virusEnemyAmount = Math.floor(5 * enemyScaling)
    if (virusEnemyAmount > 10) {
      virusEnemyAmount = 10
    }

    //New level virus line number scaling
    enemyLineScaling = diffuculty * 0.36 + 1
    virusLinesNumber = Math.floor(enemyLineScaling)
    if (virusLinesNumber === 0) {
      virusLinesNumber = 1
    } else if (virusLinesNumber > 6) {
      virusLinesNumber = 6
    }

    //Next level virus speed scaling
    enemySpeedScaling = diffuculty * 0.25 + 1
    VirusMovementSpeedFactor = enemySpeedScaling

    //Next Level virus fire rate
    enemyFireSpeedScaling = 1 - (diffuculty * 0.04)
    virusFireSpeedFactor = enemyFireSpeedScaling
    if (virusFireSpeedFactor < 0.7) {
      virusFireSpeedFactor = 0.7
    }
    console.log('VFSpeed:', virusFireSpeedFactor)

    addVirusStart(virusStartPosition)
    level.innerHTML = diffuculty
    console.log('Dificulty', diffuculty)
    VirusMovement()
    start.disabled = true
    reset.disabled = false
    addChar(charCurrentPosition)
    virusFire()
    start.innerHTML = 'Next Level'
    start.style.fontSize = '10px'
    generalChannel.src = sfx.gameStart
    generalChannel.play()
    controlBox.style.display = 'none'
  }

  function resetGame() {
    console.log('reset click.')
    diffuculty = 0
    direction = 1
    virusEnemyAmount = 5
    level.innerHTML = '_'
    start.disabled = false
    removeCha(charCurrentPosition)
    console.log[cells]
    virusCurrentPositionArray = []
    cells.forEach(tile => {
      tile.className = ''
    })

    setTimeout(() => {
      scoreNumber = 0
      score.innerHTML = 0
    }, 500)

    lives = startLives
    livesSpan.innerText = ('💉').repeat(startLives)
    start.innerHTML = 'Start'
    start.style.fontSize = '13px'

    for (let i = 0; i < cellCount; i++) {
      cells[i].classList.add('gif-default')
    }

    setTimeout(() => {
      if (gameOverBox.style.display === 'block') {
        start.disabled = true
      }
    }, 500)
  }

  //Grid generate function
  function makegrid() {
    for (let i = 0; i < cellCount; i++) {
      const gridCell = document.createElement('div')
      gridCell.innerHTML = i
      gridCell.classList.add('gif-default')
      grid.appendChild(gridCell)
      cells.push(gridCell)
    }
  }

  //Add & Remove character functions
  function addChar(position) {
    cells[position].classList.add(charClass)
  }
  function removeCha(position) {
    cells[position].classList.remove(charClass)
  }

  //VIRUS FUNCTIONS:
  //Add Viruses
  function addVirusStart(position) {
    for (let i = 0; i < virusEnemyAmount; i++) {
      for (let y = 0; y < virusLinesNumber; y++) {
        cells[position + width * y + i].classList.add(virusClass)
        virusCurrentPositionArray.push(position + width * y + i)
      }
    }
    console.log('Virus Positons:', virusCurrentPositionArray)
  }

  //Remove Viruses + add score   
  function removeVirus(position) {
    cells[position].classList.remove(virusClass)
    const collided = virusCurrentPositionArray.indexOf(position)
    virusCurrentPositionArray.splice(collided, 1)

    scoreNumber += 1000
    score.innerHTML = scoreNumber
    cells[position].innerHTML = '<img src="assets/Splat2.gif" alt="Boom GIF">'
    setTimeout(() => {
      cells[position].innerHTML = null
    }, 500)
  }

  //Virus Movment > virus-fire
  function VirusMovement() {
    const movementInterval = setInterval(() => {
      //Moving the virus array right and left
      virusCurrentPositionArray.forEach(position => {
        cells[position].classList.remove(virusClass)
      })
      virusCurrentPositionArray = virusCurrentPositionArray.map(position => position + direction)
      virusCurrentPositionArray.forEach(position => {
        cells[position].classList.add(virusClass)
      })
      //Line direction and line down
      if (virusCurrentPositionArray[virusCurrentPositionArray.length - 1] % width === width - 1) {
        direction *= -1
        moveLineDown()
      } else if (virusCurrentPositionArray[0] % width === 0) {
        direction *= -1
        moveLineDown()
      }
      //End game (Win/Loose)      
      if (virusCurrentPositionArray.length === 0) {
        clearInterval(movementInterval)
        generalChannel.src = sfx.levelWin
        generalChannel.play()
        scoreNumber += 10000
        score.innerHTML = scoreNumber
        start.disabled = false
      } else if (cells[210].classList.contains(virusClass) || cells[211].classList.contains(virusClass) || cells[212].classList.contains(virusClass) || cells[213].classList.contains(virusClass) || cells[214].classList.contains(virusClass) || cells[215].classList.contains(virusClass) || cells[216].classList.contains(virusClass) || cells[217].classList.contains(virusClass) || cells[218].classList.contains(virusClass) || cells[219].classList.contains(virusClass) || cells[220].classList.contains(virusClass) || cells[221].classList.contains(virusClass) || cells[222].classList.contains(virusClass) || cells[223].classList.contains(virusClass) || cells[224].classList.contains(virusClass)) {
        clearInterval(movementInterval)
        gameFinished()
        console.log('The Pit')
      }
    }, speed / VirusMovementSpeedFactor)
  }

  //Virus Move down a line
  function moveLineDown() {
    setTimeout(() => {
      virusCurrentPositionArray.forEach(position => {
        cells[position].classList.remove(virusClass)
      })
      virusCurrentPositionArray = virusCurrentPositionArray.map(position => position + width)
      virusCurrentPositionArray.forEach(position => {
        cells[position].classList.add(virusClass)
      })
    }, 200)
  }

  //Virus fire function
  function virusFire() {
    const virusFireInvterval = setInterval(() => { //Runs when start button is activated
      if (virusCurrentPositionArray[0] >= width * width - width || virusCurrentPositionArray.length === 0) {
        clearInterval(virusFireInvterval)
      } else if (virusCurrentPositionArray.length > 0) { //Checks to see if a virus is still on the grid
        const randomVirusToFire = virusCurrentPositionArray[Math.floor(Math.random() * virusCurrentPositionArray.length)]  //Pull a postion number from the virus array
        cells[randomVirusToFire].classList.add(virusFireClass)
        channel4.src = sfx.virusAttack
        channel4.volume = 0.20
        channel4.play()
        virusFireMovement(randomVirusToFire)
      }
    }, speed * virusFireSpeedFactor)
  }

  function virusFireMovement(location) {
    const virusFireInterval = setInterval(() => {
      cells[location].classList.remove(virusFireClass)
      cells[location + width].classList.add(virusFireClass)
      location += width
      // console.log('V fire:', location)
      if (cells[location].classList.contains(charClass)) {
        console.log('Player hit')
        chaHit(location)
        cells[location].classList.remove(virusFireClass)
        cells[location].classList.add('character')
        clearInterval(virusFireInterval)
        removeCha(location)

      } else if (location >= width * width - width || lives === 0) {
        clearInterval(virusFireInterval)
        setTimeout(() => { //Waits one more interaval so you can see the fire on the last row.
          cells[location].classList.remove(virusFireClass)
          channel5.src = sfx.virusMiss
          channel5.volume = 0.20
          channel5.play()
          cells[location].classList.add('smoke-reverse')
          setTimeout(() => {
            cells[location].classList.remove('smoke-reverse')
          }, 500)
        }, 1000 / 4)
      }
    }, speed / 4)
  }

  //Player hit events
  function chaHit(location) {
    lives -= 1
    livesSpan.innerText = ('💉').repeat(lives)
    channel3.src = sfx.playerHit
    channel3.play()
    if (lives <= 0) {
      setTimeout(() => {
        gameFinished()
      }, speed)
    }
    cells[location].innerHTML = '<img src="assets/BoomGIF2.gif" alt="Boom GIF">'
    setTimeout(() => {
      cells[location].innerHTML = null
    }, speed)
  }

  //Function to move character and fire 
  function movementAndFire(event) {
    const key = event.keyCode
    const left = 37
    const right = 39
    const fire = 32
    const enter = 13
    removeCha(charCurrentPosition)
    if (key === right && charCurrentPosition % width !== width - 1) {
      charCurrentPosition++
    } else if (key === left && charCurrentPosition % width !== 0) {
      charCurrentPosition--
    } else if (key === fire) {
      channel1.src = sfx.laser
      channel1.volume = 0.10
      channel1.play()
      fireShot(charCurrentPosition)
      charImageChange()
    } else if (key === enter) {
      start.click()
    }
    addChar(charCurrentPosition)
  }

  //Function to spawn fire
  function fireShot(spawn) {
    cells[spawn - width].classList.add(fireClass)
    fireMovement = cells[spawn - width].innerHTML
    fireMove(fireMovement)
  }

  //Fire movment function, will stop as it reaches the top row. 
  function fireMove(location) {
    const fireTime = setInterval(() => {
      cells[location].classList.remove(fireClass) //Removes previous image of fire
      cells[location - width].classList.add(fireClass) //Add new image on new row above. 
      location -= width
      // console.log('Virus Location:', cells[location].className, cells[location].innerHTML)
      if (cells[location].classList.contains(virusClass)) { //Checks to see if atile has both the virus && fire class. 
        channel6.src = sfx.virusHit
        channel6.volume = 0.60
        channel6.play()
        fireVirusCollision(location)
        clearInterval(fireTime)
      } else if (location < width) { //checks to see if it reaches the top row
        clearInterval(fireTime) //stops the Time Interval
        setTimeout(() => { //Waits one more interaval so you can see the fire on the last row.
          cells[location].classList.remove(fireClass)
          channel2.src = sfx.playerMiss
          channel2.volume = 0.20
          channel2.play()
          cells[location].classList.add('smoke')
          setTimeout(() => {
            cells[location].classList.remove('smoke')
          }, 400)
        }, speed / fireSpeed)
      }
    }, speed / fireSpeed)
  }

  //Fire hits a virus
  function fireVirusCollision(location) {
    removeVirus(location)
    cells[location].classList.remove(fireClass)
  }

  //Character animation for fire
  function charImageChange() {
    const animationPosition = charCurrentPosition
    cells[animationPosition].classList.add('emptyCharacter')
    setTimeout(() => {
      cells[animationPosition].classList.remove('emptyCharacter')
    }, 50)
  }

  function gameFinished() {
    setTimeout(() => {
      generalChannel.src = sfx.gameOver
      generalChannel.play()
    }, 900)
    finishedGameScore = scoreNumber
    highScore = window.localStorage.getItem('highscore')
    gameOverBox.style.display = 'block'
    if (!finishedGameScore) {
      submit.disabled = true
      gameStats.innerHTML = 'Better luck next round~'
      currentHighScore.innerHTML = highScore
    } else if (scoreNumber > highScore) {
      close.disabled = true
      window.localStorage.setItem('highscore', scoreNumber)
      highScore = window.localStorage.getItem('highscore')
      setTimeout(() => {

        gameStats.innerHTML = 'You are the High Scorer!'
        currentHighScore.innerHTML = highScore
      }, 200)
    } else {
      setTimeout(() => {

        gameStats.innerHTML = `Final score:${scoreNumber}`
        currentHighScore.innerHTML = highScore
      }, 200)
    }

    setTimeout(() => {
      resetGame()
    }, 400)
  }

  function closeGameOverBox() {
    submit.disabled = false
    gameOverBox.style.display = 'none'
    resetGame()
  }

  let leaderboard = localStorage.getItem('sei_leaderboard_virus_buster') ? localStorage.getItem('sei_leaderboard_virus_buster') : '[]'
  let leaderboardParsed = JSON.parse(leaderboard)
  console.log(leaderboardParsed)

  function submitScore() {
    controlBox.style.display = 'block'
    gameOverBox.style.display = 'none'
    start.disabled = false
    const sessionName = nameInput.value ? nameInput.value : 'Player'
    console.log(sessionName)
    const temp = { name: sessionName, score: finishedGameScore }
    leaderboardParsed.push(temp)
    const leaderJSONString = JSON.stringify(leaderboardParsed)
    localStorage.setItem('sei_leaderboard_virus_buster', leaderJSONString)
    leaderboard = localStorage.getItem('sei_leaderboard_virus_buster')
    leaderboardParsed = JSON.parse(leaderboard)
    console.log('Leader Parsed after submit:', leaderboardParsed)
    clearleaderboard()
    close.disabled = false
  }

  function clearleaderboard() {
    while (leaderList.lastElementChild) {
      leaderList.removeChild(leaderList.lastChild)
    }
    sortLeaderList()
  }

  function sortLeaderList() {
    leaderboardParsed.sort((a, b) => {
      return b.score - a.score
    })

    leaderboardParsed.forEach(element => {
      const newListItem = document.createElement('tr')
      const nameTD = document.createElement('td')
      const scoreTD = document.createElement('td')
      nameTD.innerHTML = element.name
      scoreTD.innerHTML = element.score
      newListItem.appendChild(nameTD)
      newListItem.appendChild(scoreTD)
      leaderList.appendChild(newListItem)
    })
  }

  function music() {
    if (musicChannel.paused) {
      musicChannel.play()
      musicButton.innerHTML = 'Pause Music'
    } else {
      musicChannel.pause()
      musicButton.innerHTML = 'Play Music'
    }
  }

  //Button Events
  start.addEventListener('click', startUpGame)
  reset.addEventListener('click', resetGame)
  close.addEventListener('click', closeGameOverBox)
  submit.addEventListener('click', submitScore)
  window.addEventListener('keyup', movementAndFire)
  musicButton.addEventListener('click', music)

  //Function that stops spacebar scrolling the window down
  window.addEventListener('keydown', (e) => {
    if (e.keyCode === 32 && e.target === document.body) {
      e.preventDefault()
    }
  })

  makegrid()
  sortLeaderList()
  musicChannel.src = 'assets/audio-assets/Corona-BG-Music.mp3'
  musicChannel.volume = 0.20
}

window.addEventListener('DOMContentLoaded', init)