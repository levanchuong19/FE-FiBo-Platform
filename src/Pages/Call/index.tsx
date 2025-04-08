/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import SimplePeer from "simple-peer";
import api from "../../Config/api";
import useRealtime from "../../hooks/useRealtime";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import "./index.scss";

interface Call {
  id: string;
  caller: { id: string };
  receiver: { id: string };
  startTime: string;
  endTime?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ENDED";
  isVideoCall: boolean;
}

interface SignalingMessage {
  callId: string;
  senderId: string;
  signalData: any;
}

function CallPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const friendId = query.get("friendId");
  const isVideoCall = query.get("isVideoCall") === "true";

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(isVideoCall);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Mock friend data (thay bằng API nếu cần)
  const friend = {
    id: friendId || "",
    fullName: friendId || "Friend Name",
    username: friendId || "friend_username",
    image:
      "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setCurrentUserId(decoded.sub);
      if (!call) {
        startCall(decoded.sub, friend.id, isVideoCall);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [friend.id, isVideoCall]);

  const setupMediaStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isCameraOn,
        audio: true,
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Không thể truy cập camera hoặc micro");
      return null;
    }
  };

  const startCall = async (
    callerId: string,
    receiverId: string,
    isVideoCall: boolean
  ) => {
    try {
      const response = await api.post(
        `call/start?callerId=${callerId}&receiverId=${receiverId}&isVideoCall=${isVideoCall}`
      );
      const newCall: Call = response.data;
      console.log("New call:", newCall.id);
      setCall(newCall);

      const mediaStream = await setupMediaStream();
      if (!mediaStream) return;

      const peerInstance = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        },
      });

      peerInstance.on("signal", async (data) => {
        const response = await api.post(
          `call/signal?callId=${newCall.id}&senderId=${callerId}&receiverId=${receiverId}`,
          data
        );
        console.log("Signal response:", response.data);
      });

      peerInstance.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peerInstance.on("error", (err) => {
        console.error("Peer error:", err);
        toast.error("Lỗi kết nối WebRTC");
      });

      setPeer(peerInstance);
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Không thể bắt đầu cuộc gọi");
      navigate(-1);
    }
  };

  useRealtime((data: any, topic: string) => {
    console.log(`Received WebSocket message from topic ${topic}:`, data);

    // Chỉ xử lý thông báo từ topic /call
    if (topic === "call") {
      const message: SignalingMessage = data;
      if (
        message &&
        message.callId === call?.id &&
        message.senderId !== currentUserId
      ) {
        if (peer) {
          peer.signal(message.signalData);
        }
      }

      const updatedCall: Call = data;
      if (
        updatedCall &&
        updatedCall.caller.id === currentUserId &&
        updatedCall.receiver.id === friend.id
      ) {
        setCall(updatedCall);
        if (
          updatedCall.status === "REJECTED" ||
          updatedCall.status === "ENDED"
        ) {
          toast.info("Cuộc gọi đã kết thúc");
          if (peer) peer.destroy();
          if (stream) stream.getTracks().forEach((track) => track.stop());
          navigate(-1);
        } else if (updatedCall.status === "ACCEPTED") {
          toast.success("Cuộc gọi đã được kết nối!");
        }
      }
    }
  });

  const endCall = async () => {
    if (!call) return;
    try {
      const response = await api.put(`call/${call.id}/end`);
      setCall(response.data);
      if (peer) peer.destroy();
      if (stream) stream.getTracks().forEach((track) => track.stop());
      navigate(-1);
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Không thể kết thúc cuộc gọi");
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !isMicOn));
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = async () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (isCameraOn) {
        videoTracks.forEach((track) => track.stop());
        setIsCameraOn(false);
      } else {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.addTrack(newStream.getVideoTracks()[0]);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (peer) {
          peer.addStream(stream);
        }
        setIsCameraOn(true);
      }
    }
  };

  return (
    <div className="call-page">
      <div className="call-header">
        <img src={friend.image} alt="Friend Avatar" className="friend-avatar" />
        <div className="call-info">
          <h2>{friend.fullName || friend.username}</h2>
          <p>
            {call?.status === "PENDING"
              ? "Đang gọi..."
              : call?.status === "ACCEPTED"
              ? "Đã kết nối"
              : "Cuộc gọi đã kết thúc"}
          </p>
        </div>
      </div>

      <div className="call-content">
        <div className="video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          {isCameraOn && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
          )}
          {!isCameraOn && (
            <div className="no-video">
              <img
                src={friend.image}
                alt="Friend Avatar"
                className="friend-avatar-large"
              />
            </div>
          )}
        </div>
      </div>

      <div className="call-controls">
        <button className="control-btn" onClick={toggleMic}>
          {isMicOn ? <MicIcon /> : <MicOffIcon />}
        </button>
        <button className="control-btn" onClick={toggleCamera}>
          {isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
        </button>
        <button className="control-btn end-call" onClick={endCall}>
          <CallEndIcon />
        </button>
      </div>
    </div>
  );
}

export default CallPage;
