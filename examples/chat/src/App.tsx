import { useState } from "react";
import PeerContextProvider from "../../../src/context/PeerContextProvider";
import ChatRoom from "./components/ChatRoom";
import SetupScreen from "./components/SetupScreen";
import "./styles.css";

export default function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleCreateRoom = (name: string, room: string) => {
    setUsername(name);
    setRoomId(room);
    setIsHost(true);
    setHasJoined(true);
  };

  const handleJoinRoom = (name: string, room: string) => {
    setUsername(name);
    setRoomId(room);
    setIsHost(false);
    setHasJoined(true);
  };

  if (!hasJoined) {
    return (
      <SetupScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  return (
    <PeerContextProvider>
      <ChatRoom username={username} roomId={roomId} isHost={isHost} />
    </PeerContextProvider>
  );
}
