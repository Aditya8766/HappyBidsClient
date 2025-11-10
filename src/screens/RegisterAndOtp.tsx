import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, View, StyleSheet, Text, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";
import { useMutation } from "@apollo/client";
import { VERIFY_OTP, VERIFY_EMAIL } from "../graphql/mutations";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterAndOtp">;

export default function RegisterAndOtp({ route, navigation }: Props) {
  const { phone } = route.params;
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyOtp, { loading }] = useMutation(VERIFY_OTP);
  const [verifyEmail] = useMutation(VERIFY_EMAIL);

  const handleRegisterAndVerify = async () => {
    if (!firstName.trim()) {
      Alert.alert("Name required", "Please enter your name");
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address");
        return;
      }

      try {
        const { data } = await verifyEmail({ variables: { email } });
        const res = data?.verifyEmailId;
        if (!res?.available) {
          Alert.alert("Email Unavailable", res?.message || "Email already in use");
          return;
        }
      } catch (err: any) {
        console.error("Email verification error:", err);
        Alert.alert("Error", err.message || "Email verification failed");
        return;
      }
    }

    if (otp.length < 4) {
      Alert.alert("Invalid OTP", "Enter the OTP you received");
      return;
    }

    try {
      const input = { firstName, phoneNumber: phone, otp };
      const { data } = await verifyOtp({ variables: { input } });
      const res = data?.verifyOTP;

      if (!res?.success) {
        Alert.alert("Verification failed", "OTP verification failed");
        return;
      }

      await AsyncStorage.setItem("accessToken", res.accessToken);
      await AsyncStorage.setItem("idToken", res.idToken);
      await AsyncStorage.setItem("refreshToken", res.refreshToken);

      navigation.replace("Toggle");
    } catch (err: any) {
      console.error("OTP verification error:", err);
      Alert.alert("Error", err.message || "Verification failed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Complete Registration</Text>

          <TextInput 
            placeholder="Full Name" 
            value={firstName} 
            onChangeText={setFirstName} 
            style={styles.input} 
          />

          <TextInput
            placeholder="Email (optional)"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            style={styles.input}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegisterAndVerify}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify & Register"}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 16
  },
  button: {
    width: '100%',
    backgroundColor: '#0077b6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
