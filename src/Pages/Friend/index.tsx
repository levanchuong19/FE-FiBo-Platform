/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Tabs, Button, List, Avatar } from "antd";
import api from "../../Config/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { User } from "../../Model/user";

const { TabPane } = Tabs;

function Friend() {
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [friendshipResponse, setFriendshipResponse] = useState([]);
  const navigate = useNavigate();

  // Lấy danh sách bạn bè
  const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const currentUserId = decodedToken.sub;
      try {
        const response = await api.get(`${currentUserId}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(
          "friend",
          response.data.filter((item: User) => item.id != currentUserId)
        );
        setFriendsList(response.data || []);
      } catch (err) {
        console.log("Error fetching friends:", err);
        toast.error("Failed to load friends list");
      }
    }
  };

  // Lấy danh sách lời mời kết bạn
  const fetchPendingRequests = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const currentUserId = decodedToken.sub;
      try {
        const response = await api.get(`${currentUserId}/friend/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("friend requests", response.data);
        setPendingRequests(response.data || []);
      } catch (err) {
        console.log("Error fetching pending requests:", err);
        toast.error("Failed to load friend requests");
      }
    }
  };
  const fetchSendingRequests = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const currentUserId = decodedToken.sub;
      try {
        const response = await api.get(`${currentUserId}/friend/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("friend response", response.data);
        setFriendshipResponse(response.data || []);
      } catch (err) {
        console.log("Error fetching pending response:", err);
        toast.error("Failed to load friend response");
      }
    }
  };

  // Lấy danh sách gợi ý bạn bè
  const fetchSuggestedFriends = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const idAccount = decodedToken.sub;
        const response = await api.get("account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // const friend = friendshipStatus.find((id) => id != idAccount);
        // console.log("friend data", friend);
        console.log(
          "account",
          response.data.filter(
            (item: User) => item.id != idAccount
            // && item.id != friend?.id
          )
        );
        const friendsIds = friendsList.map((friend: User) => friend.id);
        const sentRequestIds = friendshipResponse.map((req: User) => req.id);
        const pendingRequestIds = pendingRequests.map((req: User) => req.id);
        const filteredSuggestions = response.data.filter((item: User) => {
          return (
            item.id != idAccount && // Không phải account đăng nhập
            !friendsIds.includes(item.id) && // Không phải bạn bè
            !sentRequestIds.includes(item.id) && // Chưa gửi lời mời
            !pendingRequestIds.includes(item.id) // Chưa nhận lời mời
          );
        });
        console.log("Suggested friends:", filteredSuggestions);
        setSuggestedFriends(filteredSuggestions || []);
        // setSuggestedFriends(
        //   response.data.filter((item: User) => item.id != idAccount) || []
        // );
      } catch (err) {
        console.log("Error fetching suggested friends:", err);
        toast.error("Failed to load suggested friends");
      }
    } else {
      navigate("/login");
    }
  };

  // Xử lý follow
  const handleFollow = async (friendId: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        await api.post(
          `follow/${friendId}`,
          {},
          {
            params: { followerId: decodedToken.sub },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Follow request sent!");
        fetchSuggestedFriends();
      } catch (err) {
        console.log("Error following user:", err);
        toast.error("Failed to follow user");
      }
    }
  };

  const handleAddFriend = async (friendId: String) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        await api.post(
          `friend/request/${friendId}`,
          {},
          {
            params: { requesterId: decodedToken.sub },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Đã gửi yêu cầu kết bạn");
        fetchSuggestedFriends();
        fetchSendingRequests();
      } catch (err) {
        console.error("Error sending friend request:", err);
        toast.error("Không thể gửi yêu cầu kết bạn");
      }
    }
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleAcceptRequest = async (friendId: String) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        await api.post(
          `friend/accept/${friendId}`,
          {},
          {
            params: { receiverId: decodedToken.sub },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Friend request accepted!");
        fetchPendingRequests();
        fetchFriends();
      } catch (err) {
        console.log("Error accepting request:", err);
        toast.error("Failed to accept friend request");
      }
    }
  };

  // Xử lý từ chối lời mời kết bạn
  const handleDeclineRequest = async (friendId: String) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        await api.post(
          `friend/reject/${friendId}`,
          {},
          {
            params: { receiverId: decodedToken.sub },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Friend request declined!");
        fetchPendingRequests();
      } catch (err) {
        console.log("Error declining request:", err);
        toast.error("Failed to decline friend request");
      }
    }
  };

  // Xử lý hủy kết bạn
  const handleUnfriend = async (friendId: String) => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      try {
        await api.delete(`friend/${friendId}`, {
          params: { accountId: decodedToken.sub },
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Unfriended successfully!");
        fetchFriends();
      } catch (err) {
        console.log("Error unfriending:", err);
        toast.error("Failed to unfriend");
      }
    }
  };

  const handleCancelFriendRequest = async (friendId: String) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        await api.delete(`friend/request/${friendId}`, {
          params: { requesterId: decodedToken.sub },
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đã hủy yêu cầu kết bạn");
        fetchSendingRequests();
      } catch (err) {
        console.error("Error canceling friend request:", err);
        toast.error("Không thể hủy yêu cầu kết bạn");
      }
    }
  };

  useEffect(() => {
    fetchSuggestedFriends();
    fetchFriends();
    fetchPendingRequests();
    fetchSendingRequests();
  }, [navigate]);

  useEffect(() => {
    fetchSuggestedFriends();
  }, [navigate, friendsList, pendingRequests, friendshipResponse]);

  const handleAccountClick = (accountId: string) => {
    navigate(`accountProfile/${accountId}`); // Chuyển hướng đến trang profile với ID tài khoản
  };

  return (
    <div className="suggested-friends">
      <h2>Friends</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab={`Friends (${friendsList.length})`} key="1">
          <List
            dataSource={friendsList}
            renderItem={(friend: User) => (
              <List.Item
                style={{ cursor: "pointer" }}
                actions={[
                  <Button
                    type="default"
                    onClick={() => handleUnfriend(friend.id)}
                  >
                    Unfriend
                  </Button>,
                ]}
              >
                <div onClick={() => handleAccountClick(friend.id)}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={
                          friend.image ||
                          "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                        }
                        size={40}
                      />
                    }
                    title={<span>{friend.username}</span>}
                    description={<div>{friend.fullName}</div>}
                  />
                </div>
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab={`Friend Requests (${pendingRequests.length})`} key="2">
          <List
            dataSource={pendingRequests}
            renderItem={(request: User) => (
              <List.Item
                style={{ cursor: "pointer" }}
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Accept
                  </Button>,
                  <Button
                    type="default"
                    onClick={() => handleDeclineRequest(request.id)}
                  >
                    Decline
                  </Button>,
                ]}
              >
                <div onClick={() => handleAccountClick(request.id)}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={
                          request.image ||
                          "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                        }
                        size={40}
                      />
                    }
                    title={<span>{request.username}</span>}
                    description={<div>{request.fullName}</div>}
                  />
                </div>
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab={`Suggested (${suggestedFriends.length})`} key="3">
          <List
            dataSource={suggestedFriends}
            renderItem={(friend: User) => (
              <List.Item
                style={{ cursor: "pointer" }}
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleAddFriend(friend.id)}
                    // disabled={friend.isFollowed}
                  >
                    Add friend
                    {/* {friend.isFollowed ? "Following" : "Follow"} */}
                  </Button>,
                  <Button
                    type="primary"
                    onClick={() => handleFollow(friend.id)}
                    // disabled={friend.isFollowed}
                  >
                    Follow
                    {/* {friend.isFollowed ? "Following" : "Follow"} */}
                  </Button>,
                ]}
              >
                <div onClick={() => handleAccountClick(friend.id)}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={
                          friend.image ||
                          "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                        }
                        size={40}
                      />
                    }
                    title={<span>{friend.username}</span>}
                    description={
                      <div>{friend.fullName}</div>
                      // <div>

                      //   <div className="suggested-text">
                      //     {friend.followedBy
                      //       ? `Followed by ${friend.followedBy}`
                      //       : "Suggested for you"}
                      //   </div>
                      // </div>
                    }
                  />
                </div>
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane
          tab={`Friends Response (${friendshipResponse.length})`}
          key="4"
        >
          <List
            dataSource={friendshipResponse}
            renderItem={(friend: User) => (
              <List.Item
                style={{ cursor: "pointer" }}
                actions={[
                  <Button
                    type="default"
                    onClick={() => handleCancelFriendRequest(friend.id)}
                  >
                    Cancel Request
                  </Button>,
                ]}
              >
                <div onClick={() => handleAccountClick(friend.id)}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={
                          friend.image ||
                          "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                        }
                        size={40}
                      />
                    }
                    title={<span>{friend.username}</span>}
                    description={<div>{friend.fullName}</div>}
                  />
                </div>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Friend;
