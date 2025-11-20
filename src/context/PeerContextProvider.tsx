import type { PropsWithChildren } from "react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Peer from "peerjs";

import type { PeerJSOption, PeerConnectOption, DataConnection } from "peerjs";
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
  const [peer, setPeer] = useState<Peer | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

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

  /** PEER  */
  const createPeer = useCallback(
    (peerId: string, peerCreationOptions?: PeerJSOption) => {
      const createdPeer = new Peer(peerId, peerCreationOptions);
      setPeer(createdPeer);
    },
    []
  );

  const createHost = useCallback(
    (peerId: string, peerCreationOptions?: PeerJSOption) => {
      const createdPeer = new Peer(peerId, peerCreationOptions);
      setHostId(peerId);
      setIsHost(true);
      setPeer(createdPeer);
    },
    []
  );

  const createClient = useCallback(
    (peerId: string, newHostId: string, peerCreationOptions?: PeerJSOption) => {
      const createdPeer = new Peer(peerId, peerCreationOptions);
      setHostId(newHostId);
      setIsHost(false);
      setPeer(createdPeer);
    },
    []
  );

  const connect = useCallback(
    (peerId: string, peerConnectionOptions?: PeerConnectOption) => {
      if (!peer) {
        return;
      }

      peer.connect(peerId, peerConnectionOptions);
    },
    [peer]
  );

  const disconnect = useCallback(() => {
    if (!peer) {
      return;
    }

    peer.disconnect();
    peer.destroy();
    setPeer(undefined);
    setConnectionMap(new Map());
    setIsConnected(false);
    setIsOpen(false);
  }, [peer]);

  const openHandler = useCallback(() => {
    setIsOpen(true);

    if (!isHost && peer) {
      setIsConnected(true);
      const conn = peer.connect(hostId);
      setConnectionMap((prev) => {
        const next = new Map(prev);
        next.set(conn.peer, conn);
        return next;
      });
    }
  }, [isHost, hostId, peer]);

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

  const disconnectedHandler = useCallback((currentId: string) => {
    setConnectionMap((prev) => {
      const next = new Map(prev);
      next.delete(currentId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!peer) {
      return;
    }

    peer.on("open", openHandler);
    peer.on("connection", connectedHandler);
    peer.on("disconnected", disconnectedHandler);

    return () => {
      peer.off("open", openHandler);
      peer.off("connection", connectedHandler);
      peer.off("disconnected", disconnectedHandler);
    };
  }, [peer, openHandler, connectedHandler, disconnectedHandler]);

  /** CONNECTION  */
  const sendDataToHost = useCallback(
    (data: TMessage) => {
      connectionMap.forEach((connection) => {
        connection.send(data);
      });
    },
    [connectionMap]
  );

  const sendDataToClientAtId = useCallback(
    ({ id: clientId, data }: { id: string; data: TMessage }) => {
      const client = connectionMap.get(clientId);
      client?.send(data);
    },
    [connectionMap]
  );

  const sendDataToRemainingClients = useCallback(
    ({ id: ignoredId, data }: { id: string; data: TMessage }) => {
      connectionMap.forEach((connection) => {
        if (connection.peer !== ignoredId) {
          connection.send(data);
        }
      });
    },
    [connectionMap]
  );

  const sendToAllClients = useCallback(
    (data: TMessage) => {
      connectionMap.forEach((connection) => {
        connection.send(data);
      });
    },
    [connectionMap]
  );

  const broadcastFromClient = useCallback(
    (data: TMessage) => {
      // Client sends to host with relay flag, host forwards to all other clients
      connectionMap.forEach((connection) => {
        connection.send({ ...data, _relay: true } as TMessage);
      });
    },
    [connectionMap]
  );

  const openConnectionHandler = useCallback(() => {
    if (!isHost) {
      setFoundHost(true);
    }
  }, [isHost]);

  // Keep ref in sync with state
  useEffect(() => {
    connectionMapRef.current = connectionMap;
  }, [connectionMap]);

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

  useEffect(() => {
    if (connectionMap.size === 0) {
      return;
    }

    connectionMap.forEach((connection, senderId) => {
      // Only attach handlers if we haven't already attached them to this connection
      if (attachedHandlersRef.current.has(senderId)) {
        return;
      }

      const dataHandler = (data: TMessage) => {
        messageCounterRef.current += 1;
        const messageWrapper: MessageWrapper<TMessage> = {
          _id: messageCounterRef.current,
          _timestamp: Date.now(),
          data,
        };
        
        // Add to queue for sequential processing
        setMessageQueue((prev) => [...prev, messageWrapper]);
        
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

      connection.on("open", openConnectionHandler);
      connection.on("data", dataHandler);
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
  }, [isHost, openConnectionHandler, connectionMap]);

  useEffect(() => {
    if (id && !peer) {
      createPeer(id, peerOptions);
    }
  }, [createPeer, id, peer, peerOptions]);

  return (
    <PeerContext.Provider
      value={{
        createPeer,
        createHost,
        isHost,
        hostId,
        createClient,
        connect,
        disconnect,
        sendDataToHost,
        sendToAllClients,
        sendDataToRemainingClients,
        sendDataToClientAtId,
        broadcastFromClient,
        latestMessage,
        isOpen,
        isConnected,
        id: peer?.id,
        foundHost,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}
