import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

function VideoButton() {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 w-12 h-12"
    >
      <Video className="h-6 w-6 text-white" />
    </Button>
  );
}

export default VideoButton;
