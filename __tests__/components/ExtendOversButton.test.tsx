import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
}))

import { useMatchStore } from '../../src/store/matchStore'
import { ExtendOversButton } from '../../src/components/ExtendOversButton'

const DEFAULT_PARAMS = { teamA: 'India', teamB: 'Australia', overs: 3, playersPerTeam: 7 }

beforeEach(() => {
  useMatchStore.getState().newMatch()
  useMatchStore.getState().setupMatch(DEFAULT_PARAMS)
})

describe('ExtendOversButton', () => {
  test('opens the Add More Overs modal when the "+" button is pressed', () => {
    render(<ExtendOversButton />)
    expect(screen.queryByText('Add More Overs')).toBeNull()
    fireEvent.press(screen.getByLabelText('Extend Overs'))
    expect(screen.getByText('Add More Overs')).toBeTruthy()
  })

  test('confirming extends the overs in the store', () => {
    render(<ExtendOversButton />)
    fireEvent.press(screen.getByLabelText('Extend Overs'))
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 2'), '2')
    fireEvent.press(screen.getByText('Confirm'))
    expect(useMatchStore.getState().overs).toBe(5)
  })

  test('calls onExtended callback after a successful extend', () => {
    const onExtended = jest.fn()
    render(<ExtendOversButton onExtended={onExtended} />)
    fireEvent.press(screen.getByLabelText('Extend Overs'))
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 2'), '1')
    fireEvent.press(screen.getByText('Confirm'))
    expect(onExtended).toHaveBeenCalled()
  })

  test('closes the modal without changing overs when Cancel is pressed', () => {
    render(<ExtendOversButton />)
    fireEvent.press(screen.getByLabelText('Extend Overs'))
    fireEvent.press(screen.getByText('Cancel'))
    expect(screen.queryByText('Add More Overs')).toBeNull()
    expect(useMatchStore.getState().overs).toBe(3)
  })

  test('does not call onExtended for invalid input', () => {
    const onExtended = jest.fn()
    render(<ExtendOversButton onExtended={onExtended} />)
    fireEvent.press(screen.getByLabelText('Extend Overs'))
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 2'), '0')
    fireEvent.press(screen.getByText('Confirm'))
    expect(onExtended).not.toHaveBeenCalled()
    expect(useMatchStore.getState().overs).toBe(3)
  })
})
