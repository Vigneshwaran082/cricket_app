# Cricket Scoring App — Project Skill

## Tech Stack
- React Native + Expo SDK 54 (managed workflow, Expo Go compatible)
- TypeScript (strict)
- Zustand (state management) + persist middleware
- AsyncStorage (local persistence)
- @react-navigation/native-stack (navigation)
- NO Expo Router — use React Navigation only
- Entry point: App.tsx (not src/app/)

## Folder Structure
```
src/
  store/
    matchStore.ts        # Zustand store — single source of truth
  screens/
    MatchSetupScreen.tsx
    ScoringScreen.tsx
    InningsOverScreen.tsx
    ResultScreen.tsx
  components/
    BallCell.tsx          # Single ball in the grid
    NumberPad.tsx          # Bottom sheet for run selection
    ScoreBar.tsx           # Top score summary bar
    EditableField.tsx      # Tap-to-edit input field
  theme.ts                # Colors, spacing, typography
  types.ts                # Shared TypeScript types
App.tsx                    # Navigation container
```

## Key Rules
- **No derived state in store.** Totals, wickets, overs bowled — all computed from `balls[]` array via selectors.
- **Single match only.** No match history, no multi-match.
- **Two innings max.** `innings[0]` and `innings[1]`.
- **All balls pre-filled.** Grid has `overs * 6` entries from start, default `{ runs: 0, isWicket: false }`.
- **No wide/no-ball.** Only runs 0–6 and wicket.
- **Hit targets ≥ 44px.** Every tappable element.
- **Persist everything.** Zustand persist middleware + AsyncStorage adapter. Match survives restart.

## Navigation Flow
```
MatchSetupScreen → ScoringScreen → InningsOverScreen → ScoringScreen (2nd) → ResultScreen
                                                                                 ↓
                                                                          MatchSetupScreen
```

## Phase State Machine
```
setup → scoring → inningsOver → scoring (2nd innings) → result
                                                           ↓
                                                         setup (new match)
```
# Store Skill — Zustand Match Store

## Store File
`src/store/matchStore.ts`

## Types
```typescript
type BallEntry = { runs: number; isWicket: boolean }
type Innings = { balls: BallEntry[]; wickets: number }
type Phase = 'setup' | 'scoring' | 'inningsOver' | 'result'
```

## State Shape
```typescript
{
  teamA: string              // default "Team A"
  teamB: string              // default "Team B"
  overs: number              // default 6
  playersPerTeam: number     // default 7
  innings: [Innings, Innings]
  currentInnings: 0 | 1
  currentBallIndex: number   // cursor — which ball is being bowled NOW
  phase: Phase
}
```

## Ball Default
All balls start as `{ runs: 0, isWicket: false }`.
- `runs: 0` = dot ball. No need to tap for dot balls.
- `currentBallIndex` tracks progress. Balls before cursor = already bowled. Balls at/after cursor = not yet bowled.

## Actions
| Action | What it does |
|--------|-------------|
| `setupMatch({teamA, teamB, overs, playersPerTeam})` | Init both innings with `overs*6` balls (all 0s), `currentBallIndex=0`, phase='scoring' |
| `setBallRuns(index, runs)` | Set `innings[current].balls[index].runs = runs`. If `index === currentBallIndex`, advance cursor. |
| `toggleWicket(index)` | Flip `isWicket` on that ball; recompute wickets. If `index === currentBallIndex`, advance cursor. |
| `confirmDotBall()` | Ball stays 0, just advance `currentBallIndex` by 1. This is the "Next Ball →" action. |
| `undoLastBall()` | Decrement `currentBallIndex` by 1, reset that ball to `{runs:0, isWicket:false}`, recompute wickets |
| `advanceInnings()` | Set `currentInnings=1`, `currentBallIndex=0`, phase='scoring' |
| `newMatch()` | Reset everything to initial state, phase='setup' |

