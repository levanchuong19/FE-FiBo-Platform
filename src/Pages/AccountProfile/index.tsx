/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { CameraOutlined, SettingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { jwtDecode } from "jwt-decode";
import api from "../../Config/api";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { User } from "../../Model/user";
import { useNavigate, useParams } from "react-router-dom";
import "./index.scss";

function AccountProfile() {
  const [profile, setProfile] = useState<User>();
  const [posts] = useState<{ id: string; image?: string }[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          const idAccount = id || decodedToken.sub; // ID của tài khoản đang xem profile
          const currentUserId = decodedToken.sub; // ID của tài khoản hiện tại

          // Lấy thông tin profile
          const response = await api.get(`account/${idAccount}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Profile API Response:", response.data);
          setProfile(response.data);
          setIsOwnProfile(idAccount === currentUserId);

          // Kiểm tra trạng thái kết bạn
          const friendResponse = await api.get(`${currentUserId}/friends`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const friendIds = friendResponse.data.map((friend: any) => friend.id);
          console.log("Friend IDs:", friendIds);

          // Kiểm tra xem idAccount có trong danh sách bạn bè của currentUserId không
          if (friendIds.includes(parseInt(idAccount))) {
            setFriendshipStatus("FRIENDS");
          } else {
            // Kiểm tra xem currentUserId đã gửi lời mời cho idAccount chưa
            const sentRequestsResponse = await api.get(
              `${currentUserId}/friend/sent`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const sentRequestIds = sentRequestsResponse.data.map(
              (friend: any) => friend.id
            );
            console.log("Sent Request IDs:", sentRequestIds);

            if (sentRequestIds.includes(parseInt(idAccount))) {
              setFriendshipStatus("PENDING");
            } else {
              // Kiểm tra xem idAccount đã gửi lời mời cho currentUserId chưa
              const receivedRequestsResponse = await api.get(
                `${currentUserId}/friend/requests`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const receivedRequestIds = receivedRequestsResponse.data.map(
                (friend: any) => friend.id
              );
              console.log("Received Request IDs:", receivedRequestIds);

              if (receivedRequestIds.includes(parseInt(idAccount))) {
                setFriendshipStatus("REQUESTED");
              } else {
                setFriendshipStatus(null);
              }
            }
          }

          console.log("friendshipStatus:", friendshipStatus);
        } catch (err) {
          console.log("error", err);
          toast.error("Không thể tải thông tin tài khoản");
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    fetchProfile();
  }, [id, navigate]);

  // const fetchPosts = async () => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     try {
  //       const idAccount = id || jwtDecode(token).sub;
  //       const response = await api.get(`posts/${idAccount}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       console.log("Posts API Response:", response.data);
  //       setPosts(response.data || []);
  //     } catch (err) {
  //       console.error("Error fetching posts:", err);
  //       toast.error("Không thể tải bài viết");
  //       setPosts([]);
  //     }
  //   }
  // };

  // xử lý follow/unfollow tài khoản
  const handleFollowToggle = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const followerId = decodedToken.sub;
        if (isFollowing) {
          await api.delete(`follow/${followerId}`, {
            params: { followerId: id },
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Đã hủy theo dõi tài khoản");
          setIsFollowing(false);
          // fetchProfile();
        } else {
          const response = await api.post(
            `follow/${followerId}`,
            {},
            {
              params: { followerId: id },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setIsFollowing(true);
          console.log("data follow", response.data);
          toast.success("Đã theo dõi tài khoản");
          // fetchProfile();
        }
      } catch (err) {
        console.error("Error toggling follow:", err);
        toast.error("Không thể thực hiện thao tác");
        // fetchProfile();
      }
    }
  };

  //xử lý gửi yêu cầu kết bạn
  const handleFriendRequest = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        await api.post(
          `friend/request/${id}`,
          {},
          {
            params: { requesterId: decodedToken.sub },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Đã gửi yêu cầu kết bạn");
        setFriendshipStatus("PENDING");
      } catch (err) {
        console.error("Error sending friend request:", err);
        toast.error("Không thể gửi yêu cầu kết bạn");
      }
    }
  };

  //xử lý hủy yêu cầu kết bạn
  const handleCancelFriendRequest = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        await api.delete(`friend/request/${id}`, {
          params: { requesterId: decodedToken.sub },
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đã hủy yêu cầu kết bạn");
        setFriendshipStatus(null);
      } catch (err) {
        console.error("Error canceling friend request:", err);
        toast.error("Không thể hủy yêu cầu kết bạn");
      }
    }
  };

  //xử lý từ chối yêu cầu kết bạn
  const handleDeclineFriendRequest = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        await api.post(
          `friend/reject/${id}`,
          {},
          {
            params: { receiverId: decodedToken.sub },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Đã từ chối yêu cầu kết bạn");
        setFriendshipStatus(null);
      } catch (err) {
        console.error("Error declining friend request:", err);
        toast.error("Không thể từ chối yêu cầu kết bạn");
      }
    }
  };

  //xử lý chấp nhận yêu cầu kết bạn
  const handleAcceptFriendRequest = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        await api.post(
          `friend/accept/${id}`,
          {},
          {
            params: { receiverId: decodedToken.sub },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success("Đã chấp nhận yêu cầu kết bạn");
        setFriendshipStatus("FRIENDS");
      } catch (err) {
        console.error("Error accepting friend request:", err);
        toast.error("Không thể chấp nhận yêu cầu kết bạn");
      }
    }
  };

  //xử lý hủy kết bạn
  const handleUnfriend = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        await api.delete(`friend/${id}`, {
          params: { accountId: decodedToken.sub },
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đã hủy kết bạn");
        setFriendshipStatus(null);
      } catch (err) {
        console.error("Error unfriending:", err);
        toast.error("Không thể hủy kết bạn");
      }
    }
  };

  // useEffect(() => {
  //   // fetchProfile();
  //   // fetchPosts();
  // }, [id]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__avatar">
          <img
            className="img"
            src={
              profile?.image ||
              "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
            }
            alt="avatar"
          />
        </div>
        <div className="profile__info">
          <div className="profile__username">
            <h2>{profile?.fullName}</h2>
            {isOwnProfile ? (
              <>
                <Button onClick={() => navigate("/updateProfile")}>
                  Edit profile
                </Button>
                <Button>View archive</Button>
                <SettingOutlined />
              </>
            ) : (
              <>
                <Button
                  type={isFollowing ? "default" : "primary"}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Hủy Follow" : "Follow"}
                </Button>
                {friendshipStatus === "FRIENDS" ? (
                  <Button onClick={handleUnfriend}>Hủy kết bạn</Button>
                ) : friendshipStatus === "PENDING" ? (
                  <Button onClick={handleCancelFriendRequest}>
                    Hủy yêu cầu
                  </Button>
                ) : friendshipStatus === "REQUESTED" ? (
                  <>
                    <Button type="primary" onClick={handleAcceptFriendRequest}>
                      Xác nhận
                    </Button>
                    <Button onClick={handleDeclineFriendRequest}>
                      Từ chối
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleFriendRequest}>Kết bạn</Button>
                )}
                <SettingOutlined />
              </>
            )}
          </div>
          <div className="profile__stats">
            <span>{profile?.posts || 0} posts</span>
            <span>{profile?.followers?.length || 0} followers</span>
            <span>{profile?.following?.length || 0} following</span>
          </div>
          <div className="profile__name">
            <h3>{profile?.username}</h3>
          </div>
        </div>
      </div>
      <div className="profile__content">
        <div className="profile__tabs">
          <span className="tab active">POSTS</span>
          <span className="tab">TAGGED</span>
        </div>
        {posts.length > 0 ? (
          <div className="profile__posts">
            {posts.map((post) => (
              <div key={post.id} className="profile__post">
                <img
                  src={
                    post.image ||
                    "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                  }
                  alt="Post"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="profile__no-posts">
            <CameraOutlined className="camera-icon" />
            <h3>No Posts Yet</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountProfile;
