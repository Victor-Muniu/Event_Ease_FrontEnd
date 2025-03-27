import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function AuthModal({ isOpen, initialView, onClose }) {
  const [modalType, setModalType] = useState(initialView)
  const [isFlipping, setIsFlipping] = useState(false)
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("") // Fixed: Added useState here
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState("Male")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationEmail, setVerificationEmail] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [verificationLoading, setVerificationLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setModalType(initialView)
      setError("")
      setEmail("")
      setPhoneNumber("")
      setPassword("")
      setConfirmPassword("")
      setFirstName("")
      setLastName("")
      setGender("Male")
      setShowVerification(false)
    }
  }, [isOpen, initialView])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const switchModal = () => {
    setIsFlipping(true)
    setTimeout(() => {
      setModalType(modalType === "login" ? "signup" : "login")
      setError("")
      setIsFlipping(false)
    }, 400) // Half of the animation duration
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:3002/login-user", {
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

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.")
      }

      const data = await response.json()
      console.log("Login successful:", data)

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:3002/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          email,
          phoneNumber,
          password,
        }),
      })

      if (!response.ok) {
        throw new Error("Registration failed. Please try again.")
      }

      const data = await response.json()
      console.log("Registration successful:", data)

      // Show verification modal
      setVerificationEmail(email)
      setShowVerification(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    setVerificationError("")

    if (!verificationCode) {
      setVerificationError("Please enter the verification code")
      return
    }

    try {
      setVerificationLoading(true)
      const response = await fetch("http://localhost:3002/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode, // Changed from verificationCode to code
        }),
        credentials: "include", // Added credentials to include cookies
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Verification failed. Please check your code and try again.")
      }

      const data = await response.json()
      console.log("Verification successful:", data)

      // Switch to login after successful verification
      setShowVerification(false)
      setModalType("login")
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : "An error occurred during verification")
    } finally {
      setVerificationLoading(false)
    }
  }

  if (!isOpen) return null

  if (showVerification) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container verification-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="modal-header">
            <h2>Verify Your Account</h2>
            <p>
              We've sent a verification code to {verificationEmail}. Please enter it below to complete your
              registration.
            </p>
          </div>

          {verificationError && <div className="modal-error">{verificationError}</div>}

          <form onSubmit={handleVerification} className="modal-form">
            <div className="form-group">
              <label htmlFor="verification-code">Verification Code</label>
              <input
                type="text"
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={verificationLoading}>
              {verificationLoading ? "Verifying..." : "Verify Account"}
            </button>
          </form>

          <div className="verification-footer">
            <p>
              Didn't receive a code? <button className="resend-button">Resend Code</button>
            </p>
          </div>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1100;
            padding: 1rem;
          }
          
          .modal-container {
            background-color: white;
            border-radius: 8px;
            width: 100%;
            max-width: 450px;
            padding: 2rem;
            position: relative;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            animation: modalFadeIn 0.3s ease-out;
          }
          
          .verification-modal {
            max-width: 400px;
          }
          
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            padding: 0.25rem;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
          }
          
          .modal-close:hover {
            background-color: rgba(0, 0, 0, 0.05);
            color: #333;
          }
          
          .modal-header {
            text-align: center;
            margin-bottom: 1.5rem;
          }
          
          .modal-header h2 {
            font-size: 1.75rem;
            color: #333;
            margin-bottom: 0.5rem;
          }
          
          .modal-header p {
            color: #666;
            font-size: 0.95rem;
          }
          
          .modal-error {
            background-color: #fff2f2;
            color: #e53e3e;
            padding: 0.75rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            border-left: 3px solid #e53e3e;
          }
          
          .modal-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .form-group label {
            font-size: 0.9rem;
            font-weight: 500;
            color: #555;
          }
          
          .form-group input {
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.2s;
          }
          
          .form-group input:focus {
            outline: none;
            border-color: #5d3fd3;
            box-shadow: 0 0 0 2px rgba(93, 63, 211, 0.1);
          }
          
          .submit-button {
            background-color: #5d3fd3;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 0.5rem;
          }
          
          .submit-button:hover {
            background-color: #4c33b0;
          }
          
          .submit-button:disabled {
            background-color: #a594e8;
            cursor: not-allowed;
          }
          
          .verification-footer {
            margin-top: 1.5rem;
            text-align: center;
            font-size: 0.9rem;
            color: #666;
          }
          
          .resend-button {
            background: none;
            border: none;
            color: #5d3fd3;
            font-weight: 500;
            cursor: pointer;
            padding: 0;
            font-size: 0.9rem;
          }
          
          .resend-button:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container ${isFlipping ? "flipping" : ""}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>{modalType === "login" ? "Log In" : "Sign Up"}</h2>
          <p>{modalType === "login" ? "Welcome back to EventEase!" : "Join EventEase to discover amazing events!"}</p>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {modalType === "login" ? (
          <form onSubmit={handleLogin} className="modal-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-footer">
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="modal-form">
            <div className="name-row">
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input
                  type="text"
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>
                <input
                  type="text"
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="gender-select">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                type="email"
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                type="tel" // Changed from email to tel for phone number
                id="signup-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254712345678"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="modal-switch">
          {modalType === "login" ? (
            <p>
              Don't have an account? <button onClick={switchModal}>Sign Up</button>
            </p>
          ) : (
            <p>
              Already have an account? <button onClick={switchModal}>Log In</button>
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 1rem;
        }
        
        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 100%;
          max-width: 450px;
          padding: 2rem;
          position: relative;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: modalFadeIn 0.3s ease-out;
          transform-style: preserve-3d;
          transition: transform 0.8s;
          perspective: 1000px;
        }
        
        .modal-container.flipping {
          animation: cardFlip 0.8s;
        }
        
        @keyframes cardFlip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          z-index: 10;
        }
        
        .modal-close:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: #333;
        }
        
        .modal-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .modal-header h2 {
          font-size: 1.75rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .modal-header p {
          color: #666;
          font-size: 0.95rem;
        }
        
        .modal-error {
          background-color: #fff2f2;
          color: #e53e3e;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          border-left: 3px solid #e53e3e;
        }
        
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .name-row {
          display: flex;
          gap: 1rem;
          width: 100%;
        }
        
        .name-row .form-group {
          flex: 1;
          min-width: 0; /* Prevents flex items from overflowing */
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #555;
        }
        
        .form-group input, .form-group select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #5d3fd3;
          box-shadow: 0 0 0 2px rgba(93, 63, 211, 0.1);
        }
        
        .gender-select {
          background-color: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-size: 1em;
        }
        
        .form-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: -0.5rem;
        }
        
        .forgot-password {
          font-size: 0.85rem;
          color: #5d3fd3;
          text-decoration: none;
        }
        
        .forgot-password:hover {
          text-decoration: underline;
        }
        
        .submit-button {
          background-color: #5d3fd3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 0.5rem;
        }
        
        .submit-button:hover {
          background-color: #4c33b0;
        }
        
        .submit-button:disabled {
          background-color: #a594e8;
          cursor: not-allowed;
        }
        
        .modal-switch {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: #666;
        }
        
        .modal-switch button {
          background: none;
          border: none;
          color: #5d3fd3;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          font-size: 0.9rem;
        }
        
        .modal-switch button:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 480px) {
          .modal-container {
            padding: 1.5rem;
          }
          
          .modal-header h2 {
            font-size: 1.5rem;
          }
          
          .name-row {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

