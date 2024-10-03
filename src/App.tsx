import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import LocalPlayback from "./components/local-playback";
import RemotePlayback from "./components/remote-playback";
import MicButton from "./components/mic-button";
import VideoButton from "./components/video-button";
import DeclineButton from "./components/decline-button";
import LandingPage from "./landing";

type AppContextType = {
  socket: Socket | undefined;
  roomId: string | undefined;
};

export const AppContext = createContext<AppContextType>({
  socket: undefined,
  roomId: undefined,
});

function App() {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get("room");
    console.log(roomId);

    createSocketConnection();
  }, [window.location]);

  const createSocketConnection = () => {
    const socket = io("https://video.amandev.in", { transports: ["polling"] });

    socket.on("connect", () => {});

    socket.on("disconnect", () => {});

    setSocket(socket);
  };

  return (
    <AppContext.Provider value={{ socket, roomId }}>
      {roomId ? (
        <div className="relative h-screen w-screen bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
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
