import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native'
import { COLORS, RADIUS, SHADOW } from '../theme'

type Props = {
  visible: boolean
  onConfirm: (overs: number) => void
  onClose: () => void
}

export const ExtendOversModal: React.FC<Props> = ({ visible, onConfirm, onClose }) => {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setValue('')
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleConfirm = () => {
    const oversNum = parseInt(value, 10)
    if (isNaN(oversNum) || oversNum <= 0) {
      setError('Enter a positive number of overs')
      return
    }
    onConfirm(oversNum)
    reset()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Add More Overs</Text>

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={text => {
              setValue(text)
              setError(null)
            }}
            keyboardType="number-pad"
            placeholder="e.g. 2"
            placeholderTextColor={COLORS.textLight}
            autoFocus
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                pressed && styles.pressed,
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    padding: 20,
    ...SHADOW,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
  },
  error: {
    color: COLORS.wicket,
    fontSize: 13,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
})
