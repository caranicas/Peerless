# Peerless Debug Tool

Interactive debugging tool for testing Peerless peer-to-peer connections.

## Features

- **Separate Host & Client Pages** - Test connections with `/host` and `/client` routes
- **Real-time Event Logs** - See every message, connection, and error
- **Connection Stats** - Monitor peer status with PeerlessStats component
- **Broadcast Testing** - Test host-to-all-clients and client-to-client relay messaging
- **Message Queue Visualization** - Verify sequential message processing

## Running the Debug Tool

From the repository root:

```bash
npm run demo
```

This will:
1. Start the Vite dev server on port 3000
2. Automatically open `/host` in your browser
3. Navigate to `/client` in another window/tab to connect

### Testing Multi-Client Scenarios

1. Start the demo with `npm run demo`
2. Copy the Host ID from the host page
3. Open `/client` in multiple browser windows/incognito tabs
4. Paste the Host ID and connect each client
5. Test broadcasts and client-to-client relay messaging

## What's Included

### UI Components
- **PeerTestHost** - Full-featured host test interface
- **PeerTestClient** - Full-featured client test interface  
- **PeerlessStats** - Real-time connection statistics panel

### Headless Hooks
- **useTestHost** - Host connection logic without UI
- **useTestClient** - Client connection logic without UI

These hooks power the test components but can be used independently for custom debug UIs.

## Use Cases

- **Library Development** - Test new features and bug fixes
- **Connection Debugging** - Diagnose connection issues
- **Message Queue Testing** - Verify message ordering and processing
- **Integration Testing** - Test your app's Peerless integration
- **Demo for New Users** - Show how Peerless works in practice

## Related

See `examples/chat/` for a real-world usage example of building an app with Peerless.
