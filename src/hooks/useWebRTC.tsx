import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useRoomSearchParams } from "./useRoomSearchParams";

export const useWebRTC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
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

    let peerConnection: RTCPeerConnection | null = null;

    socket.on("connect", () => {
      console.log("connected:", socket.id);
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers here
        ],
      };
      peerConnection = new RTCPeerConnection(configuration);

      peerConnection.onicecandidate = (event) => {
        console.log("emitting ice candidate:", event);
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate, roomId);
        }
      };

      peerConnection.ontrack = (event) => {
        console.log("remote stream received: ", event);
        setRemoteStream(event.streams[0]);
      };

      setPeerConnection(peerConnection);
      setSocket(socket);
    });

    return () => {
      socket.disconnect();
      peerConnection?.close();
      setPeerConnection(null);
      setSocket(null);
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket || !peerConnection) {
      return;
    }
    socket.emit("join", roomId);

    socket.on("user-joined", async (userId) => {
      console.log("user joined:", userId);
      const offer = await peerConnection.createOffer();
      await peerConnection?.setLocalDescription(offer);
      if (offer) {
        socket.emit("offer", offer, userId);
      }
    });

    socket.on("offer", async (offer, userId) => {
      console.log("offer received:", offer);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      isRemoteDescriptionSet.current = true;

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      if (answer) {
        console.log("emitting answer:", answer);
        socket.emit("answer", answer, userId);
      }
      addBufferedCandidates();
    });

    socket.on("answer", async (answer) => {
      console.log("answer received:", answer);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      isRemoteDescriptionSet.current = true;
      addBufferedCandidates();
    });

    socket.on("ice-candidate", async (candidate) => {
      console.log("ice candidate received:", candidate);
      const iceCandidate = new RTCIceCandidate(candidate);

      if (isRemoteDescriptionSet.current && peerConnection) {
        peerConnection
          .addIceCandidate(iceCandidate)
          .catch((e) => console.error("Error adding ice candidate", e));
      } else {
        iceCandidatesBuffer.current.push(iceCandidate);
      }
    });
  }, [socket, peerConnection]);

  const addTrack = useCallback(
    (track: MediaStreamTrack, stream: MediaStream) => {
      peerConnection?.addTrack(track, stream);
    },
    [peerConnection]
  );

  return {
    peerConnection,
    remoteStream,
    roomId,
    addTrack,
    setLocalStream,
  };
};
