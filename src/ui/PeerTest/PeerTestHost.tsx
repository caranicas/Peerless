import type { ReactNode } from "react";
import { useTestHost, UseTestHostConfig } from "../../demo/hooks/useTestHost";
import { PeerlessStats } from "../PeerlessStatus/PeerlessStats";

export interface PeerTestHostProps extends UseTestHostConfig {
  renderButton?: (props: {
    onClick: () => void;
    disabled?: boolean;
    children: ReactNode;
  }) => ReactNode;
  showStats?: boolean;
  className?: string;
}

export function PeerTestHost({
  renderButton,
  showStats = true,
  className = "",
  ...config
}: PeerTestHostProps) {
  const { hostId, logs, isHosting, messageCount, isPeerOpen, peerId, actions } = useTestHost(config);

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
            <ButtonComponent onClick={actions.copyHostId}>Copy Host ID</ButtonComponent>
          </div>
        </section>

        <section>
          <h2>Controls</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <ButtonComponent onClick={actions.startHost} disabled={isHosting}>
              1. Start Host
            </ButtonComponent>
            <ButtonComponent onClick={actions.broadcast} disabled={!isHosting || !isPeerOpen}>
              2. Send Broadcast
            </ButtonComponent>
            <ButtonComponent onClick={actions.stopHost} disabled={!isHosting}>
              3. Stop Host
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
              logs.map((log: string, index: number) => (
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
