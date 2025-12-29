import type { PropsWithChildren } from "react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Peer from "peerjs";

import type { PeerJSOption, PeerConnectOption, DataConnection } from "peerjs";

type PeerInstance = InstanceType<typeof Peer>;
import { PeerContext, type MessageWrapper } from "./PeerContext";

interface PeerContextProviderProps<TMessage = unknown> {
  id?: string;
  peerOptions?: PeerJSOption;
}

export default function PeerContextProvider<TMessage = unknown>({
  children,
  id,
  peerOptions,
}: PropsWithChildren<PeerContextProviderProps<TMessage>>) {
  const [peer, setPeer] = useState<PeerInstance | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [hostId, setHostId] = useState<string>("");
  const [foundHost, setFoundHost] = useState(false);
  const [latestMessage, setLatestMessage] = useState<MessageWrapper<TMessage> | null>(null);
  const [messageQueue, setMessageQueue] = useState<MessageWrapper<TMessage>[]>([]);
  const messageCounterRef = useRef(0);
  const [connectionMap, setConnectionMap] = useState<Map<string, DataConnection>>(
    () => new Map()
  );
  const attachedHandlersRef = useRef<Set<string>>(new Set());
  const connectionMapRef = useRef(connectionMap);
  const [messageHistory, setMessageHistory] = useState<MessageWrapper<TMessage>[]>([]);
  const messageHistoryRef = useRef(messageHistory);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAttemptReconnectRef = useRef(true);
  const lastPeerConfigRef = useRef<{
    peerId: string;
    hostId?: string;
    options?: PeerJSOption;
    isHost: boolean;
  } | null>(null);

  const MAX_QUEUE_SIZE = 100;
  const MAX_HISTORY_SIZE = 500;
  const MAX_RECONNECT_ATTEMPTS = 5;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const resetReconnectState = useCallback(() => {
    clearReconnectTimer();
    reconnectAttemptsRef.current = 0;
    setReconnectAttempts(0);
    setIsReconnecting(false);
  }, [clearReconnectTimer]);

  const resetMessageState = useCallback(() => {
    setMessageQueue([]);
    setLatestMessage(null);
    setMessageHistory([]);
    messageHistoryRef.current = [];
    messageCounterRef.current = 0;
  }, []);

  const registerPeerConfig = useCallback(
    (config: { peerId: string; hostId?: string; options?: PeerJSOption; isHost: boolean }) => {
      lastPeerConfigRef.current = config;
    },
    []
  );

  /** PEER  */
  const createHost = useCallback(
    (peerId: string, peerCreationOptions?: PeerJSOption) => {
      shouldAttemptReconnectRef.current = true;
      setError(null);
      resetReconnectState();
      resetMessageState();
      setConnectionMap(new Map());
      setIsConnected(false);
      setIsOpen(false);
      setFoundHost(false);
      const options = peerCreationOptions ?? peerOptions;
      const createdPeer = new Peer(peerId, options);
      setHostId(peerId);
      setIsHost(true);
      setPeer(createdPeer);
      registerPeerConfig({ peerId, options, isHost: true });
    },
    [peerOptions, registerPeerConfig, resetMessageState, resetReconnectState]
  );

  const createClient = useCallback(
    (peerId: string, newHostId: string, peerCreationOptions?: PeerJSOption) => {
      shouldAttemptReconnectRef.current = true;
      setError(null);
      resetReconnectState();
      resetMessageState();
      setConnectionMap(new Map());
      setIsConnected(false);
      setIsOpen(false);
      setFoundHost(false);
      const options = peerCreationOptions ?? peerOptions;
      const createdPeer = new Peer(peerId, options);
      setHostId(newHostId);
      setIsHost(false);
      setPeer(createdPeer);
      registerPeerConfig({ peerId, hostId: newHostId, options, isHost: false });
    },
    [peerOptions, registerPeerConfig, resetMessageState, resetReconnectState]
  );

  const disconnect = useCallback(() => {
    shouldAttemptReconnectRef.current = false;
    clearReconnectTimer();
    if (!peer) {
      setConnectionMap(new Map());
      setIsConnected(false);
      setIsOpen(false);
      setFoundHost(false);
      resetReconnectState();
      resetMessageState();
      return;
    }

    peer.disconnect();
    peer.destroy();
    setPeer(undefined);
    setConnectionMap(new Map());
    setIsConnected(false);
    setIsOpen(false);
    setError(null);
    resetMessageState();
    resetReconnectState();
    attachedHandlersRef.current.clear();
  }, [clearReconnectTimer, peer, resetMessageState, resetReconnectState]);

  const createMessageWrapper = useCallback(
    (data: TMessage): MessageWrapper<TMessage> => {
      messageCounterRef.current += 1;
      return {
        _id: messageCounterRef.current,
        _timestamp: Date.now(),
        data,
      };
    },
    []
  );

  const recordMessage = useCallback((messageWrapper: MessageWrapper<TMessage>) => {
    setMessageHistory((prev) => {
      const updatedHistory = [...prev, messageWrapper];
      return updatedHistory.length > MAX_HISTORY_SIZE
        ? updatedHistory.slice(-MAX_HISTORY_SIZE)
        : updatedHistory;
    });
  }, []);

  const getHistorySince = useCallback(
    (timestamp: number) => {
      return messageHistoryRef.current.filter((message) => message._timestamp >= timestamp);
    },
    []
  );

  const sendHistoryToClient = useCallback(
    ({ id: clientId, since, limit }: { id: string; since?: number; limit?: number }) => {
      const connection = connectionMapRef.current.get(clientId);
      if (!connection) {
        console.warn(`Cannot send history, no connection found for ${clientId}`);
        return;
      }

      const history = getHistorySince(since ?? 0);
      const toSend = typeof limit === "number" ? history.slice(-limit) : history;

      toSend.forEach((entry) => connection.send(entry.data));
    },
    [getHistorySince]
  );

  const performReconnect = useCallback(() => {
    if (!peer || !shouldAttemptReconnectRef.current) {
      return;
    }

    const resilientPeer = peer as unknown as {
      destroyed?: boolean;
      disconnected?: boolean;
      reconnect?: () => void;
    };

    if (resilientPeer.destroyed) {
      return;
    }

    if (resilientPeer.disconnected && resilientPeer.reconnect) {
      resilientPeer.reconnect();
    }

    if (!isHost && hostId) {
      const existingConnection = connectionMapRef.current.get(hostId);
      if (!existingConnection) {
        const conn = peer.connect(hostId);
        setConnectionMap((prev) => {
          const next = new Map(prev);
          next.set(conn.peer, conn);
          return next;
        });
      }
    }
  }, [hostId, isHost, peer]);

  const scheduleReconnect = useCallback(
    (reason: string, immediate = false) => {
      if (!peer || !shouldAttemptReconnectRef.current) {
        return;
      }

      if (immediate) {
        resetReconnectState();
        performReconnect();
        return;
      }

      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setIsReconnecting(false);
        console.error("Max reconnection attempts reached. Manual intervention required.", reason);
        return;
      }

      const nextAttempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = nextAttempt;
      setReconnectAttempts(nextAttempt);
      setIsReconnecting(true);

      const delay = Math.min(1000 * 2 ** (nextAttempt - 1), 10000);
      clearReconnectTimer();
      reconnectTimerRef.current = setTimeout(() => {
        performReconnect();
      }, delay);
    },
    [MAX_RECONNECT_ATTEMPTS, clearReconnectTimer, performReconnect, peer, resetReconnectState]
  );

  const retryConnection = useCallback(() => {
    scheduleReconnect("manual retry", true);
  }, [scheduleReconnect]);

  const restartPeer = useCallback(() => {
    const previousConfig = lastPeerConfigRef.current;
    if (!previousConfig) {
      console.warn("No previous peer configuration available to restart.");
      return;
    }

    const { peerId, hostId: previousHostId, options, isHost: wasHost } = previousConfig;

    disconnect();

    if (wasHost) {
      createHost(peerId, options);
    } else if (previousHostId) {
      createClient(peerId, previousHostId, options);
    }
  }, [createClient, createHost, disconnect]);

  const openHandler = useCallback(() => {
    setIsOpen(true);
    resetReconnectState();

    if (!isHost && peer) {
      setIsConnected(true);
      const conn = peer.connect(hostId);
      setConnectionMap((prev) => {
        const next = new Map(prev);
        next.set(conn.peer, conn);
        return next;
      });
    }
  }, [hostId, isHost, peer, resetReconnectState]);

  const connectedHandler = useCallback(
    (connection: DataConnection) => {
      if (isHost) {
        setConnectionMap((prev) => {
          const next = new Map(prev);
          next.set(connection.peer, connection);
          return next;
        });
      }
      setIsConnected(true);
    },
    [isHost]
  );

  const peerDisconnectedHandler = useCallback(() => {
    setIsOpen(false);
    setIsConnected(false);
    scheduleReconnect("peer disconnected");
  }, [scheduleReconnect]);

  const errorHandler = useCallback((err: Error) => {
    setError(err);
    console.error("PeerJS Error:", err);
    scheduleReconnect("peer error");
  }, [scheduleReconnect]);

  useEffect(() => {
    if (!peer) {
      return;
    }

    peer.on("open", openHandler);
    peer.on("connection", connectedHandler);
    peer.on("disconnected", peerDisconnectedHandler);
    peer.on("close", peerDisconnectedHandler);
    peer.on("error", errorHandler);

    return () => {
      peer.off("open", openHandler);
      peer.off("connection", connectedHandler);
      peer.off("disconnected", peerDisconnectedHandler);
      peer.off("close", peerDisconnectedHandler);
      peer.off("error", errorHandler);
    };
  }, [peer, openHandler, connectedHandler, peerDisconnectedHandler, errorHandler]);

  /** CONNECTION  */
  // Universal send function - sends to all connections (host for client, all clients for host)
  const sendData = useCallback(
    (data: TMessage) => {
      const messageWrapper = createMessageWrapper(data);
      recordMessage(messageWrapper);
      connectionMap.forEach((connection) => {
        connection.send(data);
      });
    },
    [connectionMap, createMessageWrapper, recordMessage]
  );

  const sendDataToClientAtId = useCallback(
    ({ id: clientId, data }: { id: string; data: TMessage }) => {
      const client = connectionMap.get(clientId);
      if (client) {
        const messageWrapper = createMessageWrapper(data);
        recordMessage(messageWrapper);
        client.send(data);
      }
    },
    [connectionMap, createMessageWrapper, recordMessage]
  );

  const sendDataToRemainingClients = useCallback(
    ({ id: ignoredId, data }: { id: string; data: TMessage }) => {
      const messageWrapper = createMessageWrapper(data);
      recordMessage(messageWrapper);
      connectionMap.forEach((connection) => {
        if (connection.peer !== ignoredId) {
          connection.send(data);
        }
      });
    },
    [connectionMap, createMessageWrapper, recordMessage]
  );

  const broadcastFromClient = useCallback(
    (data: TMessage) => {
      // Client sends to host with relay flag, host forwards to all other clients
      const messageWrapper = createMessageWrapper(data);
      recordMessage(messageWrapper);
      connectionMap.forEach((connection) => {
        connection.send({ ...data, _relay: true } as TMessage);
      });
    },
    [connectionMap, createMessageWrapper, recordMessage]
  );

  const clearMessageQueue = useCallback(() => {
    setMessageQueue([]);
  }, []);

  const openConnectionHandler = useCallback(() => {
    if (!isHost) {
      setFoundHost(true);
    }
  }, [isHost]);

  // Keep ref in sync with state
  useEffect(() => {
    connectionMapRef.current = connectionMap;
  }, [connectionMap]);

  useEffect(() => {
    return () => {
      clearReconnectTimer();
    };
  }, [clearReconnectTimer]);

  useEffect(() => {
    messageHistoryRef.current = messageHistory;
  }, [messageHistory]);

  // Auto-process message queue
  useEffect(() => {
    if (messageQueue.length === 0) {
      return;
    }

    // Process first message in queue
    const nextMessage = messageQueue[0];
    setLatestMessage(nextMessage);
    
    // Remove processed message after a short delay to ensure components react
    const timer = setTimeout(() => {
      setMessageQueue(prev => prev.slice(1));
    }, 0);

    return () => clearTimeout(timer);
  }, [messageQueue]);

  // Warn if queue is growing too large
  useEffect(() => {
    if (messageQueue.length > MAX_QUEUE_SIZE) {
      console.warn(`Message queue exceeded ${MAX_QUEUE_SIZE} messages. Oldest messages will be dropped.`);
      setMessageQueue(prev => prev.slice(-MAX_QUEUE_SIZE));
    }
  }, [messageQueue.length]);

  useEffect(() => {
    if (connectionMap.size === 0) {
      setIsConnected(false);
      return;
    }
    setIsConnected(true);

    connectionMap.forEach((connection, senderId) => {
      // Only attach handlers if we haven't already attached them to this connection
      if (attachedHandlersRef.current.has(senderId)) {
        return;
      }

      const dataHandler = (data: TMessage) => {
        const messageWrapper = createMessageWrapper(data);
        recordMessage(messageWrapper);
        
        // Add to queue for sequential processing (with size limit)
        setMessageQueue((prev) => {
          const newQueue = [...prev, messageWrapper];
          return newQueue.length > MAX_QUEUE_SIZE ? newQueue.slice(-MAX_QUEUE_SIZE) : newQueue;
        });
        
        // If host receives a message with _relay flag, broadcast to all other clients
        // Use connectionMapRef.current to get the LATEST connectionMap
        if (isHost && data && typeof data === 'object' && '_relay' in data) {
          connectionMapRef.current.forEach((conn) => {
            if (conn.peer !== senderId) {
              conn.send(data);
            }
          });
        }
      };

      const closeHandler = () => {
        setConnectionMap((prev) => {
          const next = new Map(prev);
          next.delete(senderId);
          return next;
        });
        if (!isHost && senderId === hostId) {
          setIsConnected(false);
          scheduleReconnect("connection closed");
        }
        attachedHandlersRef.current.delete(senderId);
      };

      const connectionErrorHandler = (err: Error) => {
        console.error(`Connection error with ${senderId}:`, err);
        setError(err);
        if (!isHost && senderId === hostId) {
          scheduleReconnect("connection error");
        }
      };

      connection.on("open", openConnectionHandler);
      connection.on("data", dataHandler);
      connection.on("close", closeHandler);
      connection.on("error", connectionErrorHandler);
      attachedHandlersRef.current.add(senderId);
    });

    return () => {
      // Clean up handlers for connections that no longer exist
      const currentIds = new Set(connectionMap.keys());
      attachedHandlersRef.current.forEach((senderId) => {
        if (!currentIds.has(senderId)) {
          attachedHandlersRef.current.delete(senderId);
        }
      });
    };
  }, [
    connectionMap,
    createMessageWrapper,
    hostId,
    isHost,
    openConnectionHandler,
    recordMessage,
    scheduleReconnect,
  ]);

  return (
    <PeerContext.Provider
      value={{
        createHost,
        createClient,
        disconnect,
        isHost,
        hostId,
        retryConnection,
        restartPeer,
        isReconnecting,
        reconnectAttempts,
        sendData,
        sendDataToRemainingClients,
        sendDataToClientAtId,
        broadcastFromClient,
        clearMessageQueue,
        latestMessage,
        messageHistory,
        getHistorySince,
        sendHistoryToClient,
        isOpen,
        isConnected,
        id: peer?.id,
        foundHost,
        error,
        connectedClients: Array.from(connectionMap.keys()),
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}
