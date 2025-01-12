import {
  FlatList,
  Image,
  ScrollView,
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

const Notifications = () => {
  const [friendRequest, setFriendRequest] = useState([]);
  const [socket, setSocket] = useState("");

  const getFriendRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}:3000/chat/getAllReceivedFriendRequests`,
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
      console.log(result);
      setFriendRequest(result.data || []);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  useEffect(() => {
    getFriendRequests();
  }, []);

  useEffect(() => {
    const socket = io(`${baseUrl}:3000`, {
      auth: {
        token: AsyncStorage.getItem("token"),
      },
    });
    setSocket(socket);
  }, []);

  const acceptFriendRequested = async (userId) => {
    try {
      io.emit("approveFriendRequest", { userId });
      getFriendRequests();
    } catch (error) {
      console.error("Error approving friend request:", error);
    }
  };

  const rejectFriendRequest = async (userId) => {
    try {
      io.emit("cancelFriendRequest", { userId });
      getFriendRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const UserCards = ({ request }) => {
    return (
      <View style={styles.cardContainer}>
        <Image
          source={{
            uri:
              request.profileImage ||
              "https://i.pinimg.com/originals/b2/a1/df/b2a1df0c32fa78851b9776921b324143.png",
          }}
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.userName}>
            {request.firstName} {request.lastName}
          </Text>
          <Text style={styles.lastSeen}>{request.userId}</Text>
        </View>

        <TouchableOpacity
          style={{ position: "absolute", right: 60 }}
          onPress={() => {
            acceptFriendRequested(request.userId);
          }}
        >
          <Ionicons name="checkmark-circle" size={35} color="#48BB78" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: "absolute", right: 20 }}
          onPress={() => {
            rejectFriendRequest(request.userId);
          }}
        >
          <Ionicons name="close-circle" size={35} color="#F56565" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Notifications</Text>
        <View style={styles.searchBar}>
          <TextInput placeholder="Search users" style={styles.searchInput} />
          <TouchableOpacity>
            <Ionicons name="search" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider}></View>
      <FlatList
        data={friendRequest}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => <UserCards request={item} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default Notifications;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
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
