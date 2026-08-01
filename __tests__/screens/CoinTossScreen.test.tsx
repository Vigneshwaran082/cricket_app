import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react-native'

jest.mock('react-native-safe-area-context', () => {
  const mockView = require('react-native').View
  return {
    SafeAreaView: mockView,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  }
})

import { CoinTossScreen } from '../../src/screens/CoinTossScreen'

const mockNavigation = { replace: jest.fn(), navigate: jest.fn(), goBack: jest.fn() }

// Coin flip uses Animated.timing sequences (800ms total) — advance fake timers
// past the animation so the result becomes available synchronously in tests.
const flipCoin = () => {
  fireEvent.press(screen.getByTestId('coin-toss-touchable'))
  act(() => {
    jest.advanceTimersByTime(1000)
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('CoinTossScreen', () => {
  test('shows hint text before first toss', () => {
    render(<CoinTossScreen navigation={mockNavigation as any} route={{} as any} />)
    expect(screen.getByText('Tap coin to toss')).toBeTruthy()
  })

  test('does not show a result before tossing', () => {
    render(<CoinTossScreen navigation={mockNavigation as any} route={{} as any} />)
    expect(screen.queryByText('HEADS')).toBeNull()
    expect(screen.queryByText('TAILS')).toBeNull()
  })

  test('tapping the coin shows a result of HEADS or TAILS after animation completes', () => {
    render(<CoinTossScreen navigation={mockNavigation as any} route={{} as any} />)
    flipCoin()
    const result = screen.queryByText('HEADS') ?? screen.queryByText('TAILS')
    expect(result).toBeTruthy()
  })

  test('hint text is hidden after the first toss', () => {
    render(<CoinTossScreen navigation={mockNavigation as any} route={{} as any} />)
    flipCoin()
    expect(screen.queryByText('Tap coin to toss')).toBeNull()
  })

  test('tapping the coin again re-tosses and always yields a result', () => {
    render(<CoinTossScreen navigation={mockNavigation as any} route={{} as any} />)
    flipCoin()
    flipCoin()
    const result = screen.queryByText('HEADS') ?? screen.queryByText('TAILS')
    expect(result).toBeTruthy()
  })

  test('Back button navigates back to the home screen', () => {
    render(<CoinTossScreen navigation={mockNavigation as any} route={{} as any} />)
    fireEvent.press(screen.getByText('Back'))
    expect(mockNavigation.goBack).toHaveBeenCalled()
  })

  test('there is no "Toss again" button', () => {
    render(<CoinTossScreen navigation={mockNavigation as any} route={{} as any} />)
    flipCoin()
    expect(screen.queryByText('Toss again')).toBeNull()
  })
})
