import { useDispatch } from "react-redux";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import api from "../../Config/api";
import { toast } from "react-toastify";
import { login } from "../../Redux/features/userSlice";
import { Button, Form, Input } from "antd";
import FormItem from "antd/es/form/FormItem";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = async (values: any) => {
    try {
      const response = await api.post("login", values);
      console.log(response.data);
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      toast.success("Login success!");
      // lưu trữ thông tin của user
      // dispatch action
      dispatch(login(response.data));
      // navigate("/");
      if (role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log("err", err);
      toast.error("Login Faild");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1 className="H1">FiBo Platform</h1>
        <div>
          <h2>
            FiBo Platform giúp bạn kết nối và chia sẻ với mọi người trong cuộc
            sống của bạn.
          </h2>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          {/* <h1 className="login-logo">Instagram</h1> */}
          <Form className="login-form" onFinish={handleLogin}>
            <FormItem
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please enter your Phone",
                },
              ]}
            >
              <Input placeholder="Phone number" className="login-input" />
            </FormItem>
            <FormItem
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
            >
              <Input placeholder="Password" className="login-input" />
            </FormItem>

            <Button htmlType="submit" className="login-button">
              Log in
            </Button>

            <div className="login-divider">OR</div>
            <Button className="login-facebook-button">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook Logo"
                className="facebook-logo"
              />
              Log in with Facebook
            </Button>
          </Form>
          <a href="#" className="login-forgot-password">
            Forgot password?
          </a>
        </div>
        <div className="signup-box">
          <p>
            Don't have an account? <a href="/register">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
