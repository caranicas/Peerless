import { useState, useEffect, useCallback } from "react";
import {
  useStartClientConnection,
  useSendData,
  useBroadcastFromClient,
  useLatestMessageWrapper,
  useSelectIsPeerOpen,
  usePeerRecovery,
} from "../../hooks/usePeerJs";

export interface TestMessage {
  type: "ping" | "pong" | "test";
  payload: {
    message: string;
    timestamp: string;
  };
  senderId?: string;
  _relay?: boolean;
}

export interface UseTestClientConfig {
  hostId: string;
  clientId?: string;
  onClientIdGenerated?: (clientId: string) => void;
}

export interface UseTestClientReturn {
  hostId: string;
  clientId: string;
  logs: string[];
  isConnecting: boolean;
  isPeerOpen: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  actions: {
    connect: () => void;
    sendMessage: () => void;
    requestSync: () => void;
    broadcast: () => void;
    clearLogs: () => void;
    copyLogs: () => void;
    retryConnection: () => void;
    restartPeer: () => void;
    addLog: (message: string) => void;
  };
}

export function useTestClient(config: UseTestClientConfig): UseTestClientReturn {
  const [clientId] = useState(() => {
    const id = config.clientId || `test-client-${Math.random().toString(36).slice(2, 8)}`;
    config.onClientIdGenerated?.(id);
    return id;
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const startClient = useStartClientConnection(clientId, config.hostId);
  const sendData = useSendData<TestMessage>();
  const broadcast = useBroadcastFromClient<TestMessage & { _relay?: boolean }>();
  const latestMessageWrapper = useLatestMessageWrapper<TestMessage>();
  const isPeerOpen = useSelectIsPeerOpen();
  const { retryConnection, restartPeer, isReconnecting, reconnectAttempts } = usePeerRecovery();

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    addLog(`Client component mounted. Client ID: ${clientId}, Host ID: ${config.hostId}`);
  }, [clientId, config.hostId, addLog]);

  useEffect(() => {
    addLog(`isPeerOpen changed: ${isPeerOpen}`);
  }, [isPeerOpen, addLog]);

  useEffect(() => {
    if (isReconnecting) {
      addLog(`♻️ Reconnecting (attempt ${reconnectAttempts})`);
    } else if (reconnectAttempts > 0) {
      addLog("✅ Reconnected successfully");
    }
  }, [addLog, isReconnecting, reconnectAttempts]);

  useEffect(() => {
    if (latestMessageWrapper) {
      const latestMessage = latestMessageWrapper.data;
      addLog(`📥 Received message: ${JSON.stringify(latestMessage)}`);

      // Auto-respond to pings
      if (latestMessage.type === "ping") {
        addLog("🔄 Auto-responding with pong...");
        sendData({
          type: "pong",
          payload: {
            message: "Pong from client!",
            timestamp: new Date().toISOString(),
          },
          senderId: clientId,
        });
      }
    }
  }, [latestMessageWrapper?._id, sendData, addLog, clientId]);

  const handleConnect = useCallback(() => {
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
  }, [startClient, addLog]);

  const handleSendMessage = useCallback(() => {
    const message: TestMessage = {
      type: "test",
      payload: {
        message: "Hello from client!",
        timestamp: new Date().toISOString(),
      },
      senderId: clientId,
    };
    addLog(`📤 Sending to host: ${JSON.stringify(message)}`);
    try {
      sendData(message);
      addLog("✅ Message sent");
    } catch (error) {
      addLog(`❌ Send error: ${error}`);
    }
  }, [sendData, addLog, clientId]);

  const handleRequestSync = useCallback(() => {
    addLog("🔄 Requesting sync from host...");
    try {
      sendData({
        type: "test",
        payload: {
          message: "Sync request",
          timestamp: new Date().toISOString(),
        },
        senderId: clientId,
      });
      addLog("✅ Sync request sent");
    } catch (error) {
      addLog(`❌ Sync request error: ${error}`);
    }
  }, [sendData, addLog, clientId]);

  const handleBroadcast = useCallback(() => {
    const message = {
      type: "test" as const,
      payload: {
        message: `Broadcast from ${clientId}!`,
        timestamp: new Date().toISOString(),
      },
      senderId: clientId,
      _relay: true,
    };
    addLog(`📡 Broadcasting to all clients: ${JSON.stringify(message)}`);
    try {
      broadcast(message);
      addLog("✅ Broadcast sent");
    } catch (error) {
      addLog(`❌ Broadcast error: ${error}`);
    }
  }, [broadcast, addLog, clientId]);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const handleCopyLogs = useCallback(() => {
    const logText = logs.join('\n');
    navigator.clipboard.writeText(logText);
    addLog("📋 Logs copied to clipboard");
  }, [logs, addLog]);

  const handleRetryConnection = useCallback(() => {
    addLog("🔄 Forcing a reconnect attempt...");
    retryConnection();
  }, [addLog, retryConnection]);

  const handleRestartPeer = useCallback(() => {
    addLog("♻️ Restarting peer instance...");
    restartPeer();
  }, [addLog, restartPeer]);

  return {
    hostId: config.hostId,
    clientId,
    logs,
    isConnecting,
    isPeerOpen,
    isReconnecting,
    reconnectAttempts,
    actions: {
      connect: handleConnect,
      sendMessage: handleSendMessage,
      requestSync: handleRequestSync,
      broadcast: handleBroadcast,
      clearLogs: handleClearLogs,
      copyLogs: handleCopyLogs,
      retryConnection: handleRetryConnection,
      restartPeer: handleRestartPeer,
      addLog,
    },
  };
}
