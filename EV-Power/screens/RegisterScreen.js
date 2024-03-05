import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import { Text } from 'react-native-paper';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { nameValidator } from '../helpers/nameValidator';
import { phoneValidator } from '../helpers/phoneValidator';
import { passwordValidator } from '../helpers/passwordValidator';
import axios from 'axios';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState({ value: '', error: '' })
  const [phone, setPhone] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  // alert(JSON.stringify(name));
  // alert(JSON.stringify(phone));
  // alert(JSON.stringify(password));

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value);
    const phoneError = phoneValidator(phone.value);
    const passwordError = passwordValidator(password.value);
    if (nameError || phoneError || passwordError) {
      setName({ ...name, error: nameError });
      setPhone({ ...phone, error: phoneError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    try {
      const response = await axios.post('http://122.166.210.142:8052/RegisterNewUser', {
        registerUsername: name.value,
        registerPhone: phone.value,
        registerPassword: password.value,
      });
    
      if (response.status === 200) {
        const data = response.data;
        const message = data.message;
        Alert.alert('Registered successfully', message);
        // handle success, navigate to next screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      } else {
        // handle error, display error message
        const errorMessage = response.data.error || 'Registered failed. Please check your credentials.';
        Alert.alert('Registration Failed', errorMessage);
      }
    } catch (error) {
      // console.error('An error occurred during registration:', error);
      // handle error, display error message
      Alert.alert('Error', 'An error occurred during registration. Please try again later.');
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Create Account</Header>
      <TextInput label="Name" returnKeyType="next" value={name.value} onChangeText={(text) => setName({ value: text, error: '' })} error={!!name.error} errorText={name.error}/>
      <TextInput label="Phone" returnKeyType="next" value={phone.value} onChangeText={(number) => setPhone({ value: number, error: '' })} error={!!phone.error} errorText={phone.error}/>
      <TextInput label="Password" returnKeyType="done" value={password.value} onChangeText={(number) => setPassword({ value: number, error: '' })} error={!!password.error} errorText={password.error}/>
      <Button mode="contained" onPress={onSignUpPressed} style={{ marginTop: 24 }}>Sign Up</Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})
