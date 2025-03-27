"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import AuthModal from "./AuthModal"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalType, setAuthModalType] = useState("login")
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // Function to fetch current user
  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:3002/current-attendee", {credentials: "include"})
      const data = await response.json()

      if (data && data.user) {
        setCurrentUser(data.user)
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setCurrentUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3002/logout-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        setCurrentUser(null)
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const openAuthModal = (type) => {
    setAuthModalType(type)
    setIsAuthModalOpen(true)
  }

  // Close modal callback - refresh user data when modal closes
  const handleCloseModal = () => {
    setIsAuthModalOpen(false)
    fetchCurrentUser() // Refresh user data when modal closes
  }

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
              <Link to="/personal_tickets">Your Tickets</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
          </ul>
          <div className="navbar-buttons">
            {isLoading ? (
              <button className="login-button" disabled>
                Loading...
              </button>
            ) : currentUser ? (
              <button onClick={handleLogout} className="logout-button">
                Logout ({currentUser.fname})
              </button>
            ) : (
              <button onClick={() => openAuthModal("login")} className="login-button">
                Log In / Sign Up
              </button>
            )}
          </div>
        </nav>
      </div>

      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} initialView={authModalType} onClose={handleCloseModal} />}

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

        .login-button, .logout-button {
          padding: 0.5rem 1rem;
          color: #5d3fd3;
          background: transparent;
          border: 1px solid #5d3fd3;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .login-button:hover, .logout-button:hover {
          background: rgba(93, 63, 211, 0.1);
        }

        .logout-button {
          color: #e53935;
          border-color: #e53935;
        }

        .logout-button:hover {
          background: rgba(229, 57, 53, 0.1);
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
          .logout-button,
          .signup-button {
            text-align: center;
            width: 100%;
          }
        }
      `}</style>
    </header>
  )
}

