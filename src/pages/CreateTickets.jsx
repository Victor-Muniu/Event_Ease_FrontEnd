"use client"

import { useState, useEffect, useRef } from "react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

const CreateTickets = () => {
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [tickets, setTickets] = useState([])
  const [availableEvents, setAvailableEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("table")
  const [formData, setFormData] = useState({
    eventId: "",
    categories: {
      VVIP: { count: 0, price: 0 },
      VIP: { count: 0, price: 0 },
      Regular: { count: 0, price: 0 },
    },
  })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [theme, setTheme] = useState("light") // Changed to light mode default
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [reportPeriod, setReportPeriod] = useState("weekly")
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const reportRef = useRef(null)

  // Fetch current user, events, and tickets
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

        // Fetch events
        const eventsResponse = await fetch("http://localhost:3002/events")

        if (!eventsResponse.ok) {
          throw new Error("Failed to fetch events")
        }

        const eventsData = await eventsResponse.json()

        // Filter events by current user
        const userEvents = eventsData.filter((event) => event.bookingId.organizer._id === userData.user.id)
        setEvents(userEvents)

        // Fetch tickets
        const ticketsResponse = await fetch("http://localhost:3002/tickets")

        if (!ticketsResponse.ok) {
          throw new Error("Failed to fetch tickets")
        }

        const ticketsData = await ticketsResponse.json()
        setTickets(ticketsData)

        // Store the ticket details data in a global variable for easy access
        const ticketDetailsData = [
          {
            categories: {
              VVIP: { count: 1500, price: 3 },
              VIP: { count: 4500, price: 2 },
              Regular: { count: 9000, price: 1 },
            },
            _id: "67e3bce8226cf9cd5338c942",
            eventId: {
              _id: "67daef464eb50a60d992aa13",
              bookingId: {
                _id: "67cbe749da6140977003ff8c",
                response: {
                  _id: "67cbe694da6140977003ff7f",
                  venueRequest: {
                    _id: "67cbe658da6140977003ff74",
                    organizer: {
                      _id: "67bf37dfd96f2c468bae1a8c",
                      firstName: "Victor",
                      lastName: "Njoroge",
                      email: "victornjoroge4971@gmail.com",
                      phone: "+254702056557",
                      organizationName: "Doe Events Ltd",
                    },
                    venue: {
                      _id: "67bf132ba5b070c9d8f45e2b",
                      name: "Sunset Garden",
                      location: "Karen, Nairobi",
                      capacity: 15000,
                    },
                    eventName: "Tech Expo 2025",
                    eventDescription: "A large-scale tech exhibition showcasing the latest innovations.",
                    eventDates: ["2025-06-10T09:00:00.000Z", "2025-06-11T09:00:00.000Z", "2025-06-12T09:00:00.000Z"],
                  },
                },
                paymentDetails: [
                  {
                    paymentMethod: "M-Pesa",
                    transactionId: "ws_CO_08032025094653599702056557",
                    _id: "67cbe7deda6140977003ff91",
                    timestamp: "2025-03-08T06:46:54.926Z",
                  },
                  {
                    amount: 3,
                    paymentMethod: "M-Pesa",
                    transactionId: "TC80U9OBPQ",
                    timestamp: "2025-03-08T06:47:06.543Z",
                    _id: "67cbe7eada6140977003ff95",
                  },
                  {
                    paymentMethod: "M-Pesa",
                    transactionId: "ws_CO_20032025010106016702056557",
                    _id: "67db3e47d41330d2fdc4fd9d",
                    timestamp: "2025-03-19T21:59:35.265Z",
                  },
                  {
                    amount: 0,
                    paymentMethod: "M-Pesa",
                    transactionId: "ws_CO_20032025010106016702056557",
                    timestamp: "2025-03-19T22:00:07.072Z",
                    _id: "67db3e67d41330d2fdc4fdb0",
                  },
                ],
              },
              status: "Upcoming",
            },
            totalTickets: 15000,
            __v: 0,
          },
          {
            categories: {
              VVIP: { count: 700, price: 3 },
              VIP: { count: 2100, price: 2 },
              Regular: { count: 4200, price: 1 },
            },
            _id: "67e3ca6b8ee90e0ae7115adf",
            eventId: {
              _id: "67e2ba8921f725a4c45ea7a0",
              bookingId: {
                _id: "67cbe9ccda6140977003ffc1",
                response: {
                  _id: "67cbe97cda6140977003ffb8",
                  venueRequest: {
                    _id: "67cbe969da6140977003ffad",
                    organizer: {
                      _id: "67bf37dfd96f2c468bae1a8c",
                      firstName: "Victor",
                      lastName: "Njoroge",
                      email: "victornjoroge4971@gmail.com",
                      phone: "+254702056557",
                      organizationName: "Doe Events Ltd",
                    },
                    venue: {
                      _id: "67bf12b0a5b070c9d8f45e28",
                      name: "Royal Conference Hall",
                      location: "Westlands, Nairobi",
                      capacity: 7000,
                    },
                    eventName: "Africa Tech Summit",
                    eventDescription: "A large-scale tech exhibition showcasing the latest innovations.",
                    eventDates: ["2025-06-17T09:00:00.000Z", "2025-06-18T09:00:00.000Z"],
                  },
                },
                paymentDetails: [
                  {
                    paymentMethod: "M-Pesa",
                    transactionId: "ws_CO_08032025095725223702056557",
                    _id: "67cbe9ffda6140977003ffc6",
                    timestamp: "2025-03-08T06:55:59.376Z",
                  },
                ],
              },
              status: "Upcoming",
            },
            totalTickets: 7000,
            __v: 0,
          },
        ]

        // Make it available globally
        window.ticketDetailsData = ticketDetailsData

        // Filter out events that already have tickets - FIXED LOGIC HERE
        const ticketEventIds = ticketsData.map((ticket) => ticket.eventId._id)
        const eventsWithoutTickets = userEvents.filter((event) => !ticketEventIds.includes(event._id))

        // Add console log for debugging
        console.log("User events:", userEvents.length)
        console.log("Events without tickets:", eventsWithoutTickets.length)

        setAvailableEvents(eventsWithoutTickets)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle event selection
  const handleEventSelect = (eventId) => {
    const event = events.find((e) => e._id === eventId)
    setSelectedEvent(event)

    if (event) {
      // Auto-distribute tickets based on venue capacity
      const venueCapacity = event.bookingId.response.venueRequest.venue.capacity

      // Default distribution: 10% VVIP, 30% VIP, 60% Regular
      const vvipCount = Math.floor(venueCapacity * 0.1)
      const vipCount = Math.floor(venueCapacity * 0.3)
      const regularCount = venueCapacity - vvipCount - vipCount

      setFormData({
        eventId: eventId,
        categories: {
          VVIP: { count: vvipCount, price: 3 },
          VIP: { count: vipCount, price: 2 },
          Regular: { count: regularCount, price: 1 },
        },
      })
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "eventId") {
      handleEventSelect(value)
    } else {
      // Handle category count and price inputs
      const [category, field] = name.split(".")

      if (field === "count") {
        // Get current total tickets
        const currentTotal = Object.entries(formData.categories).reduce((total, [cat, data]) => {
          return total + (cat !== category ? data.count : 0)
        }, 0)

        // Calculate remaining capacity
        const venueCapacity = selectedEvent?.bookingId.response.venueRequest.venue.capacity || 0
        const maxAllowed = venueCapacity - currentTotal

        // Ensure we don't exceed venue capacity
        const newCount = Math.min(Number.parseInt(value) || 0, maxAllowed)

        setFormData({
          ...formData,
          categories: {
            ...formData.categories,
            [category]: {
              ...formData.categories[category],
              [field]: newCount,
            },
          },
        })
      } else {
        // Handle price field
        setFormData({
          ...formData,
          categories: {
            ...formData.categories,
            [category]: {
              ...formData.categories[category],
              [field]: Number.parseFloat(value) || 0,
            },
          },
        })
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.eventId) {
      setFormError("Please select an event")
      return
    }

    const totalTickets =
      formData.categories.VVIP.count + formData.categories.VIP.count + formData.categories.Regular.count

    if (totalTickets <= 0) {
      setFormError("Please add at least one ticket")
      return
    }

    const venueCapacity = selectedEvent?.bookingId.response.venueRequest.venue.capacity || 0

    if (totalTickets !== venueCapacity) {
      setFormError(`Total tickets must equal venue capacity (${venueCapacity})`)
      return
    }

    try {
      setIsCreating(true)
      setFormError(null)

      const response = await fetch("http://localhost:3002/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to create tickets")
      }

      // Fetch the complete ticket data with populated fields
      const ticketsResponse = await fetch("http://localhost:3002/tickets")
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json()
        setTickets(ticketsData)
      }

      // Remove the event from available events
      const updatedAvailableEvents = availableEvents.filter((event) => event._id !== formData.eventId)
      setAvailableEvents(updatedAvailableEvents)

      // Reset form
      setFormData({
        eventId: "",
        categories: {
          VVIP: { count: 0, price: 0 },
          VIP: { count: 0, price: 0 },
          Regular: { count: 0, price: 0 },
        },
      })

      setSelectedEvent(null)
      setSuccessMessage("Tickets created successfully!")
      setTimeout(() => {
        setSuccessMessage(null)
        setShowForm(false)
      }, 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create tickets")
      console.error("Error creating tickets:", err)
    } finally {
      setIsCreating(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Format date range for display
  const formatDateRange = (dates) => {
    if (!dates || dates.length === 0) return "No dates specified"

    if (dates.length === 1) {
      return formatDate(dates[0])
    }

    const startDate = formatDate(dates[0])
    const endDate = formatDate(dates[dates.length - 1])

    return `${startDate} — ${endDate}`
  }

  // Calculate total tickets
  const calculateTotalTickets = (categories) => {
    if (!categories) return 0
    return Object.values(categories).reduce((total, category) => total + (category?.count || 0), 0)
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // View ticket details
  const viewTicketDetails = (ticket) => {
    // Set the selected ticket
    setSelectedTicket(ticket)

    // Check if we have additional ticket data from the API
    if (Array.isArray(window.ticketDetailsData)) {
      // Find matching ticket data by ID
      const additionalData = window.ticketDetailsData.find((data) => data._id === ticket._id)

      // If found, merge with the selected ticket
      if (additionalData) {
        setSelectedTicket({
          ...ticket,
          additionalData,
        })
      }
    }

    setShowDetailsModal(true)
  }

  // Close ticket details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setTimeout(() => setSelectedTicket(null), 300)
  }

  // Generate report based on selected period
  const generateReport = () => {
    // In a real app, this would fetch data from the server based on the period
    // For now, we'll simulate it with the existing data

    let reportTitle = ""
    const simulatedData = {
      totalTickets: 0,
      categoryCounts: {
        VVIP: 0,
        VIP: 0,
        Regular: 0,
      },
      events: [],
      periodStart: new Date(),
      periodEnd: new Date(),
    }

    // Set period dates based on selection
    const now = new Date()
    const startDate = new Date()

    switch (reportPeriod) {
      case "weekly":
        startDate.setDate(now.getDate() - 7)
        reportTitle = "Weekly Ticket Report"
        break
      case "monthly":
        startDate.setMonth(now.getMonth() - 1)
        reportTitle = "Monthly Ticket Report"
        break
      case "quarterly":
        startDate.setMonth(now.getMonth() - 3)
        reportTitle = "Quarterly Ticket Report"
        break
      case "yearly":
        startDate.setFullYear(now.getFullYear() - 1)
        reportTitle = "Yearly Ticket Report"
        break
      default:
        startDate.setDate(now.getDate() - 7)
        reportTitle = "Weekly Ticket Report"
    }

    // Simulate filtering tickets by date
    // In a real app, you would filter based on creation date
    const filteredTickets = tickets

    // Calculate totals
    filteredTickets.forEach((ticket) => {
      simulatedData.totalTickets += calculateTotalTickets(ticket.categories)
      simulatedData.categoryCounts.VVIP += ticket.categories.VVIP.count
      simulatedData.categoryCounts.VIP += ticket.categories.VIP.count
      simulatedData.categoryCounts.Regular += ticket.categories.Regular.count

      simulatedData.events.push({
        name: ticket.eventId.bookingId.response.venueRequest.eventName,
        venue: ticket.eventId.bookingId.response.venueRequest.venue.name,
        date: formatDateRange(ticket.eventId.bookingId.response.venueRequest.eventDates),
        totalTickets: calculateTotalTickets(ticket.categories),
      })
    })

    simulatedData.periodStart = startDate
    simulatedData.periodEnd = now
    simulatedData.title = reportTitle

    setReportData(simulatedData)
    setShowReportModal(true)
  }

  // Download report as PDF
  const downloadReportAsPDF = async () => {
    if (!reportRef.current || !reportData) return

    try {
      setIsGeneratingPDF(true)

      // Create a temporary div that we'll style to look exactly like our report
      const tempDiv = document.createElement("div")
      tempDiv.className = `report-print-container ${theme}`
      tempDiv.style.width = "800px"
      tempDiv.style.padding = "20px"
      tempDiv.style.backgroundColor = theme === "dark" ? "#0f1219" : "#ffffff"
      tempDiv.style.color = theme === "dark" ? "#e2e8f0" : "#0f172a"
      tempDiv.style.position = "absolute"
      tempDiv.style.left = "-9999px"
      tempDiv.style.top = "-9999px"
      document.body.appendChild(tempDiv)

      // Clone the report content
      const reportClone = reportRef.current.cloneNode(true)
      tempDiv.appendChild(reportClone)

      // Capture the styled div as an image
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: theme === "dark" ? "#0f1219" : "#ffffff",
      })

      // Remove the temporary div
      document.body.removeChild(tempDiv)

      // Create PDF with the captured image
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`${reportData.title.replace(/\s+/g, "_")}_${formatDate(new Date())}.pdf`)
    } catch (err) {
      console.error("Error generating PDF:", err)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Open create ticket modal
  const openCreateTicketModal = () => {
    setFormData({
      eventId: "",
      categories: {
        VVIP: { count: 0, price: 0 },
        VIP: { count: 0, price: 0 },
        Regular: { count: 0, price: 0 },
      },
    })
    setSelectedEvent(null)
    setFormError(null)
    setSuccessMessage(null)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className={`neo-container ${theme}`}>
        <div className="neo-loading">
          <div className="neo-loading-effect">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="shadow"></div>
            <div className="shadow"></div>
            <div className="shadow"></div>
          </div>
          <span>Loading Ticket System</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`neo-container ${theme}`}>
        <div className="neo-error">
          <div className="neo-error-icon">
            <span>!</span>
          </div>
          <h2>System Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry Connection</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`neo-container ${theme}`}>
      <div className="theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" className="sun-icon">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="moon-icon">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </div>

      <header className="neo-header">
        <div className="neo-header-content">
          <h1>TICKET FORGE</h1>
          <div className="neo-subtitle">
            <span className="neo-badge">SYSTEM v2.0</span>
            <p>Create & Manage Event Tickets</p>
          </div>
        </div>

        <div className="neo-header-actions">
          {/* Create Ticket Button - Always visible */}
          <button className="neo-button create-button" onClick={openCreateTicketModal}>
            <span className="button-icon">+</span>
            <span className="button-text">CREATE TICKETS</span>
          </button>

          {/* Report Button */}
          <div className="neo-report-dropdown">
            <button className="neo-button report-button" onClick={() => setShowReportModal(true)}>
              <svg viewBox="0 0 24 24" className="report-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span className="button-text">REPORTS</span>
            </button>
          </div>

          <div className="neo-view-toggle">
            <button
              className={`neo-view-button ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              aria-label="Table view"
            >
              <svg viewBox="0 0 24 24" className="view-icon">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </button>
            <button
              className={`neo-view-button ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
              aria-label="Card view"
            >
              <svg viewBox="0 0 24 24" className="view-icon">
                <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                <rect x="14" y="3" width="7" height="9" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              </svg>
            </button>
            <button
              className={`neo-view-button ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <svg viewBox="0 0 24 24" className="view-icon">
                <rect x="3" y="3" width="4" height="4" rx="1"></rect>
                <rect x="10" y="3" width="4" height="4" rx="1"></rect>
                <rect x="17" y="3" width="4" height="4" rx="1"></rect>
                <rect x="3" y="10" width="4" height="4" rx="1"></rect>
                <rect x="10" y="10" width="4" height="4" rx="1"></rect>
                <rect x="17" y="10" width="4" height="4" rx="1"></rect>
                <rect x="3" y="17" width="4" height="4" rx="1"></rect>
                <rect x="10" y="17" width="4" height="4" rx="1"></rect>
                <rect x="17" y="17" width="4" height="4" rx="1"></rect>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Tickets List */}
      <div className="neo-tickets-section">
        <div className="neo-section-header">
          <div className="neo-section-title">
            <div className="neo-section-icon">
              <svg viewBox="0 0 24 24">
                <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                <path d="M6 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
            <h2>TICKET INVENTORY</h2>
          </div>
          <div className="neo-ticket-count">
            <span className="count-label">TOTAL TICKETS:</span>
            <span className="count-value">
              {(
                tickets.reduce((total, ticket) => total + calculateTotalTickets(ticket.categories), 0) || 0
              ).toLocaleString()}
            </span>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="neo-empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                <path d="M12 10v4"></path>
                <path d="M12 18h.01"></path>
              </svg>
            </div>
            <h3>NO TICKETS CREATED</h3>
            <p>Create tickets for your events to start selling them</p>
            <button className="neo-button create-button" onClick={openCreateTicketModal}>
              <span className="button-icon">+</span>
              <span className="button-text">CREATE TICKETS</span>
            </button>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === "table" && (
              <div className="neo-table-container">
                <table className="neo-table">
                  <thead>
                    <tr>
                      <th>EVENT NAME</th>
                      <th>VENUE</th>
                      <th>DATE</th>
                      <th className="ticket-column">VVIP</th>
                      <th className="ticket-column">VIP</th>
                      <th className="ticket-column">REGULAR</th>
                      <th className="ticket-column">TOTAL</th>
                      <th className="action-column">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td className="event-name-cell">
                          <div className="event-name-wrapper">
                            <span className="event-status-indicator"></span>
                            {ticket.eventId.bookingId.response.venueRequest.eventName}
                          </div>
                        </td>
                        <td>
                          <div className="venue-cell">
                            <svg viewBox="0 0 24 24" className="venue-icon">
                              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {ticket.eventId.bookingId.response.venueRequest.venue.name}
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <svg viewBox="0 0 24 24" className="date-icon">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {formatDateRange(ticket.eventId.bookingId.response.venueRequest.eventDates)}
                          </div>
                        </td>
                        <td className="ticket-count vvip">
                          <div className="ticket-count-wrapper">
                            <span className="ticket-number">
                              {ticket.categories.VVIP.count?.toLocaleString() || "0"}
                            </span>
                            <div
                              className="ticket-bar"
                              style={{
                                width: `${(ticket.categories.VVIP.count / calculateTotalTickets(ticket.categories)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="ticket-count vip">
                          <div className="ticket-count-wrapper">
                            <span className="ticket-number">
                              {ticket.categories.VIP.count?.toLocaleString() || "0"}
                            </span>
                            <div
                              className="ticket-bar"
                              style={{
                                width: `${(ticket.categories.VIP.count / calculateTotalTickets(ticket.categories)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="ticket-count regular">
                          <div className="ticket-count-wrapper">
                            <span className="ticket-number">
                              {ticket.categories.Regular.count?.toLocaleString() || "0"}
                            </span>
                            <div
                              className="ticket-bar"
                              style={{
                                width: `${(ticket.categories.Regular.count / calculateTotalTickets(ticket.categories)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="total-count">
                          <div className="total-count-wrapper">
                            <span className="total-number">
                              {(calculateTotalTickets(ticket.categories) || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="action-column">
                          <button className="neo-button action-button" onClick={() => viewTicketDetails(ticket)}>
                            <svg viewBox="0 0 24 24" className="view-details-icon">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="sr-only">View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Card View */}
            {viewMode === "card" && (
              <div className="neo-cards">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="neo-card">
                    <div className="neo-card-header">
                      <h3>{ticket.eventId.bookingId.response.venueRequest.eventName}</h3>
                      <div className="neo-card-status">
                        <span className="status-dot"></span>
                        <span className="status-text">{ticket.eventId.status}</span>
                      </div>
                    </div>

                    <div className="neo-card-details">
                      <div className="detail-item">
                        <svg viewBox="0 0 24 24" className="detail-icon">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{ticket.eventId.bookingId.response.venueRequest.venue.name}</span>
                      </div>

                      <div className="detail-item">
                        <svg viewBox="0 0 24 24" className="detail-icon">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{formatDateRange(ticket.eventId.bookingId.response.venueRequest.eventDates)}</span>
                      </div>

                      <div className="detail-item">
                        <svg viewBox="0 0 24 24" className="detail-icon">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>
                          {ticket.eventId.bookingId.response.venueRequest.expectedAttendance?.toLocaleString() || "0"}{" "}
                          attendees
                        </span>
                      </div>
                    </div>

                    <div className="neo-card-categories">
                      <div className="category-item vvip">
                        <div className="category-info">
                          <span className="category-name">VVIP</span>
                          <span className="category-count">
                            {ticket.categories.VVIP.count?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div
                          className="category-bar"
                          style={{
                            width: `${(ticket.categories.VVIP.count / calculateTotalTickets(ticket.categories)) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <div className="category-item vip">
                        <div className="category-info">
                          <span className="category-name">VIP</span>
                          <span className="category-count">{ticket.categories.VIP.count?.toLocaleString() || "0"}</span>
                        </div>
                        <div
                          className="category-bar"
                          style={{
                            width: `${(ticket.categories.VIP.count / calculateTotalTickets(ticket.categories)) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <div className="category-item regular">
                        <div className="category-info">
                          <span className="category-name">REGULAR</span>
                          <span className="category-count">
                            {ticket.categories.Regular.count?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div
                          className="category-bar"
                          style={{
                            width: `${(ticket.categories.Regular.count / calculateTotalTickets(ticket.categories)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="neo-card-footer">
                      <div className="total-tickets-display">
                        <span className="total-label">TOTAL TICKETS</span>
                        <span className="total-value">
                          {(calculateTotalTickets(ticket.categories) || 0).toLocaleString()}
                        </span>
                      </div>
                      <button className="neo-button view-details-button" onClick={() => viewTicketDetails(ticket)}>
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="neo-grid">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="neo-grid-item" onClick={() => viewTicketDetails(ticket)}>
                    <div className="grid-item-header">
                      <h3>{ticket.eventId.bookingId.response.venueRequest.eventName}</h3>
                    </div>

                    <div className="grid-item-venue">{ticket.eventId.bookingId.response.venueRequest.venue.name}</div>

                    <div className="grid-item-date">
                      {formatDateRange(ticket.eventId.bookingId.response.venueRequest.eventDates)}
                    </div>

                    <div className="grid-item-categories">
                      <div className="grid-category vvip">
                        <div className="category-label">VVIP</div>
                        <div className="category-value">{ticket.categories.VVIP.count?.toLocaleString() || "0"}</div>
                      </div>

                      <div className="grid-category vip">
                        <div className="category-label">VIP</div>
                        <div className="category-value">{ticket.categories.VIP.count?.toLocaleString() || "0"}</div>
                      </div>

                      <div className="grid-category regular">
                        <div className="category-label">REGULAR</div>
                        <div className="category-value">{ticket.categories.Regular.count?.toLocaleString() || "0"}</div>
                      </div>
                    </div>

                    <div className="grid-item-total">
                      <span>TOTAL</span>
                      <span className="total-number">
                        {(calculateTotalTickets(ticket.categories) || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Tickets Modal */}
      {showForm && (
        <div className="neo-modal show">
          <div className="neo-modal-backdrop" onClick={() => setShowForm(false)}></div>
          <div className="neo-modal-content create-ticket-modal">
            <div className="neo-modal-header">
              <div className="neo-section-title">
                <div className="neo-section-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h2>CREATE NEW TICKETS</h2>
              </div>
              <button className="neo-close-button" onClick={() => setShowForm(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="neo-modal-body">
              {events.length === 0 ? (
                <div className="neo-message warning">
                  <div className="message-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <p>You don't have any events yet. Please create an event first.</p>
                </div>
              ) : availableEvents.length === 0 ? (
                <div className="neo-message warning">
                  <div className="message-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <p>All your events already have tickets created. Create a new event first.</p>
                </div>
              ) : (
                <form className="neo-form" onSubmit={handleSubmit}>
                  {formError && (
                    <div className="neo-message error">
                      <div className="message-icon">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <p>{formError}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="neo-message success">
                      <div className="message-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <p>{successMessage}</p>
                    </div>
                  )}

                  <div className="neo-form-group">
                    <label htmlFor="eventId">SELECT EVENT</label>
                    <div className="neo-select-wrapper">
                      <select
                        id="eventId"
                        name="eventId"
                        value={formData.eventId}
                        onChange={handleInputChange}
                        required
                        className="neo-select"
                      >
                        <option value="">-- SELECT AN EVENT --</option>
                        {availableEvents.map((event) => (
                          <option key={event._id} value={event._id}>
                            {event.bookingId.response.venueRequest.eventName} (
                            {formatDateRange(event.bookingId.response.venueRequest.eventDates)})
                          </option>
                        ))}
                      </select>
                      <div className="neo-select-arrow"></div>
                    </div>
                  </div>

                  {selectedEvent && (
                    <div className="venue-capacity-info">
                      <div className="venue-capacity-label">Venue Capacity:</div>
                      <div className="venue-capacity-value">
                        {selectedEvent.bookingId.response.venueRequest.venue.capacity?.toLocaleString() || "0"} seats
                      </div>
                      <div className="venue-capacity-note">Total tickets must equal venue capacity</div>
                    </div>
                  )}

                  <div className="neo-ticket-categories">
                    <div className="neo-category-header">
                      <h3>TICKET CATEGORIES</h3>
                      <div className="neo-divider">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>

                    <div className="neo-category-inputs">
                      <div className="neo-category-input vvip">
                        <div className="neo-category-badge">
                          <span>VVIP</span>
                          <div className="badge-glow"></div>
                        </div>
                        <div className="neo-input-group">
                          <label htmlFor="vvip-count">NUMBER OF TICKETS</label>
                          <input
                            type="number"
                            id="vvip-count"
                            name="VVIP.count"
                            value={formData.categories.VVIP.count}
                            onChange={handleInputChange}
                            min="0"
                            className="neo-input"
                            disabled={!selectedEvent}
                          />
                        </div>
                        <div className="neo-input-group">
                          <label htmlFor="vvip-price">PRICE PER TICKET</label>
                          <input
                            type="number"
                            id="vvip-price"
                            name="VVIP.price"
                            value={formData.categories.VVIP.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="neo-input"
                            disabled={!selectedEvent}
                          />
                        </div>
                      </div>

                      <div className="neo-category-input vip">
                        <div className="neo-category-badge">
                          <span>VIP</span>
                          <div className="badge-glow"></div>
                        </div>
                        <div className="neo-input-group">
                          <label htmlFor="vip-count">NUMBER OF TICKETS</label>
                          <input
                            type="number"
                            id="vip-count"
                            name="VIP.count"
                            value={formData.categories.VIP.count}
                            onChange={handleInputChange}
                            min="0"
                            className="neo-input"
                            disabled={!selectedEvent}
                          />
                        </div>
                        <div className="neo-input-group">
                          <label htmlFor="vip-price">PRICE PER TICKET</label>
                          <input
                            type="number"
                            id="vip-price"
                            name="VIP.price"
                            value={formData.categories.VIP.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="neo-input"
                            disabled={!selectedEvent}
                          />
                        </div>
                      </div>

                      <div className="neo-category-input regular">
                        <div className="neo-category-badge">
                          <span>REGULAR</span>
                          <div className="badge-glow"></div>
                        </div>
                        <div className="neo-input-group">
                          <label htmlFor="regular-count">NUMBER OF TICKETS</label>
                          <input
                            type="number"
                            id="regular-count"
                            name="Regular.count"
                            value={formData.categories.Regular.count}
                            onChange={handleInputChange}
                            min="0"
                            className="neo-input"
                            disabled={!selectedEvent}
                          />
                        </div>
                        <div className="neo-input-group">
                          <label htmlFor="regular-price">PRICE PER TICKET</label>
                          <input
                            type="number"
                            id="regular-price"
                            name="Regular.price"
                            value={formData.categories.Regular.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="neo-input"
                            disabled={!selectedEvent}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="neo-total-tickets">
                      <div className="total-label">TOTAL TICKETS</div>
                      <div className="total-value">
                        <span className="total-number">
                          {formData.categories.VVIP.count +
                            formData.categories.VIP.count +
                            formData.categories.Regular.count}
                        </span>
                        <div className="total-bar">
                          <div
                            className="total-progress vvip"
                            style={{
                              width: `${(formData.categories.VVIP.count / (formData.categories.VVIP.count + formData.categories.VIP.count + formData.categories.Regular.count || 1)) * 100}%`,
                            }}
                          ></div>
                          <div
                            className="total-progress vip"
                            style={{
                              width: `${(formData.categories.VIP.count / (formData.categories.VVIP.count + formData.categories.VIP.count + formData.categories.Regular.count || 1)) * 100}%`,
                            }}
                          ></div>
                          <div
                            className="total-progress regular"
                            style={{
                              width: `${(formData.categories.Regular.count / (formData.categories.VVIP.count + formData.categories.VIP.count + formData.categories.Regular.count || 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="neo-modal-footer">
              <button type="button" className="neo-button cancel-button" onClick={() => setShowForm(false)}>
                <span className="button-text">CANCEL</span>
              </button>
              <button
                type="button"
                className="neo-button submit-button"
                disabled={isCreating || !selectedEvent}
                onClick={handleSubmit}
              >
                <span className="button-text">{isCreating ? "PROCESSING..." : "CREATE TICKETS"}</span>
                {isCreating && (
                  <div className="button-loader">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showDetailsModal && selectedTicket && (
        <div className={`neo-modal ${showDetailsModal ? "show" : ""}`}>
          <div className="neo-modal-backdrop" onClick={closeDetailsModal}></div>
          <div className="neo-modal-content">
            <div className="neo-modal-header">
              <h2>TICKET DETAILS</h2>
              <button className="neo-close-button" onClick={closeDetailsModal}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="neo-modal-body">
              <div className="ticket-detail-section">
                <h3>EVENT INFORMATION</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Event Name</div>
                    <div className="detail-value">
                      {selectedTicket.eventId.bookingId.response.venueRequest.eventName}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Venue</div>
                    <div className="detail-value">
                      {selectedTicket.eventId.bookingId.response.venueRequest.venue.name}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Date</div>
                    <div className="detail-value">
                      {formatDateRange(selectedTicket.eventId.bookingId.response.venueRequest.eventDates)}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">{selectedTicket.eventId.status}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Expected Attendance</div>
                    <div className="detail-value">
                      {selectedTicket.eventId.bookingId.response.venueRequest.expectedAttendance?.toLocaleString() ||
                        "0"}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Venue Capacity</div>
                    <div className="detail-value">
                      {selectedTicket.eventId.bookingId.response.venueRequest.venue.capacity?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ticket-detail-section">
                <h3>TICKET ALLOCATION</h3>
                <div className="ticket-allocation-chart">
                  <div className="chart-container">
                    <div
                      className="chart-bar vvip"
                      style={{
                        height: `${(selectedTicket.categories.VVIP.count / calculateTotalTickets(selectedTicket.categories)) * 100}%`,
                      }}
                    >
                      <span className="chart-value">{selectedTicket.categories.VVIP.count}</span>
                    </div>
                    <div
                      className="chart-bar vip"
                      style={{
                        height: `${(selectedTicket.categories.VIP.count / calculateTotalTickets(selectedTicket.categories)) * 100}%`,
                      }}
                    >
                      <span className="chart-value">{selectedTicket.categories.VIP.count}</span>
                    </div>
                    <div
                      className="chart-bar regular"
                      style={{
                        height: `${(selectedTicket.categories.Regular.count / calculateTotalTickets(selectedTicket.categories)) * 100}%`,
                      }}
                    >
                      <span className="chart-value">{selectedTicket.categories.Regular.count}</span>
                    </div>
                  </div>
                  <div className="chart-labels">
                    <div className="chart-label vvip">VVIP</div>
                    <div className="chart-label vip">VIP</div>
                    <div className="chart-label regular">REGULAR</div>
                  </div>
                </div>

                <div className="ticket-stats">
                  <div className="stat-item">
                    <div className="stat-label">Total Tickets</div>
                    <div className="stat-value">
                      {(calculateTotalTickets(selectedTicket.categories) || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-label">Venue Utilization</div>
                    <div className="stat-value">
                      {Math.round(
                        (calculateTotalTickets(selectedTicket.categories) /
                          selectedTicket.eventId.bookingId.response.venueRequest.venue.capacity) *
                          100,
                      )}
                      %
                    </div>
                  </div>
                </div>

                <div className="ticket-detail-section">
                  <h3>TICKET DISTRIBUTION</h3>
                  <div className="distribution-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Price</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="category-label-cell">
                            <span className="category-color vvip"></span>
                            VVIP
                          </div>
                        </td>
                        <td>{selectedTicket.categories.VVIP.count?.toLocaleString() || "0"}</td>
                        <td>KSH {selectedTicket.categories.VVIP.price?.toFixed(2) || "N/A"}</td>
                        <td>
                          {Math.round(
                            (selectedTicket.categories.VVIP.count / calculateTotalTickets(selectedTicket.categories)) *
                              100,
                          )}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="category-label-cell">
                            <span className="category-color vip"></span>
                            VIP
                          </div>
                        </td>
                        <td>{selectedTicket.categories.VIP.count?.toLocaleString() || "0"}</td>
                        <td>KSH {selectedTicket.categories.VIP.price?.toFixed(2) || "N/A"}</td>
                        <td>
                          {Math.round(
                            (selectedTicket.categories.VIP.count / calculateTotalTickets(selectedTicket.categories)) *
                              100,
                          )}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="category-label-cell">
                            <span className="category-color regular"></span>
                            REGULAR
                          </div>
                        </td>
                        <td>{selectedTicket.categories.Regular.count?.toLocaleString() || "0"}</td>
                        <td>KSH {selectedTicket.categories.Regular.price?.toFixed(2) || "N/A"}</td>
                        <td>
                          {Math.round(
                            (selectedTicket.categories.Regular.count /
                              calculateTotalTickets(selectedTicket.categories)) *
                              100,
                          )}
                          %
                        </td>
                      </tr>
                    </tbody>
                  </div>
                </div>
              </div>

              {selectedTicket.additionalData && (
                <div className="ticket-detail-section">
                  <h3>ADDITIONAL INFORMATION</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">Total Tickets</div>
                      <div className="detail-value">
                        {selectedTicket.additionalData.totalTickets?.toLocaleString() || "0"}
                      </div>
                    </div>

                    {/* Display category information */}
                    {selectedTicket.additionalData.categories && (
                      <>
                        <div className="detail-item">
                          <div className="detail-label">VVIP Count</div>
                          <div className="detail-value">
                            {selectedTicket.additionalData.categories.VVIP?.count?.toLocaleString() || "0"}
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">VVIP Price</div>
                          <div className="detail-value">
                            KSH {selectedTicket.additionalData.categories.VVIP?.price?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">VIP Count</div>
                          <div className="detail-value">
                            {selectedTicket.additionalData.categories.VIP?.count?.toLocaleString() || "0"}
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">VIP Price</div>
                          <div className="detail-value">
                            KSH {selectedTicket.additionalData.categories.VIP?.price?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Regular Count</div>
                          <div className="detail-value">
                            {selectedTicket.additionalData.categories.Regular?.count?.toLocaleString() || "0"}
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Regular Price</div>
                          <div className="detail-value">
                            KSH {selectedTicket.additionalData.categories.Regular?.price?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="neo-modal-footer">
              <button className="neo-button cancel-button" onClick={closeDetailsModal}>
                CLOSE
              </button>
              <button className="neo-button action-button">EDIT TICKETS</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className={`neo-modal ${showReportModal ? "show" : ""}`}>
          <div className="neo-modal-backdrop" onClick={() => setShowReportModal(false)}></div>
          <div className="neo-modal-content report-modal">
            <div className="neo-modal-header">
              <h2>TICKET REPORTS</h2>
              <button className="neo-close-button" onClick={() => setShowReportModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="neo-modal-body">
              <div className="report-options">
                <h3>SELECT REPORT PERIOD</h3>
                <div className="report-period-selector">
                  <button
                    className={`period-button ${reportPeriod === "weekly" ? "active" : ""}`}
                    onClick={() => setReportPeriod("weekly")}
                  >
                    WEEKLY
                  </button>
                  <button
                    className={`period-button ${reportPeriod === "monthly" ? "active" : ""}`}
                    onClick={() => setReportPeriod("monthly")}
                  >
                    MONTHLY
                  </button>
                  <button
                    className={`period-button ${reportPeriod === "quarterly" ? "active" : ""}`}
                    onClick={() => setReportPeriod("quarterly")}
                  >
                    QUARTERLY
                  </button>
                  <button
                    className={`period-button ${reportPeriod === "yearly" ? "active" : ""}`}
                    onClick={() => setReportPeriod("yearly")}
                  >
                    YEARLY
                  </button>
                </div>

                <button className="neo-button generate-report-button" onClick={generateReport}>
                  <svg viewBox="0 0 24 24" className="report-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  GENERATE REPORT
                </button>
              </div>

              {reportData && (
                <div className="report-results" ref={reportRef}>
                  <div className="report-header">
                    <h3>{reportData.title}</h3>
                    <p>
                      {formatDate(reportData.periodStart)} - {formatDate(reportData.periodEnd)}
                    </p>
                  </div>

                  <div className="report-summary">
                    <div className="summary-item">
                      <div className="summary-value">{reportData.totalTickets?.toLocaleString() || "0"}</div>
                      <div className="summary-label">Total Tickets</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-value">{reportData.events.length}</div>
                      <div className="summary-label">Events</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-value">{reportData.categoryCounts.VVIP?.toLocaleString() || "0"}</div>
                      <div className="summary-label">VVIP Tickets</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-value">{reportData.categoryCounts.VIP?.toLocaleString() || "0"}</div>
                      <div className="summary-label">VIP Tickets</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-value">{reportData.categoryCounts.Regular?.toLocaleString() || "0"}</div>
                      <div className="summary-label">Regular Tickets</div>
                    </div>
                  </div>

                  <div className="report-chart">
                    <div className="chart-title">Ticket Distribution</div>
                    <div className="distribution-chart">
                      <div
                        className="chart-segment vvip"
                        style={{ width: `${(reportData.categoryCounts.VVIP / reportData.totalTickets) * 100}%` }}
                      >
                        {Math.round((reportData.categoryCounts.VVIP / reportData.totalTickets) * 100)}%
                      </div>
                      <div
                        className="chart-segment vip"
                        style={{ width: `${(reportData.categoryCounts.VIP / reportData.totalTickets) * 100}%` }}
                      >
                        {Math.round((reportData.categoryCounts.VIP / reportData.totalTickets) * 100)}%
                      </div>
                      <div
                        className="chart-segment regular"
                        style={{ width: `${(reportData.categoryCounts.Regular / reportData.totalTickets) * 100}%` }}
                      >
                        {Math.round((reportData.categoryCounts.Regular / reportData.totalTickets) * 100)}%
                      </div>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <span className="legend-color vvip"></span>
                        <span className="legend-label">VVIP</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color vip"></span>
                        <span className="legend-label">VIP</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color regular"></span>
                        <span className="legend-label">Regular</span>
                      </div>
                    </div>
                  </div>

                  <div className="report-events">
                    <div className="events-title">Events in Period</div>
                    <table className="events-table">
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Venue</th>
                          <th>Date</th>
                          <th>Tickets</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.events.map((event, index) => (
                          <tr key={index}>
                            <td>{event.name}</td>
                            <td>{event.venue}</td>
                            <td>{event.date}</td>
                            <td>{event.totalTickets?.toLocaleString() || "0"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="neo-modal-footer">
              <button className="neo-button cancel-button" onClick={() => setShowReportModal(false)}>
                CLOSE
              </button>
              {reportData && (
                <button className="neo-button action-button" onClick={downloadReportAsPDF} disabled={isGeneratingPDF}>
                  <svg viewBox="0 0 24 24" className="download-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  {isGeneratingPDF ? "GENERATING PDF..." : "DOWNLOAD PDF"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        /* Neo-Futuristic Ticket System Styles */
        
        /* Base Styles */
        :root {
          /* Dark Theme Colors */
          --dark-bg: #0f1219;
          --dark-surface: #1a1f2c;
          --dark-surface-hover: #232a3b;
          --dark-border: #2a3347;
          
          --dark-text-primary: #e2e8f0;
          --dark-text-secondary: #94a3b8;
          --dark-text-tertiary: #64748b;
          --dark-accent: #3b82f6;
          --dark-accent-hover: #2563eb;
          --dark-error: #ef4444;
          --dark-success: #10b981;
          --dark-warning: #f59e0b;
          
          /* Light Theme Colors */
          --light-bg: #f1f5f9;
          --light-surface: #ffffff;
          --light-surface-hover: #f8fafc;
          --light-border: #e2e8f0;
          --light-text-primary: #0f172a;
          --light-text-secondary: #334155;
          --light-text-tertiary: #64748b;
          --light-accent: #3b82f6;
          --light-accent-hover: #2563eb;
          --light-error: #ef4444;
          --light-success: #10b981;
          --light-warning: #f59e0b;
          
          /* Ticket Category Colors */
          --vvip-color: #8b5cf6;
          --vip-color: #3b82f6;
          --regular-color: #10b981;
          
          /* Neon Glow Colors */
          --vvip-glow: rgba(139, 92, 246, 0.5);
          --vip-glow: rgba(59, 130, 246, 0.5);
          --regular-glow: rgba(16, 185, 129, 0.5);
          
          /* Spacing */
          --space-xs: 0.25rem;
          --space-sm: 0.5rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --space-xl: 2rem;
          --space-2xl: 3rem;
          
          /* Border Radius */
          --radius-sm: 0.25rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-full: 9999px;
          
          /* Transitions */
          --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
          
          /* Shadows */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          
          /* Fonts */
          --font-mono: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', Menlo, monospace;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: var(--font-sans);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Container */
        .neo-container {
          min-height: 100vh;
          padding: var(--space-md);
          transition: background-color var(--transition-normal), color var(--transition-normal);
        }
        
        .neo-container.dark {
          background-color: var(--dark-bg);
          color: var(--dark-text-primary);
        }
        
        .neo-container.light {
          background-color: var(--light-bg);
          color: var(--light-text-primary);
        }
        
        /* Theme Toggle */
        .theme-toggle {
          position: fixed;
          top: var(--space-md);
          right: var(--space-md);
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          cursor: pointer;
          z-index: 100;
          transition: background-color var(--transition-fast);
        }
        
        .dark .theme-toggle {
          background-color: var(--dark-surface);
          color: var(--dark-text-primary);
        }
        
        .light .theme-toggle {
          background-color: var(--light-surface);
          color: var(--light-text-primary);
        }
        
        .theme-toggle:hover {
          transform: scale(1.05);
        }
        
        .sun-icon, .moon-icon {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        
        /* Header */
        .neo-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
          padding-bottom: var(--space-lg);
          position: relative;
        }
        
        .dark .neo-header {
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .neo-header {
          border-bottom: 1px solid var(--light-border);
        }
        
        .neo-header::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100px;
          height: 3px;
        }
        
        .dark .neo-header::after {
          background: linear-gradient(90deg, var(--dark-accent), transparent);
        }
        
        .light .neo-header::after {
          background: linear-gradient(90deg, var(--light-accent), transparent);
        }
        
        @media (min-width: 768px) {
          .neo-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        
        .neo-header-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: var(--space-xs);
          font-family: var(--font-mono);
          position: relative;
          display: inline-block;
        }
        
        .dark .neo-header-content h1 {
          color: var(--dark-text-primary);
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .light .neo-header-content h1 {
          color: var(--light-text-primary);
        }
        
        .neo-subtitle {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        
        .neo-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
        }
        
        .dark .neo-badge {
          background-color: var(--dark-accent);
          color: #fff;
        }
        
        .light .neo-badge {
          background-color: var(--light-accent);
          color: #fff;
        }
        
        .neo-subtitle p {
          font-size: 1rem;
        }
        
        .dark .neo-subtitle p {
          color: var(--dark-text-secondary);
        }
        
        .light .neo-subtitle p {
          color: var(--light-text-secondary);
        }
        
        .neo-header-actions {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
        }
        
        /* Buttons */
        .neo-button {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 0.5rem 1rem;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
          font-family: var(--font-mono);
        }
        
        .neo-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .neo-button:hover::before {
          left: 100%;
        }
        
        .create-button {
          background-color: var(--dark-accent);
          color: white;
        }
        
        .create-button:hover {
          background-color: var(--dark-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .button-icon {
          font-size: 1.25rem;
          line-height: 1;
        }
        
        .cancel-button {
          background-color: transparent;
        }
        
        .dark .cancel-button {
          color: var(--dark-text-secondary);
          border: 1px solid var(--dark-border);
        }
        
        .light .cancel-button {
          color: var(--light-text-secondary);
          border: 1px solid var(--light-border);
        }
        
        .cancel-button:hover {
          transform: translateY(-2px);
        }
        
        .dark .cancel-button:hover {
          background-color: var(--dark-surface-hover);
        }
        
        .light .cancel-button:hover {
          background-color: var(--light-surface-hover);
        }
        
        .submit-button, .action-button {
          background-color: var(--dark-accent);
          color: white;
          position: relative;
        }
        
        .submit-button:hover, .action-button:hover {
          background-color: var(--dark-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .button-loader {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: var(--space-sm);
        }
        
        .button-loader div {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          animation: loader 0.8s infinite alternate;
        }
        
        .button-loader div:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .button-loader div:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes loader {
          0% {
            opacity: 0.3;
            transform: translateY(0);
          }
          100% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
        
        /* Report Button */
        .report-button {
          background-color: var(--dark-success);
          color: white;
        }
        
        .report-button:hover {
          background-color: #0d9488;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .report-icon, .download-icon, .view-details-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        
        /* View Toggle */
        .neo-view-toggle {
          display: flex;
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        
        .dark .neo-view-toggle {
          background-color: var(--dark-surface);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-view-toggle {
          background-color: var(--light-surface);
          border: 1px solid var(--light-border);
        }
        
        .neo-view-button {
          background: none;
          border: none;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        
        .dark .neo-view-button {
          color: var(--dark-text-tertiary);
        }
        
        .light .neo-view-button {
          color: var(--light-text-tertiary);
        }
        
        .dark .neo-view-button:hover {
          background-color: var(--dark-surface-hover);
          color: var(--dark-text-secondary);
        }
        
        .light .neo-view-button:hover {
          background-color: var(--light-surface-hover);
          color: var(--light-text-secondary);
        }
        
        .dark .neo-view-button.active {
          background-color: var(--dark-accent);
          color: white;
        }
        
        .light .neo-view-button.active {
          background-color: var(--light-accent);
          color: white;
        }
        
        .view-icon {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        
        /* Form Section */
        .neo-form-section {
          margin-bottom: var(--space-xl);
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
        }
        
        .dark .neo-form-section {
          background-color: var(--dark-surface);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-form-section {
          background-color: var(--light-surface);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--light-border);
        }
        
        .neo-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
        }
        
        .dark .neo-section-header {
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .neo-section-header {
          border-bottom: 1px solid var(--light-border);
        }
        
        .neo-section-title {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        
        .neo-section-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
        }
        
        .dark .neo-section-icon {
          background-color: var(--dark-accent);
          color: white;
        }
        
        .light .neo-section-icon {
          background-color: var(--light-accent);
          color: white;
        }
        
        .neo-section-icon svg {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        
        .neo-section-title h2 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .neo-close-button {
          background: none;
          border: none;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .dark .neo-close-button {
          color: var(--dark-text-tertiary);
        }
        
        .light .neo-close-button {
          color: var(--light-text-tertiary);
        }
        
        .dark .neo-close-button:hover {
          background-color: var(--dark-surface-hover);
          color: var(--dark-text-primary);
        }
        
        .light .neo-close-button:hover {
          background-color: var(--light-surface-hover);
          color: var(--light-text-primary);
        }
        
        .neo-close-button svg {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        
        /* Form */
        .neo-form {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }
        
        .neo-form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        .neo-form-group label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .neo-form-group label {
          color: var(--dark-text-secondary);
        }
        
        .light .neo-form-group label {
          color: var(--light-text-secondary);
        }
        
        .neo-select-wrapper {
          position: relative;
        }
        
        .neo-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          appearance: none;
          transition: all var(--transition-fast);
        }
        
        .dark .neo-select {
          background-color: var(--dark-surface-hover);
          border: 1px solid var(--dark-border);
          color: var(--dark-text-primary);
        }
        
        .light .neo-select {
          background-color: var(--light-surface-hover);
          border: 1px solid var(--light-border);
          color: var(--light-text-primary);
        }
        
        .neo-select:focus {
          outline: none;
        }
        
        .dark .neo-select:focus {
          border-color: var(--dark-accent);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .light .neo-select:focus {
          border-color: var(--light-accent);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .neo-select-arrow {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          pointer-events: none;
        }
        
        .dark .neo-select-arrow {
          border-top: 5px solid var(--dark-text-tertiary);
        }
        
        .light .neo-select-arrow {
          border-top: 5px solid var(--light-text-tertiary);
        }
        
        /* Venue Capacity Info */
        .venue-capacity-info {
          padding: var(--space-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .dark .venue-capacity-info {
          background-color: var(--dark-surface-hover);
          border-left: 3px solid var(--dark-accent);
        }
        
        .light .venue-capacity-info {
          background-color: var(--light-surface-hover);
          border-left: 3px solid var(--light-accent);
        }
        
        .venue-capacity-label {
          font-size: 0.875rem;
          font-weight: 600;
          font-family: var(--font-mono);
        }
        
        .dark .venue-capacity-label {
          color: var(--dark-text-secondary);
        }
        
        .light .venue-capacity-label {
          color: var(--light-text-secondary);
        }
        
        .venue-capacity-value {
          font-size: 1.25rem;
          font-weight: 700;
        }
        
        .dark .venue-capacity-value {
          color: var(--dark-accent);
        }
        
        .light .venue-capacity-value {
          color: var(--light-accent);
        }
        
        .venue-capacity-note {
          font-size: 0.75rem;
          font-style: italic;
        }
        
        .dark .venue-capacity-note {
          color: var(--dark-text-tertiary);
        }
        
        .light .venue-capacity-note {
          color: var(--light-text-tertiary);
        }
        
        /* Ticket Categories */
        .neo-ticket-categories {
          padding: var(--space-lg);
          border-radius: var(--radius-md);
        }
        
        .dark .neo-ticket-categories {
          background-color: var(--dark-surface-hover);
        }
        
        .light .neo-ticket-categories {
          background-color: var(--light-surface-hover);
        }
        
        .neo-category-header {
          margin-bottom: var(--space-lg);
        }
        
        .neo-category-header h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .neo-category-header h3 {
          color: var(--dark-text-primary);
        }
        
        .light .neo-category-header h3 {
          color: var(--light-text-primary);
        }
        
        .neo-divider {
          display: flex;
          gap: var(--space-sm);
        }
        
        .neo-divider span {
          height: 3px;
          border-radius: var(--radius-full);
        }
        
        .neo-divider span:nth-child(1) {
          width: 40px;
          background-color: var(--vvip-color);
        }
        
        .neo-divider span:nth-child(2) {
          width: 20px;
          background-color: var(--vip-color);
        }
        
        .neo-divider span:nth-child(3) {
          width: 10px;
          background-color: var(--regular-color);
        }
        
        .neo-category-inputs {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        
        @media (min-width: 768px) {
          .neo-category-inputs {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .neo-category-input {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
        }
        
        .dark .neo-category-input {
          background-color: var(--dark-surface);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-category-input {
          background-color: var(--light-surface);
          border: 1px solid var(--light-border);
        }
        
        .neo-category-input.vvip {
          border-left: 3px solid var(--vvip-color);
        }
        
        .neo-category-input.vip {
          border-left: 3px solid var(--vip-color);
        }
        
        .neo-category-input.regular {
          border-left: 3px solid var(--regular-color);
        }
        
        .neo-category-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          align-self: flex-start;
          position: relative;
          overflow: hidden;
          font-family: var(--font-mono);
        }
        
        .neo-category-input.vvip .neo-category-badge {
          background-color: var(--vvip-color);
          color: white;
        }
        
        .neo-category-input.vip .neo-category-badge {
          background-color: var(--vip-color);
          color: white;
        }
        
        .neo-category-input.regular .neo-category-badge {
          background-color: var(--regular-color);
          color: white;
        }
        
        .badge-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: glow 2s infinite;
        }
        
        @keyframes glow {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        
        .neo-input-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .neo-input-group label {
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .neo-input-group label {
          color: var(--dark-text-tertiary);
        }
        
        .light .neo-input-group label {
          color: var(--light-text-tertiary);
        }
        
        .neo-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }
        
        .dark .neo-input {
          background-color: var(--dark-surface-hover);
          border: 1px solid var(--dark-border);
          color: var(--dark-text-primary);
        }
        
        .light .neo-input {
          background-color: var(--light-surface-hover);
          border: 1px solid var(--light-border);
          color: var(--light-text-primary);
        }
        
        .neo-input:focus {
          outline: none;
        }
        
        .dark .neo-input:focus {
          border-color: var(--dark-accent);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .light .neo-input:focus {
          border-color: var(--light-accent);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .neo-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .neo-total-tickets {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-radius: var(--radius-md);
        }
        
        .dark .neo-total-tickets {
          background-color: var(--dark-surface);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-total-tickets {
          background-color: var(--light-surface);
          border: 1px solid var(--light-border);
        }
        
        .total-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .total-label {
          color: var(--dark-text-secondary);
        }
        
        .light .total-label {
          color: var(--light-text-secondary);
        }
        
        .total-value {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .total-number {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .dark .total-number {
          color: var(--dark-accent);
        }
        
        .light .total-number {
          color: var(--light-accent);
        }
        
        .total-bar {
          height: 6px;
          border-radius: var(--radius-full);
          overflow: hidden;
          display: flex;
        }
        
        .dark .total-bar {
          background-color: var(--dark-surface-hover);
        }
        
        .light .total-bar {
          background-color: var(--light-surface-hover);
        }
        
        .total-progress {
          height: 100%;
          transition: width var(--transition-normal);
        }
        
        .total-progress.vvip {
          background-color: var(--vvip-color);
        }
        
        .total-progress.vip {
          background-color: var(--vip-color);
        }
        
        .total-progress.regular {
          background-color: var(--regular-color);
        }
        
        .neo-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
        }
        
        /* Messages */
        .neo-message {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-lg);
        }
        
        .neo-message.error {
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 4px solid var(--dark-error);
        }
        
        .neo-message.success {
          background-color: rgba(16, 185, 129, 0.1);
          border-left: 4px solid var(--dark-success);
        }
        
        .neo-message.warning {
          background-color: rgba(245, 158, 11, 0.1);
          border-left: 4px solid var(--dark-warning);
        }
        
        .message-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }
        
        .message-icon svg {
          width: 100%;
          height: 100%;
          stroke-width: 2;
          fill: none;
        }
        
        .error .message-icon svg {
          stroke: var(--dark-error);
        }
        
        .success .message-icon svg {
          stroke: var(--dark-success);
        }
        
        .warning .message-icon svg {
          stroke: var(--dark-warning);
        }
        
        .neo-message p {
          font-size: 0.875rem;
          margin: 0;
        }
        
        .dark .neo-message p {
          color: var(--dark-text-primary);
        }
        
        .light .neo-message p {
          color: var(--light-text-primary);
        }
        
        /* Tickets Section */
        .neo-tickets-section {
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .dark .neo-tickets-section {
          background-color: var(--dark-surface);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-tickets-section {
          background-color: var(--light-surface);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--light-border);
        }
        
        .neo-ticket-count {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .dark .neo-ticket-count {
          background-color: var(--dark-surface-hover);
          color: var(--dark-text-primary);
        }
        
        .light .neo-ticket-count {
          background-color: var(--light-surface-hover);
          color: var(--light-text-primary);
        }
        
        .count-label {
          font-size: 0.75rem;
          font-family: var(--font-mono);
        }
        
        .dark .count-label {
          color: var(--dark-text-secondary);
        }
        
        .light .count-label {
          color: var(--light-text-secondary);
        }
        
        .count-value {
          font-weight: 700;
        }
        
        .dark .count-value {
          color: var(--dark-accent);
        }
        
        .light .count-value {
          color: var(--light-accent);
        }
        
        /* Empty State */
        .neo-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-2xl);
          text-align: center;
        }
        
        .empty-icon {
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          margin-bottom: var(--space-lg);
        }
        
        .dark .empty-icon {
          background-color: var(--dark-surface-hover);
          color: var(--dark-text-tertiary);
        }
        
        .light .empty-icon {
          background-color: var(--light-surface-hover);
          color: var(--light-text-tertiary);
        }
        
        .empty-icon svg {
          width: 2rem;
          height: 2rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        
        .neo-empty-state h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
          font-family: var(--font-mono);
        }
        
        .dark .neo-empty-state h3 {
          color: var(--dark-text-primary);
        }
        
        .light .neo-empty-state h3 {
          color: var(--light-text-primary);
        }
        
        .neo-empty-state p {
          margin-bottom: var(--space-lg);
        }
        
        .dark .neo-empty-state p {
          color: var(--dark-text-secondary);
        }
        
        .light .neo-empty-state p {
          color: var(--light-text-secondary);
        }
        
        /* Table View */
        .neo-table-container {
          overflow-x: auto;
          padding: 0 var(--space-lg) var(--space-lg);
        }
        
        .neo-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .neo-table th,
        .neo-table td {
          padding: var(--space-md);
          text-align: left;
          font-size: 0.875rem;
        }
        
        .neo-table th {
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .dark .neo-table th {
          background-color: var(--dark-surface);
          color: var(--dark-text-secondary);
          border-bottom: 2px solid var(--dark-border);
        }
        
        .light .neo-table th {
          background-color: var(--light-surface);
          color: var(--light-text-secondary);
          border-bottom: 2px solid var(--light-border);
        }
        
        .neo-table tr {
          transition: background-color var(--transition-fast);
        }
        
        .dark .neo-table tr:hover {
          background-color: var(--dark-surface-hover);
        }
        
        .light .neo-table tr:hover {
          background-color: var(--light-surface-hover);
        }
        
        .dark .neo-table td {
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .neo-table td {
          border-bottom: 1px solid var(--light-border);
        }
        
        .ticket-column {
          width: 100px;
          text-align: center;
        }
        
        .action-column {
          width: 80px;
          text-align: center;
        }
        
        .action-button {
          padding: 0.25rem;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .event-name-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-weight: 600;
        }
        
        .event-status-indicator {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: var(--dark-accent);
        }
        
        .venue-cell, .date-cell {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .venue-icon, .date-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
          flex-shrink: 0;
        }
        
        .dark .venue-icon, .dark .date-icon {
          color: var(--dark-text-tertiary);
        }
        
        .light .venue-icon, .light .date-icon {
          color: var(--light-text-tertiary);
        }
        
        .ticket-count-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }
        
        .ticket-number {
          font-weight: 600;
        }
        
        .ticket-count.vvip .ticket-number {
          color: var(--vvip-color);
        }
        
        .ticket-count.vip .ticket-number {
          color: var(--vip-color);
        }
        
        .ticket-count.regular .ticket-number {
          color: var(--regular-color);
        }
        
        .ticket-bar {
          height: 4px;
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
        }
        
        .ticket-count.vvip .ticket-bar {
          background-color: var(--vvip-color);
        }
        
        .ticket-count.vip .ticket-bar {
          background-color: var(--vip-color);
        }
        
        .ticket-count.regular .ticket-bar {
          background-color: var(--regular-color);
        }
        
        .total-count-wrapper {
          display: flex;
          justify-content: center;
        }
        
        .total-count .total-number {
          font-size: 1rem;
          font-weight: 700;
        }
        
        .dark .total-count .total-number {
          color: var(--dark-accent);
        }
        
        .light .total-count .total-number {
          color: var(--light-accent);
        }
        
        /* Card View */
        .neo-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-lg);
          padding: 0 var(--space-lg) var(--space-lg);
        }
        
        .neo-card {
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }
        
        .dark .neo-card {
          background-color: var(--dark-surface-hover);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-card {
          background-color: var(--light-surface-hover);
          border: 1px solid var(--light-border);
        }
        
        .neo-card:hover {
          transform: translateY(-4px);
        }
        
        .dark .neo-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }
        
        .light .neo-card:hover {
          box-shadow: var(--shadow-xl);
        }
        
        .neo-card-header {
          padding: var(--space-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dark .neo-card-header {
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .neo-card-header {
          border-bottom: 1px solid var(--light-border);
        }
        
        .neo-card-header h3 {
          font-size: 1rem;
          font-weight: 600;
        }
        
        .dark .neo-card-header h3 {
          color: var(--dark-text-primary);
        }
        
        .light .neo-card-header h3 {
          color: var(--light-text-primary);
        }
        
        .neo-card-status {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: var(--dark-accent);
        }
        
        .dark .status-text {
          color: var(--dark-text-secondary);
        }
        
        .light .status-text {
          color: var(--light-text-secondary);
        }
        
        .neo-card-details {
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
        }
        
        .dark .detail-item {
          color: var(--dark-text-secondary);
        }
        
        .light .detail-item {
          color: var(--light-text-secondary);
        }
        
        .detail-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
          flex-shrink: 0;
        }
        
        .neo-card-categories {
          padding: var(--space-md);
        }
        
        .dark .neo-card-categories {
          background-color: var(--dark-surface);
        }
        
        .light .neo-card-categories {
          background-color: var(--light-surface);
        }
        
        .category-item {
          margin-bottom: var(--space-sm);
          position: relative;
        }
        
        .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .category-name {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .category-item.vvip .category-name {
          color: var(--vvip-color);
        }
        
        .category-item.vip .category-name {
          color: var(--vip-color);
        }
        
        .category-item.regular .category-name {
          color: var(--regular-color);
        }
        
        .category-count {
          font-weight: 600;
        }
        
        .dark .category-count {
          color: var(--dark-text-primary);
        }
        
        .light .category-count {
          color: var(--light-text-primary);
        }
        
        .category-bar {
          height: 4px;
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
        }
        
        .category-item.vvip .category-bar {
          background-color: var(--vvip-color);
        }
        
        .category-item.vip .category-bar {
          background-color: var(--vip-color);
        }
        
        .category-item.regular .category-bar {
          background-color: var(--regular-color);
        }
        
        .neo-card-footer {
          padding: var(--space-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dark .neo-card-footer {
          border-top: 1px solid var(--dark-border);
        }
        
        .light .neo-card-footer {
          border-top: 1px solid var(--light-border);
        }
        
        .view-details-button {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
        }
        
        .total-tickets-display {
          display: flex;
          flex-direction: column;
        }
        
        .total-tickets-display .total-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .total-tickets-display .total-label {
          color: var(--dark-text-secondary);
        }
        
        .light .total-tickets-display .total-label {
          color: var(--light-text-secondary);
        }
        
        .total-tickets-display .total-value {
          font-size: 1.25rem;
          font-weight: 700;
        }
        
        .dark .total-tickets-display .total-value {
          color: var(--dark-accent);
        }
        
        .light .total-tickets-display .total-value {
          color: var(--light-accent);
        }
        
        /* Grid View */
        .neo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-md);
          padding: 0 var(--space-lg) var(--space-lg);
        }
        
        .neo-grid-item {
          padding: var(--space-md);
          border-radius: var(--radius-md);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        
        .dark .neo-grid-item {
          background-color: var(--dark-surface-hover);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-grid-item {
          background-color: var(--light-surface-hover);
          border: 1px solid var(--light-border);
        }
        
        .neo-grid-item:hover {
          transform: translateY(-2px);
        }
        
        .dark .neo-grid-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .light .neo-grid-item:hover {
          box-shadow: var(--shadow-lg);
        }
        
        .grid-item-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .dark .grid-item-header h3 {
          color: var(--dark-text-primary);
        }
        
        .light .grid-item-header h3 {
          color: var(--light-text-primary);
        }
        
        .grid-item-venue {
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .dark .grid-item-venue {
          color: var(--dark-text-secondary);
        }
        
        .light .grid-item-venue {
          color: var(--light-text-secondary);
        }
        
        .grid-item-date {
          font-size: 0.75rem;
          margin-bottom: var(--space-xs);
        }
        
        .dark .grid-item-date {
          color: var(--dark-text-tertiary);
        }
        
        .light .grid-item-date {
          color: var(--light-text-tertiary);
        }
        
        .grid-item-categories {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .grid-category {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
        }
        
        .dark .grid-category.vvip {
          background-color: rgba(139, 92, 246, 0.1);
        }
        
        .light .grid-category.vvip {
          background-color: rgba(139, 92, 246, 0.1);
        }
        
        .dark .grid-category.vip {
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        .light .grid-category.vip {
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        .dark .grid-category.regular {
          background-color: rgba(16, 185, 129, 0.1);
        }
        
        .light .grid-category.regular {
          background-color: rgba(16, 185, 129, 0.1);
        }
        
        .category-label {
          font-weight: 600;
          font-size: 0.7rem;
        }
        
        .grid-category.vvip .category-label {
          color: var(--vvip-color);
        }
        
        .grid-category.vip .category-label {
          color: var(--vip-color);
        }
        
        .grid-category.regular .category-label {
          color: var(--regular-color);
        }
        
        .category-value {
          font-weight: 600;
        }
        
        .dark .category-value {
          color: var(--dark-text-primary);
        }
        
        .light .category-value {
          color: var(--light-text-primary);
        }
        
        .grid-item-total {
          margin-top: var(--space-xs);
          padding-top: var(--space-xs);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }
        
        .dark .grid-item-total {
          border-top: 1px dashed var(--dark-border);
          color: var(--dark-text-secondary);
        }
        
        .light .grid-item-total {
          border-top: 1px dashed var(--light-border);
          color: var(--light-text-secondary);
        }
        
        .grid-item-total .total-number {
          font-weight: 700;
          font-size: 0.875rem;
        }
        
        .dark .grid-item-total .total-number {
          color: var(--dark-accent);
        }
        
        .light .grid-item-total .total-number {
          color: var(--light-accent);
        }
        
        /* Modal */
        .neo-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity var(--transition-normal), visibility var(--transition-normal);
        }
        
        .neo-modal.show {
          opacity: 1;
          visibility: visible;
        }
        
        .neo-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        
        .neo-modal-content {
          position: relative;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: var(--radius-lg);
          transform: translateY(20px);
          opacity: 0;
          transition: transform var(--transition-normal), opacity var(--transition-normal);
        }
        
        .neo-modal.show .neo-modal-content {
          transform: translateY(0);
          opacity: 1;
        }
        
        .dark .neo-modal-content {
          background-color: var(--dark-surface);
          border: 1px solid var(--dark-border);
        }
        
        .light .neo-modal-content {
          background-color: var(--light-surface);
          border: 1px solid var(--light-border);
        }
        
        .neo-modal-header {
          padding: var(--space-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dark .neo-modal-header {
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .neo-modal-header {
          border-bottom: 1px solid var(--light-border);
        }
        
        .neo-modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .neo-modal-body {
          padding: var(--space-lg);
        }
        
        .neo-modal-footer {
          padding: var(--space-lg);
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
        }
        
        .dark .neo-modal-footer {
          border-top: 1px solid var(--dark-border);
        }
        
        .light .neo-modal-footer {
          border-top: 1px solid var(--light-border);
        }
        
        /* Create Ticket Modal */
        .create-ticket-modal {
          max-width: 900px;
        }
        
        /* Ticket Details Modal */
        .ticket-detail-section {
          margin-bottom: var(--space-xl);
        }
        
        .ticket-detail-section h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
          position: relative;
          display: inline-block;
        }
        
        .ticket-detail-section h3::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 40%;
          height: 2px;
          background-color: var(--dark-accent);
          border-radius: var(--radius-full);
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .detail-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .detail-label {
          color: var(--dark-text-secondary);
        }
        
        .light .detail-label {
          color: var(--light-text-secondary);
        }
        
        .detail-value {
          font-size: 1rem;
        }
        
        .dark .detail-value {
          color: var(--dark-text-primary);
        }
        
        .light .detail-value {
          color: var(--light-text-primary);
        }
        
        .ticket-allocation-chart {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        
        .chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          padding: var(--space-md);
          border-radius: var(--radius-md);
        }
        
        .dark .chart-container {
          background-color: var(--dark-surface-hover);
        }
        
        .light .chart-container {
          background-color: var(--light-surface-hover);
        }
        
        .chart-bar {
          width: 60px;
          min-height: 20px;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: var(--space-sm);
          transition: height var(--transition-normal);
        }
        
        .chart-bar.vvip {
          background-color: var(--vvip-color);
        }
        
        .chart-bar.vip {
          background-color: var(--vip-color);
        }
        
        .chart-bar.regular {
          background-color: var(--regular-color);
        }
        
        .chart-value {
          color: white;
          font-weight: 700;
        }
        
        .chart-labels {
          display: flex;
          justify-content: space-around;
        }
        
        .chart-label {
          width: 60px;
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .chart-label.vvip {
          color: var(--vvip-color);
        }
        
        .chart-label.vip {
          color: var(--vip-color);
        }
        
        .chart-label.regular {
          color: var(--regular-color);
        }
        
        .ticket-stats {
          display: flex;
          justify-content: space-around;
          gap: var(--space-md);
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .dark .stat-value {
          color: var(--dark-accent);
        }
        
        .light .stat-value {
          color: var(--light-accent);
        }
        
        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .stat-label {
          color: var(--dark-text-secondary);
        }
        
        .light .stat-label {
          color: var(--light-text-secondary);
        }
        
        .distribution-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: var(--space-md);
        }
        
        .distribution-table th,
        .distribution-table td {
          padding: var(--space-md);
          text-align: left;
          font-size: 0.875rem;
        }
        
        .distribution-table th {
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .distribution-table th {
          color: var(--dark-text-secondary);
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .distribution-table th {
          color: var(--light-text-secondary);
          border-bottom: 1px solid var(--light-border);
        }
        
        .dark .distribution-table td {
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .distribution-table td {
          border-bottom: 1px solid var(--light-border);
        }
        
        .category-label-cell {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .category-color {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
        }
        
        .category-color.vvip {
          background-color: var(--vvip-color);
        }
        
        .category-color.vip {
          background-color: var(--vip-color);
        }
        
        .category-color.regular {
          background-color: var(--regular-color);
        }
        
        /* Report Modal */
        .report-modal {
          max-width: 900px;
        }
        
        .report-options {
          margin-bottom: var(--space-xl);
        }
        
        .report-options h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .report-period-selector {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
        }
        
        .period-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-mono);
        }
        
        .dark .period-button {
          background-color: var(--dark-surface-hover);
          color: var(--dark-text-secondary);
        }
        
        .light .period-button {
          background-color: var(--light-surface-hover);
          color: var(--light-text-secondary);
        }
        
        .period-button.active {
          background-color: var(--dark-accent);
          color: white;
        }
        
        .generate-report-button {
          background-color: var(--dark-success);
          color: white;
          margin-top: var(--space-md);
        }
        
        .generate-report-button:hover {
          background-color: #0d9488;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .report-results {
          border-top: 1px solid var(--dark-border);
          padding-top: var(--space-lg);
        }
        
        .report-header {
          margin-bottom: var(--space-lg);
          text-align: center;
        }
        
        .report-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: var(--space-xs);
          font-family: var(--font-mono);
        }
        
        .report-header p {
          font-size: 0.875rem;
          color: var(--dark-text-secondary);
        }
        
        .report-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }
        
        .summary-item {
          text-align: center;
          padding: var(--space-md);
          border-radius: var(--radius-md);
        }
        
        .dark .summary-item {
          background-color: var(--dark-surface-hover);
        }
        
        .light .summary-item {
          background-color: var(--light-surface-hover);
        }
        
        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-xs);
        }
        
        .dark .summary-value {
          color: var(--dark-accent);
        }
        
        .light .summary-value {
          color: var(--light-accent);
        }
        
        .summary-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .summary-label {
          color: var(--dark-text-secondary);
        }
        
        .light .summary-label {
          color: var(--light-text-secondary);
        }
        
        .report-chart {
          margin-bottom: var(--space-xl);
        }
        
        .chart-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .distribution-chart {
          height: 30px;
          display: flex;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--space-md);
        }
        
        .chart-segment {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          transition: width var(--transition-normal);
        }
        
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          transition: width var(--transition-normal);
        }
        
        .chart-segment.vvip {
          background-color: var(--vvip-color);
        }
        
        .chart-segment.vip {
          background-color: var(--vip-color);
        }
        
        .chart-segment.regular {
          background-color: var(--regular-color);
        }
        
        .chart-legend {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
        }
        
        .legend-color.vvip {
          background-color: var(--vvip-color);
        }
        
        .legend-color.vip {
          background-color: var(--vip-color);
        }
        
        .legend-color.regular {
          background-color: var(--regular-color);
        }
        
        .legend-label {
          font-size: 0.75rem;
        }
        
        .report-events {
          margin-top: var(--space-xl);
        }
        
        .events-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .events-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .events-table th,
        .events-table td {
          padding: var(--space-md);
          text-align: left;
          font-size: 0.875rem;
        }
        
        .events-table th {
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
        
        .dark .events-table th {
          color: var(--dark-text-secondary);
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .events-table th {
          color: var(--light-text-secondary);
          border-bottom: 1px solid var(--light-border);
        }
        
        .dark .events-table td {
          border-bottom: 1px solid var(--dark-border);
        }
        
        .light .events-table td {
          border-bottom: 1px solid var(--light-border);
        }
        
        /* Report Print Styles */
        .report-print-container {
          font-family: var(--font-sans);
          line-height: 1.5;
        }

        .report-print-container.dark {
          background-color: var(--dark-bg);
          color: var(--dark-text-primary);
        }

        .report-print-container.light {
          background-color: var(--light-bg);
          color: var(--light-text-primary);
        }

        .report-print-container .report-results {
          border-top: none;
          padding-top: 0;
        }

        .report-print-container .report-header {
          margin-bottom: var(--space-xl);
        }

        .report-print-container .report-header h3 {
          font-size: 1.75rem;
          margin-bottom: var(--space-md);
        }

        .report-print-container .report-header p {
          font-size: 1rem;
        }
        
        /* Loading State */
        .neo-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: var(--space-xl);
        }
        
        .neo-loading-effect {
          position: relative;
          width: 100px;
          height: 80px;
        }
        
        .circle {
          width: 20px;
          height: 20px;
          position: absolute;
          border-radius: 50%;
          background-color: var(--dark-accent);
          left: 15%;
          transform-origin: 50%;
          animation: circle 0.5s alternate infinite ease;
        }
        
        @keyframes circle {
          0% {
            top: 60px;
            height: 5px;
            border-radius: 50px 50px 25px 25px;
            transform: scaleX(1.7);
          }
          40% {
            height: 20px;
            border-radius: 50%;
            transform: scaleX(1);
          }
          100% {
            top: 0%;
          }
        }
        
        .circle:nth-child(2) {
          left: 45%;
          animation-delay: 0.2s;
        }
        
        .circle:nth-child(3) {
          left: auto;
          right: 15%;
          animation-delay: 0.3s;
        }
        
        .shadow {
          width: 20px;
          height: 4px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.1);
          position: absolute;
          top: 62px;
          transform-origin: 50%;
          z-index: -1;
          left: 15%;
          filter: blur(1px);
          animation: shadow 0.5s alternate infinite ease;
        }
        
        @keyframes shadow {
          0% {
            transform: scaleX(1.5);
          }
          40% {
            transform: scaleX(1);
            opacity: 0.7;
          }
          100% {
            transform: scaleX(0.2);
            opacity: 0.4;
          }
        }
        
        .shadow:nth-child(4) {
          left: 45%;
          animation-delay: 0.2s;
        }
        
        .shadow:nth-child(5) {
          left: auto;
          right: 15%;
          animation-delay: 0.3s;
        }
        
        .neo-loading span {
          font-family: var(--font-mono);
          font-size: 1rem;
          letter-spacing: 0.1em;
          animation: pulse 1.5s infinite;
        }
        
        .dark .neo-loading span {
          color: var(--dark-text-secondary);
        }
        
        .light .neo-loading span {
          color: var(--light-text-secondary);
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        /* Error State */
        .neo-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: var(--space-xl);
        }
        
        .neo-error-icon {
          width: 5rem;
          height: 5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          margin-bottom: var(--space-lg);
          position: relative;
          overflow: hidden;
        }
        
        .dark .neo-error-icon {
          background-color: rgba(239, 68, 68, 0.1);
          border: 2px solid var(--dark-error);
        }
        
        .light .neo-error-icon {
          background-color: rgba(239, 68, 68, 0.1);
          border: 2px solid var(--light-error);
        }
        
        .neo-error-icon span {
          font-size: 2.5rem;
          font-weight: 700;
        }
        
        .dark .neo-error-icon span {
          color: var(--dark-error);
        }
        
        .light .neo-error-icon span {
          color: var(--light-error);
        }
        
        .neo-error h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
          font-family: var(--font-mono);
        }
        
        .dark .neo-error h2 {
          color: var(--dark-text-primary);
        }
        
        .light .neo-error h2 {
          color: var(--light-text-primary);
        }
        
        .neo-error p {
          margin-bottom: var(--space-lg);
        }
        
        .dark .neo-error p {
          color: var(--dark-text-secondary);
        }
        
        .light .neo-error p {
          color: var(--light-text-secondary);
        }
        
        .neo-error button {
          padding: var(--space-sm) var(--space-lg);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
          font-family: var(--font-mono);
        }
        
        .dark .neo-error button {
          background-color: var(--dark-accent);
          color: white;
        }
        
        .light .neo-error button {
          background-color: var(--light-accent);
          color: white;
        }
        
        .dark .neo-error button:hover {
          background-color: var(--dark-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .light .neo-error button:hover {
          background-color: var(--light-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        /* Screen Reader Only */
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
        `}
      </style>
    </div>
  )
}

export default CreateTickets

