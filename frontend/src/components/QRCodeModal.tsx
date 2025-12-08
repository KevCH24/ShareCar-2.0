// src/components/QRCodeModal.tsx
import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
    qrData: string;
    username: string;
    onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ qrData, username, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-indigo-500 rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <span>✅</span> Passkey Creado
                    </h3>
                    <p className="text-slate-400 mb-6">
                        ¡Bienvenido, <span className="text-indigo-400 font-semibold">{username}</span>!
                    </p>

                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                        <QRCodeSVG value={qrData} size={200} level="H" />
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                        <p className="text-sm text-slate-300 mb-3">
                            <span className="font-semibold text-indigo-400">Código de acceso:</span>
                        </p>
                        <div className="bg-slate-950 p-3 rounded border border-slate-700 mb-3">
                            <p className="text-xs text-slate-400 font-mono break-all">
                                {qrData}
                            </p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <span>✓</span> Copiado
                                </>
                            ) : (
                                <>
                                    <span>📋</span> Copiar código
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info */}
                    <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-3 mb-4">
                        <p className="text-xs text-indigo-300 flex items-start gap-2">
                            <span className="text-base">💡</span>
                            <span>
                                Guarda este código QR o cópialo para iniciar sesión desde otro dispositivo sin necesidad de autenticación biométrica.
                            </span>
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Continuar
                    </button>

                    <p className="mt-4 text-[10px] text-slate-600 text-center flex items-center justify-center gap-1">
                        🔒 Tu Passkey está almacenado de forma segura en tu dispositivo
                    </p>
                </div>
            </div>
        </div>
    );
};
