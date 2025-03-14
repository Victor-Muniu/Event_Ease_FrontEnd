import { formatDate, formatCurrency } from "../utils/Formatters"

export default function ResponseCard({ response, onBookNow }) {
  const venue = response.venueRequest?.venue;
  const eventName = response.venueRequest?.eventName;
  const eventDates = response.venueRequest?.eventDates || [];
  const totalAmount = response.totalAmount;

  return (
    <div className="response-card">
      <div className="card-header">
        <h3>{eventName || "Unnamed Event"}</h3>
        <div className="venue-badge">{venue ? venue.name : "No Venue"}</div>
      </div>

      <div className="card-content">
        <div className="venue-details">
          <div className="venue-icon">🏢</div>
          <div className="venue-info">
            <p className="venue-name">{venue ? venue.name : "No Venue"}</p>
            <p className="venue-location">
              {venue ? venue.location : "No Location"}
            </p>
          </div>
        </div>

        <div className="dates-section">
          <h4>Event Dates</h4>
          <div className="dates-list">
            {eventDates.map((date, index) => (
              <div key={index} className="date-item">
                <div className="date-icon">📅</div>
                <div className="date-info">
                  <p className="date-value">{formatDate(date)}</p>
                  <p className="date-day">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pricing-section">
          <div className="daily-rates">
            <h4>Daily Rates</h4>
            <div className="rates-list">
              {response.dailyRates.map((rate, index) => (
                <div key={index} className="rate-item">
                  <p className="rate-date">{formatDate(rate.date)}</p>
                  <p className="rate-price">{formatCurrency(rate.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="total-amount">
            <p className="total-label">Total Amount</p>
            <p className="total-value">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button className="book-button" onClick={onBookNow}>
          Book Now
        </button>
      </div>
      <style jsx>{`
        .response-card {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid #f0f0f0;
        }

        .response-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f0f0f0;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
        }

        .venue-badge {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .card-content {
          padding: 1.5rem;
        }

        .venue-details {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .venue-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
        }

        .venue-name {
          font-weight: 600;
          color: #2d3748;
        }

        .venue-location {
          font-size: 0.875rem;
          color: #718096;
        }

        .dates-section {
          margin-bottom: 1.5rem;
        }

        .dates-section h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.75rem;
        }

        .dates-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .date-item {
          display: flex;
          align-items: center;
          background-color: #f7fafc;
          padding: 0.75rem;
          border-radius: 0.5rem;
        }

        .date-icon {
          margin-right: 0.75rem;
        }

        .date-value {
          font-weight: 500;
          color: #2d3748;
        }

        .date-day {
          font-size: 0.75rem;
          color: #718096;
        }

        .pricing-section {
          background-color: #f7fafc;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .daily-rates h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.75rem;
        }

        .rates-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .rate-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .rate-date {
          color: #4a5568;
        }

        .rate-price {
          font-weight: 600;
          color: #2d3748;
        }

        .total-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px dashed #cbd5e0;
        }

        .total-label {
          font-weight: 600;
          color: #2d3748;
        }

        .total-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #6366f1;
        }

        .card-actions {
          padding: 1.5rem;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: flex-end;
        }

        .book-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .book-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
