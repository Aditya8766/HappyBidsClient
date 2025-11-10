import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BuyerFormScreen from './BuyerFormScreen';
import SellerFormScreen from './SellerFormScreen';

export default function ToggleScreen() {
  const [role, setRole] = useState('buyer');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Role</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity style={[styles.toggleButton, role === 'buyer' && styles.activeButton]} onPress={() => setRole('buyer')}>
          <Text style={[styles.toggleText, role === 'buyer' && styles.activeText]}>Buyer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toggleButton, role === 'seller' && styles.activeButton]} onPress={() => setRole('seller')}>
          <Text style={[styles.toggleText, role === 'seller' && styles.activeText]}>Seller</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.screenContainer}>{role === 'buyer' ? <BuyerFormScreen /> : <SellerFormScreen />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
    marginBottom: 24,
    textAlign: 'center'
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginHorizontal: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#f0f0f0",
  },
  activeButton: {
    backgroundColor: "#0077b6",
    borderColor: "#0077b6",
  },
  toggleText: {
    fontSize: 16,
    color: "#333",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  screenContainer: {
    flex: 1,
  },
});
