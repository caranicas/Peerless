import React, { useState, useEffect } from "react";
import {
  useStartClientConnection,
  useSendDataToHost,
  useLatestMessage,
  useSelectIsPeerOpen,
} from "../../hooks/usePeerJs";
import { PeerlessStats } from "../PeerlessStatus/PeerlessStats";

interface TestMessage {
  type: "ping" | "pong" | "test";
  payload: {
    message: string;
    timestamp: string;
  };
}

export interface PeerTestClientProps {
  hostId: string;
  clientId?: string;
  onClientIdGenerated?: (clientId: string) => void;
  renderButton?: (props: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => React.ReactNode;
  showStats?: boolean;
  className?: string;
}

export function PeerTestClient({
  hostId,
  clientId: providedClientId,
  onClientIdGenerated,
  renderButton,
  showStats = true,
  className = "",
}: PeerTestClientProps) {
  const [clientId] = useState(() => {
    const id = providedClientId || `test-client-${Math.random().toString(36).slice(2, 8)}`;
    onClientIdGenerated?.(id);
    return id;
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const startClient = useStartClientConnection(clientId, hostId);
  const sendToHost = useSendDataToHost<TestMessage>();
  const latestMessage = useLatestMessage<TestMessage>();
  const isPeerOpen = useSelectIsPeerOpen();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    addLog(`Client component mounted. Client ID: ${clientId}, Host ID: ${hostId}`);
  }, [clientId, hostId]);

  useEffect(() => {
    addLog(`isPeerOpen changed: ${isPeerOpen}`);
  }, [isPeerOpen]);

  useEffect(() => {
    if (latestMessage) {
      addLog(`📥 Received message: ${JSON.stringify(latestMessage)}`);

      // Auto-respond to pings
      if (latestMessage.type === "ping") {
        addLog("🔄 Auto-responding with pong...");
        sendToHost({
          type: "pong",
          payload: {
            message: "Pong from client!",
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  }, [latestMessage, sendToHost]);

  const handleConnect = () => {
    addLog("🟢 Connecting to host...");
    setIsConnecting(true);
    try {
      const dispose = startClient();
      addLog("✅ Connection initiated");
      return () => {
        addLog("🔴 Disposing client connection");
        dispose?.();
      };
    } catch (error) {
      addLog(`❌ Error connecting: ${error}`);
      setIsConnecting(false);
    }
  };

  const handleSendMessage = () => {
    const message: TestMessage = {
      type: "test",
      payload: {
        message: "Hello from client!",
        timestamp: new Date().toISOString(),
      },
    };
    addLog(`📤 Sending to host: ${JSON.stringify(message)}`);
    try {
      sendToHost(message);
      addLog("✅ Message sent");
    } catch (error) {
      addLog(`❌ Send error: ${error}`);
    }
  };

  const handleRequestSync = () => {
    addLog("🔄 Requesting sync from host...");
    try {
      sendToHost({
        type: "test",
        payload: {
          message: "Sync request",
          timestamp: new Date().toISOString(),
        },
      });
      addLog("✅ Sync request sent");
    } catch (error) {
      addLog(`❌ Sync request error: ${error}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const defaultButton = (props: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
  );

  const ButtonComponent = renderButton || defaultButton;

  return (
    <div className={className} style={{ display: "flex", gap: "1rem", maxWidth: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <header>
          <h1>PeerJS Test - Client</h1>
          <p>Test peer connection as client</p>
        </header>

        <section>
          <h2>Connection Info</h2>
          <div>
            <p>
              <strong>Client ID:</strong> {clientId}
            </p>
            <p>
              <strong>Host ID:</strong> {hostId}
            </p>
            <p>
              <strong>Is Open:</strong> {isPeerOpen ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>Is Connecting:</strong> {isConnecting ? "✅ Yes" : "❌ No"}
            </p>
          </div>
        </section>

        <section>
          <h2>Controls</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <ButtonComponent onClick={handleConnect} disabled={isConnecting}>
              1. Connect to Host
            </ButtonComponent>
            <ButtonComponent onClick={handleRequestSync} disabled={!isPeerOpen}>
              2. Request Sync
            </ButtonComponent>
            <ButtonComponent onClick={handleSendMessage} disabled={!isPeerOpen}>
              3. Send Test Message
            </ButtonComponent>
            <ButtonComponent onClick={handleClearLogs}>Clear Logs</ButtonComponent>
          </div>
        </section>

        <section>
          <h2>Event Log</h2>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "1rem",
              maxHeight: "300px",
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              background: "#fafafa",
            }}
          >
            {logs.length === 0 ? (
              <p style={{ color: "#999" }}>No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: "0.25rem" }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {showStats && (
        <aside style={{ width: "320px" }}>
          <h3>Peerless Stats</h3>
          <PeerlessStats />
        </aside>
      )}
    </div>
  );
}

export default PeerTestClient;
