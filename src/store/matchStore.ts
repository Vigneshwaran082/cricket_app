import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { BallEntry, Innings, Phase, MatchSetupParams } from '../types'

type MatchState = {
  // State
  teamA: string
  teamB: string
  overs: number
  playersPerTeam: number
  minBatsmen: number
  innings: [Innings, Innings]
  currentInnings: 0 | 1
  currentBallIndex: number
  phase: Phase

  // Actions
  setupMatch: (params: MatchSetupParams) => void
  setBallRuns: (index: number, runs: number) => void
  toggleWicket: (index: number) => void
  confirmDotBall: () => void
  undoLastBall: () => void
  advanceInnings: () => void
  newMatch: () => void

  // Selectors
  totalRuns: () => number
  totalWickets: () => number
  oversBowled: () => string
  ballsRemaining: () => number
  batsmenRemaining: () => number
  target: () => number
}

const createEmptyInnings = (totalBalls: number): Innings => ({
  balls: Array(totalBalls)
    .fill(null)
    .map(() => ({ runs: 0, isWicket: false })),
  wickets: 0,
})

const computeRuns = (balls: BallEntry[], cursor: number): number =>
  balls.slice(0, cursor).reduce((sum, b) => sum + b.runs, 0)

const recomputeWickets = (balls: BallEntry[]): number =>
  balls.filter(b => b.isWicket).length

const computeWickets = (balls: BallEntry[], cursor: number): number =>
  balls.slice(0, cursor).filter(b => b.isWicket).length

