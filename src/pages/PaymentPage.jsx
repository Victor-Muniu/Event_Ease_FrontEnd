import { useState } from "react"
import TentativeBookings from "../components/TentativeBookings"
export default function PaymentPage() {
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [paymentError, setPaymentError] = useState(null)
    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
  
    const handleSelectBooking = (booking) => {
      setSelectedBooking(booking)
      setPaymentMethod("")
      setPhoneNumber("")
      setEmail("")
      setPaymentSuccess(false)
      setPaymentError(null)
      setShowPaymentForm(true)
    }
  
    const handleClosePaymentForm = () => {
      setShowPaymentForm(false)
    }
  
    const handlePaymentMethodSelect = (method) => {
      setPaymentMethod(method)
    }
  
    const handlePaymentSubmit = async (e) => {
      e.preventDefault()
  
      if (!selectedBooking) {
        setPaymentError("Please select a booking to pay for")
        return
      }
  
      if (!paymentMethod) {
        setPaymentError("Please select a payment method")
        return
      }
  
      try {
        setIsSubmitting(true)
        setPaymentError(null)
  
        // Construct the appropriate request body based on payment method
        let requestBody = {}
  
        if (paymentMethod === "M-Pesa") {
          if (!phoneNumber || !phoneNumber.match(/^254\d{9}$/)) {
            throw new Error("Please enter a valid phone number in the format 254XXXXXXXXX")
          }
          requestBody = {
            paymentMethod: "M-Pesa",
            phoneNumber,
          }
        } else if (paymentMethod === "PayPal") {
          if (!email || !email.includes("@")) {
            throw new Error("Please enter a valid email address")
          }
          requestBody = {
            paymentMethod: "PayPal",
            email,
          }
        }
  
        const response = await fetch(`http://localhost:3002/bookings/${selectedBooking._id}/pay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Payment failed")
        }
  
        setPaymentSuccess(true)
  
        // Trigger a refresh of the tentative bookings after successful payment
        setTimeout(() => {
          setRefreshTrigger((prev) => prev + 1)
          setShowPaymentForm(false)
        }, 3000)
      } catch (err) {
        console.error("Payment error:", err)
        setPaymentError(err.message)
      } finally {
        setIsSubmitting(false)
      }
    }
  
    return (
      <div className="payment-page">
        <div className="payment-header">
          <h1>Complete Your Booking Payment</h1>
          <p>Select a tentative booking from the table below and complete payment to confirm your venue</p>
        </div>
  
        <div className="bookings-section">
          <TentativeBookings onSelectBooking={handleSelectBooking} refreshTrigger={refreshTrigger} />
        </div>
  
        {showPaymentForm && selectedBooking && (
          <div className="payment-overlay" onClick={handleClosePaymentForm}>
            <div className="payment-form-container" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={handleClosePaymentForm}>
                ×
              </button>
  
              <div className="payment-form-header">
                <h2>Payment Details</h2>
                <div className="booking-info">
                  <p className="event-name">{selectedBooking.response?.venueRequest?.eventName || "Unnamed Event"}</p>
                  <p className="venue-name">{selectedBooking.response?.venueRequest?.venue?.name || "No venue"}</p>
                  <p className="amount-due">Amount Due: KES {selectedBooking.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
  
              <div className="payment-methods">
                <h3>Select Payment Method</h3>
                <div className="methods-container">
                  <div
                    className={`method-option ${paymentMethod === "M-Pesa" ? "selected" : ""}`}
                    onClick={() => handlePaymentMethodSelect("M-Pesa")}
                  >
                    <div className="method-icon mpesa">M</div>
                    <div className="method-details">
                      <p className="method-name">M-Pesa</p>
                      <p className="method-description">Pay using your M-Pesa mobile money</p>
                    </div>
                  </div>
  
                  <div
                    className={`method-option ${paymentMethod === "PayPal" ? "selected" : ""}`}
                    onClick={() => handlePaymentMethodSelect("PayPal")}
                  >
                    <div className="method-icon paypal">P</div>
                    <div className="method-details">
                      <p className="method-name">PayPal</p>
                      <p className="method-description">Pay using your PayPal account</p>
                    </div>
                  </div>
                </div>
              </div>
  
              <form onSubmit={handlePaymentSubmit} className="payment-form">
                {paymentMethod === "M-Pesa" && (
                  <div className="form-group">
                    <label htmlFor="phoneNumber">M-Pesa Phone Number</label>
                    <input
                      type="text"
                      id="phoneNumber"
                      placeholder="254XXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                    <p className="input-help">Enter your phone number in the format 254XXXXXXXXX</p>
                  </div>
                )}
  
                {paymentMethod === "PayPal" && (
                  <div className="form-group">
                    <label htmlFor="email">PayPal Email</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}
  
                {paymentError && <div className="error-message">{paymentError}</div>}
                {paymentSuccess && (
                  <div className="success-message">Payment processed successfully! Your booking is now confirmed.</div>
                )}
  
                <div className="form-actions">
                  <button
                    type="submit"
                    className="pay-now-button"
                    disabled={!paymentMethod || isSubmitting || paymentSuccess}
                  >
                    {isSubmitting ? "Processing..." : `Pay KES ${selectedBooking.totalAmount?.toLocaleString()}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <style jsx>{`
          .payment-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
  
          .payment-header {
            margin-bottom: 2rem;
          }
  
          .payment-header h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
  
          .payment-header p {
            color: #718096;
            font-size: 1rem;
          }
  
          .bookings-section {
            width: 100%;
          }
  
          /* Payment overlay styles */
          .payment-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }
  
          .payment-form-container {
            background-color: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
          }
  
          .close-button {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #718096;
            cursor: pointer;
            z-index: 10;
          }
  
          .payment-form-header {
            padding: 1.5rem;
            border-bottom: 1px solid #f0f0f0;
          }
  
          .payment-form-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 1rem;
          }
  
          .booking-info {
            background-color: #f7fafc;
            padding: 1rem;
            border-radius: 0.5rem;
          }
  
          .event-name {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.25rem;
          }
  
          .venue-name {
            color: #718096;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
  
          .amount-due {
            font-weight: 700;
            color: #6366f1;
            margin-top: 0.5rem;
          }
  
          .payment-methods {
            padding: 1.5rem;
            border-bottom: 1px solid #f0f0f0;
          }
  
          .payment-methods h3 {
            font-size: 1rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 1rem;
          }
  
          .methods-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
  
          .method-option {
            display: flex;
            align-items: center;
            padding: 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: border-color 0.3s, background-color 0.3s;
          }
  
          .method-option:hover {
            border-color: #cbd5e0;
          }
  
          .method-option.selected {
            border-color: #6366f1;
            background-color: #f5f7ff;
          }
  
          .method-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.25rem;
            margin-right: 1rem;
            color: white;
          }
  
          .method-icon.mpesa {
            background-color: #4caf50;
          }
  
          .method-icon.paypal {
            background-color: #0070ba;
          }
  
          .method-name {
            font-weight: 600;
            color: #2d3748;
          }
  
          .method-description {
            font-size: 0.875rem;
            color: #718096;
          }
  
          .payment-form {
            padding: 1.5rem;
          }
  
          .form-group {
            margin-bottom: 1.5rem;
          }
  
          .form-group label {
            display: block;
            font-weight: 500;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
  
          .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            font-size: 1rem;
          }
  
          .form-group input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
  
          .input-help {
            font-size: 0.75rem;
            color: #718096;
            margin-top: 0.25rem;
          }
  
          .error-message {
            background-color: #fed7d7;
            color: #e53e3e;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
          }
  
          .success-message {
            background-color: #c6f6d5;
            color: #2f855a;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
          }
  
          .form-actions {
            display: flex;
            justify-content: flex-end;
          }
  
          .pay-now-button {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
  
          .pay-now-button:hover {
            opacity: 0.9;
          }
  
          .pay-now-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
  
          @media (max-width: 768px) {
            .payment-page {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    )
  }
  
  