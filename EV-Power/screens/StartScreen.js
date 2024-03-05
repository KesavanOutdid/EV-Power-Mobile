import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import { images } from '../constants'
import { Image} from 'react-native'
export default function StartScreen({ navigation }) {
  return (
    <Background>
      <Logo />
      {/* <Header>Login Template</Header> */}
      <Image source={images.logo} resizeMode="contain" style={{ width:100, height:50 }}/>
      <Paragraph>
        The easiest way to start with your amazing application.
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button>
    </Background>
  )
}
