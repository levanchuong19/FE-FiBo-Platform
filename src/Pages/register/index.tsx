/* eslint-disable @typescript-eslint/no-explicit-any */

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../Config/api";
import { Button, Form, Input } from "antd";
import FormItem from "antd/es/form/FormItem";

function Register() {
  const navigate = useNavigate();
  const handleRegiter = async (values: any) => {
    try {
      const response = await api.post("register", values);
      console.log(response.data);
      toast.success("Register success !");
      navigate("/login");
    } catch (err) {
      console.log("err", err);
      toast.error("Register faild");
    }
  };
  return (
    <div style={{ backgroundColor: "#f2f4f7" }}>
      <div className="h1">
        <h1>FiBo Platform</h1>
      </div>
      <div className="Register">
        <Form
          className="regiter-form"
          name="userForm"
          onFinish={handleRegiter}
          layout="vertical"
          initialValues={{
            role: "ADMIN",
          }}
        >
          <FormItem
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input placeholder="Full Name*" className="input" />
          </FormItem>
          <FormItem
            name="username"
            label="UserName"
            rules={[{ required: true, message: "Please enter your UserName" }]}
          >
            <Input placeholder="UserName*" className="input" />
          </FormItem>

          <FormItem
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Email*" className="input" />
          </FormItem>

          <FormItem
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter your phone number" },
            ]}
          >
            <Input className="input" placeholder="Phone*" />
          </FormItem>

          <FormItem
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password className="input" placeholder="Password*" />
          </FormItem>

          <FormItem
            name="confirmPassword"
            label="ConfirmPassword"
            rules={[
              { required: true, message: "Please enter your Confirm Password" },
            ]}
          >
            <Input.Password className="input" placeholder="Confirm Password*" />
          </FormItem>
          <div className="span">
            <div>
              <span>
                Những người dùng dịch vụ của chúng tôi có thể đã tải thông tin
                liên hệ của bạn lên <a href="/">FiBo Platform</a>. Tìm hiểu
                thêm.
              </span>
            </div>
            <div>
              <span>
                Bằng cách nhấp vào Đăng ký, bạn đồng ý với{" "}
                <a href="/">Điều khoản, Chính sách quyền riêng tư</a> và{" "}
                <a href="/">Chính sách cookie</a> của chúng tôi. Bạn có thể nhận
                được thông báo của chúng tôi qua SMS và hủy nhận bất kỳ lúc nào.
              </span>
            </div>
          </div>
          <div className="button">
            <Button type="primary" htmlType="submit">
              Register
            </Button>
          </div>
          <div className="button">
            <a href="/login">Bạn đã có tài khoản ư?</a>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Register;
