import { useEffect, useState } from "react";

import axios from "axios";

import {
  FiBell,
  FiChevronDown,
  FiMenu,
  FiSearch,
} from "react-icons/fi";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const Topbar = ({ onMenuClick }) => {
  const { admin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] =
    useState(0);

  const adminName =
    admin?.name || "Admin";

  const firstLetter =
    adminName
      .charAt(0)
      .toUpperCase();

  const fetchUnreadCount = async () => {
    try {
      const response =
        await api.get(
          "/api/notifications"
        );

      if (response.data.success) {
        setUnreadCount(
          response.data.unreadCount || 0
        );
      }
    } catch (error) {
      console.error(
        "Notification Count Error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(
      fetchUnreadCount,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [location.pathname]);

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-mobile-menu"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

        <div className="topbar-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search anything..."
          />

          <span>⌘ K</span>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="topbar-notification"
          onClick={
            handleNotificationClick
          }
          aria-label="Open notifications"
          title="Notifications"
        >
          <FiBell />

          {unreadCount > 0 && (
            <span className="topbar-notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        <div className="topbar-divider"></div>

        <button
          type="button"
          className="topbar-profile"
          onClick={handleProfileClick}
          aria-label="Admin profile"
        >
          <div className="topbar-avatar">
            {firstLetter}
          </div>

          <div className="topbar-admin-info">
            <strong>{adminName}</strong>
            <span>Administrator</span>
          </div>

          <FiChevronDown className="topbar-chevron" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;