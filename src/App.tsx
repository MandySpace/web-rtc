import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Monitor, Phone, Video } from "lucide-react";

function App() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="m-auto w-full max-w-4xl">
        <Card className="bg-black bg-opacity-50 backdrop-blur-md overflow-hidden">
          <div className="relative aspect-video">
            <video
              className="w-full h-full object-cover"
              src="/placeholder.svg"
            />
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-lg p-2">
              <video
                className="w-40 h-24 object-cover rounded-lg"
                src="/placeholder.svg"
              />
            </div>
          </div>
          <div className="p-6 flex justify-center space-x-4">
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200"
            >
              <Mic className="h-6 w-6 text-white" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200"
            >
              <Video className="h-6 w-6 text-white" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200"
            >
              <Phone className="h-6 w-6 text-white" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200"
            >
              <Monitor className="h-6 w-6 text-white" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
