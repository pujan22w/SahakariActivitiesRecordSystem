import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Notification.css";
const AdminSendNotification = () => {
  const [branches, setBranches] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data);
    };
    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/notifications",
        {
          title,
          message,
          targetBranches: selectedBranches,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Notification sent successfully!");
      setTitle("");
      setMessage("");
      setSelectedBranches([]);
    } catch (err) {
      toast.error("❌ Failed to send notification");
      console.error(err);
    }
  };

  const toggleBranchSelection = (id) => {
    setSelectedBranches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="admin-send-notification">
      <h2>Send Notification to Branches</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          placeholder="Notification Title"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          value={message}
          placeholder="Notification Message"
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <h4>Select Branches (Leave empty for all)</h4>
        <div className="branches-list">
          {branches.map((b) => (
            <label key={b._id}>
              <input
                type="checkbox"
                checked={selectedBranches.includes(b._id)}
                onChange={() => toggleBranchSelection(b._id)}
              />
              {b.username}
            </label>
          ))}
        </div>
        <button type="submit">Send Notification</button>
      </form>
    </div>
  );
};

export default AdminSendNotification;
