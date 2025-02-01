import React from "react";

const RecentMessages = ({ messages }) => {
  return (
    <div className="messages-section">
      <div className="section-header">
        <h2>Recent Messages</h2>
        <a href="#" className="view-all">
          View All
        </a>
      </div>
      <div className="messages-list">
        {messages.map((message) => (
          <div key={message.id} className="message-item">
            <img
              src={message.avatar || "/placeholder.svg"}
              alt={message.name}
              className="avatar"
            />
            <div className="message-content">
              <div className="message-header">
                <h3>{message.name}</h3>
                <span>{message.time}</span>
              </div>
              <p>{message.message}</p>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .messages-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
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

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .message-item:hover {
          background-color: #f8fafc;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .message-content {
          flex: 1;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .message-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .message-header span {
          font-size: 0.75rem;
          color: #64748b;
        }

        .message-content p {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default RecentMessages;
