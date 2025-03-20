import { useState, useEffect } from "react"
import { formatDate, formatCurrency } from "../utils/Formatters";

export default function TentativeBookings({ onSelectBooking, refreshTrigger }) {
    const [bookings, setBookings] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedBookingId, setSelectedBookingId] = useState(null)
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true)
  
          // Fetch bookings and current user in parallel
          const [bookingsRes, userRes] = await Promise.all([
            fetch("http://localhost:3002/bookings", {
              credentials: "include",
            }),
            fetch("http://localhost:3002/current-user", {
              credentials: "include",
            }),
          ])
  
          if (!bookingsRes.ok) throw new Error("Failed to fetch bookings")
          if (!userRes.ok) throw new Error("Failed to fetch user data")
  
          const bookingsData = await bookingsRes.json()
          const userData = await userRes.json()
  
          setBookings(bookingsData)
          setCurrentUser(userData.user)
        } catch (err) {
          console.error("Error fetching data:", err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
  
      fetchData()
    }, [refreshTrigger]) // Refetch when refreshTrigger changes
  
    // Filter tentative bookings for current user
    const tentativeBookings = bookings.filter(
      (booking) => booking.organizer?._id === currentUser?.id && booking.status === "Tentative",
    )
  
    const handleSelectBooking = (booking) => {
      setSelectedBookingId(booking._id)
      onSelectBooking(booking)
    }
  
    // Loading state
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your tentative bookings...</p>
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
  
    return (
      <div className="tentative-bookings">
        <div className="bookings-header">
          <h2>Tentative Bookings</h2>
          <p>Complete payment to confirm your bookings</p>
        </div>
  
        {tentativeBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-data-icon">📋</div>
            <h3>No Tentative Bookings</h3>
            <p>You don't have any bookings that need payment at the moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Amount Due</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tentativeBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className={selectedBookingId === booking._id ? "selected-row" : ""}
                    onClick={() => handleSelectBooking(booking)}
                  >
                    <td className="event-name">{booking.response?.venueRequest?.eventName || "Unnamed Event"}</td>
                    <td>{booking.response?.venueRequest?.venue?.name || "No venue"}</td>
                    <td>
                      {booking.response?.venueRequest?.eventDates?.length > 0
                        ? formatDate(booking.response.venueRequest.eventDates[0]) +
                          (booking.response.venueRequest.eventDates.length > 1
                            ? ` (+${booking.response.venueRequest.eventDates.length - 1} more)`
                            : "")
                        : "No dates"}
                    </td>
                    <td className="amount">{formatCurrency(booking.totalAmount)}</td>
                    <td>
                      <span className="status-badge">Tentative</span>
                    </td>
                    <td>
                      <button
                        className="pay-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectBooking(booking)
                        }}
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <style jsx>{`
          .tentative-bookings {
            width: 100%;
            margin: 0 auto;
          }
  
          .bookings-header {
            margin-bottom: 1.5rem;
          }
  
          .bookings-header h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
  
          .bookings-header p {
            color: #718096;
            font-size: 0.875rem;
          }
  
          .table-container {
            overflow-x: auto;
            background-color: white;
            border-radius: 0.75rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
  
          .bookings-table {
            width: 100%;
            border-collapse: collapse;
          }
  
          .bookings-table th {
            background-color: #f7fafc;
            padding: 1rem;
            text-align: left;
            font-size: 0.875rem;
            font-weight: 600;
            color: #4a5568;
            border-bottom: 1px solid #e2e8f0;
          }
  
          .bookings-table td {
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.875rem;
            color: #2d3748;
          }
  
          .bookings-table tr {
            cursor: pointer;
            transition: background-color 0.2s;
          }
  
          .bookings-table tr:hover {
            background-color: #f7fafc;
          }
  
          .bookings-table tr.selected-row {
            background-color: #ebf4ff;
            border-left: 3px solid #6366f1;
          }
  
          .event-name {
            font-weight: 600;
          }
  
          .amount {
            font-weight: 600;
            color: #6366f1;
          }
  
          .status-badge {
            display: inline-block;
            background-color: #fef3c7;
            color: #d97706;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
          }
  
          .pay-button {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
  
          .pay-button:hover {
            opacity: 0.9;
          }
  
          .no-bookings {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 2rem;
            text-align: center;
            background-color: white;
            border-radius: 0.75rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
  
          .no-data-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
  
          .no-bookings h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
  
          .no-bookings p {
            color: #718096;
            max-width: 400px;
          }
  
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 2rem;
          }
  
          .loading-spinner {
            width: 3rem;
            height: 3rem;
            border: 4px solid rgba(99, 102, 241, 0.1);
            border-left-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
  
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
  
          .loading-container p {
            color: #718096;
          }
  
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 2rem;
            text-align: center;
          }
  
          .error-icon {
            width: 4rem;
            height: 4rem;
            background-color: #fed7d7;
            color: #e53e3e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
  
          .error-container h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
  
          .error-container p {
            color: #718096;
            margin-bottom: 1.5rem;
          }
  
          .error-container button {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s;
          }
  
          .error-container button:hover {
            opacity: 0.9;
          }
  
          @media (max-width: 768px) {
            .bookings-table {
              min-width: 650px;
            }
          }
        `}</style>
      </div>
    )
  }
  
  