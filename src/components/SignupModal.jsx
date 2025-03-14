import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { VerificationModal } from "./VerificationModal"

export function SignupModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    address: "",
  })
  const [showVerification, setShowVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    if (!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const prevStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:3002/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          organizationName: formData.organizationName,
          address: formData.address,
        }),
      })

      if (response.ok) {
        setShowVerification(true)
      } else {
        throw new Error("Signup failed")
      }
    } catch (error) {
      console.error("Error during signup:", error)
      setErrors({ submit: "Signup failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  if (showVerification) {
    return <VerificationModal email={formData.email} onClose={onClose} />
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Your Account</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
            <div className="step-number">1</div>
            <span className="step-label">Personal Info</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
            <div className="step-number">2</div>
            <span className="step-label">Account Details</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={errors.firstName ? "error" : ""}
                  />
                  {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={errors.lastName ? "error" : ""}
                  />
                  {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              <div className="form-actions">
                <button type="button" className="next-button" onClick={nextStep}>
                  Continue
                </button>
                <button type="button" className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? "error" : ""}
                  />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? "error" : ""}
                  />
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className={errors.organizationName ? "error" : ""}
                />
                {errors.organizationName && <div className="error-message">{errors.organizationName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={errors.address ? "error" : ""}
                />
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>

              {errors.submit && <div className="submit-error">{errors.submit}</div>}

              <div className="form-actions">
                <button type="button" className="back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
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
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
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
          margin-bottom: 2rem;
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

        .progress-bar {
          display: flex;
          align-items: center;
          margin-bottom: 2.5rem;
          padding: 0 1rem;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #666;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .step-label {
          font-size: 0.875rem;
          color: #666;
          transition: all 0.3s ease;
        }

        .progress-step.active .step-number {
          background: #00a389;
          color: white;
        }

        .progress-step.active .step-label {
          color: #00a389;
          font-weight: 600;
        }

        .progress-line {
          flex: 1;
          height: 2px;
          background: #eee;
          position: relative;
          z-index: 0;
        }

        .form-step {
          animation: fadeIn 0.3s ease;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
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

        input.error {
          border-color: #e53e3e;
          background-color: #fff5f5;
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .submit-error {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-align: center;
          padding: 0.75rem;
          background-color: #fff5f5;
          border-radius: 6px;
          border: 1px solid #fed7d7;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .submit-button,
        .next-button,
        .back-button,
        .cancel-button {
          flex: 1;
          padding: 0.875rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button,
        .next-button {
          background: #00a389;
          color: white;
          border: none;
        }

        .submit-button:hover,
        .next-button:hover {
          background: #008f78;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 163, 137, 0.2);
        }

        .submit-button:active,
        .next-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          background: #66c2b2;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .back-button,
        .cancel-button {
          background: white;
          border: 1px solid #ddd;
          color: #666;
        }

        .back-button:hover,
        .cancel-button:hover {
          background: #f8f9fa;
          border-color: #ccc;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .modal-content {
            padding: 1.5rem;
            width: 95%;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .modal-header h2 {
            font-size: 1.5rem;
          }

          .progress-bar {
            padding: 0;
          }

          .step-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

