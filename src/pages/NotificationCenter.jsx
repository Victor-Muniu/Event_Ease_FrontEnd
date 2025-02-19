import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Bell, Filter } from "lucide-react";
import NotificationItem from "../components/NotificationItem";
import QuotationCard from "../components/QuotationCard";

const NotificationCenter = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("http://localhost:3002/current-user", {
        withCredentials: true,
      });

      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:3002/event-responses");
      const data = await response.json();
      console.log("all messages", data);
  
      const userNotifications = currentUser
        ? data.responses.filter(
            (notification) =>
              notification.eventRequest.organizer === currentUser?.user.id // filter notifications by current user
          )
        : [];
  
      setNotifications(userNotifications);
      console.log(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.eventRequest.eventName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      notification.responseMessage
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
  };

  return (
    <div className="notification-center">
      <header className="header">
        <div className="title-section">
          <h1>Notifications & Messages</h1>
          <p>
            Stay updated with the latest messages and alerts regarding your
            events
          </p>
        </div>
        <div className="notification-badge">
          <Bell size={24} />
          {notifications.length > 0 && (
            <span className="badge">{notifications.length}</span>
          )}
        </div>
      </header>

      <div className="search-bar">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-button">
          <Filter size={20} />
          Filters
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`tab ${activeTab === "unread" ? "active" : ""}`}
          onClick={() => setActiveTab("unread")}
        >
          Unread
        </button>
        <button
          className={`tab ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>
        <button
          className={`tab ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          System Alerts
        </button>
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">No notifications found</div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              type="booking"
              title={notification.eventRequest.eventName}
              message={notification.responseMessage}
              timestamp={notification.createdAt}
              actions={[
                {
                  label: "View Details",
                  onClick: () => handleNotificationPress(notification),
                },
                {
                  label: "Mark as Read",
                  onClick: () => console.log("Mark as read", notification._id),
                },
              ]}
            />
          ))
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <button className="clear-all" onClick={clearAllNotifications}>
          Clear All Notifications
        </button>
      )}

      {selectedNotification && (
        <QuotationCard
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

      <style jsx>{`
        .notification-center {
          background: #f8fafc;
          min-height: 100vh;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .title-section h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .title-section p {
          color: #64748b;
          margin: 0;
        }

        .notification-badge {
          position: relative;
          color: #64748b;
        }

        .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          min-width: 20px;
          text-align: center;
        }

        .search-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-input {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }

        .search-input input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #64748b;
          cursor: pointer;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab {
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
          position: relative;
        }

        .tab.active {
          color: #2563eb;
        }

        .tab.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #2563eb;
        }

        .notifications-list {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .loading,
        .empty-state {
          padding: 2rem;
          text-align: center;
          color: #64748b;
        }

        .clear-all {
          display: block;
          width: 100%;
          padding: 0.75rem;
          margin-top: 1rem;
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-all:hover {
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
