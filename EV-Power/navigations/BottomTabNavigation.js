import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { Favourite, Home, Search, Setting } from "../screens";
import { AntDesign } from '@expo/vector-icons';
const Tab = createBottomTabNavigator();

const screenOptions={
  tabBarShowLabel: false,
  headerShown: false,
  tabBarHideOnKeyboard: true,
  tabBarStyle:{
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    background: COLORS.white
  }
}
const BottomTabNavigation = ({route }) => {
  const {username} = route.params;

  return (
    
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{ username }} // Pass the loginUsername as initial params
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home-outline' : 'home-outline'}
              size={24}
              color={focused ? 'green' : COLORS.green}  // Change color based on focus
            />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={Search}
        initialParams={{ username }} // Pass the loginUsername as initial params
        options={{
          tabBarIcon: ({ focused })=>{
            return (
              <Ionicons
                name="search-sharp"
                size={24}
                color={focused ? 'green' : COLORS.green}  // Change color based on focus
              />
            )
          }
        }}
      />

      <Tab.Screen
        name="Setting"
        component={Setting}
        initialParams={{ username }} // Pass the loginUsername as initial params
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <AntDesign name={focused ? "setting":"setting"} size={24} color={focused ? 'green' : COLORS.green} />
            );
          },
        }}
      />
      
    </Tab.Navigator>
  )
}

export default BottomTabNavigation

