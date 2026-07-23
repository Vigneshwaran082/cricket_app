import * as Speech from 'expo-speech'
import { useMatchStore } from '../../src/store/matchStore'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
}))

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}))

const mockSpeak = Speech.speak as jest.Mock

const DEFAULT_PARAMS = { teamA: 'India', teamB: 'Australia', overs: 3, playersPerTeam: 7 }

const store = () => useMatchStore.getState()

beforeEach(() => {
  store().newMatch()
  mockSpeak.mockClear()
})

// ─── setupMatch ────────────────────────────────────────────────────────────

describe('setupMatch', () => {
  test('1. creates correct number of balls (overs * 6)', () => {
    store().setupMatch(DEFAULT_PARAMS)
    expect(store().innings[0].balls.length).toBe(18)
    expect(store().innings[1].balls.length).toBe(18)
  })

  test('2. sets phase to scoring', () => {
    store().setupMatch(DEFAULT_PARAMS)
    expect(store().phase).toBe('scoring')
  })

  test('initializes with 6 overs by default after newMatch', () => {
    expect(store().phase).toBe('setup')
    expect(store().overs).toBe(6)
  })
})

// ─── setBallRuns ───────────────────────────────────────────────────────────

describe('setBallRuns', () => {
  beforeEach(() => { store().setupMatch(DEFAULT_PARAMS) })

  test('3. updates the correct ball runs', () => {
    store().setBallRuns(0, 4)
    expect(store().innings[0].balls[0].runs).toBe(4)
  })

  test('4. advances cursor when updating current ball', () => {
    expect(store().currentBallIndex).toBe(0)
    store().setBallRuns(0, 2)
    expect(store().currentBallIndex).toBe(1)
  })

  test('does not advance cursor when updating a past ball', () => {
    store().confirmDotBall() // cursor → 1
    store().setBallRuns(0, 6) // editing past ball
    expect(store().currentBallIndex).toBe(1) // unchanged
  })
})

// ─── toggleWicket ──────────────────────────────────────────────────────────

describe('toggleWicket', () => {
  beforeEach(() => { store().setupMatch(DEFAULT_PARAMS) })

  test('5. flips isWicket and increments wicket count', () => {
    store().toggleWicket(0)
    expect(store().innings[0].balls[0].isWicket).toBe(true)
    expect(store().innings[0].wickets).toBe(1)
  })

  test('flips back off on double toggle', () => {
    store().toggleWicket(0)
    store().setBallRuns(0, 0) // advance past ball 0
    store().toggleWicket(0) // re-edit past ball
    expect(store().innings[0].balls[0].isWicket).toBe(false)
    expect(store().innings[0].wickets).toBe(0)
  })

  test('advances cursor when toggling current ball', () => {
    store().toggleWicket(0)
    expect(store().currentBallIndex).toBe(1)
  })
})

// ─── confirmDotBall ────────────────────────────────────────────────────────

describe('confirmDotBall', () => {
  beforeEach(() => { store().setupMatch(DEFAULT_PARAMS) })

  test('6. advances cursor without changing runs', () => {
    store().confirmDotBall()
    expect(store().currentBallIndex).toBe(1)
    expect(store().innings[0].balls[0].runs).toBe(0)
  })
})

// ─── undoLastBall ──────────────────────────────────────────────────────────

describe('undoLastBall', () => {
  beforeEach(() => { store().setupMatch(DEFAULT_PARAMS) })

  test('7. decrements cursor and resets that ball to default', () => {
    store().setBallRuns(0, 6) // cursor → 1, ball[0]=6
    store().undoLastBall()
    expect(store().currentBallIndex).toBe(0)
    expect(store().innings[0].balls[0].runs).toBe(0)
    expect(store().innings[0].balls[0].isWicket).toBe(false)
  })

  test('does nothing when cursor is already 0', () => {
    store().undoLastBall()
    expect(store().currentBallIndex).toBe(0)
  })

  test('recomputes wickets after undo', () => {
    store().toggleWicket(0) // wicket on ball 0, cursor → 1
    expect(store().innings[0].wickets).toBe(1)
    store().undoLastBall()
    expect(store().innings[0].wickets).toBe(0)
  })
})

// ─── Auto innings end ──────────────────────────────────────────────────────

