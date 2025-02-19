import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import Home from "../pages/Home";
import Events from "../pages/Events";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Venue from "../pages/Venue";
import NotificationCenter from "../pages/NotificationCenter";
import CreateEventForm from "../pages/CreateEventForm";
import EventRequests from "../pages/EventRequests";
import PaymentHistory from "../pages/PaymentHistory";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "/events",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Events />
      },
    ],
  },
  {
    path: "/login_organizer",
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
    path: "/event_grounds",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <Venue />
      },
    ],
  },
  {
    path: "/notifications",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <NotificationCenter />
      },
    ],
  },
  {
    path: "/requests",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <EventRequests />
      },
    ],
  },
  {
    path: "/payment",
    element: <ProtectedRoute element={<MainLayout />}/>,
    children: [
      {
        index: true,
        element: <PaymentHistory />
      },
    ],
  },

]);
