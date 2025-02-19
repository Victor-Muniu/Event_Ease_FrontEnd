import { useState } from "react";
import { X } from "lucide-react";

export function VerificationModal({ email, onClose }) {
  const [code, setVerificationCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      });

      if (response.ok) {
        alert("Email verified successfully!");
        onClose();
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      alert("Verification failed. Please try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Verify Your Email</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p>Please check your email for the verification code and enter it below.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} readOnly />
          </div>

          <div className="form-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={code}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Verify Email
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          padding: 2rem;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          color: #1a202c;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          color: #4a5568;
          cursor: pointer;
          padding: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: #00a389;
        }

        .form-actions {
          margin-top: 2rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          background: #00a389;
          color: white;
          border: none;
          transition: background-color 0.2s;
        }

        .submit-button:hover {
          background: #008f78;
        }
      `}</style>
    </div>
  );
}