## Cursor Rules
- `currentBallIndex` starts at 0, increments after each ball is confirmed
- Editing a PAST ball (index < currentBallIndex): allowed via tap → NumberPad, but does NOT move cursor
- Editing the CURRENT ball (index === currentBallIndex): sets value AND advances cursor
- Tapping a FUTURE ball (index > currentBallIndex): ignored / not allowed

## Derived Selectors (compute from balls[] + cursor, never store totals)
```typescript
// Only count balls[0..currentBallIndex-1] — the bowled balls
totalRuns(innings, cursor)      → sum of balls[0..cursor-1].runs
totalWickets(innings, cursor)   → count of balls[0..cursor-1].isWicket === true
oversBowled(cursor)             → `${Math.floor(cursor/6)}.${cursor%6}`
ballsRemaining(cursor, total)   → totalBalls - cursor
batsmenRemaining                → playersPerTeam - 1 - wickets
target                          → innings[0] totalRuns + 1 (only during 2nd innings)
```

## Auto-Detection Rules
After every cursor advance, check:
1. **All out**: `wickets === playersPerTeam - 1` → innings over
2. **All balls bowled**: `currentBallIndex === overs * 6` → innings over
3. **Chase won** (2nd innings only): `totalRuns >= target` → innings over
4. After 1st innings end → phase = 'inningsOver'
5. After 2nd innings end → phase = 'result'

## Persistence
```typescript
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

create(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'cricket-match-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

## Critical: Undo Logic
`undoLastBall()`: decrement `currentBallIndex`, then reset `balls[newCursorIndex]` to `{runs:0, isWicket:false}`. Recompute wickets from balls[0..newCursor-1].
# Component & Theme Skill

## Theme (`src/theme.ts`)
```typescript
export const COLORS = {
  primary: '#1f8a5b',       // green — headers, buttons, accents
  background: '#f5f5f5',    // light gray page bg
  card: '#ffffff',           // white card bg
  text: '#1a1a1a',          // dark text
  textLight: '#666666',     // secondary text
  run4: '#2a6fdb',          // blue
  run5: '#7a3fb0',          // purple (overthrow)
  run6: '#f08c3a',          // orange
  wicket: '#c0392b',        // red
  undo: '#f1c40f',          // yellow
  border: '#e0e0e0',
}

export const RADIUS = 12
export const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
}
```

## Components

### BallCell (`src/components/BallCell.tsx`)
- Props: `{ ball: BallEntry, index: number, isBowled: boolean, isCurrent: boolean, onTap: () => void, onDoubleTap: () => void }`
- Size: 48x48 minimum (hit target rule)
- **3 visual states:**
  - `isCurrent` (index === cursor): highlighted border (green), slightly larger or glowing — this is the ball being bowled now
  - `isBowled` (index < cursor): solid bg, shows run number or "W"
  - Future (index > cursor): dimmed/gray, not tappable
- Color-code bowled balls: 0=dot (gray text), 1-3=dark text, 4=blue, 5=purple, 6=orange, W=red bg+white text
- Tap: only works for current ball or past bowled balls
- Double tap on bowled/current ball → toggleWicket

### NumberPad (`src/components/NumberPad.tsx`)
- Bottom sheet / modal that slides up
- Title: "Runs for this ball"
- 4-column grid: [0, 1, 2, 3] [4, 5, 6, W]
- Color-code 4/5/6/W buttons matching theme
- Dismiss: tap outside OR swipe down (no cancel button)
- On select: call `setBallRuns(index, runs)` or `toggleWicket(index)` for W, then close

### ScoreBar (`src/components/ScoreBar.tsx`)
- Props: computed from store selectors
- Green background, white text
- Line 1: "Team A  45/3" + "(4.2)" overs
- Line 2: "Over 5 of 6 · 8 balls left · 4/7 batsmen"
- During chase: also show "Target: 69 · Need 24 from 12 balls"

### EditableField (`src/components/EditableField.tsx`)
- Props: `{ label, value, onSave, keyboardType? }`
- Display mode: shows label + value, tap to edit
- Edit mode: TextInput with green accent, auto-focus
- Save on blur or enter

## Styling Rules
- All cards: white bg, radius 12-16, soft shadow
- Buttons: radius 12, min height 48
- No inline styles — use StyleSheet.create()
- Font sizes: header 20-24, body 16, caption 12-14
# Screen & Navigation Skill

## Navigation Setup
- Library: `@react-navigation/native-stack`
- Stack screens: Setup, Scoring, InningsOver, Result
- No back gesture on ScoringScreen (prevent accidental exit)
- Header hidden on all screens (custom headers inside each screen)

```typescript
// App.tsx pattern
const Stack = createNativeStackNavigator()
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Setup" component={MatchSetupScreen} />
  <Stack.Screen name="Scoring" component={ScoringScreen} options={{ gestureEnabled: false }} />
  <Stack.Screen name="InningsOver" component={InningsOverScreen} />
  <Stack.Screen name="Result" component={ResultScreen} />
