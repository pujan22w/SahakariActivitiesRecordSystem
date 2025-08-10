import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./Statistics.css";

// Register chart components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Statistics = () => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/activities");
        setParticipants(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Gender stats
  const maleCount = participants.filter(
    (p) => p.gender?.toLowerCase() === "male"
  ).length;
  const femaleCount = participants.filter(
    (p) => p.gender?.toLowerCase() === "female"
  ).length;

  // Age group stats
  const ageGroups = {
    "0-20": 0,
    "21-40": 0,
    "41-60": 0,
    "60+": 0,
  };

  participants.forEach((p) => {
    const age = p.age;
    if (age <= 20) ageGroups["0-20"]++;
    else if (age <= 40) ageGroups["21-40"]++;
    else if (age <= 60) ageGroups["41-60"]++;
    else ageGroups["60+"]++;
  });

  const pieChartData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [maleCount, femaleCount],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(ageGroups),
    datasets: [
      {
        label: "Participants by Age Group",
        data: Object.values(ageGroups),
        backgroundColor: "#4caf50",
      },
    ],
  };

  return (
    <div className="statistics-container">
      <h2>📊 Sahakari Activities Statistics</h2>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Participants</h3>
          <p>{participants.length}</p>
        </div>
        <div className="card">
          <h3>Male</h3>
          <p>{maleCount}</p>
        </div>
        <div className="card">
          <h3>Female</h3>
          <p>{femaleCount}</p>
        </div>
      </div>

      <div className="chart-section">
        <h3>Gender Participation</h3>
        {maleCount + femaleCount > 0 ? (
          <div style={{ width: "400px", height: "400px", margin: "0 auto" }}>
            <Pie data={pieChartData} />
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>

      <div className="chart-section">
        <h3>Age Group Distribution</h3>
        <div style={{ width: "600px", height: "300px", margin: "0 auto" }}>
          <Bar
            data={barChartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
