/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen';
import DashboardScreen from './screens/DashboardScreen';
import Type1ProcessScreen from './screens/Type1/Type1ProcessScreen';
import Type1SaveScreen from './screens/Type1/Type1SaveScreen';
import Type5ProcessScreen from './screens/Type5/Type5ProcessScreen';
import Type5SaveScreen from './screens/Type5/Type5SaveScreen';
import Api from './screens/APIData/Api';
import Type2ProcessScreen from './screens/Type2/Type2ProcessScreen';
import Type2SaveScreen from './screens/Type2/Type2SaveScreen';
import Type3ProcessScreen from './screens/Type3/Type3ProcessScreen';
import Type3SaveScreen from './screens/Type3/Type3SaveScreen';
import Type4ProcessScreen from './screens/Type4/Type4ProcessScreen';
import Type4SaveScreen from './screens/Type4/Type4SaveScreen';
import Gemini from './screens/DemoScreens/Gemini';
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">

        <Stack.Screen
          name="Gemini"
          component={Gemini}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: true, title: 'Dashboard' }}
        />

        {/* Type1 start-->*/}
        <Stack.Screen
          name="Type1ProcessScreen"
          component={Type1ProcessScreen}
          options={{ headerShown: true, title: 'Guj. State Plastics\nMember List' }} />
        <Stack.Screen
          name="Type1SaveScreen"
          component={Type1SaveScreen}
          options={{ headerShown: true, }} />
        {/* Type1 end-->*/}

        {/* Type2 start-->*/}
        <Stack.Screen
          name="Type2ProcessScreen"
          component={Type2ProcessScreen}
          options={{ headerShown: true, title: 'Plastivision Exhibitor Directory' }} />
        <Stack.Screen
          name="Type2SaveScreen"
          component={Type2SaveScreen}
          options={{ headerShown: true }} />
        {/* Type2 end-->*/}

        {/* Type3 start-->*/}
        <Stack.Screen
          name="Type3ProcessScreen"
          component={Type3ProcessScreen}
          options={{ headerShown: true, title: 'TAPMA Exhibitors Directory' }} />
        <Stack.Screen
          name="Type3SaveScreen"
          component={Type3SaveScreen}
          options={{ headerShown: true }} />
        {/* Type3 end-->*/}

        {/* Type4 start-->*/}
        <Stack.Screen
          name="Type4ProcessScreen"
          component={Type4ProcessScreen}
          options={{ headerShown: true, title: 'AIPMA Exhibitors Directory' }} />
        <Stack.Screen
          name="Type4SaveScreen"
          component={Type4SaveScreen}
          options={{ headerShown: true }} />
        {/* Type4 end-->*/}

        {/* Type5 start-->*/}
        <Stack.Screen
          name='Type5ProcessScreen'
          component={Type5ProcessScreen}
          options={{ headerShown: true, title: 'Sanand Industries Association Directory' }} />
        <Stack.Screen
          name='Type5SaveScreen'
          component={Type5SaveScreen}
          options={{ headerShown: true }} />
        {/* Type5 end-->*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;
