import { useContext, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { AppContext } from "@/App";

function RemotePlayback() {
  const { remoteStream } = useContext(AppContext);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return (
    <>
      <div className="absolute inset-0">
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
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