</Stack.Navigator>
```

## Screen Details

### MatchSetupScreen
- Green header banner: "🏏 New Match"
- 4 EditableFields: Team 1 name, Team 2 name, Overs, Players per team
- Defaults: "Team A", "Team B", 6, 7
- Validate: overs > 0, players >= 2
- Button: "Start Match →" → calls `setupMatch()` → `navigation.replace('Scoring')`

### ScoringScreen
- Top: ScoreBar component (fixed, not scrollable)
- Middle: ScrollView with BallCell grid (6 cells per row, wrapping)
- Below grid: Green "Next Ball (Dot) →" button → calls `confirmDotBall()`. This is the fast path — no tapping needed for dot balls.
- Bottom: Yellow "↶ Undo" button → `undoLastBall()`
- On ball tap → open NumberPad modal (only for current or past balls)
- On ball double-tap → toggleWicket directly
- Watch `phase` changes:
  - `inningsOver` → `navigation.replace('InningsOver')`
  - `result` → `navigation.replace('Result')`

### InningsOverScreen
- Centered content
- "Innings Over!" heading
- Score: "Team A: 68/5 in 6.0 overs"
- Target: "Team B needs 69 to win"
- Button: "Start Team B →" → calls `advanceInnings()` → `navigation.replace('Scoring')`

### ResultScreen
- Both scores displayed
- Winner message: "Team B won by 6 wickets" / "Team A won by 23 runs" / "Match Tied!"
- Win calculation:
  - Batting 2nd wins → "won by X wickets" (wickets remaining)
  - Batting 1st wins → "won by X runs" (run difference)
- "Share Scorecard" button → expo-sharing, plain text format
- "New Match" button → `newMatch()` → `navigation.replace('Setup')`

## Navigation Rules
- Always use `replace()` not `navigate()` — no back stack for match flow
- Exception: NumberPad is a modal/bottom-sheet within ScoringScreen, not a separate screen
# Coding Conventions Skill

## TypeScript
- Strict mode enabled
- Export types from `src/types.ts`
- No `any` — use proper types everywhere
- Use `as const` for literal arrays/objects

## Component Pattern
```typescript
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SHADOW } from '../theme'

type Props = {
  // explicit props, no spreading unknown
}

export const ComponentName: React.FC<Props> = ({ ... }) => {
  return (...)
}

const styles = StyleSheet.create({
  // all styles here, never inline
})
```

## Store Access Pattern
```typescript
// In components — use selectors for derived data
const totalRuns = useMatchStore(state => 
  state.innings[state.currentInnings].balls
    .filter(b => b.runs !== null)
    .reduce((sum, b) => sum + (b.runs ?? 0), 0)
)

// For actions
const setBallRuns = useMatchStore(state => state.setBallRuns)
```

## File Size
- Each file < 200 lines
- Extract helpers into utils if logic grows
- One component per file

## Error Prevention
- Validate all inputs before store updates
- Bounds check ball index before access
- Handle null runs properly (null = not entered, 0 = dot ball)

## Testing Mental Model
After any ball action, these must always be true:
- `wickets === balls.filter(b => b.isWicket).length`
- `totalRuns === balls.filter(b => b.runs !== null).reduce(...)`
- Phase transitions happen automatically, not manually
