import { createContext } from "react";
import LocalPlayback from "./components/local-playback";
import RemotePlayback from "./components/remote-playback";
import MicButton from "./components/mic-button";
import VideoButton from "./components/video-button";
import DeclineButton from "./components/decline-button";
import LandingPage from "./landing";
import { LocalStreamData, useWebRTC } from "./hooks/useWebRTC";
import { useSearchParams } from "./hooks/useSearchParams";
import CallEndedPage from "./call-ended";

type AppContextType = {
  peerConnection: RTCPeerConnection | null;
  remoteStream: MediaStream | null;
  localStreamData: LocalStreamData;
  getLocalPlayback: () => Promise<void>;
};

export const AppContext = createContext<AppContextType>({
  peerConnection: null,
  remoteStream: null,
  localStreamData: { status: "idle", localStream: null },
  getLocalPlayback: () => new Promise((res) => res()),
});

function App() {
  const { peerConnection, remoteStream, localStreamData, getLocalPlayback } =
    useWebRTC();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const isCallEnded = searchParams.get("end");

  return (
    <AppContext.Provider
      value={{
        peerConnection,
        remoteStream,
        localStreamData,
        getLocalPlayback,
      }}
    >
      {roomId ? (
        <div className="relative h-screen w-screen bg-black overflow-hidden">
          <RemotePlayback />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center space-x-4 md:space-x-6">
            <MicButton />
            <DeclineButton roomId={roomId} />
            <VideoButton />
          </div>
          <LocalPlayback />
        </div>
      ) : isCallEnded ? (
        <CallEndedPage />
      ) : (
        <LandingPage />
      )}
    </AppContext.Provider>
  );
}

export default App;
