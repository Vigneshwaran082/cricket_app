import React from 'react'
import { render, screen } from '@testing-library/react-native'

// Mock the store before importing ScoreBar
jest.mock('../../src/store/matchStore', () => ({
  useMatchStore: (selector: (s: any) => any) =>
    selector({
      teamA: 'India',
      teamB: 'Australia',
      currentInnings: 0,
      currentBallIndex: 7,
      overs: 3,
      playersPerTeam: 7,
      totalRuns: () => 45,
      totalWickets: () => 3,
      oversBowled: () => '1.1',
      ballsRemaining: () => 11,
      batsmenRemaining: () => 4,
      target: () => 0,
    }),
}))

import { ScoreBar } from '../../src/components/ScoreBar'

describe('ScoreBar', () => {
  test('22. displays team name, score, and overs correctly', () => {
    render(<ScoreBar />)
    expect(screen.getByText('India')).toBeTruthy()
    expect(screen.getByText('45/3')).toBeTruthy()
    expect(screen.getByText('(1.1)')).toBeTruthy()
  })

  test('shows over info line with correct over number', () => {
    render(<ScoreBar />)
    // currentBallIndex=7 → Over 2 of 3
    expect(screen.getByText(/Over 2 of 3/)).toBeTruthy()
  })

  test('does not show chase info in 1st innings', () => {
    render(<ScoreBar />)
    expect(screen.queryByText(/Target/)).toBeNull()
  })

  test('renders home button when onHomePress is provided', () => {
    render(<ScoreBar onHomePress={jest.fn()} />)
    expect(screen.getByText('🏠')).toBeTruthy()
  })
})
