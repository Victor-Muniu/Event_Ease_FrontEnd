import React from "react";

const EventsTable = ({ events }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "#22c55e";
      case "Pending":
        return "#f59e0b";
      case "In Progress":
        return "#3b82f6";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="events-table">
      <div className="table-header">
        <h2>Upcoming Events</h2>
        <a href="#" className="view-all">
          View All
        </a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={index}>
              <td>{event.name}</td>
              <td>{event.date}</td>
              <td>{event.location}</td>
              <td>
                <span
                  className="status"
                  style={{ backgroundColor: getStatusColor(event.status) }}
                >
                  {event.status}
                </span>
              </td>
              <td>
                <button className="action-button">•••</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .events-table {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .table-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .view-all {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.875rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 1rem;
          color: #64748b;
          font-weight: 500;
          font-size: 0.875rem;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 1rem;
          color: #1e293b;
          font-size: 0.875rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }

        .action-button {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default EventsTable;
