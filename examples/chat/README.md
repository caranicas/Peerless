# Peerless Chat Example

A simple peer-to-peer chat room built with Peerless, demonstrating real-world usage patterns for messaging applications.

## Features

- 🚀 Create or join chat rooms with unique IDs
- 💬 Real-time peer-to-peer messaging
- 👥 User presence (join/leave notifications)
- 📱 Clean, responsive UI
- 🔒 No server required for message delivery (WebRTC direct connection)

## Running the Example

From the repository root:

```bash
npm install
npm run chat
```

This will open the chat application at `http://localhost:3002`.

## How to Use

1. **Create a Room**: Click "Create Room", enter your name, and you'll get a unique room ID
2. **Share the Room ID**: Copy the room ID and share it with others
3. **Join a Room**: Others can click "Join Room", enter their name and the room ID
4. **Start Chatting**: Send messages instantly via peer-to-peer connection!

💡 **Tip**: Open the chat in multiple browser windows or tabs to test messaging between different peers.

## Troubleshooting

### "Insufficient resources" or WebSocket connection errors

The free PeerJS cloud server (`0.peerjs.com`) can be unreliable. If you see connection errors:

1. **Wait and retry** - The public server may be temporarily overloaded
2. **Run a local PeerJS server**:
   ```bash
   npx peerjs --port 9000
   ```
   Then update `examples/chat/src/main.tsx` to use local server:
   ```tsx
   <PeerContextProvider peerOptions={{ host: 'localhost', port: 9000 }}>
   ```
3. **Use a different peer ID** - Sometimes specific IDs have issues

For production apps, always use your own PeerJS server.

## Key Patterns Demonstrated

### Connection Setup

```tsx
const startHost = useStartHostConnection(roomId);
const startClient = useStartClientConnection(undefined, roomId);

useEffect(() => {
  if (isHost) {
    startHost();
  } else {
    startClient();
  }
}, [isHost, startHost, startClient]);
```

### Sending Messages

```tsx
const sendData = useSendData<ChatMessage>();

const handleSend = () => {
  const message: ChatMessage = {
    type: "message",
    username,
    text: inputText,
    timestamp: Date.now(),
  };
  sendData(message);
};
```

### Receiving Messages

```tsx
const latestMessage = useLatestMessage<ChatMessage>();

useEffect(() => {
  if (latestMessage) {
    setMessages((prev) => [...prev, latestMessage]);
  }
}, [latestMessage]);
```

### Connection Status

```tsx
const isConnected = useInPeerConnection();
const connectedClients = useConnectedClients();

// Disable input until connected
<input disabled={!isConnected} />

// Show user count
<div>{connectedClients.length + 1} users</div>
```

## Architecture

- **SetupScreen**: Initial UI for creating/joining rooms
- **ChatRoom**: Main chat interface with message history
- **Message Types**: Structured data with `type`, `username`, `text`, and `timestamp`
- **Auto-scroll**: Messages automatically scroll to bottom on new message

## Learn More

This example shows how to:
- Structure messages with TypeScript types
- Handle connection lifecycle (join/leave events)
- Manage local and remote message state
- Create a clean UX around WebRTC connection timing
- Use Peerless hooks in a real application

For more advanced features, check out the [Debug Tool](../debug/) which demonstrates connection diagnostics and testing patterns.
