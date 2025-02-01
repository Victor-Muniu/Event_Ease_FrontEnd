import { useEffect, useState } from "react";
import { MapPin, Users } from "lucide-react";
import LocationMap from "../components/LocationMap";
import { BookingRequestModal } from "../components/BookingRequestModal";
export default function Venue() {
  const [venues, setVenues] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null)
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("http://localhost:3002/event-grounds");
        const data = await response.json();
        setVenues(data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenues();
  }, []);

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo">
              EventGrounds
            </a>
          </div>
        </div>
      </header>

      <main className="main-content container">
        <h1 className="page-title">Available Event Venues</h1>
        <p className="page-description">
          Find the perfect location for your next event. Request a venue or
          manage your bookings.
        </p>

        <div className="filters">
          <select className="filter-select">
            <option value="">Location</option>
          </select>
          <select className="filter-select">
            <option value="">Event Type</option>
          </select>
          <select className="filter-select">
            <option value="">Capacity</option>
          </select>
          <select className="filter-select">
            <option value="">Price Range</option>
          </select>
          <input type="date" className="filter-select" />
          <button className="filter-select">More Filters</button>
        </div>

        <div className="venues-grid">
          {venues.map((venue) => (
            <div key={venue._id} className="venue-card">
              <div className="venue-image">
                <img
                  src={venue.images[0]}
                  width="400"
                  height="210"
                  alt={venue.name}
                />
                
              </div>
              <div className="venue-content">
                <h2 className="venue-name">{venue.name}</h2>
                <div className="venue-details">
                  <p>
                    <MapPin size={16} />
                    Location coordinates:{" "}
                    {venue.location.coordinates.join(", ")}
                  </p>
                  <button
                    className="view-location-button"
                    onClick={() =>
                      setSelectedLocation(venue.location.coordinates)
                    }
                  >
                    View Precise Location
                  </button>
                  <p>
                    <Users size={16} /> Up to {venue.capacity} guests
                  </p>
                  <p>KES {venue.pricePerDay.toLocaleString()} per day</p>
                </div>
                <div className="venue-amenities">
                  {venue.amenities.map((amenity, index) => (
                    <span key={index} className="amenity">
                      {amenity}
                    </span>
                  ))}
                </div>
                <button className="request-button" onClick={() => setSelectedVenue(venue)}>Request This Venue</button>
              </div>
            </div>
          ))}
        </div>

        <section>
          <h2 className="page-title">My Bookings</h2>
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tech Conference 2025</td>
                <td>Grand Plaza Events</td>
                <td>Mar 15, 2025</td>
                <td>
                  <span className="status-badge status-confirmed">
                    Confirmed
                  </span>
                </td>
                <td>View • Cancel</td>
              </tr>
              <tr>
                <td>Wedding Reception</td>
                <td>Royal Ballroom</td>
                <td>Apr 22, 2025</td>
                <td>
                  <span className="status-badge status-pending">Pending</span>
                </td>
                <td>View • Cancel</td>
              </tr>
            </tbody>
          </table>
        </section>
        {selectedLocation && <LocationMap coordinates={selectedLocation} onClose={() => setSelectedLocation(null)} />}
        {selectedVenue && (
          <BookingRequestModal
            venueName={selectedVenue.name}
            capacity={selectedVenue.capacity}
            onClose={() => setSelectedVenue(null)}
          />
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>EventGrounds</h3>
              <p>Find the perfect venue for your next event.</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <div className="footer-links">
                <a href="/about" className="footer-link">
                  About Us
                </a>
                <a href="/contact" className="footer-link">
                  Contact
                </a>
                <a href="/faq" className="footer-link">
                  FAQ
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h3>Legal</h3>
              <div className="footer-links">
                <a href="/terms" className="footer-link">
                  Terms of Service
                </a>
                <a href="/privacy" className="footer-link">
                  Privacy Policy
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h3>Follow Us</h3>
              <div className="footer-links">
                <a href="#" className="footer-link">
                  Facebook
                </a>
                <a href="#" className="footer-link">
                  Twitter
                </a>
                <a href="#" className="footer-link">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <style jsx>{`
        :root {
          --primary: #00a389;
          --secondary: #f8f9fa;
          --text-primary: #1a202c;
          --text-secondary: #4a5568;
          --border-color: #e2e8f0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
        }

        .create-booking {
          background-color: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
        }

        .main-content {
          padding: 2rem 0;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .page-description {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          min-width: 150px;
        }

        .venues-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .venue-card {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
        }

        .venue-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          position: relative;
        }

        .availability-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
          background-color: #10b981;
          color: white;
        }

        .venue-content {
          padding: 1rem;
        }

        .venue-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .venue-details {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .venue-amenities {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .amenity {
          background-color: var(--secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .request-button {
          width: 100%;
          padding: 0.75rem;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .request-button:hover {
          opacity: 0.9;
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 2rem;
        }

        .bookings-table th,
        .bookings-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
        }

        .status-confirmed {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }

        .footer {
          border-top: 1px solid var(--border-color);
          padding: 2rem 0;
          margin-top: 3rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .footer-section h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
        }
         .view-location-button {
          background-color: transparent;
          color: var(--primary);
          border: 1px solid var(--primary);
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          margin: 0.5rem 0;
          transition: all 0.2s ease;
        }

        .view-location-button:hover {
          background-color: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}
