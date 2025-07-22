import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import AdminCustomersPage from './pages/AdminCustomersPage';
import TripSearchPage from './pages/TripSearchPage';
import VipSeatSelection from '@/pages/VipSeatSelectionPage'; // nếu bạn đặt trang này riêng

import AdminRevenuePage from '@/pages/AdminRevenuePage'; // 👈 import page mới
import AdminLayout from '@/components/layout/AdminLayout'; // 👈 import page mới

import AdminProvincesPage from './pages/AdminProvincesPage';
import AdminRoutesPage from './pages/AdminRoutesPage';
import AdminBusesPage from './pages/AdminBusesPage';
import AdminSchedulePatternsPage from './pages/AdminSchedulePatternsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import BookingPage from './pages/BookingPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminSchedulesPage from './pages/AdminSchedulesPage';
import AdminDriversPage from './pages/AdminDriversPage';
import UserDashboard from './components/UserDashboard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>

            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />

            <Route path="routes" element={<AdminRoutesPage />} />
            <Route path="buses" element={<AdminBusesPage />} />
            <Route path="schedule-patterns" element={<AdminSchedulePatternsPage />} />
            <Route path="provinces" element={<AdminProvincesPage />} />
            <Route path="drivers" element={<AdminDriversPage />} />
            <Route path="tickets" element={<AdminBookingsPage />} />
            <Route path="schedules" element={<AdminSchedulesPage />} />
          </Route>
          <Route path="/trips/search" element={<TripSearchPage />} />
          <Route path="/trips/select-vip-seats" element={<VipSeatSelection />} />
          <Route path="/trips/select-seats" element={<SeatSelectionPage />} />
          <Route path="/booking/:scheduleId" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/profile" element={<UserDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;