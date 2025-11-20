import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useTestClient, UseTestClientConfig, UseTestClientReturn } from "../../hooks/useTestClient";
import { PeerlessStats } from "../PeerlessStatus/PeerlessStats";

const TestClientContext = createContext<UseTestClientReturn | null>(null);

function useTestClientContext() {
  const context = useContext(TestClientContext);
  if (!context) {
    throw new Error("TestClient compound components must be used within TestClient.Root");
  }
  return context;
}

// Root component that provides context
export interface TestClientRootProps extends UseTestClientConfig {
  children: ReactNode;
  className?: string;
}

function Root({ children, className = "", ...config }: TestClientRootProps) {
  const client = useTestClient(config);

  return (
    <TestClientContext.Provider value={client}>
      <div className={className} style={{ display: "flex", gap: "1rem", maxWidth: "100%" }}>
        {children}
      </div>
    </TestClientContext.Provider>
  );
}

// Header component
export interface TestClientHeaderProps {
  title?: string;
  subtitle?: string;
}

function Header({ title = "PeerJS Test - Client", subtitle = "Test peer connection as client" }: TestClientHeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

// ConnectionInfo component
function ConnectionInfo() {
  const { clientId, hostId, isPeerOpen, isConnecting } = useTestClientContext();

  return (
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
  );
}

// Controls component
export interface TestClientControlsProps {
  children?: ReactNode;
  renderButton?: (props: { onClick: () => void; disabled?: boolean; children: ReactNode }) => ReactNode;
}

function Controls({ children, renderButton }: TestClientControlsProps) {
  const { isConnecting, isPeerOpen, actions } = useTestClientContext();

  const defaultButton = (props: { onClick: () => void; disabled?: boolean; children: ReactNode }) => (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
  );

  const Button = renderButton || defaultButton;

  if (children) {
    return (
      <section>
        <h2>Controls</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>{children}</div>
      </section>
    );
  }

  return (
    <section>
      <h2>Controls</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <Button onClick={actions.connect} disabled={isConnecting}>
          1. Connect to Host
        </Button>
        <Button onClick={actions.requestSync} disabled={!isPeerOpen}>
          2. Request Sync
        </Button>
        <Button onClick={actions.sendMessage} disabled={!isPeerOpen}>
          3. Send Test Message
        </Button>
        <Button onClick={actions.clearLogs}>Clear Logs</Button>
      </div>
    </section>
  );
}

// Individual button components
function ConnectButton({ children = "Connect to Host", ...props }: { children?: ReactNode; disabled?: boolean }) {
  const { isConnecting, actions } = useTestClientContext();
  return (
    <button onClick={actions.connect} disabled={isConnecting} {...props}>
      {children}
    </button>
  );
}

function RequestSyncButton({ children = "Request Sync", ...props }: { children?: ReactNode; disabled?: boolean }) {
  const { isPeerOpen, actions } = useTestClientContext();
  return (
    <button onClick={actions.requestSync} disabled={!isPeerOpen} {...props}>
      {children}
    </button>
  );
}

function SendMessageButton({ children = "Send Test Message", ...props }: { children?: ReactNode; disabled?: boolean }) {
  const { isPeerOpen, actions } = useTestClientContext();
  return (
    <button onClick={actions.sendMessage} disabled={!isPeerOpen} {...props}>
      {children}
    </button>
  );
}

function ClearLogsButton({ children = "Clear Logs", ...props }: { children?: ReactNode }) {
  const { actions } = useTestClientContext();
  return (
    <button onClick={actions.clearLogs} {...props}>
      {children}
    </button>
  );
}

// Logs component
export interface TestClientLogsProps {
  maxHeight?: number | string;
  emptyMessage?: string;
}

function Logs({ maxHeight = "300px", emptyMessage = "No logs yet..." }: TestClientLogsProps) {
  const { logs } = useTestClientContext();

  return (
    <section>
      <h2>Event Log</h2>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "1rem",
          maxHeight,
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          background: "#fafafa",
        }}
      >
        {logs.length === 0 ? (
          <p style={{ color: "#999" }}>{emptyMessage}</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: "0.25rem" }}>
              {log}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// Stats component
function Stats() {
  return (
    <aside style={{ width: "320px" }}>
      <h3>Peerless Stats</h3>
      <PeerlessStats />
    </aside>
  );
}

// Main panel wrapper
function MainPanel({ children }: { children: ReactNode }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
      {children}
    </div>
  );
}

// Export compound components
export const TestClient = {
  Root,
  Header,
  ConnectionInfo,
  Controls,
  ConnectButton,
  RequestSyncButton,
  SendMessageButton,
  ClearLogsButton,
  Logs,
  Stats,
  MainPanel,
};
