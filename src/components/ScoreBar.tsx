import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { COLORS } from '../theme'
import { useMatchStore } from '../store/matchStore'

interface ScoreBarProps {
  onHomePress?: () => void
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ onHomePress }) => {
  const teamA = useMatchStore(state => state.teamA)
  const teamB = useMatchStore(state => state.teamB)
  const currentInnings = useMatchStore(state => state.currentInnings)
  const currentBallIndex = useMatchStore(state => state.currentBallIndex)
  const overs = useMatchStore(state => state.overs)
  const playersPerTeam = useMatchStore(state => state.playersPerTeam)

  const totalRuns = useMatchStore(state => state.totalRuns())
  const totalWickets = useMatchStore(state => state.totalWickets())
  const oversBowled = useMatchStore(state => state.oversBowled())
  const ballsRemaining = useMatchStore(state => state.ballsRemaining())
  const batsmenRemaining = useMatchStore(state => state.batsmenRemaining())
  const target = useMatchStore(state => state.target())

  const currentTeam = currentInnings === 0 ? teamA : teamB
  const currentOverNumber = Math.floor(currentBallIndex / 6) + 1

  const needRuns = target - totalRuns
  const ballsRemainingInChase = ballsRemaining

  const isChaseInning = currentInnings === 1

  return (
    <View style={styles.container}>
      {/* Line 1: Team, Score, Overs with Home button */}
      <View style={styles.line1}>
        <Text style={styles.teamName}>{currentTeam}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.score}>
          {totalRuns}/{totalWickets}
        </Text>
        <View style={styles.rightSection}>
          <Text style={styles.overs}>({oversBowled})</Text>
          {onHomePress && (
            <Pressable 
              onPress={onHomePress}
              style={styles.homeButton}
              hitSlop={8}
            >
              <Text style={styles.homeIcon}>🏠</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Line 2: Over info */}
      <View style={styles.line2}>
        <Text style={styles.info}>
          Over {currentOverNumber} of {overs} · {ballsRemaining} balls left · {batsmenRemaining}/{playersPerTeam - 1} batsmen
        </Text>
      </View>

      {/* Line 3: Chase info (only during 2nd innings) */}
      {isChaseInning && (
        <View style={styles.line3}>
          <Text style={styles.info}>
            Target: {target} · Need {needRuns} from {ballsRemainingInChase} balls
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  line1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  line2: {
    marginBottom: 8,
  },
  line3: {
    marginBottom: 0,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.card,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.card,
  },
  overs: {
    fontSize: 14,
    color: COLORS.card,
    fontWeight: '500',
  },
  homeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIcon: {
    fontSize: 20,
  },
  info: {
    fontSize: 13,
    color: COLORS.card,
    fontWeight: '500',
  },
})
