export default function Testimonials() {
    const testimonials = [
      {
        name: "Sarah Johnson",
        role: "Wedding Client",
        content:
          "The team made our wedding day absolutely perfect. Every detail was handled with care and professionalism.",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      {
        name: "Michael Chen",
        role: "Corporate Event",
        content:
          "Outstanding service for our annual conference. The attention to detail and organization was impressive.",
        avatar: "/placeholder.svg?height=50&width=50",
      },
    ]
  
    return (
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <p>{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  