import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { COLORS, images, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import TextInput from '../components/TextInput';

const Setting = ({ navigation, route  }) => {
  // Extract the username from the route parameters
  const {username} = route.params;

  // Define a state for toggling the profile item
  const [showProfile, setShowProfile] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showWalletTransactions, setShowWalletTransactions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const handleOptionClick = (option) => {
    setShowProfile(option === 'profile');
    setShowSessionDetails(option === 'sessionDetails');
    setShowWalletTransactions(option === 'walletTransactions');
    setShowHelp(option === 'help');
  };

  // Get user charging session details
  const handleChargingSessionDetails = (username) => {
    fetchChargingSessionDetails(username);
  }
  const [sessionDetails, setSessionDetails] = useState('');

  const fetchChargingSessionDetails = async (username) => {
    try {
      const response = await fetch(`http://122.166.210.142:8052/getChargingSessionDetails?username=${username}`);
      const data = await response.json();
      setSessionDetails(data.value);
    } catch (error) {
      console.error('Error fetching charging session details:', error);
    }
  };

    useEffect(() => {
  }, [username]);

  // Get user transaction details
  const handleTransactionDetails = (username) => {
    fetchTransactionDetails(username);
  }
  const [transactionDetails, setTransactionDetails] = useState('');

  const fetchTransactionDetails = async (username) => {
    try {
      const response = await fetch(`http://122.166.210.142:8052/getTransactionDetails?username=${username}`);
      const data = await response.json();
      setTransactionDetails(data.value);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

    useEffect(() => {
  }, [username]);

  const [name, setUserName] = useState(null);
  const [phone, setUserPhone] = useState(null);
  const [password, setUserPass] = useState(null);

  // Profile data get
  const fetchUserDetails = async (username) => {
    try {
      const response = await fetch(`http://122.166.210.142:8052/getUserDetails?username=${username}`);
      
      if (response.ok) {
        const data = await response.json();
        const userDetails = data.value;
        setUserName(userDetails.username);
        setUserPhone(userDetails.phone);
        setUserPass(userDetails.password);
      } else {
        const errorMessage = await response.text();
        Alert.alert('Failed to fetch user details', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error fetching user details:', error.message);
    }
  };
 
  // Validation update user details
  const validateFields = () => {
    if (!name) return "Name can't be empty.";
    const phoneRegex = /^\d{10}$/;
    if (!phone) return "Phone can't be empty.";
    if (!phoneRegex.test(phone)) return 'Oops! Phone must be a 10-digit number.';
    const passwordRegex = /^\d{4}$/;
    if (!password) return "Password can't be empty.";
    if (!passwordRegex.test(password)) return 'Oops! Password must be a 4-digit number.';
    return null; // Validation passed
  };

  const onUpdate = async () => {
    const validationError = validateFields();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }
  
    try {
      const updatedData = {
        updateUsername: name,
        updatePhone: phone,
        updatePass: password,
      };
  
      const response = await fetch(`http://122.166.210.142:8052/updateUserDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        const data = await response.json();
        const message = data.message;
        Alert.alert('Update successfully', message);
        setShowProfile(false);
      } else {
        const errorMessage = await response.text();
        Alert.alert('Update Failed', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during Update. Please try again later.');
    }
  };
  
  // email link 
  const email = 'evpower@gmail.com';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}`);
  };

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

          <View style={{backgroundColor: COLORS.gray, borderRadius:10, marginTop: SIZES.padding, width: SIZES.width - 44, marginTop:30}}>
            <View style={styles.marginTopBottom1}>
              <Text style={[styles.menuItem, { ...FONTS.h2 }]}>Settings</Text>
              <TouchableOpacity onPress={() => {handleOptionClick('profile'),  fetchUserDetails(username);}}>
                <Text style={[styles.menuItem, { ...FONTS.h5 }]}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {handleOptionClick('sessionDetails'); handleChargingSessionDetails(username);}}>
                <Text style={[styles.menuItem, { ...FONTS.h5 }]}>Session Details</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {handleOptionClick('walletTransactions'); handleTransactionDetails(username);}}>
                <Text style={[styles.menuItem, { ...FONTS.h5 }]}>Wallet Transactions</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleOptionClick('help')}>
                <Text style={[styles.menuItem, { ...FONTS.h5 }]}>Help</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('StartScreen')}>
                <Text style={[styles.menuItem, { ...FONTS.h5 }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showProfile &&
          <View style={{backgroundColor: COLORS.gray, borderRadius:10, marginTop: SIZES.padding, width: SIZES.width - 44}}>
            <View style={styles.marginTopBottom1}>
              <Text style={[styles.menuItem, styles.heading,{ ...FONTS.h2 },]}>Profile</Text>
              <View style={styles.row}>
                <View style={[styles.col, styles.col6, styles.centerContent]}>
                  <View style={{ width: '70%', alignSelf: 'center' }}>
                    <TextInput label="Name" returnKeyType="next" value={name || ''} onChangeText={setUserName} editable={false}/>
                    <TextInput label="Phone" returnKeyType="next" value={phone || ''} onChangeText={setUserPhone}/>
                    <TextInput label="Password" returnKeyType="done" value={password || ''} onChangeText={setUserPass}/>
                  </View>
                  <Button mode="contained" style={{ width: 120 }} onPress={onUpdate}>Update</Button>
                </View>
              </View>
            </View>
          </View>}

          {showSessionDetails && 
          <View style={{backgroundColor: COLORS.gray, borderRadius:10, marginTop: SIZES.padding, width: SIZES.width - 44}}>
            <View style={styles.marginTopBottom1}>
              <Text style={[styles.menuItem, styles.heading, { ...FONTS.h2 }]}>Session Details</Text>
              <ScrollView horizontal={true}>
                <View>
                  {Array.isArray(sessionDetails) && sessionDetails.length > 0 ? (
                    <View style={styles.container}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>Sl.No</Text>
                        <Text style={styles.tableHeader}>ChargerID</Text>
                        <Text style={styles.tableHeader}>ChargingSessionID</Text>
                        <Text style={styles.tableHeader}>StartTimestamp</Text>
                        <Text style={styles.tableHeader}>StopTimestamp</Text>
                        <Text style={styles.tableHeader}>Unitconsumed</Text>
                        <Text style={styles.tableHeader}>Price</Text>
                      </View>
                      {sessionDetails.slice(0, 5).map((sessionItem, index) => (
                        <View style={styles.tableRow} key={index}>
                          <Text style={styles.tableCell}>{index + 1}</Text>
                          <Text style={styles.tableCell}>{sessionItem.ChargerID || "-"}</Text>
                          <Text style={styles.tableCell}>{sessionItem.ChargingSessionID || "-"}</Text>
                          <Text style={styles.tableCell}>{sessionItem.StartTimestamp ? new Date(sessionItem.StartTimestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : "-"}</Text>
                          <Text style={styles.tableCell}>{sessionItem.StopTimestamp ? new Date(sessionItem.StopTimestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : "-"}</Text>
                          <Text style={styles.tableCell}>{sessionItem.Unitconsumed || "-"}</Text>
                          <Text style={styles.tableCell}>Rs. {sessionItem.price || "-"}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.tableRow, styles.tableCells]}>No Session Details.</Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
          }

          {showWalletTransactions && 
          <View style={{backgroundColor: COLORS.gray, borderRadius:10, marginTop: SIZES.padding, width: SIZES.width - 44}}>
            <View style={styles.marginTopBottom1}>
              <Text style={[styles.menuItem, styles.heading, { ...FONTS.h2 }]}>Wallet Transactions</Text>
              <ScrollView horizontal={true}>
                <View>
                  {transactionDetails.length > 0 ? (
                    <View style={styles.container}>
                      <View style={styles.tableRow2}>
                        <Text style={styles.tableHeader}>Sl.No</Text>
                        <Text style={styles.tableHeader}>Status</Text>
                        <Text style={styles.tableHeader}>Amount</Text>
                        <Text style={styles.tableHeader}>Time</Text>
                      </View>
                      {transactionDetails.slice(0, 5).map((transactionItem, index) => (
                        <View style={styles.tableRow2} key={index}>
                          <Text style={styles.tableCell}>{index + 1}</Text>
                          <Text style={styles.tableCell}>{transactionItem.status || "-"}</Text>
                          <Text style={[styles.tableCell, { color: transactionItem.status === 'Credited' ? 'green' : transactionItem.status === 'Deducted' ? 'red' : 'black' }]}>
                            <Text style={{ fontWeight: 'bold' }}>
                              {transactionItem.amount ? (transactionItem.status === 'Credited' ? "+ Rs. " + transactionItem.amount : transactionItem.status === 'Deducted' ? "-  Rs. " + transactionItem.amount : "-") : "-"}
                            </Text>
                          </Text>
                          <Text style={styles.tableCell}>{transactionItem.time ? new Date(transactionItem.time).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : "-"}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.tableRow2, styles.tableCell]}>No Transaction.</Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
          }

          {showHelp && 
          <View style={{backgroundColor: COLORS.gray, borderRadius:10, marginTop: SIZES.padding, width: SIZES.width - 44}}>
            <View style={styles.marginTopBottom1}>
              <Text style={[styles.menuItem, styles.heading,{ ...FONTS.h2 }]}>Help</Text>
              <Text style={[styles.menuItem2, { ...FONTS.h3 }]}>Need help? Contact us!</Text>
              <Text style={[styles.menuItem2, { ...FONTS.h5 }]}>If you require assistance or have any questions, feel free to reach out to us via <Text style={{ color: 'green' }}>email</Text> or <Text style={{ color: 'green' }}>WhatsApp</Text>.</Text>
              <Text style={[styles.menuItem2, { ...FONTS.h5 }]}>Emai-ID :<Text style={styles.link}>{email}</Text>
                <TouchableOpacity onPress={handleEmailPress}>
                  <Text style={styles.link}>{''}</Text>
                </TouchableOpacity>
              </Text>
              <Text style={[styles.menuItem2, { ...FONTS.h5 }]}>WhatsApp Number : 95959XXXXX</Text>
              <Text style={[styles.menuItem2, { ...FONTS.h5 }]}>We're here to help you!</Text>
            </View>
          </View>
          }
        </View>
      </ScrollView>  
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  marginTopBottom1: {
    marginTop:15,
    marginBottom:15,
    marginRight:20,
    marginLeft:20,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderColor: '#83838338',
    paddingVertical: 5,
    padding:10,
    paddingTop:15,
    paddingBottom:15,
  },
  menuItem2: {
    padding:10,
    paddingTop:5,
    paddingBottom:5,
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
    link: {
      color: 'blue',
      textDecorationLine: 'underline',
    },
    heading:{
    color:'green',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingVertical: 10,
      width:900,
    },
    tableRow2: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingVertical: 10,
      width:400,
    },
    tableHeader: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
    },
    tableCells:{
      flex: 1,
      padding:10,
    },
    container: {
      flexDirection: 'column',
    },
})
export default Setting
