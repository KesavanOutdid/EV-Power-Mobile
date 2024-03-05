import { View, Text, Image, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, images, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/FontAwesome';

const Home = ({ navigation, route  }) => {
    // Extract the username from the route parameters
    const {username} = route.params;
    const [walletBalance, setWalletBalance] = useState(null);

    // Get user wallet balance
    const fetchWalletBalance = async (username) => {
        try {
            const response = await fetch(`http://122.166.210.142:8052/GetWalletBalance?username=${username}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch wallet balance');
            }
        
            const data = await response.json();
            setWalletBalance(data.balance);
        } catch (error) {
            // Show alert with error message
            Alert.alert('Error fetching wallet balance. Please try again later.', error.message);
        }
    };

    useEffect(() => {
        // Check if username is available before fetching wallet balance
        if (username) {
            fetchWalletBalance(username);
        } else {
            // Show alert if username is not available
            Alert.alert('Error', 'Username not available.');
        }
    }, [username]);
    

    // Recharge wallet 
    const [selectedValue, setSelectedValue] = useState(null);
    const [amount, setAmount] = useState({ value: '', error: '' });
    //  alert(JSON.stringify(amount));

    const handleButtonPress = (value) => {
        setSelectedValue(value);
        Alert.alert('Selected Value', `You selected: Rs.${value}`);
    };

    const onRechargeAmount = () => {
        const amountValue = parseFloat(amount.value);
        if (isNaN(amountValue) || amountValue < 500) {
            setAmount({ ...amount, error: 'Amount must be at least 500' });
            Alert.alert('Error', 'Amount must be at least 500');
        } else {
            setAmount({ ...amount, error: '' });
            Alert.alert('Recharging with amount:', `${amountValue}`);
        }
    };

    // Search device in QR
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    // const [text, setText] = useState('Not yet scanned');
    const [scannerOpen, setScannerOpen] = useState(false); // State to control scanner visibility
  
    const askForCameraPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    }
  
    useEffect(() => {
      askForCameraPermission();
    }, []);
  
    const handleBarCodeScanned = async ({ data }) => {
        if(data){
          setScannerOpen(false);
        };
        try {
          const response = await fetch('http://122.166.210.142:8052/SearchCharger', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ searchChargerID: data, Username: username }),
          });
      
          if (response.ok) {
            setScanned(true);
            setScannerOpen(false);
            navigation.navigate('Search', { ChargerID: data });
          } else {
            const errorData = await response.json();
            if(errorData === 'Charger is already in use !'){
                Alert.alert(errorData.message);
            } else {
                Alert.alert('Not found', 'Charger ID not found: ' + data);
            }
          }
        } catch (error) {
          Alert.alert('Error', error.message);
        }
    };

    const handleScanButtonPress = () => {
      setScanned(false);
      setScannerOpen(true);
    //   setText('Not yet scanned');
    };
  
    const handleCloseScanner = () => {
      setScannerOpen(false);
    };
  
    if (hasPermission === null) {
      return (
        <View style={styles.containerScan}>
          <Text>Requesting for camera permission</Text>
        </View>
      );
    }
    if (hasPermission === false) {
      return (
        <View style={styles.containerScan}>
          <Text style={{ margin: 10 }}>No access to camera</Text>
          <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
        </View>
      );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={{marginHorizontal: 22,marginTop: 25, marginBottom:80}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Image source={images.logo} resizeMode="contain" style={{ width: 88, height: 32 }}/>
                        <View>
                            <Text style={{...FONTS.h3}}>Welcome <Text style={{color:"green"}}>{username}</Text></Text>
                        </View>
                    </View> 

                    <View style={{backgroundColor: COLORS.gray, borderRadius: 20, marginTop: SIZES.padding, width: SIZES.width - 44, marginTop:30 }}>
                        <View style={styles.marginTopBottom1}>
                            <View style={styles.row}>
                                <View style={[styles.col, styles.col6, styles.centerContent]}>
                                    <Text style={{...FONTS.h3}}>My Wallet</Text>
                                    <Text style={{...FONTS.body4, marginVertical: 10}}>{walletBalance !== null ? `Available balance: Rs. ${walletBalance}` : 'Loading wallet balance...'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{backgroundColor: COLORS.gray, borderRadius: 20, marginTop: SIZES.padding, width: SIZES.width - 44 }}>
                        <View style={styles.marginTopBottom}>
                            <View style={styles.row}>
                                <View style={[styles.col, styles.col6, styles.centerContent]}>
                                    <Text style={{...FONTS.h3}}>Recharge Wallet</Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.col, styles.col12, styles.centerContent]}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.dataContainer}>
                                            <Button mode="contained" style={[styles.buttonAmt, { width: 110 }]} labelStyle={styles.buttonText} onPress={() => handleButtonPress(500)}>Rs.500</Button>
                                            <Button mode="contained" style={[styles.buttonAmt, { width: 110 }]} labelStyle={styles.buttonText} onPress={() => handleButtonPress(1000)}>Rs.1000</Button>
                                            <Button mode="contained" style={[styles.buttonAmt, { width: 110 }]} labelStyle={styles.buttonText} onPress={() => handleButtonPress(2000)}>Rs.2000</Button>
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                            
                            <View style={styles.row}>
                                <View style={[styles.col, styles.col12, styles.centerContent]}>
                                    <View style={styles.dataContainer}>
                                        <View style={{ alignItems: 'center' }}> 
                                            <TextInput label="Enter Amount" returnKeyType="next" style={{ width: 250 }} value={amount.value} onChangeText={(number) => setAmount({ value: number, error: '' })} error={!!amount.error} errorText={amount.error}/>
                                            <Button mode="contained" style={[styles.button]} labelStyle={styles.buttonTexts} onPress={onRechargeAmount}>Submit</Button>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{backgroundColor: COLORS.gray, borderRadius: 20, marginTop: SIZES.padding, width: SIZES.width - 44 }}>
                        <View style={styles.marginTopBottom}>
                            <View style={styles.row}>
                                <View style={[styles.col, styles.col6, styles.centerContent]}>
                                    <Text style={FONTS.h3}> <Text style={{ color: 'green' }}>SEARCH </Text>DEVICE</Text>
                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={scannerOpen}
                                        onRequestClose={() => {
                                            handleCloseScanner();
                                        }}
                                    >
                                        <View style={styles.centeredView}>
                                            <View style={styles.modalView}>
                                                {scannerOpen && (
                                                    <>
                                                        <View style={styles.barcodebox}>
                                                            <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                                                                style={{ height: 400, width: 400 }} />
                                                        </View>
                                                        <Button mode="contained" style={[styles.buttonAmt, {width:150}]} labelStyle={styles.buttonText} onPress={handleCloseScanner}>Close Scanner</Button>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    </Modal>
                                    {!scannerOpen && (
                                        <Button mode="contained" style={{width:150}} onPress={handleScanButtonPress}> <Icon name="qrcode" size={15} color="white"/>  Scan </Button>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>    
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

    const styles = StyleSheet.create({
        scrollViewContent: {
        flexGrow: 1,
        },
        container: {
        flex: 1,
        flexDirection: 'column', // Layout from top to bottom
        },
        row: {
        flexDirection: 'row', // Layout from left to right
        flexWrap: 'wrap', // Wrap items to next line if they exceed the container width
        marginHorizontal: 12, // Horizontal margin
        marginVertical: SIZES.padding, // Vertical margin
        },
        col: {
        flexGrow: 1, // Allow column to grow and occupy available space
        flexBasis: '0%', // Reset base width
        },
        col6: {
        width: '50%', // Set width to 50% for a column in a 12-column grid system
        },
        centerContent: {
        alignItems: 'center', // Center content vertically
        justifyContent: 'center', // Center content horizontally
        },
        col12: {
            width: '100%',
        },
        dataContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 10,
        },
        rows: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between', // Optional: adjust the spacing between TextInput and Button
            paddingHorizontal: 16, // Optional: adjust horizontal padding
            marginVertical: 8, // Optional: adjust vertical margin
        },
        button: {
            width: 148,
            height: 50,
            borderWidth: 1,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#c2fbc2cc', // Light red background
            borderColor: 'green', // Red border color
        },
        buttonAmt: {
            marginHorizontal: 3,
            backgroundColor: '#ffe7e7', // Light red background
            borderColor: 'red', // Red border color
            borderWidth: 1, // Border width
            borderRadius: 8, // Border radius
        },
        buttonText: {
            color: 'red', // Set text color to red
        },
        buttonTexts: {
            color: 'green', // Set text color to red
        },
        marginTopBottom: {
            marginTop:25,
            marginBottom:25,
        },
        marginTopBottom1: {
            marginTop:15,
             marginBottom:15,
        },
        containerScan: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
        },
        maintext: {
            fontSize: 16,
        },
        barcodebox: {
            alignItems: 'center',
            justifyContent: 'center',
            height:250,
            width: 250,
            overflow: 'hidden',
            marginTop:10,
        },
        modalView: {
            marginTop:350,
            margin: 50,
            backgroundColor: 'white',
            borderRadius: 20,
            padding:5,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        closeButton: {
            marginTop: 20,
        },
    });
export default Home