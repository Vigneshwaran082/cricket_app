import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react-native'
import { BallCell } from '../../src/components/BallCell'

jest.useFakeTimers()

const defaultProps = {
  index: 0,
  ballNumberInOver: 1,
  isBowled: false,
  isCurrent: false,
  onTap: jest.fn(),
  onDoubleTap: jest.fn(),
}

afterEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})

describe('BallCell', () => {
  test('14. renders dot ball as "•"', () => {
    render(
      <BallCell
        {...defaultProps}
        ball={{ runs: 0, isWicket: false }}
        isBowled
      />
    )
    expect(screen.getByText('•')).toBeTruthy()
  })

  test('15. renders run number correctly for runs 1-6', () => {
    for (const runs of [1, 2, 3, 4, 5, 6]) {
      const { unmount } = render(
        <BallCell
          {...defaultProps}
          ball={{ runs, isWicket: false }}
          isBowled
        />
      )
      expect(screen.getByText(String(runs))).toBeTruthy()
      unmount()
    }
  })

  test('16. renders "W" for wicket ball', () => {
    render(
      <BallCell
        {...defaultProps}
        ball={{ runs: 0, isWicket: true }}
        isBowled
      />
    )
    expect(screen.getByText('W')).toBeTruthy()
  })

  test('17. shows ball number within over (ballNumberInOver) for current ball', () => {
    render(
      <BallCell
        {...defaultProps}
        ball={{ runs: 0, isWicket: false }}
        index={4}
        ballNumberInOver={5}
        isCurrent
      />
    )
    expect(screen.getByText('5')).toBeTruthy()
  })

  test('18. future ball does not fire onTap', () => {
    const onTap = jest.fn()
    render(
      <BallCell
        {...defaultProps}
        ball={{ runs: 0, isWicket: false }}
        isBowled={false}
        isCurrent={false}
        onTap={onTap}
      />
    )
    // Pressable is disabled for future balls; pressing it should not call onTap
    fireEvent.press(screen.getByText('1')) // the label is index+1 = 1
    act(() => { jest.runAllTimers() })
    expect(onTap).not.toHaveBeenCalled()
  })

  test('single tap on current ball calls onTap after 300ms', () => {
    const onTap = jest.fn()
    render(
      <BallCell
        {...defaultProps}
        ball={{ runs: 0, isWicket: false }}
        isCurrent
        onTap={onTap}
      />
    )
    fireEvent.press(screen.getByText('1'))
    expect(onTap).not.toHaveBeenCalled()
    act(() => { jest.advanceTimersByTime(301) })
    expect(onTap).toHaveBeenCalledTimes(1)
  })
})