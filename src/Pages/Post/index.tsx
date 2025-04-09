/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Dropdown, Menu, Modal, Upload, Avatar } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import api from "../../Config/api";
import "./index.scss";
import { toast } from "react-toastify";
import { Post } from "../../Model/post";
import { jwtDecode } from "jwt-decode";

const PostComponent: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [previewMedia, setPreviewMedia] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageAspectRatios, setImageAspectRatios] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setCurrentAccountId(decoded.sub);
          setUser({ fullName: decoded.fullName || "Người dùng" });

          const response = await api.get("posts");
          setPosts(response.data);

          // Tính toán tỷ lệ ảnh cho từng media
          response.data.forEach((post: Post) => {
            if (post.mediaUrls && post.mediaType === "IMAGE") {
              post.mediaUrls.forEach((url) => {
                calculateAspectRatio(url);
              });
            }
          });
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error("Không thể tải post");
        }
      }
    };

    fetchPosts();
  }, []);

  const calculateAspectRatio = useCallback((url: string) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      setImageAspectRatios((prev) => ({
        ...prev,
        [url]: aspectRatio,
      }));
    };
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (!newPost.trim() && mediaFiles.length === 0) {
      toast.warning("Vui lòng nhập nội dung hoặc chọn ảnh/video!");
      return;
    }

    const formData = new FormData();
    if (newPost) formData.append("content", newPost);
    mediaFiles.forEach((file) => formData.append("media", file));

    api
      .post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        setPosts((prev) => [response.data, ...prev]);
        setNewPost("");
        setMediaFiles([]);
        setIsModalVisible(false);

        // Tính toán tỷ lệ ảnh cho bài viết mới
        if (response.data.mediaUrls && response.data.mediaType === "IMAGE") {
          response.data.mediaUrls.forEach((url: string) => {
            calculateAspectRatio(url);
          });
        }
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          toast.error(error.response.data.error);
        } else {
          toast.error("Error posting media");
        }
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setNewPost("");
    setMediaFiles([]);
  };

  const handleFileChange = (info: any) => {
    const fileList = info.fileList.map((file: any) => file.originFileObj);
    setMediaFiles(fileList);
  };

  const handleReaction = (postId: string, type: string) => {
    if (!currentAccountId) return;
    api
      .post(`posts/${postId}/reactions`, { type })
      .then((response) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, reactions: [...p.reactions, response.data] }
              : p
          )
        );
      })
      .catch((error) => console.error("Error adding reaction:", error));
  };

  const handleComment = (postId: string) => {
    if (!newComment[postId]?.trim() || !currentAccountId) return;
    api
      .post(`posts/${postId}/comments`, { content: newComment[postId] })
      .then((response) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: [...p.comments, response.data] }
              : p
          )
        );
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  const handleShare = (postId: string) => {
    if (!currentAccountId) return;
    api
      .post(`posts/${postId}/shares`)
      .then((response) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, shares: [...p.shares, response.data] } : p
          )
        );
      })
      .catch((error) => console.error("Error sharing post:", error));
  };

  const reactionMenu = (postId: string) => (
    <Menu>
      <Menu.Item onClick={() => handleReaction(postId, "LIKE")}>👍</Menu.Item>
      <Menu.Item onClick={() => handleReaction(postId, "LOVE")}>❤️</Menu.Item>
      <Menu.Item onClick={() => handleReaction(postId, "HAHA")}>😂</Menu.Item>
      <Menu.Item onClick={() => handleReaction(postId, "WOW")}>😮</Menu.Item>
      <Menu.Item onClick={() => handleReaction(postId, "SAD")}>😢</Menu.Item>
    </Menu>
  );

  return (
    <div className="facebook-container">
      <div className="create-post">
        <Input.TextArea
          value={newPost}
          onClick={showModal}
          placeholder="Bạn đang nghĩ gì?"
          readOnly
        />
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={"https://via.placeholder.com/40"}
                style={{ marginRight: 8 }}
              />
              <div>
                <div>{user?.fullName || "Người dùng"}</div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {new Date().toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}{" "}
                  {new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          }
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="Đăng"
          cancelText="Hủy"
          okButtonProps={{
            style: { backgroundColor: "#1890ff", borderColor: "#1890ff" },
          }}
        >
          <Input.TextArea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
            rows={4}
            style={{ marginBottom: 16 }}
          />
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            fileList={mediaFiles.map((file, index) => ({
              uid: index.toString(),
              name: file.name,
              status: "done",
              url: URL.createObjectURL(file),
            }))}
          >
            <Button icon={<PictureOutlined />}>Thêm ảnh/video</Button>
          </Upload>
        </Modal>
      </div>
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <img
              src={
                post.author.image ||
                "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
              }
              alt="Avatar"
              className="avatar"
            />
            <div className="author-info">
              <span className="author-name">{post.author.fullName}</span>
              <span className="post-time">
                {new Date(post.createdAt).toLocaleString("vi-VN", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="post-content">{post.content}</div>
          {post.mediaUrls && (
            <div className="post-media">
              {post.mediaType === "VIDEO" ? (
                <video
                  controls
                  className="media-video"
                  onClick={() =>
                    post.mediaUrls &&
                    setPreviewMedia({ type: "video", url: post.mediaUrls[0] })
                  }
                >
                  {post.mediaUrls.map((url, index) => (
                    <source key={index} src={url} type="video/mp4" />
                  ))}
                  Your browser does not support the video tag.
                </video>
              ) : (
                post.mediaUrls.map((url, index) => {
                  const aspectRatio = imageAspectRatios[url] || 1;
                  const isHorizontal = aspectRatio > 1;
                  return (
                    <img
                      key={index}
                      src={url}
                      alt={`Post media ${index}`}
                      className={isHorizontal ? "media-video" : "media"}
                      onClick={() => setPreviewMedia({ type: "image", url })}
                      style={{ marginBottom: 8 }} // Thêm khoảng cách giữa các ảnh
                    />
                  );
                })
              )}
            </div>
          )}
          <div className="post-stats">
            <span>{post.reactions.length} Likes</span> ·{" "}
            <span>{post.comments.length} Comments</span> ·{" "}
            <span>{post.shares.length} Shares</span>
          </div>
          <div className="post-actions">
            <Dropdown overlay={reactionMenu(post.id)} trigger={["click"]}>
              <span className="action-btn">
                <ThumbUpIcon /> Like
              </span>
            </Dropdown>
            <span
              className="action-btn"
              onClick={() =>
                setNewComment((prev) => ({ ...prev, [post.id]: "" }))
              }
            >
              <CommentIcon /> Comment
            </span>
            <span className="action-btn" onClick={() => handleShare(post.id)}>
              <ShareIcon /> Share
            </span>
          </div>
          <div className="post-comments">
            {post.comments.map((c) => (
              <div key={c.id} className="comment">
                <img
                  src={c.author.image || "https://via.placeholder.com/32"}
                  alt="Commenter avatar"
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <strong>{c.author.fullName}</strong> {c.content}
                </div>
              </div>
            ))}
            <Input
              value={newComment[post.id] || ""}
              onChange={(e) =>
                setNewComment((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
              onPressEnter={() => handleComment(post.id)}
              placeholder="Write a comment..."
              className="comment-input"
            />
          </div>
        </div>
      ))}
      {previewMedia && (
        <div className="preview-overlay" onClick={() => setPreviewMedia(null)}>
          {previewMedia.type === "image" ? (
            <img
              src={previewMedia.url}
              alt="Preview"
              className="preview-image"
            />
          ) : (
            <video
              src={previewMedia.url}
              controls
              autoPlay
              className="preview-video"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PostComponent;
