import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { COLORS, RADIUS } from '../theme'
import { ScoreBar } from '../components/ScoreBar'
import { BallCell } from '../components/BallCell'
import { NumberPad } from '../components/NumberPad'
import { useMatchStore } from '../store/matchStore'

type RootStackParamList = {
  Setup: undefined
  Scoring: {
    readOnly: true
    viewInnings: 0 | 1
    returnTo: 'InningsOver' | 'Result'
  } | undefined
  InningsOver: undefined
  Result: undefined
}

type Props = NativeStackScreenProps<RootStackParamList, 'Scoring'>

const OVER_ROW_HEIGHT = 80 // approximate height of each over row

export const ScoringScreen: React.FC<Props> = ({ navigation, route }) => {
  // null = target the current ball (the common case). Set when the user
  // taps a past bowled ball to correct it via the static NumberPad below.
  const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const innings = useMatchStore(state => state.innings)
  const currentInnings = useMatchStore(state => state.currentInnings)
  const currentBallIndex = useMatchStore(state => state.currentBallIndex)
  const overs = useMatchStore(state => state.overs)
  const phase = useMatchStore(state => state.phase)

  const setBallRuns = useMatchStore(state => state.setBallRuns)
  const toggleWicket = useMatchStore(state => state.toggleWicket)
  const undoLastBall = useMatchStore(state => state.undoLastBall)
  const newMatch = useMatchStore(state => state.newMatch)

  const isReadOnly = route.params?.readOnly === true
  const viewInnings = route.params?.viewInnings
  const returnTo = route.params?.returnTo

  const displayInnings: 0 | 1 = isReadOnly ? (viewInnings ?? currentInnings) : currentInnings
  const balls = innings[displayInnings].balls
  const displayBallIndex = isReadOnly ? balls.length : currentBallIndex

  // The ball the static NumberPad will update on the next press.
  const targetBallIndex = selectedBallIndex ?? currentBallIndex

  // Watch for phase changes to navigate away
  useEffect(() => {
    if (isReadOnly) return
    if (phase === 'inningsOver') {
      navigation.replace('InningsOver')
    } else if (phase === 'result') {
      navigation.replace('Result')
    }
  }, [phase, navigation, isReadOnly])

  // Auto-scroll to keep current ball over visible
  useEffect(() => {
    if (isReadOnly) return
    if (scrollViewRef.current) {
      const overIndex = Math.floor(currentBallIndex / 6)
      const scrollY = overIndex * OVER_ROW_HEIGHT
      scrollViewRef.current.scrollTo({ y: scrollY, animated: true })
    }
  }, [currentBallIndex, isReadOnly])

  // Reset the selection back to "current ball" whenever the cursor advances,
  // so the static pad always targets the next ball unless the user taps
  // another past ball to correct it.
  useEffect(() => {
    setSelectedBallIndex(null)
  }, [currentBallIndex])

  const handleBallTap = (index: number) => {
    if (isReadOnly) return
    // Guard: only select current or already-bowled balls
    if (index > currentBallIndex) return
    setSelectedBallIndex(index)
  }

  const handleBallDoubleTap = (index: number) => {
    if (isReadOnly) return
    // Guard: only toggle wicket for current or already-bowled balls
    if (index > currentBallIndex) return
    toggleWicket(index)
  }

  const handleNumberPadSelect = (runs: number) => {
    setBallRuns(targetBallIndex, runs)
  }

  const handleNumberPadWicket = () => {
    toggleWicket(targetBallIndex)
  }

  const handleUndo = () => {
    undoLastBall()
  }

  // Compute total runs for a specific over (balls 0-5, 6-11, etc.)
  const getOverTotal = (overIndex: number): number => {
    const startIdx = overIndex * 6
    const endIdx = startIdx + 6
    return balls.slice(startIdx, endIdx).reduce((sum, ball) => sum + ball.runs, 0)
  }

  const isUndoDisabled = currentBallIndex === 0

  const handleHomePress = () => {
    Alert.alert(
      'Start New Match?',
      'Current match progress will be lost.',
      [
        {
          text: 'Continue',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'New Match',
          onPress: () => {
            newMatch()
            navigation.replace('Setup')
          },
          style: 'destructive',
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed ScoreBar at top */}
      <ScoreBar
        onHomePress={isReadOnly ? undefined : handleHomePress}
        displayInnings={displayInnings}
        displayCursor={displayBallIndex}
      />

      {isReadOnly && (
        <View style={styles.readOnlyHeader}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => {
              if (returnTo) {
                navigation.replace(returnTo)
                return
              }
              navigation.goBack()
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </View>
      )}

      {/* Ball grid grouped by overs */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.gridContainer}
        contentContainerStyle={styles.gridContent}
      >
        {Array.from({ length: overs }).map((_, overIndex) => {
          const startIdx = overIndex * 6
          const overBalls = balls.slice(startIdx, startIdx + 6)
          const overTotal = getOverTotal(overIndex)

          return (
            <View key={overIndex}>
              {/* Over header */}
              <Text style={styles.overHeader}>Over {overIndex + 1}</Text>

              <View style={styles.overRow}>
                {/* 6 balls */}
                <View style={styles.ballsInOver}>
                  {overBalls.map((ball, ballInOverIndex) => {
                    const globalIndex = startIdx + ballInOverIndex
                    return (
                      <BallCell
                        key={globalIndex}
                        ball={ball}
                        index={globalIndex}
                        ballNumberInOver={ballInOverIndex + 1}
                        isBowled={isReadOnly || globalIndex < displayBallIndex}
                        isCurrent={!isReadOnly && globalIndex === displayBallIndex}
                        isSelected={!isReadOnly && selectedBallIndex === globalIndex}
                        onTap={() => handleBallTap(globalIndex)}
                        onDoubleTap={() => handleBallDoubleTap(globalIndex)}
                      />
                    )
                  })}
                </View>

                {/* Over total */}
                <View style={styles.overTotal}>
                  <Text style={styles.overTotalText}>{overTotal}</Text>
                </View>
              </View>

              {/* Separator line */}
              {overIndex < overs - 1 && <View style={styles.separator} />}
            </View>
          )
        })}
      </ScrollView>

      {!isReadOnly && (
        <NumberPad
          onSelect={handleNumberPadSelect}
          onWicket={handleNumberPadWicket}
          onUndo={handleUndo}
          undoDisabled={isUndoDisabled}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  readOnlyHeader: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  overRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  overHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 6,
  },
  ballsInOver: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-start',
  },
  overTotal: {
    width: 50,
    height: 48,
    borderRadius: RADIUS,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  pressed: {
    opacity: 0.75,
  },
})
