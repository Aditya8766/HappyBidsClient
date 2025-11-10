import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Alert, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";
import { useMutation, gql } from "@apollo/client";

const SEND_OTP = gql`
  mutation SendOTP($phoneNumber: String!) {
    sendOTP(phoneNumber: $phoneNumber) {
      success
      message
      isNewUser
    }
  }
`;

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState("");
  const [sendOtp, { loading }] = useMutation(SEND_OTP);

  const handleNext = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
      console.log("Sending OTP for:", phoneNumber);

      const { data } = await sendOtp({ variables: { phoneNumber } });
      console.log("OTP API Response:", data);

      const res = data?.sendOTP;
      if (!res) {
        Alert.alert("Error", "No response from server.");
        return;
      }

      if (!res.success) {
        Alert.alert("Error", res.message || "Failed to send OTP");
        return;
      }

      if (res.isNewUser) {
        navigation.navigate("RegisterAndOtp", { phone: phoneNumber });
      } else {
        navigation.navigate("OTP", { phone: phoneNumber });
      }
    } catch (err: any) {
      console.error("OTP send error:", JSON.stringify(err, null, 2));
      const networkError = err?.networkError?.message;
      const graphQLErrors = err?.graphQLErrors?.map((e: any) => e.message).join(", ");
      const finalMessage =
        networkError || graphQLErrors || err.message || "Network issue. Try again later.";
      Alert.alert("Error", finalMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Login / Sign Up</Text>

          <TextInput
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Sending..." : "Next"}</Text>
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
