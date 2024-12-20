import { AppContext } from "@/App";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";

function LocalPlayback() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const { localStreamData, getLocalPlayback } = useContext(AppContext);

  useEffect(() => {
    if (!localVideoRef.current) {
      return;
    }
    localVideoRef.current.srcObject = localStreamData.localStream;

    localVideoRef.current.onloadedmetadata = () => {
      if (!localVideoRef.current) {
        return;
      }

      const videoWidth = localVideoRef.current.videoWidth;
      const videoHeight = localVideoRef.current.videoHeight;
      setAspectRatio(videoWidth / videoHeight);
    };
  }, [localStreamData]);

  useLayoutEffect(() => {
    setPosition({
      x: window.innerWidth - (dragRef.current?.offsetWidth ?? 0),
      y: window.innerHeight - (dragRef.current?.offsetHeight ?? 0) - 80,
    });
  }, []);

  const onStart = useCallback(
    (clientX: number, clientY: number) => {
      if (dragRef.current) {
        const startX = clientX - position.x;
        const startY = clientY - position.y;

        const onMove = (clientX: number, clientY: number) => {
          // Calculate new positions
          let newX = clientX - startX;
          let newY = clientY - startY;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Get element's width and height
          const elementWidth = dragRef.current?.offsetWidth ?? 0;
          const elementHeight = dragRef.current?.offsetHeight ?? 0;

          // Restrict the element's position within the boundaries
          if (newX < 0) newX = 0; // Prevent dragging off the left side
          if (newY < 0) newY = 0; // Prevent dragging off the top
          if (newX + elementWidth > windowWidth)
            newX = windowWidth - elementWidth; // Prevent dragging off the right side
          if (newY + elementHeight > windowHeight)
            newY = windowHeight - elementHeight; // Prevent dragging off the bottom

          setPosition({ x: newX, y: newY });
        };

        const onEnd = () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("touchend", onTouchEnd);
          setIsDragging(false);
        };

        const onMouseMove = (e: MouseEvent) => {
          onMove(e.clientX, e.clientY);
        };
        const onTouchMove = (e: TouchEvent) => {
          onMove(e.touches[0].clientX, e.touches[0].clientY);
        };

        const onMouseUp = onEnd;
        const onTouchEnd = onEnd;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", onTouchEnd);
        setIsDragging(true);
      }
    },
    [position]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onStart(e.clientX, e.clientY);
    },
    [onStart]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    },
    [onStart]
  );

  return (
    <div
      ref={dragRef}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none", // Prevents default touch actions like scrolling
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="bg-gradient-to-br from-indigo-500 to-purple-600 bg-opacity-30 rounded-lg p-1 shadow-lg"
    >
      {localStreamData.status === "device-not-found" ? (
        <div className="p-4 flex flex-col justify-center items-center gap-2 aspect-video w-56 sm:w-60 md:w-64 lg:w-80">
          <h2 className="text-white text-center">
            Camera not found, please plug in a camera and try again.
          </h2>
          <Button
            className="rounded-full"
            variant={"outline"}
            onClick={getLocalPlayback}
          >
            Try again
          </Button>
        </div>
      ) : (
        <video
          ref={localVideoRef}
          className={cn(
            "object-cover rounded-md ",
            aspectRatio > 1
              ? "aspect-video w-56 sm:w-60 md:w-64 lg:w-80"
              : "aspect-[9/16] h-56 sm:h-52 md:h-72 lg:h-80"
          )}
          autoPlay
          muted
          playsInline
        />
      )}
    </div>
  );
}

export default LocalPlayback;
