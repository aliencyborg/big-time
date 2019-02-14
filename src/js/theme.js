import bigTimeMusic from '../audio/big_time.mp3'

$(() => {
  const theme = $('#theme')[0]
  const $startButton = $('#startButton')
  const $muteButton = $('#muteButton')

  theme.src = bigTimeMusic
  theme.loop = true

  async function playAudio() {
    await theme.play()
  }

  async function pauseAudio() {
    const isPaused = theme.paused
    if (isPaused) {
      await theme.play()
    } else {
      await theme.pause()
    }
  }

  $startButton.click(playAudio)
  $muteButton.click(pauseAudio)
})
