import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function BookingRequestModal({ venueName, capacity, onClose }) {
  const [guestCount, setGuestCount] = useState("")
  const [selectedDates, setSelectedDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [eventDates, setEventDates] = useState([])
  const [eventName, setEventName] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3002/event-requests/ground/name/${venueName}`)
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setEventDates(data[0].requestedDates.map((date) => new Date(date).toISOString().split("T")[0]))
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error)
      }
    }
    fetchEventDetails()
  }, [venueName])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:3002/event-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventGround: venueName,
          eventDates: selectedDates,
          expectedAttendees: Number.parseInt(guestCount, 10),
          additionalNotes: additionalNotes,
        }),
        credentials: "include",
      })

      if (response.ok) {
        onClose()
        alert("Booking request submitted successfully!")
      } else {
        throw new Error("Failed to submit booking request")
      }
    } catch (error) {
      console.error("Error submitting booking request:", error)
      alert("Failed to submit booking request. Please try again.")
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))
  }

  const toggleDateSelection = (dateStr) => {
    setSelectedDates((prev) => (prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]))
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{venueName}</h2>
          <p>Maximum capacity: {capacity} guests</p>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="calendar-section">
            <div className="month-navigation">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                ←
              </button>
              <h3>{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                →
              </button>
            </div>
            <div className="calendar">
              <div className="weekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="days">
                {getDaysInMonth(currentMonth).map((date) => {
                  const dateStr = date.toISOString().split("T")[0]
                  const isPastDate = date < new Date().setHours(0, 0, 0, 0)
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      className={`day ${eventDates.includes(dateStr) ? "reserved" : ""} ${selectedDates.includes(dateStr) ? "selected" : ""}`}
                      onClick={() => !isPastDate && toggleDateSelection(dateStr)}
                      disabled={isPastDate || eventDates.includes(dateStr)}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="guestCount">Number of Guests</label>
            <input
              id="guestCount"
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              max={capacity}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Submit Request
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .calendar-section {
          margin-bottom: 1.5rem;
        }

        .month-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .month-navigation button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          font-size: 1.25rem;
        }

        .calendar {
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          background: #f8f9fa;
          padding: 0.5rem;
          font-weight: 500;
        }

        .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e2e8f0;
        }

        .day {
          background: white;
          border: none;
          padding: 0.75rem;
          text-align: center;
          cursor: pointer;
        }

        .day.selected {
          background: #00a389;
          color: white;
        }

        .day.reserved {
          background:rgb(210, 163, 21) !important;
          color: white;
          cursor: not-allowed;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 1rem;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .submit-button {
          background: #00a389;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

