import { MapPin } from "lucide-react"
import { useState, useEffect } from "react"




export default function EventGrid() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("http://localhost:3002/events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenues();
  }, []);
  return (
    <div className="events-grid">
      {events.map((event) => (
        <div key={event._id} className="event-card">
          <img src={event.image} alt={event.name} className="event-image" />
          <div className="event-content">
            <div className="event-date">Start Date {new Date(event.startDate).toLocaleDateString()}</div>
            <div className="event-date">End Date {new Date (event.endDate).toLocaleDateString()}</div>
            <h2 className="event-title">{event.name}</h2>
            <div className="event-price">Ticket Price Ksh{event.ticketPrice}</div>
            <div className="event-location">
              <MapPin size={16} />
              {event.venue.name}
            </div>
            <p className="event-description">{event.description}</p>
            <button className="book-button">Book Now</button>
          </div>
        </div>
      ))}
    </div>
  )
}

