import React, { useRef } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { COLORS } from '../theme'
import type { BallEntry } from '../types'

type Props = {
  ball: BallEntry
  index: number
  ballNumberInOver: number
  isBowled: boolean
  isCurrent: boolean
  onTap: () => void
  onDoubleTap: () => void
}

const SIZE = 48
const RADIUS = SIZE / 2

export const BallCell: React.FC<Props> = ({
  ball,
  index,
  ballNumberInOver,
  isBowled,
  isCurrent,
  onTap,
  onDoubleTap,
}) => {
  const lastTap = useRef(0)
  const tapTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  const handlePress = () => {
    if (!isBowled && !isCurrent) return

    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (tapTimeout.current) clearTimeout(tapTimeout.current)
      console.log(`[BallCell ${index}] Double-tap detected`)
      onDoubleTap()
    } else {
      tapTimeout.current = setTimeout(() => {
        console.log(`[BallCell ${index}] Single-tap detected`)
        onTap()
      }, 300)
    }
    lastTap.current = now
  }

  // Returns all visual state for this ball
  const getVisual = () => {
    // Future ball
    if (!isBowled && !isCurrent) {
      return {
        bg: '#e0e0e0',
        textColor: '#aaaaaa',
        label: String(ballNumberInOver),
        bordered: false,
        borderColor: 'transparent',
      }
    }
    // Current ball being bowled
    if (isCurrent) {
      return {
        bg: '#ffffff',
        textColor: COLORS.primary,
        label: String(ballNumberInOver),
        bordered: true,
        borderColor: COLORS.primary,
      }
    }
    // Wicket
    if (ball.isWicket) {
      return { bg: '#c0392b', textColor: '#ffffff', label: 'W', bordered: false, borderColor: 'transparent' }
    }
    // Dot
    if (ball.runs === 0) {
      return { bg: '#999999', textColor: '#ffffff', label: '•', bordered: false, borderColor: 'transparent' }
    }
    // 1–3
    if (ball.runs <= 3) {
      return { bg: '#444444', textColor: '#ffffff', label: String(ball.runs), bordered: false, borderColor: 'transparent' }
    }
    // 4
    if (ball.runs === 4) {
      return { bg: '#2a6fdb', textColor: '#ffffff', label: '4', bordered: false, borderColor: 'transparent' }
    }
    // 5
    if (ball.runs === 5) {
      return { bg: '#7a3fb0', textColor: '#ffffff', label: '5', bordered: false, borderColor: 'transparent' }
    }
    // 6
    return { bg: '#f08c3a', textColor: '#ffffff', label: '6', bordered: false, borderColor: 'transparent' }
  }

  const { bg, textColor, label, bordered, borderColor } = getVisual()

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isBowled && !isCurrent}
      style={({ pressed }) => [
        styles.cell,
        {
          backgroundColor: bg,
          borderWidth: bordered ? 3 : 0,
          borderColor,
        },
        isBowled && styles.shadow,
        pressed && (isBowled || isCurrent) && styles.pressed,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  cell: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pressed: {
    opacity: 0.65,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
})

