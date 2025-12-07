// src/components/adminAddVehicle.tsx
import React, { useState } from "react";
import { addProductWithFreighter } from "../stellar/adminActions";

export const AdminAddVehicle: React.FC = () => {
    const [model, setModel] = useState("");
    const [qty, setQty] = useState("1");
    const [rate, setRate] = useState("0");
    const [status, setStatus] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setStatus("Conectando con Freighter y firmando...");
            // Reusing existing contract function: Name->Model, Price->Rate, Qty->Available
            await addProductWithFreighter(
                model,
                parseInt(qty, 10),
                parseInt(rate, 10)
            );
            setStatus("✅ Vehículo publicado correctamente");
            setModel("");
            setQty("1");
            setRate("0");
        } catch (err: any) {
            setStatus(`❌ Error: ${err.message ?? String(err)}`);
        }
    };

    const isSuccess = status.startsWith("✅");
    const isError = status.startsWith("❌");

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Publicar Vehículo
                </h2>
                <p className="text-sm text-slate-400 mb-8">
                    Registra un nuevo auto en la flota de ShareCar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Modelo del vehículo
                        </label>
                        <input
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Ej. Tesla Model 3 Long Range"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Unidades disponibles
                            </label>
                            <input
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tarifa por hora
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-xs font-bold text-slate-400">
                                    XLM
                                </span>
                                <input
                                    type="number"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-12 pr-4 py-3 text-white
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    min={0}
                                    step={1}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-4 py-4 font-bold text-white shadow-lg shadow-indigo-500/20 
                       hover:bg-indigo-500 active:scale-[0.98] transition-all"
                    >
                        Publicar en Blockchain
                    </button>
                </form>

                {status && (
                    <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center border ${isSuccess ? "bg-emerald-900/20 border-emerald-900 text-emerald-400" :
                        isError ? "bg-rose-900/20 border-rose-900 text-rose-400" : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};
