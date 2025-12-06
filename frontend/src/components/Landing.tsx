import React from "react";

export const Landing: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />

            <div className="z-10 text-center max-w-2xl px-6">
                <div className="mb-8 flex justify-center">
                    <span className="text-4xl">🌐</span>
                    <span className="text-3xl font-bold ml-3 tracking-tighter">ShareCar</span>
                </div>

                <h1 className="text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
                    Bienvenido a <br /> ShareCar
                </h1>

                <p className="text-lg text-slate-400 mb-12 leading-relaxed">
                    Comparte tu auto o reserva uno cerca de ti. Gestiona anuncios, reservas, pagos y reseñas desde una sola app web3.
                </p>

                <div className="border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl text-left mb-10 shadow-2xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                        ¿Qué puedes hacer en ShareCar?
                    </h3>
                    <ul className="space-y-3 text-slate-300">
                        {[
                            "Publicar tu vehículo con fotos, tarifas y disponibilidad",
                            "Buscar y reservar autos por hora o día",
                            "Pagos seguros y retención hasta la devolución",
                            "Sistema de reseñas y verificación de usuarios",
                            "Acceso seguro mediante Passkey y wallets"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start">
                                <span className="text-emerald-500 mr-3 mt-1">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onEnter}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:scale-105"
                    >
                        Compartir mi auto
                    </button>
                    <button
                        onClick={onEnter}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full font-semibold transition-all shadow-lg shadow-cyan-500/30 hover:scale-105"
                    >
                        Buscar vehículos
                    </button>
                </div>
            </div>
        </div>
    );
};
