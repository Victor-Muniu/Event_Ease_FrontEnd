import { useState, useEffect } from "react"
import { Search, Download, Calendar } from "lucide-react"
import axios from "axios"
export default function PaymentHistory() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All Payment Methods")

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await axios.get("http://localhost:3002/deposits", { withCredentials: true })
        setDeposits(response.data) 
        setLoading(false)
      } catch (error) {
        console.error("Error fetching deposits:", error)
        setLoading(false)
      }
    }
  
    fetchDeposits()
  }, [])

  const calculateTotals = () => {
    let total = 0
    let pending = 0
    let completed = 0

    deposits.forEach((deposit) => {
      const amount = deposit.amountPaid
      total += amount
      if (deposit.paymentStatus === "Pending") {
        pending += amount
      } else {
        completed += amount
      }
    })

    return { total, pending, completed }
  }

  const { total, pending, completed } = calculateTotals()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Payment History</h1>
        <button className="export-btn">
          <span>Export</span>
        </button>
      </div>

      <div className="filters">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option>All Status</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>

        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="filter-select"
        >
          <option>All Payment Methods</option>
          <option>PayPal</option>
          <option>Credit Card</option>
        </select>

        <div className="date-picker">
          <input type="date" className="date-input" />
          <Calendar className="calendar-icon" />
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-content">
            <div>
              <p className="card-label">Total Payments</p>
              <h2 className="card-amount">{formatAmount(total)}</h2>
            </div>
            <div className="card-icon total">$</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <div>
              <p className="card-label">Pending Payments</p>
              <h2 className="card-amount">{formatAmount(pending)}</h2>
            </div>
            <div className="card-icon pending">!</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <div>
              <p className="card-label">Completed Payments</p>
              <h2 className="card-amount">{formatAmount(completed)}</h2>
            </div>
            <div className="card-icon completed">✓</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>TRANSACTION ID</th>
              <th>EVENT</th>
              <th>AMOUNT</th>
              <th>METHOD</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit, index) => (
              <tr key={deposit._id}>
                <td>#{`TRX-${2025}${String(index + 1).padStart(3, "0")}`}</td>
                <td>
                  <div className="event-details">
                    <div className="event-name">{deposit.eventRequest.eventGround.name}</div>
                    <div className="event-venue">{deposit.eventRequest.eventGround.name}</div>
                  </div>
                </td>
                <td>{formatAmount(deposit.amountPaid)}</td>
                <td>
                  <div className="payment-method">
                    {deposit.paymentMethod === "PayPal" ? (
                      <span className="paypal">PayPal</span>
                    ) : (
                      <span className="credit-card">Credit Card</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status ${deposit.paymentStatus.toLowerCase()}`}>{deposit.paymentStatus}</span>
                </td>
                <td>{formatDate(deposit.paidAt)}</td>
                <td>
                  <button className="download-btn">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .export-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #1a1a1a;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-container {
          flex: 1;
          position: relative;
          min-width: 200px;
        }

        .search-container input {
          width: 90%;
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          width: 16px;
          height: 16px;
        }

        .filter-select {
          padding: 0.5rem 2rem 0.5rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          min-width: 150px;
          appearance: none;
          cursor: pointer;
        }

        .date-picker {
          position: relative;
        }

        .date-input {
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          min-width: 150px;
        }

        .calendar-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          width: 16px;
          height: 16px;
          pointer-events: none;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .card-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-label {
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .card-amount {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .card-icon.total {
          background-color: #e8f0fe;
          color: #1a73e8;
        }

        .card-icon.pending {
          background-color: #fff3dc;
          color: #b25e09;
        }

        .card-icon.completed {
          background-color: #dcfce7;
          color: #166534;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 1rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #666;
          border-bottom: 1px solid #e0e0e0;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .event-details {
          display: flex;
          flex-direction: column;
        }

        .event-name {
          font-weight: 500;
          color: #1a1a1a;
        }

        .event-venue {
          font-size: 0.875rem;
          color: #666;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .paypal, .credit-card {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .paypal {
          background-color: #e8f0fe;
          color: #1a73e8;
        }

        .credit-card {
          background-color: #f3f4f6;
          color: #1f2937;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
        }

        .status.pending {
          background-color: #fff3dc;
          color: #b25e09;
        }

        .status.completed {
          background-color: #dcfce7;
          color: #166534;
        }

        .download-btn {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #1a73e8;
        }

        .download-btn:hover {
          color: #1557b0;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .filters {
            flex-direction: column;
          }

          .search-container,
          .filter-select,
          .date-picker {
            width: 100%;
          }

          .table-container {
            margin: 0 -1rem;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  )
}

