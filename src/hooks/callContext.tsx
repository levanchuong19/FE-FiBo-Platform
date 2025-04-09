import React, { createContext, useContext, useState } from "react";
import SimplePeer from "simple-peer";

interface CallContextType {
  stream: MediaStream | null;
  setStream: (stream: MediaStream | null) => void;
  peer: SimplePeer.Instance | null;
  setPeer: (peer: SimplePeer.Instance | null) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);

  return (
    <CallContext.Provider value={{ stream, setStream, peer, setPeer }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
