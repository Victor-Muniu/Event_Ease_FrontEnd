export default function FeaturedEvents() {
    const events = [
      {
        title: "Weddings",
        description: "Create your perfect day with our expert wedding planning services.",
        image: "https://cdn.pixabay.com/photo/2016/11/21/15/58/wedding-1846114_1280.jpg",
      },
      {
        title: "Corporate Events",
        description: "Professional event services for your business needs.",
        image: "https://cdn.pixabay.com/photo/2013/12/18/12/07/wedding-banquet-230207_1280.jpg",
      },
      {
        title: "Birthday Parties",
        description: "Celebrate special moments with unique party experiences.",
        image: "https://cdn.pixabay.com/photo/2016/02/18/08/39/skewers-1206687_1280.jpg",
      },
    ]
  
    return (
      <section className="featured-events">
        <div className="container">
          <h2 className="section-title">Featured Events</h2>
          <div className="events-grid">
            {events.map((event, index) => (
              <div key={index} className="event-card">
                <img src={event.image || "/placeholder.svg"} alt={event.title} />
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  