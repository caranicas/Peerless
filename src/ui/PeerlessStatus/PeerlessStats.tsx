import React from "react";
import usePeerContext from "../../hooks/usePeerJs";

export function PeerlessStats() {
  const {
    id,
    hostId,
    isHost,
    isOpen,
    isConnected,
    foundHost,
    latestMessage,
  } = usePeerContext();

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "1rem",
        fontFamily: "monospace",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Peerless status</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li>
          <strong>Peer ID:</strong> {id ?? "not assigned"}
        </li>
        <li>
          <strong>Role:</strong> {isHost ? "Host" : "Client"}
        </li>
        <li>
          <strong>Host ID:</strong> {hostId || "n/a"}
        </li>
        <li>
          <strong>Open:</strong> {isOpen ? "yes" : "no"}
        </li>
        <li>
          <strong>Connected:</strong> {isConnected ? "yes" : "no"}
        </li>
        <li>
          <strong>Host discovered:</strong> {foundHost ? "yes" : "no"}
        </li>
        <li>
          <strong>Latest message:</strong> {JSON.stringify(latestMessage?.data)}
        </li>
      </ul>
    </div>
  );
}

export default PeerlessStats;
