/* eslint-disable react-hooks/exhaustive-deps */
import { Button, DatePicker, Form, Input, Select } from "antd";
import "./index.scss";
import { useEffect, useState } from "react";
import { User } from "../../Model/user";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../Config/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function UpdateProfile() {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<User>();

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
        console.log(response.data.data);
        setProfile(response.data);
        const profileData = response.data;
        setProfile(profileData);

        form.setFieldsValue({
          ...profileData,
          dateOfBirth: profileData.dateOfBirth
            ? dayjs(profileData.dateOfBirth)
            : null,
        });
      } catch (err) {
        console.log("error", err);
      }
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [form, navigate]);

  const handleUpdateProfile = async (values: User) => {
    try {
      const token = localStorage.getItem("token");
      console.log("tk", token);
      if (token != null) {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        const idAccount = decodedToken.sub;
        console.log(idAccount);
        const response = await api.put(`account/${idAccount}`, values);
        console.log("values", response.data);
        setProfile(values);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log("err", error);
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="user-profile-container">
      {/* <h2>User Profile</h2> */}
      <div className="image">
        <div className="image_wrapper">
          <img
            src={profile?.image ? profile.image : "/path/to/default/image.jpg"}
            alt="User profile"
          />
        </div>
      </div>

      <div className="user-name">
        {profile?.username ? (
          <h3>{`${profile.username} `}</h3>
        ) : (
          <h3>Username not available</h3>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={profile}
        onFinish={handleUpdateProfile}
        className="user-profile-form"
      >
        <Form.Item
          label="FullName"
          name="fullName"
          rules={[{ required: true, message: "Please enter your fullName" }]}
        >
          <Input placeholder="Enter your fullName" />
        </Form.Item>

        <Form.Item
          label="UserName"
          name="username"
          rules={[{ required: true, message: "Please enter your username" }]}
        >
          <Input placeholder="Enter your username" />
        </Form.Item>

        <Form.Item
          label="Date Of Birth"
          name="dateOfBirth"
          rules={[
            { required: true, message: "Please enter your Date Of Birth" },
          ]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: "Please enter your gender" }]}
        >
          <Select
            options={[
              { value: "MALE", label: "MALE" },
              { value: "FEMALE", label: "FEMALE" },
              { value: "OTHER", label: "OTHER" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: "Please enter your phone" }]}
        >
          <Input placeholder="Enter your first phone" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please enter your address" }]}
        >
          <Input placeholder="Enter your address" />
        </Form.Item>

        <div className="button">
          <Button type="primary" htmlType="submit">
            Update Profile
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default UpdateProfile;
