import { useState } from "react"
import { X, Loader2, Mail, CheckCircle } from "lucide-react"

export function VerificationModal({ email, onClose }) {
  const [code, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:3002/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      })

      if (response.ok) {
        setIsVerified(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        throw new Error("Verification failed")
      }
    } catch (error) {
      console.error("Error during verification:", error)
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {isVerified ? (
          <div className="success-container">
            <div className="success-icon">
              <CheckCircle size={60} />
            </div>
            <h2>Email Verified!</h2>
            <p>Your account has been successfully verified.</p>
            <p>Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Verify Your Email</h2>
              <button className="close-button" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="email-icon-container">
              <div className="email-icon">
                <Mail size={32} />
              </div>
            </div>

            <div className="verification-info">
              <p>
                We've sent a verification code to your email address. Please check your inbox and enter the code below
                to verify your account.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" value={email} readOnly className="readonly-input" />
              </div>

              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={code}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className={error ? "error" : ""}
                />
                {error && <div className="error-message">{error}</div>}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={isLoading || code.length < 6}>
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </div>
            </form>

            <div className="resend-code">
              <p>
                Didn't receive the code? <button className="resend-button">Resend Code</button>
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 450px;
          padding: 2.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.8rem;
          color: #333;
          margin: 0;
          font-weight: 700;
        }

        .close-button {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f0f0f0;
          color: #333;
        }

        .email-icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .email-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background: rgba(0, 163, 137, 0.1);
          border-radius: 50%;
          color: #00a389;
        }

        .verification-info {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .verification-info p {
          color: #666;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background-color: #f9f9f9;
        }

        input:focus {
          outline: none;
          border-color: #00a389;
          box-shadow: 0 0 0 2px rgba(0, 163, 137, 0.2);
          background-color: white;
        }

        .readonly-input {
          background-color: #f0f0f0;
          color: #666;
          cursor: not-allowed;
        }

        input.error {
          border-color: #e53e3e;
          background-color: #fff5f5;
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .form-actions {
          margin-top: 2rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.875rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          background: #00a389;
          color: white;
          border: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover {
          background: #008f78;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 163, 137, 0.2);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          background: #66c2b2;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .resend-code {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #666;
        }

        .resend-button {
          background: none;
          border: none;
          color: #00a389;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .resend-button:hover {
          color: #008f78;
          text-decoration: underline;
        }

        .success-container {
          text-align: center;
          padding: 1rem 0;
        }

        .success-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #00a389;
          animation: scaleIn 0.5s ease;
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .success-container h2 {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 1rem;
        }

        .success-container p {
          color: #666;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 640px) {
          .modal-content {
            padding: 1.5rem;
            width: 95%;
          }

          .modal-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

