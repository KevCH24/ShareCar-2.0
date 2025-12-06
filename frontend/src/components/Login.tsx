import React, { useState } from "react";
import freighterApi from "@stellar/freighter-api";

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [connecting, setConnecting] = useState(false);

    const handleFreighter = async () => {
        setConnecting(true);
        try {
            const isConnected = await freighterApi.isConnected();
            if (isConnected) {
                // In a real app we would get the publicKey here
                onLogin();
            } else {
                alert("Freighter not detected");
            }
        } catch (e) {
            console.error(e);
            // Fallback for demo/mock mode if freighter fails or user cancels
            onLogin();
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-md text-center z-10">
                <div className="mb-6 inline-block text-6xl">🔑</div>

                <h2 className="text-3xl font-bold mb-2">Iniciar sesión</h2>
                <p className="text-slate-400 mb-8">Accede con tu Passkey biométrico o Wallet</p>

                <button
                    onClick={handleFreighter}
                    disabled={connecting}
                    className="w-full py-3 px-4 bg-[#FFD700] hover:bg-[#FOC000] text-black font-bold rounded-lg mb-4 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    {connecting ? "Detectando..." : "+ Conectar con Freighter"}
                </button>

                <button
                    onClick={onLogin}
                    className="text-xs text-[#FFD700] hover:underline mb-12 opacity-80"
                >
                    Modo mock (desarrollo)
                </button>


                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-2">Prueba el sistema</h3>
                    <p className="text-slate-400 text-sm mb-6">Crea o inicia sesión con tu Passkey</p>

                    <div className="text-left space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 ml-1">Usuario</label>
                            <input
                                type="text"
                                placeholder="Escribe tu usuario"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="py-2.5 bg-indigo-600/20 border border-indigo-600/50 text-indigo-400 rounded-lg hover:bg-indigo-600/30 transition-colors">
                                + Crear Passkey
                            </button>
                            <button className="py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                                🔑 Autenticar
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-800/50 mt-4">
                            <label className="text-xs text-slate-500 ml-1">Ingresar token/credentialId desde QR</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    placeholder="Pega aquí el token del QR"
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                                />
                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-colors">
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
        </div>
    );
};
