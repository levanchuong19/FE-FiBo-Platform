/* eslint-disable react-hooks/exhaustive-deps */
import { Button, GetProp, Upload, UploadProps } from "antd";
import "./index.scss";
import {
  LoadingOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { User } from "../../Model/user";
import api from "../../Config/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    toast.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    toast.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

function Profile() {
  const [profile, setProfile] = useState<User | undefined>(undefined);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    console.log("token", token);
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        const idAccount = decodedToken.sub;
        const response = await api.get(`account/${idAccount}`);
        console.log(response.data);
        setProfile(response.data);
      } catch (err) {
        console.log("error", err);
      }
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const [loading, setLoading] = useState(false);
  const [, setImageUrl] = useState<string>();

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__avatar">
          <Upload
            name="file"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            action={`http://localhost:8080/api/${profile?.id}upload-avatar`}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            headers={{
              authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi token nếu backend yêu cầu
            }}
            data={() => ({
              idAccount: profile?.id, // Gửi kèm ID của user
            })}
          >
            {profile?.image ? (
              <div className="img">
                <img className="img" src={profile?.image} alt="avatar" />
              </div>
            ) : (
              uploadButton
            )}
          </Upload>
        </div>
        <div className="profile__info">
          <div className="profile__username">
            <h2>{profile?.username}</h2>
            <Button onClick={() => navigate("/updateProfile")}>
              Edit profile
            </Button>
            <Button>View archive</Button>
            {/* <Button> */}
            <SettingOutlined />
            {/* </Button> */}
          </div>
          <div className="profile__stats">
            <span>{profile?.posts || 0} posts</span>
            <span>{profile?.followers?.length || 0} followers</span>
            <span>{profile?.following?.length || 0} following</span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/friend")}
            >
              Friends
            </span>
          </div>
          <div className="profile__name">
            <h3>{profile?.fullName}</h3>
            {/* <p>@chuong_191</p> */}
          </div>
        </div>
      </div>
      <div className="profile__content">
        <div className="profile__stories">
          <div className="profile__story">
            <img
              src="https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-6/479904496_1366714647835083_3637611312555656878_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEblLcXxqgdL1JASyjR_JAWC7dUwBIkft4Lt1TAEiR-3rp_qXelKWh_s53LQLAyT-6XahIH431-Wep-iez7jWLv&_nc_ohc=VKuCU1paZQQQ7kNvgFaqOa4&_nc_oc=Adl98SxVC0FodtyX9P1-FwtJVzxcNw1MbAFENZFG8Gc20m4XyCDiVYIj-HMyf7RF-jU&_nc_zt=23&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=taQ4F4N7PTSfRn-E6xYnCw&oh=00_AYFQ_vvjtpxlBmPw8pGOzvbWtOjCe6R-rKgVLKechaZvAQ&oe=67E2ECAC"
              alt="Story"
            />
            <span>Story 1</span>
          </div>
          <div className="profile__story">
            <img src="https://via.placeholder.com/80" alt="Story" />
            <span>New</span>
          </div>
        </div>
        <div className="profile__posts">
          <div className="profile__tabs">
            <span>POSTS</span>
            <span>SAVED</span>
            <span>TAGGED</span>
          </div>
          <div className="profile__post">
            <img
              src="https://www.instagram.com/_3blackrose_/p/C5Ys0dnyKYbkcGgsyh9F1tTUMKTAiXmerfp8yQ0/"
              alt="Post"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
