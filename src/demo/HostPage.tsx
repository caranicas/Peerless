import PeerContextProvider from "../context/PeerContextProvider";
import { PeerTestHost } from "./ui/PeerTest/PeerTestHost";
import type { TestMessage } from "./hooks/useTestHost";

export function HostPage() {
  return (
    <div style={{ padding: "2rem", background: "#f9f9f9", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <header style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            🔌 Peerless Demo - Host
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666" }}>
            Test WebRTC peer-to-peer connections as the host
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
            <PeerTestHost />
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
              <strong>Start the Host:</strong> Click "1. Start Host" button above
            </li>
            <li>
              <strong>Copy Host ID:</strong> Click "Copy Host ID" button
            </li>
            <li>
              <strong>Open Client:</strong> Navigate to{" "}
              <a href="/client" style={{ color: "#0066cc" }}>
                /client
              </a>{" "}
              (or open in a new window)
            </li>
            <li>
              <strong>Connect Client:</strong> Paste the Host ID in the client page and
              click "1. Connect to Host"
            </li>
            <li>
              <strong>Test Communication:</strong> Use "Send Broadcast" here or "Send
              Test Message" on the client
            </li>
            <li>
              <strong>Monitor Stats:</strong> Watch the connection stats update in
              real-time
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
