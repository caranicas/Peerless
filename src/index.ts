export { PeerContext } from "./context/PeerContext";
export { default as PeerContextProvider } from "./context/PeerContextProvider";
export * from "./hooks/usePeerJs";
export { useBroadcastFromClient } from "./hooks/usePeerJs";
export { PeerlessStats } from "./demo/ui/PeerlessStatus/PeerlessStats";
export { PeerTestHost } from "./demo/ui/PeerTest/PeerTestHost";
export { PeerTestClient } from "./demo/ui/PeerTest/PeerTestClient";
export type { PeerTestHostProps } from "./demo/ui/PeerTest/PeerTestHost";
export type { PeerTestClientProps } from "./demo/ui/PeerTest/PeerTestClient";

// Headless hooks
export { useTestHost } from "./demo/hooks/useTestHost";
export { useTestClient } from "./demo/hooks/useTestClient";
export type { UseTestHostConfig, UseTestHostReturn, TestMessage as HostTestMessage } from "./demo/hooks/useTestHost";
export type { UseTestClientConfig, UseTestClientReturn, TestMessage as ClientTestMessage } from "./demo/hooks/useTestClient";

// Compound components
export { TestHost } from "./demo/ui/PeerTest/TestHostCompound";
export { TestClient } from "./demo/ui/PeerTest/TestClientCompound";
export type { 
  TestHostRootProps, 
  TestHostHeaderProps, 
  TestHostControlsProps, 
  TestHostLogsProps 
} from "./demo/ui/PeerTest/TestHostCompound";
export type { 
  TestClientRootProps, 
  TestClientHeaderProps, 
  TestClientControlsProps, 
  TestClientLogsProps 
} from "./demo/ui/PeerTest/TestClientCompound";
