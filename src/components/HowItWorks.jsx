import React, { useState } from "react";


export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("attendees");

  return (
    <section className="how-it-works">
      <div className="how-it-works-container">
        <div className="section-header">
          <h2>How EventEase Works</h2>
          <p>
            Simple steps to get started whether you're attending or organizing
          </p>
        </div>

        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-button ${
                activeTab === "attendees" ? "active" : ""
              }`}
              onClick={() => setActiveTab("attendees")}
            >
              For Attendees
            </button>
            <button
              className={`tab-button ${
                activeTab === "organizers" ? "active" : ""
              }`}
              onClick={() => setActiveTab("organizers")}
            >
              For Organizers
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === "attendees" && (
              <div className="tab-panel active">
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Create Your Account</h4>
                      <p>
                        Sign up as an attendee to access personalized event
                        recommendations
                      </p>
                    </div>
                  </div>

                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Discover Events</h4>
                      <p>
                        Search for events by category, location, or date that
                        match your interests
                      </p>
                    </div>
                  </div>

                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Purchase Tickets</h4>
                      <p>
                        Secure your spot with our easy checkout process and
                        payment options
                      </p>
                    </div>
                  </div>

                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Attend & Enjoy</h4>
                      <p>
                        Get your digital tickets and event reminders before the
                        big day
                      </p>
                    </div>
                  </div>
                </div>
                <div className="step-image">
                  <img
                    src="/placeholder.svg?height=400&width=500"
                    alt="Attendee experience"
                    width={500}
                    height={400}
                  />
                </div>
              </div>
            )}

            {activeTab === "organizers" && (
              <div className="tab-panel active">
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Register as an Organizer</h4>
                      <p>
                        Create your organizer profile and gain access to our
                        event management tools
                      </p>
                    </div>
                  </div>

                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Find & Book a Venue</h4>
                      <p>
                        Browse available venues or list your own space for your
                        upcoming event
                      </p>
                    </div>
                  </div>

                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Create Your Event</h4>
                      <p>
                        Set up event details, ticket types, and customize your
                        event page
                      </p>
                    </div>
                  </div>

                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Promote & Manage</h4>
                      <p>
                        Share your event, track sales, and communicate with
                        registered attendees
                      </p>
                    </div>
                  </div>
                </div>
                <div className="step-image">
                  <img
                    src="/placeholder.svg?height=400&width=500"
                    alt="Organizer experience"
                    width={500}
                    height={400}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .how-it-works {
          padding: 5rem 2rem;
          background-color: #f5f7fa;
        }

        .how-it-works-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tabs-container {
          margin-top: 3rem;
        }

        .tabs-header {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .tab-button {
          padding: 0.75rem 2rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 1rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          color: #5d3fd3;
          border-bottom-color: #5d3fd3;
        }

        .tab-button:hover {
          color: #5d3fd3;
        }

        .tabs-content {
          position: relative;
        }

        .tab-panel {
          display: none;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .tab-panel.active {
          display: grid;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #5d3fd3;
          color: white;
          border-radius: 50%;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .step-content p {
          color: #666;
          line-height: 1.6;
        }

        .step-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        @media (max-width: 992px) {
          .tab-panel {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .step-image {
            order: -1;
          }
        }

        @media (max-width: 576px) {
          .tabs-header {
            flex-direction: column;
            gap: 1rem;
          }

          .tab-button {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
