import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useTestHost, UseTestHostConfig, UseTestHostReturn } from "../../hooks/useTestHost";
import { PeerlessStats } from "../PeerlessStatus/PeerlessStats";

const TestHostContext = createContext<UseTestHostReturn | null>(null);

function useTestHostContext() {
  const context = useContext(TestHostContext);
  if (!context) {
    throw new Error("TestHost compound components must be used within TestHost.Root");
  }
  return context;
}

// Root component that provides context
export interface TestHostRootProps extends UseTestHostConfig {
  children: ReactNode;
  className?: string;
}

function Root({ children, className = "", ...config }: TestHostRootProps) {
  const host = useTestHost(config);

  return (
    <TestHostContext.Provider value={host}>
      <div className={className} style={{ display: "flex", gap: "1rem", maxWidth: "100%" }}>
        {children}
      </div>
    </TestHostContext.Provider>
  );
}

// Header component
export interface TestHostHeaderProps {
  title?: string;
  subtitle?: string;
}

function Header({ title = "PeerJS Test - Host", subtitle = "Test peer connection as host" }: TestHostHeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

// ConnectionInfo component
function ConnectionInfo() {
  const { hostId, peerId, isPeerOpen, isHosting, messageCount } = useTestHostContext();

  return (
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
  );
}

// HostIdDisplay component
function HostIdDisplay() {
  const { hostId, actions } = useTestHostContext();

  return (
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
        <button onClick={actions.copyHostId}>Copy Host ID</button>
      </div>
    </section>
  );
}

// Controls component
export interface TestHostControlsProps {
  children?: ReactNode;
  renderButton?: (props: { onClick: () => void; disabled?: boolean; children: ReactNode }) => ReactNode;
}

function Controls({ children, renderButton }: TestHostControlsProps) {
  const { isHosting, isPeerOpen, actions } = useTestHostContext();

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
        <Button onClick={actions.startHost} disabled={isHosting}>
          1. Start Host
        </Button>
        <Button onClick={actions.broadcast} disabled={!isHosting || !isPeerOpen}>
          2. Send Broadcast
        </Button>
        <Button onClick={actions.stopHost} disabled={!isHosting}>
          3. Stop Host
        </Button>
        <Button onClick={actions.clearLogs}>Clear Logs</Button>
      </div>
    </section>
  );
}

// Individual button components
function StartButton({ children = "Start Host", ...props }: { children?: ReactNode; disabled?: boolean }) {
  const { isHosting, actions } = useTestHostContext();
  return (
    <button onClick={actions.startHost} disabled={isHosting} {...props}>
      {children}
    </button>
  );
}

function BroadcastButton({ children = "Send Broadcast", ...props }: { children?: ReactNode; disabled?: boolean }) {
  const { isHosting, isPeerOpen, actions } = useTestHostContext();
  return (
    <button onClick={actions.broadcast} disabled={!isHosting || !isPeerOpen} {...props}>
      {children}
    </button>
  );
}

function StopButton({ children = "Stop Host", ...props }: { children?: ReactNode; disabled?: boolean }) {
  const { isHosting, actions } = useTestHostContext();
  return (
    <button onClick={actions.stopHost} disabled={!isHosting} {...props}>
      {children}
    </button>
  );
}

function ClearLogsButton({ children = "Clear Logs", ...props }: { children?: ReactNode }) {
  const { actions } = useTestHostContext();
  return (
    <button onClick={actions.clearLogs} {...props}>
      {children}
    </button>
  );
}

// Logs component
export interface TestHostLogsProps {
  maxHeight?: number | string;
  emptyMessage?: string;
}

function Logs({ maxHeight = "300px", emptyMessage = "No logs yet..." }: TestHostLogsProps) {
  const { logs } = useTestHostContext();

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
export const TestHost = {
  Root,
  Header,
  ConnectionInfo,
  HostIdDisplay,
  Controls,
  StartButton,
  BroadcastButton,
  StopButton,
  ClearLogsButton,
  Logs,
  Stats,
  MainPanel,
};
