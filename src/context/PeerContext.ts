import type { PeerConnectOption, PeerJSOption } from "peerjs";
import { createContext } from "react";

export interface PeerMessage {
  id: string;
  payload: unknown;
}

export interface PeerContextValue {
  createPeer: (id: string, peerOptions?: PeerJSOption) => void;
  createHost: (id: string, peerOptions?: PeerJSOption) => void;
  createClient: (id: string, hostId: string, peerOptions?: PeerJSOption) => void;
  connect: (id: string, peerConnectionOptions?: PeerConnectOption) => void;
  disconnect: () => void;

  hostId: string;
  id?: string;
  isHost: boolean;
  isOpen: boolean;
  isConnected: boolean;
  foundHost: boolean;

  messageQueue: unknown[];
  latestMessage: unknown | null;
  isHandlingMessage: boolean;
  setIsHandlingMessage: (value: boolean) => void;
  nextMessage: () => void;

  sendDataToHost: (data: unknown) => void;
  sendToAllClients: (data: unknown) => void;
  sendDataToRemainingClients: ({ id, data }: { id: string; data: unknown }) => void;
  sendDataToClientAtId: ({ id, data }: { id: string; data: unknown }) => void;
}

export const PeerContext = createContext<PeerContextValue | undefined>(undefined);
