import { useEffect } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Mic, Monitor, Phone, Video } from "lucide-react";
import LocalPlayback from "./components/local-playback";
import RemotePlayback from "./components/remote-playback";

function App() {
  useEffect(() => {
    const socket = io("https://video.amandev.in", { transports: ["polling"] });
    socket.on("connect", () => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    });

    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="elative h-screen w-screen bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
      <RemotePlayback />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center space-x-4 md:space-x-6">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 w-12 h-12"
        >
          <Mic className="h-6 w-6 text-white" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 w-12 h-12"
        >
          <Video className="h-6 w-6 text-white" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 w-12 h-12"
        >
          <Phone className="h-6 w-6 text-white" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 w-12 h-12"
        >
          <Monitor className="h-6 w-6 text-white" />
        </Button>
      </div>
      <LocalPlayback />
    </div>
  );
}

export default App;
