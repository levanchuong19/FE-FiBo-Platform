/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import SimplePeer from "simple-peer";
import api from "../../Config/api";
import useRealtime from "../../hooks/useRealtime";
import CallIcon from "@mui/icons-material/Call";
// import CallEndIcon from "@mui/icons-material/CallEnd";
import "./index.scss";
import { useNavigate } from "react-router-dom";

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

function IncomingCall() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

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
    };
  }, []);

  useRealtime((data: any, topic: string) => {
    console.log(`Received WebSocket message from topic ${topic}:`, data);
    console.log("topic", topic);

    if (topic === "call") {
      const incomingCall: Call = data;
      console.log("Processing incoming call:", incomingCall);

      if (
        incomingCall &&
        incomingCall.status === "PENDING" &&
        incomingCall.receiver.id == currentUserId
      ) {
        console.log("Incoming call matched:", incomingCall);
        setCall({ ...incomingCall });
      } else if (
        incomingCall &&
        incomingCall.status === "ENDED" &&
        incomingCall.id === call?.id
      ) {
        console.log("Call ended:", incomingCall);
        setCall(null);
        if (peer) peer.destroy();
        if (stream) stream.getTracks().forEach((track) => track.stop());
        toast.info("Cuộc gọi đã kết thúc");
      } else {
        console.log(
          "Incoming call did not match:",
          incomingCall,
          "currentUserId:",
          currentUserId
        );
      }

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
    }
  });

  //   const acceptCall = async () => {
  //     if (!call) return;

  //     try {
  //       const response = await api.put(`call/${call.id}/accept`);
  //       const updatedCall: Call = response.data;
  //       setCall(updatedCall);

  //       const mediaStream = await navigator.mediaDevices.getUserMedia({
  //         video: call.isVideoCall,
  //         audio: true,
  //       });
  //       setStream(mediaStream);
  //       if (localVideoRef.current) {
  //         localVideoRef.current.srcObject = mediaStream;
  //       }

  //       const peerInstance = new SimplePeer({
  //         initiator: false,
  //         trickle: false,
  //         stream: mediaStream,
  //         config: {
  //           iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  //         },
  //       });

  //       peerInstance.on("signal", (data) => {
  //         api.post(
  //           `call/signal?callId=${call.id}&senderId=${currentUserId}&receiverId=${call.caller.id}`,
  //           data
  //         );
  //       });

  //       peerInstance.on("stream", (remoteStream) => {
  //         if (remoteVideoRef.current) {
  //           remoteVideoRef.current.srcObject = remoteStream;
  //         }
  //       });

  //       peerInstance.on("error", (err) => {
  //         console.error("Peer error:", err);
  //         toast.error("Lỗi kết nối WebRTC");
  //       });

  //       setPeer(peerInstance);

  //       const friend = {
  //         id: call.caller.id,
  //         fullName: call.caller.id,
  //         username: call.caller.id,
  //         image:
  //           "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg",
  //       };
  //       window.location.href = `/call?friendId=${friend.id}&isVideoCall=${call.isVideoCall}&callId=${call.id}`;
  //     } catch (error) {
  //       console.error("Error accepting call:", error);
  //       toast.error("Không thể chấp nhận cuộc gọi");
  //     }
  //   };
  const acceptCall = async () => {
    if (!call) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await api.put(`call/${call.id}/accept`);
      const updatedCall: Call = response.data;
      setCall(updatedCall);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: call.isVideoCall ?? false, // Sử dụng giá trị mặc định là false nếu isVideoCall là undefined
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
              window.location.href = "/login";
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

      // Kiểm tra token trước khi chuyển hướng
      if (!localStorage.getItem("token")) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }

      const friend = {
        id: call.caller.id,
        fullName: call.caller.id,
        username: call.caller.id,
        image:
          "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg",
      };
      // Sửa giá trị isVideoCall để tránh undefined
      const isVideoCall = call.isVideoCall ?? false;
      navigate(
        `/call?friendId=${friend.id}&isVideoCall=${isVideoCall}&callId=${call.id}`
      );
      setCall(null);
    } catch (error: any) {
      console.error("Error accepting call:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
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

  console.log("Current call state:", call); // Debug state

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
