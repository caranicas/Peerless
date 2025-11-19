/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useContext, useMemo, useCallback } from "react";
import { PeerContext } from "../context/PeerContext";

export default function usePeerContext() {
  return useContext(PeerContext);
}

export function useStartHostConnection(hostId: string) {
  // @ts-expect-error - dataConnection is not defined
  const { isOpen, createHost, disconnect } = usePeerContext();
  // return a function that creates a host connection
  return useCallback(() => {
    if (isOpen) {
      return;
    }
    createHost(hostId);

    return () => {
      disconnect();
    };
  }, [hostId, isOpen, createHost, disconnect]);
}

export function useStartClientConnection(peerId: string, hostId: string) {
  // @ts-expect-error - dataConnection is not defined
  const { isOpen, createClient, disconnect } = usePeerContext();
  // return a function that creates a client connection
  return useCallback(() => {
    if (isOpen) {
      return;
    }
    createClient(peerId, hostId);
    return () => {
      disconnect();
    };
  }, [peerId, hostId, isOpen, createClient, disconnect]);
}

export const useMessageQueue = () => {
  // @ts-expect-error - dataConnection is not defined
  const { messageQueue } = usePeerContext();
  return { messageQueue };
};

export function useLatestMessage() {
  // @ts-expect-error - dataConnection is not defined
  const { latestMessage } = usePeerContext();
  return [latestMessage];
}

export function useNextMessage() {
  // @ts-expect-error - dataConnection is not defined
  const { nextMessage } = usePeerContext();
  return nextMessage;
}

export function useIsHandlingMessage() {
  // @ts-expect-error - dataConnection is not defined
  const { isHandlingMessage, setIsHandlingMessage } = usePeerContext();
  return useMemo(() => {
    return { isHandlingMessage, setIsHandlingMessage };
  }, [isHandlingMessage, setIsHandlingMessage]);
}

export function useSendDataToHost() {
  // @ts-expect-error - dataConnection is not defined
  const { sendDataToHost } = usePeerContext();
  return useCallback(
    (data: unknown) => {
      sendDataToHost(data);
    },
    [sendDataToHost]
  );
}

export function useSendDataToAllClients() {
  // @ts-expect-error - dataConnection is not defined
  const { sendToAllClients } = usePeerContext();
  return useCallback(
    (data: unknown) => {
      sendToAllClients(data);
    },
    [sendToAllClients]
  );
}

export function useSendDataToRemainingClients() {
  // @ts-expect-error - dataConnection is not defined
  const { sendDataToRemainingClients } = usePeerContext();
  return useCallback(
    (payload: any) => {
      sendDataToRemainingClients(payload);
    },
    [sendDataToRemainingClients]
  );
}

export function useSendDataToClientAtId() {
  // @ts-expect-error - dataConnection is not defined
  const { sendDataToClientAtId } = usePeerContext();
  return useCallback(
    (payload: unknown) => {
      sendDataToClientAtId(payload);
    },
    [sendDataToClientAtId]
  );
}

export function useIsHost(): { isHost: boolean } {
  // @ts-expect-error - dataConnection is not defined
  const { isHost } = usePeerContext();
  return { isHost };
}

export function useHostInfo() {
  // @ts-expect-error - dataConnection is not defined
  const { isHost, hostId } = usePeerContext();
  return { isHost, hostId };
}

export function usePeerId() {
  // @ts-expect-error - dataConnection is not defined
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