describe('auto innings end', () => {
  test('8. phase becomes inningsOver when all balls bowled', () => {
    store().setupMatch({ teamA: 'A', teamB: 'B', overs: 1, playersPerTeam: 7 })
    // Bowl all 6 balls of 1 over
    for (let i = 0; i < 6; i++) {
      store().confirmDotBall()
    }
    expect(store().phase).toBe('inningsOver')
  })

  test('9. phase becomes inningsOver when all out (default minBatsmen=1 => innings ends at 3 wickets for 3 players)', () => {
    store().setupMatch({ teamA: 'A', teamB: 'B', overs: 5, playersPerTeam: 3 })
    // With default minBatsmen=1, innings ends at 3 wickets
    store().toggleWicket(0) // wicket on ball 0, cursor → 1
    store().toggleWicket(1) // wicket on ball 1, cursor → 2
    store().toggleWicket(2) // wicket on ball 2, cursor → 3
    expect(store().phase).toBe('inningsOver')
  })

  test('9b. phase becomes inningsOver when minBatsmen=2 (standard rule: innings ends at playersPerTeam - 1 wickets)', () => {
    store().setupMatch({ teamA: 'A', teamB: 'B', overs: 5, playersPerTeam: 3, minBatsmen: 2 })
    // minBatsmen=2 -> innings ends at 2 wickets for 3 players
    store().toggleWicket(0)
    store().toggleWicket(1)
    expect(store().phase).toBe('inningsOver')
  })
})

// ─── 2nd innings chase ─────────────────────────────────────────────────────

describe('2nd innings chase', () => {
  test('10. phase becomes result when totalRuns >= target mid-over', () => {
    store().setupMatch({ teamA: 'A', teamB: 'B', overs: 5, playersPerTeam: 7 })
    // Bowl first innings: 10 runs total
    for (let i = 0; i < 5; i++) {
      store().setBallRuns(i, 2) // 2 each = 10 runs
    }
    for (let i = 5; i < 30; i++) {
      store().confirmDotBall()
    }
    expect(store().phase).toBe('inningsOver')

    store().advanceInnings()
    // Target = 11. Score a 6 to win immediately
    store().setBallRuns(0, 6) // totalRuns=6
    expect(store().phase).toBe('scoring')
    store().setBallRuns(1, 6) // totalRuns=12 >= 11 → result
    expect(store().phase).toBe('result')
  })
})

// ─── advanceInnings ────────────────────────────────────────────────────────

describe('advanceInnings', () => {
  test('11. sets currentInnings to 1 and resets cursor', () => {
    store().setupMatch(DEFAULT_PARAMS)
    store().advanceInnings()
    expect(store().currentInnings).toBe(1)
    expect(store().currentBallIndex).toBe(0)
    expect(store().phase).toBe('scoring')
  })
})

// ─── newMatch ──────────────────────────────────────────────────────────────

describe('newMatch', () => {
  test('12. resets everything to initial defaults', () => {
    store().setupMatch(DEFAULT_PARAMS)
    store().setBallRuns(0, 6)
    store().newMatch()
    const s = store()
    expect(s.phase).toBe('setup')
    expect(s.teamA).toBe('Team A')
    expect(s.teamB).toBe('Team B')
    expect(s.overs).toBe(6)
    expect(s.playersPerTeam).toBe(7)
    expect(s.currentBallIndex).toBe(0)
    expect(s.currentInnings).toBe(0)
    expect(s.innings[0].balls.length).toBe(36)
    expect(s.innings[0].balls.every(b => b.runs === 0 && !b.isWicket)).toBe(true)
  })
})

// ─── Derived selectors ─────────────────────────────────────────────────────

describe('derived selectors', () => {
  beforeEach(() => {
    store().setupMatch(DEFAULT_PARAMS) // 3 overs = 18 balls
  })

  test('13a. totalRuns computes sum of bowled balls only', () => {
    store().setBallRuns(0, 4) // cursor→1
    store().setBallRuns(1, 6) // cursor→2
    store().setBallRuns(2, 2) // cursor→3
    expect(store().totalRuns()).toBe(12)
  })

  test('13b. totalWickets counts wickets of bowled balls only', () => {
    store().toggleWicket(0) // cursor→1
    store().toggleWicket(1) // cursor→2
    expect(store().totalWickets()).toBe(2)
  })

  test('13c. oversBowled formats as "overs.balls"', () => {
    expect(store().oversBowled()).toBe('0.0')
    store().confirmDotBall() // cursor→1
    expect(store().oversBowled()).toBe('0.1')
    // Bowl a full over (6 balls)
    for (let i = 0; i < 5; i++) store().confirmDotBall()
    expect(store().oversBowled()).toBe('1.0')
    store().confirmDotBall()
    expect(store().oversBowled()).toBe('1.1')
  })

  test('target returns 0 in 1st innings', () => {
    expect(store().target()).toBe(0)
  })

  test('target returns 1st innings total + 1 in 2nd innings', () => {
    // Score 20 in 1st innings then end it
    store().setBallRuns(0, 6)
    store().setBallRuns(1, 6)
    store().setBallRuns(2, 4)
    store().setBallRuns(3, 4)
    for (let i = 4; i < 18; i++) store().confirmDotBall()
    store().advanceInnings()
    expect(store().target()).toBe(21)
  })
})

