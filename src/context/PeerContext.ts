import type { PeerConnectOption, PeerJSOption } from "peerjs";
import { createContext } from "react";

export interface PeerMessage {
  id: string;
  payload: unknown;
}

export interface MessageWrapper<T> {
  _id: number;
  _timestamp: number;
  data: T;
}

export interface PeerContextValue<TMessage = unknown> {
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

  latestMessage: MessageWrapper<TMessage> | null;

  sendDataToHost: (data: TMessage) => void;
  sendToAllClients: (data: TMessage) => void;
  sendDataToRemainingClients: ({ id, data }: { id: string; data: TMessage }) => void;
  sendDataToClientAtId: ({ id, data }: { id: string; data: TMessage }) => void;
  broadcastFromClient: (data: TMessage) => void;
}

export const PeerContext = createContext<PeerContextValue<any> | undefined>(undefined);
