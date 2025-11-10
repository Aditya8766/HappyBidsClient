import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 16
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#0077b6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

const BuyerFormScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !bidAmount.trim()) return Alert.alert('Error', 'Please fill name and bid');
    Alert.alert('Bid submitted', `Thank you ${name}, you bid ₹${bidAmount} (demo)`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buyer — Place a Bid</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          placeholder="Your Name" 
          value={name} 
          onChangeText={setName}
          style={styles.input}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput 
          placeholder="Bid Amount" 
          keyboardType="numeric" 
          value={bidAmount} 
          onChangeText={setBidAmount}
          style={styles.input}
        />
      </View>
      <Pressable 
        style={styles.button} 
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Submit Bid</Text>
      </Pressable>
    </View>
  );
};
export default BuyerFormScreen;
