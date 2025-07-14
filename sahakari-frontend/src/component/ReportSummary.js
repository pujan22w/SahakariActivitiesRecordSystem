import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ReportSummary.css";

const ReportSummary = () => {
  const [year, setYear] = useState();
  const [summary, setSummary] = useState(null);
  const [participants, setParticipants] = useState([]);

  // Fetch summary data for selected year
  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/activities/report-summary?year=${year}`
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      toast.error("Failed to fetch summary");
    }
  };

  // Fetch participants list for selected year
  const fetchParticipants = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/activities?date_gte=${year}-01-01&date_lt=${
          Number(year) + 1
        }-01-01`
      );
      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching participants:", err);
      toast.error("Failed to fetch participants");
    }
  };

  // Fetch both summary and participants when year changes
  useEffect(() => {
    fetchSummary();
    fetchParticipants();
  }, [year]);

  const exportToPDF = () => {
    if (!summary) {
      toast.error("No summary data to generate PDF");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Activity Report Summary - Year ${summary.year}`, 14, 20);

    // Summary info
    doc.setFontSize(12);
    doc.text(`Total Activities: ${summary.totalActivities}`, 14, 30);
    doc.text(`Total Participants: ${summary.totalParticipants}`, 14, 38);

    // Activity summary table
    const activityColumns = ["Activity Name", "Participants"];
    const activityRows = summary.activityBreakdown?.map((act) => [
      act.activityName,
      act.participants.toString(),
    ]);

    doc.autoTable({
      startY: 45,
      head: [activityColumns],
      body: activityRows,
      theme: "grid",
    });
    const filteredParticipants = participants.filter((p) => {
      const activityDate = new Date(p.date);
      return activityDate.getFullYear().toString() === year.toString();
    });

    // After activity table, add participants details
    let finalY = doc.lastAutoTable?.finalY + 10;
    doc.setFontSize(16);
    doc.text("Participants Detail", 14, finalY);

    // Participants detail table columns
    const participantColumns = [
      "Full Name",
      "Membership No.",
      "Activity Name",
      "By Whom",
      "Date",
      "Phone",
    ];

    // Format participant data rows
    const participantRows = filteredParticipants.map((p) => [
      p.fullName || "-",
      p.membershipNumber || "-",
      p.activityName || "-",
      p.byWhom || "-",
      p.date ? new Date(p.date).toLocaleDateString() : "-",
      p.phoneNumber || "-",
    ]);

    doc.autoTable({
      startY: finalY + 20,
      head: [participantColumns],
      body: participantRows,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 14, right: 14 },
      pageBreak: "auto",
    });

    doc.save(`Activity_Report_${year}.pdf`);
  };

  return (
    <div className="report-summary-container">
      <div className="report-summary-box">
        <h2 className="report-summary-heading2">Report Summary</h2>

        <label className="report-summary-label" htmlFor="year">
          Select Year:
        </label>
        <input
          className="report-summary-input-number"
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Enter year"
          min="1900"
          max="2100"
        />
        <button className="report-summary-button" onClick={fetchSummary}>
          Fetch Report
        </button>
        <button
          className="report-summary-button report-summary-button-pdf"
          onClick={exportToPDF}
          disabled={!summary}
          style={{ marginLeft: "12px" }}
        >
          Export to PDF
        </button>

        <hr className="report-summary-hr" />

        {summary ? (
          <>
            <h3 className="report-summary-heading3">Summary</h3>
            <p>Total Activities: {summary.totalActivities}</p>
            <p>Total Participants: {summary.totalParticipants}</p>

            <h4 className="report-summary-heading4">Activity Breakdown</h4>
            <table className="report-summary-table">
              <thead>
                <tr className="report-summary-thead-tr">
                  <th className="report-summary-th">Activity Name</th>
                  <th className="report-summary-th">Participants</th>
                </tr>
              </thead>
              <tbody>
                {summary.activityBreakdown &&
                summary.activityBreakdown.length > 0 ? (
                  summary.activityBreakdown.map((item, idx) => (
                    <tr key={idx} className="report-summary-tbody-tr">
                      <td className="report-summary-td">{item.activityName}</td>
                      <td className="report-summary-td">{item.participants}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center" }}>
                      No activity data to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <p>Loading report data...</p>
        )}
      </div>
    </div>
  );
};

export default ReportSummary;
