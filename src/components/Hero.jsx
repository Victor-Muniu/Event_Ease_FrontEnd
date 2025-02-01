import { Link } from "react-router-dom";
export default function Hero() {
    return (
      <section className="hero">
        <div className="container hero-content">
          <h1>Create Unforgettable Experiences</h1>
          <p>Whether you're booking or organizing, we make event planning seamless and extraordinary.</p>
          <div className="button-group">
            <Link to="/book" className="button button-primary">
              Book an Event
            </Link>
            <Link to="/login_organizer" className="button button-outline">
              Organize an Event
            </Link>
          </div>
        </div>
      </section>
    )
}  