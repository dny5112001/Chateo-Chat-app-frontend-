import { StatusBar, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "../Pages/ChatScreen";
import SignIn from "../Pages/SignIn";
import SignUp from "../Pages/SignUp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";
import HomeScreen from "../Pages/HomeScreen";
import Notification from "../Pages/Notification";
import ProfileSettingScreen from "../Pages/ProfileSettingScreen";
import SearchScreen from "../Pages/SearchScreen";

const Stack = createNativeStackNavigator();

const index = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        console.log("Token exists");
        navigation.navigate("Home");
      } else {
        console.log("Token does not exist");
      }
    };

    checkToken();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      // initialRouteName="SignUp"
    >
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Notify" component={Notification} />
      <Stack.Screen name="Profile" component={ProfileSettingScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default index;

const styles = StyleSheet.create({});
