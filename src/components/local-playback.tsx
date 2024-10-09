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

function LocalPlayback() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [deviceError, setDeviceError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const { peerConnection } = useContext(AppContext);

  const getLocalPlayback = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStream.getTracks().forEach((track) => {
        console.log("adding track: ", localStream);
        peerConnection?.addTrack(track, localStream);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;

        localVideoRef.current.onloadedmetadata = () => {
          if (!localVideoRef.current) {
            return;
          }

          const videoWidth = localVideoRef.current.videoWidth;
          const videoHeight = localVideoRef.current.videoHeight;
          setAspectRatio(videoWidth / videoHeight);
        };
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.name === "NotFoundError") {
        setDeviceError(true);
      }
    }
  }, [peerConnection]);

  useEffect(() => {
    if (peerConnection) {
      getLocalPlayback();
    }
  }, [getLocalPlayback, peerConnection]);

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
      {deviceError ? (
        <div>
          <h2>Error occured</h2>
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
