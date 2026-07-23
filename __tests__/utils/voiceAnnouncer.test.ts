import * as Speech from 'expo-speech'
import { announceBall, getOverAndBallNumber } from '../../src/utils/voiceAnnouncer'

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}))

const mockSpeak = Speech.speak as jest.Mock
const mockStop = Speech.stop as jest.Mock

beforeEach(() => {
  mockSpeak.mockClear()
  mockStop.mockClear()
})

describe('getOverAndBallNumber', () => {
  test('converts 0-based index to 1-based over/ball for the first ball of over 1', () => {
    expect(getOverAndBallNumber(0)).toEqual({ over: 1, ball: 1 })
  })

  test('converts 0-based index to 1-based over/ball mid-over', () => {
    expect(getOverAndBallNumber(2)).toEqual({ over: 1, ball: 3 })
  })

  test('converts 0-based index to 1-based over/ball at the start of over 2', () => {
    expect(getOverAndBallNumber(6)).toEqual({ over: 2, ball: 1 })
  })

  test('converts 0-based index to 1-based over/ball at the last ball of over 2', () => {
    expect(getOverAndBallNumber(11)).toEqual({ over: 2, ball: 6 })
  })
})

describe('announceBall', () => {
  test('announces a normal run count', () => {
    announceBall(2, 2, false)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 3, 2 runs',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('announces a dot ball as "No run"', () => {
    announceBall(2, 0, false)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 3, No run',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('announces a four with emphasis', () => {
    announceBall(2, 4, false)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 3, Four!',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('announces a six with emphasis', () => {
    announceBall(2, 6, false)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 3, Six!',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('announces a wicket regardless of runs', () => {
    announceBall(2, 0, true)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 3, Wicket!',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('wicket takes priority over a run value', () => {
    announceBall(2, 4, true)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 3, Wicket!',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('uses correct over/ball numbers at the start of a new over', () => {
    announceBall(6, 1, false)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 2, Ball 1, 1 runs',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('stops any in-progress speech before speaking the next announcement', () => {
    announceBall(0, 1, false)
    expect(mockStop).toHaveBeenCalled()
  })
})
