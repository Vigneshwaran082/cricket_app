import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ExtendOversModal } from '../../src/components/ExtendOversModal'

const defaultProps = {
  visible: true,
  onConfirm: jest.fn(),
  onClose: jest.fn(),
}

afterEach(() => jest.clearAllMocks())

describe('ExtendOversModal', () => {
  test('renders the title and input when visible', () => {
    render(<ExtendOversModal {...defaultProps} />)
    expect(screen.getByText('Add More Overs')).toBeTruthy()
    expect(screen.getByPlaceholderText('e.g. 2')).toBeTruthy()
  })

  test('calls onConfirm with the entered positive number of overs', () => {
    render(<ExtendOversModal {...defaultProps} />)
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 2'), '3')
    fireEvent.press(screen.getByText('Confirm'))
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(3)
  })

  test('shows a validation error and does not confirm when input is empty', () => {
    render(<ExtendOversModal {...defaultProps} />)
    fireEvent.press(screen.getByText('Confirm'))
    expect(screen.getByText('Enter a positive number of overs')).toBeTruthy()
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  test('shows a validation error and does not confirm when input is zero', () => {
    render(<ExtendOversModal {...defaultProps} />)
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 2'), '0')
    fireEvent.press(screen.getByText('Confirm'))
    expect(screen.getByText('Enter a positive number of overs')).toBeTruthy()
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  test('shows a validation error and does not confirm when input is negative', () => {
    render(<ExtendOversModal {...defaultProps} />)
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 2'), '-5')
    fireEvent.press(screen.getByText('Confirm'))
    expect(screen.getByText('Enter a positive number of overs')).toBeTruthy()
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  test('calls onClose when Cancel is pressed', () => {
    render(<ExtendOversModal {...defaultProps} />)
    fireEvent.press(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
