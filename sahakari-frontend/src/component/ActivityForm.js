import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ActivityForm.css";
import Select from "react-select";
const ActivityForm = ({
  fetchActivities,
  selectedActivity,
  setSelectedActivity,
}) => {
  const [masterActivities, setMasterActivities] = useState([]);
  const [formData, setFormData] = useState({
    masterActivityId: "",
    fullName: "",
    age: "",
    gender: "",
    address: "",
    membershipNumber: "",
    phoneNumber: "",
    date: "",
    byWhom: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (selectedActivity) {
      setFormData({
        masterActivityId: selectedActivity.masterActivityId || "",
        fullName: selectedActivity.fullName || "",
        age: selectedActivity.age || "",
        gender: selectedActivity.gender || "",
        address: selectedActivity.address || "",
        membershipNumber: selectedActivity.membershipNumber || "",
        phoneNumber: selectedActivity.phoneNumber || "",
        date: selectedActivity.date ? selectedActivity.date.split("T")[0] : "",
        byWhom: selectedActivity.byWhom || "",
      });
    }
  }, [selectedActivity]);

  useEffect(() => {
    const fetchMasterActivities = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/master-activities",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // console.log(res);
        setMasterActivities(res.data);
      } catch (err) {
        console.error("Error fetching master activities", err);
        toast.error("❌ Failed to load activities list");
      }
    };
    fetchMasterActivities();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber.length !== 10) {
      toast.error("❌ Phone number must be exactly 10 digits!");
      return;
    }
    if (!formData.masterActivityId) {
      toast.error("❌ Please select an activity");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const url = selectedActivity?._id
        ? `http://localhost:5000/api/activities/${selectedActivity._id}`
        : "http://localhost:5000/api/activities";

      if (selectedActivity?._id) {
        await axios.put(url, formData, config);
        toast.success("✅ Activity updated!");
      } else {
        await axios.post(url, formData, config);
        toast.success("✅ Activity created!");
      }

      setFormData({
        masterActivityId: "",
        fullName: "",
        age: "",
        gender: "",
        address: "",
        membershipNumber: "",
        phoneNumber: "",
        date: "",
        byWhom: "",
      });
      setSelectedActivity(null);
      fetchActivities();
    } catch (err) {
      toast.error("❌ " + (err.response?.data?.message || err.message));
    }
  };
  const activityOptions = masterActivities.map((a) => ({
    value: a._id,
    label: a.activityName,
  }));

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>{selectedActivity ? "Edit Activity" : "Add New Activity"}</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="masterActivityId">Select Activity</label>
          <Select
            id="masterActivityId"
            className="activity-input"
            name="masterActivityId"
            value={masterActivities.find(
              (a) => a._id === formData.masterActivityId
            )}
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                masterActivityId: selected ? selected._id : "",
              }))
            }
            options={masterActivities}
            getOptionLabel={(a) => a.activityName}
            getOptionValue={(a) => a._id}
            placeholder="Select or Search Activity"
            isClearable
          />
        </div>

        {[
          { label: "Full Name", name: "fullName", type: "text" },
          { label: "Age", name: "age", type: "number" },
          { label: "Gender", name: "gender", type: "text" },
          { label: "Address", name: "address", type: "text" },
          {
            label: "Membership Number",
            name: "membershipNumber",
            type: "text",
          },
          { label: "Phone Number", name: "phoneNumber", type: "tel" },
          { label: "Date (BS)", name: "date", type: "date" },
          { label: "By Whom", name: "byWhom", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name} className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
              id={name}
              type={type}
              name={name}
              className="activity-input"
              value={formData[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
      </div>
      <button className="submit-btn" type="submit">
        {selectedActivity ? "Update" : "Submit"}
      </button>
    </form>
  );
};

export default ActivityForm;
