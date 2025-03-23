/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import "./index.scss";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ExploreIcon from "@mui/icons-material/Explore";
import MovieIcon from "@mui/icons-material/Movie";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ForumIcon from "@mui/icons-material/Forum";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import ActivityIcon from "@mui/icons-material/AccessTime";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AppearanceIcon from "@mui/icons-material/Brightness4";
import ReportIcon from "@mui/icons-material/Report";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import LogoutIcon from "@mui/icons-material/Logout";
// import Profile from "../Profile"; // Adjust the import path as needed
import { useNavigate } from "react-router-dom";

function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  // const [currentPage, setCurrentPage] = useState("home");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleMore = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
      setIsMoreOpen(false);
    }
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // const renderContent = () => {
  //   switch (currentPage) {
  //     case "profile":
  //       return <Profile />;
  //     case "home":
  //     default:
  //       return <div className="non-selectable">Home Content</div>;
  //   }
  // };

  return (
    <div className="home non-selectable">
      <div className={`sidebar ${isSearchOpen ? "collapsed" : ""}`}>
        <div className="sidebar__logo">
          <img
            src="https://i.ibb.co/4gjfNHxk/77aa7c82-3209-46f1-9f46-ce0990611ac8.webp"
            alt="Fibo Logo"
          />
        </div>
        <div className="sidebar__option" onClick={() => navigate("/")}>
          <HomeIcon />
          <span className="span">Home</span>
        </div>
        <div className="sidebar__option" onClick={toggleSearch}>
          <SearchIcon />
          <span className="span">Search</span>
        </div>
        <div className="sidebar__option" onClick={() => navigate("/explore")}>
          <ExploreIcon />
          <span className="span">Explore</span>
        </div>
        <div className="sidebar__option" onClick={() => navigate("/reels")}>
          <MovieIcon />
          <span className="span">Reels</span>
        </div>
        <div className="sidebar__option" onClick={() => navigate("/message")}>
          <MessageIcon />
          <span className="span">Messages</span>
        </div>
        <div className="sidebar__option">
          <NotificationsIcon />
          <span className="span">Notifications</span>
        </div>
        <div className="sidebar__option">
          <AddBoxIcon />
          <span className="span">Create</span>
        </div>
        <div className="sidebar__option" onClick={() => navigate("/profile")}>
          <AccountCircleIcon />
          <span className="span">Profile</span>
        </div>
        <div className="sidebar__option">
          <SmartToyIcon />
          <span className="span">AI Studio</span>
        </div>
        <div className="sidebar__option">
          <ForumIcon />
          <span className="span">Threads</span>
        </div>
        <div
          className="sidebar__option more-option"
          onClick={toggleMore}
          ref={moreRef}
        >
          <MoreHorizIcon />
          <span className="span">More</span>
          {isMoreOpen && (
            <div className="more-dropdown">
              <div className="more-dropdown__option">
                <SettingsIcon />
                <span>Settings</span>
              </div>
              <div className="more-dropdown__option">
                <ActivityIcon />
                <span>Your activity</span>
              </div>
              <div className="more-dropdown__option">
                <BookmarkIcon />
                <span>Saved</span>
              </div>
              <div className="more-dropdown__option">
                <AppearanceIcon />
                <span>Switch appearance</span>
              </div>
              <div className="more-dropdown__option">
                <ReportIcon />
                <span>Report a problem</span>
              </div>
              <div className="more-dropdown__option">
                <SwitchAccountIcon />
                <span>Switch accounts</span>
              </div>
              <div className="more-dropdown__option">
                <LogoutIcon />
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {isSearchOpen && (
        <div
          className="search-panel"
          ref={searchRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="search">
            <h2>Search</h2>
            <input
              type="text"
              placeholder="Search"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="search-panel__recent">
              <h3>Recent</h3>
              <p>No recent searches.</p>
            </div>
          </div>
        </div>
      )}
      <div className="Content">
        {/* <div className="content">{renderContent()}</div> */}
      </div>
    </div>
  );
}

export default Home;
