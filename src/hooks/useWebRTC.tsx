import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useRoomSearchParams } from "./useRoomSearchParams";

export const useWebRTC = () => {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { roomId } = useRoomSearchParams();
  const iceCandidatesBuffer = useRef<RTCIceCandidate[]>([]);
  const isRemoteDescriptionSet = useRef<boolean>(false);

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

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const socket = io("https://video.amandev.in", {
      transports: ["polling"],
    });

    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add TURN servers here
      ],
    };

    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    socket.on("connect", () => {
      console.log("connected:", socket.id);
      socket.emit("join", roomId);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("emitting ice candidate:", event.candidate);
          socket?.emit("ice-candidate", event.candidate, roomId);
        }
      };

      pc.ontrack = (event) => {
        console.log("remote stream received: ", event);
        setRemoteStream(event.streams[0]);
      };
    });

    socket.on("user-joined", async (userId) => {
      console.log("user joined:", userId);
      const offer = await pc?.createOffer();
      await pc?.setLocalDescription(offer);
      if (offer) {
        socket.emit("offer", offer, userId);
      }
    });

    socket.on("offer", async (offer, userId) => {
      console.log("offer received:", offer);
      await pc?.setRemoteDescription(new RTCSessionDescription(offer));
      isRemoteDescriptionSet.current = true;

      const answer = await pc?.createAnswer();
      await pc?.setLocalDescription(answer);
      if (answer) {
        console.log("emitting answer:", answer);
        socket.emit("answer", answer, userId);
      }
      addBufferedCandidates();
    });

    socket.on("answer", async (answer) => {
      console.log("answer received:", answer);
      await pc?.setRemoteDescription(new RTCSessionDescription(answer));
      isRemoteDescriptionSet.current = true;
      addBufferedCandidates();
    });

    socket.on("ice-candidate", async (candidate) => {
      console.log("ice candidate received:", candidate);
      const iceCandidate = new RTCIceCandidate(candidate);

      if (isRemoteDescriptionSet.current && pc) {
        pc.addIceCandidate(iceCandidate).catch((e) =>
          console.error("Error adding ice candidate", e)
        );
      } else {
        iceCandidatesBuffer.current.push(iceCandidate);
      }
    });

    return () => {
      socket.disconnect();
      pc?.close();
      setPeerConnection(null);
    };
  }, [roomId]);

  const addTrack = useCallback(
    (track: MediaStreamTrack, stream: MediaStream) => {
      peerConnection?.addTrack(track, stream);
    },
    [peerConnection]
  );

  console.log(peerConnection?.signalingState);

  return {
    peerConnection,
    remoteStream,
    addTrack,
    roomId,
  };
};
