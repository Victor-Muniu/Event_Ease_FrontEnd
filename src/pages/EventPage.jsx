"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3002/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        const now = new Date();
        const upcomingEvents = data.filter((event) => {
          // Check if the event has a status property directly
          if (event.status === "Upcoming") {
            return true;
          }

          // Also check the bookingId.status as a fallback
          if (event.bookingId && event.bookingId.status === "Upcoming") {
            return true;
          }

          return false;
        });

        setEvents(upcomingEvents);
        setFilteredEvents(upcomingEvents);

        const uniqueVenues = [
          ...new Set(
            upcomingEvents
              .filter(
                (event) => event.bookingId?.response?.venueRequest?.venue?.name
              )
              .map((event) => event.bookingId.response.venueRequest.venue.name)
          ),
        ];
        setVenues(uniqueVenues);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (venueFilter !== "all") {
      filtered = filtered.filter(
        (event) =>
          event.bookingId?.response?.venueRequest?.venue?.name === venueFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((event) => {
        const eventName =
          event.bookingId?.response?.venueRequest?.eventName?.toLowerCase() ||
          "";
        const eventDesc =
          event.bookingId?.response?.venueRequest?.eventDescription?.toLowerCase() ||
          "";
        const venueName =
          event.bookingId?.response?.venueRequest?.venue?.name?.toLowerCase() ||
          "";
        const venueLocation =
          event.bookingId?.response?.venueRequest?.venue?.location?.toLowerCase() ||
          "";

        return (
          eventName.includes(term) ||
          eventDesc.includes(term) ||
          venueName.includes(term) ||
          venueLocation.includes(term)
        );
      });
    }

    setFilteredEvents(filtered);
  }, [searchTerm, venueFilter, events]);

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="event-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Discover Amazing Events</h1>
            <p>Find and attend the best events in your area</p>

            <div className="search-container">
              <input
                type="text"
                placeholder="Search events by name, description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
              >
                <option value="all">All Venues</option>
                {venues.map((venue) => (
                  <option key={venue} value={venue}>
                    {venue}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="events-container">
          <h2>Upcoming Events</h2>

          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <h3>No events found</h3>
              <p>
                Try adjusting your search or check back later for new events.
              </p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => {
                const venueRequest = event.bookingId?.response?.venueRequest;
                if (!venueRequest) return null; // Skip events without venue request

                const venue = venueRequest.venue;
                const eventDates = venueRequest.eventDates;
                if (!eventDates || eventDates.length === 0) return null; // Skip events without dates

                const firstDate = new Date(eventDates[0]);
                const lastDate = new Date(eventDates[eventDates.length - 1]);
                const isMultiDay = eventDates.length > 1;

                return (
                  <div className="event-card" key={event._id}>
                    <div className="event-image">
                      {venue && venue.images && venue.images.length > 0 ? (
                        <img
                          src={venue.images[0] || "/placeholder.svg"}
                          alt={venueRequest.eventName}
                        />
                      ) : (
                        <img
                          src="https://cdn.pixabay.com/photo/2015/11/22/19/04/crowd-1056764_1280.jpg"
                          alt="Default Event"
                        />
                      )}
                      <div className="date-badge">
                        <span className="month">
                          {firstDate.toLocaleString("default", {
                            month: "short",
                          })}
                        </span>
                        <span className="day">{firstDate.getDate()}</span>
                      </div>
                    </div>

                    <div className="event-content">
                      <h3>{venueRequest.eventName}</h3>

                      <div className="event-details">
                        <div className="detail">
                          <i className="icon-calendar">📅</i>
                          <span>
                            {isMultiDay
                              ? `${formatDate(firstDate)} - ${formatDate(
                                  lastDate
                                )}`
                              : formatDate(firstDate)}
                          </span>
                        </div>

                        {venue && (
                          <div className="detail">
                            <i className="icon-location">📍</i>
                            <span>
                              {venue.name}, {venue.location}
                            </span>
                          </div>
                        )}

                        <div className="detail">
                          <i className="icon-people">👥</i>
                          <span>
                            {venueRequest.expectedAttendance} Attendees
                          </span>
                        </div>

                        <div className="detail">
                          <i className="icon-time">⏱️</i>
                          <span>
                            {eventDates.length}{" "}
                            {eventDates.length === 1 ? "Day" : "Days"}
                          </span>
                        </div>
                      </div>

                      <p className="event-description">
                        {venueRequest.eventDescription}
                      </p>

                      <div className="event-footer">
                        <div className="organizer">
                          <span>
                            By{" "}
                            {event.bookingId?.organizer?.organizationName ||
                              "Unknown Organizer"}
                          </span>
                        </div>
                        <button className="register-button">
                          Register Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <style jsx>{`
        /* Base styles and reset */
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
          border-top-color: #3498db;
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
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .error-container button:hover {
          background-color: #2980b9;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("https://cdn.pixabay.com/photo/2016/11/22/19/15/audience-1850119_1280.jpg");
          background-size: cover;
          background-position: center;
          opacity: 0.2;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .hero-section p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .search-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .search-container input,
        .search-container select {
          padding: 0.8rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          flex: 1;
          min-width: 200px;
        }

        .search-container input {
          flex: 3;
        }

        .search-container select {
          flex: 1;
          background-color: white;
          cursor: pointer;
        }

        /* Events Section */
        .events-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }

        .events-container h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
          color: #333;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .events-container h2::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #6a11cb, #2575fc);
        }

        .no-events {
          text-align: center;
          padding: 3rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .no-events h3 {
          margin-bottom: 1rem;
          color: #555;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        /* Event Card */
        .event-card {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

        .event-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .event-card:hover .event-image img {
          transform: scale(1.05);
        }

        .date-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: rgba(255, 255, 255, 0.9);
          color: #333;
          padding: 0.5rem;
          border-radius: 4px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          min-width: 60px;
        }

        .date-badge .month {
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: bold;
          color: #e74c3c;
        }

        .date-badge .day {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .event-content {
          padding: 1.5rem;
        }

        .event-content h3 {
          margin-bottom: 1rem;
          font-size: 1.4rem;
          color: #2c3e50;
        }

        .event-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: #555;
        }

        .detail i {
          margin-right: 0.5rem;
          font-size: 1.1rem;
        }

        .event-description {
          margin-bottom: 1.5rem;
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }

        .organizer {
          font-size: 0.9rem;
          color: #777;
        }

        .register-button {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.3s, transform 0.2s;
        }

        .register-button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-section {
            padding: 3rem 1rem;
          }

          .hero-section h1 {
            font-size: 2rem;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .event-details {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .search-container input,
          .search-container select {
            width: 100%;
          }

          .event-footer {
            flex-direction: column;
            gap: 1rem;
          }

          .register-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EventPage;
