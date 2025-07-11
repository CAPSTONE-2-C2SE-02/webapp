import React, { useEffect, useRef, useState } from "react";

interface VideoCallProps {
  onClose: () => void;
  remoteUserId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ onClose, remoteUserId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setCallActive(true);
      })
      .catch((err) => {
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