import type { PeerJSOption } from "peerjs";
import { createContext } from "react";

export interface MessageWrapper<T> {
  _id: number;
  _timestamp: number;
  data: T;
}

export interface PeerContextValue<TMessage = unknown> {
  createHost: (id: string, peerOptions?: PeerJSOption) => void;
  createClient: (id: string, hostId: string, peerOptions?: PeerJSOption) => void;
  disconnect: () => void;
  retryConnection: () => void;
  restartPeer: () => void;

  hostId: string;
  id?: string;
  isHost: boolean;
  isOpen: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  foundHost: boolean;
  error: Error | null;
  connectedClients: string[];

  latestMessage: MessageWrapper<TMessage> | null;
  clearMessageQueue: () => void;
  messageHistory: MessageWrapper<TMessage>[];
  getHistorySince: (timestamp: number) => MessageWrapper<TMessage>[];
  sendHistoryToClient: (options: { id: string; since?: number; limit?: number }) => void;

  sendData: (data: TMessage) => void;
  sendDataToRemainingClients: ({ id, data }: { id: string; data: TMessage }) => void;
  sendDataToClientAtId: ({ id, data }: { id: string; data: TMessage }) => void;
  broadcastFromClient: (data: TMessage) => void;
}

export const PeerContext = createContext<PeerContextValue<any> | undefined>(undefined);
