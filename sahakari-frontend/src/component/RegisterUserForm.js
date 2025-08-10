import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./RegisterUser.css";
const RegisterUserForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !password) return toast.error("Fill all fields");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { username, password, role: "branch" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Branch User Registered");
      setUsername("");
      setPassword("");
    } catch (err) {
      toast.error("❌ " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="register-user-form ">
      <h3>Register Branch User</h3>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegisterUserForm;
