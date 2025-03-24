import { useState, useEffect } from "react"
import {
  Home,
  Calendar,
  Users,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Building,
} from "lucide-react"
import axios from "axios"

export default function Sidebar() {
  const [isEventsOpen, setIsEventsOpen] = useState(true)
  const [isVenuesOpen, setIsVenuesOpen] = useState(false)
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false)
  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("http://localhost:3002/current-user", {
        withCredentials: true,
      })

      setCurrentUser(response.data)
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

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

        {/* Events Management Section */}
        <div className="nav-group">
          <div className="nav-item has-submenu" onClick={() => setIsEventsOpen(!isEventsOpen)}>
            <div className="nav-item-content">
              <Calendar size={20} />
              Events
            </div>
            <ChevronDown size={16} className={`chevron ${isEventsOpen ? "open" : ""}`} />
          </div>

          {isEventsOpen && (
            <div className="submenu">
              <a href="/events" className="nav-item">
                My Events
              </a>
              <a href="/create" className="nav-item">
                Create Event
              </a>
              <a href="/generate_tickets" className="nav-item">
                Generate Tickets
              </a>

            </div>
          )}
        </div>

        {/* Venue Management Section */}
        <div className="nav-group">
          <div className="nav-item has-submenu" onClick={() => setIsVenuesOpen(!isVenuesOpen)}>
            <div className="nav-item-content">
              <Building size={20} />
              Venues
            </div>
            <ChevronDown size={16} className={`chevron ${isVenuesOpen ? "open" : ""}`} />
          </div>

          {isVenuesOpen && (
            <div className="submenu">
              <a href="/venues" className="nav-item">
                Browse Venues
              </a>
              <a href="/venue_request" className="nav-item">
                Venue Requests
              </a>
              <a href="/pay" className="nav-item">
                Finalize Booking
              </a>
            </div>
          )}
        </div>

        {/* Attendees Section */}
        <div className="nav-group">
          <div className="nav-item has-submenu" onClick={() => setIsAttendeesOpen(!isAttendeesOpen)}>
            <div className="nav-item-content">
              <Users size={20} />
              Attendees
            </div>
            <ChevronDown size={16} className={`chevron ${isAttendeesOpen ? "open" : ""}`} />
          </div>

          {isAttendeesOpen && (
            <div className="submenu">
              <a href="/attendees" className="nav-item">
                Manage Attendees
              </a>
              <a href="/tickets" className="nav-item">
                Ticket Sales
              </a>
            </div>
          )}
        </div>

        {/* Financials Section */}
        <div className="nav-group">
          <div className="nav-item has-submenu" onClick={() => setIsFinancialsOpen(!isFinancialsOpen)}>
            <div className="nav-item-content">
              <CreditCard size={20} />
              Financials
            </div>
            <ChevronDown size={16} className={`chevron ${isFinancialsOpen ? "open" : ""}`} />
          </div>

          {isFinancialsOpen && (
            <div className="submenu">
              <a href="/payment" className="nav-item">
                Payments
              </a>
              <a href="/analytics" className="nav-item">
                Analytics
              </a>
            </div>
          )}
        </div>

        {/* Notifications */}
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

        <a href="/" className="nav-item logout">
          <LogOut size={20} />
          Logout
        </a>
      </div>
      <style jsx>{`
        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #eaeaea;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 0 20px;
          margin-bottom: 24px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 700;
          color: #00a389;
          margin-bottom: 24px;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .profile-title {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .nav-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 8px;
        }

        .nav-group {
          margin-bottom: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          color: #555;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: #f5f5f5;
          color: #00a389;
        }

        .nav-item.active {
          background: #e6f7f4;
          color: #00a389;
          font-weight: 500;
        }

        .nav-item svg {
          width: 20px;
          height: 20px;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .nav-item.has-submenu {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-item-content {
          display: flex;
          align-items: center;
        }

        .submenu {
          margin-top: 2px;
          padding-left: 32px;
        }

        .submenu .nav-item {
          padding: 8px 12px;
          font-size: 13px;
        }

        .bottom-section {
          border-top: 1px solid #eaeaea;
          padding-top: 12px;
          margin-top: 12px;
          padding-left: 8px;
          padding-right: 8px;
        }

        .nav-item.logout {
          color: #ff4d4f;
        }

        .nav-item.logout:hover {
          background: #fff1f0;
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.open {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  )
}

