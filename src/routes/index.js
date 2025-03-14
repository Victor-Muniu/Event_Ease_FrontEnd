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
]);
