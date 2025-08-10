import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ActivitiesList.css";

const ActivitiesList = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [branches, setBranches] = useState([]);
  const [masterActivities, setMasterActivities] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    membershipNumber: "",
    address: "",
    date: "",
    phoneNumber: "",
    byWhom: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role || "");
      } catch {
        setUserRole("");
      }
    }
  }, []);

  useEffect(() => {
    if (userRole === "admin") {
      fetchBranches();
      fetchMasterActivities();
    }
  }, [userRole]);

  useEffect(() => {
    fetchActivities();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  const fetchMasterActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/master-activities",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMasterActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch master activities", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = selectedBranch ? { branchId: selectedBranch } : {};
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/activities", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      const grouped = res.data.reduce((acc, curr) => {
        const key = curr.masterActivityId?._id || "Unknown Activity";
        if (!acc[key])
          acc[key] = {
            masterActivity: curr.masterActivityId,
            participants: [],
          };
        acc[key].participants.push(curr);
        return acc;
      }, {});

      setActivities(Object.values(grouped));
      setSelectedActivity(null);
    } catch (err) {
      toast.error("❌ Failed to fetch activities");
      console.error("Error fetching activities:", err);
    }
  };

  const startEdit = (participant) => {
    setEditingParticipant(participant);
    setFormData({
      fullName: participant.fullName || "",
      age: participant.age || "",
      gender: participant.gender || "",
      membershipNumber: participant.membershipNumber || "",
      address: participant.address || "",
      date:
        participant.date || ""
          ? new Date(participant.date).toISOString().substring(0, 10)
          : "",
      phoneNumber: participant.phoneNumber || "",
      byWhom: participant.byWhom || "",
    });
  };

  const cancelEdit = () => {
    setEditingParticipant(null);
    setFormData({
      fullName: "",
      age: "",
      gender: "",
      membershipNumber: "",
      address: "",
      date: "",
      phoneNumber: "",
      byWhom: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/activities/${editingParticipant._id}`,
        formData
      );
      toast.success("✅ Participant updated successfully!");
      cancelEdit();
      fetchActivities();
    } catch (error) {
      toast.error("❌ Update failed. Try again.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this participant?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/activities/${id}`);
      toast.success("✅ Participant deleted successfully!");
      fetchActivities();
    } catch (error) {
      toast.error("❌ Delete failed. Try again.");
      console.error(error);
    }
  };

  return (
    <div className="activities-page-container">
      {userRole === "admin" && (
        <div className="branch-filter-container">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="branch-select"
          >
            <option value="">-- Show All Branches --</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.username}
              </option>
            ))}
          </select>
          <button className="filter-btn" onClick={fetchActivities}>
            🔍 Filter Activities
          </button>
        </div>
      )}

      <div className="activities-cards-list">
        <h2>Activities</h2>
        {activities.length === 0 && <p>No activities found...</p>}
        {activities.map((activity, idx) => (
          <div
            key={idx}
            className={`activity-card ${
              selectedActivity === activity ? "selected" : ""
            }`}
            onClick={() => setSelectedActivity(activity)}
          >
            <h3>
              {activity.masterActivity?.activityName || "Unknown Activity"}
            </h3>
            <p>
              Participants: <strong>{activity.participants.length}</strong>
            </p>
          </div>
        ))}
      </div>

      <div className="activity-details-panel">
        {!selectedActivity ? (
          <p>Select an activity to view participants</p>
        ) : editingParticipant ? (
          <div className="edit-form-container">
            <button className="back-button" onClick={cancelEdit}>
              ← Cancel Edit
            </button>
            <h2>Edit Participant</h2>
            <form onSubmit={handleUpdate} className="edit-form">
              {[
                "fullName",
                "age",
                "membershipNumber",
                "address",
                "byWhom",
                "date",
                "phoneNumber",
              ].map((field) => (
                <label key={field}>
                  {field.replace(/([A-Z])/g, " $1").toUpperCase()}:
                  <input
                    type={
                      field === "date"
                        ? "date"
                        : field === "age"
                        ? "number"
                        : "text"
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required={["fullName", "age"].includes(field)}
                  />
                </label>
              ))}
              <label>
                Gender:
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </form>
          </div>
        ) : (
          <>
            <button
              className="back-button"
              onClick={() => setSelectedActivity(null)}
            >
              ← Back to Activities
            </button>
            <h2>
              {selectedActivity.masterActivity?.activityName ||
                "Unknown Activity"}{" "}
              - Participants
            </h2>
            <div className="participants-table-container">
              {selectedActivity.participants.length === 0 ? (
                <p>No participants found.</p>
              ) : (
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Membership No.</th>
                      <th>Address</th>
                      <th>Date</th>
                      <th>Phone</th>
                      <th>By Whom</th>
                      {userRole === "admin" && <th>Branch</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedActivity.participants.map((p) => (
                      <tr key={p._id}>
                        <td>{p.fullName}</td>
                        <td>{p.gender}</td>
                        <td>{p.age}</td>
                        <td>{p.membershipNumber || "-"}</td>
                        <td>{p.address || "-"}</td>
                        <td>
                          {p.date ? new Date(p.date).toLocaleDateString() : "-"}
                        </td>
                        <td>{p.phoneNumber || "-"}</td>
                        <td>{p.byWhom || "-"}</td>
                        {userRole === "admin" && (
                          <td>{p.branchId?.username || "-"}</td>
                        )}
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => startEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(p._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivitiesList;
