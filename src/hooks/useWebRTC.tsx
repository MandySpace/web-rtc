import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useSearchParams } from "./useSearchParams";

export type LocalStreamData =
  | {
      status: "idle" | "device-not-found" | "error";
      localStream: null;
    }
  | {
      status: "active";
      localStream: MediaStream;
    };

interface CallStats {
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
  bitrate: number;
  frameRate: number;
}

export const useWebRTC = () => {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStreamData, setLocalStreamData] = useState<LocalStreamData>({
    status: "idle",
    localStream: null,
  });
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const iceCandidatesBuffer = useRef<RTCIceCandidate[]>([]);
  const isRemoteDescriptionSet = useRef<boolean>(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  //stats state
  const statsBuffer = useRef<CallStats[]>([]);
  const callStartTime = useRef<number | null>(null);

  const getLocalPlayback = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = localStream;
      setLocalStreamData({
        status: "active",
        localStream,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "NotFoundError") {
        setLocalStreamData({
          status: "device-not-found",
          localStream: null,
        });
      } else {
        setLocalStreamData({
          status: "error",
          localStream: null,
        });
      }
    }
  }, []);

  const addBufferedCandidates = useCallback(() => {
    if (peerConnection && isRemoteDescriptionSet.current) {
      iceCandidatesBuffer.current.forEach((candidate) => {
        peerConnection
          ?.addIceCandidate(candidate)
          .catch((e) =>
            console.error("Error adding buffered ice candidate", e)
          );
      });
      iceCandidatesBuffer.current = [];
    }
  }, [peerConnection]);

  const addLocalTracks = useCallback(
    (peerConnection: RTCPeerConnection | null) => {
      if (localStreamRef.current && peerConnection) {
        console.log("sender:", peerConnection.getSenders());
        try {
          localStreamRef.current.getTracks().forEach((track) => {
            if (peerConnection && localStreamRef.current) {
              peerConnection.addTrack(track, localStreamRef.current);
            }
          });
        } catch (error) {
          console.log("Error adding tracks: ", error);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const socket = io("https://video.amandev.in", {
      transports: ["polling"],
    });

    let peerConnection: RTCPeerConnection | null = null;

    socket.on("connect", () => {
      console.log("connected:", socket.id);
      socket.emit("join", roomId);

      const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      };

      peerConnection = new RTCPeerConnection(configuration);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate, roomId);
        }
      };

      peerConnection.ontrack = (event) => {
        console.log("remote stream received: ", event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      socket.on("user-joined", async (userId) => {
        console.log("user-joined: ", userId);
        if (!localStreamRef.current) {
          await getLocalPlayback();
        }
        addLocalTracks(peerConnection);
        const offer = await peerConnection?.createOffer();
        await peerConnection?.setLocalDescription(offer);
        if (offer) {
          socket.emit("offer", offer, userId);
        }
      });

      socket.on("user-left", async (userId) => {
        console.log("user-left: ", userId);

        // const url = new URL(window.location.href);
        // const params = url.searchParams;
        // params.delete("room");
        // params.set("end", roomId);

        // const newUrl = url.toString();
        // window.history.pushState({}, "", newUrl);
        // window.dispatchEvent(new PopStateEvent("popstate"));

        // setRemoteStream(null);
      });

      socket.on("offer", async (offer, userId) => {
        console.log("received offer");
        if (!localStreamRef.current) {
          await getLocalPlayback();
        }
        addLocalTracks(peerConnection);
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        isRemoteDescriptionSet.current = true;

        const answer = await peerConnection?.createAnswer();
        await peerConnection?.setLocalDescription(answer);
        if (answer) {
          socket.emit("answer", answer, userId);
        }
        addBufferedCandidates();
      });

      socket.on("answer", async (answer) => {
        console.log("received answer");
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        isRemoteDescriptionSet.current = true;
        addBufferedCandidates();
      });

      socket.on("ice-candidate", async (candidate) => {
        const iceCandidate = new RTCIceCandidate(candidate);

        if (isRemoteDescriptionSet.current && peerConnection) {
          peerConnection
            .addIceCandidate(iceCandidate)
            .catch((e) =>
              console.error(
                "Error adding ice candidate",
                e,
                " isRemoteDescriptionSet: ",
                isRemoteDescriptionSet.current
              )
            );
        } else {
          iceCandidatesBuffer.current.push(iceCandidate);
        }
      });

      setPeerConnection(peerConnection);
    });

    getLocalPlayback();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      console.log("peerConnection: ", peerConnection);
      peerConnection?.close();
      socket.disconnect();
      setPeerConnection(null);
      isRemoteDescriptionSet.current = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!peerConnection) {
      return;
    }

    callStartTime.current = Date.now();

    const statsInterval = setInterval(async () => {
      const stats = await peerConnection.getStats();
      let packetsLost = 0;
      let jitter = 0;
      let roundTripTime = 0;
      let bitrate = 0;
      let frameRate = 0;

      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.kind === "video") {
          packetsLost += report.packetsLost || 0;
          jitter = report.jitter || 0;
          roundTripTime += report.roundTripTime || 0;
          bitrate = ((report.bytesReceived || 0) * 8) / 1000; // Convert to kbps
          frameRate = report.framesPerSecond || 0;
        }
      });

      const currentStats = {
        packetsLost,
        jitter,
        roundTripTime,
        bitrate,
        frameRate,
      };
      statsBuffer.current.push(currentStats);
    }, 1000);

    return () => {
      clearInterval(statsInterval);
      if (callStartTime.current) {
        const score = calculateCallRating();
        const duration = (Date.now() - callStartTime.current) / 1000; // duration in seconds

        if (roomId) {
          const payload = JSON.stringify({
            score,
            duration,
          });
          window.localStorage.setItem(roomId, payload);
          console.log(window.localStorage.getItem(roomId));
        }
      }
    };
  }, [peerConnection]);

  const aggregateStats = (stats: CallStats[]): CallStats => {
    const sum = stats.reduce((acc, curr) => ({
      packetsLost: acc.packetsLost + curr.packetsLost,
      jitter: acc.jitter + curr.jitter,
      roundTripTime: acc.roundTripTime + curr.roundTripTime,
      bitrate: acc.bitrate + curr.bitrate,
      frameRate: acc.frameRate + curr.frameRate,
    }));

    const count = stats.length;
    return {
      packetsLost: sum.packetsLost,
      jitter: sum.jitter / count,
      roundTripTime: sum.roundTripTime / count,
      bitrate: sum.bitrate / count,
      frameRate: sum.frameRate / count,
    };
  };

  const calculateCallRating = (): number => {
    const stats = aggregateStats(statsBuffer.current);
    let score = 5.0;

    // Adjust score based on various metrics
    if (stats.packetsLost > 5)
      score -= Math.min(1, (stats.packetsLost - 5) / 10);
    if (stats.jitter > 30) score -= Math.min(1, (stats.jitter - 30) / 50);
    if (stats.roundTripTime > 200)
      score -= Math.min(1, (stats.roundTripTime - 200) / 300);
    if (stats.bitrate < 1000)
      score -= Math.min(1, (1000 - stats.bitrate) / 500);
    if (stats.frameRate < 30) score -= Math.min(1, (30 - stats.frameRate) / 15);

    return Math.max(1, Math.min(score, 5));
  };

  return {
    peerConnection,
    remoteStream,
    localStreamRef,
    localStreamData,
    getLocalPlayback,
  };
};
