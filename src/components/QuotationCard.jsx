import React, {useState} from "react";

import CreateEventForm from "../pages/CreateEventForm";
const QuotationCard = ({ notification, onClose }) => {
    const [showCreateEvent, setShowCreateEvent] = useState(false)
  return (
    <div className="quotation-overlay">
      <div className="quotation-card">
        <div className="quotation-header">
          <h2>Event Quotation</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="quotation-content">
          <div className="quotation-meta">
            <p>
              Quotation Number: <span>{notification.quotationNumber}</span>
            </p>
            <p>
              Responded By: <span>{notification.respondedBy.fname} {notification.respondedBy.lname}</span>
            </p>
            <div className="status-badge">Approved</div>
          </div>

          <div className="quotation-details">
            <div className="detail-row">
              <label>Event Name</label>
              <span>{notification.eventRequest.eventName}</span>
            </div>

            <div className="detail-row">
              <label>Event Description</label>
              <span>{notification.eventRequest.eventDescription}</span>
            </div>

            <div className="detail-row">
              <label>Event Dates</label>
              <span>
                {new Date(notification.eventRequest.eventDates[0]).toLocaleDateString()} -{" "}
                {new Date(notification.eventRequest.eventDates[1]).toLocaleDateString()}
              </span>
            </div>

            <div className="detail-row">
              <label>Expected Attendance</label>
              <span>{notification.eventRequest.expectedAttendance} attendees</span>
            </div>

            <div className="detail-row">
              <label>Request Date</label>
              <span>{new Date(notification.requestDate).toLocaleDateString()}</span>
            </div>

            <div className="detail-row">
              <label>Created At</label>
              <span>{new Date(notification.createdAt).toLocaleString()}</span>
            </div>

            <div className="detail-row">
              <label>Updated At</label>
              <span>{new Date(notification.updatedAt).toLocaleString()}</span>
            </div>

            <div className="price-section">
              <label>Total Price</label>
              <span className="price">KSH {notification.totalPrice}</span>
            </div>
          </div>

          <button className="view-full-btn" onClick={() => setShowCreateEvent(true)}>Create an Event</button>
        </div>
      </div>
      {showCreateEvent && (
        <CreateEventForm
          quotationId={notification._id}
          onClose={() => setShowCreateEvent(false)}
        />
      )}
      <style jsx>{`
        .quotation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .quotation-card {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .quotation-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quotation-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
        }

        .quotation-content {
          padding: 1.5rem;
        }

        .quotation-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .quotation-meta p {
          margin: 0;
          color: #64748b;
        }

        .quotation-meta span {
          color: #1e293b;
          font-weight: 500;
        }

        .status-badge {
          background:rgb(125, 208, 99);
          color:rgb(255, 255, 255);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .quotation-details {
          display: grid;
          gap: 1.5rem;
        }

        .detail-row {
          display: grid;
          gap: 0.5rem;
        }

        .detail-row label {
          color: #64748b;
          font-size: 0.875rem;
        }

        .detail-row span {
          color: #1e293b;
          font-weight: 500;
        }

        .price-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-section label {
          color: #64748b;
          font-size: 0.875rem;
        }

        .price {
          color: #059669;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .view-full-btn {
          display: block;
          width: 100%;
          padding: 0.75rem;
          margin-top: 2rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .view-full-btn:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default QuotationCard;
