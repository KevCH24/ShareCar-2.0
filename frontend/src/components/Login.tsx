import React, { useState } from "react";
import freighterApi from "@stellar/freighter-api";
import { registerUser, authenticateUser, authenticateWithQR } from "../services/authService";
import { QRCodeModal } from "./QRCodeModal";

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [qrInput, setQrInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [qrData, setQrData] = useState<string | null>(null);

    const handleCreatePasskey = async () => {
        if (!username.trim()) {
            setError("Por favor ingresa un nombre de usuario");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await registerUser(username.trim());

            if (result.success && result.qrData) {
                setQrData(result.qrData);
                // Don't call onLogin yet - wait for QR modal to close
            } else {
                setError(result.error || "Error al crear Passkey");
            }
        } catch (err: any) {
            setError(err.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const handleAuthenticate = async () => {
        if (!username.trim()) {
            setError("Por favor ingresa un nombre de usuario");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await authenticateUser(username.trim());

            if (result.success) {
                onLogin();
            } else {
                setError(result.error || "Error al autenticar");
            }
        } catch (err: any) {
            setError(err.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const handleQRLogin = async () => {
        if (!qrInput.trim()) {
            setError("Por favor ingresa el código QR");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await authenticateWithQR(qrInput.trim());

            if (result.success) {
                onLogin();
            } else {
                setError(result.error || "Error al autenticar con QR");
            }
        } catch (err: any) {
            setError(err.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const handleFreighter = async () => {
        setLoading(true);
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
            setLoading(false);
        }
    };

    const handleQRModalClose = () => {
        setQrData(null);
        onLogin(); // Login after showing QR
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-md text-center z-10">
                <div className="mb-6 inline-block text-6xl">🔑</div>

                <h2 className="text-3xl font-bold mb-2">Iniciar sesión</h2>
                <p className="text-slate-400 mb-8">Accede con tu Passkey biométrico o Wallet</p>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Freighter Button */}
                <button
                    onClick={handleFreighter}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#FFD700] hover:bg-[#F0C000] text-black font-bold rounded-lg mb-4 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? "Conectando..." : "+ Conectar con Freighter"}
                </button>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-black px-2 text-slate-600">O usa Passkey</span>
                    </div>
                </div>

                {/* Passkey Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-2">Prueba el sistema</h3>
                    <p className="text-slate-400 text-sm mb-6">Crea o inicia sesión con tu Passkey</p>

                    <div className="text-left space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 ml-1">Usuario</label>
                            <input
                                type="text"
                                placeholder="Escribe tu usuario"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAuthenticate()}
                                disabled={loading}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCreatePasskey}
                                disabled={loading}
                                className="py-2.5 bg-indigo-600/20 border border-indigo-600/50 text-indigo-400 rounded-lg hover:bg-indigo-600/30 transition-colors disabled:opacity-50"
                            >
                                + Crear Passkey
                            </button>
                            <button
                                onClick={handleAuthenticate}
                                disabled={loading}
                                className="py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                🔑 Autenticar
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-800/50 mt-4">
                            <label className="text-xs text-slate-500 ml-1">Ingresar token/credentialId desde QR</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    placeholder="Pega aquí el token del QR"
                                    value={qrInput}
                                    onChange={e => setQrInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleQRLogin()}
                                    disabled={loading}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-50"
                                />
                                <button
                                    onClick={handleQRLogin}
                                    disabled={loading}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    Entrar con QR
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="mt-6 text-[10px] text-slate-600 flex items-center justify-center gap-1">
                        🔒 Tus datos biométricos nunca salen de tu dispositivo
                    </p>
                </div>
            </div>

            {/* QR Code Modal */}
            {qrData && (
                <QRCodeModal
                    qrData={qrData}
                    username={username}
                    onClose={handleQRModalClose}
                />
            )}
        </div>
    );
};
