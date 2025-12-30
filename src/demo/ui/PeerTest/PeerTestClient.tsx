import type { ReactNode } from "react";
import { useState } from "react";
import { useTestClient, UseTestClientConfig } from "../../hooks/useTestClient";
import { PeerlessStats } from "../PeerlessStatus/PeerlessStats";

export interface PeerTestClientProps extends UseTestClientConfig {
  renderButton?: (props: {
    onClick: () => void;
    disabled?: boolean;
    children: ReactNode;
  }) => ReactNode;
  showStats?: boolean;
  className?: string;
}

export function PeerTestClient({
  renderButton,
  showStats = true,
  className = "",
  ...config
}: PeerTestClientProps) {
  const [hostIdInput, setHostIdInput] = useState(config.hostId || "");
  const {
    hostId,
    clientId,
    logs,
    isConnecting,
    isPeerOpen,
    isReconnecting,
    reconnectAttempts,
    actions,
  } = useTestClient({
    ...config,
    hostId: hostIdInput,
  });

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
            <p>
              <strong>Reconnecting:</strong>{" "}
              {isReconnecting ? `♻️ Yes (attempt ${reconnectAttempts})` : "✅ No"}
            </p>
          </div>
        </section>

        <section>
          <h2>Host Connection</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="hostId" style={{ fontWeight: "bold" }}>
              Host ID to connect to:
            </label>
            <input
              id="hostId"
              type="text"
              value={hostIdInput}
              onChange={(e) => setHostIdInput(e.target.value)}
              placeholder="Paste Host ID here..."
              style={{
                padding: "0.5rem",
                fontSize: "1rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
              disabled={isConnecting || isPeerOpen}
            />
          </div>
        </section>

        <section>
          <h2>Controls</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <ButtonComponent onClick={actions.connect} disabled={isConnecting || !hostIdInput}>
              1. Connect to Host
            </ButtonComponent>
            <ButtonComponent onClick={actions.requestSync} disabled={!isPeerOpen}>
              2. Request Sync
            </ButtonComponent>
            <ButtonComponent onClick={actions.sendMessage} disabled={!isPeerOpen}>
              3. Send Test Message
            </ButtonComponent>
            <ButtonComponent onClick={actions.broadcast} disabled={!isPeerOpen}>
              4. Broadcast to All
            </ButtonComponent>
            <ButtonComponent onClick={actions.retryConnection} disabled={!isPeerOpen && !isConnecting}>
              Retry Connection
            </ButtonComponent>
            <ButtonComponent onClick={actions.restartPeer}>
              Restart Peer
            </ButtonComponent>
            <ButtonComponent onClick={actions.clearLogs}>Clear Logs</ButtonComponent>
          </div>
        </section>

        <section>
          <h2>Event Log</h2>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <ButtonComponent onClick={actions.copyLogs}>
              Copy Logs
            </ButtonComponent>
          </div>
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
