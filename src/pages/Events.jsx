import React from "react";
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import EventGrid from "../components/EventGrid";
import Footer from "../components/Footer";

function Events() {
  return (
    <main>
        <Header />
        <SearchSection />
        <div className="container">
            <EventGrid />
        </div>
        <Footer />
      <style jsx>{`
        :root {
          --primary: #6c5ce7;
          --text-primary: #1a1a1a;
          --text-secondary: #666;
          --background: #fff;
          --gray-100: #f8f9fa;
          --gray-200: #e9ecef;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          line-height: 1.5;
          color: var(--text-primary);
          background-color: var(--gray-100);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Header */
        .header {
          background: white;
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: bold;
          font-size: 1.25rem;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: var(--text-secondary);
        }

        .sign-in {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
        }

        /* Search Section */
        .search-section {
          padding: 3rem 0;
          text-align: center;
          background: white;
        }

        .search-title {
          font-size: 2.5rem;
          margin-bottom: 2rem;
        }

        .search-bar {
          max-width: 600px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 1rem;
          padding-left: 2.5rem;
          border: 1px solid var(--gray-200);
          border-radius: 50px;
          font-size: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .filters {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--gray-200);
          border-radius: 4px;
          min-width: 200px;
          background: white;
        }

        .location-button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Event Cards */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
        }

        .event-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .event-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .event-content {
          padding: 1.5rem;
        }

        .event-date {
          color: var(--primary);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .event-title {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .event-price {
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .event-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .book-button {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 4px;
          cursor: pointer;
        }

        
        /* Footer */
        .footer {
          background: #1a1a1a;
          color: white;
          padding: 4rem 0 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-links h4 {
          margin-bottom: 1rem;
        }

        .footer-links a {
          color: #999;
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #333;
          color: #999;
        }

        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .nav-links {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

export default Events;
