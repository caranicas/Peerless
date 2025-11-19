/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useEffect, useState, useCallback } from "react";
import { PeerContext } from "./PeerContext";
import Peer from "peerjs";

import type { PeerJSOption, PeerConnectOption, DataConnection } from "peerjs";

interface PeerContextProviderProps {
  id?: string;
  peerOptions?: PeerJSOption;
}

export default function PeerContextProvider({
  children,
  id,
  peerOptions,
}: React.PropsWithChildren<PeerContextProviderProps>) {
  const [peer, setPeer] = useState<Peer | undefined>(undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const [hostId, setHostId] = useState<string>("");
  const [foundHost, setFoundHost] = useState(false);
  const [latestMessage, setLatestMessage] = useState<unknown>(null);
  const [messageQueue, setMessageQueue] = useState<unknown[]>([]);

  const [isHandlingMessage, setIsHandlingMessage] = useState(false);
  const [isFinishedHandlingMessage, setIsFinishHandlingMessage] =
    useState(false);
  // const [connectionMap, setConnectionMap] = useState<Map<string, DataConnection>>(new Map());
  const [connectionMap, setConnectionMap] = useState(new Map());
  const [connection, setConnection] = useState<DataConnection | undefined>(
    undefined
  );

  /** PEER  */
  const createPeer = useCallback((id: string, peerOptions?: PeerJSOption) => {
    const peer = new Peer(id, peerOptions);
    setPeer(peer);
  }, []);

  const createHost = useCallback((id: string, peerOptions?: PeerJSOption) => {
    const peer = new Peer(id, peerOptions);
    setHostId(id);
    setIsHost(true);
    setPeer(peer);
  }, []);

  const createClient = useCallback(
    (id: string, hostId: string, peerOptions?: PeerJSOption) => {
      const peer = new Peer(id, peerOptions);
      console.log("PEER: createClient id", id);
      setHostId(hostId);
      setIsHost(false);
      setPeer(peer);
      console.log("PEER: createClient peer", peer);
    },
    []
  );

  const connect = useCallback(
    (id: string, peerConnectionOptions?: PeerConnectOption) => {
      if (peer === undefined) {
        return;
      }

      //const conn =
      peer.connect(id, peerConnectionOptions);
      // setConnection(conn);
      //  setConnectionMap(new Map(connectionMap).set(conn?.peer, conn));
    },
    [peer]
  );

  const disconnect = useCallback(() => {
    if (peer === undefined) {
      return;
    }

    peer.disconnect();
    peer.destroy();
    setPeer(undefined);
  }, [peer]);

  const openHandler = useCallback(() => {
    setIsOpen(true);

    if (!isHost) {
      setIsConnected(true); //?

      // this has to be done here. I'm not sure why.
      // I would prefer to handle this in an openchange handler
      // eslint-disable-next-line no-var
      const conn = peer?.connect(hostId);
      // setConnections([conn]);
      const newMap = new Map(connectionMap);
      setConnectionMap(newMap.set(conn?.peer, conn));
    }
  }, [isHost, hostId, peer, connectionMap]);

  const connectedHandler = useCallback(
    (connection: DataConnection) => {
      if (isHost) {
        const newMap = new Map(connectionMap);
        newMap.set(connection.peer, connection);
        setConnectionMap(newMap);
      }
      setIsConnected(true);
    },
    [isHost, connectionMap]
  );

  const disconnectedHandler = useCallback(
    (currentId: string) => {
      const newMap = new Map(connectionMap);
      newMap.delete(currentId);
      setConnectionMap(newMap);
      // should move this into the connection map useEffect
      // setIsConnected(false);
    },
    [connectionMap]
  );

  useEffect(() => {
    if (peer === undefined) {
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
  }, [peer, connectionMap, openHandler, connectedHandler, disconnectedHandler]);

  /** CONNECTION  */
  // functionally the same as sending to all clients
  const sendDataToHost = useCallback(
    (data: unknown) => {
      console.log("PEER: sendDataToHost", data);
      connectionMap.forEach((connection) => {
        connection.send(data);
      });
    },
    [connectionMap]
  );

  const sendDataToClientAtId = useCallback(
    ({ id, data }: { id: string; data: unknown }) => {
      console.log("sendDataToClientAtId", id, data);
      connectionMap.get(id)?.send(data);
    },
    [connectionMap]
  );

  const sendDataToRemainingClients = useCallback(
    ({ id, data }: { id: string; data: unknown }) => {
      connectionMap.forEach((connection) => {
        if (connection.peer !== id) {
          console.error("sendDataToRemainingClients", id, data);
          connection.send(data);
        }
      });
    },
    [connectionMap]
  );

  const sendToAllClients = useCallback(
    (data: unknown) => {
      console.log("sendToAllClients", data);
      connectionMap.forEach((connection) => {
        console.log("EACH CONNECTION", connection);
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
      const newMessageQueue = Array.from(messageQueue);
      newMessageQueue.shift();
      console.log("PEER: DEBUG: CONTEXT: NEXTMESSAGE", newMessageQueue);
      setMessageQueue(newMessageQueue);
      setLatestMessage(newMessageQueue[0]);
      setIsFinishHandlingMessage(false);
      setIsHandlingMessage(false);
    }
  }, [isFinishedHandlingMessage, isHandlingMessage, messageQueue]);

  const dataHandler = useCallback(
    (data: unknown) => {
      console.log("PEER: DEBUG: CONTEXT: dataHandler", data);
      const tempMessageQueue = Array.from(messageQueue).concat([data]);
      setMessageQueue(tempMessageQueue);
      console.log(
        "PEER: DEBUG: CONTEXT: set latest message",
        tempMessageQueue[0]
      );
      setLatestMessage(tempMessageQueue[0]);
    },
    [messageQueue]
  );

  const openConnectionHandler = useCallback(() => {
    if (!isHost) {
      setFoundHost(true);
    }
  }, [isHost]);

  useEffect(() => {
    // only needed for the first entry
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        latestMessage,
        isHandlingMessage,
        setIsHandlingMessage,
        nextMessage,
        isOpen,
        isConnected,
        id: peer?.id,
        foundHost: foundHost,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}
