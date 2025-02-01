import React from "react";

const MetricCard = ({ title, value, icon }) => {
  return (
    <div className="metric-card">
      <div className="metric-content">
        <p className="metric-title">{title}</p>
        <h3 className="metric-value">{value}</h3>
      </div>
      <div className="metric-icon">{icon}</div>

      <style jsx>{`
        .metric-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .metric-content {
          flex: 1;
        }

        .metric-title {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0 0 0.5rem 0;
        }

        .metric-value {
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .metric-icon {
          color: #64748b;
          background: #f8fafc;
          padding: 0.5rem;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default MetricCard;
