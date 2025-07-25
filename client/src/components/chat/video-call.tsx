import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/socket-context";

interface VideoCallProps {
  onClose: () => void;
  remoteUserId: string;
  isCaller?: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({ onClose, remoteUserId, isCaller }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  // Placeholder for peer connection
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Get user media
    navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // TODO: Add stream to peer connection
      })
      .catch(() => {
        setError("Could not access camera/microphone.");
      });
    return () => {
      // Cleanup
      localStream?.getTracks().forEach((track) => track.stop());
      peerConnectionRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoEnabled]);

  // Placeholder for remote stream setup
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // WebRTC signaling logic
  useEffect(() => {
    if (!socket || !remoteUserId) return;
    let isMounted = true;
    let pc: RTCPeerConnection;

    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    };

    const startPeerConnection = async () => {
      pc = new RTCPeerConnection(config);
      peerConnectionRef.current = pc;

      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.ontrack = (event) => {
        if (!isMounted) return;
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            candidate: event.candidate,
            to: remoteUserId,
            from: socket.id,
          });
        }
      };

      if (isCaller) {
        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", {
          offer,
          to: remoteUserId,
          from: socket.id,
        });
      }
    };

    // Listen for signaling events
    socket.on("webrtc-offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      if (!isCaller) {
        pc = new RTCPeerConnection(config);
        peerConnectionRef.current = pc;
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
          });
        }
        pc.ontrack = (event) => {
          if (!isMounted) return;
          setRemoteStream(event.streams[0]);
        };
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-ice-candidate", {
              candidate: event.candidate,
              to: from,
              from: socket.id,
            });
          }
        };
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", {
          answer,
          to: from,
          from: socket.id,
        });
      }
    });

    socket.on("webrtc-answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (isCaller && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("webrtc-ice-candidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          // ignore
        }
      }
    });

    startPeerConnection();

    return () => {
      isMounted = false;
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      peerConnectionRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, remoteUserId, localStream, isCaller]);

  const handleToggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !videoEnabled;
    });
    setVideoEnabled((v) => !v);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex gap-4 w-full justify-center mb-4">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-40 h-40 bg-black rounded-lg border" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-40 h-40 bg-black rounded-lg border" />
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex gap-4 mt-2">
        <button
          className={`px-4 py-2 rounded ${videoEnabled ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
          onClick={handleToggleVideo}
        >
          {videoEnabled ? "Turn Off Video" : "Turn On Video"}
        </button>
        <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={onClose}>
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;