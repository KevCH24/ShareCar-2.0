// src/components/vehicleList.tsx
import React, { useEffect, useState } from "react";
import { fetchVehicles, Vehicle, encodeVehicleName } from "../stellar/vehicleQueries";
import { createOrderForProducts } from "../stellar/orderActions";
import { addProductWithFreighter } from "../stellar/adminActions";

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
    const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null); // Index of vehicle to show reviews

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
            const encodedName = encodeVehicleName(v.brand, v.model, v.availability, v.description);
            await createOrderForProducts([encodedName]);
            alert(`Reserva exitosa para ${v.model}`);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setReserving(null);
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
        <div className="space-y-12">
            {/* HEADER & FORM SECTION */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-white">Tus Vehículos (ShareCar)</h2>

                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg text-slate-300 mb-4">Publicar nuevo vehículo</h3>
                    <form onSubmit={handlePublish} className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                placeholder="Modelo (ej. Toyota Corolla 2018)"
                                value={pModel}
                                onChange={e => setPModel(e.target.value)}
                                className="flex-1 bg-white rounded-lg px-4 py-3 text-sm text-black focus:outline-none"
                                required
                            />
                            <input
                                placeholder="Marca (ej. Toyota)"
                                value={pBrand}
                                onChange={e => setPBrand(e.target.value)}
                                className="flex-1 bg-white rounded-lg px-4 py-3 text-sm text-black focus:outline-none"
                                required
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                placeholder="Disponibilidad (ej. Lun-Dom 9:00-18:00)"
                                value={pAvail}
                                onChange={e => setPAvail(e.target.value)}
                                className="flex-[1.5] bg-white rounded-lg px-4 py-3 text-sm text-black focus:outline-none"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Tarifa ($/hora)"
                                value={pRate}
                                onChange={e => setPRate(e.target.value)}
                                className="w-32 bg-white rounded-lg px-4 py-3 text-sm text-black focus:outline-none"
                                required
                            />
                        </div>

                        <textarea
                            placeholder="Breve descripción del vehículo..."
                            value={pDesc}
                            onChange={e => setPDesc(e.target.value)}
                            className="w-full bg-white rounded-lg px-4 py-3 text-sm text-black focus:outline-none"
                            rows={2}
                            required
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={publishing}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {publishing ? pubStatus : "Publicar vehículo"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* LIST SECTION */}
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Vehículos disponibles</h3>

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
                                            {reserving === v.model ? "..." : "Reservar"}
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
