// src/stellar/vehicleQueries.tsx
import { Client as ContractClient, networks } from "../bindings/src/index";

const SOROBAN_RPC = "https://soroban-testnet.stellar.org";

export interface Review {
    user: string;
    text: string;
    rating: number; // 1-5
}

export interface Vehicle {
    model: string;
    brand: string;
    availability: string;
    rate: number;
    description: string;
    rating: number; // Average 1-5
    reviews: Review[];
    // Extended Details
    transmission: string;
    seats: number;
    fuel: string;
    features: string[];
}

// Helper to encode/decode data into the "name" field for compatibility
// Format: "BRAND|MODEL|AVAILABILITY|DESCRIPTION"
export const SEPARATOR = "|";

export function encodeVehicleName(brand: string, model: string, availability: string, description: string): string {
    return `${brand}${SEPARATOR}${model}${SEPARATOR}${availability}${SEPARATOR}${description}`;
}

export function decodeVehicleName(rawName: string): { brand: string, model: string, availability: string, description: string } {
    const parts = rawName.split(SEPARATOR);
    if (parts.length >= 3) {
        // Handle optional description (4th part)
        const description = parts.length > 3 ? parts.slice(3).join(SEPARATOR) : "Sin descripción disponible.";
        return {
            brand: parts[0],
            model: parts[1],
            availability: parts[2],
            description
        };
    }
    // Fallback for legacy data
    return { brand: "General", model: rawName, availability: "Consultar", description: "Vehículo genérico" };
}

