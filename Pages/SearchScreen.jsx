import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import baseUrl from "../baseurl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

const SearchScreen = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [requestedUsers, setRequestedUsers] = useState([]); // State for requested users
  const [socket, setSocket] = useState("");

  const getSentRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}:3000/chat/getAllSentFriendRequests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: token,
          },
        }
      );
      const result = await response.json();
      // console.log(result);
      setRequestedUsers(result.data || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching sent friend requests:", error);
    }
  };

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await fetch(`${baseUrl}:3000/chat/getAllusers`);
        const result = await response.json();
        setAllUsers(result.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getAllUsers(); // Call the function
    getSentRequests(); // Call the function to get sent friend requests

    const initializedSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      const newsocket = io(`${baseUrl}:3000`, {
        auth: {
          token: token,
        },
      });
      setSocket(newsocket);
      newsocket.on("friendRequestCanceled", () => {
        getSentRequests();
      });
    };
    initializedSocket();
  }, []);

  const sendFriendRequest = async (receiverUserId) => {
    socket.emit("sendFriendRequest", receiverUserId);
    socket.on("error", (data) => {
      alert(data.message);
    });

    socket.on("friendRequestSent", (data) => {
      console.log(data.receiverId);
      alert("Request is send to user ", data.receiverId);
      getSentRequests();
    });
  };

  const UserCards = ({ user }) => {
    // Check if the user has been requested
    const isRequested = requestedUsers && requestedUsers.includes(user.userId);

    return (
      <View style={styles.cardContainer} className="border-gray-100">
        {/* Profile Image */}
        <Image
          source={{
            uri:
              `${baseUrl}:3000/${user.profileImage}` ||
              "https://i.pinimg.com/originals/b2/a1/df/b2a1df0c32fa78851b9776921b324143.png", // Fallback image
          }}
          style={styles.avatar}
        />

        {/* User Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.lastSeen}>{user.userId}</Text>
        </View>

        {isRequested && (
          <Text style={{ position: "absolute", right: 20, color: "#48BB78" }}>
            Requested
          </Text>
        )}

        {!isRequested && ( // Show chat icon only if the user hasn't been requested
          <TouchableOpacity
            style={{ position: "absolute", right: 20 }}
            onPress={() => {
              sendFriendRequest(user.userId);
            }}
          >
            <Ionicons name="chatbubbles" size={35} color="#48BB78" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Function to filter users based on the search query
  const filteredUsers = allUsers.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white pt-5">
      <View className="ps-5 pr-5">
        <Text className="text-2xl font-bold">Search</Text>
        <View
          className="bg-orange-200"
          style={{
            width: "100%",
            borderRadius: 25,
            height: 50,
            paddingHorizontal: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <TextInput
            placeholder="Search users"
            className="text-xl"
            cursorColor="orange"
            style={{
              width: "80%",
              color: "black",
              paddingLeft: 10,
              height: "100%",
            }}
            value={searchQuery} // Bind search query to the TextInput
            onChangeText={setSearchQuery} // Update search query on input change
          />
          <TouchableOpacity>
            <Ionicons name="search" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{ width: "100%", height: 1, marginTop: 10 }}
        className="bg-gray-200"
      ></View>
      <View className="ps-5 pr-5 pt-10 flex-1">
        <FlatList
          data={filteredUsers} // Use filtered user data
          keyExtractor={(item) => item.userId} // Ensure a unique key for each item
          renderItem={({ item }) => <UserCards user={item} />} // Pass the user data
        />
      </View>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 16,
  },
  infoContainer: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  lastSeen: {
    fontSize: 14,
    color: "#666",
  },
  requestedText: {
    fontSize: 14,
    color: "#FFA500", // Color for "Requested" text
    fontStyle: "italic",
  },
});
