import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { NumberPad } from '../../src/components/NumberPad'

const defaultProps = {
  visible: true,
  onSelect: jest.fn(),
  onWicket: jest.fn(),
  onClose: jest.fn(),
}

afterEach(() => jest.clearAllMocks())

describe('NumberPad', () => {
  test('19. calls onSelect with correct run value when number tapped', () => {
    render(<NumberPad {...defaultProps} />)
    fireEvent.press(screen.getByText('4'))
    expect(defaultProps.onSelect).toHaveBeenCalledWith(4)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  test('calls onSelect(0) for dot ball', () => {
    render(<NumberPad {...defaultProps} />)
    fireEvent.press(screen.getByText('0'))
    expect(defaultProps.onSelect).toHaveBeenCalledWith(0)
  })

  test('calls onSelect with each run value 1-6 correctly', () => {
    const onSelect = jest.fn()
    const { unmount } = render(<NumberPad {...defaultProps} onSelect={onSelect} />)
    for (const runs of [1, 2, 3, 6]) {
      fireEvent.press(screen.getByText(String(runs)))
      expect(onSelect).toHaveBeenLastCalledWith(runs)
    }
    unmount()
  })

  test('20. calls onWicket when W is tapped', () => {
    render(<NumberPad {...defaultProps} />)
    fireEvent.press(screen.getByText('W'))
    expect(defaultProps.onWicket).toHaveBeenCalledTimes(1)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  test('21. shows title and renders all 8 buttons (0-6, W)', () => {
    render(<NumberPad {...defaultProps} />)
    expect(screen.getByText('Runs for this ball')).toBeTruthy()
    for (const label of ['0', '1', '2', '3', '4', '5', '6', 'W']) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })
})