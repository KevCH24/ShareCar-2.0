import React, { useEffect, useState } from "react";
import { fetchVehicles, type Vehicle } from "../stellar/vehicleQueries";
import { VehicleCarousel } from "./VehicleCarousel";
import { loginUser } from "../services/authService";
import freighterApi from "@stellar/freighter-api";

interface LandingProps {
    onLogin: () => void;
    onRegister: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin, onRegister }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    // Login state
    const [username, setUsername] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                setLoading(true);
                const result = await fetchVehicles();
                setVehicles(result);
            } catch (e) {
                console.error("Error loading vehicles:", e);
            } finally {
                setLoading(false);
            }
        };
        loadVehicles();
    }, []);

    const handleLogin = () => {
        if (!username.trim()) {
            setError("Por favor ingresa tu nombre de usuario");
            return;
        }

        if (!qrCode.trim()) {
            setError("Por favor ingresa tu código QR");
            return;
        }

        setLoginLoading(true);
        setError("");

        const result = loginUser(username.trim(), qrCode.trim());

        if (result.success) {
            onLogin();
        } else {
            setError(result.error || "Error al iniciar sesión");
        }

        setLoginLoading(false);
    };

    const handleFreighter = async () => {
        setLoginLoading(true);
        setError("");

        try {
            const isConnected = await freighterApi.isConnected();
            if (isConnected) {
                const { address } = await freighterApi.getAddress();
                console.log("Freighter connected:", address);
                onLogin();
            } else {
                setError("Freighter no detectado. Por favor instala la extensión.");
            }
        } catch (e: any) {
            console.error(e);
            setError("Error al conectar con Freighter");
        } finally {
            setLoginLoading(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12">
                {/* Vehicle Carousel */}
                {!loading && vehicles.length > 0 && (
                    <div className="mb-12">
                        <VehicleCarousel vehicles={vehicles} />
                    </div>
                )}

                {/* Login Section */}
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mb-6 flex justify-center items-center gap-3">
                            <span className="text-5xl">🔑</span>
                            <span className="text-4xl font-bold tracking-tighter">ShareCar</span>
                        </div>

                        <h1 className="text-5xl font-bold mb-4 tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
                            Iniciar sesión
                        </h1>

                        <p className="text-lg text-slate-400 leading-relaxed">
                            Accede con tu usuario y código QR
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Freighter Wallet Button */}
                    <button
                        onClick={handleFreighter}
                        disabled={loginLoading}
                        className="w-full py-3 px-4 bg-[#FFD700] hover:bg-[#F0C000] text-black font-bold rounded-lg mb-4 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loginLoading ? "Conectando..." : "+ Conectar con Freighter"}
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-black px-2 text-slate-600">O usa tu código QR</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 ml-1">Usuario</label>
                                <input
                                    type="text"
                                    placeholder="Escribe tu usuario"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    disabled={loginLoading}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 ml-1">Código QR</label>
                                <input
                                    type="text"
                                    placeholder="Pega tu código QR aquí"
                                    value={qrCode}
                                    onChange={e => setQrCode(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleLogin()}
                                    disabled={loginLoading}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                                />
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loginLoading}
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loginLoading ? "Iniciando..." : "Iniciar Sesión"}
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={onRegister}
                                    disabled={loginLoading}
                                    className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/30 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Crear Usuario
                                </button>
                                <button
                                    onClick={scrollToTop}
                                    disabled={loginLoading}
                                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    ↑ Regresar al inicio
                                </button>
                            </div>
                        </div>

                        <p className="mt-6 text-[10px] text-slate-600 text-center">
                            🔒 Tu código QR es tu llave de acceso segura
                        </p>
                    </div>

                    {/* Info Section */}
                    <div className="border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl text-left">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            ¿Qué puedes hacer en ShareCar?
                        </h3>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            {[
                                "Publicar tu vehículo con tarifas y disponibilidad",
                                "Buscar y reservar autos por hora o día",
                                "Pagos seguros con tecnología blockchain",
                                "Sistema de reseñas y verificación de usuarios"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="text-emerald-500 mr-2 mt-0.5">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
