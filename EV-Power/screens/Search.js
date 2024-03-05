import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, Image, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal, ActivityIndicator} from 'react-native'
import { COLORS, images, SIZES, FONTS } from '../constants'
import Button from '../components/Button'

const Search = ({route, navigation}) => {
  // Extract the username from the route parameters
  const {username, ChargerID} = route.params;

  useEffect(() => {
    if (ChargerID) {
      FetchLaststatus(ChargerID);
    }
  }, [ChargerID]);
  
  // Error history
  const [showTableHeader, setShowTableHeader] = useState(false);

  // Function to fetch error history
  const fetchErrorHistory = () => {
      setShowTableHeader(!showTableHeader); // Toggle the state to show/hide table header
  };
 
  const [ChargerStatus, setChargerStatus] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata'})); // Initialize with the current date/time


  // Last status
  async function FetchLaststatus(ChargerID){
    try {
      const response = await fetch('http://122.166.210.142:8052/FetchLaststatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: ChargerID }),
      });

      if (response.ok) {
        const data = await response.json();
        const status = data.message.status;
        // const formattedTimestamp = data.message.timestamp;
        const formattedTimestamp = formatTimestamp(data.message.timestamp);
        if(status === 'Available'){
           startTimeout();
        }
        setChargerStatus(status);
        setTimestamp(formattedTimestamp);
        AppendStatusTime(status, formattedTimestamp);
      } else {
        Alert.alert(`Failed to fetch status. Status code: ${response.status}`);
      }
    } catch (error) {
      Alert.alert(`Error while fetching status: ${error.message}`);
    }
  };

  // Effect to handle WebSocket connection
  const [socket, setSocket] = useState(null);
  const [checkFault, setCheckFault] = useState(false);
  const [historys, setHistory] = useState([]);
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [power, setPower] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [temperature, setTemperature] = useState(0);

  useEffect(() => {
    if (!socket && ChargerID) {
      const newSocket = new WebSocket('ws://122.166.210.142:7050');

      newSocket.onopen = () => {
        console.log('WebSocket connection opened');
      };

      newSocket.onmessage = (event) => {
        const parsedMessage = JSON.parse(event.data);
        RcdMsg(parsedMessage);
      };

      newSocket.onclose = (event) => {
        console.log('WebSocket connection closed');
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    };
  }, [ChargerID, socket]);

  function RcdMsg(parsedMessage) {
    let ChargerStatus;
    let CurrentTime;
    let errorCode;
    let user = username;
    const { DeviceID, message } = parsedMessage;

    if (DeviceID === ChargerID) {
      switch (message[2]) {
        case 'StatusNotification':
          ChargerStatus = message[3].status;
          CurrentTime = formatTimestamp(message[3].timestamp);
          errorCode = message[3].errorCode;
          console.log(`ChargerID ${DeviceID}: {"status": "${ChargerStatus}","time": "${CurrentTime}","error": "${errorCode}"}`);
          if (ChargerStatus === 'Preparing') {
            stopTimeout();
          }
          if (ChargerStatus === 'Available') {
            startTimeout();
          }
          if (ChargerStatus === 'Charging') {
            stopTimeout();  
          }
          if (errorCode !== 'NoError') {
            setHistory((historys) => [
              ...historys,
              {
                serialNumber: historys.length + 1,
                currentTime: CurrentTime,
                chargerStatus: ChargerStatus,
                errorCode: errorCode,
              },
            ]);
            setCheckFault(true);
          } else {
            setCheckFault(false);
          }
          break;

        case 'Heartbeat':
          CurrentTime = getCurrentTime();
          setTimestamp(CurrentTime);
          break;

        case 'MeterValues':
          const meterValues = message[3].meterValue;
          const sampledValue = meterValues[0].sampledValue;
          const formattedJson = convertToFormattedJson(sampledValue);

          const updatedValues = {
            voltage: formattedJson['Voltage'],
            current: formattedJson['Current.Import'],
            power: formattedJson['Power.Active.Import'],
            energy: formattedJson['Energy.Active.Import.Register'],
            frequency: formattedJson['Frequency'],
            temperature: formattedJson['Temperature'],
          };
          setChargerStatus('Charging');
          setTimestamp(getCurrentTime());
          setVoltage(updatedValues.voltage);
          setCurrent(updatedValues.current);
          setPower(updatedValues.power);
          setEnergy(updatedValues.energy);
          setFrequency(updatedValues.frequency);
          setTemperature(updatedValues.temperature);
          console.log(`{ "V": ${updatedValues.voltage},"A": ${updatedValues.current},"W": ${updatedValues.power},"Wh": ${updatedValues.energy},"Hz": ${updatedValues.frequency},"Kelvin": ${updatedValues.temperature}}`);
          break;

        case 'Authorize':
          if (checkFault === false) {
            ChargerStatus = 'Authorized';
          }
          CurrentTime = getCurrentTime();
          break;

        case 'FirmwareStatusNotification':
          ChargerStatus = message[3].status.toUpperCase();
          break;

        case 'StopTransaction':
          ChargerStatus = 'Finishing';
          CurrentTime = getCurrentTime();
          setTimeout(() => {
            updateSessionPriceToUser(ChargerID, user);
          }, 5000);
          break;

        case 'Accepted':
          ChargerStatus = 'ChargerAccepted';
          CurrentTime = getCurrentTime();
          break;
      }
    }
    if (ChargerStatus) {
      AppendStatusTime(ChargerStatus, CurrentTime);
    }
  }

  // Get current time
  const getCurrentTime = () => {
    const currentDate = new Date();
    const currentTime = currentDate.toISOString();
    return formatTimestamp(currentTime);
  };

  const formatTimestamp = (originalTimestamp) => {
    const date = new Date(originalTimestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    let ampm = 'AM'; // Default to AM

    // Convert hours to 12-hour format and determine AM/PM
    if (hours >= 12) {
        ampm = 'PM';
        hours %= 12;
    }
    if (hours === 0) {
        hours = 12; // 12 AM is represented as 0 in 24-hour format
    }

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};

  // Function to convert the structure
  const convertToFormattedJson = (measurandArray) => {
    const formattedJson = {};
    measurandArray.forEach(measurandObj => {
      const key = measurandObj.measurand;
      const value = measurandObj.value;
      formattedJson[key] = value;
    });
    return formattedJson;
  };

  const AppendStatusTime = (ChargerStatus, CurrentTime) => {
    setChargerStatus(ChargerStatus);
    setTimestamp(CurrentTime);
  };

  // start button
  const handleStartTransaction = async () => {
    try {
      const response = await fetch('http://122.166.210.142:8052/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: ChargerID, user: username }),
      });

      if (response.status === 200) {
        const data = await response.json();
        // Alert.alert('Start', 'Charger start initiated.');
        console.log(data.message);
      }
    } catch (error) {
      Alert.alert('Error:', error.message);
    }
  };

  // stop button
  const handleStopTransaction = async () => {
    try {
      const response = await fetch('http://122.166.210.142:8052/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: ChargerID }),
      });

      if (response.status === 200) {
        const data = await response.json();
        // Alert.alert('Stop','Charger stop initiated.');
        console.log(data.message);
        setLoading(true);
      }
    } catch (error) {
      Alert.alert('Error:', error.message);
    }
  };

  const [isTimeoutRunning, setIsTimeoutRunning] = useState(false);

  useEffect(() => {
    if (isTimeoutRunning) {
      // Start the timeout when isTimeoutRunning is true
      const id = setTimeout(() => {
        Alert.alert('Timeout', 'Please re-initiate the charger !');
        FetchLaststatus('');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        stopTimeout();
      }, 45000);

      return () => clearTimeout(id);
    }
  }, [isTimeoutRunning]); // useEffect will re-run whenever isTimeoutRunning changes

  const startTimeout = () => {
    setIsTimeoutRunning(true); // Start the timeout by setting isTimeoutRunning to true
  };

  const stopTimeout = () => {
    setIsTimeoutRunning(false); // Stop the timeout by setting isTimeoutRunning to false
  };

  // Charging price details
  const updateSessionPriceToUser = async (ChargerID, user) => {
    try {
      const response = await fetch('http://122.166.210.142:8052/getUpdatedCharingDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chargerID: ChargerID,
          user: user,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let chargingSession = data.value.chargingSession;
        let updatedUser = data.value.user;
        setApiData(chargingSession,updatedUser);
        // handleAlertLodingStop();
      } else {
        // Log or handle error
        console.error('Update failed:', response.statusText);
      }
    } catch (error) {
      // Log or handle error
      console.error('Update failed:', error.message);
    }
  };

  const [chargingSession, setChargingSession] = useState({});
  const [updatedUser, setUpdatedUser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const setApiData = (chargerSession,uservalue) => {
    setChargingSession(chargerSession);
    setUpdatedUser(uservalue);
    setModalVisible(true);
    setLoading(false);
  };

  const toggleModal = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    setModalVisible(!modalVisible);
  };

  // Loding  type
  const [loading, setLoading] = useState(false);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={{marginHorizontal: 22, marginTop: 25, marginBottom:80}}>
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Image source={images.logo} resizeMode="contain" style={{ width: 88, height: 32 }}/>
            <View>
              <Text style={{...FONTS.h3}}>Welcome <Text style={{color:"green"}}>{username}</Text></Text>
            </View>
          </View> 

          <View style={{backgroundColor: COLORS.gray, borderRadius: 20, marginTop: SIZES.padding, width: SIZES.width - 44, marginTop:30  }}>
            <View style={styles.marginTopBottom1}>
              <View style={styles.row}>
                <View style={[styles.col, styles.col6, styles.centerContent]}>
                  <Text style={[{...FONTS.h3},{ color: 'green'}]}>CHARGER STATUS</Text>
                  {ChargerStatus ? (
                    <>
                      <Text style={{ ...FONTS.body4, marginVertical: 10 }}>Device ID: {ChargerID}</Text>
                      <Text style={{ ...FONTS.body4, marginVertical: 10 }}>Device Status: {ChargerStatus}</Text>
                      <Text style={{ ...FONTS.body4, marginVertical: 10 }}>Time: {timestamp}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ ...FONTS.body4, marginVertical: 10, color:'red', textAlign:'center' }}>Device ID not found. Please scan the QR code and return to the home page.</Text>
                      <TouchableOpacity onPress={navigation.goBack}>
                        <Text style={{ ...FONTS.body4, marginVertical: 10 }}>{'<- '}Back</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.lineHeader}>
                <View style={styles.underlineContainer}>
                  {[...Array(40)].map((_, index) => (
                      <View key={index} style={styles.dash}></View>
                  ))}
                </View>
                <View style={styles.row}>
                  <View style={[styles.col, styles.col12, styles.centerContent]}>
                    <View style={styles.dataContainer}>
                      <Text style={styles.dataItem}>Voltage: {voltage}</Text>
                      <Text style={styles.dataItem}>Current: {current}</Text>
                      <Text style={styles.dataItem}>Power: {power}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={[styles.col, styles.col12, styles.centerContent]}>
                    <View style={styles.dataContainer}>
                      <Text style={styles.dataItem}>Energy: {energy}</Text>
                      <Text style={styles.dataItem}>Frequency: {frequency}</Text>
                      <Text style={styles.dataItem}>Temperature: {temperature}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={[styles.col, styles.col12, styles.centerContent]}>
                    <View style={styles.dataContainer}>
                      {ChargerStatus === 'Preparing' && (
                        <Button mode="contained" style={styles.buttonStart} labelStyle={styles.textStart} onPress={handleStartTransaction} >Start</Button>
                      )}
                      {ChargerStatus === 'Charging' && (
                        <Button mode="contained" style={styles.buttonStop} labelStyle={styles.textStop} onPress={handleStopTransaction} id="stopTransactionBtn">Stop</Button>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={{backgroundColor: COLORS.gray, borderRadius: 20, marginTop: SIZES.padding, width: SIZES.width - 44}}>
            <View style={styles.marginTopBottom1}>
              <View style={styles.row}>
                <View style={[styles.col, styles.col6, styles.centerContent]}>
                  <Button mode="contained" style={{width:200}} onPress={fetchErrorHistory}>                    
                    {showTableHeader ? 'Hide Error History' : 'Show Error History'}
                  </Button>
                </View>
              </View>
              {showTableHeader && (
                <View>
                  {historys.length > 0 ? (
                    <View style={styles.container}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>Sl.No</Text>
                        <Text style={styles.tableHeader}>Timestamp</Text>
                        <Text style={styles.tableHeader}>Status</Text>
                        <Text style={styles.tableHeader}>Error</Text>
                      </View>
                      {historys.map((entry, index) => (
                        <View style={styles.tableRow} key={index}>
                          <Text style={styles.tableCell}>{entry.serialNumber}</Text>
                          <Text style={styles.tableCell}>{entry.currentTime}</Text>
                          <Text style={styles.tableCell}>{entry.chargerStatus}</Text>
                          <Text style={styles.tableCell}>{entry.errorCode}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.tableCell]}>No error found.</Text>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={{backgroundColor: COLORS.gray, borderRadius: 20, marginTop: SIZES.padding, width: SIZES.width - 44 }}>
            <View style={styles.marginTopBottom1}>
              <View style={styles.card}>
                <View style={styles.thresholdHeader}>
                  <Text style={[FONTS.h3, { color: '#856404' , textAlign:'center'}]}>THRESHOLD LEVEL</Text>
                </View>
                <View style={styles.thresholdItem}>
                  <Text style={styles.thresholdTitle}>Voltage level:</Text>
                  <Text style={styles.thresholdDescription}>Input under voltage - 175V and below. Input over voltage - 270V and above.</Text>
                </View>
                <View style={styles.thresholdItem}>
                  <Text style={styles.thresholdTitle}>Current:</Text>
                  <Text style={styles.thresholdDescription}>Over Current - 33A.</Text>
                </View>
                <View style={styles.thresholdItem}>
                  <Text style={styles.thresholdTitle}>Frequency:</Text>
                  <Text style={styles.thresholdDescription}>Under frequency - 47HZ. Over frequency - 53HZ.</Text>
                </View>
                <View style={styles.thresholdItem}>
                  <Text style={styles.thresholdTitle}>Temperature:</Text>
                  <Text style={styles.thresholdDescription}>Low Temperature - 0 °C. High Temperature - 58 °C.</Text>
                </View>
              </View>
            </View>
          </View>
          {modalVisible && 
            <Modal animationType="slide" transparent={true} visible={modalVisible} >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width:300 }}>
                  <Text style={[{...FONTS.h3}, { color: 'green', textAlign: 'center', paddingBottom:15 }]}>Charging Done!</Text>
                  <Text style={{ ...FONTS.body4, marginVertical: 5 }}>ChargerID: {chargingSession.ChargerID}</Text>
                  <Text style={{ ...FONTS.body4, marginVertical: 5 }}>Start Time: {chargingSession.StartTimestamp && new Date(chargingSession.StartTimestamp).toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})}</Text>
                  <Text style={{ ...FONTS.body4, marginVertical: 5 }}>Stop Time: {chargingSession.StopTimestamp && new Date(chargingSession.StopTimestamp).toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})}</Text>
                  <Text style={{ ...FONTS.body4, marginVertical: 5 }}>Unit Consumed: {chargingSession.Unitconsumed}</Text>
                  <Text style={{ ...FONTS.body4, marginVertical: 5 }}>Charging Price: {chargingSession.price}</Text>
                  <Text style={{ ...FONTS.body4, marginVertical: 5 }}>Price: {updatedUser.walletBalance}</Text>
                  <View style={{justifyContent: 'center', alignItems: 'center',}}>
                    <Button mode="contained" style={[styles.buttonStop, { width: 100 }]} labelStyle={styles.textStop} onPress={toggleModal}>Close</Button>
                  </View>
                </View>
              </View>
            </Modal>
          }
          <Modal visible={loading} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="green" />
                <Text>Please wait...</Text>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

  const styles = StyleSheet.create({
    scrollViewContent: {
      flexGrow: 1,
    },
    container: {
       flex: 1,
    },
    row: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginHorizontal: 12, 
    marginVertical: SIZES.padding, 
    },
    col: {
    flexGrow: 1, 
    flexBasis: '0%', 
    },
    col6: {
    width: '50%', 
    },
    centerContent: {
    alignItems: 'center', 
    justifyContent: 'center', 
    },
    marginTopBottom: {
      marginTop:25,
      marginBottom:25,
    },
    marginTopBottom1: {
    marginTop:15,
    marginBottom:15,
    },
    card: {
      backgroundColor: '#fff3cd',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#ffeeba',
      padding: SIZES.padding,
      marginTop: SIZES.padding,
      marginLeft:10,
      marginRight:10,
    },
    thresholdItem: {
        marginBottom: SIZES.padding,
    },
    thresholdTitle: {
        ...FONTS.h3,
        color: '#856404',
    },
    thresholdDescription: {
        ...FONTS.body4,
        marginTop: 5,
    },
    thresholdHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#856404',
      marginBottom: SIZES.padding,
    },
    lineHeader: {
      marginBottom: SIZES.padding,
      alignItems: 'center',
    },
    underlineContainer: {
        flex: 1,
        flexDirection: 'row',
        borderBottomColor: '#856404',
        marginLeft: 10, // Adjust the margin as needed
    },
    dash: {
        width: 4, // Width of each dash
        height: 1, // Height of the underline
        backgroundColor: 'green',
        marginRight: 2, // Adjust the spacing between dashes
    },
    col12: {
      width: '100%',
    },
    dataContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    dataItem: {
      ...FONTS.body4,
      marginRight: 20, // Adjust the margin between items
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingVertical: 10,
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
    buttonStart: {
      marginHorizontal: 3,
      backgroundColor: 'green', 
      borderColor: 'white', 
      borderWidth: 2, 
      borderRadius: 20, 
      width: 150,
    },
    textStart: {
      color: 'white', 
    },
    buttonStop: {
      marginHorizontal: 3,
      backgroundColor: 'red', 
      borderColor: 'white',
      borderWidth: 2, 
      borderRadius: 20, 
      width: 150,
    },
    textStop: {
      color: 'white',
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
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    spinnerContainer: {
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 10,
    },
  });

export default Search;