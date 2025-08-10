import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Navbar.css";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const createDropdownRef = useRef(null);
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  console.log(notificationCount);
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (role !== "admin" && isAuthenticated) {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            "http://localhost:5000/api/notifications/unread-count",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setNotificationCount(res.data.count || 0);
        } catch (err) {
          console.error("Error fetching notification count", err);
        }
      }
    };
    fetchNotificationCount();
  }, [isAuthenticated, role]);

  const handleNotificationClick = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/notifications/mark-as-read",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotificationCount(0);
      setMenuOpen(false);
      navigate("/branch-notifications");
    } catch (err) {
      console.error("Error marking notifications as read", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUsername(payload.username || "User");
          setRole(payload.role || "branch");
          // console.log(payload);
        } catch {
          setUsername("User");
        }
      }
    } else {
      setUsername("");
      setRole("");
      setShowLogout(false);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logout Successful");
    setIsAuthenticated(false);
    setShowLogout(false);
    setMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogout(false);
      }
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target)
      ) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">Sahakari Activities</div>

      <div className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
        {isAuthenticated && (
          <>
            {role != "admin" && (
              <li>
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  Add Data
                </Link>
              </li>
            )}
            <li>
              <Link to="/alldata" onClick={() => setMenuOpen(false)}>
                All Data
              </Link>
            </li>
            <li>
              <Link to="/activities" onClick={() => setMenuOpen(false)}>
                Activities List
              </Link>
            </li>
            {role !== "admin" && (
              <li>
                <Link
                  to="/branch-notifications"
                  onClick={handleNotificationClick}
                  style={{ position: "relative" }}
                >
                  Notification
                  {notificationCount > 0 && (
                    <span className="notification-badge">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
            )}

            {role === "admin" && (
              <>
                <li>
                  <Link to="/statistics" onClick={() => setMenuOpen(false)}>
                    Statistics
                  </Link>
                </li>
                <li>
                  <Link to="/report-summary" onClick={() => setMenuOpen(false)}>
                    Report Summary
                  </Link>
                </li>
                <li>
                  <Link to="/activity-logs" onClick={() => setMenuOpen(false)}>
                    Activity Logs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin-send-notification"
                    onClick={() => setMenuOpen(false)}
                  >
                    Send Notification
                  </Link>
                </li>
                <li ref={createDropdownRef} className="create-dropdown">
                  <span
                    className="create-link"
                    onClick={() => setCreateMenuOpen(!createMenuOpen)}
                  >
                    Create ▼
                  </span>
                  {createMenuOpen && (
                    <div className="create-dropdown-menu">
                      <Link
                        to="/register-user"
                        onClick={() => setMenuOpen(false)}
                      >
                        Register User
                      </Link>
                      <Link
                        to="/create-master-activity"
                        onClick={() => setMenuOpen(false)}
                      >
                        Create Activity
                      </Link>
                    </div>
                  )}
                </li>
              </>
            )}
          </>
        )}

        <li ref={dropdownRef} className="user-dropdown">
          {!isAuthenticated ? (
            <Link
              to="/"
              className="login-link"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          ) : (
            <>
              <span
                className="username"
                onClick={() => setShowLogout(!showLogout)}
              >
                Hi, {username} ▼
              </span>
              {showLogout && (
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              )}
            </>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
