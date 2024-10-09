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
  const localStreamRef = useRef<MediaStream | null>(null);

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
      console.log(localStreamRef.current, peerConnection);
      if (localStreamRef.current && peerConnection) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (peerConnection && localStreamRef.current) {
            peerConnection.addTrack(track, localStreamRef.current);
          }
        });
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
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
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
        setRemoteStream(null);
      });

      socket.on("offer", async (offer, userId) => {
        console.log("received offer");
        if (!localStreamRef.current) {
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
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
            .catch((e) => console.error("Error adding ice candidate", e));
        } else {
          iceCandidatesBuffer.current.push(iceCandidate);
        }
      });

      setPeerConnection(peerConnection);
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peerConnection?.close();
      socket.disconnect();
      setPeerConnection(null);
    };
  }, [roomId]);

  return {
    peerConnection,
    remoteStream,
    roomId,
    localStreamRef,
  };
};
