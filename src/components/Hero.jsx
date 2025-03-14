import React from "react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1>Discover & Create Unforgettable Events</h1>
          <p>
            Your all-in-one platform for finding amazing events or hosting your
            own with ease.
          </p>

          <div className="hero-cta">
            <a href="/signup?type=attendee" className="cta-button attendee">
              Find Events
            </a>
            <a href="/login" className="cta-button organizer">
              Create Events
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Events</span>
            </div>
            <div className="stat">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Organizers</span>
            </div>
            <div className="stat">
              <span className="stat-number">1M+</span>
              <span className="stat-label">Attendees</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://cdn.pixabay.com/photo/2016/12/28/20/30/wedding-1937022_1280.jpg?height=500&width=600"
            alt="Event Ease Platform Preview"
            width={600}
            height={500}
          />
        </div>
      </div>

      <div className="hero-search">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for events, concerts, workshops..."
          />
          <button className="search-button">Search</button>
        </div>
      </div>
      <style jsx>{`
        .hero {
          position: relative;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          overflow: hidden;
        }

        .hero-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          gap: 2rem;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .hero-content p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .cta-button {
          padding: 0.875rem 1.5rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button.attendee {
          background: #5d3fd3;
          color: white;
        }

        .cta-button.attendee:hover {
          background: #4c33b0;
        }

        .cta-button.organizer {
          background: white;
          color: #5d3fd3;
          border: 2px solid #5d3fd3;
        }

        .cta-button.organizer:hover {
          background: rgba(93, 63, 211, 0.1);
        }

        .hero-stats {
          display: flex;
          gap: 2.5rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: #5d3fd3;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
        }

        .hero-image {
          flex: 1;
          display: flex;
          justify-content: flex-end;
        }

        .hero-search {
          max-width: 1200px;
          margin: 3rem auto 0;
        }

        .search-container {
          display: flex;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
        }

        .search-container input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          font-size: 1rem;
          outline: none;
        }

        .search-button {
          padding: 1rem 2rem;
          background: #5d3fd3;
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .search-button:hover {
          background: #4c33b0;
        }

        @media (max-width: 992px) {
          .hero-container {
            flex-direction: column;
            text-align: center;
          }

          .hero-content {
            max-width: 100%;
          }

          .hero-cta {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-image {
            justify-content: center;
            margin-top: 2rem;
          }
        }

        @media (max-width: 576px) {
          .hero {
            padding: 3rem 1rem;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-cta {
            flex-direction: column;
          }

          .hero-stats {
            flex-wrap: wrap;
            gap: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
