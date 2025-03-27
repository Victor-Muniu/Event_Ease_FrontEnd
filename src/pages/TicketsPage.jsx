import { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import QRCode from "react-qr-code"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Calendar, CreditCard, Download, Printer, Clock, MapPin, User, DollarSign, Tag } from "lucide-react"

const TicketsPage = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [currentAttendee, setCurrentAttendee] = useState(null)
  const printTicketRef = useRef(null)

  useEffect(() => {
    const fetchCurrentAttendeeAndTickets = async () => {
      try {
        setLoading(true)
        // First, fetch the current attendee information
        const attendeeResponse = await fetch("http://localhost:3002/current-attendee", {
          credentials: "include", 
        })

        if (!attendeeResponse.ok) {
          throw new Error("Not authenticated or failed to fetch attendee information")
        }

        const attendeeData = await attendeeResponse.json()

        if (!attendeeData.user) {
          throw new Error("No user information found. Please log in.")
        }

        setCurrentAttendee(attendeeData.user)

        const ticketsResponse = await fetch("http://localhost:3002/ticket_purchase")

        if (!ticketsResponse.ok) {
          throw new Error("Failed to fetch tickets")
        }

        const ticketsData = await ticketsResponse.json()

        const attendeeTickets =
          ticketsData.payments?.filter((ticket) => ticket.attendeeId?._id === attendeeData.user.id) || []

        setTickets(attendeeTickets)

        // Calculate total spent
        const total = attendeeTickets.reduce((sum, ticket) => {
          return sum + (ticket.amountPaid || 0)
        }, 0)

        setTotalSpent(total)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchCurrentAttendeeAndTickets()
  }, [])

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePrintTicket = (ticket) => {
    setSelectedTicket(ticket)
    setIsPrintModalOpen(true)
  }

  const handlePrint = useReactToPrint({
    content: () => printTicketRef.current,
    documentTitle: `Ticket-${selectedTicket?._id || ""}`,
    onAfterPrint: () => setIsPrintModalOpen(false),
  })

  const closePrintModal = () => {
    setIsPrintModalOpen(false)
    setSelectedTicket(null)
  }

  // Generate QR code data for a ticket
  const generateQRData = (ticket) => {
    const qrData = {
      ticketId: ticket._id,
      eventName: ticket.response?.eventId?.bookingId?.response?.venueRequest?.eventName || "Unknown Event",
      attendeeName: `${ticket.attendeeId?.firstName || ""} ${ticket.attendeeId?.lastName || ""}`,
      category: Object.keys(ticket.response?.categories || {})[0] || "Regular",
      status: ticket.status,
      amount: ticket.amountPaid,
    }
    return JSON.stringify(qrData)
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your tickets...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="tickets-page">
        <div className="tickets-header">
          <div className="tickets-header-content">
            <h1>Your Tickets</h1>
            <p>
              {currentAttendee
                ? `Welcome, ${currentAttendee.fname} ${currentAttendee.lname}! View and manage all your event tickets in one place.`
                : "View and manage all your event tickets in one place"}
            </p>
          </div>
        </div>

        <div className="tickets-container">
          <div className="spending-summary">
            <div className="summary-card">
              <div className="summary-icon">
                <DollarSign size={24} />
              </div>
              <div className="summary-content">
                <h3>Total Spent</h3>
                <p className="summary-value">{formatCurrency(totalSpent)}</p>
                <p className="summary-description">Lifetime spending on our platform</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Tag size={24} />
              </div>
              <div className="summary-content">
                <h3>Tickets Purchased</h3>
                <p className="summary-value">{tickets.length}</p>
                <p className="summary-description">Total number of tickets</p>
              </div>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="no-tickets">
              <h3>No tickets found</h3>
              <p>You haven't purchased any tickets yet. Browse our events to find something you'll love!</p>
              <a href="/upcoming" className="browse-button">
                Browse Events
              </a>
            </div>
          ) : (
            <div className="tickets-list">
              <h2>Your Ticket History</h2>

              {tickets.map((ticket) => {
                const eventName =
                  ticket.response?.eventId?.bookingId?.response?.venueRequest?.eventName || "Unknown Event"
                const eventDates = ticket.response?.eventId?.bookingId?.response?.venueRequest?.eventDates || []
                const venue = ticket.response?.eventId?.bookingId?.response?.venueRequest?.venue || {}
                const firstDate = eventDates.length > 0 ? new Date(eventDates[0]) : null
                const lastDate = eventDates.length > 0 ? new Date(eventDates[eventDates.length - 1]) : null
                const isMultiDay = eventDates.length > 1
                const purchaseDate = new Date(ticket.createdAt)

                // Find the category this attendee purchased
                const categories = ticket.response?.categories || {}
                const categoryName = Object.keys(categories)[0] || "Regular"
                const categoryPrice = categories[categoryName]?.price || 0

                return (
                  <div className="ticket-card" key={ticket._id}>
                    <div className="ticket-main">
                      <div className="ticket-content">
                        <h3 className="ticket-title">{eventName}</h3>

                        <div className="ticket-details">
                          <div className="ticket-detail">
                            <Calendar size={16} />
                            <span>
                              {isMultiDay && firstDate && lastDate
                                ? `${formatDate(firstDate)} - ${formatDate(lastDate)}`
                                : firstDate
                                  ? formatDate(firstDate)
                                  : "Date not specified"}
                            </span>
                          </div>

                          <div className="ticket-detail">
                            <MapPin size={16} />
                            <span>
                              {venue.name || "Venue not specified"}, {venue.location || ""}
                            </span>
                          </div>

                          <div className="ticket-detail">
                            <User size={16} />
                            <span>
                              {ticket.attendeeId?.firstName || ""} {ticket.attendeeId?.lastName || ""}
                            </span>
                          </div>

                          <div className="ticket-detail">
                            <Tag size={16} />
                            <span>{categoryName} Ticket</span>
                          </div>

                          <div className="ticket-detail">
                            <CreditCard size={16} />
                            <span>{formatCurrency(ticket.amountPaid)}</span>
                          </div>

                          <div className="ticket-detail">
                            <Clock size={16} />
                            <span>Purchased on {formatDate(purchaseDate)}</span>
                          </div>
                        </div>

                        <div className="ticket-status">
                          <span className={`status-badge ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                        </div>
                      </div>

                      <div className="ticket-qr">
                        <QRCode
                          value={generateQRData(ticket)}
                          size={120}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 256 256`}
                        />
                        <p className="ticket-id">ID: {ticket._id.substring(ticket._id.length - 8)}</p>
                      </div>
                    </div>

                    <div className="ticket-actions">
                      <button className="print-button" onClick={() => handlePrintTicket(ticket)}>
                        <Printer size={16} />
                        Print Ticket
                      </button>

                      <button className="download-button">
                        <Download size={16} />
                        Download PDF
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Print Modal */}
      {isPrintModalOpen && selectedTicket && (
        <div className="print-modal-overlay">
          <div className="print-modal">
            <button className="close-button" onClick={closePrintModal}>
              ×
            </button>

            <div className="print-actions">
              <button className="print-now-button" onClick={handlePrint}>
                <Printer size={16} />
                Print Ticket
              </button>
            </div>

            <div className="print-preview" ref={printTicketRef}>
              <div className="printable-ticket">
                <div className="ticket-header">
                  <h2>EventEase</h2>
                  <h3>Event Ticket</h3>
                </div>

                <div className="ticket-body">
                  <div className="ticket-info">
                    <h2>
                      {selectedTicket.response?.eventId?.bookingId?.response?.venueRequest?.eventName ||
                        "Unknown Event"}
                    </h2>

                    <div className="ticket-info-grid">
                      <div className="info-item">
                        <strong>Attendee:</strong>
                        <span>
                          {selectedTicket.attendeeId?.firstName || ""} {selectedTicket.attendeeId?.lastName || ""}
                        </span>
                      </div>

                      <div className="info-item">
                        <strong>Ticket Type:</strong>
                        <span>{Object.keys(selectedTicket.response?.categories || {})[0] || "Regular"}</span>
                      </div>

                      <div className="info-item">
                        <strong>Event Date:</strong>
                        <span>
                          {selectedTicket.response?.eventId?.bookingId?.response?.venueRequest?.eventDates?.length > 0
                            ? formatDate(selectedTicket.response.eventId.bookingId.response.venueRequest.eventDates[0])
                            : "Date not specified"}
                        </span>
                      </div>

                      <div className="info-item">
                        <strong>Venue:</strong>
                        <span>
                          {selectedTicket.response?.eventId?.bookingId?.response?.venueRequest?.venue?.name ||
                            "Venue not specified"}
                          ,{selectedTicket.response?.eventId?.bookingId?.response?.venueRequest?.venue?.location || ""}
                        </span>
                      </div>

                      <div className="info-item">
                        <strong>Purchase Date:</strong>
                        <span>{formatDate(selectedTicket.createdAt)}</span>
                      </div>

                      <div className="info-item">
                        <strong>Ticket ID:</strong>
                        <span>{selectedTicket._id}</span>
                      </div>

                      <div className="info-item">
                        <strong>Amount Paid:</strong>
                        <span>{formatCurrency(selectedTicket.amountPaid)}</span>
                      </div>

                      <div className="info-item">
                        <strong>Status:</strong>
                        <span className={selectedTicket.status.toLowerCase()}>{selectedTicket.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-qr-print">
                    <QRCode
                      value={generateQRData(selectedTicket)}
                      size={150}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                    <p className="scan-note">Scan this QR code at the event entrance</p>
                  </div>
                </div>

                <div className="ticket-footer">
                  <p>This ticket is valid only for the named attendee and cannot be transferred.</p>
                  <p>For any inquiries, please contact support@eventease.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx="true">{`
        /* Base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
        }

        /* Loading and Error states */
        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #5d3fd3;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-container button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #5d3fd3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .error-container button:hover {
          background-color: #4c33b0;
        }

        /* Tickets Page */
        .tickets-page {
          min-height: calc(100vh - 140px);
          background-color: #f8f9fa;
        }

        .tickets-header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
        }

        .tickets-header-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .tickets-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .tickets-header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .tickets-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        /* Spending Summary */
        .spending-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .summary-card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .summary-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(93, 63, 211, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5d3fd3;
          flex-shrink: 0;
        }

        .summary-content {
          flex: 1;
        }

        .summary-content h3 {
          font-size: 1.1rem;
          color: #555;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .summary-description {
          font-size: 0.9rem;
          color: #777;
        }

        /* No Tickets */
        .no-tickets {
          background-color: white;
          border-radius: 8px;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .no-tickets h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .no-tickets p {
          color: #666;
          margin-bottom: 1.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .browse-button {
          display: inline-block;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.3s, transform 0.2s;
        }

        .browse-button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        /* Tickets List */
        .tickets-list {
          margin-top: 1rem;
        }

        .tickets-list h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #333;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .tickets-list h2::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #6a11cb, #2575fc);
        }

        .ticket-card {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .ticket-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .ticket-main {
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
        }

        .ticket-content {
          flex: 1;
        }

        .ticket-title {
          font-size: 1.4rem;
          margin-bottom: 1rem;
          color: #2c3e50;
        }

        .ticket-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .ticket-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #555;
        }

        .ticket-status {
          margin-top: 1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.confirmed {
          background-color: #e3f9e5;
          color: #1b8a2a;
        }

        .status-badge.pending {
          background-color: #fff8e6;
          color: #b7791f;
        }

        .status-badge.cancelled {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .ticket-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          min-width: 140px;
        }

        .ticket-id {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #666;
        }

        .ticket-actions {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background-color: #f8f9fa;
          border-top: 1px solid #eee;
        }

        .print-button,
        .download-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .print-button {
          background-color: #5d3fd3;
          color: white;
          border: none;
        }

        .print-button:hover {
          background-color: #4c33b0;
        }

        .download-button {
          background-color: white;
          color: #5d3fd3;
          border: 1px solid #5d3fd3;
        }

        .download-button:hover {
          background-color: rgba(93, 63, 211, 0.05);
        }

        /* Print Modal */
        .print-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .print-modal {
          background-color: white;
          border-radius: 8px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 30px;
          height: 30px;
          background-color: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          font-size: 1.5rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }

        .print-actions {
          padding: 1rem;
          display: flex;
          justify-content: flex-end;
          border-bottom: 1px solid #eee;
        }

        .print-now-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background-color: #5d3fd3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .print-now-button:hover {
          background-color: #4c33b0;
        }

        .print-preview {
          padding: 2rem;
        }

        /* Printable Ticket */
        .printable-ticket {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
        }

        .ticket-header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 1.5rem;
          text-align: center;
        }

        .ticket-header h2 {
          font-size: 1.8rem;
          margin-bottom: 0.3rem;
        }

        .ticket-header h3 {
          font-size: 1.2rem;
          font-weight: 400;
          opacity: 0.9;
        }

        .ticket-body {
          padding: 2rem;
          display: flex;
          gap: 2rem;
        }

        .ticket-info {
          flex: 1;
        }

        .ticket-info h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #2c3e50;
        }

        .ticket-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .info-item strong {
          font-size: 0.9rem;
          color: #666;
        }

        .info-item span {
          font-size: 1.1rem;
          color: #333;
        }

        .info-item span.confirmed {
          color: #1b8a2a;
        }

        .info-item span.pending {
          color: #b7791f;
        }

        .info-item span.cancelled {
          color: #b91c1c;
        }

        .ticket-qr-print {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          min-width: 180px;
        }

        .scan-note {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #666;
          text-align: center;
        }

        .ticket-footer {
          padding: 1.5rem;
          background-color: #f8f9fa;
          border-top: 1px solid #eee;
          text-align: center;
          font-size: 0.9rem;
          color: #666;
        }

        .ticket-footer p {
          margin-bottom: 0.5rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ticket-main {
            flex-direction: column;
          }

          .ticket-qr {
            align-self: center;
            margin-top: 1rem;
          }

          .ticket-details {
            grid-template-columns: 1fr;
          }

          .ticket-body {
            flex-direction: column;
          }

          .ticket-qr-print {
            align-self: center;
          }
        }

        @media (max-width: 480px) {
          .ticket-actions {
            flex-direction: column;
          }

          .print-button,
          .download-button {
            width: 100%;
            justify-content: center;
          }

          .tickets-header h1 {
            font-size: 2rem;
          }
        }

        @media print {
          .print-actions, .close-button {
            display: none;
          }

          .print-modal {
            box-shadow: none;
            max-height: none;
          }

          .print-preview {
            padding: 0;
          }

          .printable-ticket {
            border: none;
          }
        }
      `}</style>
    </div>
  )
}

export default TicketsPage

