import { Link } from "react-router-dom";

export default function Navbar() {
    return (
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            EventEase
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/events" className="nav-link">
              Events
            </Link>
            <Link to="/previous_tickets" className="nav-link">
              Previous Purchased Tickets
            </Link>
            <Link to="/sign-in" className="nav-link sign-in">
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    )
  }