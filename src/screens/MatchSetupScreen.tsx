import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { COLORS, RADIUS, SHADOW } from '../theme'
import { EditableField } from '../components/EditableField'
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

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>

export const MatchSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [teamA, setTeamA] = useState('Team A')
  const [teamB, setTeamB] = useState('Team B')
  const [overs, setOvers] = useState('6')
  const [playersPerTeam, setPlayersPerTeam] = useState('7')
  const [minBatsmen, setMinBatsmen] = useState('1')

  const setupMatch = useMatchStore(state => state.setupMatch)

  const handleStartMatch = () => {
    const oversNum = parseInt(overs, 10)
    const playersNum = parseInt(playersPerTeam, 10)
    const minBatsmenNum = parseInt(minBatsmen, 10)

    if (isNaN(oversNum) || oversNum <= 0) {
      Alert.alert('Invalid Overs', 'Overs must be a number greater than 0')
      return
    }

    if (isNaN(playersNum) || playersNum < 2) {
      Alert.alert('Invalid Players', 'Players per team must be at least 2')
      return
    }

    if (isNaN(minBatsmenNum) || (minBatsmenNum !== 1 && minBatsmenNum !== 2)) {
      Alert.alert('Invalid Min Batsmen', 'Min Batsmen must be 1 or 2')
      return
    }

    setupMatch({
      teamA,
      teamB,
      overs: oversNum,
      playersPerTeam: playersNum,
      minBatsmen: minBatsmenNum,
    })

    navigation.replace('Scoring')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Green Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🏏 New Match</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <EditableField
          label="Team 1 Name"
          value={teamA}
          onSave={setTeamA}
        />
        <EditableField
          label="Team 2 Name"
          value={teamB}
          onSave={setTeamB}
        />
        <EditableField
          label="Overs"
          value={overs}
          onSave={setOvers}
          keyboardType="number-pad"
        />
        <EditableField
          label="Players per Team"
          value={playersPerTeam}
          onSave={setPlayersPerTeam}
          keyboardType="number-pad"
        />
        <EditableField
          label="Min Batsmen at Crease"
          value={minBatsmen}
          onSave={setMinBatsmen}
          keyboardType="number-pad"
        />
      </ScrollView>

      {/* Start Match Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleStartMatch}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Start Match →</Text>
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
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
