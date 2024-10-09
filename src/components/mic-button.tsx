import { AppContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";

function MicButton() {
  const [isMuted, setIsMuted] = useState(false);
  const { peerConnection } = useContext(AppContext);

  const muteAudio = useCallback(() => {
    peerConnection?.getSenders().forEach((sender) => {
      if (sender.track && sender.track.kind === "audio") {
        sender.track.enabled = !isMuted;
      }
    });
  }, [isMuted, peerConnection]);

  useEffect(() => {
    muteAudio();
  }, [muteAudio]);

  return (
    <Button
      size="icon"
      variant="ghost"
      className="rounded-full bg-white bg-opacity-10 transition-all duration-200 w-12 h-12"
      onClick={() => setIsMuted((prevState) => !prevState)}
    >
      {isMuted ? (
        <MicOff className="h-6 w-6 text-white" />
      ) : (
        <Mic className="h-6 w-6 text-white" />
      )}
    </Button>
  );
}

export default MicButton;
