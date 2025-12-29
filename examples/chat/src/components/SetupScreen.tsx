import { useState } from "react";

interface SetupScreenProps {
  onCreateRoom: (username: string, roomId: string) => void;
  onJoinRoom: (username: string, roomId: string) => void;
}

export default function SetupScreen({ onCreateRoom, onJoinRoom }: SetupScreenProps) {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState<"select" | "create" | "join">("select");

  const generateRoomId = () => {
    return `chat-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleCreate = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    const newRoomId = generateRoomId();
    onCreateRoom(username, newRoomId);
  };

  const handleJoin = () => {
    if (!username.trim() || !roomId.trim()) {
      alert("Please enter both username and room ID");
      return;
    }
    onJoinRoom(username, roomId);
  };

  if (mode === "select") {
    return (
      <div className="setup-container">
        <div className="setup-card">
          <h1>🗨️ Peerless Chat</h1>
          <p className="subtitle">Peer-to-peer messaging with WebRTC</p>
          
          <div className="button-group">
            <button className="primary-button" onClick={() => setMode("create")}>
              Create Room
            </button>
            <button className="secondary-button" onClick={() => setMode("join")}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="setup-container">
        <div className="setup-card">
          <button className="back-button" onClick={() => setMode("select")}>
            ← Back
          </button>
          <h2>Create Chat Room</h2>
          
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
          </div>

          <button className="primary-button" onClick={handleCreate}>
            Create Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <button className="back-button" onClick={() => setMode("select")}>
          ← Back
        </button>
        <h2>Join Chat Room</h2>
        
        <div className="input-group">
          <label>Your Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
        </div>

        <div className="input-group">
          <label>Room ID</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
          />
        </div>

        <button className="primary-button" onClick={handleJoin}>
          Join Room
        </button>
      </div>
    </div>
  );
}
