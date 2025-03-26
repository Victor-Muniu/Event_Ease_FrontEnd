import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import MainLayout from "../layout/MainLayout"
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard";
import Venues from "../pages/Venues";
import VenueRequestDashboard from "../pages/VenueRequestDashboard";
import PaymentReport from "../pages/PaymentReport"
import BookingFinalization from "../pages/BookingFinalization"
import PaymentPage from "../pages/PaymentPage";
import Events from "../pages/Events";
import EventPage from "../pages/EventPage";
import Organizers from "../pages/Organizers";
import CreateTickets from "../pages/CreateTickets";
import AttendeeTracker from "../pages/AttendeeTracker";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: "/upcoming",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <EventPage />,
      },
    ],
  },
  {
    path: "/organizers",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Organizers />
      },
    ],
  },
  {
    path: "/login",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Login />
      },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
    ],
  },
  {
    path: "/venues",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <Venues />
      },
    ],
  },
  {
    path: "/venue_request",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <VenueRequestDashboard />,
      },
    ],
  },
  {
    path: "/payment",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <PaymentReport />,
      },
    ],
  },
  {
    path: "/create",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <BookingFinalization />,
      },
    ],
  },
  {
    path: "/pay",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <PaymentPage />
      },
    ],
  },
  {
    path: "/events",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <Events />,
      },
    ],
  },
  {
    path: "/generate_tickets",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <CreateTickets />
      },
    ],
  },
  {
    path: "/attendees",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <AttendeeTracker />
      },
    ],
  },
]);
