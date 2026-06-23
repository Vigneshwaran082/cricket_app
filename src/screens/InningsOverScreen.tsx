import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
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

type Props = NativeStackScreenProps<RootStackParamList, 'InningsOver'>

export const InningsOverScreen: React.FC<Props> = ({ navigation }) => {
  const teamA = useMatchStore(state => state.teamA)
  const teamB = useMatchStore(state => state.teamB)
  const overs = useMatchStore(state => state.overs)
  const advanceInnings = useMatchStore(state => state.advanceInnings)

  // First innings data — always innings[0]
  const firstInningsBalls = useMatchStore(state => state.innings[0].balls)
  const firstInningsRuns = firstInningsBalls.reduce((sum, b) => sum + b.runs, 0)
  const firstInningsWickets = firstInningsBalls.filter(b => b.isWicket).length
  const target = firstInningsRuns + 1

  // Format overs as "6.0" using total balls bowled in first innings
  const bowledBalls = firstInningsBalls.length
  const oversDisplay = `${Math.floor(bowledBalls / 6)}.${bowledBalls % 6}`

  const handleStart = () => {
    advanceInnings()
    navigation.replace('Scoring')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Innings Over!</Text>

        <View style={styles.card}>
          <Text style={styles.scoreText}>
            {teamA}: {firstInningsRuns}/{firstInningsWickets} in {overs}.0 overs
          </Text>
          <Text style={styles.targetText}>
            {teamB} needs {target} to win
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>Start {teamB} →</Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 32,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    ...SHADOW,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  targetText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: RADIUS,
    alignItems: 'center',
    minHeight: 48,
    width: '100%',
    ...SHADOW,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: '600',
  },
})
