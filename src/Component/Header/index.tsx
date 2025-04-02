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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Input } from "antd";
import debounce from "lodash/debounce";
import { jwtDecode } from "jwt-decode";
import api from "../../Config/api";

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => {
      if (prev) {
        setSearchQuery(""); // Reset input khi đóng
        setSearchResults([]); // Reset results khi đóng
      }
      return !prev;
    });
  };

  const toggleMore = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  const handleClickOutside = (event: any) => {
    if (moreRef.current && !moreRef.current.contains(event.target)) {
      setIsMoreOpen(false);
    }
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsSearchOpen(false);
      setSearchQuery(""); // Reset input khi click ngoài
      setSearchResults([]); // Reset results khi click ngoài
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lấy lịch sử tìm kiếm từ localStorage khi component mount
  useEffect(() => {
    const storedSearches =
      JSON.parse(localStorage.getItem("recentSearches") || "[]") || [];
    setRecentSearches(storedSearches);
  }, []);

  // Lưu lịch sử tìm kiếm vào localStorage
  const saveRecentSearch = (query: any) => {
    if (!query) return;
    const updatedSearches: any = [
      query,
      ...recentSearches.filter((item) => item !== query),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const fetchSearchResults = async (query: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        const response = await api.get(
          `account/search?keyword=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Search API Response:", response.data);
        // setSearchResults(response.data || []);
        // đảm bảo setSearchResults luôn là một mảng
        setSearchResults(Array.isArray(response.data) ? response.data : []);
        // Lưu query vào lịch sử nếu có kết quả
        if (response.data.length > 0) {
          saveRecentSearch(query);
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
        toast.error("Có lỗi xảy ra khi tìm kiếm");
        setSearchResults([]);
      }
    } else {
      toast.warn("Vui lòng đăng nhập để tìm kiếm");
      navigate("/login");
    }
  };

  const debouncedSearch = debounce((query) => {
    fetchSearchResults(query);
  }, 300);

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Xử lý khi nhấp vào một tài khoản trong kết quả tìm kiếm
  const handleAccountClick = (accountId: string) => {
    navigate(`accountProfile/${accountId}`); // Chuyển hướng đến trang profile với ID tài khoản
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Đăng xuất tài khoản thành công");
    navigate("/login");
  };

  return (
    <div className="header non-selectable">
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
              <div className="more-dropdown__option" onClick={handleLogout}>
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
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="search-panel__results">
              {searchQuery && searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(
                    (
                      result: {
                        id: string;
                        fullName?: string;
                        username?: string;
                        image?: string;
                      },
                      index
                    ) => (
                      <li
                        key={index}
                        className="search-result-item"
                        onClick={() => handleAccountClick(result.id)} // Chuyển hướng khi nhấp
                      >
                        <img
                          src={
                            result.image ||
                            "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                          }
                          alt="Avatar"
                          className="search-result-avatar"
                        />
                        <div className="search-result-info">
                          <span className="search-result-name">
                            {result.fullName || result.username || "Người dùng"}
                          </span>
                          <span className="search-result-status">Bạn bè</span>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <div className="search-panel__recent">
                  <h3>Recent</h3>
                  {recentSearches.length > 0 ? (
                    <ul>
                      {recentSearches.map((search, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setSearchQuery(search);
                            fetchSearchResults(search);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {search}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No recent searches.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
