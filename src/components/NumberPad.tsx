import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { COLORS, RADIUS } from '../theme'

type Props = {
  onSelect: (runs: number) => void
  onWicket: () => void
  onUndo: () => void
  undoDisabled: boolean
}

// Always-visible run entry panel — replaces the old popup NumberPad.
// Every press applies directly to whichever ball is currently targeted
// (the current ball by default, or a tapped past ball for corrections),
// so the user never has to tap a ball first just to bring up a dialog.
export const NumberPad: React.FC<Props> = ({
  onSelect,
  onWicket,
  onUndo,
  undoDisabled,
}) => {
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

  const buttons = [0, 1, 2, 3, 4, 5, 6, 'W'] as const

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Runs for this ball</Text>

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
            onPress={() => (value === 'W' ? onWicket() : onSelect(value))}
          >
            <Text style={[styles.buttonText, { color: getButtonColor(value) }]}>
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.undoButton,
          undoDisabled && styles.undoDisabled,
          pressed && !undoDisabled && styles.pressed,
        ]}
        onPress={onUndo}
        disabled={undoDisabled}
      >
        <Text style={[styles.undoText, undoDisabled && styles.undoTextDisabled]}>
          ↶ Undo
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
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
  undoButton: {
    backgroundColor: COLORS.undo,
    paddingVertical: 14,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  undoDisabled: {
    opacity: 0.4,
  },
  undoText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  undoTextDisabled: {
    color: COLORS.textLight,
  },
  pressed: {
    opacity: 0.75,
  },
})
