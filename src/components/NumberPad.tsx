import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native'
import { COLORS, RADIUS } from '../theme'

type Props = {
  visible: boolean
  onSelect: (runs: number) => void
  onWicket: () => void
  onClose: () => void
}

export const NumberPad: React.FC<Props> = ({
  visible,
  onSelect,
  onWicket,
  onClose,
}) => {
  const [slideAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: false,
      }).start()
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
      }).start()
    }
  }, [visible, slideAnim])

  const handleSelectRuns = (runs: number) => {
    onSelect(runs)
    onClose()
  }

  const handleWicket = () => {
    onWicket()
    onClose()
  }

  const getButtonColor = (value: number | string): string => {
    if (value === 4) return COLORS.run4
    if (value === 5) return COLORS.run5
    if (value === 6) return COLORS.run6
    if (value === 'W') return COLORS.card
    return COLORS.text
  }

  const getButtonBg = (value: number | string): string => {
    if (value === 'W') return COLORS.wicket
    return COLORS.card
  }

  const slideUp = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  })

  const buttons = [0, 1, 2, 3, 4, 5, 6, 'W'] as const

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropInner} />
      </Pressable>

      {/* Sliding Card */}
      <Animated.View
        style={[
          styles.slideContainer,
          {
            transform: [{ translateY: slideUp }],
          },
        ]}
      >
        <View style={styles.card}>
          {/* Grab Handle */}
          <View style={styles.grabHandle} />

          {/* Title */}
          <Text style={styles.title}>Runs for this ball</Text>

          {/* Button Grid */}
          <View style={styles.grid}>
            {buttons.map((value) => (
              <Pressable
                key={value}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: getButtonBg(value),
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => {
                  if (value === 'W') {
                    handleWicket()
                  } else {
                    handleSelectRuns(value)
                  }
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: getButtonColor(value),
                    },
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropInner: {
    flex: 1,
  },
  slideContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  grabHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '23%',
    minHeight: 48,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
  },
})
