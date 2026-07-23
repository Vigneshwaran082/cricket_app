import * as Speech from 'expo-speech'

const SPEECH_OPTIONS: Speech.SpeechOptions = {
  language: 'en-IN',
  rate: 0.9,
}

/**
 * Converts a 0-based ball index into human readable 1-based over/ball numbers.
 * e.g. index 3 -> over 1, ball 4 (since over = floor(3/6)+1, ball = (3%6)+1)
 */
export const getOverAndBallNumber = (ballIndex: number): { over: number; ball: number } => ({
  over: Math.floor(ballIndex / 6) + 1,
  ball: (ballIndex % 6) + 1,
})

const buildAnnouncement = (ballIndex: number, runs: number, isWicket: boolean): string => {
  const { over, ball } = getOverAndBallNumber(ballIndex)
  const prefix = `Over ${over}, Ball ${ball},`

  if (isWicket) {
    return `${prefix} Wicket!`
  }
  if (runs === 6) {
    return `${prefix} Six!`
  }
  if (runs === 4) {
    return `${prefix} Four!`
  }
  if (runs === 0) {
    return `${prefix} No run`
  }
  return `${prefix} ${runs} runs`
}

/**
 * Speaks aloud the outcome of a ball using expo-speech.
 * ballIndex is the 0-based index of the ball that was just recorded.
 * Routes through the device's default audio output (e.g. connected Bluetooth speaker)
 * automatically via Android's audio routing.
 */
export const announceBall = (ballIndex: number, runs: number, isWicket: boolean): void => {
  const message = buildAnnouncement(ballIndex, runs, isWicket)
  Speech.stop()
  Speech.speak(message, SPEECH_OPTIONS)
}
