import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { EditableField } from '../../src/components/EditableField'

describe('EditableField', () => {
  test('23. renders label and value in display mode', () => {
    render(<EditableField label="Overs" value="6" onSave={jest.fn()} />)
    expect(screen.getByText('Overs')).toBeTruthy()
    expect(screen.getByText('6')).toBeTruthy()
  })

  test('switches to edit mode when tapped', () => {
    render(<EditableField label="Overs" value="6" onSave={jest.fn()} />)
    const displayRow = screen.getByText('6')
    fireEvent.press(displayRow)
    // After press, a TextInput should be present
    expect(screen.getByDisplayValue('6')).toBeTruthy()
  })

  test('calls onSave with new value on submit', () => {
    const onSave = jest.fn()
    render(<EditableField label="Overs" value="6" onSave={onSave} />)
    fireEvent.press(screen.getByText('6'))
    fireEvent.changeText(screen.getByDisplayValue('6'), '10')
    fireEvent(screen.getByDisplayValue('10'), 'submitEditing')
    expect(onSave).toHaveBeenCalledWith('10')
  })
})