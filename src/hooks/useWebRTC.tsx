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

    socket.on("connect", () => {
      console.log("connected:", socket.id);
      socket.emit("join", roomId);

      const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      };

      const peerConnection = new RTCPeerConnection(configuration);

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
        const offer = await peerConnection.createOffer();
        await peerConnection?.setLocalDescription(offer);
        if (offer) {
          socket.emit("offer", offer, userId);
        }
      });

      socket.on("offer", async (offer, userId) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        isRemoteDescriptionSet.current = true;

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        if (answer) {
          socket.emit("answer", answer, userId);
        }
        addBufferedCandidates();
      });

      socket.on("answer", async (answer) => {
        await peerConnection.setRemoteDescription(
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
            .catch((e) => console.error("Error adding ice candidate", e));
        } else {
          iceCandidatesBuffer.current.push(iceCandidate);
        }
      });

      setPeerConnection(peerConnection);
    });

    return () => {
      socket.disconnect();
      peerConnection?.close();
      setPeerConnection(null);
    };
  }, [roomId]);

  return {
    peerConnection,
    remoteStream,
    roomId,
  };
};
