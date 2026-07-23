import React, { useState } from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import { useMatchStore } from '../store/matchStore'
import { ExtendOversModal } from './ExtendOversModal'

type Props = {
  // Called after overs are successfully extended. Useful for screens that
  // need to navigate back to the Scoring screen if the match had ended.
  onExtended?: () => void
}

export const ExtendOversButton: React.FC<Props> = ({ onExtended }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const extendOvers = useMatchStore(state => state.extendOvers)

  const handleConfirm = (additionalOvers: number) => {
    extendOvers(additionalOvers)
    setModalVisible(false)
    onExtended?.()
  }

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.button}
        hitSlop={8}
        accessibilityLabel="Extend Overs"
        accessibilityRole="button"
      >
        <Text style={styles.icon}>➕</Text>
      </Pressable>

      <ExtendOversModal
        visible={modalVisible}
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
})
