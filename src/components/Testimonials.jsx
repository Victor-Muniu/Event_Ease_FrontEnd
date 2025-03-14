import React from "react";

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Join thousands of satisfied attendees and organizers</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "EventEase made finding local concerts so easy! I discovered
                amazing artists I wouldn't have known about otherwise."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Sarah J."
                  width={60}
                  height={60}
                  className="avatar"
                />
              </div>
              <div className="author-info">
                <h4>Sarah J.</h4>
                <p>Music Enthusiast</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "As an event organizer, I've increased my ticket sales by 40%
                since using EventEase. The venue booking feature saved me so
                much time!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Michael T."
                  width={60}
                  height={60}
                  className="avatar"
                />
              </div>
              <div className="author-info">
                <h4>Michael T.</h4>
                <p>Conference Organizer</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "I love how easy it is to filter events based on my interests.
                The personalized recommendations are spot on!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Priya K."
                  width={60}
                  height={60}
                  className="avatar"
                />
              </div>
              <div className="author-info">
                <h4>Priya K.</h4>
                <p>Regular Attendee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .testimonials {
          padding: 5rem 2rem;
          background-color: #ffffff;
        }

        .testimonials-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 3rem;
        }

        .testimonial-card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
        }

        .testimonial-content {
          margin-bottom: 1.5rem;
        }

        .testimonial-content p {
          font-size: 1rem;
          line-height: 1.6;
          color: #555;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar .avatar {
          border-radius: 50%;
          object-fit: cover;
        }

        .author-info h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #333;
        }

        .author-info p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        @media (max-width: 992px) {
          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