// Comprehensive Mock Database for Realism
const CAR_SPECS: Record<string, { transmission: string, seats: number, fuel: string, features: string[] }> = {
    // TOYOTA
    "corolla": { transmission: "CVT Automática", seats: 5, fuel: "Gasolina", features: ["Cámara de reversa", "Bluetooth", "Control Crucero", "Eco Mode"] },
    "camry": { transmission: "Automática 8-vel", seats: 5, fuel: "Híbrido", features: ["Asientos de piel", "Apple CarPlay", "Techo panorámico", "JBL Audio"] },
    "rav4": { transmission: "Automática", seats: 5, fuel: "Híbrido", features: ["AWD", "Modo Trail", "Cajuela amplia", "Pantalla táctil"] },
    "prius": { transmission: "CVT", seats: 5, fuel: "Híbrido", features: ["Super económico", "Head-up Display", "Carga inalámbrica"] },
    "hiace": { transmission: "Manual", seats: 15, fuel: "Diesel", features: ["Gran capacidad", "Techo alto", "Aire acondicionado trasero"] },

    // TESLA
    "model 3": { transmission: "Direct Drive (1-vel)", seats: 5, fuel: "Eléctrico", features: ["Autopilot", "Techo de cristal", "Pantalla 15\"", "Cero emisiones"] },
    "model y": { transmission: "Direct Drive (1-vel)", seats: 5, fuel: "Eléctrico", features: ["Espacio premium", "Autopilot", "Asientos calefactados", "Modo Camping"] },
    "model s": { transmission: "Direct Drive", seats: 5, fuel: "Eléctrico", features: ["Aceleración Ludicrous", "Suspensión neumática", "Gaming computer"] },
    "cybertruck": { transmission: "Direct Drive", seats: 6, fuel: "Eléctrico", features: ["Blindado", "Caja eléctrica", "Diseño futurista", "Exoskeleton"] },

    // BMW
    "x3": { transmission: "Steptronic 8-vel", seats: 5, fuel: "Gasolina Premium", features: ["iDrive 7", "Tracción integral xDrive", "Interiores de lujo", "Asistente de estacionamiento"] },
    "serie 3": { transmission: "Automática", seats: 5, fuel: "Gasolina", features: ["Iluminación ambiental", "Tablero digital", "Asistente de voz"] },
    "x5": { transmission: "Automática Deportiva", seats: 7, fuel: "Diesel/Gasolina", features: ["Tercera fila", "Suspensión adaptativa", "Techo Sky Lounge"] },
    "m3": { transmission: "Manual/Auto", seats: 4, fuel: "Gasolina Premium", features: ["Motor M TwinPower", "Frenos Carbono", "Asientos Bucket"] },
    "m4": { transmission: "Manual/Auto", seats: 4, fuel: "Gasolina Premium", features: ["Coupé deportivo", "Drift Mode", "Head-up Display"] },

    // NISSAN
    "versa": { transmission: "Manual/CVT", seats: 5, fuel: "Gasolina", features: ["Gran rendimiento", "Espacioso", "Frenado inteligente"] },
    "sentra": { transmission: "CVT Xtronic", seats: 5, fuel: "Gasolina", features: ["Diseño deportivo", "Bose Audio", "Cámara 360°"] },
    "gtr": { transmission: "Doble Embrague 6-vel", seats: 4, fuel: "Gasolina Premium", features: ["Launch Control", "Motor V6 Twin Turbo", "Frenos Brembo"] },
    "skyline": { transmission: "Manual 6-vel", seats: 4, fuel: "Gasolina Premium", features: ["Motor RB26DETT", "AWD Attesa", "Icono JDM"] },
    "urvan": { transmission: "Manual", seats: 12, fuel: "Diesel", features: ["Transporte eficiente", "Durabilidad", "Bajos costos"] },

    // FORD
    "mustang": { transmission: "Manual 6-vel", seats: 4, fuel: "Gasolina", features: ["Motor V8", "Modo Pista", "Escape activo", "Tablero digital"] },
    "f-150": { transmission: "Automática 10-vel", seats: 6, fuel: "Gasolina", features: ["Capacidad de carga", "4x4", "Pro Power Onboard"] },
    "explorer": { transmission: "Automática", seats: 7, fuel: "Gasolina", features: ["Tres filas", "Sistema de entretenimiento", "AWD"] },
    "transit": { transmission: "Automática", seats: 12, fuel: "Diesel", features: ["Techo alto", "Configurable", "Asistencias de manejo"] },

    // EXOTICS & SPORTS
    "ferrari": { transmission: "Doble Embrague F1", seats: 2, fuel: "Gasolina Premium", features: ["Motor V8/V12", "Aerodinámica activa", "Frenos Carbono-Cerámicos"] },
    "lamborghini": { transmission: "ISR 7-vel", seats: 2, fuel: "Gasolina Premium", features: ["Motor V10/V12", "Tracción total", "Diseño extremo"] },
    "porsche": { transmission: "PDK", seats: 2, fuel: "Gasolina Premium", features: ["Motor Boxer", "Launch Control", "Manejo preciso"] },
    "corvette": { transmission: "Doble Embrague", seats: 2, fuel: "Gasolina Premium", features: ["Motor Central", "Techo removible", "Performance Data Recorder"] },
    "mx-5": { transmission: "Manual 6-vel", seats: 2, fuel: "Gasolina", features: ["Convertible", "Ligero", "Divertido", "Bose Headrest Speakers"] },
    "miata": { transmission: "Manual 6-vel", seats: 2, fuel: "Gasolina", features: ["Convertible", "Ligero", "Divertido"] },

    // OTHERS
    "moto": { transmission: "Manual", seats: 2, fuel: "Gasolina", features: ["Casco incluido", "Agile", "Económica"] },
    "bus": { transmission: "Automática", seats: 40, fuel: "Diesel", features: ["Baño", "TV", "Reclinables"] },
    "van": { transmission: "Automática", seats: 10, fuel: "Gasolina", features: ["Puertas corredizas", "Espacio familiar", "DVD"] },

    // GENERIC FALLBACKS
    "suv": { transmission: "Automática", seats: 5, fuel: "Gasolina", features: ["Altura libre", "Cajuela amplia", "Rieles de techo"] },
    "sedan": { transmission: "Automática", seats: 5, fuel: "Gasolina", features: ["Confort", "Cajuela espaciosa", "Eficiente"] },
    "truck": { transmission: "Automática", seats: 3, fuel: "Diesel", features: ["4x4", "Tirón de remolque", "Caja bedliner"] }
};

// Mock details generator
function generateMockDetails(brand: string, model: string): { transmission: string, seats: number, fuel: string, features: string[] } {
    const searchTerm = `${brand} ${model}`.toLowerCase();

    // 1. Try exact or partial match in DB
    for (const key of Object.keys(CAR_SPECS)) {
        if (searchTerm.includes(key)) {
            return CAR_SPECS[key];
        }
    }

    // 2. Smart fallbacks matched by keywords
    if (searchTerm.includes("electric") || searchTerm.includes("eléctrico")) {
        return { transmission: "Automática", seats: 5, fuel: "Eléctrico", features: ["Carga regenerativa", "Silencioso", "Eco-friendly"] };
    }
    if (searchTerm.includes("hybrid") || searchTerm.includes("híbrido")) {
        return { transmission: "CVT", seats: 5, fuel: "Híbrido", features: ["Alto rendimiento", "Modo EV", "Start/Stop"] };
    }
    if (searchTerm.includes("pickup") || searchTerm.includes("camioneta")) {
        return { transmission: "Automática", seats: 5, fuel: "Gasolina", features: ["Caja de carga", "4x4", "Uso rudo"] };
    }
    if (searchTerm.includes("coupe") || searchTerm.includes("deportivo")) {
        return { transmission: "Manual/Auto", seats: 2, fuel: "Gasolina Premium", features: ["Diseño aerodinámico", "Escape deportivo"] };
    }

    // 3. Generic default
    return {
        transmission: "Automática 6-vel",
        seats: 5,
        fuel: "Gasolina",
        features: ["Aire Acondicionado", "Bluetooth", "Vidrios eléctricos", "Bolsas de aire"]
    };
}

