import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import LocalPlayback from "./components/local-playback";
import RemotePlayback from "./components/remote-playback";
import MicButton from "./components/mic-button";
import VideoButton from "./components/video-button";
import DeclineButton from "./components/decline-button";
import LandingPage from "./landing";

type AppContextType = {
  peerConnection: RTCPeerConnection | undefined;
  setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
};

export const AppContext = createContext<AppContextType>({
  peerConnection: undefined,
  setRoomId: () => {},
});

function App() {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [peerConnection, setPeerConnection] = useState<
    RTCPeerConnection | undefined
  >(undefined);

  const getRoomId = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("room");
  };

  const [roomId, setRoomId] = useState(getRoomId);

  useEffect(() => {
    if (!roomId) {
      return;
    }
    const socket = io("https://video.amandev.in", {
      transports: ["polling"],
    });

    socket.on("connect", () => {
      console.log("connected: ", socket.id);
      socket.emit("join", roomId);

      const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      };

      const peerConnection = new RTCPeerConnection(configuration);

      console.log("created peer: ", peerConnection);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", event.candidate, roomId);
        }
      };

      setPeerConnection(peerConnection);
    });

    socket.on("disconnect", () => {});

    setSocket(socket);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("user-joined", async (userId) => {
      console.log("user joined: ", userId, peerConnection);
      const offer = await peerConnection?.createOffer();
      await peerConnection?.setLocalDescription(offer);
      socket.emit("offer", offer, userId);
    });

    socket.on("offer", async (offer, userId) => {
      console.log("offer: ", offer);
      await peerConnection?.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection?.createAnswer();
      await peerConnection?.setLocalDescription(answer);
      socket.emit("answer", answer, userId);
    });

    socket.on("answer", async (answer) => {
      console.log("answer: ", answer);
      await peerConnection?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async (candidate) => {
      console.log("ice: ", candidate);
      try {
        await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });
  }, [peerConnection]);

  console.log(roomId);
  return (
    <AppContext.Provider value={{ peerConnection, setRoomId }}>
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
