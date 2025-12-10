// src/components/vehicleList.tsx
import React, { useEffect, useState } from "react";
import { fetchVehicles, type Vehicle } from "../stellar/vehicleQueries";
import { reserveVehicle } from "../stellar/sharecar"; // NEW import

// Interface for Transaction Feedback
interface TxFeedback {
    status: "idle" | "signing" | "submitting" | "success" | "error";
    message?: string;
    hash?: string;
}

export const VehicleList: React.FC = () => {
    // --- STATE ---
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reservation State
    const [reservingModel, setReservingModel] = useState<string | null>(null);
    const [txState, setTxState] = useState<TxFeedback>({ status: "idle" });
    const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);

    // --- ACTIONS ---

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const result = await fetchVehicles();
            setVehicles(result);
        } catch (e: any) {
            setError(e.message ?? String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const handleReservation = async (v: Vehicle) => {
        if (reservingModel) return; // Block while processing

        try {
            setReservingModel(v.model);
            setTxState({ status: "signing", message: "Solicitando firma en Wallet..." });

            // Call Smart Contract
            const result = await reserveVehicle(v.model);

            setTxState({
                status: "success",
                message: "¡Reserva Confirmada!",
                // @ts-ignore
                hash: result.hash
            });

            // Refresh list
            setTimeout(() => {
                setTxState({ status: "idle" });
                setReservingModel(null);
                loadVehicles();
            }, 3000);

        } catch (e: any) {
            console.error(e);
            let msg = e.message || String(e);
            if (msg.includes("User declined")) msg = "Usuario canceló la firma.";
            setTxState({ status: "error", message: msg });

            setTimeout(() => {
                setTxState({ status: "idle" });
                setReservingModel(null);
            }, 5000);
        }
    };

    const toggleReviews = (index: number) => {
        if (expandedReviewId === index) {
            setExpandedReviewId(null);
        } else {
            setExpandedReviewId(index);
        }
    };

    const renderStars = (rating: number) => {
        return "⭐".repeat(Math.round(rating));
    }

    return (
        <div className="space-y-12 relative">

            {/* FEEDBACK OVERLAY */}
            {(txState.status !== "idle") && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className={`
                        max-w-md w-full p-6 rounded-xl border shadow-2xl text-center space-y-4
                        ${txState.status === "error" ? "bg-red-950/90 border-red-500" : "bg-slate-900 border-indigo-500"}
                    `}>
                        <div className="text-4xl animate-bounce">
                            {txState.status === "signing" && "🔐"}
                            {txState.status === "submitting" && "🚀"}
                            {txState.status === "success" && "✅"}
                            {txState.status === "error" && "❌"}
                        </div>

                        <h3 className="text-xl font-bold text-white">
                            {txState.status === "signing" && "Firma Requerida"}
                            {txState.status === "submitting" && "Procesando..."}
                            {txState.status === "success" && "¡Pago Exitoso!"}
                            {txState.status === "error" && "Error"}
                        </h3>

                        <p className="text-slate-300">{txState.message}</p>

                        {txState.hash && (
                            <div className="bg-black/50 p-2 rounded text-xs font-mono text-slate-500 break-all">
                                Tx: {txState.hash}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* LIST SECTION */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-white">Vehículos Disponibles</h2>
                {error && (
                    <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
                        Error: {error}
                    </div>
                )}


                {loading ? (
                    <p className="text-slate-500">Cargando...</p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {vehicles.map((v, i) => (
                            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col transition-all hover:border-indigo-500/50">
                                {/* Header Card */}
                                <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
                                    <h4 className="text-slate-200 font-medium">{v.brand} {v.model}</h4>
                                    <span className="text-xs text-yellow-400" title={`Rating: ${v.rating}`}>{renderStars(v.rating)}</span>
                                </div>

                                <div className="p-4 space-y-3 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white font-bold text-lg">{v.model}</p>
                                            <p className="text-xs text-slate-400">{v.availability}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-lg">${v.rate}/h</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-400 line-clamp-2">
                                        {v.description}
                                    </p>

                                    <div className="flex-1"></div> {/* Spacer */}

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleReservation(v)}
                                            disabled={reservingModel !== null}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg font-medium transition-colors"
                                        >
                                            {reservingModel === v.model ? "Procesando..." : "Reservar con Wallet"}
                                        </button>
                                        <button
                                            onClick={() => toggleReviews(i)}
                                            className="px-3 py-2 border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
                                        >
                                            {expandedReviewId === i ? "Cerrar" : "Detalles"}
                                        </button>
                                    </div>

                                    {/* OPERATIONS log or details could go here */}
                                    {expandedReviewId === i && (
                                        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-slate-300 text-xs">Información Técnica</p>
                                                <div className="text-xs text-slate-400 grid grid-cols-2 gap-2">
                                                    <span>Transmisión: {v.transmission}</span>
                                                    <span>Combustible: {v.fuel}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
