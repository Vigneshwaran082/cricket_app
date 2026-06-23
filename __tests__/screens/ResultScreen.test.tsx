import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}))

jest.mock('react-native-safe-area-context', () => {
  const mockView = require('react-native').View
  return {
    SafeAreaView: mockView,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  }
})

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
}))

import { useMatchStore } from '../../src/store/matchStore'
import { ResultScreen } from '../../src/screens/ResultScreen'

const mockNavigation = { replace: jest.fn(), navigate: jest.fn() }

// Helper: set up a completed match in the store
const setupCompletedMatch = ({
  teamARuns, teamAWickets, teamBRuns, teamBWickets,
}: {
  teamARuns: number, teamAWickets: number
  teamBRuns: number, teamBWickets: number
}) => {
  const store = useMatchStore.getState()
  store.newMatch()
  store.setupMatch({ teamA: 'India', teamB: 'Australia', overs: 1, playersPerTeam: 11 })

  // Manually set innings balls via setState for precise control
  const innings: [any, any] = [
    {
      balls: [
        ...Array(teamAWickets).fill({ runs: 0, isWicket: true }),
        ...Array(6 - teamAWickets).fill({ runs: 0, isWicket: false }),
      ],
      wickets: teamAWickets,
    },
    {
      balls: [
        ...Array(teamBWickets).fill({ runs: 0, isWicket: true }),
        ...Array(6 - teamBWickets).fill({ runs: 0, isWicket: false }),
      ],
      wickets: teamBWickets,
    },
  ]

  // Distribute runs into the non-wicket balls (or first balls) for realism
  // Simpler: just adjust first ball runs to match totals
  innings[0].balls[0] = { runs: teamARuns, isWicket: false }
  innings[1].balls[0] = { runs: teamBRuns, isWicket: false }

  useMatchStore.setState({
    innings,
    currentInnings: 1,
    currentBallIndex: 6,
    phase: 'result',
  })
}

beforeEach(() => {
  useMatchStore.getState().newMatch()
  jest.clearAllMocks()
})

describe('ResultScreen', () => {
  test('28. shows winner by wickets when team B wins', () => {
    setupCompletedMatch({ teamARuns: 50, teamAWickets: 5, teamBRuns: 60, teamBWickets: 4 })
    render(<ResultScreen navigation={mockNavigation as any} route={{} as any} />)
    expect(screen.getByText(/Australia won by \d+ wickets/)).toBeTruthy()
  })

  test('29. shows winner by runs when team A wins', () => {
    setupCompletedMatch({ teamARuns: 80, teamAWickets: 3, teamBRuns: 60, teamBWickets: 4 })
    render(<ResultScreen navigation={mockNavigation as any} route={{} as any} />)
    expect(screen.getByText(/India won by \d+ runs/)).toBeTruthy()
  })

  test('30. shows "Match Tied!" when scores are equal', () => {
    setupCompletedMatch({ teamARuns: 50, teamAWickets: 0, teamBRuns: 50, teamBWickets: 0 })
    render(<ResultScreen navigation={mockNavigation as any} route={{} as any} />)
    expect(screen.getByText('Match Tied!')).toBeTruthy()
  })

  test('31. New Match button calls newMatch and navigates to Setup', () => {
    setupCompletedMatch({ teamARuns: 50, teamAWickets: 0, teamBRuns: 60, teamBWickets: 0 })
    render(<ResultScreen navigation={mockNavigation as any} route={{} as any} />)
    fireEvent.press(screen.getByText('New Match'))
    expect(useMatchStore.getState().phase).toBe('setup')
    expect(mockNavigation.replace).toHaveBeenCalledWith('Setup')
  })
})

// Integration: Full match flow test
describe('Full match flow (27)', () => {
  test('27. setup → score → inningsOver → score 2nd → result', () => {
    const getStore = () => useMatchStore.getState()
    getStore().newMatch()

    // Setup match
    getStore().setupMatch({ teamA: 'India', teamB: 'Australia', overs: 1, playersPerTeam: 11 })
    expect(getStore().phase).toBe('scoring')
    expect(getStore().innings[0].balls.length).toBe(6)

    // Score 1st innings: 3 runs across 6 balls
    getStore().setBallRuns(0, 1) // cursor → 1
    getStore().setBallRuns(1, 1) // cursor → 2
    getStore().setBallRuns(2, 1) // cursor → 3
    for (let i = 3; i < 6; i++) getStore().confirmDotBall()
    expect(getStore().phase).toBe('inningsOver')

    // Advance innings
    getStore().advanceInnings()
    expect(getStore().currentInnings).toBe(1)
    expect(getStore().phase).toBe('scoring')

    // Score 2nd innings — chase 4 to win
    getStore().setBallRuns(0, 4) // 4 runs >= target(4) → result
    expect(getStore().phase).toBe('result')
  })
})