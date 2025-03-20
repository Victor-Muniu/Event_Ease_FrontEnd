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
  Wallet,
  DollarSign,
  TrendingUp,
  BarChart2,
  PieChartIcon,
  FileText,
  ChevronDown,
  Globe,
  RefreshCw,
} from "lucide-react"

export default function PaymentReport() {
  const [bookings, setBookings] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exchangeRate, setExchangeRate] = useState(3.5)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })

  // State for UI
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

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

        // Fetch current exchange rate (in a real app, this would use a currency API)
        try {
          const rateRes = await fetch("https://open.er-api.com/v6/latest/THB")
          if (rateRes.ok) {
            const rateData = await rateRes.json()
            if (rateData.rates && rateData.rates.KES) {
              setExchangeRate(rateData.rates.KES)
            }
          }
        } catch (rateErr) {
          console.error("Could not fetch exchange rate, using default", rateErr)
        }
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
    if (!filteredBookings.length)
      return {
        totalBookings: 0,
        totalAmount: 0,
        amountPaid: 0,
        outstanding: 0,
        confirmedBookings: 0,
        tentativeBookings: 0,
        paypalAmount: 0,
        mpesaAmount: 0,
      }

    let totalAmount = 0
    let amountPaid = 0
    let paypalAmount = 0
    let mpesaAmount = 0

    filteredBookings.forEach((booking) => {
      totalAmount += booking.totalAmount || 0
      amountPaid += booking.amountPaid || 0

      // Calculate payment method totals
      booking.paymentDetails?.forEach((payment) => {
        if (payment.paymentMethod === "PayPal") {
          // Convert PayPal (THB) to KSh
          paypalAmount += (payment.amount || 0) * exchangeRate
        } else if (payment.paymentMethod === "M-Pesa") {
          mpesaAmount += payment.amount || 0
        }
      })
    })

    return {
      totalBookings: filteredBookings.length,
      totalAmount,
      amountPaid,
      outstanding: totalAmount - amountPaid,
      confirmedBookings: filteredBookings.filter((b) => b.status === "Confirmed").length,
      tentativeBookings: filteredBookings.filter((b) => b.status === "Tentative").length,
      paypalAmount,
      mpesaAmount,
    }
  }, [filteredBookings, exchangeRate])

  // Prepare chart data
  const statusChartData = useMemo(() => {
    if (!filteredBookings.length) return []

    const statusCounts = filteredBookings.reduce((acc, booking) => {
      const status = booking.status || "Unknown"
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }, [filteredBookings])

  const paymentMethodChartData = useMemo(() => {
    if (!filteredBookings.length) return []

    const methodCounts = {}

    filteredBookings.forEach((booking) => {
      booking.paymentDetails?.forEach((payment) => {
        const method = payment.paymentMethod || "Unknown"
        methodCounts[method] = (methodCounts[method] || 0) + 1
      })
    })

    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }))
  }, [filteredBookings])

  const monthlyPaymentData = useMemo(() => {
    if (!filteredBookings.length) return []

    const monthlyData = {}

    filteredBookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          total: 0,
          paid: 0,
          paypal: 0,
          mpesa: 0,
        }
      }

      monthlyData[monthYear].total += booking.totalAmount || 0
      monthlyData[monthYear].paid += booking.amountPaid || 0

      // Add payment method data
      booking.paymentDetails?.forEach((payment) => {
        if (payment.paymentMethod === "PayPal") {
          // Convert PayPal (THB) to KSh
          monthlyData[monthYear].paypal += (payment.amount || 0) * exchangeRate
        } else if (payment.paymentMethod === "M-Pesa") {
          monthlyData[monthYear].mpesa += payment.amount || 0
        }
      })
    })

    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(" ")
      const [bMonth, bYear] = b.month.split(" ")

      if (aYear !== bYear) return Number(aYear) - Number(bYear)

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.indexOf(aMonth) - months.indexOf(bMonth)
    })
  }, [filteredBookings, exchangeRate])

  // Format currency
  const formatCurrency = (amount, currency = "KES") => {
    if (amount === undefined || amount === null) return "N/A"

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Convert THB to KSH for PayPal transactions
  const convertCurrency = (amount, method) => {
    if (method === "PayPal") {
      // PayPal transactions are in THB
      return amount * exchangeRate
    }
    return amount
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
        return <Globe className="icon-small" />
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

  // Handle date filter
  const handleDateFilter = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({
      ...prev,
      [name]: value ? new Date(value) : null,
    }))
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateRange({ start: null, end: null })
  }

  // Download receipt
  const downloadReceipt = async (booking) => {
    if (!booking) return

    setIsDownloading(true)

    try {
      // Make API call to generate receipt
      const response = await fetch(`http://localhost:3002/bookings/${booking._id}/receipt`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to generate receipt")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url

      // Set the download attribute with filename
      const eventName = booking.response?.venueRequest?.eventName || "booking"
      const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      link.download = `receipt_${sanitizedEventName}_${booking._id}.pdf`

      // Append to the document
      document.body.appendChild(link)

      // Trigger the download
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      console.log("Receipt downloaded successfully")
    } catch (err) {
      console.error("Error downloading receipt:", err)
      alert("Failed to download receipt. Please try again.")
    } finally {
      setIsDownloading(false)
    }
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
            <div className="exchange-rate">
              <Globe className="icon-small" />
              <span>1 THB = {exchangeRate.toFixed(2)} KSh</span>
            </div>
            <div className="export-dropdown">
              <button onClick={() => setShowExportOptions(!showExportOptions)} className="export-button">
                <Download className="icon-small" />
                Export
                <ChevronDown className="icon-tiny ml-1" />
              </button>

              {showExportOptions && (
                <div className="export-options">
                  <button onClick={() => handleExport("pdf")} className="export-option">
                    <FileText className="icon-small" />
                    Export as PDF
                  </button>
                  <button onClick={() => handleExport("csv")} className="export-option">
                    <FileText className="icon-small" />
                    Export as CSV
                  </button>
                  <button onClick={() => handleExport("excel")} className="export-option">
                    <FileText className="icon-small" />
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
                <div className="card-progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${summaryData.totalAmount ? (summaryData.amountPaid / summaryData.totalAmount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
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
                <div className="payment-methods-mini">
                  <div className="method-mini">
                    <Wallet className="icon-tiny" />
                    <span>{formatCurrency(summaryData.mpesaAmount)}</span>
                  </div>
                  <div className="method-mini">
                    <Globe className="icon-tiny" />
                    <span>{formatCurrency(summaryData.paypalAmount)}</span>
                  </div>
                </div>
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
                <div className="card-percentage">
                  {summaryData.totalAmount
                    ? `${Math.round((summaryData.outstanding / summaryData.totalAmount) * 100)}% of total`
                    : "0% of total"}
                </div>
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
              <BarChart2 className="icon-small" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`tab-button ${activeTab === "transactions" ? "tab-active" : ""}`}
            >
              <FileText className="icon-small" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`tab-button ${activeTab === "analytics" ? "tab-active" : ""}`}
            >
              <TrendingUp className="icon-small" />
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

            <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="icon-small" />
              {showFilters ? "Hide Filters" : "More Filters"}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start ? dateRange.start.toISOString().split("T")[0] : ""}
                  onChange={handleDateFilter}
                  className="date-input"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end ? dateRange.end.toISOString().split("T")[0] : ""}
                  onChange={handleDateFilter}
                  className="date-input"
                />
              </div>
            </div>
            <button className="reset-button" onClick={resetFilters}>
              <RefreshCw className="icon-small" />
              Reset Filters
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="tab-content">
            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">
                  <PieChartIcon className="icon-small" />
                  Payment Status
                </h3>
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
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">
                  <PieChartIcon className="icon-small" />
                  Payment Methods
                </h3>
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
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="table-card">
              <div className="table-header">
                <h3 className="table-title">
                  <FileText className="icon-small" />
                  Recent Transactions
                </h3>
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
                      <tr key={booking._id} className="table-row" onClick={() => setSelectedBooking(booking)}>
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
              <h3 className="chart-title">
                <BarChart2 className="icon-small" />
                Monthly Payment Trends
              </h3>
              <div className="bar-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPaymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="total" name="Total Amount" fill="#6366f1" />
                    <Bar dataKey="paid" name="Amount Paid" fill="#10b981" />
                    <Bar dataKey="paypal" name="PayPal (Converted)" fill="#3b82f6" />
                    <Bar dataKey="mpesa" name="M-Pesa" fill="#059669" />
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
                                {payment.paymentMethod === "PayPal" && (
                                  <div className="currency-conversion">
                                    <span className="original-amount">{formatCurrency(payment.amount, "THB")}</span>
                                    <span className="conversion-arrow">→</span>
                                    <span className="converted-amount">
                                      {formatCurrency(convertCurrency(payment.amount, payment.paymentMethod))}
                                    </span>
                                  </div>
                                )}
                                <span className="transaction-id">{payment.transactionId}</span>
                              </div>
                            ))
                          ) : (
                            <span className="no-payment">No payment details</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => setSelectedBooking(booking)} className="view-details-button">
                            View Details
                          </button>
                          {booking.status === "Confirmed" && booking.amountPaid > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadReceipt(booking)
                              }}
                              className="download-button"
                              disabled={isDownloading}
                            >
                              <Download className="icon-small" />
                              {isDownloading ? "Downloading..." : "Receipt"}
                            </button>
                          )}
                        </div>
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
              <h3 className="analytics-title">
                <TrendingUp className="icon-small" />
                Payment Analytics
              </h3>

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
              <h3 className="chart-title">
                <BarChart2 className="icon-small" />
                Payment Timeline
              </h3>
              <div className="bar-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPaymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="total" name="Total Amount" fill="#6366f1" />
                    <Bar dataKey="paid" name="Amount Paid" fill="#10b981" />
                    <Bar dataKey="paypal" name="PayPal (Converted)" fill="#3b82f6" />
                    <Bar dataKey="mpesa" name="M-Pesa" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">
                  <PieChartIcon className="icon-small" />
                  Payment Status Distribution
                </h3>
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
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">
                  <PieChartIcon className="icon-small" />
                  Payment Method Distribution
                </h3>
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
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="payment-distribution-section">
              <h3 className="section-title">
                <DollarSign className="icon-small" />
                Payment Method Distribution
              </h3>
              <div className="distribution-container">
                <div className="distribution-chart">
                  <div
                    className="distribution-segment mpesa-segment"
                    style={{
                      width: `${(summaryData.mpesaAmount / (summaryData.mpesaAmount + summaryData.paypalAmount || 1)) * 100}%`,
                    }}
                  >
                    <span className="segment-label">M-Pesa</span>
                    <span className="segment-value">{formatCurrency(summaryData.mpesaAmount)}</span>
                  </div>
                  <div
                    className="distribution-segment paypal-segment"
                    style={{
                      width: `${(summaryData.paypalAmount / (summaryData.mpesaAmount + summaryData.paypalAmount || 1)) * 100}%`,
                    }}
                  >
                    <span className="segment-label">PayPal (Converted)</span>
                    <span className="segment-value">{formatCurrency(summaryData.paypalAmount)}</span>
                  </div>
                </div>
                <div className="distribution-stats">
                  <div className="stat-item">
                    <div className="stat-label">M-Pesa Transactions</div>
                    <div className="stat-value">
                      {bookings.reduce((count, booking) => {
                        return count + (booking.paymentDetails?.filter((p) => p.paymentMethod === "M-Pesa").length || 0)
                      }, 0)}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">PayPal Transactions</div>
                    <div className="stat-value">
                      {bookings.reduce((count, booking) => {
                        return count + (booking.paymentDetails?.filter((p) => p.paymentMethod === "PayPal").length || 0)
                      }, 0)}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Average Transaction</div>
                    <div className="stat-value">
                      {formatCurrency(
                        bookings.reduce((sum, booking) => sum + (booking.amountPaid || 0), 0) /
                          bookings.reduce((count, booking) => count + (booking.paymentDetails?.length || 0), 0) || 0,
                      )}
                    </div>
                  </div>
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
                                {payment.paymentMethod === "PayPal" ? (
                                  <div className="payment-conversion">
                                    <span className="original-currency">{formatCurrency(payment.amount, "THB")}</span>
                                    <span className="conversion-arrow">→</span>
                                    <span className="converted-currency">
                                      {formatCurrency(convertCurrency(payment.amount, payment.paymentMethod))}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                                )}
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
                  {selectedBooking.status === "Confirmed" && selectedBooking.amountPaid > 0 && (
                    <button
                      onClick={() => downloadReceipt(selectedBooking)}
                      className="primary-button"
                      disabled={isDownloading}
                    >
                      <Download className="icon-small" />
                      {isDownloading ? "Downloading..." : "Download Receipt"}
                    </button>
                  )}
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
          background: linear-gradient(135deg, #4f46e5, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .exchange-rate {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #f0f9ff;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #0369a1;
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
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
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
        }

        .card-content {
          display: flex;
          align-items: flex-start;
        }

        .card-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
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

        .card-progress {
          height: 0.25rem;
          background-color: #e5e7eb;
          border-radius: 9999px;
          margin-top: 0.75rem;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #8b5cf6);
          border-radius: 9999px;
        }

        .card-percentage {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .payment-methods-mini {
          display: flex;
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .method-mini {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
        }

        .tab-active {
          color: #4f46e5;
          border-color: #4f46e5;
        }

        /* Filters */
        .filters-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
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
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e1b4b;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #4f46e5;
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
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e1b4b;
          background-color: #ffffff;
          min-width: 150px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .status-filter:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .filter-button:hover {
          background-color: #f9fafb;
        }

        /* Advanced filters */
        .advanced-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          padding: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
        }

        .date-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-input {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e1b4b;
        }

        .date-separator {
          color: #6b7280;
        }

        .reset-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #4b5563;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reset-button:hover {
          background-color: #e5e7eb;
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
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .chart-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
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
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e1b4b;
        }

        .view-all-button {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4f46e5;
          background: none;
          border: none;
          cursor: pointer;
        }

        .view-all-button:hover {
          text-decoration: underline;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 0.75rem 1rem;
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
          gap: 0.5rem;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #f8f7ff;
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
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .payment-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payment-method {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.75rem;
        }

        .method-name {
          font-weight: 500;
        }

        .currency-conversion {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .original-amount {
          color: #6b7280;
        }

        .conversion-arrow {
          color: #9ca3af;
        }

        .converted-amount {
          font-weight: 500;
          color: #4f46e5;
        }

        .transaction-id {
          color: #6b7280;
          font-style: italic;
        }

        .no-payment {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .view-details-button {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4f46e5;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .view-details-button:hover {
          text-decoration: underline;
        }

        .download-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #10b981;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .download-button:hover {
          text-decoration: underline;
        }

        .download-button:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Analytics */
        .analytics-card {
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .analytics-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
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
          border-radius: 0.75rem;
          padding: 1.25rem;
          background-color: #ffffff;
        }

        .metric-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e1b4b;
          margin-bottom: 0.75rem;
        }

        .progress-container {
          height: 0.5rem;
          background-color: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #8b5cf6);
          border-radius: 9999px;
        }

        .progress-bar-success {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        /* Payment distribution section */
        .payment-distribution-section {
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e1b4b;
          margin-bottom: 1.5rem;
        }

        .distribution-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .distribution-container {
            grid-template-columns: 2fr 1fr;
          }
        }

        .distribution-chart {
          display: flex;
          height: 2.5rem;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .distribution-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          font-size: 0.875rem;
          position: relative;
          min-width: 4rem;
        }

        .mpesa-segment {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .paypal-segment {
          background: linear-gradient(90deg, #3b82f6, #2563eb);
        }

        .segment-label {
          position: absolute;
          top: 0.5rem;
          left: 1rem;
          font-size: 0.75rem;
        }

        .segment-value {
          position: absolute;
          bottom: 0.5rem;
          right: 1rem;
          font-size: 0.75rem;
        }

        .distribution-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e1b4b;
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
          backdrop-filter: blur(4px);
        }

        .modal-container {
          background-color: #ffffff;
          border-radius: 1rem;
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
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background-color: #ffffff;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e1b4b;
        }

        .close-button {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
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
          border-radius: 0.75rem;
          padding: 1.25rem;
          background-color: #f9fafb;
        }

        .detail-item {
          margin-bottom: 1rem;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #1e1b4b;
        }

        .dates-list {
          margin-top: 0.5rem;
        }

        .date-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #4b5563;
          margin-bottom: 0.25rem;
        }

        .icon-gray {
          color: #9ca3af;
        }

        .payment-section {
          margin-bottom: 1.5rem;
        }

        .payment-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.25rem;
          background-color: #f9fafb;
        }

        .payment-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px dashed #e5e7eb;
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
          font-size: 1rem;
          font-weight: 600;
          color: #1e1b4b;
          margin-top: 0.25rem;
        }

        .payment-history {
          margin-top: 1rem;
        }

        .history-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 0.75rem;
          display: block;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          background-color: #ffffff;
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .payment-conversion {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .original-currency {
          color: #6b7280;
        }

        .conversion-arrow {
          color: #9ca3af;
        }

        .converted-currency {
          font-weight: 600;
          color: #4f46e5;
        }

        .payment-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .cancel-button {
          padding: 0.75rem 1.25rem;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .cancel-button:hover {
          background-color: #f9fafb;
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #4f46e5, #8b5cf6);
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .primary-button:hover {
          opacity: 0.9;
        }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          border-top-color: #4f46e5;
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
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 2rem;
          text-align: center;
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
          margin: 0 auto 1rem;
        }

        .error-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e1b4b;
          margin-bottom: 0.5rem;
        }

        .error-message {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .error-button {
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #4f46e5, #8b5cf6);
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .error-button:hover {
          opacity: 0.9;
        }

        /* Icons */
        .icon-small {
          width: 1rem;
          height: 1rem;
        }

        .icon-tiny {
          width: 0.75rem;
          height: 0.75rem;
        }

        .ml-1 {
          margin-left: 0.25rem;
        }
      `}</style>
    </div>
  )
}

