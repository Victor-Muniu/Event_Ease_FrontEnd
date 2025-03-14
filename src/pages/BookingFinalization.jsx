import { useState, useEffect } from "react";
import ResponseCard from "../components/ResponseCard";
import BookingModal from "../components/BookingModal";

export default function BookingFinalization() {
  const [responses, setResponses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch responses and current user in parallel
        const [responsesRes, userRes] = await Promise.all([
          fetch("http://localhost:3002/venue-request-responses"),
          fetch("http://localhost:3002/current-user", {
            credentials: "include",
          }),
        ]);

        if (!responsesRes.ok) throw new Error("Failed to fetch responses");
        if (!userRes.ok) throw new Error("Failed to fetch user data");

        const responsesData = await responsesRes.json();
        const userData = await userRes.json();

        setResponses(responsesData);
        setCurrentUser(userData.user);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter responses for current user
  const userResponses = currentUser
    ? responses.filter(
        (response) => response.venueRequest?.organizer?._id === currentUser.id
      )
    : [];

  const handleBookNow = (response) => {
    setSelectedResponse(response);
    setShowModal(true);
    setBookingSuccess(null);
    setBookingError(null);
    setPaymentSuccess(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResponse(null);
    setBookingId(null);
  };

  const handleBookingSubmit = async (paymentMethod) => {
    try {
      setBookingError(null);

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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const bookingData = await response.json();
      setBookingId(bookingData._id);
      setBookingSuccess(
        "Booking created successfully! Please complete payment."
      );

      return bookingData._id;
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(err.message);
      return null;
    }
  };

  const handlePaymentSubmit = async (paymentDetails) => {
    try {
      setBookingError(null);

      const response = await fetch(
        `http://localhost:3002/bookings/${bookingId}/pay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(paymentDetails),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }

      setPaymentSuccess(true);
      setBookingSuccess(
        "Payment processed successfully! Your booking is now confirmed."
      );

      // Refresh responses after successful payment
      const newResponsesRes = await fetch(
        "http://localhost:3002/venue-request-responses"
      );
      if (newResponsesRes.ok) {
        const newResponsesData = await newResponsesRes.json();
        setResponses(newResponsesData);
      }

      return true;
    } catch (err) {
      console.error("Payment error:", err);
      setBookingError(err.message);
      return false;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your venue responses...</p>
      </div>
    );
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
    );
  }

  return (
    <div className="booking-finalization">
      <div className="header">
        <div className="header-content">
          <h1>Finalize Your Venue Booking</h1>
          <p>
            Review and confirm your venue requests to proceed with event
            creation
          </p>
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

      <div className="responses-container">
        <div className="responses-header">
          <h2>Your Venue Responses</h2>
          <p>{userResponses.length} responses available</p>
        </div>

        {userResponses.length === 0 ? (
          <div className="no-responses">
            <div className="no-data-icon">📋</div>
            <h3>No Venue Responses Yet</h3>
            <p>
              Once venue owners respond to your requests, they will appear here.
            </p>
          </div>
        ) : (
          <div className="responses-grid">
            {userResponses.map((response) => (
              <ResponseCard
                key={response._id}
                response={response}
                onBookNow={() => handleBookNow(response)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && selectedResponse && (
        <BookingModal
          response={selectedResponse}
          onClose={handleCloseModal}
          onBookingSubmit={handleBookingSubmit}
          onPaymentSubmit={handlePaymentSubmit}
          bookingSuccess={bookingSuccess}
          bookingError={bookingError}
          bookingId={bookingId}
          paymentSuccess={paymentSuccess}
        />
      )}
      <style jsx>{`
        /* Base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background-color: #f5f7fa;
          color: #333;
          line-height: 1.6;
        }

        .booking-finalization {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
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

        /* Responses container */
        .responses-container {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 2rem;
        }

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
          .booking-finalization {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .user-info {
            margin-top: 1rem;
          }

          .responses-container {
            padding: 1.5rem;
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
  );
}
