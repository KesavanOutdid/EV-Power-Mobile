import React from 'react';
import { View } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

const ScanScreen = () => {
  const onQRCodeRead = (event) => {
    console.log('QR Code scanned:', event.data);
    // Handle the scanned QR code data as needed
  };

  return (
    <View style={{ flex: 1 }}>
      <QRCodeScanner
        onRead={onQRCodeRead}
        reactivate={true}
        reactivateTimeout={2000}
        showMarker={true}
        markerStyle={{ borderColor: 'red', borderRadius: 10 }}
        containerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    </View>
  );
};

export default ScanScreen;
