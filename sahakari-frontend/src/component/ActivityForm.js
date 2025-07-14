import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ActivityForm.css";

const ActivityForm = ({
  fetchActivities,
  selectedActivity,
  setSelectedActivity,
}) => {
  const [formData, setFormData] = useState({
    activityName: "",
    fullName: "",
    age: "",
    gender: "",
    address: "",
    membershipNumber: "",
    phoneNumber: "",
    date: "", // input as yyyy-mm-dd
    byWhom: "",
  });

  useEffect(() => {
    if (selectedActivity) {
      setFormData({
        ...selectedActivity,
        date: selectedActivity.date?.split("T")[0] || "", // format for input type="date"
      });
    }
  }, [selectedActivity]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber.length !== 10) {
      toast.error("❌ Phone number must be exactly 10 digits!");
      return;
    }
    try {
      const url = selectedActivity?._id
        ? `http://localhost:5000/api/activities/${selectedActivity._id}`
        : "http://localhost:5000/api/activities";

      if (selectedActivity?._id) {
        await axios.put(url, formData);
        toast.success("✅ Activity updated!");
      } else {
        await axios.post(url, formData);
        toast.success("✅ Activity created!");
      }

      setFormData({
        activityName: "",
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
      toast.error("❌ " + err.message);
    }
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>{selectedActivity ? "Edit Activity" : "Add New Activity"}</h2>
      <div className="form-grid">
        {[
          { label: "Activity Name", name: "activityName", type: "text" },
          { label: "Full Name", name: "fullName", type: "text" },
          { label: "Age", name: "age", type: "number" },
          { label: "Gender", name: "gender", type: "text" },
          { label: "Address", name: "address", type: "text" },
          {
            label: "Membership Number",
            name: "membershipNumber",
            type: "text",
          },
          {
            label: "Phone Number",
            name: "phoneNumber",
            type: "tel",
            maxLength: 10,
          },
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
