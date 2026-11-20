import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MoviesPage from "./pages/MoviesPage";
import RewatchPlannerPage from "./pages/RewatchPlannerPage";
import CinemasPage from "./pages/CinemasPage";
import BookingPage from "./pages/BookingPage";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0C10] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
        {/* React Hot Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#181B26",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />

        {/* Global Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/rewatch" element={<RewatchPlannerPage />} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#07080B] py-6 text-center text-xs text-gray-500 font-mono">

              <span className="text-gray-400 font-semibold uppercase">Doomsday Ready</span>{" "}
              — Blinto Full-Stack Assessment by Rakib B


        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
