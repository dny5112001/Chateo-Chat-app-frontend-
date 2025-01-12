import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import profilePic from "../assets/images/profile.png";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as ImagePicker from "expo-image-picker";
import baseUrl from "../baseurl";

const ProfileSettingScreen = ({ navigation }) => {
  const [token, setToken] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const loadTokenAndProfile = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);

      if (storedToken) {
        const response = await fetch(`${baseUrl}:3000/chat/getProfile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: storedToken, // Use the retrieved token
          },
        });
        const result = await response.json();
        if (result.success) {
          setFirstName(result.data.firstName);
          setLastName(result.data.lastName);
          setProfileImage(`${baseUrl}:3000/${result.data.profileImage}`);
        }
      }
    };
    loadTokenAndProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token"); // Clear the token
    navigation.navigate("SignIn"); // Navigate to SignIn screen
  };

  const saveProfile = async () => {
    // Create FormData to include both text fields and the image file
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("profileImage", {
      uri: profileImage,
      name: "profile.jpg", // You can dynamically get the file name if needed
      type: "image/jpeg", // Adjust based on your image format
    });

    const response = await fetch(`${baseUrl}:3000/chat/updateProfile`, {
      method: "POST",
      headers: {
        Accept: "application/json", // No 'Content-Type' header with FormData
        authorization: token, // Use the retrieved token
      },
      body: formData, // Send the FormData object
    });

    const result = await response.json();
    if (result.success) {
      Alert.alert("Success");
      loadTokenAndProfile(); // Load the updated token and profile information
    } else {
      console.log("Error", result.message);
    }
  };

  const selectProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [5, 5],
    });

    if (result) {
      // console.log(result.assets[0]);
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 bg-white pt-5 ps-8 pr-8">
      <Text className="text-2xl font-bold">Your Profile</Text>
      <View style={{ flex: 1, alignItems: "center", marginTop: 100 }}>
        <TouchableOpacity onPress={selectProfileImage}>
          <Image
            source={
              profileImage
                ? { uri: profileImage.replace(/\\/g, "/") }
                : profilePic
            } // Use uri for image from URL
            style={styles.image}
          />
        </TouchableOpacity>

        <TextInput
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName} // Enable editing
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
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName} // Enable editing
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
          onPress={saveProfile}
        >
          <Text style={{ textAlign: "center" }} className="text-white text-xl">
            Save
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <Text className="text-gray-500 text-lg">Do you want to Logout?</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text className="text-red-500 text-lg"> Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileSettingScreen;

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 50, // Make it circular
    marginBottom: 20,
  },
});
