/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import SimplePeer from "simple-peer";
import api from "../../Config/api";
import useRealtime from "../../hooks/useRealtime";
import CallIcon from "@mui/icons-material/Call";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { useCall } from "../../hooks/callContext";

interface Call {
  id: string;
  caller: { id: string };
  receiver: { id: string };
  startTime: string;
  endTime?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ENDED";
  videoCall: boolean; // Sử dụng videoCall thay vì isVideoCall để khớp với backend
}

interface SignalingMessage {
  callId: string;
  senderId: string;
  signalData: any;
}

function IncomingCall() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { setStream, setPeer, stream, peer } = useCall();
  const [, setIsVideoCall] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setCurrentUserId(decoded.sub);
      console.log("Current user ID:", decoded.sub);
    } else {
      console.error("Token not found in localStorage");
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
      setStream(null);
      setPeer(null);
    };
  }, [stream, peer, setStream, setPeer]);

  const fetchCall = async (callId: string) => {
    try {
      const response = await api.get(`call/${callId}`);
      const fetchedCall: Call = response.data;
      if (
        fetchedCall &&
        (fetchedCall.caller.id == currentUserId ||
          fetchedCall.receiver.id == currentUserId)
      ) {
        setCall(fetchedCall);
        setIsVideoCall(fetchedCall.videoCall); // Cập nhật isVideoCall từ API
        console.log("Fetched call:", fetchedCall);
      }
    } catch (error) {
      console.error("Error fetching call:", error);
      toast.error("Không thể lấy thông tin cuộc gọi");
      navigate("/message");
    }
  };

  useRealtime((data: any, topic: string) => {
    console.log(`Received WebSocket message from topic ${topic}:`, data);

    if (topic === "call") {
      // Kiểm tra nếu là thông điệp trạng thái cuộc gọi (Call object)
      if (data.status) {
        const incomingCall: Call = data;
        console.log("Processing incoming call:", incomingCall);

        if (
          incomingCall &&
          incomingCall.status === "PENDING" &&
          incomingCall.receiver.id == currentUserId
        ) {
          console.log("Incoming call matched:", incomingCall);
          setCall({ ...incomingCall });
          setIsVideoCall(incomingCall.videoCall); // Cập nhật isVideoCall vào CallContext
        } else if (
          incomingCall &&
          incomingCall.status === "ACCEPTED" &&
          (incomingCall.caller.id == currentUserId ||
            incomingCall.receiver.id == currentUserId)
        ) {
          console.log("Call accepted:", incomingCall);
          setIsVideoCall(incomingCall.videoCall); // Cập nhật isVideoCall khi ACCEPTED
          const friendId =
            currentUserId == incomingCall.caller.id
              ? incomingCall.receiver.id
              : incomingCall.caller.id;
          const callId = incomingCall.id;
          const callerId = incomingCall.caller.id;

          navigate(
            `/call?friendId=${friendId}&callId=${callId}&callerId=${callerId}`
          );
          setCall(null);
        } else if (
          incomingCall &&
          incomingCall.status === "ENDED" &&
          (incomingCall.caller.id == currentUserId ||
            incomingCall.receiver.id == currentUserId)
        ) {
          console.log("Call ended:", incomingCall);
          setCall(null);
          if (peer) peer.destroy();
          if (stream) stream.getTracks().forEach((track) => track.stop());
          setStream(null);
          setPeer(null);
          toast.info("Cuộc gọi đã kết thúc");
          navigate("/message");
        } else {
          console.log(
            "Incoming call did not match:",
            incomingCall,
            "currentUserId:",
            currentUserId
          );
        }
      }

      // Kiểm tra nếu là thông điệp tín hiệu WebRTC (SignalingMessage)
      if (data.signalData) {
        const message: SignalingMessage = data;
        if (
          message &&
          (message.callId == call?.id || message.callId == data?.id) &&
          message.senderId != currentUserId
        ) {
          console.log("Received signal data:", message.signalData);
          if (peer) {
            peer.signal(message.signalData);
          } else if (!call) {
            // Nếu chưa có call, lấy thông tin cuộc gọi từ API
            fetchCall(message.callId);
          }
        }
      }
    }
  });

  const acceptCall = async () => {
    if (!call) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    try {
      const response = await api.put(`call/${call.id}/accept`);
      const updatedCall: Call = response.data;
      setCall(updatedCall);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: call.videoCall, // Sử dụng videoCall từ call
        audio: true,
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      const peerInstance = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        },
      });

      peerInstance.on("signal", (data) => {
        api
          .post(
            `call/signal?callId=${call.id}&senderId=${currentUserId}&receiverId=${call.caller.id}`,
            data
          )
          .catch((error) => {
            console.error("Error sending signal:", error);
            if (error.response && error.response.status === 401) {
              toast.error(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
              navigate("/login");
            } else {
              toast.error("Lỗi gửi tín hiệu WebRTC");
            }
          });
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

      const friend = {
        id: call.caller.id,
        fullName: call.caller.id,
        username: call.caller.id,
        image:
          "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg",
      };
      navigate(
        `/call?friendId=${friend.id}&callId=${call.id}&callerId=${call.caller.id}`
      );
      setCall(null);
    } catch (error: any) {
      console.error("Error accepting call:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        toast.error("Không thể chấp nhận cuộc gọi");
      }
    }
  };

  const rejectCall = async () => {
    if (!call) return;
    try {
      await api.put(`call/${call.id}/reject`);
      setCall(null);
      toast.info("Đã từ chối cuộc gọi");
    } catch (error) {
      console.error("Error rejecting call:", error);
      toast.error("Không thể từ chối cuộc gọi");
    }
  };

  if (!call) return null;

  return (
    <div className="incoming-call">
      <div className="incoming-call-content">
        <h2>Cuộc gọi đến từ {call.caller.id}</h2>
        <div className="call-actions">
          <button className="accept-btn" onClick={acceptCall}>
            <CallIcon /> Chấp nhận
          </button>
          <button className="reject-btn" onClick={rejectCall}>
            <CallIcon /> Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
