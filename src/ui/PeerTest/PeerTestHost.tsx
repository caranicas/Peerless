import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  useStartHostConnection,
  useSendDataToAllClients,
  useLatestMessage,
  usePeerId,
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

export interface PeerTestHostProps {
  hostId?: string;
  onHostIdGenerated?: (hostId: string) => void;
  renderButton?: (props: {
    onClick: () => void;
    disabled?: boolean;
    children: ReactNode;
  }) => ReactNode;
  showStats?: boolean;
  className?: string;
}

export function PeerTestHost({
  hostId: providedHostId,
  onHostIdGenerated,
  renderButton,
  showStats = true,
  className = "",
}: PeerTestHostProps) {
  const [hostId] = useState(() => {
    const id = providedHostId || `test-host-${Math.random().toString(36).slice(2, 8)}`;
    onHostIdGenerated?.(id);
    return id;
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isHosting, setIsHosting] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const lastMessageRef = useRef<TestMessage | null>(null);

  const startHost = useStartHostConnection(hostId);
  const broadcast = useSendDataToAllClients<TestMessage>();
  const latestMessage = useLatestMessage<TestMessage>();
  const peerId = usePeerId();
  const isPeerOpen = useSelectIsPeerOpen();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    addLog(`Host component mounted. Host ID: ${hostId}`);
  }, [hostId]);

  useEffect(() => {
    const peerIdString = peerId?.id ?? "not assigned";
    addLog(`Peer ID changed: ${peerIdString}`);
  }, [peerId?.id]);

  useEffect(() => {
    addLog(`isPeerOpen changed: ${isPeerOpen}`);
  }, [isPeerOpen]);

  useEffect(() => {
    if (latestMessage && latestMessage !== lastMessageRef.current) {
      lastMessageRef.current = latestMessage;
      setMessageCount((prev) => prev + 1);
      addLog(`📥 Received message #${messageCount + 1}: ${JSON.stringify(latestMessage)}`);
    }
  }, [latestMessage, messageCount]);

  const handleStartHost = () => {
    addLog("🟢 Starting host connection...");
    try {
      const dispose = startHost();
      setIsHosting(true);
      addLog("✅ Host connection started");
      return () => {
        addLog("🔴 Disposing host connection");
        dispose?.();
      };
    } catch (error) {
      addLog(`❌ Error starting host: ${error}`);
    }
  };

  const handleStopHost = () => {
    addLog("🔴 Stopping host...");
    setIsHosting(false);
  };

  const handleBroadcast = () => {
    const message: TestMessage = {
      type: "ping",
      payload: {
        message: "Hello from host!",
        timestamp: new Date().toISOString(),
      },
    };
    addLog(`📤 Broadcasting: ${JSON.stringify(message)}`);
    try {
      broadcast(message);
      addLog("✅ Broadcast sent");
    } catch (error) {
      addLog(`❌ Broadcast error: ${error}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleCopyHostId = () => {
    navigator.clipboard.writeText(hostId);
    addLog("📋 Host ID copied to clipboard");
  };

  const defaultButton = (props: {
    onClick: () => void;
    disabled?: boolean;
    children: ReactNode;
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
          <h1>PeerJS Test - Host</h1>
          <p>Test peer connection as host</p>
        </header>

        <section>
          <h2>Connection Info</h2>
          <div>
            <p>
              <strong>Host ID:</strong> {hostId}
            </p>
            <p>
              <strong>Peer ID:</strong> {peerId?.id ?? "Not assigned"}
            </p>
            <p>
              <strong>Is Open:</strong> {isPeerOpen ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>Is Hosting:</strong> {isHosting ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>Messages Received:</strong> {messageCount}
            </p>
          </div>
        </section>

        <section>
          <h2>Host ID (Share with clients)</h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <code
              style={{
                padding: "0.5rem",
                background: "#f5f5f5",
                borderRadius: "4px",
                flex: 1,
              }}
            >
              {hostId}
            </code>
            <ButtonComponent onClick={handleCopyHostId}>Copy Host ID</ButtonComponent>
          </div>
        </section>

        <section>
          <h2>Controls</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <ButtonComponent onClick={handleStartHost} disabled={isHosting}>
              1. Start Host
            </ButtonComponent>
            <ButtonComponent onClick={handleBroadcast} disabled={!isHosting || !isPeerOpen}>
              2. Send Broadcast
            </ButtonComponent>
            <ButtonComponent onClick={handleStopHost} disabled={!isHosting}>
              3. Stop Host
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

export default PeerTestHost;
