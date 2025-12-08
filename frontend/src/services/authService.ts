// src/services/authService.ts

/**
 * Simplified Authentication Service
 * Supports: Username login, Freighter wallet, and QR code (simulated)
 */

interface StoredUser {
    username: string;
    email: string;
    qrCode: string; // Simulated QR code for login
    createdAt: number;
}

interface AuthSession {
    username: string;
    loginTime: number;
    loginMethod: 'username' | 'freighter' | 'qr';
}

const USERS_KEY = "sharecar_users";
const SESSION_KEY = "sharecar_session";

// Generate a simulated QR code
function generateQRCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'QR-';
    for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Get all registered users
function getUsers(): StoredUser[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

// Save users to localStorage
function saveUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current session
function getSession(): AuthSession | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

// Save session
function saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Clear session
function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Register a new user with username and email
 */
export function registerUser(username: string, email: string): { success: boolean; qrCode?: string; error?: string } {
    if (!username || username.trim().length === 0) {
        return { success: false, error: "El nombre de usuario es requerido" };
    }

    if (!email || email.trim().length === 0) {
        return { success: false, error: "El correo electrónico es requerido" };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return { success: false, error: "Correo electrónico inválido" };
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    // Check if user already exists
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
        return { success: false, error: "Este usuario ya está registrado" };
    }

    if (users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
        return { success: false, error: "Este correo ya está registrado" };
    }

    // Generate QR code
    const qrCode = generateQRCode();

    // Save user
    const newUser: StoredUser = {
        username: trimmedUsername,
        email: trimmedEmail,
        qrCode,
        createdAt: Date.now(),
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, qrCode };
}

/**
 * Login with username only
 */
export function loginWithUsername(username: string): { success: boolean; error?: string } {
    if (!username || username.trim().length === 0) {
        return { success: false, error: "El nombre de usuario es requerido" };
    }

    const trimmedUsername = username.trim();

    // Find user
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());

    if (!user) {
        return { success: false, error: "Usuario no encontrado. Por favor regístrate primero." };
    }

    // Create session
    saveSession({
        username: user.username,
        loginTime: Date.now(),
        loginMethod: 'username'
    });

    return { success: true };
}

/**
 * Login with Freighter wallet (requires existing user)
 */
export function loginWithFreighter(username: string): { success: boolean; error?: string } {
    if (!username || username.trim().length === 0) {
        return { success: false, error: "Por favor ingresa tu nombre de usuario" };
    }

    const trimmedUsername = username.trim();

    // Find user
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());

    if (!user) {
        return { success: false, error: "Usuario no encontrado. Por favor regístrate primero." };
    }

    // Create session
    saveSession({
        username: user.username,
        loginTime: Date.now(),
        loginMethod: 'freighter'
    });

    return { success: true };
}

/**
 * Login with QR code
 */
export function loginWithQR(qrCode: string): { success: boolean; error?: string } {
    if (!qrCode || qrCode.trim().length === 0) {
        return { success: false, error: "El código QR es requerido" };
    }

    const trimmedQR = qrCode.trim();

    // Find user by QR code
    const users = getUsers();
    const user = users.find(u => u.qrCode === trimmedQR);

    if (!user) {
        return { success: false, error: "Código QR inválido" };
    }

    // Create session
    saveSession({
        username: user.username,
        loginTime: Date.now(),
        loginMethod: 'qr'
    });

    return { success: true };
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): string | null {
    const session = getSession();
    return session ? session.username : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}

/**
 * Logout current user
 */
export function logout(): void {
    clearSession();
}

/**
 * Get all registered usernames (for debugging/admin)
 */
export function getRegisteredUsernames(): string[] {
    return getUsers().map(u => u.username);
}

/**
 * Check if username exists
 */
export function userExists(username: string): boolean {
    const users = getUsers();
    return users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
}
