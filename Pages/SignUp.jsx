import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import profilePic from "../assets/images/profile.png";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseUrl from "../baseurl";

const SignUp = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [5, 5],
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
    }
  };
  const SignUp = async () => {
    if (
      firstName !== "" &&
      lastName !== "" &&
      userId !== "" &&
      password !== "" &&
      profileImage !== ""
    ) {
      try {
        // Create FormData to include both text fields and the image file
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("userId", userId);
        formData.append("password", password);
        formData.append("profileImage", {
          uri: profileImage,
          name: "profile.jpg", // You can dynamically get the file name
          type: "image/jpeg", // Adjust based on your image format
        });

        const response = await fetch(`${baseUrl}:3000/auth/register`, {
          method: "POST",
          headers: {
            Accept: "application/json", // No 'Content-Type' header with FormData
          },
          body: formData,
        });

        const result = await response.json();
        console.log(result);

        if (result.success) {
          console.log(result.data);
          await AsyncStorage.setItem("token", result.token);
          navigation.navigate("Home");
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Error signing up:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      alert("Please fill all the fields");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white pt-5 ps-8 pr-8">
      <Text className="text-2xl  font-bold  ">Your Profile</Text>
      <View style={{ flex: 1, alignItems: "center", marginTop: 100 }}>
        <TouchableOpacity
          onPress={() => {
            selectImage();
          }}
        >
          <Image
            source={profileImage !== "" ? { uri: profileImage } : profilePic}
            style={profileImage != "" ? styles.image : {}}
          />
        </TouchableOpacity>

        <TextInput
          placeholder="Enter the first name"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          style={{
            width: "100%",
            height: 50,
            paddingLeft: 10,
            marginTop: 70,
            borderRadius: 10,
          }}
          className="bg-gray-100"
        />
        <TextInput
          placeholder="Enter the last name"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          style={{
            width: "100%",
            height: 50,
            paddingLeft: 10,
            marginTop: 10,
            borderRadius: 10,
          }}
          className="bg-gray-100"
        />
        <TextInput
          placeholder="Enter the userId"
          value={userId}
          onChangeText={(text) => setUserId(text)}
          style={{
            width: "100%",
            height: 50,
            paddingLeft: 10,
            marginTop: 10,
            borderRadius: 10,
          }}
          className="bg-gray-100"
        />
        <TextInput
          placeholder="Enter the Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={{
            width: "100%",
            height: 50,
            paddingLeft: 10,
            marginTop: 10,
            borderRadius: 10,
          }}
          className="bg-gray-100"
        />

        <TouchableOpacity
          style={{
            width: "100%",
            height: 50,
            paddingLeft: 10,
            marginTop: 50,
            borderRadius: 10,
            justifyContent: "center",
          }}
          className="bg-orange-500"
          onPress={() => {
            SignUp();
          }}
        >
          <Text style={{ textAlign: "center" }} className="text-white text-xl">
            Sign Up
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <Text className="text-gray-500 text-lg">
            Do you have an account ?
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("SignIn");
            }}
          >
            <Text className="text-orange-500 text-lg"> Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
