import { useCallback, useRef, useState } from "react";

function LocalPlayback() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

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

        const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) =>
          onMove(e.touches[0].clientX, e.touches[0].clientY);

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
    (e: React.MouseEvent) => onStart(e.clientX, e.clientY),
    [onStart]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault(); // Prevent scrolling on touch devices
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
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="bg-black bg-opacity-50 rounded-lg p-1 shadow-lg"
    >
      <video
        className="w-40 h-24 object-cover rounded-lg"
        src="/placeholder.svg"
      />
    </div>
  );
}

export default LocalPlayback;
