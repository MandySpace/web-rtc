import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

function DeclineButton({ roomId }: { roomId: string | null }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="rounded-full bg-red-500 transition-all duration-200 w-12 h-12 hover:bg-red-600 hover:bg-opacity-100"
      onClick={() => {
        if (!roomId) {
          return;
        }

        const url = new URL(window.location.href);
        const params = url.searchParams;
        params.delete("room");
        params.set("end", roomId);

        const newUrl = url.toString();
        window.history.pushState({}, "", newUrl);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
    >
      <Phone className="h-6 w-6 text-white" />
    </Button>
  );
}

export default DeclineButton;
