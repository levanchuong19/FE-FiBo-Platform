/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

import SockJS from "sockjs-client";
import Stomp from "stompjs";
function useRealtime(callback: any) {
  const WS_URL = "http://localhost:8080/websocket";
  const socket = new SockJS(WS_URL);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const stomp = Stomp.over(socket);
  //   const accountID = localStorage.getItem("userId");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setCurrentUserId(decoded.sub);
    }
  }, []);
  useEffect(() => {
    if (!currentUserId) return;
    console.log(currentUserId);
    const onConnected = () => {
      //   console.log("WebSocket connected");
      stomp.subscribe(`/topic/chat/${currentUserId}`, (message) => {
        console.log(message);
        callback && callback(message);
      });

      stomp.subscribe(`/topic/call/${currentUserId}`, (message) => {
        const data = JSON.parse(message.body);
        console.log("Received message from /topic/call:", data);
        if (callback) {
          console.log("Calling callback for /topic/call");
          callback(data, "call");
        } else {
          console.error("Callback is not defined for /topic/call");
        }
      });
    };

    stomp.connect(
      { token: `Bearer ${localStorage.getItem("token")}` },
      onConnected,
      (error) => {
        console.error("WebSocket error:", error);
      }
    );
  }, [currentUserId]);

  return <></>;
}

export default useRealtime;
