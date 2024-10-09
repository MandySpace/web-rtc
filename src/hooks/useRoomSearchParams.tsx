import { useEffect, useState } from "react";

export function useRoomSearchParams() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handleURLChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    // Listen for popstate event (back/forward navigation)
    window.addEventListener("popstate", handleURLChange);

    return () => {
      window.removeEventListener("popstate", handleURLChange);
    };
  }, []);

  return { roomId: searchParams.get("room") };
}
