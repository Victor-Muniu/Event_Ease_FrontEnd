import { useEffect } from "react";

export default function QuotationPage({ quotationData, onBack }) {
  // Add print functionality
  useEffect(() => {
    const handlePrint = () => {
      window.print();
    };

    const printButton = document.querySelector(".print-button");
    printButton?.addEventListener("click", handlePrint);

    return () => {
      printButton?.removeEventListener("click", handlePrint);
    };
  }, []);

  return (
    <div className="quotation-container">
      <div className="quotation-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <button className="print-button">Print Quotation</button>
      </div>

      <div className="quotation-document">
        <div className="quotation-top">
          <div className="quotation-sender">
            <div className="avatar">
              {quotationData.customer.name.charAt(0)}
            </div>
            <div className="sender-info">
              <h2>{quotationData.customer.name}</h2>
              <p>{quotationData.customer.email}</p>
            </div>
          </div>

          <div className="quotation-meta">
            <div className="meta-item">
              <h3>Quotation No</h3>
              <p className="meta-value">{quotationData.quotationNo}</p>
            </div>
            <div className="meta-item">
              <h3>Created On</h3>
              <p className="meta-value">{quotationData.createdOn}</p>
            </div>
          </div>
        </div>

        <div className="quotation-addresses">
          <div className="address-block">
            <h3>From</h3>
            <p className="address-name">{quotationData.from.name}</p>
          </div>

          <div className="address-block">
            <h3>To</h3>
            <p className="address-name">{quotationData.to.name}</p>
            <p>{quotationData.to.address}</p>
            <p>{quotationData.to.location}</p>
          </div>
        </div>

        <div className="customer-note">
          <span className="note-icon">ℹ</span>
          <p>Customer Note: {quotationData.note}</p>
        </div>

        <div className="quotation-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Service</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Dates</th>
                <th>PO</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotationData.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <span className="item-type">
                      {item.type === "Venue" ? "🏢" : "🎛️"} {item.type}
                    </span>
                  </td>
                  <td>{item.service}</td>
                  <td>
                    <span className="flag">🇰🇪</span> {item.origin}
                  </td>
                  <td>
                    <span className="flag">🇰🇪</span> {item.destination}
                  </td>
                  <td>{item.date}</td>
                  <td>{item.po}</td>
                  <td className="amount">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="quotation-summary">
          <div className="summary-row">
            <span>Sub Total</span>
            <span>{quotationData.subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Tax ({quotationData.tax.percentage}%)</span>
            <span>{quotationData.tax.amount}</span>
          </div>
          <div className="summary-row">
            <span>Dis ({quotationData.discount.percentage}%)</span>
            <span>{quotationData.discount.amount}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{quotationData.total}</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .quotation-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .quotation-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .back-button,
        .print-button {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button {
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }

        .back-button:hover {
          background-color: #e2e8f0;
        }

        .print-button {
          background-color: #3b82f6;
          color: white;
          border: none;
        }

        .print-button:hover {
          background-color: #2563eb;
        }

        .quotation-document {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 3rem;
        }

        .quotation-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3rem;
          gap: 2rem;
        }

        .quotation-sender {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 3.5rem;
          height: 3.5rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .sender-info h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .sender-info p {
          color: #64748b;
        }

        .quotation-meta {
          text-align: right;
        }

        .meta-item {
          margin-bottom: 1rem;
        }

        .meta-item h3 {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .meta-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .quotation-addresses {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .address-block {
          flex: 1;
        }

        .address-block h3 {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .address-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .address-block p {
          color: #475569;
          margin-bottom: 0.25rem;
        }

        .customer-note {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background-color: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }

        .note-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          font-weight: bold;
        }

        .customer-note p {
          color: #475569;
          flex: 1;
        }

        .quotation-table {
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .quotation-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .quotation-table th {
          background-color: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e2e8f0;
        }

        .quotation-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .item-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .flag {
          margin-right: 0.25rem;
        }

        .amount {
          font-weight: 600;
          color: #0f766e;
        }

        .quotation-summary {
          width: 100%;
          max-width: 400px;
          margin-left: auto;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .summary-row.total {
          font-weight: 700;
          font-size: 1.25rem;
          color: #1e293b;
          border-bottom: none;
          padding-top: 1.5rem;
        }

        @media print {
          .quotation-header {
            display: none;
          }

          .quotation-container {
            padding: 0;
            background: none;
          }

          .quotation-document {
            box-shadow: none;
            border-radius: 0;
          }
        }

        @media (max-width: 768px) {
          .quotation-container {
            padding: 1rem;
          }

          .quotation-document {
            padding: 1.5rem;
          }

          .quotation-top {
            flex-direction: column;
          }

          .quotation-meta {
            text-align: left;
          }

          .quotation-addresses {
            flex-direction: column;
          }

          .quotation-header {
            flex-direction: column;
          }

          .back-button,
          .print-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
