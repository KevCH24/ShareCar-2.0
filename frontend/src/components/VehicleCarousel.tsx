// src/components/VehicleCarousel.tsx
import React, { useState, useEffect } from "react";
import type { Vehicle } from "../stellar/vehicleQueries";

interface VehicleCarouselProps {
    vehicles: Vehicle[];
}

export const VehicleCarousel: React.FC<VehicleCarouselProps> = ({ vehicles }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [itemsPerView, setItemsPerView] = useState(3);

    // Responsive items per view
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerView(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerView(2);
            } else {
                setItemsPerView(3);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auto-scroll functionality
    useEffect(() => {
        if (isPaused || vehicles.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                const maxIndex = Math.max(0, vehicles.length - itemsPerView);
                return prev >= maxIndex ? 0 : prev + 1;
            });
        }, 3500); // Auto-scroll every 3.5 seconds

        return () => clearInterval(interval);
    }, [isPaused, vehicles.length, itemsPerView]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => {
            const maxIndex = Math.max(0, vehicles.length - itemsPerView);
            return prev <= 0 ? maxIndex : prev - 1;
        });
    };

    const handleNext = () => {
        setCurrentIndex((prev) => {
            const maxIndex = Math.max(0, vehicles.length - itemsPerView);
            return prev >= maxIndex ? 0 : prev + 1;
        });
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    if (vehicles.length === 0) {
        return null;
    }

    const maxIndex = Math.max(0, vehicles.length - itemsPerView);
    const visibleVehicles = vehicles.slice(currentIndex, currentIndex + itemsPerView);

    return (
        <div
            className="mb-12 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>🚗</span> Vehículos Destacados
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevious}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
                        aria-label="Previous"
                    >
                        ←
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
                        aria-label="Next"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-xl bg-slate-900/30 border border-slate-800 p-6">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {visibleVehicles.map((vehicle, idx) => (
                        <div
                            key={currentIndex + idx}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden transition-all hover:border-indigo-500/50 hover:scale-105 duration-300"
                        >
                            {/* Vehicle Image Placeholder */}
                            <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative border-b border-slate-700">
                                <div className="absolute inset-0 bg-indigo-600/5"></div>
                                <span className="text-6xl opacity-30">🚗</span>
                            </div>

                            {/* Vehicle Info */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{vehicle.brand}</h3>
                                        <p className="text-slate-400 text-sm">{vehicle.model}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-indigo-400 font-bold text-xl">${vehicle.rate}</p>
                                        <p className="text-slate-500 text-xs">/hora</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                    <span>⚙️ {vehicle.transmission}</span>
                                    <span>•</span>
                                    <span>💺 {vehicle.seats}</span>
                                    <span>•</span>
                                    <span>⛽ {vehicle.fuel}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-yellow-400 text-sm">
                                        {"⭐".repeat(Math.round(vehicle.rating))}
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        {vehicle.reviews.length} reseñas
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pause Indicator */}
                {isPaused && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-slate-300 flex items-center gap-1">
                        <span>⏸</span> Pausado
                    </div>
                )}
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? "w-8 bg-indigo-500"
                                : "w-2 bg-slate-700 hover:bg-slate-600"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
