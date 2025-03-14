import React from "react";
import { Calendar, MapPin, Ticket, Users, CreditCard } from "lucide-react";
function Features() {
  return (
    <section className="features">
      <div className="features-container">
        <div className="section-header">
          <h2>One Platform, Two Experiences</h2>
          <p>
            Whether you're looking to attend events or create them, EventEase
            has you covered
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-column attendees">
            <div className="column-header">
              <h3>For Attendees</h3>
              <p>Discover and attend events that match your interests</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Ticket size={32} />
              </div>
              <h4>Easy Ticket Purchasing</h4>
              <p>
                Secure your spot with just a few clicks and get instant
                confirmation
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MapPin size={32} />
              </div>
              <h4>Location-Based Discovery</h4>
              <p>
                Find events happening near you or plan your trip to events
                anywhere
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Calendar size={32} />
              </div>
              <h4>Personalized Recommendations</h4>
              <p>
                Get event suggestions based on your preferences and past
                attendance
              </p>
            </div>
          </div>

          <div className="feature-column organizers">
            <div className="column-header">
              <h3>For Organizers</h3>
              <p>Create and manage successful events with powerful tools</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MapPin size={32} />
              </div>
              <h4>Venue Booking</h4>
              <p>
                Browse and secure the perfect venue for your event directly on
                our platform
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h4>Attendee Management</h4>
              <p>
                Track registrations, communicate with attendees, and manage
                check-ins
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <CreditCard size={32} />
              </div>
              <h4>Seamless Payments</h4>
              <p>
                Accept payments and manage your event finances all in one place
              </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .features {
          padding: 5rem 2rem;
          background-color: #ffffff;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #666;
          max-width: 700px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .feature-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feature-column.attendees {
          border-right: 1px solid #eaeaea;
          padding-right: 1.5rem;
        }

        .feature-column.organizers {
          padding-left: 1.5rem;
        }

        .column-header {
          margin-bottom: 1rem;
        }

        .column-header h3 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .column-header p {
          color: #666;
        }

        .feature-card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1.5rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }

        .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: rgba(93, 63, 211, 0.1);
          border-radius: 50%;
          margin-bottom: 1rem;
          color: #5d3fd3;
        }

        .feature-card h4 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .feature-card p {
          color: #666;
          line-height: 1.6;
        }

        .attendees .feature-icon {
          background: rgba(93, 63, 211, 0.1);
          color: #5d3fd3;
        }

        .organizers .feature-icon {
          background: rgba(255, 124, 0, 0.1);
          color: #ff7c00;
        }

        @media (max-width: 992px) {
          .features-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .feature-column.attendees {
            border-right: none;
            border-bottom: 1px solid #eaeaea;
            padding-right: 0;
            padding-bottom: 3rem;
          }

          .feature-column.organizers {
            padding-left: 0;
            padding-top: 1rem;
          }
        }

        @media (max-width: 576px) {
          .features {
            padding: 4rem 1rem;
          }

          .section-header h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}

export default Features;
