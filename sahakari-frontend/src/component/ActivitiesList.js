import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ActivitiesList.css";

const ActivitiesList = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(null);
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
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/activities");
      const grouped = res.data.reduce((acc, curr) => {
        if (!acc[curr.activityName]) acc[curr.activityName] = [];
        acc[curr.activityName].push(curr);
        return acc;
      }, {});
      const groupedArr = Object.entries(grouped).map(
        ([activityName, participants]) => ({
          activityName,
          participants,
        })
      );
      setActivities(groupedArr);
      if (selectedActivity) {
        const updated = groupedArr.find(
          (a) => a.activityName === selectedActivity.activityName
        );
        setSelectedActivity(updated || null);
      }
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
      {/* Activities List */}
      <div className="activities-cards-list">
        <h2>Activities</h2>
        {activities.length === 0 && <p>No activities found...</p>}
        {activities.map((activity) => (
          <div
            key={activity.activityName}
            className={`activity-card ${
              selectedActivity?.activityName === activity.activityName
                ? "selected"
                : ""
            }`}
            onClick={() => setSelectedActivity(activity)}
          >
            <h3>{activity.activityName}</h3>
            <p>
              Participants: <strong>{activity.participants.length}</strong>
            </p>
          </div>
        ))}
      </div>

      {/* Participant Details */}
      <div className="activity-details-panel">
        {!selectedActivity ? (
          <p>Select an activity to view participants</p>
        ) : editingParticipant ? (
          // Edit Form
          <div className="edit-form-container">
            <button className="back-button" onClick={cancelEdit}>
              ← Cancel Edit
            </button>
            <h2>Edit Participant</h2>
            <form onSubmit={handleUpdate} className="edit-form">
              <label>
                Full Name:
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Age:
                <input
                  type="number"
                  name="age"
                  min="0"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </label>
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
              <label>
                Membership Number:
                <input
                  type="text"
                  name="membershipNumber"
                  value={formData.membershipNumber}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Address:
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                By Whom:
                <input
                  type="text"
                  name="byWhom"
                  value={formData.byWhom}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Date:
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Phone Number:
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
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
            <h2>{selectedActivity.activityName} - Participants</h2>
            <div className="participants-cards-container">
              {selectedActivity.participants.length === 0 ? (
                <p>No participants found.</p>
              ) : (
                selectedActivity.participants.map((p) => (
                  <div key={p._id} className="participant-card">
                    <h3>{p.fullName}</h3>
                    <p>
                      <strong>Gender:</strong> {p.gender}
                    </p>
                    <p>
                      <strong>Age:</strong> {p.age}
                    </p>
                    <p>
                      <strong>Membership No.:</strong>{" "}
                      {p.membershipNumber || "-"}
                    </p>
                    <p>
                      <strong>Address:</strong> {p.address || "-"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {p.date ? new Date(p.date).toLocaleDateString() : "-"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {p.phoneNumber || "-"}
                    </p>
                    <p>
                      <strong>By Whom:</strong> {p.byWhom || "-"}
                    </p>
                    <div className="btn-group">
                      <button
                        className="edit-btn"
                        onClick={() => startEdit(p)}
                        aria-label={`Edit ${p.fullName}`}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p._id)}
                        aria-label={`Delete ${p.fullName}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivitiesList;
