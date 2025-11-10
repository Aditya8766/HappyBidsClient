import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation } from "@apollo/client";
import { ADD_PRODUCT, VERIFY_EMAIL } from "../graphql/mutations";

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

function countWords(text: string) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const SellerFormScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photos, setPhotos] = useState<{ uri: string; size: number | undefined }[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 24 * 3600 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addProduct] = useMutation(ADD_PRODUCT);
  const [verifyEmail] = useMutation(VERIFY_EMAIL);

  const pickMedia = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow photo library access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (result.canceled) return;

      for (const asset of result.assets) {
        const uri = asset.uri;
        const size = asset.fileSize;
        if (size && size > MAX_PHOTO_BYTES) {
          Alert.alert("Photo too large", "Each photo must be under 20 MB.");
          continue;
        }
        setPhotos((p) => [...p, { uri, size }]);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message ?? "Could not pick media");
    }
  };

  const openCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      const uri = asset.uri;
      const size = asset.fileSize;

      if (size && size > MAX_PHOTO_BYTES) {
        Alert.alert("Photo too large", "Photo must be under 20 MB.");
        return;
      }
      setPhotos((p) => [...p, { uri, size }]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message ?? "Could not use camera");
    }
  };

  const validateAndSubmit = async () => {
    if (!name.trim()) return Alert.alert("Error", "Product name is required");
    if (!description.trim()) return Alert.alert("Error", "Description is required");
    if (countWords(description) > 100) return Alert.alert("Error", "Description must be 100 words or less");
    if (!price.trim()) return Alert.alert("Error", "Bid price is required");
    if (endDate <= startDate)
      return Alert.alert("Invalid end date", "End date must be after start date");

    if (email.trim()) {
      try {
        const { data } = await verifyEmail({ variables: { email } });
        const result = data?.verifyEmailId;
        if (!result?.available) {
          Alert.alert("Email already used", result?.message || "Try a different email");
          return;
        }
      } catch (error: any) {
        console.error(error);
        Alert.alert("Error", error.message || "Failed to verify email");
        return;
      }
    }

    setLoading(true);
    try {
      const imageUrls = photos.map((p) => p.uri);

      const input = {
        name,
        expectedPrice: parseFloat(price),
        bidStartDate: startDate.getTime(),
        bidEndDate: endDate.getTime(),
        imageUrls,
        descriptionText: description,
        userId: "user-12345",
        location: {
          lat: 12.9716,
          lng: 77.5946,
        },
        locationName: location || "Unknown",
      };

      const { data } = await addProduct({ variables: { input } });

      setLoading(false);

      if (data?.addProduct) {
        Alert.alert("Success", `Product added! ID: ${data.addProduct.productId}`);
        console.log("Product added:", data.addProduct);
      } else {
        Alert.alert("Error", "Failed to add product");
      }
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Seller — Post an Auction</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput 
          value={name} 
          onChangeText={setName} 
          style={styles.textInput}
          placeholder="Enter product name" 
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email (for verification)</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.textInput}
          placeholder="Enter your email"
        />
      </View>

      <Text style={styles.label}>Photos (max 20 MB each)</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={pickMedia}>
          <Text style={styles.buttonText}>Pick Photos</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Camera</Text>
        </Pressable>
      </View>

      <ScrollView horizontal style={{ marginVertical: 8 }} showsHorizontalScrollIndicator={false}>
        {photos.map((p, idx) => (
          <View key={idx} style={styles.thumbWrap}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <TouchableOpacity onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))} style={styles.removeBtn}>
              <Text style={{ color: "#fff", fontSize: 12 }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description (max 100 words)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.textInput, { height: 100, textAlignVertical: 'top', paddingTop: 8 }]}
          placeholder="Enter product description"
        />
        <Text style={styles.helperText}>{countWords(description)} / 100 words</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location (optional)</Text>
        <TextInput 
          value={location} 
          onChangeText={setLocation} 
          style={styles.textInput}
          placeholder="Enter location" 
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pincode (optional)</Text>
        <TextInput 
          value={pincode} 
          onChangeText={setPincode} 
          keyboardType="numeric" 
          style={styles.textInput}
          placeholder="Enter pincode"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bid Start Date</Text>
        <Pressable 
          style={styles.button} 
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.buttonText}>{startDate.toDateString()}</Text>
        </Pressable>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(_, d) => {
              setShowStartPicker(false);
              if (d) setStartDate(d);
            }}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bid End Date</Text>
        <Pressable 
          style={styles.button} 
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.buttonText}>{endDate.toDateString()}</Text>
        </Pressable>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(_, d) => {
              setShowEndPicker(false);
              if (d) setEndDate(d);
            }}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Starting Bid Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.textInput}
          placeholder="Enter starting bid price"
        />
      </View>

      <Pressable 
        style={[styles.button, { marginTop: 12 }, loading && styles.buttonDisabled]} 
        onPress={validateAndSubmit} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Posting..." : "Post Bid"}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrap: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 24,
    fontWeight: 'bold',
    color: "#000", 
    marginVertical: 16,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 16
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  },
  label: { 
    color: "#000", 
    fontSize: 16,
    marginBottom: 8 
  },
  helperText: {
    color: "#777",
    fontSize: 12,
    marginTop: 4
  },
  row: { 
    flexDirection: "row", 
    gap: 8,
    marginBottom: 16
  },
  button: {
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
  },
  thumbWrap: { 
    marginRight: 8, 
    position: "relative" 
  },
  thumb: { 
    width: 120, 
    height: 90, 
    borderRadius: 8 
  },
  removeBtn: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  }
});

export default SellerFormScreen;