// Mock reviews generator
function generateMockReviews(seedName: string): { rating: number, reviews: Review[] } {
    // Deterministic-ish based on name length to keep it consistent per car
    const len = seedName.length;

    const users = ["Ana García", "Carlos Ruiz", "Maria Lopez", "Juan Perez", "Sofia Diaz", "Luis Torres"];
    const comments = [
        "Excelente estado, muy limpio.",
        "El propietario fue muy amable.",
        "Consumo de combustible muy bajo.",
        "Experiencia increíble, lo repetiré.",
        "Buen coche, pero el aire huele raro.",
        "Perfecto para viaje de fin de semana.",
        "Todo correcto, sin problemas.",
        "Potente y cómodo."
    ];

    const reviews: Review[] = [];
    let totalRating = 0;

    for (let i = 0; i < 4; i++) {
        const uIndex = (len + i) % users.length;
        const cIndex = (len * i + 3) % comments.length;
        const rVal = 3 + ((len + i) % 3); // 3, 4, or 5 stars

        totalRating += rVal;
        reviews.push({
            user: users[uIndex],
            text: comments[cIndex],
            rating: rVal
        });
    }

    return {
        rating: totalRating / 4,
        reviews
    };
}

function getReadOnlyClient() {
    return new ContractClient({
        contractId: networks.testnet.contractId,
        networkPassphrase: networks.testnet.networkPassphrase,
        rpcUrl: SOROBAN_RPC,
    });
}

export async function fetchVehicles(): Promise<Vehicle[]> {
    const client = getReadOnlyClient();

    const txList = await client.list_products();
    const rawNames = (txList.result ?? []) as string[];

    const vehicles: Vehicle[] = [];

    for (const rawName of rawNames) {
        if (!rawName.includes(SEPARATOR)) continue;

        const txProd = await client.get_product({ name: rawName });
        const data = (txProd.result ?? []) as any[];

        if (data.length < 2) continue;

        const price = Number(data[1]);

        const { brand, model, availability, description } = decodeVehicleName(rawName);
        const { rating, reviews } = generateMockReviews(rawName);
        const details = generateMockDetails(brand, model);

        vehicles.push({
            model,
            brand,
            availability,
            rate: price,
            description,
            rating,
            reviews,
            ...details
        });
    }

    // If no valid vehicles found (e.g. only legacy food exists), return MOCK cars
    if (vehicles.length === 0) {
        const mockData = [
            { brand: "Toyota", model: "Corolla 2018", availability: "Lun-Dom 08:00-20:00", rate: 7, desc: "Sedán confiable y económico para la ciudad." },
            { brand: "Tesla", model: "Model 3", availability: "Mar-Sab 09:00-18:00", rate: 18, desc: "Eléctrico de alto rendimiento con Autopilot." },
            { brand: "BMW", model: "X3 2020", availability: "Lun-Vie 07:00-22:00", rate: 22, desc: "SUV de lujo para viajes confortables." },
            // NEW REQUESTED VEHICLES
            { brand: "Ford", model: "Mustang GT", availability: "Sab-Dom 10:00-20:00", rate: 25, desc: "Muscle car americano con motor V8 para adrenalina pura." },
            { brand: "Nissan", model: "Urvan", availability: "Lun-Dom 06:00-22:00", rate: 15, desc: "Camioneta de pasajeros espaciosa para grupos grandes." },
            { brand: "Porsche", model: "911 Carrera", availability: "Vie-Dom 12:00-20:00", rate: 45, desc: "Deportivo alemán icónico, precisión y velocidad." },
        ];

        return mockData.map(m => {
            const { rating, reviews } = generateMockReviews(m.model);
            const details = generateMockDetails(m.brand, m.model);
            return {
                ...m,
                description: m.desc,
                rating,
                reviews,
                ...details
            };
        });
    }

    return vehicles;
}
