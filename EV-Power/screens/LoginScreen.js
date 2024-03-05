import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, View, Alert } from 'react-native'
import { Text } from 'react-native-paper'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { nameValidator } from '../helpers/nameValidator'  
import { passwordValidator } from '../helpers/passwordValidator'

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  // alert(JSON.stringify(name));
  // alert(JSON.stringify(password));
 
  const onLoginPressed = async () => {    
    const nameError = nameValidator(name.value)
    const passwordError = passwordValidator(password.value)
    if ( nameError || passwordError) {
      setName({ ...name, error: nameError })
      setPassword({ ...password, error: passwordError })
      return
    }
   
    try {
      const response = await fetch('http://122.166.210.142:8052/CheckLoginCredentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          loginUsername: name.value,
          loginPassword: password.value,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const message = data.message;
        Alert.alert('Login successfully', message);
        // handleLogin(data, name.value); // Pass data and username to handleLogin
        // handle success, navigate to next screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomTabNavigation', params: { username:name.value } }],
        });
      } else {
        const errorData = await response.json();
        // handle error, display error message
        const errorMessage = errorData.error || 'Login failed. Please check your credentials.';
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error) {
      // console.error('An error occurred during login:', error);
      // handle error, display error message
      Alert.alert('Error', 'An error occurred during login. Please try again later.');
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back</Header>
      <TextInput label="Name" returnKeyType="next" value={name.value} onChangeText={(text) => setName({ value: text, error: '' })} error={!!name.error} errorText={name.error}/>
      <TextInput label="Password" returnKeyType="done" value={password.value} onChangeText={(number) => setPassword({ value: number, error: '' })} error={!!password.error} errorText={password.error} secureTextEntry />
      <Button mode="contained" onPress={onLoginPressed}>Login</Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})
