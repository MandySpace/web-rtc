import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Video, Clock, Star, ArrowRight } from "lucide-react";
import { useSearchParams } from "./hooks/useSearchParams";
import { useEffect, useState } from "react";

type CallData = { callQuality: number; callDuration: string };

export default function CallEndedPage() {
  const [callData, setCallData] = useState<CallData>({
    callQuality: 0,
    callDuration: "00:00:00",
  });
  const searchParams = useSearchParams();
  const roomId = searchParams.get("end");

  useEffect(() => {
    setTimeout(() => {
      const callData = roomId
        ? JSON.parse(window.localStorage.getItem(roomId) ?? "null")
        : null;

      const callQuality =
        callData?.score && !isNaN(callData.score)
          ? parseFloat(callData.score.toFixed(1))
          : 0;

      const callDuration = callData?.duration
        ? formatDuration(Math.ceil(callData.duration))
        : "00:00:00";

      setCallData({ callQuality, callDuration });
    }, 20);
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex flex-col">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Video className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">
              VideoConnect
            </span>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-center text-indigo-600">
              Call Ended
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Thank you for using VideoConnect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-8 sm:space-x-12">
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 text-indigo-600 mb-2" />
                <span className="text-sm text-gray-600">Duration</span>
                <span className="font-semibold">
                  {callData.callDuration ? callData.callDuration : null}
                </span>
              </div>
              {/* <div className="flex flex-col items-center">
                  <Users className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm text-gray-600">Participants</span>
                  <span className="font-semibold">{participants}</span>
                </div> */}

              <div className="flex flex-col items-center">
                <Star className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-sm text-gray-600">Call Quality</span>
                <span className="font-semibold">
                  {callData.callQuality ? `${callData.callQuality}/5` : null}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600">
                We hope you enjoyed your video call experience.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              onClick={() => {
                const roomId = Math.random().toString(36).substring(2, 7);

                const url = new URL(window.location.href);
                const params = url.searchParams;
                params.set("room", roomId);
                params.delete("end");

                const newUrl = url.toString();
                window.history.pushState({}, "", newUrl);
                window.dispatchEvent(new PopStateEvent("popstate"));
                window.localStorage.clear();
              }}
            >
              Start Another Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 text-center text-gray-600 border-t border-gray-200">
        <p className="text-xs sm:text-sm md:text-base">
          &copy; {new Date().getFullYear()} VideoConnect. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600); // 1 hour = 3600 seconds
  const minutes = Math.floor((seconds % 3600) / 60); // 1 minute = 60 seconds
  const secs = seconds % 60;

  // Format to ensure two digits for minutes and seconds
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(secs).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
