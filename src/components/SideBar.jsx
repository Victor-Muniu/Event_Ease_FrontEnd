import { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  Ticket,
  Users,
  BarChart2,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";
import axios from "axios";
export default function Sidebar() {
  const [isEventsOpen, setIsEventsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);
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

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">EventEase</div>

        <div className="profile">
          <div className="profile-info">
            <div className="profile-name">
              {currentUser?.user.fname} {currentUser?.user.lname}
            </div>
            <div className="profile-title">Event Organizer</div>
          </div>
        </div>
      </div>

      <nav className="nav-section">
        <a href="/dashboard" className="nav-item active">
          <Home size={20} />
          Dashboard
        </a>

        <div>
          <div
            className="nav-item has-submenu"
            onClick={() => setIsEventsOpen(!isEventsOpen)}
          >
            <div className="nav-item-content">
              <Calendar size={20} />
              Events
            </div>
            <ChevronDown
              size={16}
              className={`chevron ${isEventsOpen ? "open" : ""}`}
            />
          </div>

          {isEventsOpen && (
            <div className="submenu">
              <a href="/event_grounds" className="nav-item">
                Event Grounds
              </a>
              <a href="/events/agenda" className="nav-item">
                Manage Your Events
              </a>
            </div>
          )}
        </div>

        <a href="/tickets" className="nav-item">
          <Ticket size={20} />
          Ticket Sales
        </a>

        <a href="/attendees" className="nav-item">
          <Users size={20} />
          Attendees
        </a>

        <a href="/analytics" className="nav-item">
          <BarChart2 size={20} />
          Analytics
        </a>

        <a href="/payments" className="nav-item">
          <CreditCard size={20} />
          Payments
        </a>
        <a href="/notifications" className="nav-item">
          <Bell size={20} />
          Notifications
        </a>
      </nav>

      <div className="bottom-section">
        <a href="/help" className="nav-item">
          <HelpCircle size={20} />
          Help Center
        </a>

        <a href="/settings" className="nav-item">
          <Settings size={20} />
          Settings
        </a>

        <a href="/logout" className="nav-item logout">
          <LogOut size={20} />
          Logout
        </a>
      </div>
      <style jsx>{`
        .sidebar {
          width: 240px;
          height: 100vh;
          background: white;
          border-right: 1px solid #eaeaea;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 0 20px;
          margin-bottom: 24px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 24px;
        }

        .logo img {
          width: 24px;
          height: 24px;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 3px 0;
        }

        .profile-image {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .profile-title {
          font-size: 12px;
          color: #666;
        }

        .nav-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: #666;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
        }

        .nav-item:hover {
          background: #f5f5f5;
        }

        .nav-item.active {
          background: #e6f7f4;
          color: #00a389;
        }

        .nav-item svg {
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }

        .nav-item.has-submenu {
          display: flex;
          justify-content: space-between;
        }

        .submenu {
          padding-left: 52px;
        }

        .submenu .nav-item {
          padding: 10px 20px;
        }

        .bottom-section {
          border-top: 1px solid #eaeaea;
          padding-top: 4px;
        }

        .nav-item.logout {
          color: #ff4d4f;
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.open {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
