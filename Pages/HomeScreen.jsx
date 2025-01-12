import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseUrl from "../baseurl";
import { FlatList } from "react-native";
import { io } from "socket.io-client"; // Import if not already imported

const HomeScreen = () => {
  const navigation = useNavigation();
  const [friends, setFriends] = useState([]);
  const [socket, setSocket] = useState("");

  useEffect(() => {
    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      const newSocket = io(`${baseUrl}:3000`, {
        auth: { token },
      });
      setSocket(newSocket);

      // Fetch friends initially
      fetchFriends();

      // Listen for friend request approval updates
      newSocket.on("friendRequestApproved", () => {
        fetchFriends();
      });

      //listen for the status change of any user
      newSocket.on("userStatusChange", () => {
        fetchFriends();
      });
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.off("friendRequestApproved");
        socket.disconnect();
      }
    };
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${baseUrl}:3000/chat/getAllFriends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${await AsyncStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      setFriends(result.data);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = async () => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // If token exists, close the app
          BackHandler.exitApp();
          return true; // Prevent default behavior
        }
        // If no token, allow default behavior (go back)
        return false;
      };

      // Add event listener for hardware back button
      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      // Cleanup function to remove the event listener
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  const formatLastSeen = (lastSeenTime) => {
    const lastSeenDate = new Date(lastSeenTime);
    const now = new Date();

    // Calculate the difference in milliseconds
    const timeDifference = now - lastSeenDate;

    // If more than 24 hours (86400000 ms) have passed, return the date only
    if (timeDifference > 86400000) {
      // 24 hours in milliseconds
      return lastSeenDate.toLocaleDateString(); // Returns only the date
    } else {
      return lastSeenDate.toLocaleTimeString(); // Returns only the time
    }
  };

  const UserCards = ({ user }) => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
          // Navigate to the Chat screen, passing user information
          navigation.navigate("Chat", { user: user });
        }}
      >
        {/* Profile Image */}
        <Image
          source={{
            uri:
              `${baseUrl}:3000/${user.profileImage}` ||
              "https://i.pinimg.com/originals/b2/a1/df/b2a1df0c32fa78851b9776921b324143.png",
          }}
          style={styles.avatar}
        />

        {/* User Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.lastSeen}>
            {user.status == "offline" ? (
              <Text>{`Last seen at ${formatLastSeen(user.lastSeen)}`}</Text>
            ) : (
              <Text>{user.status}</Text>
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View
        className="border-b-2 border-orange-100"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          paddingLeft: 20,
          paddingRight: 20,
          height: 70,
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Profile");
            }}
          >
            <Ionicons name="person-circle-outline" size={40} color="black" />
          </TouchableOpacity>

          <Text className="text-2xl font-bold">Chateo</Text>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Notify");
            }}
          >
            <Ionicons name="notifications" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Search");
            }}
          >
            <Ionicons name="search" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.userId} // Ensure unique key for each item
        renderItem={({ item }) => <UserCards user={item} />} // Pass user data to UserCards
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }} // Add padding
      />
    </View>
  );
};

export default HomeScreen;

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
});
