import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import SendIcon from "../assets/images/Button.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import baseUrl from "../baseurl";
import backgroundPattern from "../assets/images/pattern.png";

const ChatScreen = ({ route }) => {
  const [socket, setSocket] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("offline");
  const [lastSeen, setLastSeen] = useState("");
  const user = route.params.user;
  const [text, setText] = useState("");
  console.log(user);

  const getMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}:3000/chat/getMessages/${user.userId}`,
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
      if (result.success) {
        setMessages(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const getUserStatus = async () => {
    try {
      const response = await fetch(
        `${baseUrl}:3000/chat/userStatus/${user.userId}`
      );
      const result = await response.json();
      console.log(result);
      if (result.success) {
        setStatus(result.status);
        setLastSeen(result.lastSeen);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  useEffect(() => {
    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      const socketInstance = io(`${baseUrl}:3000`, {
        auth: { token },
      });
      setSocket(socketInstance);

      socketInstance.on("message", () => {
        getMessages();
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      socketInstance.on("userStatusChange", () => {
        getUserStatus();
      });
    };

    initializeSocket();
    getMessages();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    socket.emit("message", { receiverId: user.userId, text: text });
    setText("");

    socket.on("message", (data) => {
      getMessages();
    });
  };

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

  const UserProfile = () => {
    return (
      <View style={styles.cardContainer} className="border-gray-100">
        <Image
          source={{
            uri:
              `${baseUrl}:3000/${user.profileImage}` ||
              "https://i.pinimg.com/originals/b2/a1/df/b2a1df0c32fa78851b9776921b324143.png",
          }}
          style={styles.avatar}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.lastSeen}>
            {status === "online"
              ? "Online"
              : `Last seen at ${formatLastSeen(lastSeen)}`}
          </Text>
        </View>
      </View>
    );
  };

  const MessageBubble = ({ message }) => {
    // console.log(message);
    const isMine = message.senderId !== user.userId; // Replace with your actual user ID
    return (
      // <View style={styles.messageContainer}>
      <View style={isMine ? styles.myMessage : styles.otherMessage}>
        <Text style={isMine ? styles.messageText : styles.othersMessageText}>
          {message.message}
        </Text>
      </View>
      // </View>
    );
  };

  return (
    <View className="bg-white flex-1">
      <UserProfile />
      <ImageBackground
        className="flex-1 pt-5 ps-5 pr-5 bg-orange-50"
        source={backgroundPattern}
        style={{
          flex: 1,
          resizeMode: "cover",
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </ImageBackground>

      <View
        className="bg-gray-200"
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 20,
          paddingRight: 20,
          height: 70,
        }}
      >
        <TextInput
          placeholder="Type Something"
          value={text}
          onChangeText={(text) => setText(text)}
          className="text-xl"
          style={{ width: "80%", height: "100%" }}
        />

        <TouchableOpacity onPress={sendMessage}>
          <Image source={SendIcon} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 15,
    borderBottomWidth: 1,
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
  myMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#DCF8C6",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  othersMessageText: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#Fdba74",
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
});
