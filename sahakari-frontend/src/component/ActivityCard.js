import "./ActivityCard.css";

const ActivityCard = ({ title, children, onClick }) => {
  return (
    <div className="activity-card" onClick={onClick}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};
export default ActivityCard;
