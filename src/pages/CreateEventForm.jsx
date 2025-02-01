import React, { useState } from "react";

export default function CreateEventForm({ quotationId, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    eventResponse: quotationId,
    startDate: "",
    endDate: "",
    ticketsAvailable: "",
    ticketPrice: "",
    image: "",
    
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3002/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          eventResponse: formData.eventResponse,
          startDate: formData.startDate,
          endDate: formData.endDate,
          ticketsAvailable: Number.parseInt(formData.ticketsAvailable),
          ticketPrice: Number.parseInt(formData.ticketPrice),
          image: formData.image,
        }),
        credentials: "include",
      });

      if (response.ok) {
        onClose();
        alert("Event created successfully!");
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <h2>Create Your Event</h2>
          <p>Enter the details for your upcoming event to get started.</p>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h3>Event Information</h3>

            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder=""
                required
              />
              <label>Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                
                required
              />
              
            </div>

            

            
          </section>

          <section className="form-section">
            <h3>Date & Time</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            
          </section>

        

          <section className="form-section">
            <h3>Tickets</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Available Tickets</label>
                <input
                  type="number"
                  name="ticketsAvailable"
                  value={formData.ticketsAvailable}
                  onChange={handleChange}
                  placeholder="5000"
                  required
                />
              </div>
              <div className="form-group">
                <label>Ticket Price (KSH)</label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="1000"
                  required
                />
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Create Event
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .form-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
        }

        .form-header {
          margin-bottom: 2rem;
          position: relative;
        }

        .form-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .form-header p {
          color: #64748b;
          margin: 0.5rem 0 0 0;
        }

        .close-button {
          position: absolute;
          top: -1rem;
          right: -1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #64748b;
          cursor: pointer;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        input, select, textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #1e293b;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2563eb;
          ring: 2px solid #2563eb;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .submit-button {
          background: #2563eb;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button:hover {
          background: #1d4ed8;
        }

        .cancel-button {
          background: white;
          color: #64748b;
          padding: 0.75rem 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-button:hover {
          background: #f1f5f9;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
