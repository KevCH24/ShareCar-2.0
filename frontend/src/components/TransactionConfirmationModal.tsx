// src/components/TransactionConfirmationModal.tsx
import React from "react";

interface TransactionConfirmationProps {
    txHash: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleRate: number;
    timestamp: string;
    onClose: () => void;
}

export const TransactionConfirmationModal: React.FC<TransactionConfirmationProps> = ({
    txHash,
    vehicleBrand,
    vehicleModel,
    vehicleRate,
    timestamp,
    onClose
}) => {
    const stellarExpertUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-green-500 rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">

                {/* Success Background Element */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>

                {/* Success Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 relative z-10">
                        <span className="text-3xl">✓</span>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1 text-center relative z-10">
                    ¡Reserva Exitosa!
                </h3>
                <p className="text-sm text-green-400 mb-6 text-center tracking-wider uppercase">
                    Transacción Confirmada en Stellar
                </p>

                {/* Vehicle Details */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4 relative z-10">
                    <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Vehículo Reservado</h4>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold text-lg">{vehicleBrand} {vehicleModel}</p>
                            <p className="text-slate-400 text-sm">Tarifa: ${vehicleRate}/hora</p>
                        </div>
                        <span className="text-4xl">🚗</span>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3 text-sm font-mono bg-black/50 p-4 rounded-lg border border-slate-800 relative z-10">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                        <span className="text-slate-500">Estado:</span>
                        <span className="text-green-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Confirmada
                        </span>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-300">{timestamp}</span>

                        <span className="text-slate-500">Red:</span>
                        <span className="text-slate-300">Stellar Testnet</span>

                        <span className="text-slate-500">Hash:</span>
                        <span className="text-indigo-300 break-all text-xs">{txHash}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3 relative z-10">
                    <a
                        href={stellarExpertUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-3 rounded-lg border border-indigo-500 text-indigo-300 hover:bg-indigo-500/10 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <span>🔍</span> Ver en Stellar Expert
                    </a>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 shadow-lg shadow-green-500/20 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>

                {/* Additional Info */}
                <p className="text-xs text-slate-500 text-center mt-4 relative z-10">
                    Tu reserva ha sido registrada en la blockchain de Stellar
                </p>
            </div>
        </div>
    );
};
