import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { toast } from "react-toastify";

const Login = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      const token = res.data.token;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "admin") {
        navigate("/alldata");
      } else {
        navigate("/");
      }

      toast.success("Login Successfull");
    } catch (err) {
      toast.error("Invalid username or password");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={form.username}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
