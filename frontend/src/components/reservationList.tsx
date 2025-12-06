// src/components/reservationList.tsx
import React, { useEffect, useState } from "react";
import { fetchOrders } from "../stellar/orderQueries";
import type { Order, OrderStatus } from "../stellar/orderQueries";
import { updateOrderStatus } from "../stellar/orderActions"; // Keeping underlying action

// Updated text mapping
const statusMapping: Record<string, string> = {
    creado: "Pendiente",
    preparando: "Confirmada",
    listo: "En curso",
    entregado: "Finalizada",
    cancelado: "Cancelada",
};

const statusColors: Record<string, string> = {
    creado: "bg-slate-800 text-slate-300 border-slate-600",
    preparando: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
    listo: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    entregado: "bg-slate-700 text-slate-400 border-slate-600",
    cancelado: "bg-rose-500/20 text-rose-300 border-rose-400/40",
};

export const ReservationList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Order | null>(null);
    const [updating, setUpdating] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    const statusOptions: OrderStatus[] = [
        "creado",
        "preparando",
        "listo",
        "entregado",
        "cancelado",
    ];

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await fetchOrders();
            setOrders(result);
            if (result.length > 0) setSelected(result[0]);
        } catch (e: any) {
            setError(e.message ?? String(e));
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!selected) return;

        try {
            setUpdating(true);
            setStatusMsg("Actualizando estado en blockchain…");
            await updateOrderStatus(selected.id, newStatus);
            setStatusMsg("✅ Estado actualizado correctamente.");
            await loadOrders();
            const updated = (orders ?? []).find((o) => o.id === selected.id);
            if (updated) setSelected(updated);
        } catch (e: any) {
            setStatusMsg(`❌ Error: ${e.message ?? String(e)}`);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold mb-1 text-white">Mis Reservas</h1>
                <p className="text-sm text-slate-400">
                    Gestiona el estado de tus alquileres activos e históricos.
                </p>
            </header>

            {loading && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 animate-pulse">
                    <p className="text-sm text-slate-300">Cargando reservas…</p>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4">
                    Error: {error}
                </div>
            )}

            {!loading && !error && (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LIST */}
                    <div className="flex-1">
                        {orders.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                                <p className="text-sm text-slate-400">No tienes reservas registradas.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {orders.map((o) => {
                                    const isSelected = selected?.id === o.id;
                                    const statusClass = statusColors[o.status] || statusColors.creado;

                                    return (
                                        <button
                                            key={o.id}
                                            onClick={() => setSelected(o)}
                                            className={`relative flex flex-col rounded-2xl border p-5 text-left transition-all ${isSelected
                                                    ? "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10"
                                                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/60"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-mono text-slate-500">RES-{o.id}</span>
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${statusClass}`}>
                                                    {statusMapping[o.status] || o.status}
                                                </span>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm font-semibold text-white">
                                                    {o.products.length > 0 ? o.products[0] : "Vehículo desconocido"}
                                                    {o.products.length > 1 && <span className="text-slate-500 font-normal"> +{o.products.length - 1}</span>}
                                                </p>
                                                <p className="text-xs text-slate-500">Pack Básico</p>
                                            </div>

                                            <div className="mt-auto pt-3 border-t border-slate-800/50 flex justify-between items-center text-xs">
                                                <span className="text-slate-400">Total</span>
                                                <span className="font-bold text-white">-- XLM</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* DETAIL PANEL */}
                    <aside className="w-full lg:w-96 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 h-fit shrink-0">
                        {selected ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Reserva #{selected.id}</h2>
                                        <p className="text-xs text-slate-400">Detalles del alquiler</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${statusColors[selected.status]}`}>
                                        {statusMapping[selected.status] || selected.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                                        <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Vehículo</label>
                                        {selected.products.length > 0 ? (
                                            selected.products.map((p, i) => (
                                                <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                                                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-lg">🚗</div>
                                                    <span className="text-sm text-white font-medium">{p}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-500">Sin vehículo asignado</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-4">
                                    <label className="block text-xs text-slate-500 mb-2">Administrar Estado (Admin)</label>
                                    <select
                                        value={selected.status}
                                        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                                        disabled={updating}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        {statusOptions.map((s) => (
                                            <option key={s} value={s}>{statusMapping[s] || s}</option>
                                        ))}
                                    </select>
                                    {statusMsg && <p className="mt-2 text-xs text-center text-indigo-300">{statusMsg}</p>}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                <p>Selecciona una reserva para ver detalles</p>
                            </div>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
};
