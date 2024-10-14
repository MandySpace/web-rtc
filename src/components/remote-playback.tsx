import { useContext, useEffect, useRef } from "react";
import { AppContext } from "@/App";

function RemotePlayback() {
  const { remoteStream } = useContext(AppContext);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return (
    <div className="absolute inset-0">
      <video
        ref={remoteVideoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
      />
    </div>
  );
}

export default RemotePlayback;
