import { useContext, useMemo, useCallback } from "react";
import { PeerContext, type MessageWrapper } from "../context/PeerContext";

export default function usePeerContext() {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeerContext must be used within a PeerContextProvider");
  }

  return context;
}

export function useStartHostConnection(hostId: string) {
  const { isOpen, createHost, disconnect } = usePeerContext();
  return useCallback(() => {
    if (isOpen) {
      return undefined;
    }
    createHost(hostId);

    return () => {
      disconnect();
    };
  }, [hostId, isOpen, createHost, disconnect]);
}

export function useStartClientConnection(peerId: string, hostId: string) {
  const { isOpen, createClient, disconnect } = usePeerContext();
  return useCallback(() => {
    if (isOpen) {
      return undefined;
    }
    createClient(peerId, hostId);
    return () => {
      disconnect();
    };
  }, [peerId, hostId, isOpen, createClient, disconnect]);
}

export function useLatestMessage<T = unknown>() {
  const { latestMessage } = usePeerContext();
  return latestMessage?.data as T;
}

export function useLatestMessageWrapper<T = unknown>() {
  const { latestMessage } = usePeerContext();
  return latestMessage as import("../context/PeerContext").MessageWrapper<T> | null;
}

// Consolidated send function - works for both host and client
export function useSendData<T = unknown>() {
  const { sendData } = usePeerContext();
  return sendData as (data: T) => void;
}

export function useBroadcastFromClient<T = unknown>() {
  const { broadcastFromClient } = usePeerContext();
  return broadcastFromClient as (data: T) => void;
}

export function useSendDataToRemainingClients<T = unknown>() {
  const { sendDataToRemainingClients } = usePeerContext();
  return sendDataToRemainingClients as (payload: { id: string; data: T }) => void;
}

export function useSendDataToClientAtId<T = unknown>() {
  const { sendDataToClientAtId } = usePeerContext();
  return sendDataToClientAtId as (payload: { id: string; data: T }) => void;
}

export function useHostInfo() {
  const { isHost, hostId } = usePeerContext();
  return { isHost, hostId };
}

export function useConnectedClients() {
  const { connectedClients } = usePeerContext();
  return connectedClients;
}

export function usePeerError() {
  const { error } = usePeerContext();
  return error;
}

export function useClearMessageQueue() {
  const { clearMessageQueue } = usePeerContext();
  return clearMessageQueue;
}

export function usePeerRecovery() {
  const { retryConnection, restartPeer, isReconnecting, reconnectAttempts } = usePeerContext();
  return {
    retryConnection,
    restartPeer,
    isReconnecting,
    reconnectAttempts,
  };
}

export function usePeerId() {
  const { id } = usePeerContext();
  return { id };
}

export const useSelectIsPeerOpen = () => {
  const peerJS = usePeerContext();
  return useMemo(() => {
    return !!peerJS?.isOpen;
  }, [peerJS]);
};

export function useInPeerConnection() {
  const peerJS = usePeerContext();
  return useMemo(() => {
    return !!peerJS?.isConnected;
  }, [peerJS]);
}

export function useDidFindHost() {
  const peerJS = usePeerContext();
  return useMemo(() => {
    return !!peerJS?.foundHost;
  }, [peerJS]);
}

export function useMessageHistory<T = unknown>() {
  const { messageHistory } = usePeerContext();
  return messageHistory as MessageWrapper<T>[];
}

export function useHistoryReplay<T = unknown>() {
  const { sendHistoryToClient, getHistorySince } = usePeerContext();
  return {
    sendHistoryToClient: sendHistoryToClient as (options: {
      id: string;
      since?: number;
      limit?: number;
    }) => void,
    getHistorySince: getHistorySince as (timestamp: number) => MessageWrapper<T>[],
  };
}
