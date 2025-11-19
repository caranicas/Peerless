import { useContext, useMemo, useCallback } from "react";
import { PeerContext } from "../context/PeerContext";

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

export const useMessageQueue = () => {
  const { messageQueue } = usePeerContext();
  return { messageQueue };
};

export function useLatestMessage<T = unknown>() {
  const { latestMessage } = usePeerContext();
  return latestMessage as T;
}

export function useNextMessage() {
  const { nextMessage } = usePeerContext();
  return nextMessage;
}

export function useIsHandlingMessage() {
  const { isHandlingMessage, setIsHandlingMessage } = usePeerContext();
  return useMemo(() => {
    return { isHandlingMessage, setIsHandlingMessage };
  }, [isHandlingMessage, setIsHandlingMessage]);
}

export function useSendDataToHost<T = unknown>() {
  const { sendDataToHost } = usePeerContext();
  return useCallback(
    (data: T) => {
      sendDataToHost(data);
    },
    [sendDataToHost]
  );
}

export function useSendDataToAllClients<T = unknown>() {
  const { sendToAllClients } = usePeerContext();
  return useCallback(
    (data: T) => {
      sendToAllClients(data);
    },
    [sendToAllClients]
  );
}

export function useSendDataToRemainingClients<T = unknown>() {
  const { sendDataToRemainingClients } = usePeerContext();
  return useCallback(
    (payload: { id: string; data: T }) => {
      sendDataToRemainingClients(payload);
    },
    [sendDataToRemainingClients]
  );
}

export function useSendDataToClientAtId<T = unknown>() {
  const { sendDataToClientAtId } = usePeerContext();
  return useCallback(
    (payload: { id: string; data: T }) => {
      sendDataToClientAtId(payload);
    },
    [sendDataToClientAtId]
  );
}

export function useIsHost(): { isHost: boolean } {
  const { isHost } = usePeerContext();
  return { isHost };
}

export function useHostInfo() {
  const { isHost, hostId } = usePeerContext();
  return { isHost, hostId };
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
