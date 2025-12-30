import { useEffect, useState, useRef } from "react";
import {
  useStartHostConnection,
  useStartClientConnection,
  useSendData,
  useLatestMessage,
  useConnectedClients,
  usePeerId,
  useInPeerConnection,
  usePeerRecovery,
  usePeerError,
} from "../../../../src/hooks/usePeerJs";

interface ChatMessage {
  type: "message" | "join" | "leave";
  username: string;
  text?: string;
  timestamp: number;
}

interface ChatRoomProps {
  username: string;
  roomId: string;
  isHost: boolean;
}

export default function ChatRoom({ username, roomId, isHost }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [clientPeerId] = useState(() => `client-${Math.random().toString(36).substring(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startHost = useStartHostConnection(roomId);
  const startClient = useStartClientConnection(clientPeerId, roomId);
  const sendData = useSendData<ChatMessage>();
  const latestMessage = useLatestMessage<ChatMessage>();
  const connectedClients = useConnectedClients();
  const peerId = usePeerId();
  const isConnected = useInPeerConnection();
  const { retryConnection, restartPeer, isReconnecting, reconnectAttempts } = usePeerRecovery();
  const peerError = usePeerError();
  const totalUsers = isHost ? connectedClients.length + 1 : Math.max(1, connectedClients.length + 1);
  const statusMessage = isConnected
    ? "Connected"
    : isReconnecting
      ? `Reconnecting (attempt ${reconnectAttempts + 1})`
      : "Connecting to PeerJS server...";

  // Initialize connection
  useEffect(() => {
    if (isHost) {
      startHost();
    } else {
      startClient();
    }
  }, [isHost, startHost, startClient]);

  // Send join notification when connected
  useEffect(() => {
    if (isConnected && peerId) {
      const joinMsg: ChatMessage = {
        type: "join",
        username,
        timestamp: Date.now(),
      };
      sendData(joinMsg);
    }
  }, [isConnected, peerId, username, sendData]);

  // Handle incoming messages
  useEffect(() => {
    if (latestMessage) {
      setMessages((prev) => [...prev, latestMessage]);
    }
  }, [latestMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !isConnected) return;

    const message: ChatMessage = {
      type: "message",
      username,
      text: inputText,
      timestamp: Date.now(),
    };

    sendData(message);
    setMessages((prev) => [...prev, message]);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied to clipboard!");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h2>🗨️ Chat Room</h2>
          <div className="room-info">
            <span className="room-id" onClick={copyRoomId} title="Click to copy">
              Room: {roomId}
            </span>
            <span className={`status ${isConnected ? "connected" : "disconnected"}`}>
              {isConnected ? "● Connected" : "○ Connecting..."}
            </span>
          </div>
        </div>
        <div className="users-count">
          {totalUsers} user{totalUsers === 1 ? "" : "s"}
        </div>
      </div>

      <div className="connection-panel">
        <div>
          <p className="status-label">
            {isHost ? "Hosting" : "Client"} • Peer ID: {peerId?.id ?? "assigning"}
          </p>
          <p className="status-subtitle">{statusMessage}</p>
        </div>
        <div className="recovery-buttons">
          <button
            className="ghost-button"
            onClick={retryConnection}
            disabled={isReconnecting}
          >
            {isReconnecting ? "Retrying..." : "Retry Connection"}
          </button>
          <button className="ghost-button" onClick={restartPeer}>
            Restart Peer
          </button>
        </div>
      </div>

      {peerError && (
        <div className="error-banner">
          <strong>Peer error:</strong> {peerError.message}
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.type === "join" && (
              <span className="system-message">
                {msg.username} joined the chat
              </span>
            )}
            {msg.type === "leave" && (
              <span className="system-message">
                {msg.username} left the chat
              </span>
            )}
            {msg.type === "message" && (
              <>
                <div className="message-header">
                  <span className={`message-author ${msg.username === username ? "you" : ""}`}>
                    {msg.username === username ? "You" : msg.username}
                  </span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{msg.text}</div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || !isConnected}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
}
