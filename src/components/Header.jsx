import { Link } from "react-router-dom"
import { MonitorPlay } from "lucide-react"

export default function Header() {
  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <MonitorPlay size={24} />
          EventEase
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/events" className="nav-link">
            Events
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/sign-in" className="sign-in">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}

