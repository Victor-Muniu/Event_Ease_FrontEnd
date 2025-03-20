import { useState } from "react";
import { formatDate, formatCurrency } from "../utils/Formatters";

export default function BookingModal({
  response,
  onClose,
  onBookingSubmit,
  onPaymentSubmit,
  bookingSuccess,
  bookingError,
  bookingId,
  paymentSuccess,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const venue = response.venueRequest?.venue;
  const eventName = response.venueRequest?.eventName;
  const eventDates = response.venueRequest?.eventDates || [];
  const totalAmount = response.totalAmount;

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMethod) return;

    setIsSubmitting(true);
    const newBookingId = await onBookingSubmit(paymentMethod);
    setIsSubmitting(false);

    if (newBookingId) {
      setCurrentStep(2);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    let paymentDetails = {};

    if (paymentMethod === "M-Pesa") {
      if (!phoneNumber || !phoneNumber.match(/^254\d{9}$/)) {
        alert("Please enter a valid phone number in the format 254XXXXXXXXX");
        return;
      }
      paymentDetails = {
        paymentMethod: "M-Pesa",
        phoneNumber,
      };
    } else if (paymentMethod === "PayPal") {
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email address");
        return;
      }
      paymentDetails = {
        paymentMethod: "PayPal",
        email,
      };
    }

    setIsSubmitting(true);
    const success = await onPaymentSubmit(paymentDetails);
    setIsSubmitting(false);

    if (success) {
      setCurrentStep(3);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>Book Venue: {eventName}</h2>
          <div className="booking-steps">
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <div className="step-label">Booking Details</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <div className="step-label">Payment</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>
        </div>

        <div className="modal-content">
          {currentStep === 1 && (
            <div className="booking-details-step">
              <div className="booking-summary">
                <h3>Booking Summary</h3>

                <div className="summary-item">
                  <span className="summary-label">Event</span>
                  <span className="summary-value">{eventName}</span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Venue</span>
                  <span className="summary-value">
                    {venue ? venue.name : "No Venue"}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Location</span>
                  <span className="summary-value">
                    {venue ? venue.location : "No Location"}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Dates</span>
                  <div className="summary-dates">
                    {eventDates.map((date, index) => (
                      <div key={index} className="summary-date">
                        {formatDate(date)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summary-item total">
                  <span className="summary-label">Total Amount</span>
                  <span className="summary-value">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="payment-method-selection">
                <h3>Select Payment Method</h3>

                <div className="payment-methods">
                  <div
                    className={`payment-method ${
                      paymentMethod === "M-Pesa" ? "selected" : ""
                    }`}
                    onClick={() => handlePaymentMethodSelect("M-Pesa")}
                  >
                    <div className="payment-icon mpesa">M</div>
                    <div className="payment-info">
                      <p className="payment-name">M-Pesa</p>
                      <p className="payment-description">
                        Pay using your M-Pesa mobile money
                      </p>
                    </div>
                  </div>

                  <div
                    className={`payment-method ${
                      paymentMethod === "PayPal" ? "selected" : ""
                    }`}
                    onClick={() => handlePaymentMethodSelect("PayPal")}
                  >
                    <div className="payment-icon paypal">P</div>
                    <div className="payment-info">
                      <p className="payment-name">PayPal</p>
                      <p className="payment-description">
                        Pay using your PayPal account
                      </p>
                    </div>
                  </div>
                </div>

                {bookingError && (
                  <div className="error-message">{bookingError}</div>
                )}

                <div className="action-buttons">
                  <button className="cancel-button" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    className="continue-button"
                    disabled={!paymentMethod || isSubmitting}
                    onClick={handleBookingSubmit}
                  >
                    {isSubmitting ? "Processing..." : "Continue to Payment"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="payment-details-step">
              <div className="payment-form">
                <h3>Complete Payment</h3>

                {bookingSuccess && (
                  <div className="success-message">{bookingSuccess}</div>
                )}

                <form onSubmit={handlePaymentSubmit}>
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
                      <p className="input-help">
                        Enter your phone number in the format 254XXXXXXXXX
                      </p>
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

                  {bookingError && (
                    <div className="error-message">{bookingError}</div>
                  )}

                  <div className="payment-summary">
                    <div className="summary-row">
                      <span>Payment Method</span>
                      <span>{paymentMethod}</span>
                    </div>
                    <div className="summary-row">
                      <span>Amount</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Booking ID</span>
                      <span>{bookingId}</span>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="pay-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Processing..."
                        : `Pay ${formatCurrency(totalAmount)}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="confirmation-step">
              <div className="confirmation-icon">✓</div>
              <h3>Booking Confirmed!</h3>
              <p>Your venue has been successfully booked for your event.</p>

              <div className="confirmation-details">
                <div className="confirmation-item">
                  <span className="confirmation-label">Event</span>
                  <span className="confirmation-value">{eventName}</span>
                </div>

                <div className="confirmation-item">
                  <span className="confirmation-label">Venue</span>
                  <span className="confirmation-value">
                    {venue ? venue.name : "No Venue"}
                  </span>
                </div>

                <div className="confirmation-item">
                  <span className="confirmation-label">Dates</span>
                  <div className="confirmation-dates">
                    {eventDates.map((date, index) => (
                      <div key={index} className="confirmation-date">
                        {formatDate(date)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="confirmation-item">
                  <span className="confirmation-label">Payment Method</span>
                  <span className="confirmation-value">{paymentMethod}</span>
                </div>

                <div className="confirmation-item">
                  <span className="confirmation-label">Amount Paid</span>
                  <span className="confirmation-value">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="confirmation-item">
                  <span className="confirmation-label">Booking ID</span>
                  <span className="confirmation-value">{bookingId}</span>
                </div>
              </div>

              <div className="next-steps">
                <h4>Next Steps</h4>
                <p>
                  You can now proceed to create your event using this booked
                  venue.
                </p>
                <button className="create-event-button">Create Event</button>
              </div>

              <button className="close-confirmation" onClick={onClose}>
                Close
              </button>
            </div>
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
          z-index: 1000;
          padding: 1rem;
        }

        .modal-container {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 800px;
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

        .modal-header {
          padding: 2rem 2rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1.5rem;
        }

        .booking-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 33.333%;
        }

        .step-number {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background-color: #e2e8f0;
          color: #718096;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: background-color 0.3s, color 0.3s;
        }

        .step.active .step-number {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .step-label {
          font-size: 0.875rem;
          color: #718096;
          transition: color 0.3s;
        }

        .step.active .step-label {
          color: #2d3748;
          font-weight: 500;
        }

        .step-connector {
          flex-grow: 1;
          height: 2px;
          background-color: #e2e8f0;
          margin: 0 0.5rem;
          position: relative;
          top: -1rem;
        }

        .modal-content {
          padding: 2rem;
        }

        /* Booking Details Step */
        .booking-details-step {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .booking-summary {
          background-color: #f7fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .booking-summary h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .summary-label {
          color: #718096;
          font-size: 0.875rem;
        }

        .summary-value {
          font-weight: 500;
          color: #2d3748;
          text-align: right;
        }

        .summary-dates {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .summary-date {
          font-size: 0.875rem;
          color: #2d3748;
        }

        .summary-item.total {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px dashed #cbd5e0;
        }

        .summary-item.total .summary-label {
          font-weight: 600;
          color: #2d3748;
        }

        .summary-item.total .summary-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #6366f1;
        }

        .payment-method-selection h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.5rem;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .payment-method {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: border-color 0.3s, background-color 0.3s;
        }

        .payment-method:hover {
          border-color: #cbd5e0;
        }

        .payment-method.selected {
          border-color: #6366f1;
          background-color: #f5f7ff;
        }

        .payment-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.5rem;
          margin-right: 1rem;
          color: white;
        }

        .payment-icon.mpesa {
          background-color: #4caf50;
        }

        .payment-icon.paypal {
          background-color: #0070ba;
        }

        .payment-name {
          font-weight: 600;
          color: #2d3748;
        }

        .payment-description {
          font-size: 0.875rem;
          color: #718096;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          background-color: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .cancel-button:hover {
          background-color: #edf2f7;
        }

        .continue-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .continue-button:hover {
          opacity: 0.9;
        }

        .continue-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Payment Details Step */
        .payment-form {
          max-width: 500px;
          margin: 0 auto;
        }

        .payment-form h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.5rem;
          text-align: center;
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

        .payment-summary {
          background-color: #f7fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin: 2rem 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .summary-row:last-child {
          margin-bottom: 0;
        }

        .back-button {
          padding: 0.75rem 1.5rem;
          background-color: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background-color: #edf2f7;
        }

        .pay-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .pay-button:hover {
          opacity: 0.9;
        }

        .pay-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-message {
          background-color: #c6f6d5;
          color: #2f855a;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .error-message {
          background-color: #fed7d7;
          color: #e53e3e;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        /* Confirmation Step */
        .confirmation-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .confirmation-icon {
          width: 5rem;
          height: 5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .confirmation-step h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .confirmation-step > p {
          color: #718096;
          margin-bottom: 2rem;
        }

        .confirmation-details {
          background-color: #f7fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
          width: 100%;
          max-width: 500px;
          margin-bottom: 2rem;
        }

        .confirmation-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          text-align: left;
        }

        .confirmation-label {
          color: #718096;
          font-size: 0.875rem;
        }

        .confirmation-value {
          font-weight: 500;
          color: #2d3748;
        }

        .confirmation-dates {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .confirmation-date {
          font-size: 0.875rem;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .next-steps {
          background-color: #f0fff4;
          padding: 1.5rem;
          border-radius: 0.75rem;
          width: 100%;
          max-width: 500px;
          margin-bottom: 2rem;
        }

        .next-steps h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .next-steps p {
          color: #718096;
          margin-bottom: 1rem;
        }

        .create-event-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .create-event-button:hover {
          opacity: 0.9;
        }

        .close-confirmation {
          padding: 0.75rem 1.5rem;
          background-color: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .close-confirmation:hover {
          background-color: #edf2f7;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .booking-details-step {
            grid-template-columns: 1fr;
          }

          .modal-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .modal-content {
            padding: 1.5rem;
          }

          .step-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
