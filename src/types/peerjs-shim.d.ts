declare module "peerjs" {
  export interface PeerJSOption {
    host?: string;
    port?: number;
    path?: string;
    key?: string;
    secure?: boolean;
    debug?: number;
    [key: string]: unknown;
  }

  export interface PeerConnectOption {
    label?: string;
    metadata?: unknown;
    serialization?: "binary" | "json" | "binary-utf8";
    reliable?: boolean;
    [key: string]: unknown;
  }

  export interface DataConnection {
    peer: string;
    send: (data: unknown) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
  }

  export default class Peer {
    constructor(id?: string, options?: PeerJSOption);
    id?: string;
    connect: (peerId: string, options?: PeerConnectOption) => DataConnection;
    disconnect: () => void;
    destroy: () => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
  }
}
