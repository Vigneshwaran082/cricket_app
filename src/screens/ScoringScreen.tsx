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
import { COLORS, RADIUS, SHADOW } from '../theme'
import { ScoreBar } from '../components/ScoreBar'
import { BallCell } from '../components/BallCell'
import { NumberPad } from '../components/NumberPad'
import { useMatchStore } from '../store/matchStore'

type RootStackParamList = {
  Setup: undefined
  Scoring: undefined
  InningsOver: undefined
  Result: undefined
}

type Props = NativeStackScreenProps<RootStackParamList, 'Scoring'>

const CELL_SIZE = 60 // 52px cell + 4px margin on each side

export const ScoringScreen: React.FC<Props> = ({ navigation }) => {
  const [numberPadVisible, setNumberPadVisible] = useState(false)
  const [selectedBallIndex, setSelectedBallIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  const innings = useMatchStore(state => state.innings)
  const currentInnings = useMatchStore(state => state.currentInnings)
  const currentBallIndex = useMatchStore(state => state.currentBallIndex)
  const phase = useMatchStore(state => state.phase)

  const setBallRuns = useMatchStore(state => state.setBallRuns)
  const toggleWicket = useMatchStore(state => state.toggleWicket)
  const confirmDotBall = useMatchStore(state => state.confirmDotBall)
  const undoLastBall = useMatchStore(state => state.undoLastBall)
  const newMatch = useMatchStore(state => state.newMatch)

  const balls = innings[currentInnings].balls

  // Watch for phase changes to navigate away
  useEffect(() => {
    if (phase === 'inningsOver') {
      navigation.replace('InningsOver')
    } else if (phase === 'result') {
      navigation.replace('Result')
    }
  }, [phase, navigation])

  // Auto-scroll to keep current ball row visible
  useEffect(() => {
    if (scrollViewRef.current) {
      const row = Math.floor(currentBallIndex / 6)
      const scrollY = row * CELL_SIZE
      scrollViewRef.current.scrollTo({ y: scrollY, animated: true })
    }
  }, [currentBallIndex])

  const handleBallTap = (index: number) => {
    // Guard: only open NumberPad for current or already-bowled balls
    if (index > currentBallIndex) return
    setSelectedBallIndex(index)
    setNumberPadVisible(true)
  }

  const handleBallDoubleTap = (index: number) => {
    // Guard: only toggle wicket for current or already-bowled balls
    if (index > currentBallIndex) return
    toggleWicket(index)
  }

  const handleNumberPadSelect = (runs: number) => {
    setBallRuns(selectedBallIndex, runs)
  }

  const handleNumberPadWicket = () => {
    toggleWicket(selectedBallIndex)
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
      <ScoreBar onHomePress={handleHomePress} />

      {/* Ball grid */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.gridContainer}
        contentContainerStyle={styles.gridContent}
      >
        <View style={styles.grid}>
          {balls.map((ball, index) => (
            <BallCell
              key={index}
              ball={ball}
              index={index}
              isBowled={index < currentBallIndex}
              isCurrent={index === currentBallIndex}
              onTap={() => handleBallTap(index)}
              onDoubleTap={() => handleBallDoubleTap(index)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.nextBallButton,
            pressed && styles.pressed,
          ]}
          onPress={confirmDotBall}
        >
          <Text style={styles.nextBallText}>Next Ball (Dot) →</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.undoButton,
            isUndoDisabled && styles.undoDisabled,
            pressed && !isUndoDisabled && styles.pressed,
          ]}
          onPress={undoLastBall}
          disabled={isUndoDisabled}
        >
          <Text style={[styles.undoText, isUndoDisabled && styles.undoTextDisabled]}>
            ↶ Undo
          </Text>
        </Pressable>
      </View>

      {/* NumberPad modal */}
      <NumberPad
        visible={numberPadVisible}
        onSelect={handleNumberPadSelect}
        onWicket={handleNumberPadWicket}
        onClose={() => setNumberPadVisible(false)}
      />
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
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  nextBallButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...SHADOW,
  },
  nextBallText: {
    color: COLORS.card,
    fontSize: 17,
    fontWeight: '600',
  },
  undoButton: {
    backgroundColor: COLORS.undo,
    paddingVertical: 16,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...SHADOW,
  },
  undoDisabled: {
    opacity: 0.4,
  },
  undoText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  undoTextDisabled: {
    color: COLORS.textLight,
  },
  pressed: {
    opacity: 0.75,
  },
})
