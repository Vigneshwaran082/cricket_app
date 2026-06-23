import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'

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

import { useMatchStore } from '../../src/store/matchStore'
import { MatchSetupScreen } from '../../src/screens/MatchSetupScreen'

const mockNavigation = { replace: jest.fn(), navigate: jest.fn() }

beforeEach(() => {
  useMatchStore.getState().newMatch()
  jest.clearAllMocks()
})

describe('MatchSetupScreen', () => {
  test('24. shows error alert when overs is 0', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    render(<MatchSetupScreen navigation={mockNavigation as any} route={{} as any} />)

    // Change overs to 0
    fireEvent.press(screen.getByText('6'))
    fireEvent.changeText(screen.getByDisplayValue('6'), '0')
    fireEvent(screen.getByDisplayValue('0'), 'submitEditing')

    fireEvent.press(screen.getByText('Start Match →'))
    expect(alertSpy).toHaveBeenCalledWith('Invalid Overs', expect.any(String))
    expect(mockNavigation.replace).not.toHaveBeenCalled()
  })

  test('25. shows error alert when players < 2', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    render(<MatchSetupScreen navigation={mockNavigation as any} route={{} as any} />)

    fireEvent.press(screen.getByText('7'))
    fireEvent.changeText(screen.getByDisplayValue('7'), '1')
    fireEvent(screen.getByDisplayValue('1'), 'submitEditing')

    fireEvent.press(screen.getByText('Start Match →'))
    expect(alertSpy).toHaveBeenCalledWith('Invalid Players', expect.any(String))
    expect(mockNavigation.replace).not.toHaveBeenCalled()
  })

  test('26. calls setupMatch and navigates to Scoring on valid input', () => {
    render(<MatchSetupScreen navigation={mockNavigation as any} route={{} as any} />)
    fireEvent.press(screen.getByText('Start Match →'))
    expect(useMatchStore.getState().phase).toBe('scoring')
    expect(mockNavigation.replace).toHaveBeenCalledWith('Scoring')
  })
})