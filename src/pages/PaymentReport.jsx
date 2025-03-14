import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import {
  Calendar,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Wallet,
  DollarSign,
} from "lucide-react"


export default function PaymentReport() {
  // State for data
  const [bookings, setBookings] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })

  // State for UI
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showExportOptions, setShowExportOptions] = useState(false)

  // Fetch data
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
  }, [])

  // Filter bookings for current user
  const userBookings = useMemo(() => {
    if (!currentUser || !bookings.length) return []

    return bookings.filter((booking) => booking.organizer?._id === currentUser.id)
  }, [bookings, currentUser])

  // Helper function to get nested values
  const getNestedValue = (obj, path) => {
    const keys = path.split(".")
    return keys.reduce((o, key) => (o || {})[key], obj) || ""
  }

  // Apply filters and sorting
  const filteredBookings = useMemo(() => {
    return userBookings
      .filter((booking) => {
        // Apply status filter
        if (statusFilter !== "all" && booking.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false
        }

        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            booking.response?.venueRequest?.eventName?.toLowerCase().includes(searchLower) ||
            booking.response?.venueRequest?.venue?.name?.toLowerCase().includes(searchLower) ||
            booking.paymentDetails?.some(
              (payment) =>
                payment.transactionId?.toLowerCase().includes(searchLower) ||
                payment.paymentMethod?.toLowerCase().includes(searchLower),
            )
          )
        }

        // Apply date range filter
        if (dateRange.start && dateRange.end) {
          const bookingDate = new Date(booking.createdAt)
          return bookingDate >= dateRange.start && bookingDate <= dateRange.end
        }

        return true
      })
      .sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key)
        const bValue = getNestedValue(b, sortConfig.key)

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
  }, [userBookings, statusFilter, searchTerm, dateRange, sortConfig])

  // Calculate summary data
  const summaryData = useMemo(() => {
    if (!userBookings.length)
      return {
        totalBookings: 0,
        totalAmount: 0,
        amountPaid: 0,
        outstanding: 0,
        confirmedBookings: 0,
        tentativeBookings: 0,
      }

    const totalAmount = userBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
    const amountPaid = userBookings.reduce((sum, booking) => sum + (booking.amountPaid || 0), 0)

    return {
      totalBookings: userBookings.length,
      totalAmount,
      amountPaid,
      outstanding: totalAmount - amountPaid,
      confirmedBookings: userBookings.filter((b) => b.status === "Confirmed").length,
      tentativeBookings: userBookings.filter((b) => b.status === "Tentative").length,
    }
  }, [userBookings])

  // Prepare chart data
  const statusChartData = useMemo(() => {
    if (!userBookings.length) return []

    const statusCounts = userBookings.reduce((acc, booking) => {
      const status = booking.status || "Unknown"
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }, [userBookings])

  const paymentMethodChartData = useMemo(() => {
    if (!userBookings.length) return []

    const methodCounts = {}

    userBookings.forEach((booking) => {
      booking.paymentDetails?.forEach((payment) => {
        const method = payment.paymentMethod || "Unknown"
        methodCounts[method] = (methodCounts[method] || 0) + 1
      })
    })

    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }))
  }, [userBookings])

  const monthlyPaymentData = useMemo(() => {
    if (!userBookings.length) return []

    const monthlyData = {}

    userBookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          total: 0,
          paid: 0,
        }
      }

      monthlyData[monthYear].total += booking.totalAmount || 0
      monthlyData[monthYear].paid += booking.amountPaid || 0
    })

    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split("/")
      const [bMonth, bYear] = b.month.split("/")

      if (aYear !== bYear) return aYear - bYear
      return aMonth - bMonth
    })
  }, [userBookings])

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A"

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "#10b981" // green
      case "tentative":
        return "#f59e0b" // amber
      case "cancelled":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "paypal":
        return <CreditCard className="icon-small" />
      case "m-pesa":
        return <Wallet className="icon-small" />
      default:
        return <DollarSign className="icon-small" />
    }
  }

  // Handle export
  const handleExport = (format) => {
    // In a real app, this would generate and download a file
    console.log(`Exporting in ${format} format...`)
    setShowExportOptions(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading payment report...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <AlertCircle />
          </div>
          <h2 className="error-title">Error Loading Report</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="error-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="report-container">
      <div className="report-content">
        {/* Header */}
        <div className="report-header">
          <div className="header-info">
            <h1 className="header-title">Payment Report</h1>
            <p className="header-subtitle">Comprehensive overview of your booking payments and financial status</p>
          </div>

          <div className="header-actions">
            <div className="export-dropdown">
              <button onClick={() => setShowExportOptions(!showExportOptions)} className="export-button">
                <Download className="icon-small" />
                Export
              </button>

              {showExportOptions && (
                <div className="export-options">
                  <button onClick={() => handleExport("pdf")} className="export-option">
                    Export as PDF
                  </button>
                  <button onClick={() => handleExport("csv")} className="export-option">
                    Export as CSV
                  </button>
                  <button onClick={() => handleExport("excel")} className="export-option">
                    Export as Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-content">
              <div className="card-icon card-icon-primary">
                <DollarSign />
              </div>
              <div className="card-info">
                <h3 className="card-label">Total Amount</h3>
                <p className="card-value">{formatCurrency(summaryData.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-content">
              <div className="card-icon card-icon-success">
                <CheckCircle />
              </div>
              <div className="card-info">
                <h3 className="card-label">Amount Paid</h3>
                <p className="card-value">{formatCurrency(summaryData.amountPaid)}</p>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-content">
              <div className="card-icon card-icon-warning">
                <Clock />
              </div>
              <div className="card-info">
                <h3 className="card-label">Outstanding</h3>
                <p className="card-value">{formatCurrency(summaryData.outstanding)}</p>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-content">
              <div className="card-icon card-icon-info">
                <Calendar />
              </div>
              <div className="card-info">
                <h3 className="card-label">Total Bookings</h3>
                <p className="card-value">{summaryData.totalBookings}</p>
                <div className="booking-stats">
                  <span className="stat-confirmed">
                    <CheckCircle className="icon-tiny" />
                    {summaryData.confirmedBookings} Confirmed
                  </span>
                  <span className="stat-tentative">
                    <Clock className="icon-tiny" />
                    {summaryData.tentativeBookings} Tentative
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <nav className="tabs-nav">
            <button
              onClick={() => setActiveTab("overview")}
              className={`tab-button ${activeTab === "overview" ? "tab-active" : ""}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`tab-button ${activeTab === "transactions" ? "tab-active" : ""}`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`tab-button ${activeTab === "analytics" ? "tab-active" : ""}`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="search-container">
            <div className="search-icon">
              <Search />
            </div>
            <input
              type="text"
              placeholder="Search by event, venue, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-actions">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-filter">
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="filter-button">
              <Filter className="icon-small" />
              More Filters
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="tab-content">
            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">Payment Status</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Confirmed"
                                ? "#10b981"
                                : entry.name === "Tentative"
                                  ? "#f59e0b"
                                  : entry.name === "Cancelled"
                                    ? "#ef4444"
                                    : "#6b7280"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Payment Methods</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name === "PayPal" ? "#3b82f6" : entry.name === "M-Pesa" ? "#10b981" : "#6b7280"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="table-card">
              <div className="table-header">
                <h3 className="table-title">Recent Transactions</h3>
                <button onClick={() => setActiveTab("transactions")} className="view-all-button">
                  View All
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id} className="table-row">
                        <td>
                          <div className="event-name">{booking.response?.venueRequest?.eventName || "N/A"}</div>
                        </td>
                        <td>
                          <div className="venue-name">{booking.response?.venueRequest?.venue?.name || "N/A"}</div>
                        </td>
                        <td>
                          <div className="booking-date">{formatDate(booking.createdAt)}</div>
                        </td>
                        <td>
                          <div className="amount-total">{formatCurrency(booking.totalAmount)}</div>
                          <div className="amount-paid">Paid: {formatCurrency(booking.amountPaid)}</div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${getStatusColor(booking.status)}20`,
                              color: getStatusColor(booking.status),
                            }}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="no-data">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Payments Chart */}
            <div className="chart-card">
              <h3 className="chart-title">Monthly Payment Trends</h3>
              <div className="bar-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPaymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="total" name="Total Amount" fill="#6366f1" />
                    <Bar dataKey="paid" name="Amount Paid" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable-header" onClick={() => requestSort("response.venueRequest.eventName")}>
                      <div className="header-content">
                        Event
                        <ArrowUpDown className="icon-small" />
                      </div>
                    </th>
                    <th className="sortable-header" onClick={() => requestSort("response.venueRequest.venue.name")}>
                      <div className="header-content">
                        Venue
                        <ArrowUpDown className="icon-small" />
                      </div>
                    </th>
                    <th className="sortable-header" onClick={() => requestSort("createdAt")}>
                      <div className="header-content">
                        Date
                        <ArrowUpDown className="icon-small" />
                      </div>
                    </th>
                    <th className="sortable-header" onClick={() => requestSort("totalAmount")}>
                      <div className="header-content">
                        Amount
                        <ArrowUpDown className="icon-small" />
                      </div>
                    </th>
                    <th className="sortable-header" onClick={() => requestSort("amountPaid")}>
                      <div className="header-content">
                        Paid
                        <ArrowUpDown className="icon-small" />
                      </div>
                    </th>
                    <th className="sortable-header" onClick={() => requestSort("status")}>
                      <div className="header-content">
                        Status
                        <ArrowUpDown className="icon-small" />
                      </div>
                    </th>
                    <th>Payment Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="table-row">
                      <td>
                        <div className="event-name">{booking.response?.venueRequest?.eventName || "N/A"}</div>
                        <div className="event-dates">
                          {booking.response?.venueRequest?.eventDates?.length > 0
                            ? `${formatDate(booking.response.venueRequest.eventDates[0])}${
                                booking.response.venueRequest.eventDates.length > 1
                                  ? ` (+${booking.response.venueRequest.eventDates.length - 1} more)`
                                  : ""
                              }`
                            : "No dates"}
                        </div>
                      </td>
                      <td>
                        <div className="venue-name">{booking.response?.venueRequest?.venue?.name || "N/A"}</div>
                        <div className="venue-location">{booking.response?.venueRequest?.venue?.location || ""}</div>
                      </td>
                      <td>
                        <div className="booking-date">{formatDate(booking.createdAt)}</div>
                      </td>
                      <td>
                        <div className="amount-total">{formatCurrency(booking.totalAmount)}</div>
                      </td>
                      <td>
                        <div className="amount-paid">{formatCurrency(booking.amountPaid)}</div>
                        <div className="amount-status">
                          {booking.amountPaid < booking.totalAmount
                            ? `Outstanding: ${formatCurrency(booking.totalAmount - booking.amountPaid)}`
                            : "Fully paid"}
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: `${getStatusColor(booking.status)}20`,
                            color: getStatusColor(booking.status),
                          }}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="payment-details">
                          {booking.paymentDetails && booking.paymentDetails.length > 0 ? (
                            booking.paymentDetails.map((payment, index) => (
                              <div key={index} className="payment-method">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                                <span className="method-name">{payment.paymentMethod}</span>
                                <span className="transaction-id">{payment.transactionId}</span>
                              </div>
                            ))
                          ) : (
                            <span className="no-payment">No payment details</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button onClick={() => setSelectedBooking(booking)} className="view-details-button">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="no-data">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="tab-content">
            <div className="analytics-card">
              <h3 className="analytics-title">Payment Analytics</h3>

              <div className="analytics-grid">
                <div className="metric-card">
                  <h4 className="metric-title">Payment Completion Rate</h4>
                  <p className="metric-value">
                    {userBookings.length > 0
                      ? `${Math.round((summaryData.amountPaid / summaryData.totalAmount) * 100)}%`
                      : "N/A"}
                  </p>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{
                        width:
                          userBookings.length > 0
                            ? `${Math.round((summaryData.amountPaid / summaryData.totalAmount) * 100)}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="metric-card">
                  <h4 className="metric-title">Booking Confirmation Rate</h4>
                  <p className="metric-value">
                    {userBookings.length > 0
                      ? `${Math.round((summaryData.confirmedBookings / summaryData.totalBookings) * 100)}%`
                      : "N/A"}
                  </p>
                  <div className="progress-container">
                    <div
                      className="progress-bar progress-bar-success"
                      style={{
                        width:
                          userBookings.length > 0
                            ? `${Math.round((summaryData.confirmedBookings / summaryData.totalBookings) * 100)}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="metric-card">
                  <h4 className="metric-title">Average Booking Value</h4>
                  <p className="metric-value">
                    {userBookings.length > 0
                      ? formatCurrency(summaryData.totalAmount / summaryData.totalBookings)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Payment Timeline</h3>
              <div className="bar-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPaymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="total" name="Total Amount" fill="#6366f1" />
                    <Bar dataKey="paid" name="Amount Paid" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">Payment Status Distribution</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Confirmed"
                                ? "#10b981"
                                : entry.name === "Tentative"
                                  ? "#f59e0b"
                                  : entry.name === "Cancelled"
                                    ? "#ef4444"
                                    : "#6b7280"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Payment Method Distribution</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name === "PayPal" ? "#3b82f6" : entry.name === "M-Pesa" ? "#10b981" : "#6b7280"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3 className="modal-title">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="close-button">
                  <span className="sr-only">Close</span>
                  <svg className="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="modal-content">
                <div className="booking-header">
                  <div>
                    <h4 className="booking-title">
                      {selectedBooking.response?.venueRequest?.eventName || "Unnamed Event"}
                    </h4>
                    <p className="booking-id">Booking ID: {selectedBooking._id}</p>
                  </div>
                  <span
                    className="booking-status"
                    style={{
                      backgroundColor: `${getStatusColor(selectedBooking.status)}20`,
                      color: getStatusColor(selectedBooking.status),
                    }}
                  >
                    {selectedBooking.status}
                  </span>
                </div>

                <div className="details-grid">
                  <div className="details-section">
                    <h5 className="section-title">Event Details</h5>
                    <div className="details-card">
                      <div className="detail-item">
                        <span className="detail-label">Event Name</span>
                        <p className="detail-value">{selectedBooking.response?.venueRequest?.eventName || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Description</span>
                        <p className="detail-value">
                          {selectedBooking.response?.venueRequest?.eventDescription || "No description provided"}
                        </p>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Expected Attendance</span>
                        <p className="detail-value">
                          {selectedBooking.response?.venueRequest?.expectedAttendance?.toLocaleString() || "N/A"} people
                        </p>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Event Dates</span>
                        <div className="dates-list">
                          {selectedBooking.response?.venueRequest?.eventDates?.map((date, index) => (
                            <div key={index} className="date-item">
                              <Calendar className="icon-small icon-gray" />
                              {formatDate(date)}
                            </div>
                          )) || <p className="detail-value">No dates specified</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h5 className="section-title">Venue Details</h5>
                    <div className="details-card">
                      <div className="detail-item">
                        <span className="detail-label">Venue Name</span>
                        <p className="detail-value">{selectedBooking.response?.venueRequest?.venue?.name || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <p className="detail-value">
                          {selectedBooking.response?.venueRequest?.venue?.location || "N/A"}
                        </p>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Capacity</span>
                        <p className="detail-value">
                          {selectedBooking.response?.venueRequest?.venue?.capacity?.toLocaleString() || "N/A"} people
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="payment-section">
                  <h5 className="section-title">Payment Information</h5>
                  <div className="payment-card">
                    <div className="payment-summary">
                      <div className="payment-amount">
                        <span className="amount-label">Total Amount</span>
                        <p className="amount-value">{formatCurrency(selectedBooking.totalAmount)}</p>
                      </div>
                      <div className="payment-amount">
                        <span className="amount-label">Amount Paid</span>
                        <p className="amount-value">{formatCurrency(selectedBooking.amountPaid)}</p>
                      </div>
                      <div className="payment-amount">
                        <span className="amount-label">Outstanding</span>
                        <p className="amount-value">
                          {formatCurrency(selectedBooking.totalAmount - selectedBooking.amountPaid)}
                        </p>
                      </div>
                    </div>

                    <div className="payment-history">
                      <span className="history-label">Payment Details</span>
                      {selectedBooking.paymentDetails && selectedBooking.paymentDetails.length > 0 ? (
                        <div className="history-list">
                          {selectedBooking.paymentDetails.map((payment, index) => (
                            <div key={index} className="history-item">
                              <div className="payment-header">
                                <div className="payment-method">
                                  {getPaymentMethodIcon(payment.paymentMethod)}
                                  <span className="method-name">{payment.paymentMethod}</span>
                                </div>
                                <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                              </div>
                              <div className="payment-meta">
                                <span className="transaction-id">Transaction ID: {payment.transactionId}</span>
                                <span className="payment-date">{formatDate(payment.timestamp)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-payment">No payment details available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button onClick={() => setSelectedBooking(null)} className="cancel-button">
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // In a real app, this would generate and download a receipt
                      console.log("Downloading receipt for booking:", selectedBooking._id)
                    }}
                    className="primary-button"
                  >
                    Download Receipt
                  </button>
                </div>
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

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e1b4b;
  background-color: #f8f7ff;
}

/* Container styles */
.report-container {
  min-height: 100vh;
  background-color: #f8f7ff;
}

.report-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .report-content {
    padding: 2rem;
  }
}

/* Header styles */
.report-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .report-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.header-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e1b4b;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Export dropdown */
.export-dropdown {
  position: relative;
}

.export-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-button:hover {
  background-color: #f9fafb;
}

.export-options {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 12rem;
  background-color: #ffffff;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
  overflow: hidden;
}

.export-option {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #4b5563;
  background: none;
  border: none;
  cursor: pointer;
}

.export-option:hover {
  background-color: #f9fafb;
}

/* Summary cards */
.summary-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}

.summary-card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  margin-right: 1rem;
}

.card-icon-primary {
  background-color: rgba(79, 70, 229, 0.1);
  color: rgb(79, 70, 229);
}

.card-icon-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: rgb(16, 185, 129);
}

.card-icon-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: rgb(245, 158, 11);
}

.card-icon-info {
  background-color: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e1b4b;
  margin-top: 0.25rem;
}

.booking-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
}

.stat-confirmed {
  display: flex;
  align-items: center;
  color: rgb(16, 185, 129);
}

.stat-tentative {
  display: flex;
  align-items: center;
  color: rgb(245, 158, 11);
}

/* Tabs */
.tabs-container {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tabs-nav {
  display: flex;
  gap: 2rem;
}

.tab-button {
  padding: 1rem 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tab-button:hover {
  color: #4b5563;
  border-color: #d1d5db;
}

.tab-active {
  color: rgb(79, 70, 229);
  border-color: rgb(79, 70, 229);
}

/* Filters */
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
}

@media (min-width: 640px) {
  .filters-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-container {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1e1b4b;
}

.search-input:focus {
  outline: none;
  border-color: rgb(79, 70, 229);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .filter-actions {
    flex-wrap: nowrap;
  }
}

.status-filter {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1e1b4b;
  background-color: #ffffff;
  min-width: 150px;
}

.status-filter:focus {
  outline: none;
  border-color: rgb(79, 70, 229);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
}

.filter-button:hover {
  background-color: #f9fafb;
}

/* Tab content */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e1b4b;
  margin-bottom: 1rem;
}

.chart-container {
  height: 16rem;
}

.bar-chart-container {
  height: 20rem;
}

/* Tables */
.table-card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e1b4b;
}

.view-all-button {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(79, 70, 229);
  background: none;
  border: none;
  cursor: pointer;
}

.view-all-button:hover {
  color: rgba(79, 70, 229, 0.8);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.sortable-header {
  cursor: pointer;
}

.header-content {
  display: flex;
  align-items: center;
}

.data-table td {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.table-row:hover {
  background-color: #f9fafb;
}

.event-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1b4b;
}

.event-dates,
.venue-location,
.amount-paid,
.amount-status,
.booking-date,
.venue-name {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.amount-total {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1b4b;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-method {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.method-name {
  margin-left: 0.25rem;
}

.transaction-id {
  margin-left: 0.5rem;
  color: #6b7280;
}

.no-payment {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.view-details-button {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(79, 70, 229);
  background: none;
  border: none;
  cursor: pointer;
}

.view-details-button:hover {
  color: rgba(79, 70, 229, 0.8);
}

.no-data {
  text-align: center;
  padding: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Analytics */
.analytics-card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.analytics-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e1b4b;
  margin-bottom: 1.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .analytics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.metric-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e1b4b;
}

.progress-container {
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: rgb(79, 70, 229);
  border-radius: 9999px;
}

.progress-bar-success {
  background-color: rgb(16, 185, 129);
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
  z-index: 50;
  padding: 1rem;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 48rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e1b4b;
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #ef4444;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.modal-content {
  padding: 1.5rem;
}

.booking-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.booking-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1b4b;
}

.booking-id {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.booking-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.details-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.detail-item {
  margin-bottom: 0.5rem;
}

.detail-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  color: #1e1b4b;
  margin-top: 0.25rem;
}

.dates-list {
  margin-top: 0.25rem;
}

.date-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.25rem;
}

.icon-gray {
  color: #9ca3af;
}

.payment-section {
  margin-bottom: 1.5rem;
}

.payment-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.payment-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.payment-amount {
  display: flex;
  flex-direction: column;
}

.amount-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.amount-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1b4b;
  margin-top: 0.25rem;
}

.payment-history {
  margin-top: 1rem;
}

.history-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.history-list {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  background-color: #f9fafb;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-method {
  display: flex;
  align-items: center;
}

.payment-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #f9fafb;
}

.primary-button {
  padding: 0.5rem 1rem;
  background-color: rgb(79, 70, 229);
  color: #ffffff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-button:hover {
  background-color: rgba(79, 70, 229, 0.9);
}

/* Loading state */
.loading-container {
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: #f8f7ff;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 4px solid rgba(79, 70, 229, 0.1);
  border-top-color: rgb(79, 70, 229);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
}

/* Error state */
.error-container {
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: #f8f7ff;
}

.error-content {
  max-width: 28rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: #fee2e2;
  color: #ef4444;
  border-radius: 9999px;
}

.error-title {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1b4b;
}

.error-message {
  margin-top: 0.5rem;
  color: #6b7280;
}

.error-button {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  background-color: rgb(79, 70, 229);
  color: #ffffff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.error-button:hover {
  background-color: rgba(79, 70, 229, 0.9);
}

/* Icons */
.icon-small {
  width: 1rem;
  height: 1rem;
}

.icon-tiny {
  width: 0.75rem;
  height: 0.75rem;
  margin-right: 0.25rem;
}


      `}</style>
    </div>
  )
}

