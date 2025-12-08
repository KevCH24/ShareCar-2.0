// src/components/vehicleList.tsx
import React, { useEffect, useState } from "react";
import { fetchVehicles, type Vehicle, encodeVehicleName } from "../stellar/vehicleQueries";
import { createOrderForProducts } from "../stellar/orderActions";
import { addProductWithFreighter } from "../stellar/adminActions";

// Interface for Simulated Transaction Data
interface SimulatedTx {
    hash: string;
    network: string;
    fee: string;
    source: string;
    operation: string;
    status: string;
}

export const VehicleList: React.FC = () => {
    // --- STATE ---
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Publication Form State
    const [pModel, setPModel] = useState("");
    const [pBrand, setPBrand] = useState("");
    const [pAvail, setPAvail] = useState("");
    const [pRate, setPRate] = useState("");
    const [pDesc, setPDesc] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [pubStatus, setPubStatus] = useState("");

    // Reservation State
    const [reserving, setReserving] = useState<string | null>(null); // Model being reserved
    const [resStatus, setResStatus] = useState(""); // Status text for reservation
    const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null); // Index of vehicle to show reviews

    // Transaction Simulation State
    const [txModal, setTxModal] = useState<SimulatedTx | null>(null);
    const [pendingReservation, setPendingReservation] = useState<{ vehicle: Vehicle, encodedName: string } | null>(null);


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

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setPublishing(true);
            setPubStatus("Firmando...");

            // Encode data into the 'Name' field for the contract
            // Format: BRAND|MODEL|AVAILABILITY|DESCRIPTION
            const encodedName = encodeVehicleName(pBrand, pModel, pAvail, pDesc);
            const rateInt = parseInt(pRate, 10);

            // Quantity=1 (Logic default), Price=Rate
            await addProductWithFreighter(encodedName, 1, rateInt);

            setPubStatus("✅ Vehículo publicado");
            setPModel("");
            setPBrand("");
            setPAvail("");
            setPRate("");
            setPDesc("");

            // Refresh list
            setTimeout(loadVehicles, 2000);
        } catch (err: any) {
            setPubStatus("❌ Error");
            console.error(err);
        } finally {
            setPublishing(false);
        }
    };

    const handleReservation = async (v: Vehicle) => {
        try {
            setReserving(v.model);
            setResStatus("Simulando...");

            const encodedName = encodeVehicleName(v.brand, v.model, v.availability, v.description);

            // 1. Simulate Transaction Data - SHARECAR SPECIFIC
            const mockTx: SimulatedTx = {
                hash: "5c8d9a..." + Math.random().toString(36).substring(2, 6) + " (Pre-submission)",
                network: "Stellar Futurenet (Testnet)",
                fee: "100 stroops (0.00001 XLM)",
                source: "G...CLIENT_WALLET",
                operation: `invoke_contract(
    contract: "ShareCar_Core_v1", 
    fn: "reserve_vehicle", 
    args: [
        "${v.brand} ${v.model}", 
        "${v.rate} XLM/hr"
    ]
)`,
                status: "Simulation Success"
            };

            // 2. Open Modal with this data
            setTxModal(mockTx);
            setPendingReservation({ vehicle: v, encodedName });

        } catch (e: any) {
            alert(`Error: ${e.message}`);
            setReserving(null);
        }
    };

    const confirmReservation = async () => {
        if (!pendingReservation) return;

        try {
            setTxModal(null); // Close modal
            setResStatus("Firma en Wallet..."); // Update button status

            // 3. Actually execute the transaction
            await createOrderForProducts([pendingReservation.encodedName]);

            alert(`Reserva exitosa para ${pendingReservation.vehicle.model}`);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setReserving(null);
            setPendingReservation(null);
        }
    };

    const cancelReservation = () => {
        setTxModal(null);
        setReserving(null);
        setPendingReservation(null);
    }

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

            {/* TRANSACTION MODAL */}
            {txModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-indigo-500 rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">

                        {/* ShareCar Branding Background Element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>

                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2 relative z-10">
                            <span>🏎️</span> ShareCar Protocol
                        </h3>
                        <p className="text-xs text-indigo-400 mb-4 tracking-wider uppercase">Simulación de Contrato Inteligente</p>

                        <div className="space-y-3 text-sm font-mono bg-black/50 p-4 rounded-lg border border-slate-800 relative z-10">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                                <span className="text-slate-500">Estado:</span>
                                <span className="text-green-400 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {txModal.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-[80px_1fr] gap-2">
                                <span className="text-slate-500">Red:</span>
                                <span className="text-slate-300">{txModal.network}</span>

                                <span className="text-slate-500">Funcion:</span>
                                <span className="text-indigo-300 whitespace-pre-wrap font-xs leading-tight">
                                    {txModal.operation}
                                </span>

                                <span className="text-slate-500">Fee:</span>
                                <span className="text-yellow-200">{txModal.fee}</span>

                                <span className="text-slate-500">Source:</span>
                                <span className="text-slate-300 truncate">{txModal.source}</span>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800">
                                <span className="text-slate-500 text-xs">Simulated Hash:</span>
                                <span className="text-slate-600 text-[10px] break-all">{txModal.hash}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 relative z-10">
                            <button
                                onClick={cancelReservation}
                                className="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmReservation}
                                className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>🖊️</span> Firmar en Wallet
                            </button>
                        </div>
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

                                {/* Placeholder Image Area */}
                                <div className="h-32 bg-slate-900/50 flex items-center justify-center relative border-b border-slate-800/50">
                                    {/* Empty dark area */}
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
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2 rounded-lg font-medium transition-colors"
                                        >
                                            {reserving === v.model ? (resStatus || "...") : "Reservar"}
                                        </button>
                                        <button
                                            onClick={() => toggleReviews(i)}
                                            className="px-3 py-2 border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
                                        >
                                            {expandedReviewId === i ? "Cerrar" : "Detalles"}
                                        </button>
                                    </div>

                                    {/* DETAILS & REVIEWS EXPANSION */}
                                    {expandedReviewId === i && (
                                        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">

                                            {/* Technical Specs */}
                                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                                                <div className="bg-slate-900/50 p-2 rounded flex items-center gap-2">
                                                    <span>⚙️</span> {v.transmission}
                                                </div>
                                                <div className="bg-slate-900/50 p-2 rounded flex items-center gap-2">
                                                    <span>⛽</span> {v.fuel}
                                                </div>
                                                <div className="bg-slate-900/50 p-2 rounded flex items-center gap-2">
                                                    <span>💺</span> {v.seats} Asientos
                                                </div>
                                                <div className="bg-slate-900/50 p-2 rounded flex items-center gap-2">
                                                    <span>✨</span> {v.features.join(", ")}
                                                </div>
                                            </div>

                                            {/* Reviews */}
                                            <div className="space-y-2">
                                                <p className="font-semibold text-slate-300 text-xs">Reseñas de clientes ({v.reviews.length})</p>
                                                {v.reviews.map((r, idx) => (
                                                    <div key={idx} className="bg-slate-900/30 p-2 rounded border border-slate-800/50">
                                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                            <span>{r.user}</span>
                                                            <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                                                        </div>
                                                        <p className="text-slate-400 italic text-[11px]">"{r.text}"</p>
                                                    </div>
                                                ))}
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
