import { useState, useEffect, useCallback } from "react";
import {
  useStartHostConnection,
  useSendData,
  useLatestMessageWrapper,
  usePeerId,
  useSelectIsPeerOpen,
  usePeerRecovery,
  useMessageHistory,
  useHistoryReplay,
  useConnectedClients,
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

export interface UseTestHostConfig {
  hostId?: string;
  onHostIdGenerated?: (hostId: string) => void;
}

export interface UseTestHostReturn {
  hostId: string;
  logs: string[];
  isHosting: boolean;
  messageCount: number;
  isPeerOpen: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  historySize: number;
  connectedClients: string[];
  peerId: { id?: string };
  actions: {
    startHost: () => void;
    stopHost: () => void;
    broadcast: () => void;
    clearLogs: () => void;
    copyHostId: () => void;
    copyLogs: () => void;
    retryConnection: () => void;
    restartPeer: () => void;
    replayHistory: () => void;
    addLog: (message: string) => void;
  };
}

export function useTestHost(config: UseTestHostConfig = {}): UseTestHostReturn {
  const [hostId] = useState(() => {
    const id = config.hostId || `test-host-${Math.random().toString(36).slice(2, 8)}`;
    config.onHostIdGenerated?.(id);
    return id;
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isHosting, setIsHosting] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const startHost = useStartHostConnection(hostId);
  const sendData = useSendData<TestMessage>();
  const latestMessageWrapper = useLatestMessageWrapper<TestMessage>();
  const peerId = usePeerId();
  const isPeerOpen = useSelectIsPeerOpen();
  const { retryConnection, restartPeer, isReconnecting, reconnectAttempts } = usePeerRecovery();
  const history = useMessageHistory<TestMessage>();
  const { sendHistoryToClient } = useHistoryReplay<TestMessage>();
  const connectedClients = useConnectedClients();

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    addLog(`Host component mounted. Host ID: ${hostId}`);
  }, [hostId, addLog]);

  useEffect(() => {
    const peerIdString = peerId?.id ?? "not assigned";
    addLog(`Peer ID changed: ${peerIdString}`);
  }, [peerId?.id, addLog]);

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
      setMessageCount((prev) => {
        const newCount = prev + 1;
        const msg = latestMessageWrapper.data;
        const sender = msg.senderId ? ` from ${msg.senderId}` : '';
        addLog(`📥 Received message #${newCount}${sender}: ${JSON.stringify(msg)}`);
        return newCount;
      });
    }
  }, [latestMessageWrapper?._id, addLog]);

  const handleStartHost = useCallback(() => {
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
  }, [startHost, addLog]);

  const handleStopHost = useCallback(() => {
    addLog("🔴 Stopping host...");
    setIsHosting(false);
  }, [addLog]);

  const handleBroadcast = useCallback(() => {
    const message: TestMessage = {
      type: "ping",
      payload: {
        message: "Hello from host!",
        timestamp: new Date().toISOString(),
      },
    };
    addLog(`📤 Broadcasting: ${JSON.stringify(message)}`);
    try {
      sendData(message);
      addLog("✅ Broadcast sent");
    } catch (error) {
      addLog(`❌ Broadcast error: ${error}`);
    }
  }, [sendData, addLog]);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const handleCopyHostId = useCallback(() => {
    navigator.clipboard.writeText(hostId);
    addLog("📋 Host ID copied to clipboard");
  }, [hostId, addLog]);

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

  const handleReplayHistory = useCallback(() => {
    const messagesToReplay = Math.min(history.length, 20);
    if (connectedClients.length === 0) {
      addLog("⚠️ No connected clients to replay history to.");
      return;
    }

    connectedClients.forEach((clientId) => {
      sendHistoryToClient({ id: clientId, limit: messagesToReplay });
    });

    addLog(`📼 Replayed last ${messagesToReplay} messages to ${connectedClients.length} client(s).`);
  }, [addLog, connectedClients, history.length, sendHistoryToClient]);

  return {
    hostId,
    logs,
    isHosting,
    messageCount,
    isPeerOpen,
    isReconnecting,
    reconnectAttempts,
    historySize: history.length,
    connectedClients,
    peerId,
    actions: {
      startHost: handleStartHost,
      stopHost: handleStopHost,
      broadcast: handleBroadcast,
      clearLogs: handleClearLogs,
      copyHostId: handleCopyHostId,
      copyLogs: handleCopyLogs,
      retryConnection: handleRetryConnection,
      restartPeer: handleRestartPeer,
      replayHistory: handleReplayHistory,
      addLog,
    },
  };
}
