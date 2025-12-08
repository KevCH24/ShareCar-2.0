// src/components/Register.tsx
import React, { useState } from "react";
import { registerUser } from "../services/authService";
import { QRCodeModal } from "./QRCodeModal";

interface RegisterProps {
    onBack: () => void;
    onRegisterSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onBack, onRegisterSuccess }) => {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [qrCredential, setQrCredential] = useState<string | null>(null);

    const handleRegister = () => {
        if (!username.trim()) {
            setError("Por favor ingresa un nombre de usuario");
            return;
        }

        setLoading(true);
        setError("");

        const result = registerUser(username.trim());

        if (result.success && result.qrCredential) {
            setQrCredential(result.qrCredential);
        } else {
            setError(result.error || "Error al crear usuario");
        }

        setLoading(false);
    };

    const handleQRModalClose = () => {
        setQrCredential(null);
        onRegisterSuccess();
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-md text-center z-10">
                <div className="mb-6 inline-block text-6xl">👤</div>

                <h2 className="text-3xl font-bold mb-2">Crear Usuario</h2>
                <p className="text-slate-400 mb-8">Registra tu cuenta en ShareCar</p>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Registration Form */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                    <div className="text-left space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 ml-1">Nombre de Usuario</label>
                            <input
                                type="text"
                                placeholder="Escribe tu usuario"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleRegister()}
                                disabled={loading}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                            />
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? "Creando..." : "Crear Usuario"}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            ← Regresar al inicio
                        </button>
                    </div>

                    <p className="mt-6 text-[10px] text-slate-600 text-center">
                        🔒 Tu código QR será generado automáticamente
                    </p>
                </div>
            </div>

            {/* QR Code Modal */}
            {qrCredential && (
                <QRCodeModal
                    qrData={qrCredential}
                    username={username}
                    onClose={handleQRModalClose}
                />
            )}
        </div>
    );
};
