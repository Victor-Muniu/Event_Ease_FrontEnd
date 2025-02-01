import React from 'react';
import { Check, Bell, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ type, title, message, timestamp, actions }) => {
  const getIcon = () => {
    switch (type) {
      case 'booking':
        return <Bell className="text-blue-500" size={20} />;
      case 'payment':
        return <Check className="text-green-500" size={20} />;
      case 'system':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="notification-item">
      <div className="icon-wrapper">{getIcon()}</div>
      <div className="content">
        <div className="header">
          <h3>{title}</h3>
          <span className="timestamp">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </span>
        </div>
        <p>{message}</p>
        <div className="actions">
          {actions.map((action, index) => (
            <button key={index} onClick={action.onClick}>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .notification-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 50%;
        }

        .content {
          flex: 1;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        h3 {
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .timestamp {
          font-size: 0.875rem;
          color: #64748b;
        }

        p {
          color: #475569;
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
        }

        button {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.875rem;
          padding: 0;
          cursor: pointer;
        }

        button:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default NotificationItem;
