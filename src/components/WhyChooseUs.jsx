import { Star, Clock, Users } from "lucide-react"

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Star className="feature-icon" />,
      title: "Premium Service",
      description: "Exceptional attention to detail and personalized care for every event.",
    },
    {
      icon: <Clock className="feature-icon" />,
      title: "Time Saving",
      description: "Streamlined planning process to make your event organization effortless.",
    },
    {
      icon: <Users className="feature-icon" />,
      title: "Expert Team",
      description: "Professional event planners with years of experience.",
    },
  ]

  return (
    <section className="why-choose-us">
      <div className="container">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              {feature.icon}
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

