import { useState, useEffect, useMemo } from "react"

import { jsPDF } from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { CSVLink } from "react-csv"

// Main component
const AttendeeTracker = () => {
  // State
  const [user, setUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState("list")
  const [selectedAttendee, setSelectedAttendee] = useState(null)
  const [showAttendeeModal, setShowAttendeeModal] = useState(false)
  const [activeMetricTab, setActiveMetricTab] = useState("overview")

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [eventFilter, setEventFilter] = useState("all")

  // Stats
  const [stats, setStats] = useState({
    totalAttendees: 0,
    maleAttendees: 0,
    femaleAttendees: 0,
    vvipTickets: 0,
    vipTickets: 0,
    regularTickets: 0,
    totalRevenue: 0,
    paymentStatusCounts: {
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    },
    attendeesByDate: {},
  })

  // Add these state variables
  const [exportFormat, setExportFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)

  // Fetch user and payments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch current user
        const userResponse = await fetch("http://localhost:3002/current-user", {
          credentials: "include",
        })

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data")
        }

        const userData = await userResponse.json()
        setUser(userData.user)

        // Fetch payments/attendees
        const paymentsResponse = await fetch("http://localhost:3002/ticket_purchase")

        if (!paymentsResponse.ok) {
          throw new Error("Failed to fetch attendee data")
        }

        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData.payments)

        // Calculate stats
        calculateStats(paymentsData.payments)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fix the attendee overtime chart issue by ensuring proper date handling
  // Update the calculateStats function to properly track attendees by date
  const calculateStats = (payments) => {
    const stats = {
      totalAttendees: payments.length,
      maleAttendees: payments.filter((p) => p.attendeeId.gender === "Male").length,
      femaleAttendees: payments.filter((p) => p.attendeeId.gender === "Female").length,
      vvipTickets: 0,
      vipTickets: 0,
      regularTickets: 0,
      totalRevenue: 0,
      paymentStatusCounts: {
        confirmed: 0,
        pending: 0,
        cancelled: 0,
      },
      attendeesByDate: {},
    }

    // Ensure we have at least some dates for the charts
    if (payments.length > 0) {
      // Get the earliest and latest dates
      const dates = payments.map((p) => new Date(p.createdAt).toISOString().split("T")[0])
      const sortedDates = [...new Set(dates)].sort()

      // Initialize all dates in the range
      if (sortedDates.length > 0) {
        const startDate = new Date(sortedDates[0])
        const endDate = new Date(sortedDates[sortedDates.length - 1])

        // Create a date range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0]
          stats.attendeesByDate[dateStr] = 0
        }
      }
    }

    payments.forEach((payment) => {
      // Add ticket counts based on categories
      if (payment.response.categories) {
        // Determine which ticket type this attendee purchased
        const ticketType = getTicketType(payment)
        if (ticketType === "VVIP") stats.vvipTickets += 1
        else if (ticketType === "VIP") stats.vipTickets += 1
        else if (ticketType === "Regular") stats.regularTickets += 1
      }

      // Add revenue
      stats.totalRevenue += payment.amountPaid

      // Count payment statuses
      const status = payment.status.toLowerCase()
      if (status === "confirmed") stats.paymentStatusCounts.confirmed += 1
      else if (status === "pending") stats.paymentStatusCounts.pending += 1
      else if (status === "cancelled") stats.paymentStatusCounts.cancelled += 1

      // Group by date for line chart
      const date = new Date(payment.createdAt).toISOString().split("T")[0]
      if (stats.attendeesByDate[date] !== undefined) {
        stats.attendeesByDate[date] += 1
      }
    })

    setStats(stats)
  }

  // Improve the ticket distribution visualization
  const renderTicketDistributionChart = () => {
    const { vvipTickets, vipTickets, regularTickets } = stats
    const total = vvipTickets + vipTickets + regularTickets

    if (total === 0) return <div className="no-data">No ticket data available</div>

    // Calculate percentages for better visualization
    const vvipPercent = ((vvipTickets / total) * 100).toFixed(1)
    const vipPercent = ((vipTickets / total) * 100).toFixed(1)
    const regularPercent = ((regularTickets / total) * 100).toFixed(1)

    return (
      <div className="horizontal-bar-chart-container">
        <div className="chart-title">Ticket Distribution</div>
        <div className="horizontal-bar-chart">
          <div className="bar-labels">
            <div className="bar-label">VVIP</div>
            <div className="bar-label">VIP</div>
            <div className="bar-label">Regular</div>
          </div>
          <div className="bars">
            <div className="bar-row">
              <div className="horizontal-bar vvip" style={{ width: `${Math.max(5, (vvipTickets / total) * 100)}%` }}>
                <span className="bar-value">
                  {vvipTickets} ({vvipPercent}%)
                </span>
              </div>
            </div>
            <div className="bar-row">
              <div className="horizontal-bar vip" style={{ width: `${Math.max(5, (vipTickets / total) * 100)}%` }}>
                <span className="bar-value">
                  {vipTickets} ({vipPercent}%)
                </span>
              </div>
            </div>
            <div className="bar-row">
              <div
                className="horizontal-bar regular"
                style={{ width: `${Math.max(5, (regularTickets / total) * 100)}%` }}
              >
                <span className="bar-value">
                  {regularTickets} ({regularPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Add export functions
  const exportData = () => {
    setIsExporting(true)

    try {
      switch (exportFormat) {
        case "pdf":
          exportToPDF()
          break
        case "excel":
          exportToExcel()
          break
        case "csv":
          // CSV export is handled by the CSVLink component
          document.getElementById("csv-download-link").click()
          break
        default:
          exportToPDF()
      }
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Replace the exportToPDF function with this implementation
  const exportToPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246) // Primary color
    doc.text("Attendee Report", 105, 20, { align: "center" })

    // Add date and filters
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

    // Add filters info
    let filterText = "Filters: "
    if (genderFilter !== "all") filterText += `Gender: ${genderFilter}, `
    if (dateFilter) filterText += `Date: ${dateFilter}, `
    if (eventFilter !== "all") filterText += `Event: ${eventFilter.substring(0, 8)}..., `
    if (searchTerm) filterText += `Search: "${searchTerm}", `

    // Remove trailing comma and space
    filterText = filterText.endsWith(", ") ? filterText.slice(0, -2) : filterText
    if (filterText === "Filters: ") filterText += "None"

    doc.text(filterText, 14, 35)

    // Add summary section
    doc.setFontSize(14)
    doc.setTextColor(59, 130, 246)
    doc.text("Summary", 14, 45)

    // Add horizontal line
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(14, 47, 196, 47)

    // Summary stats in two columns
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    // Left column
    doc.text(`Total Attendees: ${filteredPayments.length}`, 14, 55)
    doc.text(`Male: ${filteredPayments.filter((p) => p.attendeeId.gender === "Male").length}`, 14, 62)
    doc.text(`Female: ${filteredPayments.filter((p) => p.attendeeId.gender === "Female").length}`, 14, 69)

    // Right column
    doc.text(`VVIP Tickets: ${filteredPayments.filter((p) => getTicketType(p) === "VVIP").length}`, 105, 55)
    doc.text(`VIP Tickets: ${filteredPayments.filter((p) => getTicketType(p) === "VIP").length}`, 105, 62)
    doc.text(`Regular Tickets: ${filteredPayments.filter((p) => getTicketType(p) === "Regular").length}`, 105, 69)

    // Add attendee list section
    doc.setFontSize(14)
    doc.setTextColor(59, 130, 246)
    doc.text("Attendee List", 14, 85)

    // Add horizontal line
    doc.line(14, 87, 196, 87)

    // Create a simpler list format instead of a complex table
    let yPos = 95
    const lineHeight = 7
    const pageHeight = doc.internal.pageSize.getHeight()

    // Add attendees
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    filteredPayments.forEach((payment, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = 20

        // Add header to new page
        doc.setFontSize(12)
        doc.setTextColor(59, 130, 246)
        doc.text("Attendee List (continued)", 14, yPos)
        doc.setDrawColor(200, 200, 200)
        doc.line(14, yPos + 2, 196, yPos + 2)
        yPos += 10
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
      }

      // Add alternating background for rows
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250)
        doc.rect(14, yPos - 4, 182, lineHeight + 4, "F")
      }

      // Name and gender
      doc.setFont("helvetica", "bold")
      doc.text(`${payment.attendeeId.firstName} ${payment.attendeeId.lastName}`, 14, yPos)

      // Gender with color indicator
      const gender = payment.attendeeId.gender
      doc.setFont("helvetica", "normal")
      doc.text(`(${gender})`, 80, yPos)

      // Ticket type with color indicator
      const ticketType = getTicketType(payment)
      doc.text(`${ticketType}`, 100, yPos)

      // Amount
      doc.text(`$${payment.amountPaid}`, 130, yPos)

      // Status
      doc.text(`${payment.status}`, 150, yPos)

      // Add contact info on next line
      yPos += lineHeight
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text(`Email: ${payment.attendeeId.email}`, 20, yPos)

      // Add event info
      yPos += lineHeight
      doc.text(`Event: ${getEventName(payment).substring(0, 40)}`, 20, yPos)

      // Add date
      doc.text(`Date: ${formatDate(payment.createdAt).split(",")[0]}`, 130, yPos)

      // Add separator line
      yPos += lineHeight
      doc.setDrawColor(230, 230, 230)
      doc.line(14, yPos - 2, 196, yPos - 2)

      // Move to next entry
      yPos += 3
    })

    // Add footer
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${totalPages}`, 196, 285, { align: "right" })
      doc.text("Generated by Attendee Tracker", 14, 285)
    }

    // Save the PDF
    doc.save(`Attendee_Report_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const exportToExcel = () => {
    // Prepare data
    const excelData = filteredPayments.map((payment) => ({
      "First Name": payment.attendeeId.firstName,
      "Last Name": payment.attendeeId.lastName,
      Gender: payment.attendeeId.gender,
      Email: payment.attendeeId.email,
      Phone: payment.attendeeId.phoneNumber,
      Event: getEventName(payment),
      "Ticket Type": getTicketType(payment),
      "Amount Paid": payment.amountPaid,
      Date: formatDate(payment.createdAt),
      Status: payment.status,
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Attendees")

    // Save the file
    XLSX.writeFile(wb, `Attendee_Report_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  // Get unique events for filter
  const uniqueEvents = useMemo(() => {
    const events = new Set()
    payments.forEach((payment) => {
      if (payment.response.eventId && payment.response.eventId._id) {
        events.add(payment.response.eventId._id)
      }
    })
    return Array.from(events)
  }, [payments])

  // Move the getEventName and getTicketType functions before they're used in csvData
  // Add these functions right after the uniqueEvents useMemo hook and before the filteredPayments useMemo hook

  // Get event name
  const getEventName = (payment) => {
    if (
      payment.response &&
      payment.response.eventId &&
      payment.response.eventId.bookingId &&
      payment.response.eventId.bookingId.response &&
      payment.response.eventId.bookingId.response.venueRequest
    ) {
      return payment.response.eventId.bookingId.response.venueRequest.eventName
    }
    return "Unknown Event"
  }

  // Get ticket type
  const getTicketType = (payment) => {
    if (!payment.response || !payment.response.categories) return "Unknown"

    const categories = payment.response.categories

    // Logic to determine which ticket type this attendee purchased
    // For simplicity, we'll assume the highest tier available is what they purchased
    if (categories.VVIP && categories.VVIP.count > 0) return "VVIP"
    if (categories.VIP && categories.VIP.count > 0) return "VIP"
    if (categories.Regular && categories.Regular.count > 0) return "Regular"

    return "Unknown"
  }

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Filter payments based on filters
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase()
      const nameMatch = `${payment.attendeeId.firstName} ${payment.attendeeId.lastName}`
        .toLowerCase()
        .includes(searchLower)
      const emailMatch = payment.attendeeId.email.toLowerCase().includes(searchLower)
      const phoneMatch = payment.attendeeId.phoneNumber.includes(searchTerm)

      if (searchTerm && !nameMatch && !emailMatch && !phoneMatch) {
        return false
      }

      // Gender filter
      if (genderFilter !== "all" && payment.attendeeId.gender !== genderFilter) {
        return false
      }

      // Date filter
      if (dateFilter) {
        const paymentDate = new Date(payment.createdAt).toISOString().split("T")[0]
        if (paymentDate !== dateFilter) {
          return false
        }
      }

      // Event filter
      if (eventFilter !== "all" && payment.response.eventId && payment.response.eventId._id !== eventFilter) {
        return false
      }

      return true
    })
  }, [payments, searchTerm, genderFilter, dateFilter, eventFilter])

  // Prepare CSV data
  const csvData = useMemo(() => {
    return filteredPayments.map((payment) => ({
      "First Name": payment.attendeeId.firstName,
      "Last Name": payment.attendeeId.lastName,
      Gender: payment.attendeeId.gender,
      Email: payment.attendeeId.email,
      Phone: payment.attendeeId.phoneNumber,
      Event: getEventName(payment),
      "Ticket Type": getTicketType(payment),
      "Amount Paid": payment.amountPaid,
      Date: formatDate(payment.createdAt),
      Status: payment.status,
    }))
  }, [filteredPayments])

  // Handle view attendee details
  const handleViewAttendee = (payment) => {
    setSelectedAttendee(payment)
    setShowAttendeeModal(true)
  }

  // Render line chart for attendees over time
  const renderLineChart = () => {
    const dates = Object.keys(stats.attendeesByDate).sort()
    const maxAttendees = Math.max(...Object.values(stats.attendeesByDate))

    if (dates.length === 0) return <div className="no-data">No date data available</div>

    return (
      <div className="line-chart-container">
        <div className="line-chart">
          <div className="y-axis">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="y-label">
                {Math.round((maxAttendees / 4) * (4 - i))}
              </div>
            ))}
          </div>
          <div className="chart-area">
            <svg width="100%" height="200" className="line-graph">
              <polyline
                points={dates
                  .map((date, index) => {
                    const x = (index / (dates.length - 1)) * 100 + "%"
                    const y = 200 - (stats.attendeesByDate[date] / maxAttendees) * 180
                    return `${x},${y}`
                  })
                  .join(" ")}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              {dates.map((date, index) => {
                const x = (index / (dates.length - 1)) * 100 + "%"
                const y = 200 - (stats.attendeesByDate[date] / maxAttendees) * 180
                return <circle key={date} cx={x} cy={y} r="4" fill="var(--primary)" />
              })}
            </svg>
            <div className="x-axis">
              {dates.map((date, index) => (
                <div key={date} className="x-label" style={{ left: `${(index / (dates.length - 1)) * 100}%` }}>
                  {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-legend">
          <div className="legend-title">Attendees Over Time</div>
        </div>
      </div>
    )
  }

  // Render payment status donut chart
  const renderPaymentStatusChart = () => {
    const { confirmed, pending, cancelled } = stats.paymentStatusCounts
    const total = confirmed + pending + cancelled

    if (total === 0) return <div className="no-data">No payment status data available</div>

    const confirmedPercent = (confirmed / total) * 100
    const pendingPercent = (pending / total) * 100
    const cancelledPercent = (cancelled / total) * 100

    // Calculate stroke-dasharray and stroke-dashoffset for each segment
    const radius = 50
    const circumference = 2 * Math.PI * radius

    const confirmedDash = (confirmedPercent / 100) * circumference
    const pendingDash = (pendingPercent / 100) * circumference
    const cancelledDash = (cancelledPercent / 100) * circumference

    const pendingOffset = confirmedDash
    const cancelledOffset = confirmedDash + pendingDash

    return (
      <div className="donut-chart-container">
        <svg width="150" height="150" viewBox="0 0 120 120" className="donut-chart">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="transparent"
            stroke="var(--confirmed)"
            strokeWidth="15"
            strokeDasharray={circumference}
            strokeDashoffset="0"
          />
          {pending > 0 && (
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke="var(--pending)"
              strokeWidth="15"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - pendingOffset}
              transform="rotate(-90 60 60)"
            />
          )}
          {cancelled > 0 && (
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke="var(--cancelled)"
              strokeWidth="15"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - cancelledOffset}
              transform="rotate(-90 60 60)"
            />
          )}
          <circle cx="60" cy="60" r="40" fill="white" />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">
            {total}
          </text>
          <text x="60" y="75" textAnchor="middle" dominantBaseline="middle" fontSize="10">
            Payments
          </text>
        </svg>
        <div className="chart-legend">
          <div className="legend-title">Payment Status</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color confirmed"></span>
              <span>Confirmed ({confirmed})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color pending"></span>
              <span>Pending ({pending})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color cancelled"></span>
              <span>Cancelled ({cancelled})</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="attendee-tracker loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading attendee data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="attendee-tracker error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="attendee-tracker">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>Attendee Tracker</h1>
          <p>
            Welcome, {user?.fname} {user?.lname}
          </p>
        </div>
        <div className="header-right">
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{stats.totalAttendees}</span>
              <span className="stat-label">Attendees</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">${stats.totalRevenue.toFixed(2)}</span>
              <span className="stat-label">Revenue</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter">
            <label>Gender:</label>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="filter-select">
              <option value="all">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="filter">
            <label>Date:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-date"
            />
          </div>

          <div className="filter">
            <label>Event:</label>
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="filter-select">
              <option value="all">All Events</option>
              {uniqueEvents.map((eventId) => (
                <option key={eventId} value={eventId}>
                  Event {eventId.substring(0, 8)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={`view-button ${activeView === "list" ? "active" : ""}`}
            onClick={() => setActiveView("list")}
          >
            <i className="icon-list"></i>
            List
          </button>
          <button
            className={`view-button ${activeView === "grid" ? "active" : ""}`}
            onClick={() => setActiveView("grid")}
          >
            <i className="icon-grid"></i>
            Grid
          </button>
          <button
            className={`view-button ${activeView === "stats" ? "active" : ""}`}
            onClick={() => setActiveView("stats")}
          >
            <i className="icon-stats"></i>
            Stats
          </button>
        </div>

        {/* Add export controls to the filters container */}
        {/* Add this after the view-toggle div in the filters-container */}
        <div className="export-controls">
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="filter-select">
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
          <button className="export-button" onClick={exportData} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
          {/* Hidden CSV link for direct download */}
          <CSVLink
            data={csvData}
            filename={`Attendee_Report_${new Date().toISOString().split("T")[0]}.csv`}
            className="hidden"
            id="csv-download-link"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="results-count">
        <p>
          Showing {filteredPayments.length} of {payments.length} attendees
        </p>
      </div>

      {/* List View */}
      {activeView === "list" && (
        <div className="attendees-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Event</th>
                <th>Ticket Type</th>
                <th>Amount Paid</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <div className="attendee-name">
                      <div className="avatar">
                        {payment.attendeeId.firstName.charAt(0)}
                        {payment.attendeeId.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="name">
                          {payment.attendeeId.firstName} {payment.attendeeId.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`gender-badge ${payment.attendeeId.gender.toLowerCase()}`}>
                      {payment.attendeeId.gender}
                    </span>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{payment.attendeeId.email}</div>
                      <div className="phone">{payment.attendeeId.phoneNumber}</div>
                    </div>
                  </td>
                  <td>{getEventName(payment)}</td>
                  <td>
                    <span className={`ticket-type ${getTicketType(payment).toLowerCase()}`}>
                      {getTicketType(payment)}
                    </span>
                  </td>
                  <td>${payment.amountPaid}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${payment.status.toLowerCase()}`}>{payment.status}</span>
                  </td>
                  <td>
                    <button className="view-button" onClick={() => handleViewAttendee(payment)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {activeView === "grid" && (
        <div className="attendees-grid">
          {filteredPayments.map((payment) => (
            <div key={payment._id} className="attendee-card" onClick={() => handleViewAttendee(payment)}>
              <div className="card-header">
                <div className="avatar large">
                  {payment.attendeeId.firstName.charAt(0)}
                  {payment.attendeeId.lastName.charAt(0)}
                </div>
                <div className="ticket-badge">
                  <span className={`ticket-type ${getTicketType(payment).toLowerCase()}`}>
                    {getTicketType(payment)}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <h3>
                  {payment.attendeeId.firstName} {payment.attendeeId.lastName}
                </h3>
                <div className="card-details">
                  <p>
                    <i className="icon-email"></i>
                    {payment.attendeeId.email}
                  </p>
                  <p>
                    <i className="icon-phone"></i>
                    {payment.attendeeId.phoneNumber}
                  </p>
                  <p>
                    <i className="icon-gender"></i>
                    {payment.attendeeId.gender}
                  </p>
                  <p>
                    <i className="icon-calendar"></i>
                    {formatDate(payment.createdAt).split(",")[0]}
                  </p>
                  <p>
                    <i className="icon-event"></i>
                    {getEventName(payment)}
                  </p>
                </div>
              </div>
              <div className="card-footer">
                <span className={`status-badge ${payment.status.toLowerCase()}`}>{payment.status}</span>
                <span className="amount">${payment.amountPaid}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats View */}
      {activeView === "stats" && (
        <div className="stats-view">
          <div className="metric-tabs">
            <button
              className={`metric-tab ${activeMetricTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveMetricTab("overview")}
            >
              Overview
            </button>
            <button
              className={`metric-tab ${activeMetricTab === "tickets" ? "active" : ""}`}
              onClick={() => setActiveMetricTab("tickets")}
            >
              Tickets
            </button>
            <button
              className={`metric-tab ${activeMetricTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveMetricTab("payments")}
            >
              Payments
            </button>
            
          </div>

          {/* Overview Tab */}
          {activeMetricTab === "overview" && (
            <>
              <div className="stats-cards">
                <div className="stats-card">
                  <div className="stats-card-header">
                    <h3>Attendee Demographics</h3>
                  </div>
                  <div className="stats-card-body">
                    <div className="chart-container">
                      <div className="pie-chart">
                        <div
                          className="pie-slice male"
                          style={{
                            transform: `rotate(0deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, ${stats.maleAttendees / stats.totalAttendees > 0.5 ? "100% 0%, 100% 100%, 0% 100%, 0% 0%" : "100% 0%"})`,
                          }}
                        ></div>
                        <div
                          className="pie-slice female"
                          style={{
                            transform: `rotate(${(stats.maleAttendees / stats.totalAttendees) * 360}deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, ${stats.femaleAttendees / stats.totalAttendees > 0.5 ? "100% 0%, 100% 100%, 0% 100%, 0% 0%" : "100% 0%"})`,
                          }}
                        ></div>
                      </div>
                      <div className="chart-legend">
                        <div className="legend-item">
                          <span className="legend-color male"></span>
                          <span>Male ({stats.maleAttendees})</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color female"></span>
                          <span>Female ({stats.femaleAttendees})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                

                <div className="stats-card">
                  <div className="stats-card-header">
                    <h3>Payment Status</h3>
                  </div>
                  <div className="stats-card-body">{renderPaymentStatusChart()}</div>
                </div>
              </div>

              <div className="stats-card full-width">
                <div className="stats-card-header">
                  <h3>Attendees Over Time</h3>
                </div>
                <div className="stats-card-body">{renderLineChart()}</div>
              </div>

              <div className="stats-table-container">
                <h3>Event Summary</h3>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Attendees</th>
                      <th>Male</th>
                      <th>Female</th>
                      <th>VVIP</th>
                      <th>VIP</th>
                      <th>Regular</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueEvents.map((eventId) => {
                      const eventPayments = payments.filter(
                        (p) => p.response.eventId && p.response.eventId._id === eventId,
                      )

                      if (eventPayments.length === 0) return null

                      const eventName = eventPayments[0].response.eventId.bookingId.response.venueRequest.eventName
                      const eventMale = eventPayments.filter((p) => p.attendeeId.gender === "Male").length
                      const eventFemale = eventPayments.filter((p) => p.attendeeId.gender === "Female").length
                      const eventRevenue = eventPayments.reduce((sum, p) => sum + p.amountPaid, 0)

                      // Count ticket types
                      const vvipCount = eventPayments.filter((p) => getTicketType(p) === "VVIP").length
                      const vipCount = eventPayments.filter((p) => getTicketType(p) === "VIP").length
                      const regularCount = eventPayments.filter((p) => getTicketType(p) === "Regular").length

                      return (
                        <tr key={eventId}>
                          <td>{eventName}</td>
                          <td>{eventPayments.length}</td>
                          <td>{eventMale}</td>
                          <td>{eventFemale}</td>
                          <td>{vvipCount}</td>
                          <td>{vipCount}</td>
                          <td>{regularCount}</td>
                          <td>${eventRevenue.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tickets Tab */}
          {activeMetricTab === "tickets" && (
            <div className="metric-content">
              <div className="stats-row">
                <div className="stats-card half-width">
                  <div className="stats-card-header">
                    <h3>Ticket Distribution</h3>
                  </div>
                  <div className="stats-card-body">{renderTicketDistributionChart()}</div>
                </div>

                <div className="stats-card half-width">
                  <div className="stats-card-header">
                    <h3>Ticket Distribution (Pie Chart)</h3>
                  </div>
                  <div className="stats-card-body">
                    <div className="pie-chart-container">
                      <div className="pie-chart ticket-pie">
                        <div
                          className="pie-slice vvip"
                          style={{
                            transform: `rotate(0deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, ${stats.vvipTickets / (stats.vvipTickets + stats.vipTickets + stats.regularTickets) > 0.5 ? "100% 0%, 100% 100%, 0% 100%, 0% 0%" : "100% 0%"})`,
                          }}
                        ></div>
                        <div
                          className="pie-slice vip"
                          style={{
                            transform: `rotate(${(stats.vvipTickets / (stats.vvipTickets + stats.vipTickets + stats.regularTickets)) * 360}deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, ${stats.vipTickets / (stats.vvipTickets + stats.vipTickets + stats.regularTickets) > 0.5 ? "100% 0%, 100% 100%, 0% 100%, 0% 0%" : "100% 0%"})`,
                          }}
                        ></div>
                        <div
                          className="pie-slice regular"
                          style={{
                            transform: `rotate(${((stats.vvipTickets + stats.vipTickets) / (stats.vvipTickets + stats.vipTickets + stats.regularTickets)) * 360}deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, ${stats.regularTickets / (stats.vvipTickets + stats.vipTickets + stats.regularTickets) > 0.5 ? "100% 0%, 100% 100%, 0% 100%, 0% 0%" : "100% 0%"})`,
                          }}
                        ></div>
                      </div>
                      <div className="chart-legend">
                        <div className="legend-item">
                          <span className="legend-color vvip"></span>
                          <span>VVIP ({stats.vvipTickets})</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color vip"></span>
                          <span>VIP ({stats.vipTickets})</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color regular"></span>
                          <span>Regular ({stats.regularTickets})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-card full-width">
                <div className="stats-card-header">
                  <h3>Ticket Sales by Event</h3>
                </div>
                <div className="stats-card-body ticket-sales-by-event">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>VVIP Tickets</th>
                        <th>VIP Tickets</th>
                        <th>Regular Tickets</th>
                        <th>Total Tickets</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueEvents.map((eventId) => {
                        const eventPayments = payments.filter(
                          (p) => p.response.eventId && p.response.eventId._id === eventId,
                        )

                        if (eventPayments.length === 0) return null

                        const eventName = eventPayments[0].response.eventId.bookingId.response.venueRequest.eventName
                        const eventRevenue = eventPayments.reduce((sum, p) => sum + p.amountPaid, 0)

                        // Count ticket types
                        const vvipCount = eventPayments.filter((p) => getTicketType(p) === "VVIP").length
                        const vipCount = eventPayments.filter((p) => getTicketType(p) === "VIP").length
                        const regularCount = eventPayments.filter((p) => getTicketType(p) === "Regular").length

                        return (
                          <tr key={eventId}>
                            <td>{eventName}</td>
                            <td>{vvipCount}</td>
                            <td>{vipCount}</td>
                            <td>{regularCount}</td>
                            <td>{vvipCount + vipCount + regularCount}</td>
                            <td>${eventRevenue.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="stats-card full-width">
                <div className="stats-card-header">
                  <h3>Ticket Distribution Visualization</h3>
                </div>
                <div className="stats-card-body">
                  <div className="stacked-bar-chart">
                    {uniqueEvents.map((eventId) => {
                      const eventPayments = payments.filter(
                        (p) => p.response.eventId && p.response.eventId._id === eventId,
                      )

                      if (eventPayments.length === 0) return null

                      const eventName = eventPayments[0].response.eventId.bookingId.response.venueRequest.eventName

                      // Count ticket types
                      const vvipCount = eventPayments.filter((p) => getTicketType(p) === "VVIP").length
                      const vipCount = eventPayments.filter((p) => getTicketType(p) === "VIP").length
                      const regularCount = eventPayments.filter((p) => getTicketType(p) === "Regular").length
                      const total = vvipCount + vipCount + regularCount

                      return (
                        <div key={eventId} className="stacked-bar-item">
                          <div className="stacked-bar">
                            <div
                              className="stacked-segment vvip"
                              style={{ height: `${(vvipCount / total) * 100}%` }}
                              title={`VVIP: ${vvipCount}`}
                            ></div>
                            <div
                              className="stacked-segment vip"
                              style={{ height: `${(vipCount / total) * 100}%` }}
                              title={`VIP: ${vipCount}`}
                            ></div>
                            <div
                              className="stacked-segment regular"
                              style={{ height: `${(regularCount / total) * 100}%` }}
                              title={`Regular: ${regularCount}`}
                            ></div>
                          </div>
                          <div className="stacked-bar-label">
                            {eventName.substring(0, 15)}
                            {eventName.length > 15 ? "..." : ""}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeMetricTab === "payments" && (
            <div className="metric-content">
              <div className="stats-row">
                <div className="stats-card half-width">
                  <div className="stats-card-header">
                    <h3>Payment Status</h3>
                  </div>
                  <div className="stats-card-body">{renderPaymentStatusChart()}</div>
                </div>

                <div className="stats-card half-width">
                  <div className="stats-card-header">
                    <h3>Revenue Summary</h3>
                  </div>
                  <div className="stats-card-body">
                    <div className="revenue-summary">
                      <div className="revenue-item">
                        <span className="revenue-label">Total Revenue</span>
                        <span className="revenue-value">${stats.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="revenue-item">
                        <span className="revenue-label">Average per Attendee</span>
                        <span className="revenue-value">${(stats.totalRevenue / stats.totalAttendees).toFixed(2)}</span>
                      </div>
                      <div className="revenue-item">
                        <span className="revenue-label">VVIP Revenue</span>
                        <span className="revenue-value">${(stats.vvipTickets * 3).toFixed(2)}</span>
                      </div>
                      <div className="revenue-item">
                        <span className="revenue-label">VIP Revenue</span>
                        <span className="revenue-value">${(stats.vipTickets * 2).toFixed(2)}</span>
                      </div>
                      <div className="revenue-item">
                        <span className="revenue-label">Regular Revenue</span>
                        <span className="revenue-value">${(stats.regularTickets * 1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-card full-width">
                <div className="stats-card-header">
                  <h3>Payment Methods</h3>
                </div>
                <div className="stats-card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment Method</th>
                        <th>Number of Transactions</th>
                        <th>Total Amount</th>
                        <th>Average Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Calculate payment method stats
                        const methodStats = {}

                        payments.forEach((payment) => {
                          payment.paymentDetails.forEach((detail) => {
                            const method = detail.paymentMethod || "Unknown"
                            const amount = detail.amount || 0

                            if (!methodStats[method]) {
                              methodStats[method] = {
                                count: 0,
                                total: 0,
                              }
                            }

                            methodStats[method].count += 1
                            methodStats[method].total += amount
                          })
                        })

                        return Object.entries(methodStats).map(([method, stats]) => (
                          <tr key={method}>
                            <td>{method}</td>
                            <td>{stats.count}</td>
                            <td>${stats.total.toFixed(2)}</td>
                            <td>${(stats.total / stats.count).toFixed(2)}</td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeMetricTab === "trends" && (
            <div className="metric-content">
              <div className="stats-card full-width">
                <div className="stats-card-header">
                  <h3>Attendees Over Time</h3>
                </div>
                <div className="stats-card-body">{renderLineChart()}</div>
              </div>

              <div className="stats-row">
                <div className="stats-card half-width">
                  <div className="stats-card-header">
                    <h3>Gender Distribution Over Time</h3>
                  </div>
                  <div className="stats-card-body">
                    <div className="line-chart-container">
                      {(() => {
                        // Calculate gender distribution over time
                        const dates = Object.keys(stats.attendeesByDate).sort()
                        const genderByDate = {}

                        dates.forEach((date) => {
                          genderByDate[date] = {
                            male: 0,
                            female: 0,
                          }
                        })

                        payments.forEach((payment) => {
                          const date = new Date(payment.createdAt).toISOString().split("T")[0]
                          if (genderByDate[date]) {
                            if (payment.attendeeId.gender === "Male") {
                              genderByDate[date].male += 1
                            } else if (payment.attendeeId.gender === "Female") {
                              genderByDate[date].female += 1
                            }
                          }
                        })

                        const maxAttendees = Math.max(
                          ...Object.values(genderByDate).map((g) => Math.max(g.male, g.female)),
                        )

                        if (dates.length === 0) return <div className="no-data">No date data available</div>

                        return (
                          <svg width="100%" height="200" className="line-graph">
                            {/* Male line */}
                            <polyline
                              points={dates
                                .map((date, index) => {
                                  const x = (index / (dates.length - 1)) * 100 + "%"
                                  const y = 200 - (genderByDate[date].male / maxAttendees) * 180
                                  return `${x},${y}`
                                })
                                .join(" ")}
                              fill="none"
                              stroke="var(--male)"
                              strokeWidth="2"
                            />

                            {/* Female line */}
                            <polyline
                              points={dates
                                .map((date, index) => {
                                  const x = (index / (dates.length - 1)) * 100 + "%"
                                  const y = 200 - (genderByDate[date].female / maxAttendees) * 180
                                  return `${x},${y}`
                                })
                                .join(" ")}
                              fill="none"
                              stroke="var(--female)"
                              strokeWidth="2"
                            />

                            {/* X-axis labels */}
                            {dates.map((date, index) => (
                              <text
                                key={date}
                                x={`${(index / (dates.length - 1)) * 100}%`}
                                y="220"
                                fontSize="10"
                                textAnchor="middle"
                              >
                                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </text>
                            ))}
                          </svg>
                        )
                      })()}
                      <div className="chart-legend">
                        <div className="legend-item">
                          <span className="legend-color male"></span>
                          <span>Male</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color female"></span>
                          <span>Female</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stats-card half-width">
                  <div className="stats-card-header">
                    <h3>Ticket Types Over Time</h3>
                  </div>
                  <div className="stats-card-body">
                    <div className="line-chart-container">
                      {(() => {
                        // Calculate ticket types over time
                        const dates = Object.keys(stats.attendeesByDate).sort()
                        const ticketsByDate = {}

                        dates.forEach((date) => {
                          ticketsByDate[date] = {
                            vvip: 0,
                            vip: 0,
                            regular: 0,
                          }
                        })

                        payments.forEach((payment) => {
                          const date = new Date(payment.createdAt).toISOString().split("T")[0]
                          if (ticketsByDate[date]) {
                            const ticketType = getTicketType(payment).toLowerCase()
                            if (ticketType === "vvip" || ticketType === "vip" || ticketType === "regular") {
                              ticketsByDate[date][ticketType] += 1
                            }
                          }
                        })

                        const maxTickets = Math.max(
                          ...Object.values(ticketsByDate).map((t) => Math.max(t.vvip, t.vip, t.regular)),
                        )

                        if (dates.length === 0) return <div className="no-data">No date data available</div>

                        return (
                          <svg width="100%" height="200" className="line-graph">
                            {/* VVIP line */}
                            <polyline
                              points={dates
                                .map((date, index) => {
                                  const x = (index / (dates.length - 1)) * 100 + "%"
                                  const y = 200 - (ticketsByDate[date].vvip / maxTickets) * 180
                                  return `${x},${y}`
                                })
                                .join(" ")}
                              fill="none"
                              stroke="var(--vvip)"
                              strokeWidth="2"
                            />

                            {/* VIP line */}
                            <polyline
                              points={dates
                                .map((date, index) => {
                                  const x = (index / (dates.length - 1)) * 100 + "%"
                                  const y = 200 - (ticketsByDate[date].vip / maxTickets) * 180
                                  return `${x},${y}`
                                })
                                .join(" ")}
                              fill="none"
                              stroke="var(--vip)"
                              strokeWidth="2"
                            />

                            {/* Regular line */}
                            <polyline
                              points={dates
                                .map((date, index) => {
                                  const x = (index / (dates.length - 1)) * 100 + "%"
                                  const y = 200 - (ticketsByDate[date].regular / maxTickets) * 180
                                  return `${x},${y}`
                                })
                                .join(" ")}
                              fill="none"
                              stroke="var(--regular)"
                              strokeWidth="2"
                            />

                            {/* X-axis labels */}
                            {dates.map((date, index) => (
                              <text
                                key={date}
                                x={`${(index / (dates.length - 1)) * 100}%`}
                                y="220"
                                fontSize="10"
                                textAnchor="middle"
                              >
                                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </text>
                            ))}
                          </svg>
                        )
                      })()}
                      <div className="chart-legend">
                        <div className="legend-item">
                          <span className="legend-color vvip"></span>
                          <span>VVIP</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color vip"></span>
                          <span>VIP</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color regular"></span>
                          <span>Regular</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendee Modal */}
      {showAttendeeModal && selectedAttendee && (
        <div className="modal-overlay" onClick={() => setShowAttendeeModal(false)}>
          <div className="attendee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attendee Details</h2>
              <button className="close-button" onClick={() => setShowAttendeeModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="attendee-profile">
                <div className="profile-header">
                  <div className="avatar large">
                    {selectedAttendee.attendeeId.firstName.charAt(0)}
                    {selectedAttendee.attendeeId.lastName.charAt(0)}
                  </div>
                  <div className="profile-name">
                    <h3>
                      {selectedAttendee.attendeeId.firstName} {selectedAttendee.attendeeId.lastName}
                    </h3>
                    <span className={`gender-badge ${selectedAttendee.attendeeId.gender.toLowerCase()}`}>
                      {selectedAttendee.attendeeId.gender}
                    </span>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="detail-group">
                    <h4>Contact Information</h4>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedAttendee.attendeeId.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedAttendee.attendeeId.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>Event Information</h4>
                    <div className="detail-item">
                      <span className="detail-label">Event Name:</span>
                      <span className="detail-value">{getEventName(selectedAttendee)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Event ID:</span>
                      <span className="detail-value">
                        {selectedAttendee.response.eventId && selectedAttendee.response.eventId._id}
                      </span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>Ticket Information</h4>
                    <div className="detail-item">
                      <span className="detail-label">Ticket Type:</span>
                      <span className={`ticket-type ${getTicketType(selectedAttendee).toLowerCase()}`}>
                        {getTicketType(selectedAttendee)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Purchase Date:</span>
                      <span className="detail-value">{formatDate(selectedAttendee.createdAt)}</span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>Payment Information</h4>
                    <div className="detail-item">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">${selectedAttendee.totalAmount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount Paid:</span>
                      <span className="detail-value">${selectedAttendee.amountPaid}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${selectedAttendee.status.toLowerCase()}`}>
                        {selectedAttendee.status}
                      </span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>Payment Details</h4>
                    <div className="payment-details">
                      {selectedAttendee.paymentDetails.map((detail, index) => (
                        <div key={index} className="payment-detail-item">
                          <div className="detail-item">
                            <span className="detail-label">Method:</span>
                            <span className="detail-value">{detail.paymentMethod}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Transaction ID:</span>
                            <span className="detail-value">{detail.transactionId}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Amount:</span>
                            <span className="detail-value">${detail.amount}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{formatDate(detail.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-button" onClick={() => setShowAttendeeModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
  /* Export Controls */
  .export-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .export-button {
    padding: 0.5rem 1rem;
    background-color: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .export-button:hover {
    background-color: var(--primary-dark);
  }

  .export-button:disabled {
    background-color: var(--border);
    cursor: not-allowed;
  }

  .hidden {
    display: none;
  }

  /* Base Styles */
:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --secondary: #10b981;
  --secondary-light: #34d399;
  --secondary-dark: #059669;
  --accent: #f59e0b;
  --accent-light: #fbbf24;
  --accent-dark: #d97706;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  --background: #f9fafb;
  --foreground: #1f2937;
  --card: #ffffff;
  --card-foreground: #1f2937;
  --border: #e5e7eb;
  --input: #e5e7eb;
  --ring: #6366f1;
  --radius: 0.5rem;

  /* Ticket Types */
  --vvip: #8b5cf6;
  --vip: #3b82f6;
  --regular: #10b981;

  /* Gender Colors */
  --male: #3b82f6;
  --female: #ec4899;

  /* Status Colors */
  --confirmed: #10b981;
  --pending: #f59e0b;
  --cancelled: #ef4444;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
    "Helvetica Neue", sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  line-height: 1.5;
}

/* Main Container */
.attendee-tracker {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.header-left h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.header-left p {
  color: var(--foreground);
  opacity: 0.8;
}

.header-right {
  display: flex;
  align-items: center;
}

.stats-summary {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--foreground);
  opacity: 0.7;
}

/* Filters */
.filters-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.search-container {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--input);
  border-radius: var(--radius);
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--foreground);
  opacity: 0.7;
}

.filter-select,
.filter-date {
  padding: 0.5rem;
  border: 1px solid var(--input);
  border-radius: var(--radius);
  font-size: 0.875rem;
  min-width: 150px;
  background-color: white;
}

.filter-select:focus,
.filter-date:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--input);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-button:hover {
  background-color: var(--primary-light);
  color: white;
  border-color: var(--primary-light);
}

.view-button.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.results-count {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--foreground);
  opacity: 0.7;
}

/* Icons */
.icon-list,
.icon-grid,
.icon-stats,
.icon-email,
.icon-phone,
.icon-gender,
.icon-calendar,
.icon-event {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: currentColor;
  mask-size: cover;
  -webkit-mask-size: cover;
}

.icon-list {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='8' y1='6' x2='21' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='12' x2='21' y2='12'%3E%3C/line%3E%3Cline x1='8' y1='18' x2='21' y2='18'%3E%3C/line%3E%3Cline x1='3' y1='6' x2='3.01' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='12' x2='3.01' y2='12'%3E%3C/line%3E%3Cline x1='3' y1='18' x2='3.01' y2='18'%3E%3C/line%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='8' y1='6' x2='21' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='12' x2='21' y2='12'%3E%3C/line%3E%3Cline x1='8' y1='18' x2='21' y2='18'%3E%3C/line%3E%3Cline x1='3' y1='6' x2='3.01' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='12' x2='3.01' y2='12'%3E%3C/line%3E%3Cline x1='3' y1='18' x2='3.01' y2='18'%3E%3C/line%3E%3C/svg%3E");
}

.icon-grid {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='14' width='7' height='7'%3E%3C/rect%3E%3Crect x='3' y='14' width='7' height='7'%3E%3C/rect%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='14' width='7' height='7'%3E%3C/rect%3E%3Crect x='3' y='14' width='7' height='7'%3E%3C/rect%3E%3C/svg%3E");
}

.icon-stats {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='20' x2='18' y2='10'%3E%3C/line%3E%3Cline x1='12' y1='20' x2='12' y2='4'%3E%3C/line%3E%3Cline x1='6' y1='20' x2='6' y2='14'%3E%3C/line%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='20' x2='18' y2='10'%3E%3C/line%3E%3Cline x1='12' y1='20' x2='12' y2='4'%3E%3C/line%3E%3Cline x1='6' y1='20' x2='6' y2='14'%3E%3C/line%3E%3C/svg%3E");
}

.icon-email {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'%3E%3C/path%3E%3Cpolyline points='22,6 12,13 2,6'%3E%3C/polyline%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'%3E%3C/path%3E%3Cpolyline points='22,6 12,13 2,6'%3E%3C/polyline%3E%3C/svg%3E");
}

.icon-phone {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'%3E%3C/path%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'%3E%3C/path%3E%3C/svg%3E");
}

.icon-gender {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='7'%3E%3C/circle%3E%3Cpolyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88'%3E%3C/polyline%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='7'%3E%3C/circle%3E%3Cpolyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88'%3E%3C/polyline%3E%3C/svg%3E");
}

.icon-calendar {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
}

.icon-event {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cpath d='M16 2v4'%3E%3C/path%3E%3Cpath d='M8 2v4'%3E%3C/path%3E%3Cpath d='M3 10h18'%3E%3C/path%3E%3Cpath d='M8 14h.01'%3E%3C/path%3E%3Cpath d='M12 14h.01'%3E%3C/path%3E%3Cpath d='M16 14h.01'%3E%3C/path%3E%3Cpath d='M8 18h.01'%3E%3C/path%3E%3Cpath d='M12 18h.01'%3E%3C/path%3E%3Cpath d='M16 18h.01'%3E%3C/path%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cpath d='M16 2v4'%3E%3C/path%3E%3Cpath d='M8 2v4'%3E%3C/path%3E%3Cpath d='M3 10h18'%3E%3C/path%3E%3Cpath d='M8 14h.01'%3E%3C/path%3E%3Cpath d='M12 14h.01'%3E%3C/path%3E%3Cpath d='M16 14h.01'%3E%3C/path%3E%3Cpath d='M8 18h.01'%3E%3C/path%3E%3Cpath d='M12 18h.01'%3E%3C/path%3E%3Cpath d='M16 18h.01'%3E%3C/path%3E%3C/svg%3E");
}

/* List View */
.attendees-list {
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow-x: auto;
}

.attendees-list table {
  width: 100%;
  border-collapse: collapse;
}

.attendees-list th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--foreground);
  opacity: 0.7;
  border-bottom: 1px solid var(--border);
}

.attendees-list td {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
}

.attendees-list tr:last-child td {
  border-bottom: none;
}

.attendees-list tr:hover {
  background-color: rgba(99, 102, 241, 0.05);
}

.attendee-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.avatar.large {
  width: 4rem;
  height: 4rem;
  font-size: 1.25rem;
}

.name {
  font-weight: 500;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.phone {
  color: var(--foreground);
  opacity: 0.7;
}

.gender-badge,
.ticket-type,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.gender-badge.male {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--male);
}

.gender-badge.female {
  background-color: rgba(236, 72, 153, 0.1);
  color: var(--female);
}

.ticket-type {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--regular);
}

.ticket-type.vvip {
  background-color: rgba(139, 92, 246, 0.1);
  color: var(--vvip);
}

.ticket-type.vip {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--vip);
}

.ticket-type.regular {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--regular);
}

.status-badge.confirmed {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--confirmed);
}

.status-badge.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--pending);
}

.status-badge.cancelled {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--cancelled);
}

.view-button {
  padding: 0.25rem 0.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-button:hover {
  background-color: var(--primary-dark);
}

/* Grid View */
.attendees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.attendee-card {
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.attendee-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.card-header {
  position: relative;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  background-color: var(--primary);
  color: white;
}

.ticket-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.card-body {
  padding: 1.5rem;
}

.card-body h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-details p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
}

.amount {
  font-weight: 600;
  color: var(--primary);
}

/* Stats View */
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metric-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.metric-tab {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
  opacity: 0.7;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.metric-tab:hover {
  opacity: 1;
}

.metric-tab.active {
  color: var(--primary);
  opacity: 1;
  border-bottom: 2px solid var(--primary);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stats-card {
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.stats-card.full-width {
  grid-column: 1 / -1;
}

.stats-card.half-width {
  min-width: calc(50% - 0.75rem);
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stats-card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.stats-card-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.stats-card-body {
  padding: 1.5rem;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.pie-chart {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f3f4f6;
  overflow: hidden;
}

.pie-slice {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
}

.pie-slice.male {
  background-color: var(--male);
}

.pie-slice.female {
  background-color: var(--female);
}

.pie-slice.vvip {
  background-color: var(--vvip);
}

.pie-slice.vip {
  background-color: var(--vip);
}

.pie-slice.regular {
  background-color: var(--regular);
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.male {
  background-color: var(--male);
}

.legend-color.female {
  background-color: var(--female);
}

.legend-color.vvip {
  background-color: var(--vvip);
}

.legend-color.vip {
  background-color: var(--vip);
}

.legend-color.regular {
  background-color: var(--regular);
}

.legend-color.confirmed {
  background-color: var(--confirmed);
}

.legend-color.pending {
  background-color: var(--pending);
}

.legend-color.cancelled {
  background-color: var(--cancelled);
}

.bar-chart {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 1rem;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 60px;
}

.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s;
}

.bar.vvip {
  background-color: var(--vvip);
}

.bar.vip {
  background-color: var(--vip);
}

.bar.regular {
  background-color: var(--regular);
}

.bar-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.revenue-summary {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.revenue-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: var(--radius);
}

.revenue-label {
  font-weight: 500;
}

.revenue-value {
  font-weight: 600;
  color: var(--primary);
}

.stats-table-container {
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.stats-table-container h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.stats-table th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--foreground);
  opacity: 0.7;
}

/* Line Chart */
.line-chart-container {
  width: 100%;
  position: relative;
}

.line-chart {
  display: flex;
  height: 250px;
  position: relative;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  height: 200px;
}

.y-label {
  font-size: 0.75rem;
  color: var(--foreground);
  opacity: 0.7;
}

.chart-area {
  flex: 1;
  position: relative;
}

.line-graph {
  width: 100%;
  height: 200px;
}

.x-axis {
  position: relative;
  height: 30px;
  margin-top: 10px;
}

.x-label {
  position: absolute;
  font-size: 0.75rem;
  color: var(--foreground);
  opacity: 0.7;
  transform: translateX(-50%);
}

/* Donut Chart */
.donut-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.donut-chart {
  width: 150px;
  height: 150px;
}

/* Horizontal Bar Chart */
.horizontal-bar-chart-container {
  width: 100%;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.horizontal-bar-chart {
  display: flex;
  gap: 1rem;
}

.bar-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 80px;
}

.bar-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.bar-row {
  height: 30px;
  display: flex;
  align-items: center;
}

.horizontal-bar {
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  transition: width 0.5s;
}

.horizontal-bar.vvip {
  background-color: var(--vvip);
}

.horizontal-bar.vip {
  background-color: var(--vip);
}

.horizontal-bar.regular {
  background-color: var(--regular);
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--foreground);
  opacity: 0.7;
}

/* Stacked Bar Chart */
.stacked-bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250px;
  width: 100%;
}

.stacked-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 60px;
}

.stacked-bar {
  width: 40px;
  height: 200px;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 4px;
  overflow: hidden;
}

.stacked-segment {
  width: 100%;
  transition: height 0.5s;
}

.stacked-segment.vvip {
  background-color: var(--vvip);
}

.stacked-segment.vip {
  background-color: var(--vip);
}

.stacked-segment.regular {
  background-color: var(--regular);
}

.stacked-bar-label {
  font-size: 0.75rem;
  text-align: center;
}

/* No Data Message */
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
  color: var(--foreground);
  opacity: 0.7;
  font-style: italic;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.attendee-modal {
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modal-in 0.3s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--foreground);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.attendee-profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-name {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-name h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-group h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
  opacity: 0.7;
  text-transform: uppercase;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--foreground);
  opacity: 0.7;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-detail-item {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
}

.modal-footer .close-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: white;
  border-radius: var(--radius);
  font-size: 0.875rem;
  opacity: 1;
}

.modal-footer .close-button:hover {
  background-color: var(--primary-dark);
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(99, 102, 241, 0.1);
  border-left-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  padding: 2rem;
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 400px;
}

.error-message h2 {
  color: var(--danger);
  margin-bottom: 1rem;
}

.error-message p {
  margin-bottom: 1.5rem;
}

.error-message button {
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-message button:hover {
  background-color: var(--primary-dark);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .attendee-tracker {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters-container {
    flex-direction: column;
  }

  .search-container {
    width: 100%;
  }

  .filters {
    width: 100%;
  }

  .view-toggle {
    width: 100%;
    justify-content: space-between;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .attendee-card {
    width: 100%;
  }

  .stats-row {
    flex-direction: column;
  }

  .stats-card.half-width {
    width: 100%;
  }
}


`}</style>
    </div>
  )
}

export default AttendeeTracker

