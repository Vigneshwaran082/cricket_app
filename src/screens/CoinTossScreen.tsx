import React, { useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { COLORS, RADIUS, SHADOW } from '../theme'

type RootStackParamList = {
  Setup: undefined
  CoinToss: undefined
}

type Props = NativeStackScreenProps<RootStackParamList, 'CoinToss'>

const COIN_SIZE = 200
const FLIP_DURATION = 800

export const CoinTossScreen: React.FC<Props> = ({ navigation }) => {
  const spin = useRef(new Animated.Value(0)).current
  const resultOpacity = useRef(new Animated.Value(0)).current
  const [isFlipping, setIsFlipping] = useState(false)
  const [hasTossed, setHasTossed] = useState(false)
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null)
  const [face, setFace] = useState<'H' | 'T'>('H')

  const runToss = () => {
    if (isFlipping) return

    setIsFlipping(true)
    setHasTossed(true)
    setResult(null)
    resultOpacity.setValue(0)
    spin.setValue(0)

    // Spin fast multiple times, then slow down to a stop — total duration 800ms
    Animated.sequence([
      Animated.timing(spin, {
        toValue: 8,
        duration: FLIP_DURATION * 0.6,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(spin, {
        toValue: 10,
        duration: FLIP_DURATION * 0.4,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const outcome: 'HEADS' | 'TAILS' = Math.random() < 0.5 ? 'HEADS' : 'TAILS'
      setFace(outcome === 'HEADS' ? 'H' : 'T')
      setResult(outcome)
      setIsFlipping(false)

      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    })
  }

  const rotateY = spin.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '3600deg'],
  })

  const isHeads = result === 'HEADS'

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🪙 Coin Toss</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.85} onPress={runToss} disabled={isFlipping} testID="coin-toss-touchable">
          <Animated.View
            style={[
              styles.coin,
              { transform: [{ perspective: 1000 }, { rotateY }] },
            ]}
          >
            <Text style={styles.coinText}>{face}</Text>
          </Animated.View>
        </TouchableOpacity>

        {!hasTossed && (
          <Text style={styles.hint}>Tap coin to toss</Text>
        )}

        {result && (
          <Animated.View
            style={[
              styles.resultBox,
              isHeads ? styles.resultBoxHeads : styles.resultBoxTails,
              { opacity: resultOpacity },
            ]}
          >
            <Text style={[styles.resultText, isHeads ? styles.resultTextHeads : styles.resultTextTails]}>
              {result}
            </Text>
          </Animated.View>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.card,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: COIN_SIZE / 2,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  coinText: {
    fontSize: 88,
    fontWeight: 'bold',
    color: '#78350f',
  },
  hint: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textLight,
  },
  resultBox: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: RADIUS,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBoxHeads: {
    backgroundColor: '#dcfce7',
  },
  resultBoxTails: {
    backgroundColor: '#dbeafe',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  resultTextHeads: {
    color: '#16a34a',
  },
  resultTextTails: {
    color: '#2563eb',
  },
  button: {
    backgroundColor: COLORS.primary,
    marginVertical: 16,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...SHADOW,
  },
  buttonText: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: '600',
  },
})
