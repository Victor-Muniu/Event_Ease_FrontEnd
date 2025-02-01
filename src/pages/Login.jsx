import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
        console.log("Login successful");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <a href="/" className="logo">
          EventEase
        </a>
        
      </header>

      <main className="main-content">
        <div className="illustration-container">
          <img
            src="https://img.freepik.com/free-vector/tablet-login-concept-illustration_114360-7893.jpg?t=st=1738312443~exp=1738316043~hmac=c5aaa7cda5b5bb626b2cd6e8a43259f60c63f9b56c4c3b277810b09faefd47e6&w=1380"
            alt="Event organization illustration"
            className="illustration"
          />
        </div>

        <div className="login-container">
          <h1 className="login-title">Event Organizer Login</h1>
          

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
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

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-button">
              Log In
            </button>
          </form>

          <div className="divider">Or continue with</div>

          <div className="social-buttons">
            <button className="social-button">
              <img src="https://cdn-icons-png.flaticon.com/128/300/300221.png" alt="" width="20" height="20" />
              Google
            </button>
            <button className="social-button">
              <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="" width="20" height="20" />
              Facebook
            </button>
          </div>

          <p className="signup-prompt">
            Don't have an account?{" "}
            <a href="/signup" className="signup-link">
              Sign up here
            </a>
          </p>
        </div>
      </main>

     
      <style jsx>{`
        .container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .header {
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .logo {
          color: #00a389;
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
        }

        .nav-links {
          margin-left: 2rem;
          display: flex;
          gap: 1.5rem;
        }

        .nav-link {
          color: #4a5568;
          text-decoration: none;
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

        .illustration {
          width: 100%;
          max-width: 500px;
        }

        .login-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .login-title {
          font-size: 1.5rem;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: #4a5568;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 1rem;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #00a389;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }

        .login-button:hover {
          background-color: #008f78;
        }

        .forgot-password {
          color: #00a389;
          text-decoration: none;
          float: right;
          font-size: 0.875rem;
        }

        .divider {
          margin: 1.5rem 0;
          text-align: center;
          color: #718096;
        }

        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .social-button {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .signup-prompt {
          text-align: center;
          color: #4a5568;
        }

        .signup-link {
          color: #00a389;
          text-decoration: none;
        }

        .footer {
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          color: #4a5568;
          font-size: 0.875rem;
        }

        .footer-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-link {
          color: #4a5568;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
