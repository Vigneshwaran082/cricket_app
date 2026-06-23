export type BallEntry = {
  runs: number
  isWicket: boolean
}

export type Innings = {
  balls: BallEntry[]
  wickets: number
}

export type Phase = 'setup' | 'scoring' | 'inningsOver' | 'result'

export type MatchSetupParams = {
  teamA: string
  teamB: string
  overs: number
  playersPerTeam: number
}
