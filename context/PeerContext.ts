/* eslint-disable @typescript-eslint/no-unused-vars */
// https://codesandbox.io/s/peerjs-react-context-lr6ms4
import Peer from "peerjs";
import type { PeerJSOption, PeerConnectOption, DataConnection } from "peerjs";
import { createContext } from "react";

interface IPeerContext {
  // Functions
  createPeer: (
    id: string,
    // isHost: boolean,
    // hostId: string,
    peerOptions?: PeerJSOption
  ) => void;

  createHost: (id: string, peerOptions?: PeerJSOption) => void;

  createClient: (
    id: string,
    hostId: string,
    peerOptions?: PeerJSOption
  ) => void;

  connect: (id: string, peerConnectionOptions?: PeerConnectOption) => void;
  disconnect: () => void;
  hostId: string;
  sendDataToHost: (data: unknown) => void;
  // @ts-expect-error - dataConnection is not defined
  sendDataToClientAtId: ({ id: string, data: any }) => void;
  sendToAllClients: (data: unknown) => void;
  // @ts-expect-error - dataConnection is not defined
  sendDataToRemainingClients: ({ id: string, data: any }) => void;
  nextMessage: () => void;
  // Properties
  isOpen: boolean;
  isConnected: boolean;
  messageQueue: unknown[];
  isHandlingMessage: boolean;
  setIsHandlingMessage: (isHandlingMessage: boolean) => void;
  latestMessage: unknown;
  id: string | undefined;
  isHost: boolean;
  foundHost: boolean;
}

export const PeerContext = createContext<IPeerContext | undefined>(undefined);
