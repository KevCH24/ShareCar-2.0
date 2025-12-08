// src/App.tsx
import React, { useState, useEffect } from "react";
import { AdminAddVehicle } from "./components/adminAddVehicle";
import { VehicleList } from "./components/vehicleList";
import { ReservationList } from "./components/reservationList";
import { Landing } from "./components/Landing";
import { Register } from "./components/Register";
import { isAuthenticated, getCurrentUser, logout } from "./services/authService";

type View = "landing" | "register" | "vehicles" | "admin" | "reservations";

function App() {
  const [view, setView] = useState<View>("landing");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // If user is authenticated and on landing/register page, redirect to vehicles
    if (user && (view === "landing" || view === "register")) {
      setView("vehicles");
    }
  }, [view]);

  // Simple "router" replacement
  const navigate = (v: View) => {
    // Protect routes - require authentication
    if (v !== "landing" && v !== "register" && !isAuthenticated()) {
      setView("landing");
      return;
    }
    setView(v);
  };

  const handleLogin = () => {
    setCurrentUser(getCurrentUser());
    navigate("vehicles");
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setView("landing");
  };

  const handleRegisterSuccess = () => {
    // After successful registration, go back to landing to login
    setView("landing");
  };

  if (view === "landing") {
    return (
      <Landing
        onLogin={handleLogin}
        onRegister={() => navigate("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <Register
        onBack={() => setView("landing")}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-900 bg-black/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("landing")}>
            <span className="text-2xl">🌐</span>
            <h1 className="text-xl font-bold tracking-tight text-white">ShareCar</h1>
          </div>

          <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
            <NavButton active={view === "vehicles"} onClick={() => navigate("vehicles")}>
              Buscar vehículos
            </NavButton>
            {/* Reservations hidden as requested */}
            {/*
            <NavButton active={view === "reservations"} onClick={() => navigate("reservations")}>
              Mis reservas
            </NavButton>
            */}
            <NavButton active={view === "admin"} onClick={() => navigate("admin")}>
              Publicar auto
            </NavButton>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="text-sm text-slate-400">
                👤 <span className="text-indigo-400 font-medium">{currentUser}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 border border-slate-800 flex items-center gap-2"
            >
              <span>🚪</span> Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === "vehicles" && <VehicleList />}
        {view === "reservations" && <ReservationList />}
        {view === "admin" && <AdminAddVehicle />}
      </main>
    </div>
  );
}

function NavButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
        : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
    >
      {children}
    </button>
  );
}

export default App;
