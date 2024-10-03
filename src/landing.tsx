import { Button } from "@/components/ui/button";
import { ArrowRight, Video, Users, Sparkles, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex flex-col">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Video className="h-6 w-6 text-indigo-600" />
            <span className="text-xl sm:text-2xl font-bold text-indigo-600">
              VideoConnect
            </span>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Crystal Clear 1-on-1 Video Calls
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect face-to-face with anyone, anywhere. Experience high-quality
            video calls with just a click.
          </p>
          <Button
            size="lg"
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Start a New Call
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="mt-16 hidden md:grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-indigo-100 rounded-full p-4 mb-4">
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Easy to Use</h2>
            <p className="text-gray-600">
              Start a call with just one click. No downloads or complex setups
              required.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-purple-100 rounded-full p-4 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Crystal Clear Quality
            </h2>
            <p className="text-gray-600">
              Enjoy HD video and audio for an immersive conversation experience.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-pink-100 rounded-full p-4 mb-4">
              <Shield className="h-8 w-8 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Secure and Private</h2>
            <p className="text-gray-600">
              Your calls are protected with end-to-end encryption for total
              privacy.
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 text-center text-gray-600 border-t border-gray-200">
        <p className="text-sm sm:text-base">
          &copy; 2024 VideoConnect. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
