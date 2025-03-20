import { useEffect, useState, useMemo, useRef } from "react"
import {
  MapPin,
  Users,
  Search,
  DollarSign,
  X,
  CheckCircle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Sparkles,
  Zap,
  Clock,
  Hexagon,
  PenTool,
} from "lucide-react"
import { format, isBefore, isSameDay, startOfToday } from "date-fns"

export default function Venue() {
  const [venues, setVenues] = useState([])
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [capacityFilter, setCapacityFilter] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [requestFormData, setRequestFormData] = useState({
    eventName: "",
    eventDescription: "",
    expectedAttendance: "",
    eventDates: [],
    additionalRequests: "",
  })
  const [dateInput, setDateInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookedDates, setBookedDates] = useState([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const calendarRef = useRef(null)
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [favorites, setFavorites] = useState([])
  const [viewMode, setViewMode] = useState("grid") // hexagon, list, or grid
  const [hoverVenue, setHoverVenue] = useState(null)
  const [animateIn, setAnimateIn] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const venuesPerPage = viewMode === "hexagon" ? 7 : 6

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:3002/venues")
        const data = await response.json()
        setVenues(data)
        setTimeout(() => setAnimateIn(true), 100)
      } catch (error) {
        console.error("Error fetching venues:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:3002/bookings")
        const data = await response.json()
        setBookings(data)

        // Process bookings to extract confirmed dates
        if (selectedVenue) {
          const confirmedDates = data
            .filter(
              (booking) =>
                booking.status === "Confirmed" && booking.response?.venueRequest?.venue?._id === selectedVenue._id,
            )
            .flatMap((booking) => booking.response.venueRequest.eventDates)

          setBookedDates(confirmedDates)
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
      }
    }

    fetchBookings()
  }, [selectedVenue])

  // Close modal when clicking escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && selectedVenue) {
        setSelectedVenue(null)
      }
    }

    document.addEventListener("keydown", handleEscKey)

    // Prevent scrolling when modal is open
    if (selectedVenue) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "auto"
    }
  }, [selectedVenue])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch =
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCapacity = capacityFilter === "" || venue.capacity >= Number.parseInt(capacityFilter)
      const matchesPrice = priceFilter === "" || venue.pricePerDay <= Number.parseInt(priceFilter)
      return matchesSearch && matchesCapacity && matchesPrice
    })
  }, [venues, searchTerm, capacityFilter, priceFilter])

  // Calculate pagination
  const indexOfLastVenue = currentPage * venuesPerPage
  const indexOfFirstVenue = indexOfLastVenue - venuesPerPage
  const currentVenues = filteredVenues.slice(indexOfFirstVenue, indexOfLastVenue)
  const totalPages = Math.ceil(filteredVenues.length / venuesPerPage)

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRequestFormData({
      ...requestFormData,
      [name]: name === "expectedAttendance" ? Number.parseInt(value) || "" : value,
    })
  }

  const handleAddDate = (e) => {
    e.preventDefault()
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      if (!isNaN(newDate.getTime())) {
        // Check if date is already added
        const isDateAlreadyAdded = requestFormData.eventDates.some((date) => isSameDay(new Date(date), newDate))

        if (!isDateAlreadyAdded) {
          setRequestFormData({
            ...requestFormData,
            eventDates: [...requestFormData.eventDates, newDate.toISOString()],
          })
        }

        setSelectedDate(null)
        setShowCalendar(false)
      }
    }
  }

  const handleRemoveDate = (index) => {
    const updatedDates = [...requestFormData.eventDates]
    updatedDates.splice(index, 1)
    setRequestFormData({
      ...requestFormData,
      eventDates: updatedDates,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (requestFormData.eventDates.length === 0) {
      alert("Please add at least one event date")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const requestData = {
        ...requestFormData,
        venueName: selectedVenue.name,
      }

      const response = await fetch("http://localhost:3002/venue-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to submit venue request")
      }

      setSubmitSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        setSelectedVenue(null)
        setRequestFormData({
          eventName: "",
          eventDescription: "",
          expectedAttendance: "",
          eventDates: [],
          additionalRequests: "",
        })
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting venue request:", error)
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isDateBooked = (date) => {
    return bookedDates.some((bookedDate) => isSameDay(new Date(bookedDate), date))
  }

  const isDateInPast = (date) => {
    return isBefore(date, startOfToday())
  }

  const handleDateSelect = (date) => {
    if (!isDateInPast(date) && !isDateBooked(date)) {
      setSelectedDate(date)
    }
  }

  function generateCalendarDays() {
    // Get the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const startingDayOfWeek = firstDayOfMonth.getDay() // 0 for Sunday, 1 for Monday, etc.

    // Get the last day of the month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    // Generate blank spaces for days before the first day of the month
    const blanks = Array(startingDayOfWeek).fill(null)

    // Generate days of the month
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1)
      const isPast = isDateInPast(date)
      const isBooked = isDateBooked(date)
      const isSelected = selectedDate && isSameDay(date, selectedDate)

      return (
        <button
          key={`day-${i + 1}`}
          type="button"
          className={`calendar-day ${isPast ? "past" : ""} ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
          disabled={isPast || isBooked}
          onClick={() => handleDateSelect(date)}
        >
          {i + 1}
        </button>
      )
    })

    // Generate next month's days to fill the grid
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7
    const nextMonthDays = Array(totalCells - (blanks.length + days.length)).fill(null)

    return [
      ...blanks.map((_, i) => <span key={`blank-${i}`} className="calendar-day empty"></span>),
      ...days,
      ...nextMonthDays.map((_, i) => <span key={`next-${i}`} className="calendar-day empty"></span>),
    ]
  }

  function goToPreviousMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  function getMonthName(month) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return monthNames[month]
  }

  // Generate random rating between 4.0 and 5.0
  const generateRating = () => {
    return (4 + Math.random()).toFixed(1)
  }

  const toggleFavorite = (venueId, e) => {
    e.stopPropagation()
    setFavorites((prev) => (prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId]))
  }

  // Get a color based on venue price
  const getPriceColor = (price) => {
    if (price <= 3) return "#10b981" // green for low price
    if (price <= 7) return "#f59e0b" // amber for medium price
    return "#ef4444" // red for high price
  }

  // Get a color based on venue capacity
  const getCapacityColor = (capacity) => {
    if (capacity < 3000) return "#3b82f6" // blue for small capacity
    if (capacity < 7000) return "#8b5cf6" // purple for medium capacity
    return "#ec4899" // pink for large capacity
  }

  return (
    <div className="venue-page">
      <main className="main-content">
        <div className="header-section">
          <div className="title-container">
            <h1 className="page-title">Venue Explorer</h1>
            <p className="page-description">Discover extraordinary spaces for your next event</p>
          </div>

          <div className="view-toggles">
            <button
              className={`view-toggle ${viewMode === "hexagon" ? "active" : ""}`}
              onClick={() => setViewMode("hexagon")}
            >
              <Hexagon size={18} />
              <span>Honeycomb</span>
            </button>
            <button
              className={`view-toggle ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <div className="grid-icon"></div>
              <span>Grid</span>
            </button>
            <button
              className={`view-toggle ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <div className="list-icon"></div>
              <span>List</span>
            </button>
          </div>
        </div>

        <div className="filters-container">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search venues by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Capacity</label>
            <select
              className="filter-select"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="">Any size</option>
              <option value="1000">1000+ guests</option>
              <option value="3000">3000+ guests</option>
              <option value="5000">5000+ guests</option>
              <option value="10000">10000+ guests</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price</label>
            <select className="filter-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
              <option value="">Any price</option>
              <option value="1">Up to Ksh 1</option>
              <option value="5">Up to Ksh 5</option>
              <option value="10">Up to Ksh 10</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Discovering amazing venues...</p>
          </div>
        ) : (
          <>
            {viewMode === "hexagon" && (
              <div className={`honeycomb-container ${animateIn ? "animate-in" : ""}`}>
                {currentVenues.length === 0 ? (
                  <div className="no-venues">No venues match your search criteria</div>
                ) : (
                  <div className="honeycomb">
                    {currentVenues.map((venue, index) => (
                      <div
                        key={venue._id}
                        className={`honeycomb-cell ${index % 2 === 0 ? "even" : "odd"}`}
                        onClick={() => setSelectedVenue(venue)}
                        onMouseEnter={() => setHoverVenue(venue._id)}
                        onMouseLeave={() => setHoverVenue(null)}
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          backgroundImage: `url(${venue.images[0] || "/placeholder.svg?height=300&width=300"})`,
                        }}
                      >
                        <div className="honeycomb-content">
                          <div className={`venue-details ${hoverVenue === venue._id ? "show" : ""}`}>
                            <h2 className="venue-name">{venue.name}</h2>
                            <div className="venue-meta">
                              <div className="venue-location">
                                <MapPin size={14} />
                                <span>{venue.location}</span>
                              </div>
                              <div className="venue-capacity">
                                <Users size={14} />
                                <span>{venue.capacity.toLocaleString()}</span>
                              </div>
                              <div className="venue-price">
                                <DollarSign size={14} />
                                <span>Ksh {venue.pricePerDay}</span>
                              </div>
                            </div>
                          </div>

                          <div className="honeycomb-overlay">
                            <button
                              className={`favorite-button ${favorites.includes(venue._id) ? "favorited" : ""}`}
                              onClick={(e) => toggleFavorite(venue._id, e)}
                            >
                              <Heart size={16} />
                            </button>
                            <div className="venue-rating">
                              <Star size={14} />
                              <span>{generateRating()}</span>
                            </div>
                          </div>

                          <div className="honeycomb-status">
                            <span className={venue.availability ? "available" : "booked"}>
                              {venue.availability ? "Available" : "Booked"}
                            </span>
                          </div>
                        </div>
                        <div className="honeycomb-shape"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === "grid" && (
              <div className={`venues-grid ${animateIn ? "animate-in" : ""}`}>
                {currentVenues.length === 0 ? (
                  <div className="no-venues">No venues match your search criteria</div>
                ) : (
                  currentVenues.map((venue, index) => (
                    <div
                      key={venue._id}
                      className="venue-card"
                      onClick={() => setSelectedVenue(venue)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="venue-image">
                        <img src={venue.images[0] || "/placeholder.svg?height=200&width=350"} alt={venue.name} />
                        <div className="venue-overlay">
                          <button
                            className={`favorite-button ${favorites.includes(venue._id) ? "favorited" : ""}`}
                            onClick={(e) => toggleFavorite(venue._id, e)}
                          >
                            <Heart size={18} />
                          </button>
                          <div className="venue-rating">
                            <Star size={16} />
                            <span>{generateRating()}</span>
                          </div>
                          <div className={`status-badge ${venue.availability ? "status-available" : "status-booked"}`}>
                            {venue.availability ? "Available" : "Booked"}
                          </div>
                        </div>
                      </div>
                      <div className="venue-content">
                        <h2 className="venue-name">{venue.name}</h2>
                        <div className="venue-details">
                          <p className="venue-detail">
                            <MapPin size={16} />
                            <span>{venue.location}</span>
                          </p>
                          <p className="venue-detail">
                            <Users size={16} />
                            <span>{venue.capacity.toLocaleString()} guests</span>
                          </p>
                          <p className="venue-detail">
                            <DollarSign size={16} />
                            <span>Ksh {venue.pricePerDay} per day</span>
                          </p>
                        </div>
                        <div className="venue-amenities">
                          {venue.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="amenity">
                              {amenity}
                            </span>
                          ))}
                          {venue.amenities.length > 3 && (
                            <span className="amenity-more">+{venue.amenities.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {viewMode === "list" && (
              <div className={`venues-list ${animateIn ? "animate-in" : ""}`}>
                {currentVenues.length === 0 ? (
                  <div className="no-venues">No venues match your search criteria</div>
                ) : (
                  currentVenues.map((venue, index) => (
                    <div
                      key={venue._id}
                      className="venue-list-item"
                      onClick={() => setSelectedVenue(venue)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="venue-list-image">
                        <img src={venue.images[0] || "/placeholder.svg?height=150&width=150"} alt={venue.name} />
                        <div className={`status-indicator ${venue.availability ? "available" : "booked"}`}></div>
                      </div>
                      <div className="venue-list-content">
                        <div className="venue-list-header">
                          <h2 className="venue-name">{venue.name}</h2>
                          <div className="venue-actions">
                            <div className="venue-rating">
                              <Star size={14} />
                              <span>{generateRating()}</span>
                            </div>
                            <button
                              className={`favorite-button ${favorites.includes(venue._id) ? "favorited" : ""}`}
                              onClick={(e) => toggleFavorite(venue._id, e)}
                            >
                              <Heart size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="venue-list-details">
                          <div className="venue-detail">
                            <MapPin size={14} />
                            <span>{venue.location}</span>
                          </div>
                          <div className="venue-detail">
                            <Users size={14} />
                            <span>{venue.capacity.toLocaleString()} guests</span>
                          </div>
                          <div className="venue-detail">
                            <DollarSign size={14} />
                            <span>Ksh {venue.pricePerDay} per day</span>
                          </div>
                        </div>
                        <div className="venue-list-description">
                          <p>{venue.description.substring(0, 120)}...</p>
                        </div>
                        <div className="venue-list-amenities">
                          {venue.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="amenity">
                              {amenity}
                            </span>
                          ))}
                          {venue.amenities.length > 4 && (
                            <span className="amenity-more">+{venue.amenities.length - 4}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="venue-list-indicator"
                        style={{
                          background: `linear-gradient(135deg, ${getPriceColor(venue.pricePerDay)}, ${getCapacityColor(venue.capacity)})`,
                        }}
                      ></div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredVenues.length > venuesPerPage && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`pagination-number ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-button"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {selectedVenue && (
        <div className="modal-overlay" onClick={() => setSelectedVenue(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setSelectedVenue(null)}>
              <X size={24} />
            </button>

            {submitSuccess ? (
              <div className="success-message">
                <div className="success-icon">
                  <CheckCircle size={64} />
                  <div className="success-sparkles">
                    <Sparkles size={24} className="sparkle sparkle-1" />
                    <Sparkles size={16} className="sparkle sparkle-2" />
                    <Sparkles size={20} className="sparkle sparkle-3" />
                  </div>
                </div>
                <h3>Request Submitted!</h3>
                <p>Your venue request has been successfully submitted.</p>
              </div>
            ) : (
              <div className="modal-content">
                <div className="modal-left">
                  <div className="modal-header">
                    <h2 className="modal-title">Request Venue</h2>
                    <div className="modal-subtitle">
                      <PenTool size={16} />
                      <span>Fill in your event details</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="request-form">
                    <div className="form-group">
                      <label htmlFor="eventName">Event Name</label>
                      <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        value={requestFormData.eventName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Tech Conference 2025"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="eventDescription">Event Description</label>
                      <textarea
                        id="eventDescription"
                        name="eventDescription"
                        value={requestFormData.eventDescription}
                        onChange={handleInputChange}
                        required
                        placeholder="Describe your event..."
                        rows={3}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label htmlFor="expectedAttendance">Expected Attendance</label>
                      <input
                        type="number"
                        id="expectedAttendance"
                        name="expectedAttendance"
                        value={requestFormData.expectedAttendance}
                        onChange={handleInputChange}
                        required
                        placeholder="Number of guests"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Event Dates</label>
                      <div className="date-input-group">
                        <div className="calendar-input-wrapper" ref={calendarRef}>
                          <button
                            type="button"
                            className="calendar-trigger"
                            onClick={() => setShowCalendar(!showCalendar)}
                          >
                            <CalendarIcon size={16} />
                            <span>{selectedDate ? format(selectedDate, "PPP") : "Select a date"}</span>
                          </button>

                          {showCalendar && (
                            <div className="calendar-dropdown">
                              <div className="calendar">
                                <div className="calendar-header">
                                  <button
                                    type="button"
                                    className="month-nav-button"
                                    onClick={goToPreviousMonth}
                                    aria-label="Previous month"
                                  >
                                    <ChevronLeft size={16} />
                                  </button>
                                  <h4>
                                    {getMonthName(currentMonth)} {currentYear}
                                  </h4>
                                  <button
                                    type="button"
                                    className="month-nav-button"
                                    onClick={goToNextMonth}
                                    aria-label="Next month"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                </div>
                                <div className="calendar-grid">
                                  <div className="calendar-days-header">
                                    <span>Sun</span>
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                  </div>
                                  <div className="calendar-days">{generateCalendarDays()}</div>
                                </div>
                                <div className="calendar-legend">
                                  <div className="legend-item">
                                    <span className="legend-color past"></span>
                                    <span>Past dates</span>
                                  </div>
                                  <div className="legend-item">
                                    <span className="legend-color booked"></span>
                                    <span>Booked dates</span>
                                  </div>
                                  <div className="legend-item">
                                    <span className="legend-color available"></span>
                                    <span>Available</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="add-date-button"
                          onClick={handleAddDate}
                          disabled={!selectedDate}
                        >
                          Add Date
                        </button>
                      </div>

                      {requestFormData.eventDates.length > 0 && (
                        <div className="selected-dates">
                          {requestFormData.eventDates.map((date, index) => (
                            <div key={index} className="date-tag">
                              <span>{formatDate(date)}</span>
                              <button type="button" className="remove-date" onClick={() => handleRemoveDate(index)}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="additionalRequests">Additional Requests</label>
                      <textarea
                        id="additionalRequests"
                        name="additionalRequests"
                        value={requestFormData.additionalRequests}
                        onChange={handleInputChange}
                        placeholder="Any special requirements or requests..."
                        rows={3}
                      ></textarea>
                    </div>

                    {submitError && <div className="error-message">{submitError}</div>}

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="button-spinner"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="modal-right">
                  <div className="venue-image-gallery">
                    <img
                      src={selectedVenue.images[0] || "/placeholder.svg?height=400&width=600"}
                      alt={selectedVenue.name}
                      className="venue-main-image"
                    />
                    <div className="venue-status-badge">
                      <div className={`status-indicator ${selectedVenue.availability ? "available" : "booked"}`}></div>
                      <span>{selectedVenue.availability ? "Available" : "Booked"}</span>
                    </div>
                  </div>

                  <div className="venue-details-container">
                    <div className="venue-header">
                      <h2 className="venue-name-large">{selectedVenue.name}</h2>
                      <div className="venue-rating-large">
                        <Star size={18} className="star-icon" />
                        <span>{generateRating()}</span>
                      </div>
                    </div>

                    <div className="venue-details-grid">
                      <div className="venue-detail-item">
                        <div className="detail-icon">
                          <MapPin size={20} />
                        </div>
                        <div className="detail-content">
                          <span className="detail-label">Location</span>
                          <span className="detail-value">{selectedVenue.location}</span>
                        </div>
                      </div>

                      <div className="venue-detail-item">
                        <div className="detail-icon">
                          <Users size={20} />
                        </div>
                        <div className="detail-content">
                          <span className="detail-label">Capacity</span>
                          <span className="detail-value">{selectedVenue.capacity.toLocaleString()} guests</span>
                        </div>
                      </div>

                      <div className="venue-detail-item">
                        <div className="detail-icon">
                          <DollarSign size={20} />
                        </div>
                        <div className="detail-content">
                          <span className="detail-label">Price</span>
                          <span className="detail-value">Ksh {selectedVenue.pricePerDay} per day</span>
                        </div>
                      </div>

                      <div className="venue-detail-item">
                        <div className="detail-icon">
                          <Clock size={20} />
                        </div>
                        <div className="detail-content">
                          <span className="detail-label">Availability</span>
                          <span className="detail-value">
                            {selectedVenue.availability ? "Ready to book" : "Currently booked"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="venue-description-large">
                      <h3>About this venue</h3>
                      <p>{selectedVenue.description}</p>
                    </div>

                    <div className="venue-amenities-large">
                      <h3>Amenities</h3>
                      <div className="amenities-list">
                        {selectedVenue.amenities.map((amenity, index) => (
                          <span key={index} className="amenity-large">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        /* Base Styles */
        :root {
          --primary: #6d28d9;
          --primary-light: #ede9fe;
          --primary-dark: #5b21b6;
          --secondary: #ec4899;
          --secondary-light: #fce7f3;
          --secondary-dark: #db2777;
          --accent: #06b6d4;
          --accent-light: #cffafe;
          --accent-dark: #0891b2;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --background: #f8f7ff;
          --foreground: #1e1b4b;
          --card: #ffffff;
          --card-foreground: #1e293b;
          --border: #e2e8f0;
          --muted: #f1f5f9;
          --muted-foreground: #64748b;
          --radius: 1rem;
          --shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .venue-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--foreground);
          background-color: var(--background);
          min-height: 100vh;
          padding: 2rem;
        }

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header Section */
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .title-container {
          position: relative;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          position: relative;
        }

        .page-title::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          width: 4rem;
          height: 0.25rem;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          border-radius: 1rem;
        }

        .page-description {
          color: var(--muted-foreground);
          font-size: 1.125rem;
          margin-top: 1rem;
        }

        /* View Toggles */
        .view-toggles {
          display: flex;
          gap: 0.75rem;
        }

        .view-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.875rem;
          color: var(--muted-foreground);
          cursor: pointer;
          transition: var(--transition);
        }

        .view-toggle:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .view-toggle.active {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary-dark);
        }

        .grid-icon, .list-icon {
          width: 18px;
          height: 18px;
          position: relative;
        }

        .grid-icon:before, .grid-icon:after {
          content: '';
          position: absolute;
          background: currentColor;
        }

        .grid-icon:before {
          width: 7px;
          height: 7px;
          top: 0;
          left: 0;
          box-shadow: 11px 0 0 0 currentColor, 0 11px 0 0 currentColor, 11px 11px 0 0 currentColor;
        }

        .list-icon:before {
          width: 18px;
          height: 2px;
          top: 3px;
          left: 0;
          box-shadow: 0 5px 0 0 currentColor, 0 10px 0 0 currentColor;
        }

        /* Filters */
        .filters-container {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          background: var(--card);
          padding: 1.5rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        .search-bar {
          display: flex;
          align-items: center;
          background-color: var(--muted);
          border-radius: var(--radius);
          padding: 0.75rem 1.25rem;
          flex-grow: 1;
          transition: var(--transition);
        }

        .search-bar svg {
          color: var(--muted-foreground);
          margin-right: 0.75rem;
        }

        .search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.875rem;
          background-color: transparent;
          color: var(--foreground);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-select {
          padding: 0.75rem 1.25rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background-color: var(--card);
          font-size: 0.875rem;
          color: var(--foreground);
          min-width: 180px;
          transition: var(--transition);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1rem;
        }

        .filter-select:focus {
          border-color: var(--primary);
          outline: none;
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          color: var(--muted-foreground);
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 3px solid var(--primary-light);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Honeycomb Layout */
        .honeycomb-container {
          margin-bottom: 3rem;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .honeycomb-container.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .honeycomb {
          display: flex;
          flex-wrap: wrap;
          margin: 0 auto;
          max-width: 1200px;
          padding: 0;
          transform: translateX(25px);
        }

        .honeycomb-cell {
          flex: 0 1 250px;
          max-width: 250px;
          height: 280px;
          margin: 65px 12.5px 25px;
          position: relative;
          padding: 0.5em;
          text-align: center;
          z-index: 1;
          box-shadow: var(--shadow);
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(0.8);
          animation: fadeInScale 0.5s forwards;
          cursor: pointer;
        }

        .honeycomb-cell.odd {
          margin-top: 95px;
        }

        @keyframes fadeInScale {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .honeycomb-cell::before,
        .honeycomb-cell::after {
          content: '';
        }

        .honeycomb-cell::before,
        .honeycomb-cell::after,
        .honeycomb-shape {
          position: absolute;
          top: -50%;
          left: 0;
          width: 100%;
          height: 200%;
          display: block;
          z-index: -1;
        }

        .honeycomb-shape {
          background: var(--card);
          -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }

        .honeycomb-cell::before {
          background: var(--card);
          opacity: 0.7;
          -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }

        .honeycomb-cell::after {
          content: '';
          background: linear-gradient(135deg, rgba(109, 40, 217, 0.4), rgba(236, 72, 153, 0.4));
          -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          z-index: 1;
          transition: opacity 0.3s;
          opacity: 0;
        }

        .honeycomb-cell:hover::after {
          opacity: 1;
        }

        .honeycomb-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          z-index: 2;
          position: relative;
        }

        .honeycomb-overlay {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 3;
        }

        .honeycomb-status {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
        }

        .honeycomb-status span {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .honeycomb-status span.available {
          background-color: var(--success);
          color: white;
        }

        .honeycomb-status span.booked {
          background-color: var(--warning);
          color: white;
        }

        .venue-details {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
        }

        .venue-details.show {
          opacity: 1;
        }

        .honeycomb-cell .venue-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .venue-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .venue-location, .venue-capacity, .venue-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.875rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .venue-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .star-icon {
          color: #fbbf24;
        }

        .favorite-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
          backdrop-filter: blur(4px);
        }

        .favorite-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .favorite-button.favorited {
          background: rgba(236, 72, 153, 0.7);
        }

        .favorite-button.favorited svg {
          fill: white;
        }

        /* Grid Layout */
        .venues-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .venues-grid.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .venue-card {
          background-color: var(--card);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: transform 0.3s, box-shadow 0.3s;
          opacity: 0;
          animation: fadeIn 0.5s forwards;
          cursor: pointer;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .venue-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .venue-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .venue-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .venue-card:hover .venue-image img {
          transform: scale(1.1);
        }

        .venue-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 60%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem;
        }

        .status-badge {
          align-self: flex-end;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        .status-available {
          background-color: rgba(16, 185, 129, 0.8);
          color: white;
        }

        .status-booked {
          background-color: rgba(245, 158, 11, 0.8);
          color: white;
        }

        .venue-content {
          padding: 1.5rem;
        }

        .venue-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--card-foreground);
          margin-bottom: 1rem;
        }

        .venue-details {
          margin-bottom: 1rem;
        }

        .venue-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .venue-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .amenity {
          background-color: var(--primary-light);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: var(--primary-dark);
          font-weight: 500;
        }

        .amenity-more {
          background-color: var(--muted);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: var(--muted-foreground);
          font-weight: 500;
        }

        /* List Layout */
        .venues-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .venues-list.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .venue-list-item {
          display: flex;
          background-color: var(--card);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: transform 0.3s, box-shadow 0.3s;
          position: relative;
          opacity: 0;
          animation: fadeIn 0.5s forwards;
          cursor: pointer;
        }

        .venue-list-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .venue-list-image {
          width: 180px;
          height: 180px;
          position: relative;
        }

        .venue-list-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-indicator {
          position: absolute;
          top: 1rem;
          left: 1rem;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .status-indicator.available {
          background-color: var(--success);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
        }

        .status-indicator.booked {
          background-color: var(--warning);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
        }

        .venue-list-content {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .venue-list-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .venue-list-actions {
          display: flex;
          gap: 0.75rem;
        }

        .venue-list-details {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .venue-list-description {
          margin-bottom: 1rem;
          color: var(--muted-foreground);
          font-size: 0.875rem;
          line-height: 1.5;
          flex-grow: 1;
        }

        .venue-list-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .venue-list-indicator {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 6px;
          border-top-left-radius: var(--radius);
          border-bottom-left-radius: var(--radius);
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 3rem;
          margin-bottom: 2rem;
        }

        .pagination-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          background-color: var(--card);
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition);
        }

        .pagination-button:hover:not(:disabled) {
          background-color: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-numbers {
          display: flex;
          gap: 0.5rem;
          margin: 0 1rem;
        }

        .pagination-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          background-color: var(--card);
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .pagination-number:hover {
          background-color: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .pagination-number.active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-container {
          background-color: var(--card);
          border-radius: var(--radius);
          width: 90%;
          max-width: 1200px;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-close-button {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: var(--transition);
        }

        .modal-close-button:hover {
          background: white;
          transform: rotate(90deg);
        }

        .modal-content {
          display: flex;
          height: 100%;
          overflow: auto;
        }

        .modal-left {
          flex: 1;
          padding: 2.5rem;
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }

        .modal-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .modal-header {
          margin-bottom: 2rem;
        }

        .modal-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
        }

        .modal-subtitle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .request-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
        }

        .form-group input,
        .form-group textarea {
          padding: 0.875rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.875rem;
          color: var(--foreground);
          width: 100%;
          transition: var(--transition);
          background-color: var(--card);
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(109, 40, 217, 0.1);
        }

        .date-input-group {
          display: flex;
          gap: 0.75rem;
        }

        .calendar-input-wrapper {
          position: relative;
          flex: 1;
        }

        .calendar-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background-color: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.875rem;
          color: var(--foreground);
          cursor: pointer;
          text-align: left;
          transition: var(--transition);
        }

        .calendar-trigger:hover {
          border-color: var(--primary);
        }

        .calendar-dropdown {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          z-index: 10;
          width: 320px;
          background-color: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
          animation: fadeIn 0.2s ease;
        }

        .calendar {
          padding: 1.25rem;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .calendar-header h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
          margin: 0;
        }

        .month-nav-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--muted);
          border: none;
          border-radius: 50%;
          color: var(--foreground);
          cursor: pointer;
          transition: var(--transition);
        }

        .month-nav-button:hover {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .calendar-grid {
          margin-bottom: 1.25rem;
        }

        .calendar-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--muted-foreground);
          margin-bottom: 0.75rem;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .calendar-day {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          width: 36px;
          font-size: 0.875rem;
          border-radius: 50%;
          border: none;
          background: none;
          cursor: pointer;
          transition: var(--transition);
        }

        .calendar-day:hover:not(.empty):not(.past):not(.booked) {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .calendar-day.empty {
          cursor: default;
        }

        .calendar-day.past {
          color: var(--muted-foreground);
          opacity: 0.5;
          cursor: not-allowed;
        }

        .calendar-day.booked {
          background-color: var(--secondary-light);
          color: var(--secondary);
          cursor: not-allowed;
        }

        .calendar-day.selected {
          background-color: var(--primary);
          color: white;
        }

        .calendar-legend {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--muted-foreground);
          padding-top: 0.75rem;
          border-top: 1px solid var(--border);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .legend-color {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-color.past {
          background-color: var(--muted);
          border: 1px solid var(--muted-foreground);
        }

        .legend-color.booked {
          background-color: var(--secondary-light);
          border: 1px solid var(--secondary);
        }

        .legend-color.available {
          background-color: var(--primary-light);
          border: 1px solid var(--primary);
        }

        .add-date-button {
          padding: 0.875rem 1rem;
          background-color: var(--accent-light);
          color: var(--accent-dark);
          border: none;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }

        .add-date-button:hover:not(:disabled) {
          background-color: var(--accent);
          color: white;
        }

        .add-date-button:disabled {
          background-color: var(--muted);
          color: var(--muted-foreground);
          cursor: not-allowed;
        }

        .selected-dates {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .date-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--primary-light);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius);
          font-size: 0.75rem;
          color: var(--primary-dark);
        }

        .remove-date {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.125rem;
          transition: var(--transition);
        }

        .remove-date:hover {
          color: var(--danger);
        }

        .error-message {
          padding: 0.875rem 1rem;
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border-radius: var(--radius);
          font-size: 0.875rem;
          border-left: 3px solid var(--danger);
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          margin-top: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: 0.5s;
        }

        .submit-button:hover::before {
          left: 100%;
        }

        .submit-button:disabled {
          background: var(--muted);
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .venue-image-gallery {
          position: relative;
          height: 300px;
          overflow: hidden;
        }

        .venue-main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .venue-status-badge {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }

        .venue-details-container {
          padding: 2.5rem;
        }

        .venue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .venue-name-large {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .venue-rating-large {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--primary-light);
          color: var(--primary-dark);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .venue-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .venue-detail-item {
          display: flex;
          gap: 1rem;
        }

        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: var(--primary-light);
          color: var(--primary);
          border-radius: var(--radius);
        }

        .detail-content {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: 1rem;
          color: var(--foreground);
          font-weight: 500;
        }

        .venue-description-large {
          margin-bottom: 2rem;
        }

        .venue-description-large h3,
        .venue-amenities-large h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--foreground);
          position: relative;
          padding-bottom: 0.5rem;
        }

        .venue-description-large h3::after,
        .venue-amenities-large h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 3rem;
          height: 3px;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          border-radius: 3px;
        }

        .venue-description-large p {
          color: var(--card-foreground);
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        .amenities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .amenity-large {
          background-color: var(--primary-light);
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          color: var(--primary-dark);
          font-weight: 500;
          transition: var(--transition);
        }

        .amenity-large:hover {
          background-color: var(--primary);
          color: white;
        }

        .success-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .success-icon {
          position: relative;
          color: var(--success);
          margin-bottom: 1.5rem;
        }

        .success-sparkles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .sparkle {
          position: absolute;
          color: var(--primary);
          animation: sparkle 2s infinite;
        }

        .sparkle-1 {
          top: -20px;
          right: -10px;
          animation-delay: 0s;
        }

        .sparkle-2 {
          bottom: -10px;
          left: -10px;
          animation-delay: 0.4s;
        }

        .sparkle-3 {
          top: 10px;
          left: -20px;
          animation-delay: 0.8s;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }

        .success-message h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .success-message p {
          color: var(--muted-foreground);
          font-size: 1.125rem;
          max-width: 400px;
        }

        .no-venues {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background-color: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          color: var(--muted-foreground);
          font-size: 1.125rem;
        }

        @media (max-width: 1024px) {
          .honeycomb-cell {
            margin: 50px 10px;
          }
          
          .venues-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
          
          .venue-details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .venue-page {
            padding: 1rem;
          }
          
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .filters-container {
            flex-direction: column;
          }
          
          .venues-grid {
            grid-template-columns: 1fr;
          }
          
          .honeycomb {
            justify-content: center;
          }
          
          .modal-content {
            flex-direction: column-reverse;
          }
          
          .modal-left,
          .modal-right {
            width: 100%;
            border-right: none;
          }
          
          .modal-right {
            border-bottom: 1px solid var(--border);
          }
          
          .venue-image-gallery {
            height: 250px;
          }
          
          .venue-list-item {
            flex-direction: column;
          }
          
          .venue-list-image {
            width: 100%;
            height: 200px;
          }
          
          .venue-list-indicator {
            width: 100%;
            height: 6px;
            top: 0;
            left: 0;
            right: 0;
            bottom: auto;
            border-radius: var(--radius) var(--radius) 0 0;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 2rem;
          }
          
          .view-toggles {
            width: 100%;
            justify-content: space-between;
          }
          
          .date-input-group {
            flex-direction: column;
          }
          
          .modal-container {
            width: 95%;
            max-height: 95vh;
          }
          
          .modal-left,
          .modal-right {
            padding: 1.5rem;
          }
          
          .pagination-numbers {
            display: none;
          }
          
          .pagination {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  )
}

