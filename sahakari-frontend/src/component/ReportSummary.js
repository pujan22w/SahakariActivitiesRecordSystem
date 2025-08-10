import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ReportSummary.css";

const ReportSummary = () => {
  const [year, setYear] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [summary, setSummary] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [masterActivities, setMasterActivities] = useState([]);
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  const fetchSummary = async () => {
    if (!year) {
      toast.error("Please enter a year");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let query = `year=${year}`;

      if (selectedBranch) query += `&branch=${selectedBranch}`;
      if (selectedActivity) query += `&activity=${selectedActivity}`;

      const res = await axios.get(
        `http://localhost:5000/api/activities/report-summary?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      toast.error("Failed to fetch summary");
    }
  };

  const fetchParticipants = async () => {
    if (!year) return;
    try {
      const token = localStorage.getItem("token");
      let query = `date_gte=${year}-01-01&date_lt=${Number(year) + 1}-01-01`;

      if (selectedBranch) {
        query += `&branch=${selectedBranch}`;
      }

      if (selectedActivity) {
        query += `&activity=${selectedActivity}`;
      }

      const res = await axios.get(
        `http://localhost:5000/api/activities?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching participants:", err);
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
      console.log(res);
      setMasterActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch master activities", err);
    }
  };
  const handleFetchReport = () => {
    if (!year) {
      toast.error("Please enter a year");
      return;
    }
    setSummary(null);
    setParticipants([]);
    fetchSummary(); // ✅ Fetch summary
    fetchParticipants(); // ✅ Fetch participants together
  };
  useEffect(() => {
    fetchBranches();
    fetchMasterActivities();
  }, []);

  useEffect(() => {
    if (year) {
      setSummary(null);
      setParticipants([]);
      fetchSummary();
      fetchParticipants();
    }
  }, [year, selectedBranch, selectedActivity]);

  const exportToPDF = () => {
    if (!summary) {
      toast.error("No summary data to generate PDF");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Activity Report Summary - ${summary.year}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Branch: ${summary.branch}`, 14, 30);
    doc.text(`Total Activities: ${summary.totalActivities}`, 14, 38);
    doc.text(`Total Participants: ${summary.totalParticipants}`, 14, 46);

    const activityRows = summary.activityBreakdown?.map((act) => [
      act.activityName,
      act.participants.toString(),
    ]);

    doc.autoTable({
      startY: 55,
      head: [["Activity Name", "Participants"]],
      body: activityRows,
      theme: "grid",
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.text("Participants Detail (Grouped by Activity)", 14, finalY);

    // Sort participants by activity name
    const sortedParticipants = [...participants].sort((a, b) => {
      if (!a.masterActivityId || !b.masterActivityId) return 0;
      if (a.masterActivityId.activityName < b.masterActivityId.activityName)
        return -1;
      if (a.masterActivityId.activityName > b.masterActivityId.activityName)
        return 1;
      return 0;
    });

    //  Group participants by activity name and create separate tables per group
    let currentY = finalY + 10;
    let currentActivity = "";

    sortedParticipants.forEach((p, index) => {
      const activityName =
        p.masterActivityId?.activityName || "Unknown Activity";

      if (activityName !== currentActivity) {
        if (index !== 0) currentY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(14);
        doc.text(`Activity: ${activityName}`, 14, currentY);

        currentY += 5;

        const activityGroup = sortedParticipants.filter(
          (part) => part.masterActivityId?.activityName === activityName
        );

        const participantRows = activityGroup.map((part) => [
          part.fullName || "-",
          part.membershipNumber || "-",
          part.byWhom || "-",
          part.date ? new Date(part.date).toLocaleDateString() : "-",
          part.phoneNumber || "-",
        ]);

        doc.autoTable({
          startY: currentY + 5,
          head: [["Full Name", "Membership No.", "By Whom", "Date", "Phone"]],
          body: participantRows,
          theme: "striped",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });

        currentActivity = activityName;
      }
    });

    doc.save(`Activity_Report_${year}_${selectedBranch || "All"}.pdf`);
  };
  console.log(masterActivities);
  return (
    <div className="report-summary-container">
      <div className="report-summary-box">
        <h2 className="report-summary-heading2">Report Summary</h2>

        <div className="filter-group">
          <label>Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Enter year"
          />

          <label>Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b.username}>
                {b.username}
              </option>
            ))}
          </select>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
          >
            <option value="">All Activities</option>
            {masterActivities.map((a) => (
              <option key={a._id} value={a._id}>
                {a.activityName}
              </option>
            ))}
          </select>

          <button onClick={handleFetchReport} className="report-summary-button">
            Fetch Report
          </button>

          <button
            onClick={exportToPDF}
            disabled={!summary}
            className="report-summary-button report-summary-button-pdf"
          >
            Download PDF
          </button>
        </div>

        {summary ? (
          <>
            <div className="summary-info">
              <h3>Summary for {summary.branch}</h3>
              <p>Total Activities: {summary.totalActivities}</p>
              <p>Total Participants: {summary.totalParticipants}</p>

              <h4>Activity Breakdown</h4>
              <table>
                <thead>
                  <tr>
                    <th>Activity Name</th>
                    <th>Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.activityBreakdown.length > 0 ? (
                    summary.activityBreakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.activityName}</td>
                        <td>{item.participants}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: "center" }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>Please enter a year and select branch to see report</p>
        )}
      </div>
    </div>
  );
};

export default ReportSummary;