// ─── Voice announcements ───────────────────────────────────────────────────

describe('voice announcements', () => {
  beforeEach(() => {
    store().setupMatch({ ...DEFAULT_PARAMS, voiceAnnouncement: true })
  })

  test('setBallRuns speaks the recorded run count for the current ball', () => {
    store().setBallRuns(0, 4)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 1, Four!',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('setBallRuns speaks using the ball index, not the advanced cursor', () => {
    store().setBallRuns(0, 1) // cursor→1
    store().setBallRuns(1, 2) // ball index 1 -> Over 1, Ball 2
    expect(mockSpeak).toHaveBeenLastCalledWith(
      'Over 1, Ball 2, 2 runs',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('confirmDotBall speaks "No run"', () => {
    store().confirmDotBall()
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 1, No run',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('toggleWicket speaks "Wicket!" when marking a wicket', () => {
    store().toggleWicket(0)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 1, Wicket!',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('toggleWicket off announces the underlying run value again', () => {
    store().toggleWicket(0) // mark wicket, cursor→1
    mockSpeak.mockClear()
    store().toggleWicket(0) // unmark wicket on a past ball
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 1, Ball 1, No run',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('announces correct over number after crossing into a new over', () => {
    for (let i = 0; i < 6; i++) store().confirmDotBall() // fills over 1, cursor→6
    mockSpeak.mockClear()
    store().setBallRuns(6, 6)
    expect(mockSpeak).toHaveBeenCalledWith(
      'Over 2, Ball 1, Six!',
      { language: 'en-IN', rate: 0.9 }
    )
  })

  test('speaks exactly once per ball action', () => {
    store().setBallRuns(0, 2)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })
})

// ─── voiceAnnouncement setting ─────────────────────────────────────────────

describe('voiceAnnouncement setting', () => {
  test('defaults to OFF after newMatch', () => {
    expect(store().voiceAnnouncement).toBe(false)
  })

  test('defaults to OFF when setupMatch is called without the flag', () => {
    store().setupMatch(DEFAULT_PARAMS)
    expect(store().voiceAnnouncement).toBe(false)
  })

  test('setupMatch stores voiceAnnouncement true when provided', () => {
    store().setupMatch({ ...DEFAULT_PARAMS, voiceAnnouncement: true })
    expect(store().voiceAnnouncement).toBe(true)
  })

  test('does not speak when voiceAnnouncement is OFF', () => {
    store().setupMatch(DEFAULT_PARAMS) // OFF by default
    store().setBallRuns(0, 4)
    store().toggleWicket(1)
    store().confirmDotBall()
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  test('speaks when voiceAnnouncement is ON', () => {
    store().setupMatch({ ...DEFAULT_PARAMS, voiceAnnouncement: true })
    store().setBallRuns(0, 4)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })

  test('setVoiceAnnouncement toggles the setting at runtime', () => {
    store().setupMatch(DEFAULT_PARAMS)
    store().setVoiceAnnouncement(true)
    expect(store().voiceAnnouncement).toBe(true)
    store().setBallRuns(0, 3)
    expect(mockSpeak).toHaveBeenCalledTimes(1)

    mockSpeak.mockClear()
    store().setVoiceAnnouncement(false)
    store().setBallRuns(1, 2)
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  test('newMatch resets voiceAnnouncement back to OFF', () => {
    store().setupMatch({ ...DEFAULT_PARAMS, voiceAnnouncement: true })
    expect(store().voiceAnnouncement).toBe(true)
    store().newMatch()
    expect(store().voiceAnnouncement).toBe(false)
  })
})
