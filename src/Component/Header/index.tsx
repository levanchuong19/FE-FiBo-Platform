import "./index.scss";

function Header() {
  return (
    <div className="header">
      <div className="header__left">
        {/* <img
          src="https://i.ibb.co/cXDjbYqp/DALL-E-2025-03-20-00-01-30-A-modern-and-stylish-text-based-logo-for-Fibo-Platform-in-a-script-font-s.webp"
          alt="Logo"
          className="header__logo"
        /> */}
      </div>
      <div className="header__center">
        <input
          type="text"
          placeholder="Search Facebook"
          className="header__search"
        />
      </div>
      <div className="header__right">
        <div className="header__option">Home</div>
        <div className="header__option">Friends</div>
        <div className="header__option">Watch</div>
        <div className="header__option">Marketplace</div>
        <div className="header__option">Groups</div>
      </div>
    </div>
  );
}

export default Header;
