import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ActivitiesLogs.css";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Logged-in role:", payload.role);
        const res = await axios.get("http://localhost:5000/api/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log(res);
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="logs-container">
      <h2>Activity Logs</h2>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Description</th>
            <th>Performed By</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>
                <span
                  style={{
                    color:
                      log.action === "create"
                        ? "green"
                        : log.action === "update"
                        ? "orange"
                        : log.action === "delete"
                        ? "red"
                        : "black",
                    fontWeight: "bold",
                  }}
                >
                  {log.action.toUpperCase()}
                </span>{" "}
              </td>
              <td>{log.description}</td>
              <td>{log.userId?.username || "N/A"}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogs;
