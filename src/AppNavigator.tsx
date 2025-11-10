import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterAndOtp from "./screens/RegisterAndOtp";
import OtpOnlyScreen from "./screens/OtpOnlyScreen";
import ToggleScreen from "./screens/Togglescreen";

export type RootStackParamList = {
  Login: undefined;
  RegisterAndOtp: { phone: string };
  OTP: { phone: string; autoOtp?: string };
  Toggle: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterAndOtp" component={RegisterAndOtp} />
        <Stack.Screen name="OTP" component={OtpOnlyScreen} />
        <Stack.Screen name="Toggle" component={ToggleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
