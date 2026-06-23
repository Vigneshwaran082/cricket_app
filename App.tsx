import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { MatchSetupScreen } from './src/screens/MatchSetupScreen'
import { ScoringScreen } from './src/screens/ScoringScreen'
import { InningsOverScreen } from './src/screens/InningsOverScreen'
import { ResultScreen } from './src/screens/ResultScreen'
import { useMatchStore } from './src/store/matchStore'

type RootStackParamList = {
  Setup: undefined
  Scoring: undefined
  InningsOver: undefined
  Result: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const phase = useMatchStore(state => state.phase)

  useEffect(() => {
    // Wait for Zustand persist to finish hydrating from AsyncStorage
    if (useMatchStore.persist.hasHydrated()) {
      setIsReady(true)
    } else {
      const unsub = useMatchStore.persist.onFinishHydration(() => {
        setIsReady(true)
      })
      return unsub
    }
  }, [])

  const getInitialRoute = () => {
    switch (phase) {
      case 'scoring':    return 'Scoring'
      case 'inningsOver': return 'InningsOver'
      case 'result':     return 'Result'
      default:           return 'Setup'
    }
  }

  if (!isReady) {
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        <Stack.Screen name="Setup" component={MatchSetupScreen} />
        <Stack.Screen
          name="Scoring"
          component={ScoringScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="InningsOver" component={InningsOverScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  )
}