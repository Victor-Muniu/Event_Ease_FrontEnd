import React from "react";
import MetricCard from "../components/MetricCard";
import EventsTable from "../components/EventsTable";
import RecentMessages from "../components/RecentMessages";
import RecentActivities from "../components/RecentActivities";
import {
  Calendar,
  MessageSquare,
  DollarSign,
  CalendarIcon,
} from "lucide-react";

const mockEvents = [
  {
    name: "Tech Innovators Conference",
    date: "March 15, 2025",
    location: "Convention Center",
    status: "Confirmed",
  },
  {
    name: "Digital Marketing Summit",
    date: "April 2, 2025",
    location: "Grand Hotel",
    status: "Pending",
  },
  {
    name: "Startup Networking Event",
    date: "April 15, 2025",
    location: "Innovation Hub",
    status: "In Progress",
  },
];

const mockMessages = [
  {
    id: 1,
    avatar: "/placeholder.svg?height=40&width=40",
    name: "John Doe",
    message: "Question about the Tech Conference venue capacity...",
    time: "2h ago",
  },
  {
    id: 2,
    avatar: "/placeholder.svg?height=40&width=40",
    name: "Sarah Wilson",
    message: "Updated the speaker list for tomorrow's event...",
    time: "5h ago",
  },
  {
    id: 3,
    avatar: "/placeholder.svg?height=40&width=40",
    name: "Mike Johnson",
    message: "Catering confirmation for next week's workshop...",
    time: "1d ago",
  },
];

const mockActivities = [
  {
    id: 1,
    type: "create",
    title: "New event created: Digital Marketing Workshop",
    time: "10 minutes ago",
  },
  {
    id: 2,
    type: "confirm",
    title: "Booking confirmed for Tech Conference",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "pending",
    title: "Payment pending for Startup Meetup",
    time: "2 hours ago",
  },
  {
    id: 4,
    type: "update",
    title: "New speaker added to Innovation Summit",
    time: "3 hours ago",
  },
];
function Dashboard() {
  return (
    <div className="dashboard">
      <header>
        <div>
          <h1>Welcome back, Victor!</h1>
          <p>Here's what's happening with your events today.</p>
        </div>
      </header>

      <div className="metrics-grid">
        <MetricCard
          title="Total Events"
          value="24"
          icon={<Calendar size={24} />}
        />
        <MetricCard
          title="Upcoming Events"
          value="8"
          icon={<CalendarIcon size={24} />}
        />
        <MetricCard
          title="New Messages"
          value="12"
          icon={<MessageSquare size={24} />}
        />
        <MetricCard
          title="Total Revenue"
          value="Ksh 4,500,250"
          icon={<DollarSign size={24} />}
        />
      </div>

      <div className="events-section">
        <EventsTable events={mockEvents} />
      </div>

      <div className="bottom-grid">
        <RecentMessages messages={mockMessages} />
        <RecentActivities activities={mockActivities} />
      </div>

      <style jsx>{`
        .dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        header {
          margin-bottom: 2rem;
        }

        header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        header p {
          color: #64748b;
          margin: 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .events-section {
          margin-bottom: 2rem;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 1rem;
          }

          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
