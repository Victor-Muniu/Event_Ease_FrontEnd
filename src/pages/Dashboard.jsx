import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, DollarSign, Users, Award } from "lucide-react";

const Dashboard = () => {
  // Dummy data
  const revenueData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 4500 },
    { name: "May", revenue: 6000 },
    { name: "Jun", revenue: 5500 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      name: "Summer Music Festival",
      date: "2025-07-15",
      attendees: 5000,
    },
    {
      id: 2,
      name: "Tech Conference 2025",
      date: "2025-08-22",
      attendees: 2000,
    },
    { id: 3, name: "Food & Wine Expo", date: "2025-09-10", attendees: 3000 },
  ];

  const recentSales = [
    { id: 1, event: "Summer Music Festival", quantity: 2, total: 150 },
    { id: 2, event: "Tech Conference 2025", quantity: 1, total: 299 },
    { id: 3, event: "Food & Wine Expo", quantity: 4, total: 196 },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>EventEase Dashboard</h1>
        <div className="quick-stats">
          <div className="stat-card">
            <Calendar size={24} />
            <span>12 Upcoming Events</span>
          </div>
          <div className="stat-card">
            <Users size={24} />
            <span>1,234 Total Attendees</span>
          </div>
          <div className="stat-card">
            <DollarSign size={24} />
            <span>$45,678 Revenue</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <main className="main-content">
          <section className="upcoming-events">
            <h2>Upcoming Events</h2>
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>{event.name}</h3>
                  <p>
                    <Calendar size={16} /> {event.date}
                  </p>
                  <p>
                    <Users size={16} /> {event.attendees} attendees
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="revenue-chart">
            <h2>Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="recent-sales">
            <h2>Recent Ticket Sales</h2>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.event}</td>
                    <td>{sale.quantity}</td>
                    <td>${sale.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>

        <aside className="dashboard-sidebar">
          <section className="attendee-demographics">
            <h2>Attendee Demographics</h2>
            <div className="demographic-chart">
              {/* Placeholder for demographic chart */}
              <div className="placeholder-chart"></div>
            </div>
          </section>

          <section className="top-events">
            <h2>Top Selling Events</h2>
            <ul>
              <li>
                <Award size={16} /> Summer Music Festival
              </li>
              <li>
                <Award size={16} /> Tech Conference 2025
              </li>
              <li>
                <Award size={16} /> Food & Wine Expo
              </li>
            </ul>
          </section>
        </aside>
      </div>
      <style jsx>{`
        .dashboard {
          font-family: "Inter", sans-serif;
          background-color: #f0f2f5;
          min-height: 100vh;
          padding: 2rem;
          color: #333;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          border-radius: 12px;
          padding: 2rem;
          color: white;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h1 {
          margin: 0 0 1rem 0;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .quick-stats {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .stat-card {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .dashboard-content {
          display: flex;
          gap: 2rem;
        }

        .main-content {
          flex: 3;
        }

        .dashboard-sidebar {
          flex: 1;
        }

        .upcoming-events,
        .revenue-chart,
        .recent-sales,
        .attendee-demographics,
        .top-events {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: #4a4a4a;
        }

        .events-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .event-card {
          background: linear-gradient(135deg, #f6d365, #fda085);
          border-radius: 8px;
          padding: 1rem;
          color: white;
          transition: transform 0.3s ease;
        }

        .event-card:hover {
          transform: scale(1.05);
        }

        .event-card h3 {
          margin: 0 0 0.5rem 0;
        }

        .event-card p {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }

        .placeholder-chart {
          height: 200px;
          background: linear-gradient(135deg, #84fab0, #8fd3f4);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .top-events ul {
          list-style-type: none;
          padding: 0;
        }

        .top-events li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .top-events li:last-child {
          border-bottom: none;
        }

        @media (max-width: 1024px) {
          .dashboard-content {
            flex-direction: column;
          }

          .main-content,
          .dashboard-sidebar {
            flex: auto;
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 1rem;
          }

          .quick-stats {
            flex-direction: column;
          }

          .events-list {
            grid-template-columns: 1fr;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-header,
        .upcoming-events,
        .revenue-chart,
        .recent-sales,
        .attendee-demographics,
        .top-events {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
