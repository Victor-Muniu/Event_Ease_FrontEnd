import { useState, useEffect } from "react"
import QuotationPage from "./QuotationPage"

export default function VenueRequestDashboard() {
  const [requests, setRequests] = useState([])
  const [responses, setResponses] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeRequest, setActiveRequest] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [showQuotation, setShowQuotation] = useState(false)
  const [quotationData, setQuotationData] = useState(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch requests, responses, and current user in parallel
        const [requestsRes, responsesRes, userRes] = await Promise.all([
          fetch("http://localhost:3002/venue-requests", {
            credentials: "include",
          }),
          fetch("http://localhost:3002/venue-request-responses", {
            credentials: "include",
          }),
          fetch("http://localhost:3002/current-user", {
            credentials: "include",
          }),
        ])

        if (!requestsRes.ok) throw new Error("Failed to fetch requests")
        if (!responsesRes.ok) throw new Error("Failed to fetch responses")
        if (!userRes.ok) throw new Error("Failed to fetch user data")

        const requestsData = await requestsRes.json()
        const responsesData = await responsesRes.json()
        const userData = await userRes.json()

        setRequests(requestsData)
        setResponses(responsesData)
        setCurrentUser(userData.user)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter requests for current user
  const userRequests = currentUser ? requests.filter((req) => req.organizer?._id === currentUser.id) : []

  // Match responses with requests
  const requestsWithResponses = userRequests.map((request) => {
    const matchingResponse = responses.find((response) => response.venueRequest?._id === request._id)
    return {
      ...request,
      response: matchingResponse || null,
      hasResponse: !!matchingResponse,
    }
  })

  // Apply filters and sorting
  const filteredRequests = requestsWithResponses
    .filter((request) => {
      // Apply status filter
      if (filterStatus === "pending" && request.hasResponse) return false
      if (filterStatus === "responded" && !request.hasResponse) return false

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          request.eventName?.toLowerCase().includes(searchLower) ||
          request.venue?.name?.toLowerCase().includes(searchLower) ||
          request.venue?.location?.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
    .sort((a, b) => {
      // Apply sorting
      const dateA = new Date(a.requestDate)
      const dateB = new Date(b.requestDate)
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A"
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (request) => {
    if (request.hasResponse) return "#10b981" // green for responded
    return "#f59e0b" // amber for pending
  }

  // Generate quotation
  const generateQuotation = (request) => {
    try {
      // Create quotation data
      const quotation = {
        quotationNo: `#${Math.floor(100000 + Math.random() * 900000)}`,
        createdOn: formatDate(new Date()),
        customer: {
          name: `${currentUser?.fname || ""} ${currentUser?.lname || ""}`,
          email: currentUser?.email || "user@example.com",
        },
        from: {
          name: request.venue?.name || "Venue Provider",
        },
        to: {
          name: `${currentUser?.fname || ""} ${currentUser?.lname || ""}'s Organization`,
          address: "Office No. 802, 8th Floor, Business Hub",
          location: "Nairobi, Kenya",
        },
        note: "All venue bookings are subject to availability and confirmation",
        items:
          request.eventDates?.map((date, index) => {
            const dailyRate = request.response?.dailyRates?.find(
              (rate) => new Date(rate.date).toDateString() === new Date(date).toDateString(),
            )

            return {
              type: index % 2 === 0 ? "Venue" : "Equipment",
              service: "DTC",
              origin: request.venue?.name || "Venue",
              destination: request.eventName,
              date: formatDate(date),
              po: `#${Math.floor(100000 + Math.random() * 900000)}`,
              amount: dailyRate?.price || Math.floor(10000 + Math.random() * 90000),
            }
          }) || [],
        subtotal: request.response?.totalAmount || 0,
        tax: {
          percentage: 10,
          amount: (request.response?.totalAmount || 0) * 0.1,
        },
        discount: {
          percentage: 5,
          amount: (request.response?.totalAmount || 0) * 0.05,
        },
        total: (request.response?.totalAmount || 0) * 1.05,
      }

      setQuotationData(quotation)
      setShowQuotation(true)
    } catch (error) {
      console.error("Error generating quotation:", error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your venue requests...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  // Render quotation view
  if (showQuotation && quotationData) {
    return <QuotationPage quotationData={quotationData} onBack={() => setShowQuotation(false)} />
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Venue Requests Dashboard</h1>
            <p className="user-greeting">
              Welcome back,{" "}
              <span className="user-name">
                {currentUser?.fname} {currentUser?.lname}
              </span>
            </p>
          </div>

          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{userRequests.length}</div>
              <div className="stat-label">Total Requests</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {userRequests.filter((req) => responses.some((res) => res.venueRequest?._id === req._id)).length}
              </div>
              <div className="stat-label">Responses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {userRequests.filter((req) => !responses.some((res) => res.venueRequest?._id === req._id)).length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by event or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label>Status</label>
              <div className="custom-select">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label>Sort</label>
              <div className="custom-select">
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>STATUS</th>
                <th>EVENT</th>
                <th>VENUE</th>
                <th>DATE</th>
                <th>ATTENDANCE</th>
                <th>RESPONSE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-results">
                    No requests match your filters
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    className={`request-row ${activeRequest?._id === request._id ? "active" : ""}`}
                    onClick={() => setActiveRequest(request)}
                  >
                    <td>
                      <div className="status-indicator" style={{ backgroundColor: getStatusColor(request) }}>
                        {request.hasResponse ? "Responded" : "Pending"}
                      </div>
                    </td>
                    <td className="event-name">{request.eventName}</td>
                    <td>
                      <div className="venue-cell">
                        <div
                          className="venue-color"
                          style={{
                            backgroundColor: request.hasResponse ? "#10b981" : "#f59e0b",
                          }}
                        ></div>
                        <span>{request.venue?.name || "No venue"}</span>
                      </div>
                    </td>
                    <td>
                      {request.eventDates?.length > 0 ? (
                        <div className="date-cell">
                          <div className="primary-date">{formatDate(request.eventDates[0])}</div>
                          {request.eventDates.length > 1 && (
                            <div className="additional-dates">+{request.eventDates.length - 1} more</div>
                          )}
                        </div>
                      ) : (
                        "No dates"
                      )}
                    </td>
                    <td>{request.expectedAttendance?.toLocaleString() || 0}</td>
                    <td>
                      {request.hasResponse ? (
                        <div className="response-amount">{formatCurrency(request.response.totalAmount)}</div>
                      ) : (
                        <div className="awaiting-response">Awaiting</div>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveRequest(request)
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span>View</span>
                        </button>
                        {request.hasResponse && (
                          <button
                            className="quote-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              generateQuotation(request)
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Quote</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {activeRequest && (
          <div className="detail-overlay" onClick={() => setActiveRequest(null)}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
              <div className="detail-header">
                <h2>{activeRequest.eventName}</h2>
                <div className="detail-status" style={{ backgroundColor: getStatusColor(activeRequest) }}>
                  {activeRequest.hasResponse ? "Responded" : "Pending"}
                </div>
                <button className="close-detail" onClick={() => setActiveRequest(null)}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="detail-content">
                <div className="detail-section">
                  <h3>Event Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">Event Name</div>
                      <div className="detail-value">{activeRequest.eventName}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">Description</div>
                      <div className="detail-value">{activeRequest.eventDescription || "No description provided"}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">Expected Attendance</div>
                      <div className="detail-value">
                        {activeRequest.expectedAttendance?.toLocaleString() || 0} people
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">Request Date</div>
                      <div className="detail-value">{formatDate(activeRequest.requestDate)}</div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Venue Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">Venue Name</div>
                      <div className="detail-value">{activeRequest.venue?.name || "No venue"}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">Location</div>
                      <div className="detail-value">{activeRequest.venue?.location || "No location"}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">Capacity</div>
                      <div className="detail-value">
                        {activeRequest.venue?.capacity?.toLocaleString() || "N/A"} people
                      </div>
                    </div>
                  </div>
                </div>

                {activeRequest.eventDates?.length > 0 && (
                  <div className="detail-section">
                    <h3>Event Dates</h3>
                    <div className="dates-list">
                      {activeRequest.eventDates.map((date, index) => (
                        <div key={index} className="date-item">
                          <div className="date-icon">📅</div>
                          <div className="date-content">
                            <div className="date-value">{formatDate(date)}</div>
                            <div className="date-day">
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeRequest.hasResponse && (
                  <div className="detail-section response-section">
                    <h3>Venue Response</h3>
                    <div className="response-header">
                      <div className="response-timestamp">
                        Responded on {formatDate(activeRequest.response.createdAt)}
                      </div>
                      <div className="response-total">
                        <div className="response-label">Total Amount:</div>
                        <div className="response-amount">{formatCurrency(activeRequest.response.totalAmount)}</div>
                      </div>
                    </div>

                    {activeRequest.response.dailyRates?.length > 0 && (
                      <div className="daily-rates">
                        <h4>Daily Rates</h4>
                        <table className="rates-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Day</th>
                              <th>Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeRequest.response.dailyRates.map((rate, index) => (
                              <tr key={index}>
                                <td>{formatDate(rate.date)}</td>
                                <td>
                                  {new Date(rate.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                  })}
                                </td>
                                <td>{formatCurrency(rate.price)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="2">Total</td>
                              <td>{formatCurrency(activeRequest.response.totalAmount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    <div className="response-actions">
                      <button className="action-button primary" onClick={() => generateQuotation(activeRequest)}>
                        <span>View Quotation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Dashboard layout */
        .dashboard-wrapper {
          height: 100vh;
          width: 80vw;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #f8f7ff;
          color: #1e1b4b;
        }

        .dashboard-container {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .header-content h1 {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6d28d9, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.25rem;
        }

        .user-greeting {
          color: #64748b;
          font-size: 0.875rem;
        }

        .user-name {
          color: #1e1b4b;
          font-weight: 600;
        }

        .header-stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e1b4b;
        }

        .stat-label {
          color: #64748b;
          font-size: 0.75rem;
        }

        /* Controls */
        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .search-container {
          position: relative;
          width: 40%;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 1rem 0.625rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background-color: #ffffff;
          font-size: 0.875rem;
          color: #1e1b4b;
        }

        .search-input:focus {
          outline: none;
          border-color: #6d28d9;
          box-shadow: 0 0 0 2px rgba(109, 40, 217, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          width: 1rem;
          height: 1rem;
        }

        .filters-container {
          display: flex;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
        }

        .custom-select {
          position: relative;
        }

        .custom-select select {
          appearance: none;
          padding: 0.625rem 2rem 0.625rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background-color: #ffffff;
          font-size: 0.875rem;
          color: #1e1b4b;
          min-width: 150px;
          cursor: pointer;
        }

        .custom-select select:focus {
          outline: none;
          border-color: #6d28d9;
          box-shadow: 0 0 0 2px rgba(109, 40, 217, 0.1);
        }

        .custom-select::after {
          content: '';
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #64748b;
          pointer-events: none;
        }

        /* Table container */
        .table-container {
          flex: 1;
          overflow-y: auto;
          padding: 0 2rem;
          background-color: #ffffff;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .requests-table th {
          background-color: #f1f5f9;
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }

        .requests-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .request-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .request-row:hover {
          background-color: #ede9fe;
        }

        .request-row.active {
          background-color: #ede9fe;
          border-left: 3px solid #6d28d9;
        }

        .status-indicator {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-align: center;
        }

        .event-name {
          font-weight: 600;
          color: #1e1b4b;
        }

        .venue-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .venue-color {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
        }

        .date-cell {
          display: flex;
          flex-direction: column;
        }

        .primary-date {
          font-weight: 500;
        }

        .additional-dates {
          font-size: 0.75rem;
          color: #64748b;
        }

        .response-amount {
          font-weight: 600;
          color: #10b981;
        }

        .awaiting-response {
          color: #64748b;
          font-style: italic;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .view-button, .quote-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.625rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .view-button {
          background-color: #ede9fe;
          color: #6d28d9;
        }

        .view-button:hover {
          background-color: #6d28d9;
          color: white;
        }

        .quote-button {
          background-color: #bbf7d0;
          color: #10b981;
        }

        .quote-button:hover {
          background-color: #10b981;
          color: white;
        }

        .view-button svg, .quote-button svg {
          width: 1rem;
          height: 1rem;
        }

        .no-results {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }

        /* Detail overlay */
        .detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .detail-panel {
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          background-color: #ffffff;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .detail-header {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e1b4b;
          flex: 1;
        }

        .detail-status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          margin: 0 1rem;
        }

        .close-detail {
          background: none;
          border: none;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          border-radius: 50%;
        }

        .close-detail:hover {
          background-color: #f1f5f9;
          color: #ef4444;
        }

        .detail-content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e1b4b;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #ede9fe;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #1e293b;
          line-height: 1.5;
        }

        .dates-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .date-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background-color: #f1f5f9;
          border-radius: 0.375rem;
        }

        .date-icon {
          font-size: 1.25rem;
        }

        .date-content {
          display: flex;
          flex-direction: column;
        }

        .date-value {
          font-weight: 500;
          color: #1e1b4b;
        }

        .date-day {
          font-size: 0.75rem;
          color: #64748b;
        }

        .response-section {
          background-color: #ede9fe;
          padding: 1.5rem;
          border-radius: 0.375rem;
        }

        .response-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .response-timestamp {
          font-size: 0.875rem;
          color: #5b21b6;
        }

        .response-total {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .response-label {
          font-size: 0.875rem;
          color: #5b21b6;
        }

        .response-amount {
          font-weight: 600;
          color: #10b981;
          font-size: 1.125rem;
        }

        .daily-rates {
          margin-bottom: 1.5rem;
        }

        .daily-rates h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #5b21b6;
          margin-bottom: 0.75rem;
        }

        .rates-table {
          width: 100%;
          border-collapse: collapse;
          background-color: #ffffff;
          border-radius: 0.375rem;
          overflow: hidden;
        }

        .rates-table th {
          background-color: #6d28d9;
          color: white;
          padding: 0.625rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .rates-table td {
          padding: 0.625rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
        }

        .rates-table tfoot td {
          font-weight: 600;
          background-color: #f1f5f9;
        }

        .response-actions {
          display: flex;
          gap: 1rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          flex: 1;
        }

        .action-button.primary {
          background-color: #6d28d9;
          color: white;
          border: none;
        }

        .action-button.primary:hover {
          background-color: #5b21b6;
        }

        /* Loading state */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f8f7ff;
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #ede9fe;
          border-top: 4px solid #6d28d9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container p {
          color: #64748b;
          font-size: 1rem;
        }

        /* Error state */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f8f7ff;
          text-align: center;
          padding: 2rem;
        }

        .error-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background-color: #ef4444;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }

        .error-container h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #1e1b4b;
        }

        .error-container p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .error-container button {
          padding: 0.75rem 1.5rem;
          background-color: #6d28d9;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .error-container button:hover {
          background-color: #5b21b6;
        }

        /* Quotation styles */
        .quotation-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f8fafc;
          height: 100vh;
          overflow-y: auto;
        }

        .quotation-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .back-button, .print-button {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button {
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }

        .back-button:hover {
          background-color: #e2e8f0;
        }

        .print-button {
          background-color: #3b82f6;
          color: white;
          border: none;
        }

        .print-button:hover {
          background-color: #2563eb;
        }

        .quotation-document {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 3rem;
        }

        .quotation-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3rem;
        }

        .quotation-sender {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 3.5rem;
          height: 3.5rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .sender-info h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .sender-info p {
          color: #64748b;
        }

        .quotation-meta {
          text-align: right;
        }

        .meta-item {
          margin-bottom: 1rem;
        }

        .meta-item h3 {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .meta-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .quotation-addresses {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .address-block {
          max-width: 50%;
        }

        .address-block h3 {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .address-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .address-block p {
          color: #475569;
          margin-bottom: 0.25rem;
        }

        .customer-note {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background-color: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }

        .note-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          font-weight: bold;
        }

        .customer-note p {
          color: #475569;
          flex: 1;
        }

        .quotation-table {
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .quotation-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .quotation-table th {
          background-color: #f1f5f9;
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .quotation-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .item-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .flag {
          margin-right: 0.25rem;
        }

        .amount {
          font-weight: 600;
          color: #0f766e;
        }

        .quotation-summary {
          width: 100%;
          max-width: 400px;
          margin-left: auto;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .summary-row.total {
          font-weight: 700;
          font-size: 1.25rem;
          color: #1e293b;
          border-bottom: none;
          padding-top: 1.5rem;
        }

        @media print {
          .quotation-header {
            display: none;
          }

          .quotation-container {
            padding: 0;
            background: none;
          }

          .quotation-document {
            box-shadow: none;
            border-radius: 0;
          }
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
          }

          .header-stats {
            width: 100%;
            justify-content: space-between;
          }

          .controls-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
          }

          .search-container {
            width: 100%;
          }

          .filters-container {
            width: 100%;
            justify-content: space-between;
          }

          .table-container {
            padding: 0 1rem;
          }

          .quotation-top {
            flex-direction: column;
            gap: 2rem;
          }

          .quotation-meta {
            text-align: left;
          }

          .quotation-addresses {
            flex-direction: column;
            gap: 2rem;
          }

          .address-block {
            max-width: 100%;
          }

          .quotation-document {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

