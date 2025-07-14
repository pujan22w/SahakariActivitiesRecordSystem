import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AllData.css";

const AllData = () => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllParticipants();
  }, []);

  const fetchAllParticipants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/activities");
      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  };

  // Filter participants based on searchTerm (case insensitive, on fullName)
  const filteredParticipants = participants.filter((p) =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="all-data-container">
      <h2>All Participants</h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search participants by full name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
        aria-label="Search participants"
      />

      {filteredParticipants.length === 0 ? (
        <p>No participants found.</p>
      ) : (
        <table className="participants-table">
          <thead>
            <tr>
              <th>Activity Name</th>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Membership No.</th>
              <th>Address</th>
              <th>By Whom </th>
              <th>Date</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map((p) => (
              <tr key={p._id}>
                <td>{p.activityName}</td>
                <td>{p.fullName}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.membershipNumber || "-"}</td>
                <td>{p.address || "-"}</td>
                <td>{p.byWhom || "-"} </td>
                <td>{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                <td>{p.phoneNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllData;
