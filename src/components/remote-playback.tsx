import { useContext, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { AppContext } from "@/App";

function RemotePlayback() {
  const { peerConnection } = useContext(AppContext);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.ontrack = (event) => {
        console.log("remote track: ", event);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
    }
  }, [peerConnection]);
  return (
    <>
      <div className="absolute inset-0">
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-contain"
          autoPlay
        />
      </div>
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-full p-2">
        <Avatar className="h-10 w-10 ring-2 ring-white">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Caller" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}

export default RemotePlayback;
