import { useState, useEffect, useRef } from "react";

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [timeIndicator, setTimeIndicator] = useState(new Date());
  const [viewMode, setViewMode] = useState("grid");

  const timelineRef = useRef(null);

  // Add these new state variables after the existing state declarations (around line 15)
  const [currentUser, setCurrentUser] = useState(null);
  const [completeBookings, setCompleteBookings] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [assignedBookingIds, setAssignedBookingIds] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch events data
  useEffect(() => {
    // Modify the existing fetchEvents function in the first useEffect to filter by current user
    // Replace the existing fetchEvents function with this one
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3002/events");

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const data = await response.json();

        // Extract booking IDs that are already assigned to events
        const bookingIds = data.map((event) => event.bookingId._id);
        setAssignedBookingIds(bookingIds);

        // Filter events by current user if available
        if (currentUser) {
          const filteredData = data.filter(
            (event) => event.bookingId.organizer._id === currentUser.id
          );
          setEvents(filteredData);
          setFilteredEvents(filteredData);
        } else {
          setEvents(data);
          setFilteredEvents(data);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser]);

  // Add this new useEffect to fetch current user after the existing useEffects
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:3002/current-user", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch current user: ${response.status}`);
        }

        const data = await response.json();
        setCurrentUser(data.user);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Filter events based on active filter and search term
  useEffect(() => {
    let result = [...events];

    // Apply status filter
    if (activeFilter !== "All") {
      result = result.filter((event) => event.status === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.bookingId.response.venueRequest.eventName
            .toLowerCase()
            .includes(term) ||
          (event.bookingId.response.venueRequest.venue &&
            event.bookingId.response.venueRequest.venue.name
              .toLowerCase()
              .includes(term)) ||
          (event.bookingId.response.venueRequest.venue &&
            event.bookingId.response.venueRequest.venue.location
              .toLowerCase()
              .includes(term))
      );
    }

    setFilteredEvents(result);
  }, [events, activeFilter, searchTerm]);

  // Update time indicator every minute for the timeline view
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeIndicator(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format date range for display
  const formatDateRange = (dates) => {
    if (!dates || dates.length === 0) return "No dates specified";

    if (dates.length === 1) {
      return formatDate(dates[0]);
    }

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    const startOptions = {
      month: "short",
      day: "numeric",
    };

    const endOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    // If same year, don't repeat the year
    if (startDate.getFullYear() === endDate.getFullYear()) {
      // If same month, don't repeat the month
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getDate()} - ${endDate.toLocaleDateString(
          "en-US",
          endOptions
        )}`;
      }
      return `${startDate.toLocaleDateString(
        "en-US",
        startOptions
      )} - ${endDate.toLocaleDateString("en-US", endOptions)}`;
    }

    return `${startDate.toLocaleDateString(
      "en-US",
      endOptions
    )} - ${endDate.toLocaleDateString("en-US", endOptions)}`;
  };

  // Calculate days until event
  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();

    // Reset time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Get event duration in days
  const getEventDuration = (dates) => {
    if (!dates || dates.length <= 1) return 1;

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    // Reset time part for accurate day calculation
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the end day

    return diffDays;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "var(--color-upcoming)";
      case "Ongoing":
        return "var(--color-ongoing)";
      case "Completed":
        return "var(--color-completed)";
      default:
        return "var(--color-neutral)";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Upcoming":
        return (
          <svg viewBox="0 0 24 24" className="status-icon upcoming">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Ongoing":
        return (
          <svg viewBox="0 0 24 24" className="status-icon ongoing">
            <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "Completed":
        return (
          <svg viewBox="0 0 24 24" className="status-icon completed">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  // Close event detail
  const closeEventDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedEvent(null), 300); // Wait for animation to complete
  };

  // Scroll to current time in timeline view
  const scrollToCurrentTime = () => {
    if (timelineRef.current) {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const minutesSinceMidnight =
        (now.getTime() - startOfDay.getTime()) / (1000 * 60);
      const scrollPosition =
        (minutesSinceMidnight / 1440) * timelineRef.current.scrollWidth;

      timelineRef.current.scrollTo({
        left: scrollPosition - timelineRef.current.clientWidth / 2,
        behavior: "smooth",
      });
    }
  };

  // Add this function to fetch complete bookings
  const fetchCompleteBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch("http://localhost:3002/bookings");

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();

      // Filter bookings by:
      // 1. Current user
      // 2. Status "Confirmed"
      // 3. Not already assigned to an event
      if (currentUser) {
        const filteredData = data.filter(
          (booking) =>
            booking.organizer._id === currentUser.id &&
            booking.status === "Confirmed" &&
            !assignedBookingIds.includes(booking._id)
        );
        setCompleteBookings(filteredData);
      } else {
        const filteredData = data.filter(
          (booking) =>
            booking.status === "Confirmed" &&
            !assignedBookingIds.includes(booking._id)
        );
        setCompleteBookings(filteredData);
      }

      setIsBookingModalOpen(true);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      alert("Failed to load bookings. Please try again.");
    } finally {
      setLoadingBookings(false);
    }
  };

  // Add this function to create a new event
  const createEvent = async () => {
    if (!selectedBooking) return;

    setIsCreatingEvent(true);

    try {
      const response = await fetch("http://localhost:3002/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          status: "Upcoming",
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.status}`);
      }

      // Refresh events list
      const fetchEvents = async () => {
        try {
          setLoading(true);
          const response = await fetch("http://localhost:3002/events");

          if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
          }

          const data = await response.json();

          // Extract booking IDs that are already assigned to events
          const bookingIds = data.map((event) => event.bookingId._id);
          setAssignedBookingIds(bookingIds);

          // Filter events by current user if available
          if (currentUser) {
            const filteredData = data.filter(
              (event) => event.bookingId.organizer._id === currentUser.id
            );
            setEvents(filteredData);
            setFilteredEvents(filteredData);
          } else {
            setEvents(data);
            setFilteredEvents(data);
          }
        } catch (err) {
          console.error("Error fetching events:", err);
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();

      setIsBookingModalOpen(false);
      setSelectedBooking(null);

      alert("Event created successfully!");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  if (loading) {
    return (
      <div className="event-dashboard loading-state">
        <div className="loading-container">
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="event-dashboard error-state">
        <div className="error-container">
          <div className="error-icon">!</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Event Dashboard</h1>
          <p className="subtitle">
            Manage your upcoming, ongoing, and completed events
          </p>
        </div>

        {/* Add the Create Event button in the header-actions div (around line 400) */}
        {/* Find the header-actions div and add this button before the view-toggle div */}
        <div className="header-actions">
          <button className="create-event-btn" onClick={fetchCompleteBookings}>
            <svg viewBox="0 0 24 24" className="create-icon">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </button>

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${
                viewMode === "grid" ? "active" : ""
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <svg viewBox="0 0 24 24" className="view-icon">
                <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${
                viewMode === "timeline" ? "active" : ""
              }`}
              onClick={() => {
                setViewMode("timeline");
                setTimeout(scrollToCurrentTime, 100);
              }}
              aria-label="Timeline view"
            >
              <svg viewBox="0 0 24 24" className="view-icon">
                <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${
                viewMode === "calendar" ? "active" : ""
              }`}
              onClick={() => setViewMode("calendar")}
              aria-label="Calendar view"
            >
              <svg viewBox="0 0 24 24" className="view-icon">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg viewBox="0 0 24 24" className="search-icon">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="event-filters">
        <button
          className={`filter-btn ${activeFilter === "All" ? "active" : ""}`}
          onClick={() => setActiveFilter("All")}
        >
          All Events
        </button>
        <button
          className={`filter-btn ${
            activeFilter === "Upcoming" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("Upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`filter-btn ${activeFilter === "Ongoing" ? "active" : ""}`}
          onClick={() => setActiveFilter("Ongoing")}
        >
          Ongoing
        </button>
        <button
          className={`filter-btn ${
            activeFilter === "Completed" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("Completed")}
        >
          Completed
        </button>
      </div>

      {/* Event Count */}
      <div className="event-count">
        <p>
          Showing{" "}
          <span className="count-highlight">{filteredEvents.length}</span>
          {activeFilter !== "All" ? ` ${activeFilter.toLowerCase()}` : ""}{" "}
          events
        </p>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event._id}
                className={`event-card ${event.status.toLowerCase()}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="event-card-header">
                  <div className="event-status">
                    {getStatusIcon(event.status)}
                    <span className="status-text">{event.status}</span>
                  </div>

                  {event.status === "Upcoming" &&
                    event.bookingId.response.venueRequest.eventDates &&
                    event.bookingId.response.venueRequest.eventDates.length >
                      0 && (
                      <div className="days-counter">
                        <span className="days-number">
                          {getDaysUntil(
                            event.bookingId.response.venueRequest.eventDates[0]
                          )}
                        </span>
                        <span className="days-label">days left</span>
                      </div>
                    )}
                </div>

                <div className="event-card-image">
                  <img
                    src={
                      event.bookingId.response.venueRequest.venue &&
                      event.bookingId.response.venueRequest.venue.images
                        ? event.bookingId.response.venueRequest.venue.images[0]
                        : "/placeholder.svg?height=200&width=300"
                    }
                    alt={event.bookingId.response.venueRequest.eventName}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=300";
                    }}
                  />
                  <div className="image-overlay"></div>
                </div>

                <div className="event-card-content">
                  <h3 className="event-name">
                    {event.bookingId.response.venueRequest.eventName}
                  </h3>

                  <div className="event-venue">
                    <svg viewBox="0 0 24 24" className="venue-icon">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {event.bookingId.response.venueRequest.venue
                        ? event.bookingId.response.venueRequest.venue.name
                        : "No Venue"}
                    </span>
                  </div>

                  <div className="event-date">
                    <svg viewBox="0 0 24 24" className="date-icon">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {formatDateRange(
                        event.bookingId.response.venueRequest.eventDates
                      )}
                    </span>
                  </div>

                  <div className="event-attendance">
                    <svg viewBox="0 0 24 24" className="attendance-icon">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>
                      {event.bookingId.response.venueRequest.expectedAttendance.toLocaleString()}{" "}
                      attendees
                    </span>
                  </div>
                </div>

                <div className="event-card-footer">
                  <div className="event-payment">
                    <span className="payment-label">Payment:</span>
                    <span
                      className={`payment-status ${
                        event.bookingId.amountPaid >=
                        event.bookingId.totalAmount
                          ? "paid"
                          : "partial"
                      }`}
                    >
                      {event.bookingId.amountPaid >= event.bookingId.totalAmount
                        ? "Fully Paid"
                        : "Partially Paid"}
                    </span>
                  </div>

                  <button className="view-details-btn">
                    View Details
                    <svg viewBox="0 0 24 24" className="details-icon">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <div className="no-events-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>No events found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="events-timeline-container">
          <div className="timeline-controls">
            <button
              className="timeline-control-btn"
              onClick={scrollToCurrentTime}
            >
              <svg viewBox="0 0 24 24" className="control-icon">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Scroll to Now
            </button>
          </div>

          <div className="events-timeline" ref={timelineRef}>
            <div
              className="timeline-now-indicator"
              style={{
                left: `${
                  ((timeIndicator.getHours() * 60 +
                    timeIndicator.getMinutes()) /
                    1440) *
                  100
                }%`,
              }}
            >
              <div className="now-indicator-line"></div>
              <div className="now-indicator-label">Now</div>
            </div>

            <div className="timeline-hours">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="timeline-hour">
                  <div className="hour-label">
                    {i === 0
                      ? "12 AM"
                      : i < 12
                      ? `${i} AM`
                      : i === 12
                      ? "12 PM"
                      : `${i - 12} PM`}
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length > 0 ? (
              <div className="timeline-events">
                {filteredEvents.map((event) => {
                  // Calculate position and width based on event dates
                  const firstDate = new Date(
                    event.bookingId.response.venueRequest.eventDates[0]
                  );
                  const lastDate = new Date(
                    event.bookingId.response.venueRequest.eventDates[
                      event.bookingId.response.venueRequest.eventDates.length -
                        1
                    ]
                  );

                  // For demo purposes, we'll position events along the timeline
                  // In a real app, you'd calculate this based on actual dates
                  const startHour = firstDate.getHours();
                  const duration =
                    getEventDuration(
                      event.bookingId.response.venueRequest.eventDates
                    ) * 3; // Scale for visibility

                  return (
                    <div
                      key={event._id}
                      className={`timeline-event ${event.status.toLowerCase()}`}
                      style={{
                        left: `${(startHour / 24) * 100}%`,
                        width: `${(duration / 24) * 100}%`,
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="timeline-event-content">
                        <h4>
                          {event.bookingId.response.venueRequest.eventName}
                        </h4>
                        <div className="timeline-event-details">
                          <span className="timeline-venue">
                            {event.bookingId.response.venueRequest.venue
                              ? event.bookingId.response.venueRequest.venue.name
                              : "No Venue"}
                          </span>
                          <span className="timeline-date">
                            {formatDateRange(
                              event.bookingId.response.venueRequest.eventDates
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-events timeline-no-events">
                <h3>No events found</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="events-calendar">
          <div className="calendar-header">
            <h3>Calendar View</h3>
            <p>A visual representation of your events throughout the month</p>
          </div>

          <div className="calendar-grid">
            {/* Calendar days header */}
            <div className="calendar-days-header">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="calendar-day-name">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells - simplified for demo */}
            <div className="calendar-cells">
              {Array.from({ length: 35 }).map((_, i) => {
                // For demo purposes, we'll randomly assign events to days
                // In a real app, you'd match actual event dates to calendar days
                const hasEvent = i % 7 === 2 || i % 5 === 0;
                const isToday = i === 15; // Arbitrary "today" for demo

                return (
                  <div
                    key={i}
                    className={`calendar-cell ${isToday ? "today" : ""}`}
                  >
                    <div className="calendar-date">{i + 1}</div>
                    {hasEvent && filteredEvents.length > 0 && (
                      <div
                        className={`calendar-event ${filteredEvents[
                          i % filteredEvents.length
                        ].status.toLowerCase()}`}
                        onClick={() =>
                          handleEventClick(
                            filteredEvents[i % filteredEvents.length]
                          )
                        }
                      >
                        <span className="calendar-event-name">
                          {
                            filteredEvents[i % filteredEvents.length].bookingId
                              .response.venueRequest.eventName
                          }
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className={`event-detail-modal ${isDetailOpen ? "open" : ""}`}>
          <div className="modal-backdrop" onClick={closeEventDetail}></div>
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeEventDetail}>
              <svg viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-header">
              <div
                className="modal-status-badge"
                style={{
                  backgroundColor: getStatusColor(selectedEvent.status),
                }}
              >
                {selectedEvent.status}
              </div>
              <h2>{selectedEvent.bookingId.response.venueRequest.eventName}</h2>
            </div>

            <div className="modal-image">
              <img
                src={
                  selectedEvent.bookingId.response.venueRequest.venue &&
                  selectedEvent.bookingId.response.venueRequest.venue.images
                    ? selectedEvent.bookingId.response.venueRequest.venue
                        .images[0]
                    : "/placeholder.svg?height=300&width=600"
                }
                alt={selectedEvent.bookingId.response.venueRequest.eventName}
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=300&width=600";
                }}
              />
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3 className="section-title">Event Details</h3>

                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="detail-content">
                      <h4>Date & Time</h4>
                      <p>
                        {formatDateRange(
                          selectedEvent.bookingId.response.venueRequest
                            .eventDates
                        )}
                      </p>
                      <p className="detail-meta">
                        {getEventDuration(
                          selectedEvent.bookingId.response.venueRequest
                            .eventDates
                        )}{" "}
                        day(s)
                      </p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="detail-content">
                      <h4>Venue</h4>
                      <p>
                        {selectedEvent.bookingId.response.venueRequest.venue
                          ? selectedEvent.bookingId.response.venueRequest.venue
                              .name
                          : "No Venue"}
                      </p>
                      <p className="detail-meta">
                        {selectedEvent.bookingId.response.venueRequest.venue
                          ? selectedEvent.bookingId.response.venueRequest.venue
                              .location
                          : "Location not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="detail-content">
                      <h4>Attendance</h4>
                      <p>
                        {selectedEvent.bookingId.response.venueRequest.expectedAttendance.toLocaleString()}{" "}
                        people
                      </p>
                      {selectedEvent.bookingId.response.venueRequest.venue && (
                        <p className="detail-meta">
                          {Math.round(
                            (selectedEvent.bookingId.response.venueRequest
                              .expectedAttendance /
                              selectedEvent.bookingId.response.venueRequest
                                .venue.capacity) *
                              100
                          )}
                          % of venue capacity
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="detail-content">
                      <h4>Payment</h4>
                      <p>
                        {selectedEvent.bookingId.amountPaid >=
                        selectedEvent.bookingId.totalAmount
                          ? "Fully Paid"
                          : `${selectedEvent.bookingId.amountPaid}/${selectedEvent.bookingId.totalAmount} Paid`}
                      </p>
                      <div className="payment-progress">
                        <div
                          className="payment-progress-bar"
                          style={{
                            width: `${
                              (selectedEvent.bookingId.amountPaid /
                                selectedEvent.bookingId.totalAmount) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Description</h3>
                <p className="event-description">
                  {selectedEvent.bookingId.response.venueRequest
                    .eventDescription || "No description provided."}
                </p>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Payment Details</h3>
                <div className="payment-details">
                  {selectedEvent.bookingId.paymentDetails &&
                  selectedEvent.bookingId.paymentDetails.length > 0 ? (
                    <div className="payment-list">
                      {selectedEvent.bookingId.paymentDetails.map(
                        (payment, index) => (
                          <div key={index} className="payment-item">
                            <div className="payment-method">
                              <div
                                className={`payment-method-icon ${payment.paymentMethod.toLowerCase()}`}
                              >
                                {payment.paymentMethod === "M-Pesa" ? "M" : "P"}
                              </div>
                              <span>{payment.paymentMethod}</span>
                            </div>
                            <div className="payment-info">
                              <div className="payment-transaction">
                                <span className="transaction-label">
                                  Transaction ID:
                                </span>
                                <span className="transaction-id">
                                  {payment.transactionId}
                                </span>
                              </div>
                              <div className="payment-date">
                                <span className="date-label">Date:</span>
                                <span className="date-value">
                                  {formatDate(payment.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="payment-amount">
                              {payment.amount
                                ? `KSH ${payment.amount}`
                                : "Amount not specified"}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="no-payments">No payment details available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-action-btn secondary"
                onClick={closeEventDetail}
              >
                Close
              </button>
              <button className="modal-action-btn primary">
                {selectedEvent.status === "Upcoming"
                  ? "Edit Event"
                  : selectedEvent.status === "Ongoing"
                  ? "Manage Event"
                  : "View Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Selection Modal */}
      {isBookingModalOpen && (
        <div className="booking-modal">
          <div
            className="modal-backdrop"
            onClick={() => setIsBookingModalOpen(false)}
          ></div>
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setIsBookingModalOpen(false)}
            >
              <svg viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-header">
              <h2>Select a Booking</h2>
              <p>Choose a confirmed booking to create an event</p>
            </div>

            <div className="modal-body">
              {loadingBookings ? (
                <div className="loading-bookings">
                  <div className="loading-circle"></div>
                  <div className="loading-circle"></div>
                  <div className="loading-circle"></div>
                  <p>Loading your bookings...</p>
                </div>
              ) : completeBookings.length > 0 ? (
                <div className="bookings-list">
                  {completeBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className={`booking-item ${
                        selectedBooking && selectedBooking._id === booking._id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="booking-venue">
                        <img
                          src={
                            booking.response.venueRequest.venue &&
                            booking.response.venueRequest.venue.images
                              ? booking.response.venueRequest.venue.images[0]
                              : "/placeholder.svg?height=60&width=60"
                          }
                          alt={
                            booking.response.venueRequest.venue
                              ? booking.response.venueRequest.venue.name
                              : "Venue"
                          }
                          className="venue-thumbnail"
                          onError={(e) => {
                            e.target.src =
                              "/placeholder.svg?height=60&width=60";
                          }}
                        />
                        <div className="venue-info">
                          <h4>
                            {booking.response.venueRequest.venue
                              ? booking.response.venueRequest.venue.name
                              : "No Venue"}
                          </h4>
                          <p>{booking.response.venueRequest.eventName}</p>
                        </div>
                      </div>

                      <div className="booking-details">
                        <div className="booking-date">
                          <svg viewBox="0 0 24 24" className="date-icon">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {formatDateRange(
                              booking.response.venueRequest.eventDates
                            )}
                          </span>
                        </div>

                        <div className="booking-attendance">
                          <svg viewBox="0 0 24 24" className="attendance-icon">
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>
                            {booking.response.venueRequest.expectedAttendance.toLocaleString()}{" "}
                            attendees
                          </span>
                        </div>
                      </div>

                      <div className="booking-payment">
                        <span className="payment-label">Payment:</span>
                        <span
                          className={`payment-status ${
                            booking.amountPaid >= booking.totalAmount
                              ? "paid"
                              : "partial"
                          }`}
                        >
                          {booking.amountPaid >= booking.totalAmount
                            ? "Fully Paid"
                            : "Partially Paid"}
                        </span>
                      </div>

                      <div className="booking-select">
                        <div
                          className={`select-indicator ${
                            selectedBooking &&
                            selectedBooking._id === booking._id
                              ? "selected"
                              : ""
                          }`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-bookings">
                  <div className="no-bookings-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3>No eligible bookings found</h3>
                  <p>
                    You need confirmed bookings that haven't been assigned to
                    events yet
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-action-btn secondary"
                onClick={() => setIsBookingModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="modal-action-btn primary"
                disabled={!selectedBooking || isCreatingEvent}
                onClick={createEvent}
              >
                {isCreatingEvent ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        /* Event Dashboard Styles */
        :root {
          /* Color Palette */
          --color-primary: #6366f1;
          --color-primary-light: #818cf8;
          --color-primary-dark: #4f46e5;
          --color-secondary: #f59e0b;
          --color-secondary-light: #fbbf24;
          --color-secondary-dark: #d97706;

          --color-background: #f8f7ff;
          --color-surface: #ffffff;
          --color-surface-hover: #f9fafb;

          --color-text-primary: #1e1b4b;
          --color-text-secondary: #4b5563;
          --color-text-tertiary: #6b7280;
          --color-text-light: #9ca3af;

          --color-border: #e5e7eb;
          --color-border-light: #f3f4f6;

          --color-upcoming: #6366f1;
          --color-ongoing: #f59e0b;
          --color-completed: #10b981;
          --color-neutral: #6b7280;

          /* Shadows */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);

          /* Spacing */
          --spacing-xs: 0.25rem;
          --spacing-sm: 0.5rem;
          --spacing-md: 1rem;
          --spacing-lg: 1.5rem;
          --spacing-xl: 2rem;
          --spacing-2xl: 3rem;

          /* Border Radius */
          --radius-sm: 0.25rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-full: 9999px;

          /* Transitions */
          --transition-fast: 150ms ease;
          --transition-normal: 250ms ease;
          --transition-slow: 350ms ease;
        }

        /* Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          color: var(--color-text-primary);
          background-color: var(--color-background);
          line-height: 1.5;
        }

        /* Event Dashboard Container */
        .event-dashboard {
          min-height: 100vh;
          padding: var(--spacing-lg);
          max-width: 1440px;
          margin: 0 auto;
        }

        /* Dashboard Header */
        .dashboard-header {
          margin-bottom: var(--spacing-xl);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        @media (min-width: 768px) {
          .dashboard-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
          position: relative;
          display: inline-block;
        }

        .header-content h1::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40%;
          height: 4px;
          background: linear-gradient(
            to right,
            var(--color-primary),
            var(--color-primary-light)
          );
          border-radius: var(--radius-full);
        }

        .subtitle {
          color: var(--color-text-tertiary);
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        /* View Toggle */
        .view-toggle {
          display: flex;
          background-color: var(--color-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          overflow: hidden;
        }

        .view-toggle-btn {
          background: none;
          border: none;
          padding: var(--spacing-sm) var(--spacing-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
          transition: all var(--transition-fast);
        }

        .view-toggle-btn:hover {
          background-color: var(--color-surface-hover);
          color: var(--color-text-secondary);
        }

        .view-toggle-btn.active {
          background-color: var(--color-primary);
          color: white;
        }

        .view-icon {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        /* Search */
        .search-container {
          position: relative;
          flex-grow: 1;
          max-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 2.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          font-size: 0.875rem;
          color: var(--color-text-primary);
          transition: border-color var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .search-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          stroke: var(--color-text-tertiary);
          stroke-width: 2;
          fill: none;
        }

        /* Event Filters */
        .event-filters {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
          overflow-x: auto;
          padding-bottom: var(--spacing-sm);
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .event-filters::-webkit-scrollbar {
          display: none;
        }

        .filter-btn {
          background: none;
          border: none;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .filter-btn:hover {
          background-color: var(--color-surface-hover);
          color: var(--color-text-primary);
        }

        .filter-btn.active {
          background-color: var(--color-primary);
          color: white;
        }

        /* Event Count */
        .event-count {
          margin-bottom: var(--spacing-lg);
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        .count-highlight {
          font-weight: 600;
          color: var(--color-primary);
        }

        /* Events Grid */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-lg);
        }

        /* Event Card */
        .event-card {
          background-color: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: transform var(--transition-normal),
            box-shadow var(--transition-normal);
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .event-card.upcoming {
          border-top: 4px solid var(--color-upcoming);
        }

        .event-card.ongoing {
          border-top: 4px solid var(--color-ongoing);
        }

        .event-card.completed {
          border-top: 4px solid var(--color-completed);
        }

        .event-card-header {
          padding: var(--spacing-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .status-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .status-icon.upcoming {
          color: var(--color-upcoming);
        }

        .status-icon.ongoing {
          color: var(--color-ongoing);
        }

        .status-icon.completed {
          color: var(--color-completed);
        }

        .status-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-tertiary);
        }

        .days-counter {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: var(--color-upcoming);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
        }

        .days-number {
          font-size: 1rem;
          font-weight: 700;
          line-height: 1;
        }

        .days-label {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .event-card-image {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .event-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .event-card:hover .event-card-image img {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
        }

        .event-card-content {
          padding: var(--spacing-md);
          flex-grow: 1;
        }

        .event-name {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--color-text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 3em;
        }

        .event-venue,
        .event-date,
        .event-attendance {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .venue-icon,
        .date-icon,
        .attendance-icon {
          width: 1rem;
          height: 1rem;
          stroke: var(--color-text-tertiary);
          stroke-width: 2;
          fill: none;
          flex-shrink: 0;
        }

        .event-card-footer {
          padding: var(--spacing-md);
          border-top: 1px solid var(--color-border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-payment {
          display: flex;
          flex-direction: column;
        }

        .payment-label {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        .payment-status {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .payment-status.paid {
          color: var(--color-completed);
        }

        .payment-status.partial {
          color: var(--color-ongoing);
        }

        .view-details-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-primary);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .view-details-btn:hover {
          color: var(--color-primary-dark);
        }

        .details-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        /* No Events */
        .no-events {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-2xl);
          background-color: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          text-align: center;
        }

        .no-events-icon {
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-border-light);
          border-radius: var(--radius-full);
          margin-bottom: var(--spacing-md);
        }

        .no-events-icon svg {
          width: 2rem;
          height: 2rem;
          stroke: var(--color-text-tertiary);
          stroke-width: 2;
          fill: none;
        }

        .no-events h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--color-text-primary);
        }

        .no-events p {
          color: var(--color-text-tertiary);
        }

        /* Timeline View */
        .events-timeline-container {
          background-color: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          margin-bottom: var(--spacing-lg);
        }

        .timeline-controls {
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
        }

        .timeline-control-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .timeline-control-btn:hover {
          background-color: var(--color-surface-hover);
          border-color: var(--color-text-tertiary);
        }

        .control-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .events-timeline {
          position: relative;
          overflow-x: auto;
          padding: var(--spacing-lg) var(--spacing-md);
          min-height: 300px;
        }

        .timeline-hours {
          display: flex;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--spacing-md);
        }

        .timeline-hour {
          flex: 1 0 100px;
          position: relative;
        }

        .timeline-hour::after {
          content: "";
          position: absolute;
          top: 20px;
          bottom: -8px;
          width: 1px;
          background-color: var(--color-border);
          right: 0;
        }

        .hour-label {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          position: absolute;
          top: 0;
          right: 0;
          transform: translateX(50%);
        }

        .timeline-now-indicator {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          z-index: 10;
        }

        .now-indicator-line {
          position: absolute;
          top: var(--spacing-lg);
          bottom: 0;
          width: 2px;
          background-color: var(--color-primary);
        }

        .now-indicator-label {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--color-primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }

        .timeline-events {
          position: relative;
          padding-top: var(--spacing-lg);
          min-height: 150px;
        }

        .timeline-event {
          position: absolute;
          top: var(--spacing-lg);
          height: 80px;
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
          cursor: pointer;
          transition: transform var(--transition-fast),
            box-shadow var(--transition-fast);
          overflow: hidden;
        }

        .timeline-event:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          z-index: 5;
        }

        .timeline-event.upcoming {
          background-color: rgba(99, 102, 241, 0.1);
          border-left: 3px solid var(--color-upcoming);
        }

        .timeline-event.ongoing {
          background-color: rgba(245, 158, 11, 0.1);
          border-left: 3px solid var(--color-ongoing);
        }

        .timeline-event.completed {
          background-color: rgba(16, 185, 129, 0.1);
          border-left: 3px solid var(--color-completed);
        }

        .timeline-event-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .timeline-event-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-event-details {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        .timeline-venue,
        .timeline-date {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-no-events {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: none;
          box-shadow: none;
        }

        /* Calendar View */
        .events-calendar {
          background-color: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          padding: var(--spacing-lg);
        }

        .calendar-header {
          margin-bottom: var(--spacing-lg);
        }

        .calendar-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }

        .calendar-header p {
          color: var(--color-text-tertiary);
          font-size: 0.875rem;
        }

        .calendar-grid {
          display: flex;
          flex-direction: column;
        }

        .calendar-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: var(--spacing-sm);
        }

        .calendar-day-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          padding: var(--spacing-sm);
        }

        .calendar-cells {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(5, 1fr);
          gap: var(--spacing-xs);
          height: 500px;
        }

        .calendar-cell {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: var(--spacing-xs);
          position: relative;
          min-height: 80px;
        }

        .calendar-cell.today {
          background-color: rgba(99, 102, 241, 0.05);
          border-color: var(--color-primary-light);
        }

        .calendar-date {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .today .calendar-date {
          color: var(--color-primary);
          font-weight: 600;
        }

        .calendar-event {
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          margin-bottom: var(--spacing-xs);
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .calendar-event.upcoming {
          background-color: rgba(99, 102, 241, 0.1);
          color: var(--color-upcoming);
        }

        .calendar-event.ongoing {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--color-ongoing);
        }

        .calendar-event.completed {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--color-completed);
        }

        /* Event Detail Modal */
        .event-detail-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          opacity: 0;
          visibility: hidden;
          transition: opacity var(--transition-normal),
            visibility var(--transition-normal);
        }

        .event-detail-modal.open {
          opacity: 1;
          visibility: visible;
        }

        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background-color: var(--color-surface);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          transform: translateY(20px);
          opacity: 0;
          transition: transform var(--transition-normal),
            opacity var(--transition-normal);
        }

        .event-detail-modal.open .modal-content {
          transform: translateY(0);
          opacity: 1;
        }

        .modal-close-btn {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background: none;
          border: none;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background-color var(--transition-fast),
            color var(--transition-fast);
          z-index: 10;
        }

        .modal-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--color-text-primary);
        }

        .modal-close-btn svg {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .modal-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border);
          position: relative;
        }

        .modal-status-badge {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          margin-bottom: var(--spacing-sm);
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .modal-image {
          width: 100%;
          height: 240px;
          overflow: hidden;
        }

        .modal-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-body {
          padding: var(--spacing-lg);
        }

        .detail-section {
          margin-bottom: var(--spacing-xl);
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          color: var(--color-text-primary);
          position: relative;
          display: inline-block;
        }

        .section-title::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 40%;
          height: 2px;
          background-color: var(--color-primary-light);
          border-radius: var(--radius-full);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: var(--spacing-md);
        }

        @media (min-width: 640px) {
          .detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .detail-item {
          display: flex;
          gap: var(--spacing-md);
        }

        .detail-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-primary-light);
          color: white;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .detail-icon svg {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .detail-content {
          flex-grow: 1;
        }

        .detail-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .detail-content p {
          font-size: 1rem;
          color: var(--color-text-primary);
        }

        .detail-meta {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          margin-top: var(--spacing-xs);
        }

        .event-description {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .payment-progress {
          height: 0.5rem;
          background-color: var(--color-border-light);
          border-radius: var(--radius-full);
          margin-top: var(--spacing-xs);
          overflow: hidden;
        }

        .payment-progress-bar {
          height: 100%;
          background-color: var(--color-completed);
          border-radius: var(--radius-full);
        }

        .payment-details {
          background-color: var(--color-surface-hover);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }

        .payment-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .payment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md);
          background-color: var(--color-surface);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: 500;
        }

        .payment-method-icon {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          color: white;
          font-weight: 700;
        }

        .payment-method-icon.m-pesa {
          background-color: var(--color-completed);
        }

        .payment-method-icon.paypal {
          background-color: var(--color-primary);
        }

        .payment-info {
          flex-grow: 1;
          padding: 0 var(--spacing-md);
        }

        .payment-transaction,
        .payment-date {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        .transaction-label,
        .date-label {
          margin-right: var(--spacing-xs);
        }

        .transaction-id,
        .date-value {
          color: var(--color-text-secondary);
        }

        .payment-amount {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .no-payments {
          text-align: center;
          padding: var(--spacing-md);
          color: var(--color-text-tertiary);
          font-style: italic;
        }

        .modal-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
        }

        .modal-action-btn {
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .modal-action-btn.secondary {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
        }

        .modal-action-btn.secondary:hover {
          background-color: var(--color-surface-hover);
          border-color: var(--color-text-tertiary);
        }

        .modal-action-btn.primary {
          background-color: var(--color-primary);
          border: none;
          color: white;
        }

        .modal-action-btn.primary:hover {
          background-color: var(--color-primary-dark);
        }

        /* Loading State */
        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .loading-circle {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: var(--radius-full);
          background-color: var(--color-primary);
          animation: pulse 1.5s infinite ease-in-out;
        }

        .loading-circle:nth-child(2) {
          animation-delay: 0.2s;
          background-color: var(--color-secondary);
        }

        .loading-circle:nth-child(3) {
          animation-delay: 0.4s;
          background-color: var(--color-completed);
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .loading-container p {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        /* Error State */
        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .error-container {
          max-width: 400px;
          padding: var(--spacing-xl);
          background-color: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          text-align: center;
        }

        .error-icon {
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fee2e2;
          color: #ef4444;
          border-radius: var(--radius-full);
          font-size: 2rem;
          font-weight: 700;
          margin: 0 auto var(--spacing-lg);
        }

        .error-container h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--color-text-primary);
        }

        .error-container p {
          color: var(--color-text-tertiary);
          margin-bottom: var(--spacing-lg);
        }

        .error-container button {
          padding: var(--spacing-sm) var(--spacing-lg);
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .error-container button:hover {
          background-color: var(--color-primary-dark);
        }

        /* Add these styles at the end of the file */

        /* Create Event Button */
        .create-event-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-right: 16px;
        }

        .create-event-btn:hover {
          background-color: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .create-event-btn:active {
          transform: translateY(0);
        }

        .create-icon {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        /* Booking Modal */
        .booking-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .booking-modal .modal-content {
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: modalFadeIn 0.3s ease forwards;
          position: relative;
          z-index: 1001;
        }

        .booking-modal .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
        }

        .booking-modal .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .booking-modal .modal-header p {
          margin: 8px 0 0;
          color: #666;
          font-size: 0.9rem;
        }

        .booking-modal .modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          flex: 1;
        }

        .booking-modal .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .booking-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #eee;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
        }

        .booking-item:hover {
          border-color: var(--color-primary-light);
          background-color: rgba(var(--color-primary-rgb), 0.05);
        }

        .booking-item.selected {
          border-color: var(--color-primary);
          background-color: rgba(var(--color-primary-rgb), 0.1);
        }

        .venue-thumbnail {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }

        .venue-info {
          margin-left: 12px;
        }

        .venue-info h4 {
          margin: 0;
          font-size: 1rem;
          color: #333;
        }

        .venue-info p {
          margin: 4px 0 0;
          color: #666;
          font-size: 0.9rem;
        }

        .booking-venue {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0 16px;
          flex: 1;
        }

        .booking-date,
        .booking-attendance {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 0.85rem;
        }

        .date-icon,
        .attendance-icon {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .booking-payment {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          margin-right: 16px;
        }

        .payment-label {
          font-size: 0.8rem;
          color: #888;
        }

        .payment-status {
          font-size: 0.9rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .payment-status.paid {
          background-color: rgba(0, 200, 83, 0.1);
          color: #00c853;
        }

        .payment-status.partial {
          background-color: rgba(255, 152, 0, 0.1);
          color: #ff9800;
        }

        .booking-select {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .select-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #ddd;
          transition: all 0.2s ease;
        }

        .select-indicator.selected {
          border-color: var(--color-primary);
          background-color: var(--color-primary);
          position: relative;
        }

        .select-indicator.selected::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 6px;
          height: 10px;
          border-right: 2px solid white;
          border-bottom: 2px solid white;
        }

        .no-bookings {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          text-align: center;
        }

        .no-bookings-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .no-bookings-icon svg {
          width: 32px;
          height: 32px;
          stroke: #888;
          stroke-width: 2;
          fill: none;
        }

        .no-bookings h3 {
          margin: 0 0 8px;
          color: #333;
        }

        .no-bookings p {
          margin: 0;
          color: #666;
        }

        .modal-action-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .modal-action-btn.primary {
          background-color: var(--color-primary);
          color: white;
        }

        .modal-action-btn.primary:hover {
          background-color: var(--color-primary-dark);
        }

        .modal-action-btn.primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .modal-action-btn.secondary {
          background-color: #f5f5f5;
          color: #333;
        }

        .modal-action-btn.secondary:hover {
          background-color: #eee;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Events;
