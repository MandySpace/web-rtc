import { createContext } from "react";
import LocalPlayback from "./components/local-playback";
import RemotePlayback from "./components/remote-playback";
import MicButton from "./components/mic-button";
import VideoButton from "./components/video-button";
import DeclineButton from "./components/decline-button";
import LandingPage from "./landing";
import { useWebRTC } from "./hooks/useWebRTC";

type AppContextType = {
  peerConnection: RTCPeerConnection | null;
  remoteStream: MediaStream | null;
};

export const AppContext = createContext<AppContextType>({
  peerConnection: null,
  remoteStream: null,
});

function App() {
  const { peerConnection, roomId, remoteStream } = useWebRTC();

  return (
    <AppContext.Provider value={{ peerConnection, remoteStream }}>
      {roomId ? (
        // <div className="relative h-screen w-screen bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        <div className="relative h-screen w-screen bg-black overflow-hidden">
          <RemotePlayback />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center space-x-4 md:space-x-6">
            <MicButton />
            <DeclineButton />
            <VideoButton />
          </div>
          <LocalPlayback />
        </div>
      ) : (
        <LandingPage />
      )}
    </AppContext.Provider>
  );
}

export default App;
