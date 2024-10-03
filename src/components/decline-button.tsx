import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

function DeclineButton() {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="rounded-full bg-red-500 transition-all duration-200 w-12 h-12 hover:bg-red-600 hover:bg-opacity-100"
    >
      <Phone className="h-6 w-6 text-white" />
    </Button>
  );
}

export default DeclineButton;
