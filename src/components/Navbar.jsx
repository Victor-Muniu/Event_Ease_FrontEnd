import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <h1>
              Event<span>Ease</span>
            </h1>
          </Link>
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <ul className="navbar-links">
            <li>
              <Link to="/upcoming">Browse Events</Link>
            </li>
          
            <li>
              <Link to="/organizers">For Organizers</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
          </ul>
          <div className="navbar-buttons">
            <Link href="/login" className="login-button">
              Log In
            </Link>
            <Link href="/signup" className="signup-button">
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          width: 100%;
          background-color: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbar-logo h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .navbar-logo span {
          color: #5d3fd3;
        }

        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #333;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-links {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
        }

        .navbar-links a {
          color: #555;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .navbar-links a:hover {
          color: #5d3fd3;
        }

        .navbar-buttons {
          display: flex;
          gap: 1rem;
        }

        .login-button {
          padding: 0.5rem 1rem;
          color: #5d3fd3;
          background: transparent;
          border: 1px solid #5d3fd3;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .login-button:hover {
          background: rgba(93, 63, 211, 0.1);
        }

        .signup-button {
          padding: 0.5rem 1rem;
          color: white;
          background: #5d3fd3;
          border: 1px solid #5d3fd3;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .signup-button:hover {
          background: #4c33b0;
        }

        @media (max-width: 768px) {
          .navbar-toggle {
            display: block;
          }

          .navbar-menu {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            flex-direction: column;
            background: white;
            padding: 1.5rem;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transform: translateY(-150%);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 999;
          }

          .navbar-menu.active {
            transform: translateY(0);
            opacity: 1;
          }

          .navbar-links {
            flex-direction: column;
            width: 100%;
          }

          .navbar-buttons {
            flex-direction: column;
            width: 100%;
          }

          .login-button,
          .signup-button {
            text-align: center;
            width: 100%;
          }
        }
      `}</style>
    </header>
  );
}
