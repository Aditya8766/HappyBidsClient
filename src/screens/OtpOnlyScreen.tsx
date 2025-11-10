import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMutation, gql } from "@apollo/client";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";

const VERIFY_OTP = gql`
  mutation VerifyOTP($phoneNumber: String!, $otp: String!) {
    verifyOTP(input: { phoneNumber: $phoneNumber, otp: $otp }) {
      success
      message
      accessToken
      idToken
      refreshToken
    }
  }
`;

type Props = NativeStackScreenProps<RootStackParamList, "OTP">;

export default function OtpScreen({ route, navigation }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const [verifyOtp, { loading }] = useMutation(VERIFY_OTP);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter a valid OTP");
      return;
    }

    try {
      const { data } = await verifyOtp({
        variables: { phoneNumber: phone, otp: enteredOtp },
      });

      const res = data?.verifyOTP;
      if (res?.success) {
        Alert.alert("Success", "OTP verified successfully!");
        navigation.replace("Toggle");
      } else {
        Alert.alert("Failed", res?.message || "OTP verification failed");
      }
    } catch (err: any) {
      console.error("OTP verify error:", err);
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>Sent to {phone}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>
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
    marginBottom: 16,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 30,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  otpBoxEmpty: {
    borderColor: "#ccc",
    backgroundColor: "#f8f8f8",
  },
  otpBoxFilled: {
    borderColor: "#0077b6",
    backgroundColor: "#e3f2fd",
  },
  button: {
    width: "80%",
    backgroundColor: "#0077b6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
