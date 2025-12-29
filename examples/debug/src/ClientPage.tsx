import PeerContextProvider from "../../../src/context/PeerContextProvider";
import { PeerTestClient } from "./ui/PeerTest/PeerTestClient";
import type { TestMessage } from "./hooks/useTestClient";

export function ClientPage() {
  return (
    <div style={{ padding: "2rem", background: "#f9f9f9", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <header style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            🔌 Peerless Demo - Client
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666" }}>
            Test WebRTC peer-to-peer connections as a client
          </p>
        </header>

        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
          }}
        >
          <PeerContextProvider<TestMessage>>
            <PeerTestClient hostId="" />
          </PeerContextProvider>
        </div>

        <section
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>How to test:</h2>
          <ol style={{ lineHeight: "1.8", paddingLeft: "1.5rem" }}>
            <li>
              <strong>Get Host ID:</strong> From the{" "}
              <a href="/host" style={{ color: "#0066cc" }}>
                /host
              </a>{" "}
              page, start a host and copy the Host ID
            </li>
            <li>
              <strong>Enter Host ID:</strong> Paste the Host ID in the "Host ID to connect to" input field
            </li>
            <li>
              <strong>Click Connect:</strong> Click "1. Connect to Host" button
            </li>
            <li>
              <strong>Test Communication:</strong> Once connected, use "2. Request Sync"
              or "3. Send Test Message"
            </li>
            <li>
              <strong>Monitor Stats:</strong> Watch the connection stats and event log
              update in real-time
            </li>
          </ol>
          <p style={{ marginTop: "1rem", color: "#666", fontStyle: "italic" }}>
            💡 Tip: Open this page in a separate window or browser to test real
            peer-to-peer communication
          </p>
        </section>
      </div>
    </div>
  );
}
