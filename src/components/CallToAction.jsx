import React from "react";
import { Link } from "react-router-dom";
function CallToAction() {
  return (
    <section className="cta">
      <div className="cta-container">
        <div className="cta-content">
          <h2>Ready to Get Started with EventEase?</h2>
          <p>Join our community of event lovers and creators today</p>

          <div className="cta-options">
            <div className="cta-option">
              <h3>I want to attend events</h3>
              <p>
                Discover events that match your interests and purchase tickets
                seamlessly
              </p>
              <Link
                href="/signup?type=attendee"
                className="cta-button attendee"
              >
                Sign Up as Attendee
              </Link>
            </div>

            <div className="cta-option">
              <h3>I want to organize events</h3>
              <p>
                Create, promote, and manage your events with our powerful tools
              </p>
              <Link
                href="/login"
                className="cta-button organizer"
              >
                Sign Up as Organizer
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .cta {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #5d3fd3 0%, #8b76e5 100%);
          color: white;
        }

        .cta-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .cta-content {
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-content > p {
          font-size: 1.1rem;
          max-width: 700px;
          margin: 0 auto 3rem;
          opacity: 0.9;
        }

        .cta-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .cta-option {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 2rem;
          backdrop-filter: blur(5px);
          transition: transform 0.3s ease;
        }

        .cta-option:hover {
          transform: translateY(-5px);
        }

        .cta-option h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .cta-option p {
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .cta-option .cta-button {
          display: inline-block;
          padding: 0.875rem 1.5rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-option .cta-button.attendee {
          background: white;
          color: #5d3fd3;
        }

        .cta-option .cta-button.attendee:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .cta-option .cta-button.organizer {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .cta-option .cta-button.organizer:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .cta-options {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .cta {
            padding: 4rem 1rem;
          }

          .cta-content h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}

export default CallToAction;