// Determines next phase after cursor advance. Returns null if innings continues.
const getNextPhase = (
  updatedBalls: BallEntry[],
  newBallIndex: number,
  firstInningsBalls: BallEntry[],
  currentInnings: 0 | 1,
  playersPerTeam: number,
  minBatsmen: number,
  totalBalls: number
): Phase | null => {
  const wickets = computeWickets(updatedBalls, newBallIndex)
  const runs = computeRuns(updatedBalls, newBallIndex)

  // All out threshold depends on minBatsmen.
  // If minBatsmen = 1, threshold = playersPerTeam (last man bats alone)
  // If minBatsmen = 2, threshold = playersPerTeam - 1 (standard)
  const allOutThreshold = playersPerTeam - (minBatsmen - 1)
  if (wickets >= allOutThreshold) {
    return currentInnings === 0 ? 'inningsOver' : 'result'
  }

  // 2nd innings: chase won — check before all-balls-bowled so it triggers mid-over
  if (currentInnings === 1) {
    const firstInningsTotal = computeRuns(firstInningsBalls, firstInningsBalls.length)
    if (runs >= firstInningsTotal + 1) {
      return 'result'
    }
  }

  // All balls bowled
  if (newBallIndex >= totalBalls) {
    return currentInnings === 0 ? 'inningsOver' : 'result'
  }

  return null
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      teamA: 'Team A',
      teamB: 'Team B',
      overs: 6,
      playersPerTeam: 7,
      minBatsmen: 1,
      innings: [createEmptyInnings(36), createEmptyInnings(36)],
      currentInnings: 0,
      currentBallIndex: 0,
      phase: 'setup',

      setupMatch: (params: MatchSetupParams) => {
        const totalBalls = params.overs * 6
        set({
          teamA: params.teamA,
          teamB: params.teamB,
          overs: params.overs,
          playersPerTeam: params.playersPerTeam,
                minBatsmen: params.minBatsmen ?? 1,
                innings: [createEmptyInnings(totalBalls), createEmptyInnings(totalBalls)],
                currentInnings: 0,
                currentBallIndex: 0,
                phase: 'scoring',
              })
            },


      setBallRuns: (index: number, runs: number) => {
        set(state => {
          const newInnings: [Innings, Innings] = [
            { ...state.innings[0], balls: [...state.innings[0].balls] },
            { ...state.innings[1], balls: [...state.innings[1].balls] },
          ]
          const cur = state.currentInnings
          const newBalls = [...newInnings[cur].balls]
          newBalls[index] = { ...newBalls[index], runs }
          newInnings[cur] = { balls: newBalls, wickets: recomputeWickets(newBalls) }

          const newBallIndex = index === state.currentBallIndex
            ? state.currentBallIndex + 1
            : state.currentBallIndex

          const nextPhase = getNextPhase(
            newBalls,
            newBallIndex,
            newInnings[0].balls,
            cur,
            state.playersPerTeam,
            state.minBatsmen,
            state.overs * 6
          )

          return {
            innings: newInnings,
            currentBallIndex: newBallIndex,
            phase: nextPhase ?? state.phase,
          }
        })
      },

      toggleWicket: (index: number) => {
        set(state => {
          const newInnings: [Innings, Innings] = [
            { ...state.innings[0], balls: [...state.innings[0].balls] },
            { ...state.innings[1], balls: [...state.innings[1].balls] },
          ]
          const cur = state.currentInnings
          const newBalls = [...newInnings[cur].balls]
          newBalls[index] = { ...newBalls[index], isWicket: !newBalls[index].isWicket }
          newInnings[cur] = { balls: newBalls, wickets: recomputeWickets(newBalls) }

          const newBallIndex = index === state.currentBallIndex
            ? state.currentBallIndex + 1
            : state.currentBallIndex

          const nextPhase = getNextPhase(
            newBalls,
            newBallIndex,
            newInnings[0].balls,
            cur,
            state.playersPerTeam,
            state.minBatsmen,
            state.overs * 6
          )

          return {
            innings: newInnings,
            currentBallIndex: newBallIndex,
            phase: nextPhase ?? state.phase,
          }
        })
      },

      confirmDotBall: () => {
        set(state => {
          const cur = state.currentInnings
          const newBallIndex = state.currentBallIndex + 1
          const currentBalls = state.innings[cur].balls

          const nextPhase = getNextPhase(
            currentBalls,
            newBallIndex,
            state.innings[0].balls,
            cur,
            state.playersPerTeam,
            state.minBatsmen,
            state.overs * 6
          )

          return {
            currentBallIndex: newBallIndex,
            phase: nextPhase ?? state.phase,
          }
        })
      },

      undoLastBall: () => {
        set(state => {
          if (state.currentBallIndex === 0) return {}

          const newInnings: [Innings, Innings] = [
            { ...state.innings[0], balls: [...state.innings[0].balls] },
            { ...state.innings[1], balls: [...state.innings[1].balls] },
          ]
          const cur = state.currentInnings
          const newBalls = [...newInnings[cur].balls]
          const newBallIndex = state.currentBallIndex - 1

          newBalls[newBallIndex] = { runs: 0, isWicket: false }
          newInnings[cur] = { balls: newBalls, wickets: recomputeWickets(newBalls) }

          return {
            innings: newInnings,
            currentBallIndex: newBallIndex,
          }
        })
      },

      advanceInnings: () => {
        set({
          currentInnings: 1,
          currentBallIndex: 0,
          phase: 'scoring',
        })
      },

      newMatch: () => {
        set({
          teamA: 'Team A',
          teamB: 'Team B',
          overs: 6,
          playersPerTeam: 7,
          minBatsmen: 1,
          innings: [createEmptyInnings(36), createEmptyInnings(36)],
          currentInnings: 0,
          currentBallIndex: 0,
          phase: 'setup',
        })
      },


      // Selectors — compute from balls[0..cursor-1] only
      totalRuns: () => {
        const state = get()
        return computeRuns(
          state.innings[state.currentInnings].balls,
          state.currentBallIndex
        )
      },

      totalWickets: () => {
        const state = get()
        return computeWickets(
          state.innings[state.currentInnings].balls,
          state.currentBallIndex
        )
      },

      oversBowled: () => {
        const state = get()
        return `${Math.floor(state.currentBallIndex / 6)}.${state.currentBallIndex % 6}`
      },

      ballsRemaining: () => {
        const state = get()
        return state.overs * 6 - state.currentBallIndex
      },

      batsmenRemaining: () => {
        const state = get()
        return state.playersPerTeam - (state.minBatsmen - 1) - state.totalWickets()
      },


      target: () => {
        const state = get()
        if (state.currentInnings === 0) return 0
        return computeRuns(state.innings[0].balls, state.innings[0].balls.length) + 1
      },
    }),
    {
      name: 'cricket-match-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

