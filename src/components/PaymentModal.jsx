import { useState, useEffect } from "react"
import { X, CreditCard, Phone, Mail, Check } from "lucide-react"

const PaymentModal = ({ isOpen, onClose, eventId }) => {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("Regular")
  const [quantity, setQuantity] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:3002/tickets")
        if (!response.ok) {
          throw new Error("Failed to fetch tickets")
        }
        const data = await response.json()
        setTickets(data)

        const eventTicket = data.find((ticket) => ticket.eventId._id === eventId)
        if (eventTicket) {
          setSelectedTicket(eventTicket)
        }

        setLoading(false)
      } catch (err) {
        setError("Error loading tickets. Please try again.")
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchTickets()
    }
  }, [isOpen, eventId])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    // Reset quantity when changing category
    setQuantity(1)
  }

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (value > 0 && selectedTicket && selectedTicket.categories[selectedCategory]) {
      const maxAvailable = selectedTicket.categories[selectedCategory].count
      setQuantity(Math.min(value, maxAvailable))
    }
  }

  const calculateTotal = () => {
    if (!selectedTicket) return 0
    const price = selectedTicket.categories[selectedCategory]?.price || 0
    return price * quantity
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedTicket) return

    try {
      setIsSubmitting(true)
      setPaymentError(null)

      const payload = {
        ticketId: selectedTicket._id,
        category: selectedCategory,
        quantity,
        paymentMethod: "M-Pesa",
        phoneNumber,
        email,
      }

      const response = await fetch("http://localhost:3002/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Payment failed. Please try again.")
      }

      setPaymentSuccess(true)
      // Reset form after successful payment
      setTimeout(() => {
        setPaymentSuccess(false)
        onClose()
      }, 3000)
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading ticket information...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : !selectedTicket ? (
          <div className="error-message">
            <p>No tickets available for this event.</p>
          </div>
        ) : paymentSuccess ? (
          <div className="success-message">
            <div className="success-icon">
              <Check size={50} color="#4CAF50" />
            </div>
            <h3>Payment Successful!</h3>
            <p>Your ticket has been reserved. Check your email for details.</p>
          </div>
        ) : (
          <div className="payment-content">
            <h2>Purchase Tickets</h2>
            <h3>{selectedTicket.eventId.bookingId.response.venueRequest.eventName}</h3>

            <div className="event-details">
              <p>
                <strong>Venue:</strong> {selectedTicket.eventId.bookingId.response.venueRequest.venue.name},{" "}
                {selectedTicket.eventId.bookingId.response.venueRequest.venue.location}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedTicket.eventId.bookingId.response.venueRequest.eventDates[0]).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h4>Select Ticket Category</h4>
                <div className="ticket-categories">
                  {Object.entries(selectedTicket.categories).map(([category, details]) => (
                    <div
                      key={category}
                      className={`ticket-category ${selectedCategory === category ? "selected" : ""} ${details.count === 0 ? "sold-out" : ""}`}
                      onClick={() => details.count > 0 && handleCategoryChange(category)}
                    >
                      <div className="category-name">{category}</div>
                      <div className="category-price">${details.price}</div>
                      <div className="category-availability">
                        {details.count > 0 ? `${details.count} available` : "Sold Out"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h4>Ticket Quantity</h4>
                <div className="quantity-selector">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    max={selectedTicket.categories[selectedCategory].count}
                  />
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => {
                      const maxAvailable = selectedTicket.categories[selectedCategory].count
                      if (quantity < maxAvailable) {
                        setQuantity(quantity + 1)
                      }
                    }}
                    disabled={quantity >= selectedTicket.categories[selectedCategory].count}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h4>Contact Information</h4>
                <div className="form-group">
                  <label htmlFor="phoneNumber">
                    <Phone size={16} />
                    Phone Number (M-Pesa)
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    placeholder="2547XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    pattern="254[0-9]{9}"
                    title="Please enter a valid phone number starting with 254"
                  />
                  <small>Format: 254XXXXXXXXX (Kenyan number)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="payment-summary">
                <div className="summary-row">
                  <span>Ticket Type:</span>
                  <span>{selectedCategory}</span>
                </div>
                <div className="summary-row">
                  <span>Price per Ticket:</span>
                  <span>KSH {selectedTicket.categories[selectedCategory].price}</span>
                </div>
                <div className="summary-row">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>KSH {calculateTotal()}</span>
                </div>
              </div>

              {paymentError && (
                <div className="payment-error">
                  <p>{paymentError}</p>
                </div>
              )}

              <div className="payment-method">
                <div className="payment-method-header">
                  <CreditCard size={20} />
                  <span>Payment Method: M-Pesa</span>
                </div>
                <p className="payment-note">You will receive an M-Pesa prompt on your phone to complete the payment.</p>
              </div>

              <button type="submit" className="pay-button" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Pay KSH ${calculateTotal()}`}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .payment-modal {
          background-color: white;
          border-radius: 10px;
          width: 100%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          animation: modalFadeIn 0.3s forwards;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 10;
          color: #555;
          transition: color 0.2s;
        }
        
        .close-button:hover {
          color: #000;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #6a11cb;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 15px;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .error-message, .success-message {
          padding: 40px;
          text-align: center;
        }
        
        .error-message p {
          color: #e74c3c;
          margin-bottom: 20px;
        }
        
        .error-message button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .success-message {
          color: #2ecc71;
        }
        
        .success-icon {
          margin-bottom: 20px;
        }
        
        .success-message h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .payment-content {
          padding: 30px;
        }
        
        .payment-content h2 {
          font-size: 24px;
          margin-bottom: 5px;
          color: #2c3e50;
        }
        
        .payment-content h3 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #6a11cb;
        }
        
        .event-details {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        
        .event-details p {
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .form-section {
          margin-bottom: 25px;
        }
        
        .form-section h4 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #333;
          position: relative;
          padding-bottom: 8px;
        }
        
        .form-section h4::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #6a11cb, #2575fc);
        }
        
        .ticket-categories {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        
        .ticket-category {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .ticket-category:hover:not(.sold-out) {
          border-color: #6a11cb;
          transform: translateY(-2px);
        }
        
        .ticket-category.selected {
          border-color: #6a11cb;
          background-color: rgba(106, 17, 203, 0.05);
        }
        
        .ticket-category.sold-out {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f5f5f5;
        }
        
        .category-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .category-price {
          font-size: 18px;
          color: #6a11cb;
          margin-bottom: 5px;
        }
        
        .category-availability {
          font-size: 12px;
          color: #777;
        }
        
        .quantity-selector {
          display: flex;
          align-items: center;
          max-width: 150px;
        }
        
        .quantity-btn {
          width: 40px;
          height: 40px;
          background-color: #f0f4f8;
          border: 1px solid #ddd;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        .quantity-btn:first-child {
          border-radius: 5px 0 0 5px;
        }
        
        .quantity-btn:last-child {
          border-radius: 0 5px 5px 0;
        }
        
        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .quantity-selector input {
          width: 70px;
          height: 40px;
          border: 1px solid #ddd;
          border-left: none;
          border-right: none;
          text-align: center;
          font-size: 16px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        
        .form-group small {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          color: #777;
        }
        
        .payment-summary {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .summary-row.total {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-weight: bold;
          font-size: 18px;
        }
        
        .payment-error {
          background-color: #ffebee;
          color: #e53935;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .payment-method {
          margin-bottom: 25px;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .payment-method-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          font-weight: 500;
        }
        
        .payment-note {
          font-size: 14px;
          color: #666;
        }
        
        .pay-button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.3s, transform 0.2s;
        }
        
        .pay-button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-2px);
        }
        
        .pay-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @media (max-width: 600px) {
          .ticket-categories {
            grid-template-columns: 1fr;
          }
          
          .payment-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default PaymentModal

