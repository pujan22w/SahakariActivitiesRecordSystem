import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import AllData from "./component/AllData";
import ActivitiesList from "./component/ActivitiesList";
import Statistics from "./component/Statistics";
import ActivityForm from "./component/ActivityForm";
import { ToastContainer } from "react-toastify";
import ReportSummary from "./component/ReportSummary";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Login from "./component/Login";
function App() {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State to hold selected activity for editing
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Fetch all activities from backend
  const fetchActivities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/activities");
      setActivities(res.data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };
  useEffect(() => {
    fetchActivities();
  }, []);
  return (
    <>
      <Router>
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ActivityForm
                  selectedActivity={selectedActivity}
                  setSelectedActivity={setSelectedActivity}
                  fetchActivities={fetchActivities}
                />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route
            path="/alldata"
            element={
              isAuthenticated ? (
                <AllData />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route
            path="/activities"
            element={
              isAuthenticated ? (
                <ActivitiesList />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route
            path="/statistics"
            element={
              isAuthenticated ? (
                <Statistics />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route
            path="/report-summary"
            element={
              isAuthenticated ? (
                <ReportSummary />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
        </Routes>
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        closeOnClick={true}
        pauseOnHover={false}
        draggable={false}
        closeButton={false}
        icon={false}
        theme="colored"
      />
    </>
  );
}

export default App;
