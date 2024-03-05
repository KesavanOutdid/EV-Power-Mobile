import React from 'react';
import { View, Text, Button } from 'react-native';

const NetworkErrorScreen = ({ onRetry }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Network Error: Please check your network connection...</Text>
      <Button title="Retry" onPress={onRetry} />
    </View>
  );
};

export default NetworkErrorScreen;
