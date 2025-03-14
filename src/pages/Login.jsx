import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { SignupModal } from "../components/SignupModal"
import { ArrowLeft } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:3002/login-eventOrganizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: "include",
      })

      if (response.ok) {
        setTimeout(() => {
          navigate("/dashboard")
        }, 2000)
        console.log("Login successful")
      } else {
        console.error("Login failed")
      }
    } catch (error) {
      console.error("Error during login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <header className="header">
        <div className="header-content">
          <a href="/" className="logo">
            Event<span>Ease</span>
          </a>
          <a href="/" className="back-button">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </a>
        </div>
      </header>

      <main className="main-content">
        <div className="illustration-container">
          <div className="illustration-card">
            <img
              src="https://img.freepik.com/free-vector/tablet-login-concept-illustration_114360-7893.jpg?t=st=1738312443~exp=1738316043~hmac=c5aaa7cda5b5bb626b2cd6e8a43259f60c63f9b56c4c3b277810b09faefd47e6&w=1380"
              alt="Event organization illustration"
              className="illustration"
            />
            <div className="illustration-text">
              <h2>Organize Memorable Events</h2>
              <p>Access your dashboard to manage venues, tickets, and attendees all in one place.</p>
            </div>
          </div>
        </div>

        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Log in to your Event Organizer account</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <a href="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </a>
                </div>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={`login-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="social-buttons">
              <button className="social-button google">
                <img src="https://cdn-icons-png.flaticon.com/128/300/300221.png" alt="Google" width="20" height="20" />
                <span>Google</span>
              </button>
              <button className="social-button facebook">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
                  alt="Facebook"
                  width="20"
                  height="20"
                />
                <span>Facebook</span>
              </button>
            </div>

            <p className="signup-prompt">
              Don't have an account?{" "}
              <button onClick={() => setIsSignupModalOpen(true)} className="signup-link">
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </main>

      <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .header {
          padding: 1.25rem 2rem;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          color: #333;
          font-size: 1.5rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo span {
          color: #00a389;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #555;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background-color: #f0f0f0;
          color: #00a389;
        }

        .main-content {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .illustration-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .illustration-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .illustration-card:hover {
          transform: translateY(-5px);
        }

        .illustration {
          width: 100%;
          display: block;
        }

        .illustration-text {
          padding: 1.5rem;
        }

        .illustration-text h2 {
          color: #00a389;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        .illustration-text p {
          color: #666;
          line-height: 1.6;
        }

        .login-container {
          display: flex;
          justify-content: center;
        }

        .login-card {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 450px;
        }

        .login-title {
          font-size: 2rem;
          color: #333;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .login-subtitle {
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
          font-weight: 500;
        }

        .password-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background-color: #f9f9f9;
        }

        .form-input:focus {
          border-color: #00a389;
          box-shadow: 0 0 0 2px rgba(0, 163, 137, 0.2);
          background-color: white;
          outline: none;
        }

        .form-input::placeholder {
          color: #aaa;
        }

        .login-button {
          width: 100%;
          padding: 0.875rem;
          background-color: #00a389;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1rem;
        }

        .login-button:hover {
          background-color: #008f78;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 163, 137, 0.2);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-button.loading {
          background-color: #66c2b2;
          cursor: not-allowed;
        }

        .forgot-password {
          color: #00a389;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .forgot-password:hover {
          color: #008f78;
          text-decoration: underline;
        }

        .divider {
          margin: 2rem 0;
          text-align: center;
          position: relative;
        }

        .divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: #eee;
          z-index: 1;
        }

        .divider span {
          position: relative;
          z-index: 2;
          background-color: white;
          padding: 0 1rem;
          color: #888;
          font-size: 0.9rem;
        }

        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .social-button {
          padding: 0.75rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .social-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .social-button.google:hover {
          border-color: #DB4437;
          color: #DB4437;
        }

        .social-button.facebook:hover {
          border-color: #4267B2;
          color: #4267B2;
        }

        .signup-prompt {
          text-align: center;
          color: #666;
          margin-top: 1.5rem;
        }

        .signup-link {
          color: #00a389;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .signup-link:hover {
          color: #008f78;
          text-decoration: underline;
        }

        @media (max-width: 992px) {
          .main-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .illustration-container {
            display: none;
          }

          .login-container {
            grid-row: 1;
          }
        }

        @media (max-width: 576px) {
          .header {
            padding: 1rem;
          }

          .main-content {
            padding: 0 1rem;
            margin: 1.5rem auto;
          }

          .login-card {
            padding: 1.5rem;
          }

          .login-title {
            font-size: 1.75rem;
          }

          .back-button span {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

