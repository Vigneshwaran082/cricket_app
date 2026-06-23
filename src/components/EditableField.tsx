import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardTypeOptions,
} from 'react-native'
import { COLORS, RADIUS, SHADOW } from '../theme'

type Props = {
  label: string
  value: string
  onSave: (newValue: string) => void
  keyboardType?: KeyboardTypeOptions
}

export const EditableField: React.FC<Props> = ({
  label,
  value,
  onSave,
  keyboardType = 'default',
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  return (
    <View style={styles.container}>
      {isEditing ? (
        <View style={styles.editMode}>
          <TextInput
            style={styles.textInput}
            value={editValue}
            onChangeText={setEditValue}
            keyboardType={keyboardType}
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            autoFocus
            blurOnSubmit
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.displayMode}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  displayMode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: RADIUS,
    minHeight: 44,
    ...SHADOW,
  },
  editMode: {
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS,
    minHeight: 44,
    justifyContent: 'center',
    ...SHADOW,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingHorizontal: 0,
  },
})
