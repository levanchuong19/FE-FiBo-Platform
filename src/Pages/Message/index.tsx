/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import "./index.scss";
import { Input, Dropdown, Menu } from "antd";
import SendIcon from "@mui/icons-material/Send";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import ReplyIcon from "@mui/icons-material/Reply";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import EditIcon from "@mui/icons-material/Edit";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CallIcon from "@mui/icons-material/Call";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../Config/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { User } from "../../Model/user";
import useRealtime from "../../hooks/useRealtime";
import { useNavigate } from "react-router-dom";

interface Friend {
  id: string;
  fullName: string;
  username: string;
  image?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isActive?: boolean;
}

interface Message {
  id: string;
  sender: { id: string };
  receiver: { id: string };
  content: string;
  createdAt: string;
  updatedAt?: string; // Thêm updatedAt để hiển thị nhãn "Đã chỉnh sửa"
  isRead: boolean;
  reaction?: string;
  repliedTo?: Message;
}

function Message() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setCurrentUserId(decoded.sub);
      fetchFriends();
    }
  }, []);

  useRealtime(async (body: { body: string }) => {
    console.log(body?.body == "New message");
    fetchMessages(selectedFriend?.id || "");
  });

  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messagesContainerRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 50;
        setIsAtBottom(atBottom);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.sub;
      try {
        const response = await api.get(`${userId}/friends`);
        const friendsWithDetails = response.data
          .filter((item: User) => item.id != userId)
          .map((friend: Friend) => ({
            ...friend,
            lastMessage: "Chào bạn!",
            lastMessageTime: "2 giờ",
            isActive: Math.random() > 0.5,
          }));
        setFriends(friendsWithDetails);
      } catch (error) {
        console.error("Error fetching friends:", error);
        toast.error("Không thể tải danh sách bạn bè");
      }
    }
  };

  const fetchMessages = async (friendId: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.sub;
      if (friendId) {
        try {
          const response = await api.get(
            `messages/conversation?userId1=${userId}&userId2=${friendId}`
          );
          setMessages(response.data);
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          // toast.error("Không thể tải tin nhắn");
        }
      }
    }
  };

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
    fetchMessages(friend.id);
    setReplyingTo(null);
    setEditingMessage(null);
    setNewMessage(""); // Làm trống ô input khi chọn người bạn khác
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.sub;
      try {
        const response = await api.post(
          `/messages/send?senderId=${userId}&receiverId=${selectedFriend.id}${
            replyingTo ? `&repliedToId=${replyingTo.id}` : ""
          }`,
          newMessage,
          {
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        const newMsg = { ...response.data, isRead: false };
        if (replyingTo) {
          newMsg.repliedTo = replyingTo;
        }
        setMessages([...messages, newMsg]);
        setNewMessage("");
        setReplyingTo(null);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Không thể gửi tin nhắn");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingMessage) {
        handleEditMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleReaction = async (message: Message, reaction: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.post(
          `messages/${message.id}/reaction`,
          reaction,
          {
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        setMessages(
          messages.map((msg) => (msg.id === message.id ? response.data : msg))
        );
      } catch (error) {
        console.error("Error adding reaction:", error);
        toast.error("Không thể thêm reaction");
      }
    }
  };

  const handleRemoveReaction = async (message: Message) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.delete(
          `messages/delete/${message.id}/reaction`
        );
        setMessages(
          messages.map((msg) => (msg.id === message.id ? response.data : msg))
        );
        toast.success("Đã xóa reaction");
      } catch (error) {
        console.error("Error removing reaction:", error);
        toast.error("Không thể xóa reaction");
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.sub;
      try {
        await api.delete(`messages/delete/${messageId}?userId=${userId}`);
        setMessages(messages.filter((msg) => msg.id !== messageId));
        toast.success("Đã xóa tin nhắn");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Không thể xóa tin nhắn");
      }
    }
  };

  const handleStartEdit = (message: Message) => {
    const messageTime = new Date(message.createdAt);
    const currentTime = new Date();
    const timeDiff =
      (currentTime.getTime() - messageTime.getTime()) / (1000 * 60);

    if (timeDiff > 60) {
      toast.error("Không thể chỉnh sửa tin nhắn sau 1 tiếng!");
      return;
    }

    setEditingMessage(message);
    setNewMessage(message.content); // Điền nội dung tin nhắn vào ô input
  };

  const handleEditMessage = async () => {
    if (!newMessage.trim() || !editingMessage) return;

    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.sub;
      try {
        const response = await api.put(
          `messages/update/${
            editingMessage.id
          }?userId=${userId}&content=${encodeURIComponent(newMessage)}`
        );
        setMessages(
          messages.map((msg) =>
            msg.id === editingMessage.id ? response.data : msg
          )
        );
        setEditingMessage(null);
        setNewMessage(""); // Làm trống ô input sau khi chỉnh sửa
        toast.success("Đã chỉnh sửa tin nhắn");
      } catch (error) {
        console.error("Error editing message:", error);
        toast.error("Không thể chỉnh sửa tin nhắn");
      }
    }
  };

  useEffect(() => {
    if (!selectedFriend || !currentUserId) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get(
            `messages/conversation?userId1=${currentUserId}&userId2=${selectedFriend.id}`
          );
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            response.data.forEach((newMsg: Message) => {
              const index = updatedMessages.findIndex(
                (msg) => msg.id === newMsg.id
              );
              if (index !== -1) {
                updatedMessages[index] = newMsg;
              } else {
                updatedMessages.push(newMsg);
              }
            });
            return updatedMessages;
          });
        } catch (error) {
          console.error("Error polling messages:", error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedFriend, currentUserId]);

  const reactionMenu = (message: Message) => (
    <Menu style={{ display: "flex" }}>
      <Menu.Item onClick={() => handleReaction(message, "❤️")}>❤️</Menu.Item>
      <Menu.Item onClick={() => handleReaction(message, "😂")}>😂</Menu.Item>
      <Menu.Item onClick={() => handleReaction(message, "😮")}>😮</Menu.Item>
      <Menu.Item onClick={() => handleReaction(message, "😢")}>😢</Menu.Item>
      <Menu.Item onClick={() => handleReaction(message, "👍")}>👍</Menu.Item>
    </Menu>
  );

  const optionsMenu = (message: Message) => (
    <Menu>
      <Menu.Item onClick={() => handleStartEdit(message)}>
        <EditIcon style={{ marginRight: 8 }} />
        Chỉnh sửa
      </Menu.Item>
      <Menu.Item onClick={() => handleDeleteMessage(message.id)}>
        <DeleteIcon style={{ marginRight: 8 }} />
        Xóa
      </Menu.Item>
    </Menu>
  );

  const handleCall = (isVideoCall: boolean) => {
    if (selectedFriend) {
      navigate(
        `/call?friendId=${selectedFriend.id}&isVideoCall=${isVideoCall}`
      );
    }
  };

  return (
    <div className="message-container">
      <div className="friends-list">
        <div className="friends-header">
          <h2>Đoạn chat</h2>
        </div>
        <div className="friends-scroll">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className={`friend-item ${
                selectedFriend?.id === friend.id ? "selected" : ""
              }`}
              onClick={() => handleFriendSelect(friend)}
            >
              <div className="friend-avatar-wrapper">
                <img
                  src={
                    friend.image ||
                    "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                  }
                  alt="Avatar"
                  className="friend-avatar"
                />
                {friend.isActive && <span className="active-dot"></span>}
              </div>
              <div className="friend-info">
                <span className="friend-name">
                  {friend.fullName || friend.username}
                </span>
                <div className="friend-last-message">
                  <span>{friend.lastMessage}</span>
                  <span className="friend-time">{friend.lastMessageTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <img
                  src={
                    selectedFriend.image ||
                    "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                  }
                  alt="Avatar"
                  className="chat-avatar"
                />
                <span>
                  {selectedFriend.fullName || selectedFriend.username}
                </span>
              </div>
              <div className="chat-header-actions">
                <CallIcon
                  onClick={() => handleCall(false)}
                  className="chat-action-icon"
                />
                <VideoCallIcon
                  onClick={() => handleCall(true)}
                  className="chat-action-icon"
                />
                <MoreHorizIcon className="chat-options" />
              </div>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
              {messages.map((message, index) => {
                const showAvatar =
                  message.sender.id != currentUserId &&
                  (index === 0 ||
                    messages[index - 1].sender.id !== message.sender.id ||
                    new Date(messages[index - 1].createdAt).toDateString() !==
                      new Date(message.createdAt).toDateString());

                const sentMessages = messages.filter(
                  (msg) => msg.sender.id == currentUserId
                );
                const latestSentMessage = sentMessages.length
                  ? sentMessages.reduce((latest, msg) => {
                      return new Date(msg.createdAt) >
                        new Date(latest.createdAt)
                        ? msg
                        : latest;
                    }, sentMessages[0])
                  : null;

                const latestMessage = messages.reduce((latest, msg) => {
                  return new Date(msg.createdAt) > new Date(latest.createdAt)
                    ? msg
                    : latest;
                }, messages[0]);

                const isLatestSentMessage =
                  message.sender.id == currentUserId &&
                  message.id == latestSentMessage?.id;

                const hasBeenReplied =
                  latestMessage?.sender.id !== currentUserId &&
                  new Date(latestMessage?.createdAt) >
                    new Date(latestSentMessage?.createdAt || 0);

                return (
                  <div key={message.id}>
                    {(index === 0 ||
                      new Date(messages[index - 1].createdAt).toDateString() !=
                        new Date(message.createdAt).toDateString()) && (
                      <div className="message-date">
                        {new Date(message.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "numeric",
                          }
                        )}
                      </div>
                    )}
                    <div
                      className={`message ${
                        message.sender.id == currentUserId ? "sent" : "received"
                      } ${showAvatar ? "with-avatar" : ""}`}
                    >
                      {showAvatar && (
                        <img
                          src={
                            selectedFriend.image ||
                            "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                          }
                          alt="Avatar"
                          className="message-avatar"
                        />
                      )}
                      <div className="message-content-wrapper">
                        {message.repliedTo && (
                          <div className="replied-message">
                            <span>Đã trả lời: </span>
                            <span>{message.repliedTo.content}</span>
                          </div>
                        )}
                        <div className="message-content">
                          {message.content}
                          {/* {message.updatedAt && (
                            <span className="edited-label">
                              {" "}
                              (Đã chỉnh sửa)
                            </span>
                          )} */}
                        </div>
                        {message.reaction && (
                          <div
                            className="message-reaction clickable-reaction"
                            onClick={() => handleRemoveReaction(message)}
                            style={{ cursor: "pointer" }}
                          >
                            {message.reaction}
                          </div>
                        )}
                        {isLatestSentMessage &&
                          message.sender.id == currentUserId &&
                          !hasBeenReplied && (
                            <div className="message-status">
                              {message.isRead ? (
                                <span className="seen-text">Đã xem</span>
                              ) : (
                                <span className="sent-text">Đã gửi</span>
                              )}
                            </div>
                          )}
                        <div className="message-actions">
                          <ReplyIcon
                            className="action-icon"
                            onClick={() => handleReply(message)}
                          />
                          <Dropdown
                            overlay={reactionMenu(message)}
                            trigger={["click"]}
                          >
                            <SentimentSatisfiedAltIcon className="action-icon" />
                          </Dropdown>
                          {message.sender.id == currentUserId && (
                            <Dropdown
                              overlay={optionsMenu(message)}
                              trigger={["click"]}
                            >
                              <MoreHorizIcon className="action-icon" />
                            </Dropdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input">
              {replyingTo && (
                <div className="replying-to">
                  <span>Đang trả lời: {replyingTo.content}</span>
                  <span onClick={() => setReplyingTo(null)}>X</span>
                </div>
              )}
              {editingMessage && (
                <div className="editing-message">
                  <span>Đang chỉnh sửa tin nhắn: {editingMessage.content}</span>
                  <span
                    onClick={() => {
                      setEditingMessage(null);
                      setNewMessage("");
                    }}
                  >
                    X
                  </span>
                </div>
              )}
              <AttachFileIcon className="input-icon" />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  editingMessage ? "Chỉnh sửa tin nhắn..." : "Nhắn tin..."
                }
                className="chat-input"
              />
              {newMessage.trim() ? (
                <SendIcon
                  onClick={
                    editingMessage ? handleEditMessage : handleSendMessage
                  }
                  className="input-icon send-icon"
                />
              ) : (
                <InsertEmoticonIcon className="input-icon" />
              )}
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Chọn một đoạn chat để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;
