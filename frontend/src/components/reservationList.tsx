import React from "react";

export const ReservationList: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Mis Reservas</h2>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">🔮</div>
                <h3 className="text-xl font-bold text-white mb-2">Próximamente</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                    El historial de reservas en la interfaz web estará disponible en la versión 2.1.
                    <br /><br />
                    Por ahora, verifica tus transacciones directamente en tu Wallet de Freighter o en el explorador de Stellar.
                </p>
            </div>
        </div>
    );
};
