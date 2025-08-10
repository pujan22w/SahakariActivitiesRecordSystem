import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./CreateActivites.css";
const CreateMasterActivityForm = () => {
  const [activityName, setActivityName] = useState("");

  const handleCreateActivity = async () => {
    if (!activityName) return toast.error("Enter activity name");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/master-activities",
        { activityName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Master Activity Created");
      setActivityName("");
    } catch (err) {
      toast.error("❌ " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="create-master-activity-form">
      <h3>Create Activity</h3>
      <input
        placeholder="Activity Name"
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
      />
      <button onClick={handleCreateActivity}>Create</button>
    </div>
  );
};

export default CreateMasterActivityForm;
