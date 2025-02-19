import { useState, useEffect } from "react"
import { Bell, Search, ChevronDown, Eye, Edit2, X } from "lucide-react"

export default function EventRequests() {
  const [requests, setRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [venueFilter, setVenueFilter] = useState("All Venues")
  const [currentPage, setCurrentPage] = useState(1)
  const requestsPerPage = 2

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost:3002/event-requests")
        const data = await response.json()
        setRequests(data)
      } catch (error) {
        console.error("Error fetching requests:", error)
      }
    }

    fetchRequests()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.eventGround.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All Status" || request.status === statusFilter
    const matchesVenue = venueFilter === "All Venues" || request.eventGround.name === venueFilter
    return matchesSearch && matchesStatus && matchesVenue
  })

  const indexOfLastRequest = currentPage * requestsPerPage
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest)

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)

  const handleCancel = async (id) => {
    try {
      await fetch(`http://localhost:3002/event-requests/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      setRequests(requests.filter((request) => request._id !== id))
    } catch (error) {
      console.error("Error cancelling request:", error)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>My Event Requests</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
          </button>
          <div className="profile-pic">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/requests.PNG-dFvuBpL41lFwgZXbq3HuLVtrj3hSMG.png"
              alt="Profile"
            />
          </div>
        </div>
      </header>

      <div className="filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
          <ChevronDown size={16} />
        </div>

        <div className="filter-dropdown">
          <select>
            <option>All Event Types</option>
            <option>Conference</option>
            <option>Meeting</option>
            <option>Workshop</option>
          </select>
          <ChevronDown size={16} />
        </div>

        <div className="filter-dropdown">
          <select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)}>
            <option>All Venues</option>
            {[...new Set(requests.map((r) => r.eventGround.name))].map((venue) => (
              <option key={venue}>{venue}</option>
            ))}
          </select>
          <ChevronDown size={16} />
        </div>
      </div>

      <div className="requests-list">
        {currentRequests.map((request) => (
          <div key={request._id} className="request-card">
            <div className="request-header">
              <div>
                <h2>{request.eventGround.name}</h2>
                <p className="venue">{request.eventGround.name}</p>
              </div>
              <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
            </div>

            <div className="request-details">
              <div className="detail-group">
                <label>Date</label>
                <p>{request.eventDates.map((date) => formatDate(date)).join(" - ")}</p>
              </div>

              <div className="detail-group">
                <label>Attendance</label>
                <p>{request.expectedAttendees} people</p>
              </div>

              <div className="detail-group">
                <label>Request Date</label>
                <p>{formatDate(request.requestSubmissionDate)}</p>
              </div>
            </div>

            <div className="request-actions">
              <button className="action-btn cancel" onClick={() => handleCancel(request._id)}>
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notification-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }

        .profile-pic {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }

        .profile-pic img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-bar {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .search-bar input {
          border: none;
          outline: none;
          margin-left: 0.5rem;
          width: 100%;
        }

        .filter-dropdown {
          position: relative;
          min-width: 150px;
        }

        .filter-dropdown select {
          width: 100%;
          padding: 0.5rem 2rem 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          background: white;
          appearance: none;
          cursor: pointer;
        }

        .filter-dropdown svg {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #666;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .request-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .request-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .venue {
          color: #666;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.25rem 1rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.pending {
          background-color: #fff3dc;
          color: #b25e09;
        }

        .status-badge.approved {
          background-color: #dcfce7;
          color: #166534;
        }

        .request-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-group label {
          display: block;
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .detail-group p {
          color: #1a1a1a;
          font-weight: 500;
        }

        .request-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
        }

        .action-btn.view {
          background-color: #e8f0fe;
          color: #1a73e8;
        }

        .action-btn.update {
          background-color: #fff;
          color: #1a1a1a;
          border: 1px solid #e0e0e0;
        }

        .action-btn.cancel {
          background-color: #fff;
          color: #dc2626;
          border: 1px solid #e0e0e0;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .filters {
            flex-direction: column;
          }

          .filter-dropdown {
            width: 100%;
          }

          .request-details {
            grid-template-columns: 1fr;
          }

          .request-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 2rem;
          gap: 1rem;
        }

        .pagination button {
          padding: 0.5rem 1rem;
          background-color: #e8f0fe;
          color: #1a73e8;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .pagination button:disabled {
          background-color: #f0f0f0;
          color: #999;
          cursor: not-allowed;
        }

        .pagination span {
          font-size: 0.875rem;
          color: #666;
        }
      `}</style>
    </div>
  )
}

