import { useState, useEffect, useMemo } from "react"
import ResponseCard from "../components/ResponseCard"
import { useNavigate } from "react-router-dom"
import TentativeBookings from "../components/TentativeBookings"
import { formatCurrency } from "../utils/Formatters"

export default function BookingFinalization() {
  const router = useNavigate()
  const [activeStep, setActiveStep] = useState("responses")
  const [responses, setResponses] = useState([])
  const [bookings, setBookings] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(null)
  const [bookingError, setBookingError] = useState(null)
  const [bookingId, setBookingId] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch responses, bookings, and current user in parallel
        const [responsesRes, bookingsRes, userRes] = await Promise.all([
          fetch("http://localhost:3002/venue-request-responses"),
          fetch("http://localhost:3002/bookings"),
          fetch("http://localhost:3002/current-user", { credentials: "include" }),
        ])

        if (!responsesRes.ok) throw new Error("Failed to fetch responses")
        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings")
        if (!userRes.ok) throw new Error("Failed to fetch user data")

        const responsesData = await responsesRes.json()
        const bookingsData = await bookingsRes.json()
        const userData = await userRes.json()

        setResponses(responsesData)
        setCurrentUser(userData.user)
        setBookings(bookingsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshTrigger])

  // Filter responses for current user and exclude those that already have bookings
  const userResponses = useMemo(() => {
    if (!currentUser || !responses.length) return []

    // First filter responses for the current user
    const userFilteredResponses = responses.filter(
      (response) => response.venueRequest?.organizer?._id === currentUser.id,
    )

    // Then filter out responses that already have bookings
    return userFilteredResponses.filter((response) => {
      // Check if any booking has this response ID
      return !bookings.some((booking) => booking.response?._id === response._id)
    })
  }, [responses, currentUser, bookings])

  // Get tentative bookings for the current user
  const tentativeBookings = useMemo(() => {
    if (!currentUser || !bookings.length) return []

    return bookings.filter((booking) => booking.organizer?._id === currentUser.id && booking.status === "Tentative")
  }, [bookings, currentUser])

  const handleBookNow = (response) => {
    setSelectedResponse(response)
    setShowPaymentForm(true)
    setBookingSuccess(null)
    setBookingError(null)
    setPaymentSuccess(false)
    setPaymentMethod("")
  }

  const handleSelectTentativeBooking = (booking) => {
    setSelectedBooking(booking)
    setShowPaymentForm(true)
    setPaymentMethod("")
    setPhoneNumber("")
    setEmail("")
    setPaymentSuccess(false)
    setPaymentError(null)
    setActiveStep("payment")
  }

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false)
  }

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method)
  }

  const handleBookingSubmit = async () => {
    if (!selectedResponse || !paymentMethod) return null

    try {
      setIsSubmitting(true)
      setBookingError(null)

      const response = await fetch("http://localhost:3002/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          responseId: selectedResponse._id,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create booking")
      }

      const bookingData = await response.json()
      setBookingId(bookingData._id)
      setBookingSuccess("Booking created successfully! Please complete payment.")

      // Automatically transition to payment step
      setSelectedBooking(bookingData)
      setActiveStep("payment")

      // Refresh the bookings list
      setRefreshTrigger((prev) => prev + 1)

      return bookingData._id
    } catch (err) {
      console.error("Booking error:", err)
      setBookingError(err.message)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()

    if (!selectedBooking && !bookingId) {
      // If we're coming from the response card, create the booking first
      if (selectedResponse) {
        const newBookingId = await handleBookingSubmit()
        if (!newBookingId) return
      } else {
        setPaymentError("No booking selected")
        return
      }
    }

    const bookingIdToUse = bookingId || selectedBooking?._id

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

      const response = await fetch(`http://localhost:3002/bookings/${bookingIdToUse}/pay`, {
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
      setBookingSuccess("Payment processed successfully! Your booking is now confirmed.")

      // Refresh data after successful payment
      setTimeout(() => {
        setRefreshTrigger((prev) => prev + 1)
        setShowPaymentForm(false)

        // Redirect to the bookings page
        router.push("/bookings")
      }, 2000)

      return true
    } catch (err) {
      console.error("Payment error:", err)
      setPaymentError(err.message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your venue data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="booking-flow">
      <div className="header">
        <div className="header-content">
          <h1>Venue Booking Flow</h1>
          <p>Complete your venue booking process in a few simple steps</p>
        </div>
        <div className="user-info">
          {currentUser && (
            <>
              <div className="user-avatar">
                {currentUser.firstName?.charAt(0)}
                {currentUser.lastName?.charAt(0)}
              </div>
              <div className="user-details">
                <p className="user-name">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="user-email">{currentUser.email}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="booking-steps">
        <button
          className={`step-button ${activeStep === "responses" ? "active" : ""}`}
          onClick={() => setActiveStep("responses")}
        >
          1. Select Ground Request
        </button>
        <div className="step-divider"></div>
        <button
          className={`step-button ${activeStep === "tentative" ? "active" : ""}`}
          onClick={() => setActiveStep("tentative")}
        >
          2. View Bookings
        </button>
        <div className="step-divider"></div>
        <button
          className={`step-button ${activeStep === "payment" ? "active" : ""}`}
          onClick={() => (activeStep === "payment" ? null : setActiveStep("tentative"))}
        >
          3. Complete Payment
        </button>
      </div>

      <div className="content-container">
        {activeStep === "responses" && (
          <div className="responses-container">
            <div className="responses-header">
              <h2>Your Venue Responses</h2>
              <p>{userResponses.length} responses available</p>
            </div>

            {userResponses.length === 0 ? (
              <div className="no-responses">
                <div className="no-data-icon">📋</div>
                <h3>No Venue Responses Yet</h3>
                <p>Once venue owners respond to your requests, they will appear here.</p>
              </div>
            ) : (
              <div className="responses-grid">
                {userResponses.map((response) => (
                  <ResponseCard key={response._id} response={response} onBookNow={() => handleBookNow(response)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeStep === "tentative" && (
          <div className="tentative-container">
            <TentativeBookings onSelectBooking={handleSelectTentativeBooking} refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeStep === "payment" && selectedBooking && (
          <div className="payment-container">
            <div className="payment-header">
              <h2>Complete Your Payment</h2>
              <p>Finalize your booking by completing the payment</p>
            </div>

            <div className="booking-details">
              <h3>Booking Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Event</span>
                  <span className="detail-value">
                    {selectedBooking.response?.venueRequest?.eventName || "Unnamed Event"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">
                    {selectedBooking.response?.venueRequest?.venue?.name || "No venue"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount Due</span>
                  <span className="detail-value amount">{formatCurrency(selectedBooking.totalAmount)}</span>
                </div>
              </div>

              <button className="pay-now-button" onClick={() => setShowPaymentForm(true)}>
                Proceed to Payment
              </button>
            </div>
          </div>
        )}
      </div>

      {showPaymentForm && (selectedResponse || selectedBooking) && (
        <div className="payment-overlay" onClick={handleClosePaymentForm}>
          <div className="payment-form-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleClosePaymentForm}>
              ×
            </button>

            <div className="payment-form-header">
              <h2>Payment Details</h2>
              <div className="booking-info">
                <p className="event-name">
                  {selectedBooking?.response?.venueRequest?.eventName ||
                    selectedResponse?.venueRequest?.eventName ||
                    "Unnamed Event"}
                </p>
                <p className="venue-name">
                  {selectedBooking?.response?.venueRequest?.venue?.name ||
                    selectedResponse?.venueRequest?.venue?.name ||
                    "No venue"}
                </p>
                <p className="amount-due">
                  Amount Due: KES {(selectedBooking?.totalAmount || selectedResponse?.totalAmount)?.toLocaleString()}
                </p>
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

              {bookingError && <div className="error-message">{bookingError}</div>}
              {paymentError && <div className="error-message">{paymentError}</div>}
              {bookingSuccess && <div className="success-message">{bookingSuccess}</div>}
              {paymentSuccess && (
                <div className="success-message">Payment processed successfully! Your booking is now confirmed.</div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="pay-now-button"
                  disabled={!paymentMethod || isSubmitting || paymentSuccess}
                >
                  {isSubmitting
                    ? "Processing..."
                    : `Pay KES ${(selectedBooking?.totalAmount || selectedResponse?.totalAmount)?.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .booking-flow {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
        }

        /* Header styles */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-content p {
          color: #718096;
          font-size: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
        }

        .user-avatar {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: 1rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #2d3748;
        }

        .user-email {
          font-size: 0.875rem;
          color: #718096;
        }

        /* Booking steps */
        .booking-steps {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          background-color: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .step-button {
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          color: #718096;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .step-button.active {
          background-color: #6366f1;
          color: white;
        }

        .step-button:not(.active):hover {
          background-color: #f7fafc;
          color: #4a5568;
        }

        .step-divider {
          flex: 1;
          height: 2px;
          background-color: #e2e8f0;
          margin: 0 0.5rem;
        }

        /* Content container */
        .content-container {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          min-height: 400px;
        }

        /* Responses container */
        .responses-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .responses-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
        }

        .responses-header p {
          color: #718096;
          font-size: 0.875rem;
          background-color: #f7fafc;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
        }

        .responses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        /* No responses state */
        .no-responses {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .no-data-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-responses h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .no-responses p {
          color: #718096;
          max-width: 400px;
        }

        /* Payment container */
        .payment-container {
          padding: 1rem;
        }

        .payment-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .payment-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .payment-header p {
          color: #718096;
        }

        .booking-details {
          max-width: 600px;
          margin: 0 auto;
          background-color: #f7fafc;
          padding: 2rem;
          border-radius: 0.75rem;
        }

        .booking-details h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-label {
          color: #718096;
          font-size: 0.875rem;
        }

        .detail-value {
          font-weight: 500;
          color: #2d3748;
          text-align: right;
        }

        .detail-value.amount {
          font-size: 1.125rem;
          font-weight: 700;
          color: #6366f1;
        }

        .pay-now-button {
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          text-align: center;
        }

        .pay-now-button:hover {
          opacity: 0.9;
        }

        .pay-now-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Payment overlay */
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
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
          margin-top102,241,0.1);
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

        /* Loading state */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid rgba(99, 102, 241, 0.1);
          border-left-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-container p {
          color: #718096;
        }

        /* Error state */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }

        .error-icon {
          width: 4rem;
          height: 4rem;
          background-color: #fed7d7;
          color: #e53e3e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .error-container h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .error-container p {
          color: #718096;
          margin-bottom: 1.5rem;
        }

        .error-container button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .error-container button:hover {
          opacity: 0.9;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .booking-flow {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .user-info {
            margin-top: 1rem;
          }

          .booking-steps {
            flex-direction: column;
            gap: 0.5rem;
          }

          .step-button {
            width: 100%;
            text-align: left;
          }

          .step-divider {
            width: 100%;
            height: 1px;
            margin: 0.25rem 0;
          }

          .content-container {
            padding: 1.5rem 1rem;
          }

          .responses-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .responses-header p {
            margin-top: 0.5rem;
          }

          .responses-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

