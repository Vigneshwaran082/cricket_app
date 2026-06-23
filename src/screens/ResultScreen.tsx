import React from 'react'
import { View, Text, StyleSheet, Pressable, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { COLORS, RADIUS, SHADOW } from '../theme'
import { useMatchStore } from '../store/matchStore'

type RootStackParamList = {
  Setup: undefined
  Scoring: undefined
  InningsOver: undefined
  Result: undefined
}

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>

export const ResultScreen: React.FC<Props> = ({ navigation }) => {
  const teamA = useMatchStore(state => state.teamA)
  const teamB = useMatchStore(state => state.teamB)
  const overs = useMatchStore(state => state.overs)
  const playersPerTeam = useMatchStore(state => state.playersPerTeam)
  const innings0Balls = useMatchStore(state => state.innings[0].balls)
  const innings1Balls = useMatchStore(state => state.innings[1].balls)
  const cursor = useMatchStore(state => state.currentBallIndex)
  const newMatch = useMatchStore(state => state.newMatch)

  // Team A stats — 1st innings (fully played)
  const teamARuns = innings0Balls.reduce((sum, b) => sum + b.runs, 0)
  const teamAWickets = innings0Balls.filter(b => b.isWicket).length
  const teamAOvers = `${overs}.0`

  // Team B stats — 2nd innings up to cursor
  const teamBBowledBalls = innings1Balls.slice(0, cursor)
  const teamBRuns = teamBBowledBalls.reduce((sum, b) => sum + b.runs, 0)
  const teamBWickets = teamBBowledBalls.filter(b => b.isWicket).length
  const teamBOvers = `${Math.floor(cursor / 6)}.${cursor % 6}`

  // Winner logic
  const getWinnerMessage = (): string => {
    if (teamBRuns > teamARuns) {
      const wicketsRemaining = playersPerTeam - 1 - teamBWickets
      return `${teamB} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`
    }
    if (teamARuns > teamBRuns) {
      const runDiff = teamARuns - teamBRuns
      return `${teamA} won by ${runDiff} run${runDiff !== 1 ? 's' : ''}`
    }
    return 'Match Tied!'
  }

  const winnerMessage = getWinnerMessage()

  const handleShare = async () => {
    const text = [
      `🏏 ${teamA} vs ${teamB}`,
      `${teamA}: ${teamARuns}/${teamAWickets} (${teamAOvers} ov)`,
      `${teamB}: ${teamBRuns}/${teamBWickets} (${teamBOvers} ov)`,
      winnerMessage,
    ].join('\n')

    await Share.share({ message: text })
  }

  const handleNewMatch = () => {
    newMatch()
    navigation.replace('Setup')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.heading}>🏏 Match Result</Text>

        {/* Scores card */}
        <View style={styles.card}>
          <View style={styles.scoreRow}>
            <Text style={styles.teamName}>{teamA}</Text>
            <Text style={styles.score}>
              {teamARuns}/{teamAWickets}
              <Text style={styles.oversText}>  ({teamAOvers} ov)</Text>
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.scoreRow}>
            <Text style={styles.teamName}>{teamB}</Text>
            <Text style={styles.score}>
              {teamBRuns}/{teamBWickets}
              <Text style={styles.oversText}>  ({teamBOvers} ov)</Text>
            </Text>
          </View>
        </View>

        {/* Winner message */}
        <View style={styles.winnerCard}>
          <Text style={styles.winnerText}>{winnerMessage}</Text>
        </View>

        {/* Buttons */}
        <Pressable
          style={({ pressed }) => [styles.shareButton, pressed && styles.buttonPressed]}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>📤 Share Scorecard</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.newMatchButton, pressed && styles.buttonPressed]}
          onPress={handleNewMatch}
        >
          <Text style={styles.newMatchButtonText}>New Match</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    ...SHADOW,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  oversText: {
    fontSize: 13,
    fontWeight: 'normal',
    color: COLORS.textLight,
  },
  winnerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 32,
    ...SHADOW,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.card,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS,
    alignItems: 'center',
    minHeight: 48,
    marginBottom: 12,
    ...SHADOW,
  },
  shareButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  newMatchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS,
    alignItems: 'center',
    minHeight: 48,
    ...SHADOW,
  },
  newMatchButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
})
