import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

function LocalPlayback() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [deviceError, setDeviceError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  useEffect(() => {
    getLocalPlayback();
  }, []);

  const getLocalPlayback = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
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
      if (error instanceof Error && error.name === "NotFoundError") {
        setDeviceError(true);
      }
    }
  };

  const onStart = useCallback(
    (clientX: number, clientY: number) => {
      if (dragRef.current) {
        const startX = clientX - position.x;
        const startY = clientY - position.y;

        const onMove = (clientX: number, clientY: number) => {
          setPosition({ x: clientX - startX, y: clientY - startY });
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
      className="bg-black bg-opacity-50 rounded-lg p-1 shadow-lg"
    >
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
      />
    </div>
  );
}

export default LocalPlayback;
