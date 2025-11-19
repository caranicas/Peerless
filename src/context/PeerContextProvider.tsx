import type { PropsWithChildren } from "react";
import React, { useEffect, useState, useCallback } from "react";
import Peer from "peerjs";

import type { PeerJSOption, PeerConnectOption, DataConnection } from "peerjs";
import { PeerContext } from "./PeerContext";

interface PeerContextProviderProps {
  id?: string;
  peerOptions?: PeerJSOption;
}

export default function PeerContextProvider({
  children,
  id,
  peerOptions,
}: PropsWithChildren<PeerContextProviderProps>) {
  const [peer, setPeer] = useState<Peer | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const [hostId, setHostId] = useState<string>("");
  const [foundHost, setFoundHost] = useState(false);
  const [latestMessage, setLatestMessage] = useState<unknown | null>(null);
  const [messageQueue, setMessageQueue] = useState<unknown[]>([]);

  const [isHandlingMessage, setIsHandlingMessage] = useState(false);
  const [isFinishedHandlingMessage, setIsFinishHandlingMessage] = useState(false);
  const [connectionMap, setConnectionMap] = useState<Map<string, DataConnection>>(
    () => new Map()
  );

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
    (data: unknown) => {
      connectionMap.forEach((connection) => {
        connection.send(data);
      });
    },
    [connectionMap]
  );

  const sendDataToClientAtId = useCallback(
    ({ id: clientId, data }: { id: string; data: unknown }) => {
      const client = connectionMap.get(clientId);
      client?.send(data);
    },
    [connectionMap]
  );

  const sendDataToRemainingClients = useCallback(
    ({ id: ignoredId, data }: { id: string; data: unknown }) => {
      connectionMap.forEach((connection) => {
        if (connection.peer !== ignoredId) {
          connection.send(data);
        }
      });
    },
    [connectionMap]
  );

  const sendToAllClients = useCallback(
    (data: unknown) => {
      connectionMap.forEach((connection) => {
        connection.send(data);
      });
    },
    [connectionMap]
  );

  const nextMessage = useCallback(() => {
    setIsFinishHandlingMessage(true);
  }, []);

  useEffect(() => {
    if (isHandlingMessage && isFinishedHandlingMessage) {
      setMessageQueue((queue) => {
        const [, ...remaining] = queue;
        setLatestMessage(remaining[0] ?? null);
        return remaining;
      });
      setIsFinishHandlingMessage(false);
      setIsHandlingMessage(false);
    }
  }, [isFinishedHandlingMessage, isHandlingMessage]);

  const dataHandler = useCallback((data: unknown) => {
    setMessageQueue((queue) => {
      const nextQueue = queue.concat([data]);
      setLatestMessage(nextQueue[0] ?? null);
      return nextQueue;
    });
  }, []);

  const openConnectionHandler = useCallback(() => {
    if (!isHost) {
      setFoundHost(true);
    }
  }, [isHost]);

  useEffect(() => {
    if (connectionMap.size === 0) {
      return;
    }

    connectionMap.forEach((connection) => {
      connection.on("open", openConnectionHandler);
      connection.on("data", dataHandler);
    });

    return () => {
      connectionMap.forEach((connection) => {
        connection.off("open", openConnectionHandler);
        connection.off("data", dataHandler);
      });
    };
  }, [dataHandler, openConnectionHandler, connectionMap]);

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
        messageQueue,
        latestMessage,
        isHandlingMessage,
        setIsHandlingMessage,
        nextMessage,
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
