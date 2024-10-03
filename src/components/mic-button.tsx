import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

function MicButton() {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="rounded-full bg-white bg-opacity-10 transition-all duration-200 w-12 h-12"
    >
      <Mic className="h-6 w-6 text-white" />
    </Button>
  );
}

export default MicButton;
