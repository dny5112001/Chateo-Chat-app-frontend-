import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Illustration from "../assets/images/Illustration.png";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseUrl from "../baseurl";

const SignIn = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    if (userId !== "" && password !== "") {
      const response = await fetch(`${baseUrl}:3000/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId,
          password,
        }),
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        await AsyncStorage.setItem("token", result.token); // Ensure to await this
        alert("Login successful!"); // Show a success message
        navigation.navigate("Home");
      } else {
        alert(result.message); // Show error message
      }
    } else {
      alert("Please enter both User ID and Password."); // Prompt user to enter details
    }
  };

  return (
    <ScrollView className="flex-1 bg-white pt-5 ps-8 pr-8">
      <Text className="text-2xl font-bold">Log In</Text>
      <View style={{ flex: 1, alignItems: "center", marginTop: 100 }}>
        <Image source={Illustration} />

        <TextInput
          placeholder="Enter the UserId"
          value={userId}
          onChangeText={setUserId} // Link the state
          style={styles.input}
          className="bg-gray-100"
        />
        <TextInput
          placeholder="Enter the Password"
          value={password}
          onChangeText={setPassword} // Link the state
          secureTextEntry={true} // Hide password input
          style={styles.input}
          className="bg-gray-100"
        />

        <TouchableOpacity
          style={styles.button}
          className="bg-orange-500"
          onPress={signIn}
        >
          <Text style={{ textAlign: "center" }} className="text-white text-xl">
            Login
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <Text className="text-gray-500 text-lg">Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("SignUp");
            }}
          >
            <Text className="text-orange-500 text-lg"> Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    paddingLeft: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  button: {
    width: "100%",
    height: 50,
    paddingLeft: 10,
    marginTop: 50,
    borderRadius: 10,
    justifyContent: "center",
  },
});
