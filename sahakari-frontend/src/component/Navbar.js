import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Navbar.css";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Decode token to get username
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUsername(payload.username || "User");
        } catch {
          setUsername("User");
        }
      }
    } else {
      setUsername("");
      setShowLogout(false);
    }
  }, [isAuthenticated]);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logout Successfull");
    setIsAuthenticated(false);
    setShowLogout(false);
    setMenuOpen(false);
    navigate("/"); // or navigate("/login")
  };

  // Close logout dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogout(false);
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
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Add Data
          </Link>
        </li>
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
