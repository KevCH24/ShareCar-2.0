// src/App.tsx
import React, { useState } from "react";
import { AdminAddVehicle } from "./components/adminAddVehicle";
import { VehicleList } from "./components/vehicleList";
import { ReservationList } from "./components/reservationList";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";

type View = "landing" | "login" | "vehicles" | "admin" | "reservations";

function App() {
  const [view, setView] = useState<View>("landing");

  // Simple "router" replacement
  const navigate = (v: View) => setView(v);

  if (view === "landing") {
    return <Landing onEnter={() => navigate("login")} />;
  }

  if (view === "login") {
    return <Login onLogin={() => navigate("vehicles")} />;
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
