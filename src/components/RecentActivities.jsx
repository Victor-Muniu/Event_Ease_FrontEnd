import React from "react";

const RecentActivities = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "create":
        return "📝";
      case "confirm":
        return "✅";
      case "pending":
        return "⏳";
      case "update":
        return "🔄";
      default:
        return "•";
    }
  };

  return (
    <div className="activities-section">
      <h2>Recent Activities</h2>
      <div className="activities-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">{getActivityIcon(activity.type)}</div>
            <div className="activity-content">
              <p>{activity.title}</p>
              <span>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .activities-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .activities-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1.5rem 0;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .activity-icon {
          background: #f8fafc;
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 1rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          font-size: 0.875rem;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .activity-content span {
          font-size: 0.75rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default RecentActivities;
