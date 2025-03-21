import "./index.scss";

function Login() {
  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="https://www.instagram.com/static/images/homepage/screenshots/screenshot1-2x.jpg/9144d6673849.jpg"
          alt="Instagram Mobile View"
          className="login-image"
        />
      </div>
      <div className="login-right">
        <div className="login-box">
          <h1 className="login-logo">Instagram</h1>
          <form className="login-form">
            <input
              type="text"
              placeholder="Phone number, username, or email"
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
            />
            <button type="submit" className="login-button">
              Log in
            </button>
          </form>
          <div className="login-divider">OR</div>
          <button className="login-facebook-button">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
              alt="Facebook Logo"
              className="facebook-logo"
            />
            Log in with Facebook
          </button>
          <a href="#" className="login-forgot-password">
            Forgot password?
          </a>
        </div>
        <div className="signup-box">
          <p>
            Don't have an account? <a href="#">Sign up</a>
          </p>
        </div>
        <div className="get-app">
          <p>Get the app.</p>
          <div className="app-stores">
            <img
              src="https://www.instagram.com/static/images/appstore-install-badges/badge_ios_english_en.png/3cd8a0bc0bba.png"
              alt="App Store"
              className="app-store"
            />
            <img
              src="https://www.instagram.com/static/images/appstore-install-badges/badge_android_english_en.png/e9cd846dc748.png"
              alt="Google Play"
              className="app-store"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
