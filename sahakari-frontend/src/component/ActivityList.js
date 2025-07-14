// src/components/ActivityList.js
import React from "react";
import axios from "axios";

const ActivityList = ({ activities, fetchActivities, setSelectedActivity }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Delete this activity?")) {
      await axios.delete(`http://localhost:5000/api/activities/${id}`);
      fetchActivities();
    }
  };

  return (
    <div>
      <h3>📋 Activity List</h3>
      {activities.length === 0 ? (
        <p>No activities found.</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity._id}>
              <strong>{activity.activityName}</strong> - {activity.fullName},{" "}
              {activity.age}, {activity.phoneNumber}
              <button onClick={() => setSelectedActivity(activity)}>
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(activity._id)}>
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityList;
